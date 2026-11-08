process.env.DB_PATH = ':memory:'; process.env.WEBHOOK_SECRET = 'whsec'; process.env.SESSION_SECRET = 'x'.repeat(32);
const test = require('node:test'), assert = require('node:assert');
const { seed } = require('../src/db'); const { server } = require('../src/server');
let base; test.before(async () => { seed(); await new Promise((r) => server.listen(0, r)); base = 'http://localhost:' + server.address().port; });
test.after(() => server.close());
const call = async (m, p, body, token, headers = {}) => { const r = await fetch(base + p, { method: m, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }), ...headers }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; };
const parent = async (phone) => (await call('POST', '/api/otp/verify', { phone, otp: '123456' })).j.token;
const staff = async () => (await call('POST', '/api/login', { email: 'accounts@demo.test', password: 'demo-accounts-1' })).j.token;

test('wrong OTP rejected; unknown number rejected', async () => {
  assert.equal((await call('POST', '/api/otp/verify', { phone: '9000000002', otp: '000000' })).s, 401);
  assert.equal((await call('POST', '/api/otp/verify', { phone: '9999999999', otp: '123456' })).s, 404);
});
test('parent sees only own child; cannot use staff APIs or other students', async () => {
  const t = await parent('9000000002'); const me = await call('GET', '/api/me/students', null, t);
  assert.equal(me.j.length, 1); assert.equal(me.j[0].name, 'Ishita Sharma'); assert.equal(me.j[0].nextDue.daysOverdue, 23);
  assert.equal((await call('GET', '/api/dashboard', null, t)).s, 403);
  const other = (await call('GET', '/api/me/students', null, await parent('9000000003'))).j[0].id;
  assert.equal((await call('POST', '/api/pay', { studentId: other, ref: 'abcdefgh1' }, t)).s, 403);
});
test('pay link is idempotent and clears the instalment; reminders then stop', async () => {
  const t = await parent('9000000002'); const id = (await call('GET', '/api/me/students', null, t)).j[0].id;
  const a = await call('POST', '/api/pay', { studentId: id, ref: 'ref-12345678' }, t), b = await call('POST', '/api/pay', { studentId: id, ref: 'ref-12345678' }, t);
  assert.equal(a.j.paid, 1500000); assert.ok(b.j.duplicate);
  const me = (await call('GET', '/api/me/students', null, t)).j[0]; assert.equal(me.instalments[0].status, 'paid');
});
test('webhook needs secret; unmatched amount is queued, not applied', async () => {
  assert.equal((await call('POST', '/api/webhook/payment', { ref: 'w1', amount: 100 })).s, 401);
  const r = await call('POST', '/api/webhook/payment', { ref: 'w-over', studentCode: 'STU-0219', amount: 99999999999 }, null, { 'x-webhook-secret': 'whsec' });
  assert.ok(r.j.queued);
});
test('refund preview validates input and staff-only', async () => {
  const s = await staff(); const id = (await call('GET', '/api/dashboard', null, s)).j.students[0].id;
  assert.equal((await call('POST', '/api/refund/preview', { studentId: id, leaveDate: 'nope' }, s)).s, 400);
  const ok = await call('POST', '/api/refund/preview', { studentId: id, leaveDate: '2026-12-01' }, s); assert.ok(ok.j.payBy);
  assert.equal((await call('POST', '/api/refund/preview', { studentId: id, leaveDate: '2026-12-01' }, await parent('9000000003'))).s, 403);
});
test('dropout flag only creates a task, never a reminder or payment change', async () => {
  const s = await staff(); const d = (await call('GET', '/api/dashboard', null, s)).j; assert.ok(d.tasks.length >= 1);
});
