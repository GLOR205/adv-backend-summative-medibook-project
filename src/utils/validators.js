const { OPEN_HOUR, CLOSE_HOUR, SLOT_MINUTES } = require('../config/constants');

// Expected format: "YYYY-MM-DD HH:mm"
function validateSlot(input, now = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(input || '');
  if (!match) return { valid: false, status: 400, message: 'Date must be in format YYYY-MM-DD HH:mm' };

  const [, y, mo, d, h, mi] = match.map(Number);
  const date = new Date(y, mo - 1, d, h, mi);
  // Catches impossible dates like 2026-02-31 (JS would roll them over)
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) {
    return { valid: false, status: 400, message: 'Date does not exist' };
  }
  if (date <= now) return { valid: false, status: 422, message: 'Appointment must be in the future' };
  if (mi % SLOT_MINUTES !== 0) return { valid: false, status: 422, message: 'Appointments must start on a 30-minute boundary' };
  if (h < OPEN_HOUR || h >= CLOSE_HOUR) return { valid: false, status: 422, message: 'Appointments must be between 09:00 and 17:00 (last slot 16:30)' };

  return { valid: true, date };
}

module.exports = { validateSlot };