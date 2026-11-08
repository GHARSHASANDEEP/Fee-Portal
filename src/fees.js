// Pure business rules. All money is integer paise (no float drift). Dates are 'YYYY-MM-DD' strings.
const DAY = 86400000;
const d = (s) => Date.parse(s + 'T00:00:00Z');
const days = (a, b) => Math.round((d(b) - d(a)) / DAY);
const rs = (n) => Math.round(n * 100);

/** Allocate payments to instalments oldest-first. */
function ledger(instalments, payments, today) {
  let pool = payments.reduce((s, p) => s + p.amount, 0);
  return [...instalments].sort((a, b) => d(a.due) - d(b.due)).map((i) => {
    const paid = Math.min(pool, i.amount); pool -= paid;
    const balance = i.amount - paid;
    const late = days(i.due, today);
    const status = balance === 0 ? 'paid' : late > 0 ? 'overdue' : 'due';
    return { ...i, paid, balance, daysOverdue: balance > 0 && late > 0 ? late : 0, daysToDue: late <= 0 ? -late : 0, status };
  });
}

/** Reminder offsets (days relative to due date). Only while a balance remains: this is how reminders stop on payment. */
const OFFSETS = [-3, 0, 3, 7, 15];
function remindersDue(inst, today) {
  if (inst.balance <= 0) return [];
  const off = days(inst.due, today);
  return OFFSETS.filter((o) => o <= off && off - o <= 1);
}

/**
 * Refund policy (ASSUMPTION: client must confirm their written policy):
 *  consumed = totalFee x elapsed/total days; admin fee = min(5% of fee, Rs 5,000);
 *  refund = paid - consumed - adminFee, clamped to [0, paid]; payable within 10 days of leaving.
 */
function refund({ totalFee, paid, startDate, endDate, leaveDate }) {
  const total = days(startDate, endDate);
  if (total <= 0) throw new Error('invalid course dates');
  const elapsed = Math.min(Math.max(days(startDate, leaveDate), 0), total);
  const consumed = Math.round((totalFee * elapsed) / total);
  const adminFee = Math.min(Math.round(totalFee * 0.05), rs(5000));
  const amount = Math.max(0, Math.min(paid, paid - consumed - adminFee));
  const payBy = new Date(d(leaveDate) + 10 * DAY).toISOString().slice(0, 10);
  return { elapsedDays: elapsed, totalDays: total, consumed, adminFee, paid, amount, payBy };
}

/** GST inclusive in fee (ASSUMPTION: 18%). */
function gstSplit(gross, rate = 18) {
  const base = Math.round((gross * 100) / (100 + rate));
  return { base, gst: gross - base };
}

/** Explainable dropout-risk score. Only ever creates a counsellor task. */
function dropoutRisk({ overdueInstalments, daysOverdueMax, attendance, tests }) {
  const reasons = []; let s = 0;
  if (overdueInstalments > 0) { s += Math.min(40, 20 * overdueInstalments + (daysOverdueMax > 30 ? 10 : 0)); reasons.push(`${overdueInstalments} overdue instalment(s), up to ${daysOverdueMax} days`); }
  if (attendance.length >= 4) {
    const half = Math.floor(attendance.length / 2);
    const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const drop = avg(attendance.slice(0, half)) - avg(attendance.slice(half));
    if (avg(attendance.slice(half)) < 70) { s += 20; reasons.push('recent attendance below 70%'); }
    if (drop > 10) { s += 15; reasons.push(`attendance fell ${Math.round(drop)} points`); }
  }
  if (tests.length >= 3 && tests[tests.length - 1] < tests[0] * 0.8) { s += 25; reasons.push('test scores down over 20%'); }
  return { score: Math.min(100, s), flag: s >= 50, reasons };
}
module.exports = { ledger, remindersDue, refund, gstSplit, dropoutRisk, days, rs, OFFSETS };
