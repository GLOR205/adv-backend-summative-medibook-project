const { pool } = require('../config/db');

exports.findAll = async () => (await pool.query('SELECT * FROM patients')) [0];
exports.findById = async (id, conn = pool) =>
  (await conn.query('SELECT * FROM patients WHERE id = ?', [id]))[0][0];
exports.create = async ({ full_name, email, phone }) => {
  const [r] = await pool.query(
    'INSERT INTO patients (full_name, email, phone) VALUES (?, ?, ?)', [full_name, email, phone]);
  return r.insertId;
};
exports.update = async (id, { full_name, email, phone }) => {
  const [r] = await pool.query(
    'UPDATE patients SET full_name = ?, email = ?, phone = ? WHERE id = ?', [full_name, email, phone, id]);
  return r.affectedRows;
};
exports.remove = async (id) => (await pool.query('DELETE FROM patients WHERE id = ?', [id]))[0].affectedRows;