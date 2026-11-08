const test = require('node:test'); const assert = require('node:assert');
const f = require('../src/fees');
const inst = [{ id: 1, due: '2026-10-10', amount: 3000000 }, { id: 2, due: '2027-01-10', amount: 3000000 }];

test('payments allocate oldest-first; part paid shows overdue days', () => {
  const l = f.ledger(inst, [{ amount: 1500000 }], '2026-11-02');
  assert.equal(l[0].balance, 1500000); assert.equal(l[0].daysOverdue, 23); assert.equal(l[0].status, 'overdue');
  assert.equal(l[1].status, 'due');
});
test('overpayment spills to next instalment', () => {
  const l = f.ledger(inst, [{ amount: 4000000 }], '2026-11-02');
  assert.equal(l[0].status, 'paid'); assert.equal(l[1].paid, 1000000);
});
test('reminders stop once paid', () => {
  const due = f.ledger(inst, [], '2026-10-07')[0];
  assert.deepEqual(f.remindersDue(due, '2026-10-07'), [-3]);
  const paid = f.ledger(inst, [{ amount: 3000000 }], '2026-10-07')[0];
  assert.deepEqual(f.remindersDue(paid, '2026-10-07'), []);
});
test('refund is pro-rata, minus capped admin fee, payable within 10 days', () => {
  const r = f.refund({ totalFee: 12000000, paid: 9000000, startDate: '2026-04-01', endDate: '2027-03-31', leaveDate: '2026-10-01' });
  assert.equal(r.adminFee, 500000);
  assert.equal(r.amount, 9000000 - r.consumed - 500000); assert.ok(r.amount > 0);
  assert.equal(r.payBy, '2026-10-11');
});
test('refund is clamped: never negative, never above paid', () => {
  const late = f.refund({ totalFee: 12000000, paid: 3000000, startDate: '2026-04-01', endDate: '2027-03-31', leaveDate: '2027-02-01' });
  assert.equal(late.amount, 0);
  const early = f.refund({ totalFee: 12000000, paid: 3000000, startDate: '2026-04-01', endDate: '2027-03-31', leaveDate: '2026-03-01' });
  assert.equal(early.amount, 2500000);
});
test('GST split sums back exactly', () => { const g = f.gstSplit(3000000); assert.equal(g.base + g.gst, 3000000); });
test('dropout flag is explainable and needs several signals', () => {
  const r = f.dropoutRisk({ overdueInstalments: 1, daysOverdueMax: 40, attendance: [90, 88, 70, 60], tests: [80, 70, 55] });
  assert.ok(r.flag); assert.ok(r.reasons.length >= 3);
  assert.equal(f.dropoutRisk({ overdueInstalments: 0, daysOverdueMax: 0, attendance: [90, 90, 90, 90], tests: [70, 72, 71] }).flag, false);
});
