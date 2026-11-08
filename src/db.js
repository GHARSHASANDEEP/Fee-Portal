const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const f = require('./fees');
const db = new DatabaseSync(process.env.DB_PATH || './data.db');
db.exec(`
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, role TEXT NOT NULL, name TEXT, email TEXT UNIQUE, phone TEXT, pass_hash TEXT);
CREATE TABLE IF NOT EXISTS students(id INTEGER PRIMARY KEY, code TEXT UNIQUE, name TEXT, batch TEXT, centre TEXT, parent_phone TEXT, lang TEXT DEFAULT 'hi', fee_total INTEGER, course_start TEXT, course_end TEXT, consent_at TEXT, status TEXT DEFAULT 'active', plan_name TEXT, discount INTEGER DEFAULT 0, discount_reason TEXT);
CREATE TABLE IF NOT EXISTS consents(id INTEGER PRIMARY KEY, student_id INTEGER REFERENCES students(id), guardian_name TEXT, relation TEXT, phone TEXT, version TEXT, at TEXT, withdrawn_at TEXT);
CREATE TABLE IF NOT EXISTS instalments(id INTEGER PRIMARY KEY, student_id INTEGER REFERENCES students(id), due TEXT, amount INTEGER);
CREATE TABLE IF NOT EXISTS payments(id INTEGER PRIMARY KEY, student_id INTEGER REFERENCES students(id), amount INTEGER CHECK(amount>0), ref TEXT UNIQUE, at TEXT, source TEXT);
CREATE TABLE IF NOT EXISTS unmatched(id INTEGER PRIMARY KEY, ref TEXT UNIQUE, payer TEXT, amount INTEGER, at TEXT, resolved INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS reminders(id INTEGER PRIMARY KEY, instalment_id INTEGER, off INTEGER, lang TEXT, body TEXT, at TEXT, UNIQUE(instalment_id, off));
CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY, student_id INTEGER UNIQUE, score INTEGER, reasons TEXT, status TEXT DEFAULT 'open', created TEXT);
CREATE TABLE IF NOT EXISTS metrics(student_id INTEGER, kind TEXT, idx INTEGER, val REAL);
CREATE TABLE IF NOT EXISTS refunds(id INTEGER PRIMARY KEY, student_id INTEGER, leave_date TEXT, amount INTEGER, pay_by TEXT, by_user INTEGER, at TEXT, status TEXT DEFAULT 'pending', paid_at TEXT);
`);
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const linkToken = (id) => id + '.' + crypto.createHmac('sha256', SECRET).update('pay:' + id).digest('hex').slice(0, 20);
const hash = (pw) => { const s = crypto.randomBytes(16).toString('hex'); return s + ':' + crypto.scryptSync(pw, s, 32).toString('hex'); };
const verify = (pw, h) => { const [s, k] = (h || '').split(':'); return !!k && crypto.timingSafeEqual(Buffer.from(k, 'hex'), crypto.scryptSync(pw, s, 32)); };
const today = () => process.env.DEMO_TODAY || new Date().toISOString().slice(0, 10);
const addDays = (s, n) => new Date(Date.parse(s + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);

function seed() {
  if (db.prepare('SELECT COUNT(*) c FROM students').get().c) return;
  const t = today(), pw = process.env.DEMO_STAFF_PASSWORD || 'demo-accounts-1';
  db.prepare('INSERT INTO users(role,name,email,pass_hash) VALUES(?,?,?,?)').run('accounts', 'Neha Joshi (Accounts)', 'accounts@demo.test', hash(pw));
  const ins = db.prepare('INSERT INTO students(code,name,batch,centre,parent_phone,lang,fee_total,course_start,course_end,consent_at) VALUES(?,?,?,?,?,?,?,?,?,?)');
  const inst = db.prepare('INSERT INTO instalments(student_id,due,amount) VALUES(?,?,?)');
  const pay = db.prepare('INSERT INTO payments(student_id,amount,ref,at,source) VALUES(?,?,?,?,?)');
  const met = db.prepare('INSERT INTO metrics VALUES(?,?,?,?)');
  const R = f.rs;
  const mk = (code, name, batch, centre, phone, fee, dues, paid, att, sc, o = {}) => {
    const id = Number(ins.run(code, name, batch, centre, phone, 'hi', R(fee), '2026-04-01', '2027-03-31', o.noConsent ? null : t).lastInsertRowid);
    db.prepare('UPDATE students SET plan_name=?, discount=?, discount_reason=? WHERE id=?').run(`${batch.split(' ')[0]} classroom, 4 instalments`, R(o.discount || 0), o.reason || null, id);
    if (!o.noConsent) db.prepare('INSERT INTO consents(student_id,guardian_name,relation,phone,version,at) VALUES(?,?,?,?,?,?)').run(id, 'Parent of ' + name, 'Parent', phone, 'v1', t);
    dues.forEach(([d, amt]) => inst.run(id, typeof d === 'string' ? d : addDays(t, d), R(amt)));
    if (paid) pay.run(id, R(paid), 'SEED-' + code, addDays(t, -40), 'seed');
    att.forEach((v, i) => met.run(id, 'att', i, v)); sc.forEach((v, i) => met.run(id, 'score', i, v));
  };
  // Sample-data students (dates made relative to today so statuses match the brief)
  mk('STU-0412', 'Aarav Meena', 'JEE 2027 Morning', 'Malviya Nagar', '9000000001', 120000, [['2026-10-10', 30000], ['2026-12-10', 30000], ['2027-02-10', 30000], ['2027-03-10', 30000]], 30000, [92, 90, 93, 91], [78, 82, 85]);
  mk('STU-0587', 'Ishita Sharma', 'JEE 2027 Evening', 'Vaishali Nagar', '9000000002', 120000, [['2026-10-10', 30000], ['2026-12-10', 30000], ['2027-02-10', 30000], ['2027-03-10', 30000]], 15000, [88, 80, 66, 58], [74, 66, 52]);
  mk('STU-0219', 'Mohit Gurjar', 'NEET 2027 Morning', 'Mansarovar', '9000000003', 160000, [['2026-11-15', 40000], ['2027-01-15', 40000], ['2027-02-15', 40000], ['2027-03-15', 40000]], 0, [85, 86, 84, 85], [60, 62, 61], { noConsent: true });
  // Generated students for a realistic dashboard (deterministic)
  const batches = ['JEE 2027 Morning', 'JEE 2027 Evening', 'NEET 2027 Morning', 'NEET 2027 Evening'], centres = ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'Tonk Road'];
  const names = ['Riya Singh', 'Kabir Khan', 'Anaya Gupta', 'Vihaan Joshi', 'Diya Verma', 'Arjun Rathore', 'Meera Jain', 'Yash Saini', 'Tanvi Mathur', 'Dev Choudhary', 'Kriti Bansal', 'Rohan Soni', 'Sara Qureshi', 'Naman Agarwal', 'Pooja Yadav', 'Harsh Purohit', 'Simran Kaur', 'Lakshya Sharma', 'Nidhi Meena', 'Ayaan Ali', 'Preeti Gurjar', 'Ritvik Dave', 'Kavya Nair', 'Om Shekhawat'];
  names.forEach((n, i) => {
    const late = i % 5 === 0, o = late ? -(35 + i * 4) : -((i * 7) % 60) + 15; // late students are 35-115 days overdue so every ageing bucket has data
    mk('STU-' + String(1000 + i), n, batches[i % 4], centres[i % 4], '90000' + String(10100 + i), 120000, [[o, 30000], [o + 60, 30000], [o + 120, 30000], [o + 180, i === 3 ? 20000 : 30000]], o < 0 && !late ? 30000 : 0, late ? [85, 70, 62, 55] : [88, 90, 87, 89], late ? [70, 60, 48] : [65, 68, 70], i === 3 ? { discount: 10000, reason: 'Sibling discount' } : {});
  });
  db.prepare('INSERT INTO unmatched(ref,payer,amount,at) VALUES(?,?,?,?)').run('UPI-88231', 'Unknown payer 98xxxxxx10', R(15000), t);
  runAutomation();
}

const hasConsent = (id) => !!db.prepare('SELECT 1 FROM consents WHERE student_id=? AND withdrawn_at IS NULL').get(id);
const linkPath = (i) => '/pay/' + linkToken(i.id);
const msg = (lang, s, inst, off) => {
  const amt = '₹' + (inst.balance / 100).toLocaleString('en-IN');
  const when = off < 0 ? { hi: `${-off} दिन में`, en: `in ${-off} days` } : off === 0 ? { hi: 'आज', en: 'today' } : { hi: `${off} दिन पहले`, en: `${off} days ago` };
  return lang === 'hi' ? `${s.name} की फीस ${amt} देय ${inst.due} (${when.hi}). भुगतान लिंक: ${linkPath(inst)}` : `Fee of ${amt} for ${s.name} due ${inst.due} (${when.en}). Pay: ${linkPath(inst)}`;
};
/** Daily job (also triggered by button): reminders for unpaid instalments + dropout-risk tasks. Idempotent. */
function runAutomation() {
  const t = today(); let sent = 0, tasks = 0;
  for (const s of db.prepare("SELECT * FROM students WHERE status='active'").all()) {
    const L = studentLedger(s.id, t);
    const consented = hasConsent(s.id);
    for (const i of consented ? L.instalments : []) for (const off of f.remindersDue(i, t)) {
      const r = db.prepare('INSERT OR IGNORE INTO reminders(instalment_id,off,lang,body,at) VALUES(?,?,?,?,?)').run(i.id, off, s.lang, msg(s.lang, s, i, off), t);
      sent += Number(r.changes);
    }
    const q = (k) => db.prepare('SELECT val FROM metrics WHERE student_id=? AND kind=? ORDER BY idx').all(s.id, k).map((x) => x.val);
    const od = L.instalments.filter((i) => i.status === 'overdue');
    const risk = f.dropoutRisk({ overdueInstalments: od.length, daysOverdueMax: Math.max(0, ...od.map((i) => i.daysOverdue)), attendance: q('att'), tests: q('score') });
    if (risk.flag) tasks += Number(db.prepare('INSERT OR IGNORE INTO tasks(student_id,score,reasons,created) VALUES(?,?,?,?)').run(s.id, risk.score, JSON.stringify(risk.reasons), t).changes);
  }
  return { remindersSent: sent, tasksCreated: tasks };
}
function studentLedger(id, t = today()) {
  const ins = db.prepare('SELECT * FROM instalments WHERE student_id=?').all(id);
  const pays = db.prepare('SELECT * FROM payments WHERE student_id=? ORDER BY at, id').all(id);
  const instalments = f.ledger(ins, pays, t);
  const paid = pays.reduce((s, p) => s + p.amount, 0);
  return { instalments, payments: pays.map((p) => ({ ...p, ...f.gstSplit(p.amount) })), paid, balance: instalments.reduce((s, i) => s + i.balance, 0) };
}
module.exports = { db, seed, hash, verify, today, studentLedger, runAutomation, SECRET, linkToken, hasConsent };
