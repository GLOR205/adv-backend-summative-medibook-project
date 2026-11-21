const { pool } = require('../config/db');

exports.findAll = async () => (await pool.query('SELECT * FROM doctors'))[0];

exports.findById = async (id, conn = pool) =>
  (await conn.query('SELECT * FROM doctors WHERE id = ?', [id]))[0][0];

exports.create = async ({ full_name, specialty, consultation_fee, room }) => {
  const [r] = await pool.query(
    'INSERT INTO doctors (full_name, specialty, consultation_fee, room) VALUES (?, ?, ?, ?)',
    [full_name, specialty, consultation_fee, room]);
  return r.insertId;
};

exports.update = async (id, { full_name, specialty, consultation_fee, room }) => {
  const [r] = await pool.query(
    'UPDATE doctors SET full_name = ?, specialty = ?, consultation_fee = ?, room = ? WHERE id = ?',
    [full_name, specialty, consultation_fee, room, id]);
  return r.affectedRows;
};

exports.remove = async (id) =>
  (await pool.query('DELETE FROM doctors WHERE id = ?', [id]))[0].affectedRows;

// Locks this doctor's row until the transaction ends, so simultaneous bookings queue up
exports.lockById = async (conn, id) =>
  (await conn.query('SELECT id, consultation_fee FROM doctors WHERE id = ? FOR UPDATE', [id]))[0][0];