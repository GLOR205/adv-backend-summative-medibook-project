const { pool } = require('../config/db');
const { DAILY_CAP, BUSY_THRESHOLD, UTILIZATION_DAYS } = require('../config/constants');

// Doctors report: LEFT JOIN keeps doctors with zero appointments
exports.doctorsReport = async () => (await pool.query(
  `SELECT d.id, d.full_name, d.specialty,
          COUNT(CASE WHEN a.status = 'booked' THEN 1 END) AS total_appointments,
          COALESCE(SUM(a.amount_paid - COALESCE(a.refund_amount, 0)), 0) AS revenue
   FROM doctors d
   LEFT JOIN appointments a ON a.doctor_id = d.id
   GROUP BY d.id, d.full_name, d.specialty`))[0];

// Busy days: more than 80% of 12 => HAVING count > 9.6
exports.busyDays = async () => (await pool.query(
  `SELECT d.id AS doctor_id, d.full_name, DATE(a.appt_datetime) AS day,
          COUNT(*) AS booked, ROUND(COUNT(*) / ? * 100, 1) AS utilization_pct
   FROM appointments a JOIN doctors d ON d.id = a.doctor_id
   WHERE a.status = 'booked'
   GROUP BY d.id, d.full_name, DATE(a.appt_datetime)
   HAVING COUNT(*) > ?`, [DAILY_CAP, DAILY_CAP * BUSY_THRESHOLD]))[0];

// Doctor stats
exports.doctorStats = async (doctorId) => {
  const [[summary]] = await pool.query(
    `SELECT COALESCE(SUM(amount_paid - COALESCE(refund_amount, 0)), 0) AS revenue,
            COUNT(CASE WHEN status = 'booked' AND appt_datetime > NOW() THEN 1 END) AS upcoming_count
     FROM appointments WHERE doctor_id = ?`, [doctorId]);

  const [perDay] = await pool.query(
    `SELECT DATE(appt_datetime) AS day, COUNT(*) AS appointments
     FROM appointments
     WHERE doctor_id = ? AND status = 'booked'
       AND appt_datetime >= CURDATE() AND appt_datetime < DATE_ADD(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(appt_datetime) ORDER BY day`, [doctorId, UTILIZATION_DAYS]);

  const [[util]] = await pool.query(
    `SELECT ROUND(COUNT(*) / (? * ?) * 100, 1) AS utilization_pct
     FROM appointments
     WHERE doctor_id = ? AND status = 'booked'
       AND appt_datetime >= CURDATE() AND appt_datetime < DATE_ADD(CURDATE(), INTERVAL ? DAY)`,
    [DAILY_CAP, UTILIZATION_DAYS, doctorId, UTILIZATION_DAYS]);

  return { ...summary, appointments_next_7_days: perDay, utilization_pct: util.utilization_pct };
};