const AppError = require('../utils/AppError');
const { bookAppointment, joinWaitlist } = require('../services/bookingService');
const { cancelAppointment } = require('../services/cancellationService');

exports.book = async (req, res, next) => {
  try {
    const { patientId, doctorId, apptDatetime } = req.body || {};
    if (!patientId || !doctorId || !apptDatetime) throw new AppError(400, 'patientId, doctorId and apptDatetime are required');
    res.status(201).json(await bookAppointment({ patientId, doctorId, apptDatetime }));
  } catch (e) { next(e); }
};
exports.cancel = async (req, res, next) => {
  try { res.json(await cancelAppointment(req.params.id)); } catch (e) { next(e); }
};
exports.joinWaitlist = async (req, res, next) => {
  try {
    const { patientId, doctorId, apptDatetime } = req.body || {};
    if (!patientId || !doctorId || !apptDatetime) throw new AppError(400, 'patientId, doctorId and apptDatetime are required');
    res.status(201).json(await joinWaitlist({ patientId, doctorId, apptDatetime }));
  } catch (e) { next(e); }
};