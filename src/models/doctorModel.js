exports.lockById = async (conn, id) =>
  (await conn.query('SELECT id, consultation_fee FROM doctors WHERE id = ? FOR UPDATE', [id]))[0][0];