const { withTransaction } = require('../config/db');
const AppError = require('../utils/AppError');
const { calculateRefund } = require('../utils/refund');
const { audit } = require('../utils/auditLogger');
const { enqueueJob } = require('../utils/queue');
const appointmentModel = require('../models/appointmentModel');

const pad = (n) => String(n).padStart(2, '0');
const toSlotString = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

async function cancelAppointment(id) {
  const result = await withTransaction(async (conn) => {
    const appt = await appointmentModel.findByIdForUpdate(conn, id);
    if (!appt) throw new AppError(404, 'Appointment not found');
    if (appt.status === 'cancelled') throw new AppError(409, 'Appointment already cancelled');

    const now = new Date();
    const apptDate = new Date(appt.appt_datetime);
    if (apptDate <= now) throw new AppError(422, 'Cannot cancel a past appointment');

    const { percent, amount } = calculateRefund(apptDate, now, Number(appt.amount_paid));
    await appointmentModel.markCancelled(conn, id, amount); // cancel + refund = one transaction
    return { appt, apptDate, percent, amount };
  });

  const { appt, apptDate, percent, amount } = result;
  audit('cancellation', { appointmentId: appt.id, refundPercent: percent, refundAmount: amount });
  await enqueueJob({
    type: 'slot_freed',
    doctorId: appt.doctor_id,
    apptDatetime: toSlotString(apptDate),
  });

  return { message: 'Appointment cancelled', appointmentId: appt.id, refundPercent: percent, refundAmount: amount };
}

module.exports = { cancelAppointment };