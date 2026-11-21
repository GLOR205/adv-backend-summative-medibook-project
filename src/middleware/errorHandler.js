module.exports = (err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({ error: err.message, ...err.extra });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate value (e.g. email already exists)' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ error: 'Cannot delete: record is referenced by appointments' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};