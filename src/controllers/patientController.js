const AppError = require('../utils/AppError');
const patientModel = require('../models/patientModel');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePatient(body) {
  const { full_name, email, phone } = body || {};
  if (!full_name || !email || !phone) throw new AppError(400, 'full_name, email and phone are required');
  if (!EMAIL_RE.test(email)) throw new AppError(400, 'Invalid email format');
}

exports.getAll = async (req, res, next) => {
  try { res.json(await patientModel.findAll()); } catch (e) { next(e); }
};
exports.getOne = async (req, res, next) => {
  try {
    const p = await patientModel.findById(req.params.id);
    if (!p) throw new AppError(404, 'Patient not found');
    res.json(p);
  } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try {
    validatePatient(req.body);
    const id = await patientModel.create(req.body);
    res.status(201).json(await patientModel.findById(id));
  } catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
  try {
    validatePatient(req.body);
    if (!(await patientModel.update(req.params.id, req.body))) throw new AppError(404, 'Patient not found');
    res.json(await patientModel.findById(req.params.id));
  } catch (e) { next(e); }
};
exports.remove = async (req, res, next) => {
  try {
    if (!(await patientModel.remove(req.params.id))) throw new AppError(404, 'Patient not found');
    res.status(204).send();
  } catch (e) { next(e); }
};