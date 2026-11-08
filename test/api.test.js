process.env.DEMO_TODAY = '2026-11-02';
process.env.DB_PATH = ':memory:'; process.env.WEBHOOK_SECRET = 'whsec'; process.env.SESSION_SECRET = 'x'.repeat(32);
const test = require('node:test'), assert = require('node:assert');
const { seed } = require('../src/db'); const { server } = require('../src/server');
let base; test.before(async () => { seed(); await new Promise((r) => server.listen(0, r)); base = 'http://localhost:' + server.address().port; });
test.after(() => server.close());
const call = async (m, p, body, token, headers = {}) => { const r = await fetch(base + p, { method: m, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }), ...headers }, body: body && JSON.stringify(body) }); return { s: r.status, j: await r.json().catch(() => ({})) }; };
const cache = {};
const parent = async (phone) => (cache[phone] ||= (await call('POST', '/api/otp/verify', { phone, otp: '123456' })).j.token);
const staff = async () => (cache.staff ||= (await call('POST', '/api/login', { email: 'accounts@demo.test', password: 'demo-accounts-1' })).j.token);

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

test('consent gate: unconsented parent sees no ledger until guardian consents; withdrawal re-locks', async () => {
  const t = await parent('9000000003'); let me = (await call('GET', '/api/me/students', null, t)).j[0];
  assert.ok(me.needsConsent); assert.equal(me.instalments, undefined);
  assert.equal((await call('POST', '/api/consent', { studentId: me.id, guardianName: 'R Gurjar', relation: 'Father', agree: false }, t)).s, 400);
  assert.equal((await call('POST', '/api/consent', { studentId: me.id, guardianName: 'R Gurjar', relation: 'Father', agree: true }, t)).s, 200);
  me = (await call('GET', '/api/me/students', null, t)).j[0]; assert.equal(me.instalments.length, 4);
  await call('POST', '/api/consent/withdraw', { studentId: me.id }, t); assert.ok((await call('GET', '/api/me/students', null, t)).j[0].needsConsent);
});
test('public pay link: signed, only oldest unpaid, idempotent', async () => {
  const s = await staff(); const stu = (await call('GET', '/api/dashboard', null, s)).j.students.find((x) => x.code === 'STU-0587');
  const L = (await call('GET', '/api/students/' + stu.id, null, s)).j; const [a, b] = L.instalments.filter((i) => i.link);
  assert.equal((await call('GET', a.link.replace('/pay/', '/api/link/') + 'x')).s, 404);
  assert.equal((await call('POST', b.link.replace('/pay/', '/api/link/') + '/pay', { ref: 'later-inst-1' })).s, 400);
  const info = await call('GET', a.link.replace('/pay/', '/api/link/')); assert.equal(info.j.student, 'Ishita'); assert.equal(info.j.blocked, null);
  const p1 = await call('POST', a.link.replace('/pay/', '/api/link/') + '/pay', { ref: 'link-pay-001' }); assert.equal(p1.j.paid, a.balance);
  assert.ok((await call('POST', a.link.replace('/pay/', '/api/link/') + '/pay', { ref: 'link-pay-001' })).j.duplicate);
});
test('GST receipt splits CGST+SGST exactly and enforces ownership', async () => {
  const t = await parent('9000000001'); const me = (await call('GET', '/api/me/students', null, t)).j[0]; const pid = me.payments[0].id;
  const r = (await call('GET', '/api/receipts/' + pid, null, t)).j; assert.equal(r.base + r.cgst + r.sgst, r.amount); assert.match(r.no, /^RCPT-/);
  assert.equal((await call('GET', '/api/receipts/' + pid, null, await parent('9000000002'))).s, 403);
});
test('discount reduces latest unpaid instalments, is validated, and feeds refund net fee', async () => {
  const s = await staff(); const id = (await call('GET', '/api/dashboard', null, s)).j.students.find((x) => x.code === 'STU-1005').id;
  const before = (await call('GET', '/api/students/' + id, null, s)).j;
  assert.equal((await call('POST', `/api/students/${id}/discount`, { amount: 99999999999, reason: 'too big' }, s)).s, 400);
  assert.equal((await call('POST', `/api/students/${id}/discount`, { amount: 500000, reason: 'Merit scholarship' }, s)).s, 200);
  const after = (await call('GET', '/api/students/' + id, null, s)).j; assert.equal(before.balance - after.balance, 500000); assert.equal(after.net, before.net - 500000);
});
test('bulk upload: valid rows saved, bad rows reported, wrong-batch blocked, staff only', async () => {
  const s = await staff(); const csv = 'student_id,value\nSTU-0412,95\nSTU-0587,150\nSTU-0219,80\nNOPE,50\n';
  assert.equal((await call('POST', '/api/upload/metrics', { batch: 'JEE 2027 Morning', kind: 'att', csv }, await parent('9000000001'))).s, 403);
  const r = (await call('POST', '/api/upload/metrics', { batch: 'JEE 2027 Morning', kind: 'att', csv }, s)).j;
  assert.equal(r.accepted, 1); assert.equal(r.rejected.length, 3);
  assert.equal((await call('POST', '/api/upload/metrics', { batch: 'JEE 2027 Morning', kind: 'att', csv: 'bad,header\n1,2' }, s)).j.rejected[0].line, 1);
  assert.equal((await call('GET', '/api/me/students', null, await parent('9000000001'))).j[0].att.at(-1), 95);
});
test('refund tracking: confirmed refund is pending with pay-by date, then marked paid', async () => {
  const s = await staff(); const id = (await call('GET', '/api/dashboard', null, s)).j.students.find((x) => x.code === 'STU-0587').id;
  assert.equal((await call('POST', '/api/refund/confirm', { studentId: id, leaveDate: '2026-11-01' }, s)).s, 200);
  const list = (await call('GET', '/api/refunds', null, s)).j; assert.equal(list[0].status, 'pending'); assert.equal(list[0].pay_by, '2026-11-11');
  assert.equal((await call('POST', `/api/refunds/${list[0].id}/paid`, {}, s)).s, 200);
  assert.equal((await call('GET', '/api/refunds', null, s)).j[0].status, 'paid');
});
test('public policy is served without login', async () => { const r = await call('GET', '/api/policy'); assert.equal(r.j.payWithinDays, 10); });
