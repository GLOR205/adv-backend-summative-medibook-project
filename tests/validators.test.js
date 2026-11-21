const { validateSlot } = require('../src/utils/validators');
const now = new Date(2026, 10, 21, 8, 0); // fixed "now"

test('valid slot passes', () => expect(validateSlot('2026-12-10 09:30', now).valid).toBe(true));
test('09:15 rejected (not on 30-min boundary)', () => expect(validateSlot('2026-12-10 09:15', now).valid).toBe(false));
test('17:00 exactly rejected', () => expect(validateSlot('2026-12-10 17:00', now).valid).toBe(false));
test('past date rejected', () => expect(validateSlot('2026-11-01 10:00', now).valid).toBe(false));
test('malformed date rejected with 400', () => expect(validateSlot('tomorrow', now).status).toBe(400));
test('impossible date 2026-02-31 rejected', () => expect(validateSlot('2026-02-31 10:00', now).valid).toBe(false));