const { REFUND_FULL_HOURS, REFUND_HALF_HOURS } = require('../config/constants');

// Policy: > 48h => 100%. 24h to 48h INCLUSIVE (exactly 48h and exactly 24h) => 50%. < 24h => 0%.
function calculateRefund(apptDate, cancelDate, amountPaid) {
  const hoursNotice = (apptDate - cancelDate) / (1000 * 60 * 60);
  let percent = 0;
  if (hoursNotice > REFUND_FULL_HOURS) percent = 100;
  else if (hoursNotice >= REFUND_HALF_HOURS) percent = 50;
  const amount = Math.round(amountPaid * percent) / 100;
  return { percent, amount };
}
module.exports = { calculateRefund };