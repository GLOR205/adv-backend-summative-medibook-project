const { calculateRefund } = require('../src/utils/refund');

const appt = new Date(2026, 11, 10, 10, 0); // fixed
const hoursBefore = (h) => new Date(appt.getTime() - h * 3600 * 1000);

test('more than 48h gives 100%', () => {
  expect(calculateRefund(appt, hoursBefore(72), 150)).toEqual({ percent: 100, amount: 150 });
});
test('exactly 48h gives 50% (policy: boundary is inclusive)', () => {
  expect(calculateRefund(appt, hoursBefore(48), 150).percent).toBe(50);
});
test('between 24h and 48h gives 50%', () => {
  expect(calculateRefund(appt, hoursBefore(30), 150).amount).toBe(75);
});
test('exactly 24h gives 50%', () => {
  expect(calculateRefund(appt, hoursBefore(24), 150).percent).toBe(50);
});
test('less than 24h gives 0%', () => {
  expect(calculateRefund(appt, hoursBefore(5), 150)).toEqual({ percent: 0, amount: 0 });
});