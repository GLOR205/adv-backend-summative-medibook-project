const fs = require('fs/promises');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'audit.log');

async function audit(event, data = {}) {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    const line = JSON.stringify({ timestamp: new Date().toISOString(), event, ...data });
    await fs.appendFile(LOG_FILE, line + '\n');
  } catch (err) {
    console.error('Audit log failed:', err.message); // swallow: logging must never fail a request
  }
}
module.exports = { audit };