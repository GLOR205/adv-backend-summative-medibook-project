const AppError = require('../utils/AppError');
const doctorModel = require('../models/doctorModel');

function validateDoctor(body) {
  const { full_name, specialty, consultation_fee, room } = body || {};
  if (!full_name || !specialty || !room || consultation_fee === undefined || consultation_fee === null || consultation_fee === '') {
    throw new AppError(400, 'full_name, specialty, consultation_fee and room are required');
  }
  const fee = Number(consultation_fee);
  if (Number.isNaN(fee) || fee < 0) {
    throw new AppError(400, 'consultation_fee must be a number >= 0');
  }
}

exports.getAll = async (req, res, next) => {
  try { res.json(await doctorModel.findAll()); } catch (e) { next(e); }
};
exports.getOne = async (req, res, next) => {
  try {
    const doctor = await doctorModel.findById(req.params.id);
    if (!doctor) throw new AppError(404, 'Doctor not found');
    res.json(doctor);
  } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try {
    validateDoctor(req.body);
    const id = await doctorModel.create(req.body);
    res.status(201).json(await doctorModel.findById(id));
  } catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
  try {
    validateDoctor(req.body);
    if (!(await doctorModel.update(req.params.id, req.body))) throw new AppError(404, 'Doctor not found');
    res.json(await doctorModel.findById(req.params.id));
  } catch (e) { next(e); }
};
exports.remove = async (req, res, next) => {
  try {
    if (!(await doctorModel.remove(req.params.id))) throw new AppError(404, 'Doctor not found');
    res.status(204).send();
  } catch (e) { next(e); }
};