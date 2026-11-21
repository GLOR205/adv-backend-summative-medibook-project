const reportModel = require('../models/reportModel');
const doctorModel = require('../models/doctorModel');
const AppError = require('../utils/AppError');

exports.doctorsReport = async (req, res, next) => { try { res.json(await reportModel.doctorsReport()); } catch (e) { next(e); } };
exports.busyDays = async (req, res, next) => { try { res.json(await reportModel.busyDays()); } catch (e) { next(e); } };
exports.doctorStats = async (req, res, next) => {
  try {
    if (!(await doctorModel.findById(req.params.id))) throw new AppError(404, 'Doctor not found');
    res.json(await reportModel.doctorStats(req.params.id));
  } catch (e) { next(e); }
};