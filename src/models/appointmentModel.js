const { pool } = require('../config/db');

exports.findById = async (id, conn = pool) =>
  (await conn.query('SELECT * FROM appointments WHERE id = ?', [id]))[0][0];

exports.findByIdForUpdate = async (conn, id) =>
  (await conn.query('SELECT * FROM appointments WHERE id = ? FOR UPDATE', [id]))[0][0];

exports.countBookedForDay = async (conn, doctorId, day) =>
  (await conn.query(
    `SELECT COUNT(*) AS total FROM appointments
     WHERE doctor_id = ? AND DATE(appt_datetime) = ? AND status = 'booked'`,
    [doctorId, day]))[0][0].total;

exports.insert = async (conn, { patientId, doctorId, apptDatetime, amountPaid }) => {
  const [r] = await conn.query(
    `INSERT INTO appointments (patient_id, doctor_id, appt_datetime, amount_paid)
     VALUES (?, ?, ?, ?)`, [patientId, doctorId, apptDatetime, amountPaid]);
  return r.insertId;
};

exports.markCancelled = async (conn, id, refundAmount) =>
  conn.query(
    `UPDATE appointments SET status = 'cancelled', refund_amount = ?, cancelled_at = NOW()
     WHERE id = ?`, [refundAmount, id]);