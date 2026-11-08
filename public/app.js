const T = { hi: {
  title: 'फीस पोर्टल', parent: 'अभिभावक', staff: 'स्टाफ', phone: 'मोबाइल नंबर', getotp: 'OTP भेजें', otp: 'OTP', login: 'लॉगिन', email: 'ईमेल', pw: 'पासवर्ड', out: 'लॉगआउट',
  owe: 'देय राशि', due: 'अंतिम तिथि', pay: 'अभी भुगतान करें', allpaid: 'सब कुछ चुकता है 🎉', overdue: (n) => `${n} दिन देरी`, indays: (n) => `${n} दिन में`, inst: 'किस्तें', rec: 'रसीदें', att: 'उपस्थिति', sc: 'टेस्ट स्कोर',
  gst: 'GST शामिल', testmode: 'टेस्ट मोड — असली पैसा नहीं कटेगा', confirm: 'भुगतान की पुष्टि करें', cancel: 'रद्द करें', paidok: 'भुगतान सफल। रसीद नीचे है।', loading: 'लोड हो रहा है…', none: 'अभी कुछ नहीं है',
  dash: 'बकाया', queue: 'कार्य और कतार', refund: 'रिफंड', rem: 'रिमाइंडर', total: 'कुल बकाया', o60: '60+ दिन देरी', centre: 'सेंटर', batch: 'बैच', student: 'छात्र', run: 'ऑटोमेशन चलाएँ',
  tally: 'Tally एक्सपोर्ट', counsel: 'काउंसलर कॉल', done: 'पूर्ण', falsef: 'गलत फ्लैग', unm: 'बिना मिलान वाले भुगतान', assign: 'छात्र से जोड़ें', leave: 'छोड़ने की तारीख', calc: 'गणना करें', confirmRefund: 'रिफंड पक्का करें',
  consumed: 'उपयोग की गई फीस', admin: 'प्रशासनिक शुल्क (नॉन-रिफंडेबल)', refundAmt: 'रिफंड राशि', payby: 'इस तारीख तक भुगतान', paidSoFar: 'अब तक जमा', pick: 'छात्र चुनें', closed: 'खाता बंद', risk: 'जोखिम स्कोर', err: 'कुछ गलत हुआ। दोबारा कोशिश करें।' },
 en: { title: 'Fee portal', parent: 'Parent', staff: 'Staff', phone: 'Mobile number', getotp: 'Send OTP', otp: 'OTP', login: 'Sign in', email: 'Email', pw: 'Password', out: 'Sign out',
  owe: 'Amount due', due: 'Due date', pay: 'Pay now', allpaid: 'All paid up 🎉', overdue: (n) => `${n} days overdue`, indays: (n) => `in ${n} days`, inst: 'Instalments', rec: 'Receipts', att: 'Attendance', sc: 'Test scores',
  gst: 'GST included', testmode: 'Test mode: no real money is charged', confirm: 'Confirm payment', cancel: 'Cancel', paidok: 'Payment successful. Your receipt is below.', loading: 'Loading…', none: 'Nothing here yet',
  dash: 'Dues', queue: 'Tasks & queue', refund: 'Refund', rem: 'Reminders', total: 'Total outstanding', o60: 'Over 60 days late', centre: 'Centre', batch: 'Batch', student: 'Student', run: 'Run automation',
  tally: 'Tally export', counsel: 'Counsellor calls', done: 'Done', falsef: 'False flag', unm: 'Unmatched payments', assign: 'Assign to student', leave: 'Leaving date', calc: 'Calculate', confirmRefund: 'Confirm refund',
  consumed: 'Fee consumed', admin: 'Admin fee (non-refundable)', refundAmt: 'Refund amount', payby: 'Pay refund by', paidSoFar: 'Paid so far', pick: 'Choose student', closed: 'Account closed', risk: 'Risk score', err: 'Something went wrong. Please try again.' } };
let lang = localStorage.getItem('lang') || 'hi', session = JSON.parse(sessionStorage.getItem('s') || 'null'), tab = 'dash';
const t = () => T[lang], $ = (s) => document.querySelector(s), app = $('#app');
const inr = (p) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const h = (tag, props = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(props)) k.startsWith('on') ? e.addEventListener(k.slice(2), v) : k === 'class' ? (e.className = v) : v !== false && e.setAttribute(k, v === true ? '' : v); kids.flat().forEach((c) => e.append(c?.nodeType ? c : document.createTextNode(c ?? ''))); return e; };
async function api(method, path, body) {
  const r = await fetch(path, { method, headers: { 'Content-Type': 'application/json', ...(session && { Authorization: 'Bearer ' + session.token }) }, body: body && JSON.stringify(body) });
  if (r.status === 401 && session) { logout(); throw new Error('Session expired'); }
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || t().err); return j;
}
const logout = () => { session = null; sessionStorage.removeItem('s'); render(); };
const status = (i) => h('span', { class: 'pill ' + i.status }, i.status === 'paid' ? '✓' : i.status === 'overdue' ? t().overdue(i.daysOverdue) : t().indays(i.daysToDue));
const busy = (b, fn) => async () => { b.disabled = true; try { await fn(); } finally { b.disabled = false; } };
const loading = () => app.replaceChildren(h('div', { class: 'load' }, t().loading));
const fail = (e) => app.replaceChildren(h('p', { class: 'err', role: 'alert' }, e.message), h('button', { class: 'sec', onclick: render }, '↻'));
function sheet(...kids) { const m = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'sheet' }, kids)); document.body.append(m); return () => m.remove(); }

function login() {
  let mode = 'parent', step = 1; const box = h('div');
  const draw = () => { const err = h('p', { class: 'err', role: 'alert' }), go = h('button', { class: 'big' });
    const tabs = h('div', { class: 'tabs' }, ['parent', 'staff'].map((m) => h('button', { 'aria-selected': m === mode, onclick: () => { mode = m; step = 1; draw(); } }, t()[m])));
    const f = h('div');
    if (mode === 'parent') { f.append(h('label', { for: 'ph' }, t().phone), h('input', { id: 'ph', inputmode: 'numeric', maxlength: 10, autocomplete: 'tel', value: '9000000002' }));
      if (step === 2) f.append(h('label', { for: 'otp' }, t().otp), h('input', { id: 'otp', inputmode: 'numeric', maxlength: 6, value: '123456' }), h('p', { class: 'mut' }, 'Demo OTP: 123456'));
      go.textContent = step === 1 ? t().getotp : t().login; go.onclick = busy(go, async () => { err.textContent = ''; try { const phone = $('#ph').value;
        if (step === 1) { await api('POST', '/api/otp/request', { phone }); step = 2; draw(); } else { const r = await api('POST', '/api/otp/verify', { phone, otp: $('#otp').value }); session = r; sessionStorage.setItem('s', JSON.stringify(r)); render(); } } catch (e) { err.textContent = e.message; } }); }
    else { f.append(h('label', { for: 'em' }, t().email), h('input', { id: 'em', type: 'email', value: 'accounts@demo.test', autocomplete: 'username' }), h('label', { for: 'pw' }, t().pw), h('input', { id: 'pw', type: 'password', value: 'demo-accounts-1', autocomplete: 'current-password' }));
      go.textContent = t().login; go.onclick = busy(go, async () => { err.textContent = ''; try { const r = await api('POST', '/api/login', { email: $('#em').value, password: $('#pw').value }); session = r; sessionStorage.setItem('s', JSON.stringify(r)); render(); } catch (e) { err.textContent = e.message; } }); }
    box.replaceChildren(tabs, f, err, h('div', { class: 'sp' }, go)); };
  draw(); return h('div', { style: 'max-width:420px;margin:40px auto' }, h('h1', {}, t().title), h('p', { class: 'mut' }, 'Shikshan Coaching · Jaipur'), box);
}

function bars(vals) { return vals.length ? h('div', { class: 'row', style: 'gap:4px;align-items:flex-end;height:60px;border:0' }, vals.map((v) => h('div', { title: v + '%', style: `flex:1;height:${Math.max(4, v * .6)}px;background:var(--acc);border-radius:4px;opacity:.85` }))) : h('p', { class: 'mut' }, t().none); }
async function parentHome() {
  loading(); const kids = await api('GET', '/api/me/students'); const out = [];
  for (const s of kids) {
    const n = s.nextDue;
    const pay = h('button', { class: 'big' }, t().pay);
    pay.onclick = () => { const ref = crypto.randomUUID(); const close = () => c(); const ok = h('button', {}, t().confirm), er = h('p', { class: 'err', role: 'alert' });
      ok.onclick = busy(ok, async () => { try { await api('POST', '/api/pay', { studentId: s.id, ref }); c(); await render(); app.prepend(h('p', { class: 'card paid', role: 'status' }, t().paidok)); } catch (e) { er.textContent = e.message; } });
      const c = sheet(h('h2', { style: 'margin-top:0' }, t().pay), h('div', { class: 'amt' }, inr(n.balance)), h('p', { class: 'mut' }, t().testmode), er, h('div', { class: 'sp' }, h('button', { class: 'sec', onclick: close }, t().cancel), ok)); };
    out.push(h('section', {}, h('p', { class: 'mut' }, `${s.name} · ${s.batch}`),
      h('div', { class: 'hero' }, n ? [h('div', { class: 'mut' }, t().owe), h('div', { class: 'amt' }, inr(n.balance)), h('p', {}, `${t().due}: ${n.due} `, status(n)), s.status === 'active' ? pay : h('p', {}, t().closed)] : h('div', { class: 'amt', style: 'font-size:28px' }, t().allpaid)),
      h('h2', {}, t().inst), h('div', { class: 'card' }, s.instalments.map((i) => h('div', { class: 'row' }, h('div', {}, h('b', {}, inr(i.amount)), h('div', { class: 'mut' }, i.due)), status(i)))),
      h('h2', {}, t().rec), h('div', { class: 'card' }, s.payments.length ? s.payments.map((p) => h('div', { class: 'row' }, h('div', {}, h('b', {}, inr(p.amount)), h('div', { class: 'mut' }, `${p.at} · ${t().gst}: ${inr(p.gst)}`)), h('span', { class: 'mut' }, p.ref.slice(0, 12)))) : h('p', { class: 'mut' }, t().none)),
      h('div', { class: 'grid' }, h('div', { class: 'card' }, h('b', {}, t().att), bars(s.att)), h('div', { class: 'card' }, h('b', {}, t().sc), bars(s.scores)))));
  }
  app.replaceChildren(...out);
}

async function staffHome() {
  loading(); const d = await api('GET', '/api/dashboard');
  const tabs = h('div', { class: 'tabs', role: 'tablist' }, [['dash', t().dash], ['queue', t().queue], ['refund', t().refund], ['rem', t().rem]].map(([k, l]) => h('button', { role: 'tab', 'aria-selected': k === tab, onclick: () => { tab = k; staffHome(); } }, l)));
  const stack = (b) => { const tot = b.reduce((a, c) => a + c, 0) || 1; return h('div', { class: 'bar', title: b.map(inr).join(' / ') }, ['var(--warn)', 'var(--bad)', '#7a1510', 'var(--line)'].map((c, i) => h('i', { style: `width:${(b[i] / tot) * 100}%;background:${c}` }))); };
  const grp = (title, rows) => h('div', { class: 'card' }, h('b', {}, title), rows.map((g) => h('div', { style: 'padding:10px 0' }, h('div', { class: 'row', style: 'border:0;padding:0 0 6px' }, g.name, h('b', {}, inr(g.due))), stack(g.b))));
  let body;
  if (tab === 'dash') body = [h('div', { class: 'grid' }, h('div', { class: 'card' }, h('div', { class: 'mut' }, t().total), h('div', { class: 'amt' }, inr(d.totals.due))), h('div', { class: 'card' }, h('div', { class: 'mut' }, t().o60), h('div', { class: 'amt overdue' }, inr(d.totals.over60)))),
    h('p', { class: 'mut' }, '■ 0–30  ■ 31–60  ■ 60+ (late) · grey = not yet due'), h('div', { class: 'grid' }, grp(t().centre, d.byCentre), grp(t().batch, d.byBatch)),
    h('h2', {}, t().student), h('div', { class: 'card scroll' }, h('table', {}, h('tr', {}, ['ID', t().student, t().batch, t().total, '⏱'].map((x) => h('th', {}, x))), d.students.filter((r) => r.due > 0).map((r) => h('tr', { class: 'click', tabindex: 0, onclick: () => detail(r.id), onkeydown: (e) => e.key === 'Enter' && detail(r.id) }, h('td', {}, r.code), h('td', {}, r.name), h('td', {}, r.batch), h('td', {}, inr(r.due)), h('td', { class: r.maxOverdue ? 'overdue' : '' }, r.maxOverdue ? r.maxOverdue + 'd' : '–'))))),
    h('a', { href: '#', onclick: async (e) => { e.preventDefault(); const r = await fetch('/api/export/tally.csv', { headers: { Authorization: 'Bearer ' + session.token } }); const a = h('a', { href: URL.createObjectURL(await r.blob()), download: 'tally-export.csv' }); a.click(); } }, '⬇ ' + t().tally)];
  if (tab === 'queue') body = [h('h2', { style: 'margin-top:0' }, t().counsel), d.tasks.length ? d.tasks.map((k) => h('div', { class: 'card' }, h('b', {}, `${k.name} (${k.code})`), h('span', { class: 'pill overdue', style: 'margin-left:8px' }, `${t().risk} ${k.score}`), h('ul', { class: 'mut' }, k.reasons.map((r) => h('li', {}, r))),
      h('div', { class: 'sp' }, h('button', { onclick: async () => { await api('POST', '/api/tasks/' + k.id, { status: 'done' }); staffHome(); } }, t().done), h('button', { class: 'sec', onclick: async () => { await api('POST', '/api/tasks/' + k.id, { status: 'false_flag' }); staffHome(); } }, t().falsef)))) : h('div', { class: 'empty' }, t().none),
    h('h2', {}, t().unm), d.unmatched.length ? d.unmatched.map((u) => { const sel = h('select', { 'aria-label': t().pick }, d.students.map((s) => h('option', { value: s.id }, `${s.code} ${s.name}`))); return h('div', { class: 'card' }, h('b', {}, inr(u.amount)), h('span', { class: 'mut' }, ` ${u.ref} · ${u.payer}`), sel, h('div', { class: 'sp' }, h('button', { onclick: async () => { await api('POST', `/api/unmatched/${u.id}/assign`, { studentId: Number(sel.value) }); staffHome(); } }, t().assign))); }) : h('div', { class: 'empty' }, t().none)];
  if (tab === 'refund') body = refundPane(d);
  if (tab === 'rem') { const b = h('button', {}, t().run), msg = h('p', { class: 'mut', role: 'status' }); b.onclick = busy(b, async () => { const r = await api('POST', '/api/automation/run'); msg.textContent = `+${r.remindersSent} reminders, +${r.tasksCreated} tasks`; setTimeout(staffHome, 900); });
    body = [h('p', { class: 'mut' }, 'Reminders go out at −3, 0, +3, +7, +15 days and stop the moment an instalment is paid.'), b, msg, h('div', { class: 'card' }, d.reminders.length ? d.reminders.map((r) => h('div', { class: 'row' }, h('div', {}, h('b', {}, r.name), h('div', { class: 'mut' }, r.body)), h('span', { class: 'pill' }, r.off))) : h('p', { class: 'mut' }, t().none))]; }
  app.replaceChildren(tabs, ...body);
}
function refundPane(d) {
  const sel = h('select', { id: 'rs' }, d.students.map((s) => h('option', { value: s.id }, `${s.code} ${s.name}`))), dt = h('input', { type: 'date', id: 'rd', value: new Date().toISOString().slice(0, 10) }), out = h('div'), err = h('p', { class: 'err', role: 'alert' }), go = h('button', {}, t().calc);
  go.onclick = busy(go, async () => { err.textContent = ''; out.replaceChildren(); try { const body = { studentId: Number(sel.value), leaveDate: dt.value }; const r = await api('POST', '/api/refund/preview', body);
    const row = (l, v, c = '') => h('div', { class: 'row' }, l, h('b', { class: c }, v)); const ok = h('button', { class: 'sec' }, t().confirmRefund);
    ok.onclick = busy(ok, async () => { await api('POST', '/api/refund/confirm', body); out.replaceChildren(h('p', { class: 'card paid' }, '✓ ' + t().payby + ': ' + r.payBy)); });
    out.replaceChildren(h('div', { class: 'card' }, row(t().paidSoFar, inr(r.paid)), row(t().consumed, '− ' + inr(r.consumed)), row(t().admin, '− ' + inr(r.adminFee)), row(t().refundAmt, inr(r.amount), 'paid'), row(t().payby, r.payBy), h('p', { class: 'mut' }, `${r.elapsedDays}/${r.totalDays}`), ok)); } catch (e) { err.textContent = e.message; } });
  return [h('div', { class: 'card', style: 'max-width:520px' }, h('label', { for: 'rs' }, t().pick), sel, h('label', { for: 'rd' }, t().leave), dt, err, h('div', { class: 'sp' }, go)), out];
}
async function detail(id) { const s = await api('GET', '/api/students/' + id); let c; c = sheet(h('h2', { style: 'margin-top:0' }, s.name), h('p', { class: 'mut' }, `${s.code} · ${s.batch} · ${s.centre}`), s.instalments.map((i) => h('div', { class: 'row' }, h('div', {}, h('b', {}, inr(i.amount)), h('div', { class: 'mut' }, `${i.due} · ${t().paidSoFar} ${inr(i.paid)}`)), status(i))), h('div', { class: 'sp' }, h('button', { class: 'sec', onclick: () => c() }, '✕'))); }

async function render() {
  document.querySelectorAll('.modal').forEach((m) => m.remove()); document.documentElement.lang = lang; $('#lang').textContent = lang === 'hi' ? 'English' : 'हिंदी'; $('#out').hidden = !session; $('#out').textContent = t().out;
  try { if (!session) return app.replaceChildren(login()); await (session.role === 'parent' ? parentHome() : staffHome()); } catch (e) { if (session) fail(e); }
}
$('#lang').onclick = () => { lang = lang === 'hi' ? 'en' : 'hi'; localStorage.setItem('lang', lang); render(); }; $('#out').onclick = logout; render();
