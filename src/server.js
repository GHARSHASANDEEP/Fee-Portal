const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { db, seed, verify, today, studentLedger, runAutomation } = require('./db');
const f = require('./fees');
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'); // random per boot if unset
const DEMO_OTP = process.env.DEMO_OTP || '123456'; // SMS is mocked; OTP is fixed in demo mode
const WEBHOOK = process.env.WEBHOOK_SECRET || '';
const PUB = path.join(__dirname, '..', 'public');
const sign = (o) => { const p = Buffer.from(JSON.stringify({ ...o, exp: Date.now() + 8 * 3600e3 })).toString('base64url'); return p + '.' + crypto.createHmac('sha256', SECRET).update(p).digest('base64url'); };
const unsign = (t) => { try { const [p, s] = (t || '').split('.'); const ok = crypto.createHmac('sha256', SECRET).update(p).digest('base64url'); if (s.length !== ok.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(ok))) return null; const o = JSON.parse(Buffer.from(p, 'base64url')); return o.exp > Date.now() ? o : null; } catch { return null; } };
class HttpError extends Error { constructor(c, m) { super(m); this.c = c; } }
const bad = (m) => new HttpError(400, m);
const attempts = new Map(); // naive in-memory throttle: key -> {n, reset}
const throttle = (k, max = 5) => { const now = Date.now(), a = attempts.get(k); if (!a || a.reset < now) return attempts.set(k, { n: 1, reset: now + 600e3 }); if (++a.n > max) throw new HttpError(429, 'Too many attempts. Try again in 10 minutes.'); };
const isPhone = (p) => typeof p === 'string' && /^[6-9]\d{9}$/.test(p);
const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

function owns(user, studentId) {
  const s = db.prepare('SELECT * FROM students WHERE id=?').get(studentId);
  if (!s) throw new HttpError(404, 'Student not found');
  if (user.role === 'parent' && s.parent_phone !== user.phone) throw new HttpError(403, 'Not allowed');
  return s;
}
const view = (s) => { const L = studentLedger(s.id); return { id: s.id, code: s.code, name: s.name, batch: s.batch, centre: s.centre, status: s.status, ...L, att: m(s.id, 'att'), scores: m(s.id, 'score'), nextDue: L.instalments.find((i) => i.balance > 0) || null }; };
const m = (id, k) => db.prepare('SELECT val FROM metrics WHERE student_id=? AND kind=? ORDER BY idx').all(id, k).map((x) => x.val);

const routes = {
  'POST /api/otp/request': ({ body }) => { if (!isPhone(body.phone)) throw bad('Enter a valid 10-digit mobile number'); throttle('otp:' + body.phone); return { sent: true, demo: 'OTP is 123456 in demo mode' }; },
  'POST /api/otp/verify': ({ body }) => {
    if (!isPhone(body.phone)) throw bad('Invalid phone'); throttle('ver:' + body.phone);
    if (body.otp !== DEMO_OTP) throw new HttpError(401, 'Wrong OTP');
    if (!db.prepare('SELECT 1 FROM students WHERE parent_phone=?').get(body.phone)) throw new HttpError(404, 'No student is linked to this number');
    return { token: sign({ role: 'parent', phone: body.phone }), role: 'parent' };
  },
  'POST /api/login': ({ body }) => {
    throttle('login:' + String(body.email)); const u = db.prepare('SELECT * FROM users WHERE email=?').get(String(body.email || ''));
    if (!u || !verify(String(body.password || ''), u.pass_hash)) throw new HttpError(401, 'Wrong email or password');
    return { token: sign({ role: u.role, uid: u.id }), role: u.role, name: u.name };
  },
  'GET /api/me/students': ({ user }) => { need(user, 'parent'); return db.prepare('SELECT * FROM students WHERE parent_phone=?').all(user.phone).map(view); },
  // Mock gateway: pays the oldest unpaid instalment. Idempotent on client-supplied ref.
  'POST /api/pay': ({ user, body }) => {
    const s = owns(user, Number(body.studentId)); if (s.status !== 'active') throw bad('Account is closed');
    if (typeof body.ref !== 'string' || body.ref.length < 8 || body.ref.length > 64) throw bad('Missing payment reference');
    const dup = db.prepare('SELECT * FROM payments WHERE ref=?').get(body.ref); if (dup) return { ok: true, duplicate: true };
    const next = studentLedger(s.id).instalments.find((i) => i.balance > 0); if (!next) throw bad('Nothing is due');
    db.prepare('INSERT INTO payments(student_id,amount,ref,at,source) VALUES(?,?,?,?,?)').run(s.id, next.balance, body.ref, today(), 'payment-link');
    return { ok: true, paid: next.balance };
  },
  // Gateway callback. Anything that cannot be matched with certainty goes to the accounts queue, never auto-marked paid.
  'POST /api/webhook/payment': ({ body, headers }) => {
    if (!WEBHOOK || headers['x-webhook-secret'] !== WEBHOOK) throw new HttpError(401, 'Bad signature');
    const amount = Number(body.amount), ref = String(body.ref || '');
    if (!Number.isInteger(amount) || amount <= 0 || !ref) throw bad('Invalid payload');
    const s = db.prepare('SELECT * FROM students WHERE code=?').get(String(body.studentCode || ''));
    if (db.prepare('SELECT 1 FROM payments WHERE ref=?').get(ref) || db.prepare('SELECT 1 FROM unmatched WHERE ref=?').get(ref)) return { ok: true, duplicate: true };
    const exact = s && studentLedger(s.id).balance >= amount;
    if (!exact) { db.prepare('INSERT INTO unmatched(ref,payer,amount,at) VALUES(?,?,?,?)').run(ref, String(body.payer || ''), amount, today()); return { ok: true, queued: true }; }
    db.prepare('INSERT INTO payments(student_id,amount,ref,at,source) VALUES(?,?,?,?,?)').run(s.id, amount, ref, today(), 'webhook'); return { ok: true };
  },
  'GET /api/dashboard': ({ user }) => {
    need(user, 'accounts'); const rows = [];
    for (const s of db.prepare("SELECT * FROM students WHERE status='active'").all()) { const L = studentLedger(s.id); const b = [0, 0, 0, 0]; let due = 0;
      for (const i of L.instalments) { if (!i.balance) continue; due += i.balance; if (i.daysOverdue > 0) b[i.daysOverdue <= 30 ? 0 : i.daysOverdue <= 60 ? 1 : 2] += i.balance; else b[3] += i.balance; }
      rows.push({ id: s.id, code: s.code, name: s.name, batch: s.batch, centre: s.centre, due, b, maxOverdue: Math.max(0, ...L.instalments.map((i) => i.daysOverdue)) }); }
    const group = (k) => Object.values(rows.reduce((a, r) => { const g = (a[r[k]] ||= { name: r[k], due: 0, b: [0, 0, 0, 0], n: 0 }); g.due += r.due; g.n++; r.b.forEach((v, i) => (g.b[i] += v)); return a; }, {}));
    return { totals: { due: rows.reduce((s, r) => s + r.due, 0), over60: rows.reduce((s, r) => s + r.b[2], 0) }, byCentre: group('centre'), byBatch: group('batch'), students: rows.sort((a, b) => b.maxOverdue - a.maxOverdue),
      tasks: db.prepare("SELECT t.*, s.name, s.code FROM tasks t JOIN students s ON s.id=t.student_id WHERE t.status='open' ORDER BY score DESC").all().map((t) => ({ ...t, reasons: JSON.parse(t.reasons) })),
      unmatched: db.prepare('SELECT * FROM unmatched WHERE resolved=0').all(), reminders: db.prepare('SELECT r.*, s.name FROM reminders r JOIN instalments i ON i.id=r.instalment_id JOIN students s ON s.id=i.student_id ORDER BY r.id DESC LIMIT 15').all() };
  },
  'GET /api/students/:id': ({ user, params }) => { need(user, 'accounts'); return view(owns(user, Number(params.id))); },
  'POST /api/automation/run': ({ user }) => { need(user, 'accounts'); return runAutomation(); },
  'POST /api/tasks/:id': ({ user, params, body }) => { need(user, 'accounts'); if (!['done', 'false_flag'].includes(body.status)) throw bad('Invalid status'); db.prepare('UPDATE tasks SET status=? WHERE id=?').run(body.status, Number(params.id)); return { ok: true }; },
  'POST /api/unmatched/:id/assign': ({ user, params, body }) => {
    need(user, 'accounts'); const u = db.prepare('SELECT * FROM unmatched WHERE id=? AND resolved=0').get(Number(params.id)); const s = db.prepare('SELECT * FROM students WHERE id=?').get(Number(body.studentId));
    if (!u || !s) throw new HttpError(404, 'Not found'); db.prepare('INSERT INTO payments(student_id,amount,ref,at,source) VALUES(?,?,?,?,?)').run(s.id, u.amount, u.ref, today(), 'manual-match'); db.prepare('UPDATE unmatched SET resolved=1 WHERE id=?').run(u.id); return { ok: true };
  },
  'POST /api/refund/preview': ({ user, body }) => refundFor(user, body),
  'POST /api/refund/confirm': ({ user, body }) => { const { s, r } = refundFor(user, body, true); db.prepare('INSERT INTO refunds(student_id,leave_date,amount,pay_by,by_user,at) VALUES(?,?,?,?,?,?)').run(s.id, body.leaveDate, r.amount, r.payBy, user.uid, today()); db.prepare("UPDATE students SET status='left' WHERE id=?").run(s.id); return r; },
  'GET /api/export/tally.csv': ({ user }) => { need(user, 'accounts'); const rows = db.prepare('SELECT p.at,s.code,s.name,p.amount,p.ref FROM payments p JOIN students s ON s.id=p.student_id ORDER BY p.at').all();
    return { csv: 'Date,Voucher Type,Ledger,Amount (INR),Ref,GST Base,GST 18%\n' + rows.map((r) => { const g = f.gstSplit(r.amount); return [r.at, 'Receipt', `${r.name} (${r.code})`, (r.amount / 100).toFixed(2), r.ref, (g.base / 100).toFixed(2), (g.gst / 100).toFixed(2)].join(','); }).join('\n') }; },
};
function refundFor(user, body, confirm) {
  need(user, 'accounts'); const s = owns(user, Number(body.studentId)); if (!isDate(body.leaveDate)) throw bad('Enter a valid leaving date');
  if (confirm && s.status !== 'active') throw bad('Already closed');
  return confirm ? { s, r: f.refund({ totalFee: s.fee_total, paid: studentLedger(s.id).paid, startDate: s.course_start, endDate: s.course_end, leaveDate: body.leaveDate }) }
    : f.refund({ totalFee: s.fee_total, paid: studentLedger(s.id).paid, startDate: s.course_start, endDate: s.course_end, leaveDate: body.leaveDate });
}
function need(user, role) { if (!user) throw new HttpError(401, 'Please sign in'); if (user.role !== role) throw new HttpError(403, 'Not allowed'); }
const compiled = Object.entries(routes).map(([k, h]) => { const [method, p] = k.split(' '); return { method, re: new RegExp('^' + p.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), h }; });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'DENY'); res.setHeader('Referrer-Policy', 'no-referrer'); res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'");
  const json = (c, o) => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
  if (url.pathname === '/healthz') return json(200, { ok: true });
  if (url.pathname.startsWith('/api/')) {
    try {
      const hit = compiled.find((r) => r.method === req.method && r.re.test(url.pathname)); if (!hit) return json(404, { error: 'Not found' });
      let raw = ''; for await (const c of req) { raw += c; if (raw.length > 1e5) throw new HttpError(413, 'Too large'); }
      let body = {}; if (raw) { try { body = JSON.parse(raw); } catch { throw bad('Invalid JSON'); } }
      const user = unsign((req.headers.authorization || '').replace('Bearer ', ''));
      const out = hit.h({ user, body, params: hit.re.exec(url.pathname).groups, headers: req.headers });
      if (out && out.csv) { res.writeHead(200, { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=tally-export.csv' }); return res.end(out.csv); }
      return json(200, out);
    } catch (e) { if (!(e instanceof HttpError)) console.error(e); return json(e.c || 500, { error: e.c ? e.message : 'Something went wrong' }); }
  }
  let p = path.normalize(path.join(PUB, url.pathname === '/' ? 'index.html' : url.pathname));
  if (!p.startsWith(PUB) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(PUB, 'index.html');
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
if (require.main === module) { seed(); server.listen(process.env.PORT || 3000, () => console.log('Listening on', process.env.PORT || 3000)); }
module.exports = { server, routes };
