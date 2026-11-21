const { withTransaction } = require('../config/db');
const { DAILY_CAP } = require('../config/constants');
const AppError = require('../utils/AppError');
const { validateSlot } = require('../utils/validators');
const { audit } = require('../utils/auditLogger');
const { enqueueJob } = require('../utils/queue');
const patientModel = require('../models/patientModel');
const doctorModel = require('../models/doctorModel');
const appointmentModel = require('../models/appointmentModel');

async function bookAppointment({ patientId, doctorId, apptDatetime }) {
  const check = validateSlot(apptDatetime);
  if (!check.valid) throw new AppError(check.status, check.message);

  if (!(await patientModel.findById(patientId))) throw new AppError(404, 'Patient not found');
  if (!(await doctorModel.findById(doctorId))) throw new AppError(404, 'Doctor not found');

  const day = apptDatetime.slice(0, 10);

  const appointment = await withTransaction(async (conn) => {
    const doctor = await doctorModel.lockById(conn, doctorId); // serialize bookings per doctor

    const booked = await appointmentModel.countBookedForDay(conn, doctorId, day);
    if (booked >= DAILY_CAP) {
      throw new AppError(409, 'Doctor is fully booked on that day', { waitlistAvailable: true });
    }

    let id;
    try {
      id = await appointmentModel.insert(conn, {
        patientId, doctorId, apptDatetime, amountPaid: doctor.consultation_fee,
      });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new AppError(409, 'That slot is already booked', { waitlistAvailable: true });
      }
      throw err;
    }
    return appointmentModel.findById(id, conn);
  });

  audit('booking', { appointmentId: appointment.id, patientId, doctorId, apptDatetime });
  await enqueueJob({ type: 'confirmation', appointmentId: appointment.id });
  return appointment;
}

module.exports = { bookAppointment, joinWaitlist };
const { redis } = require('../config/redis');
const { waitlistKey } = require('../utils/queue');

async function joinWaitlist({ patientId, doctorId, apptDatetime }) {
  const check = validateSlot(apptDatetime);
  if (!check.valid) throw new AppError(check.status, check.message);
  if (!(await patientModel.findById(patientId))) throw new AppError(404, 'Patient not found');
  if (!(await doctorModel.findById(doctorId))) throw new AppError(404, 'Doctor not found');

  const key = waitlistKey(doctorId, apptDatetime.slice(0, 10));
  const position = await redis.rpush(key, JSON.stringify({ patientId, apptDatetime }));
  return { message: 'Added to waitlist', position };
}
