const T = { hi: {
  title: 'फीस पोर्टल', parent: 'अभिभावक', staff: 'स्टाफ', phone: 'मोबाइल नंबर', getotp: 'OTP भेजें', otp: 'OTP', login: 'लॉगिन', email: 'ईमेल', pw: 'पासवर्ड', out: 'लॉगआउट',
  owe: 'देय राशि', due: 'अंतिम तिथि', pay: 'अभी भुगतान करें', allpaid: 'सब कुछ चुकता है 🎉', overdue: (n) => `${n} दिन देरी`, indays: (n) => `${n} दिन में`, inst: 'किस्तें', rec: 'रसीदें', att: 'उपस्थिति', sc: 'टेस्ट स्कोर',
  gst: 'GST शामिल', testmode: 'टेस्ट मोड — असली पैसा नहीं कटेगा', confirm: 'भुगतान की पुष्टि करें', cancel: 'रद्द करें', paidok: 'भुगतान सफल। रसीद नीचे है।', loading: 'लोड हो रहा है…', none: 'अभी कुछ नहीं है',
  dash: 'बकाया', queue: 'कार्य और कतार', refund: 'रिफंड', rem: 'रिमाइंडर', total: 'कुल बकाया', o60: '60+ दिन देरी', centre: 'सेंटर', batch: 'बैच', student: 'छात्र', run: 'ऑटोमेशन चलाएँ',
  tally: 'Tally एक्सपोर्ट', counsel: 'काउंसलर कॉल', done: 'पूर्ण', falsef: 'गलत फ्लैग', unm: 'बिना मिलान वाले भुगतान', assign: 'छात्र से जोड़ें', leave: 'छोड़ने की तारीख', calc: 'गणना करें', confirmRefund: 'रिफंड पक्का करें',
  consumed: 'उपयोग की गई फीस', admin: 'प्रशासनिक शुल्क (नॉन-रिफंडेबल)', refundAmt: 'रिफंड राशि', payby: 'इस तारीख तक भुगतान', paidSoFar: 'अब तक जमा', pick: 'छात्र चुनें', closed: 'खाता बंद', risk: 'जोखिम स्कोर', err: 'कुछ गलत हुआ। दोबारा कोशिश करें।',
  consentT: 'अभिभावक की सहमति', consentP: 'आपके बच्चे की फीस और उपस्थिति की जानकारी (DPDP अधिनियम 2023) केवल फीस, रसीद और रिमाइंडर के लिए उपयोग होगी। आप कभी भी सहमति वापस ले सकते हैं।', guardian: 'अभिभावक का नाम', relation: 'संबंध', Mother: 'माता', Father: 'पिता', Guardian: 'संरक्षक', agree: 'मैं सहमत हूँ', give: 'सहमति दें', withdraw: 'सहमति वापस लें', policy: 'रिफंड नीति', upload: 'अपलोड', batchL: 'बैच', kind: 'प्रकार', att2: 'उपस्थिति %', sc2: 'टेस्ट स्कोर %', file: 'CSV फ़ाइल', send: 'अपलोड करें', accepted: 'स्वीकार', rejected: 'अस्वीकार', tmpl: 'नमूना CSV', receipt: 'रसीद', print: 'प्रिंट / PDF सेव करें', discount: 'छूट', reason: 'कारण', apply: 'लागू करें', plan: 'योजना', copy: 'लिंक कॉपी करें', markPaid: 'भुगतान हुआ', refunds: 'रिफंड ट्रैकिंग', late: 'देरी', hello: 'नमस्ते', back: 'लॉगिन', amtRs: 'राशि (₹)', net: 'शुद्ध फीस' },
 en: { title: 'Fee portal', parent: 'Parent', staff: 'Staff', phone: 'Mobile number', getotp: 'Send OTP', otp: 'OTP', login: 'Sign in', email: 'Email', pw: 'Password', out: 'Sign out',
  owe: 'Amount due', due: 'Due date', pay: 'Pay now', allpaid: 'All paid up 🎉', overdue: (n) => `${n} days overdue`, indays: (n) => `in ${n} days`, inst: 'Instalments', rec: 'Receipts', att: 'Attendance', sc: 'Test scores',
  gst: 'GST included', testmode: 'Test mode: no real money is charged', confirm: 'Confirm payment', cancel: 'Cancel', paidok: 'Payment successful. Your receipt is below.', loading: 'Loading…', none: 'Nothing here yet',
  dash: 'Dues', queue: 'Tasks & queue', refund: 'Refund', rem: 'Reminders', total: 'Total outstanding', o60: 'Over 60 days late', centre: 'Centre', batch: 'Batch', student: 'Student', run: 'Run automation',
  tally: 'Tally export', counsel: 'Counsellor calls', done: 'Done', falsef: 'False flag', unm: 'Unmatched payments', assign: 'Assign to student', leave: 'Leaving date', calc: 'Calculate', confirmRefund: 'Confirm refund',
  consumed: 'Fee consumed', admin: 'Admin fee (non-refundable)', refundAmt: 'Refund amount', payby: 'Pay refund by', paidSoFar: 'Paid so far', pick: 'Choose student', closed: 'Account closed', risk: 'Risk score', err: 'Something went wrong. Please try again.',
  consentT: 'Guardian consent', consentP: 'Your child’s fee and attendance data (DPDP Act 2023) is used only for fees, receipts and reminders. You can withdraw consent at any time.', guardian: 'Guardian name', relation: 'Relation', Mother: 'Mother', Father: 'Father', Guardian: 'Guardian', agree: 'I agree', give: 'Give consent', withdraw: 'Withdraw consent', policy: 'Refund policy', upload: 'Upload', batchL: 'Batch', kind: 'Type', att2: 'Attendance %', sc2: 'Test score %', file: 'CSV file', send: 'Upload', accepted: 'Accepted', rejected: 'Rejected', tmpl: 'Sample CSV', receipt: 'Receipt', print: 'Print / Save as PDF', discount: 'Discount', reason: 'Reason', apply: 'Apply', plan: 'Plan', copy: 'Copy link', markPaid: 'Mark paid', refunds: 'Refund tracking', late: 'late', hello: 'Hello', back: 'Sign in', amtRs: 'Amount (₹)', net: 'Net fee' } };
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
  let mode = 'parent', step = 1, phoneVal = '9000000002'; const box = h('div');
  const draw = () => { const err = h('p', { class: 'err', role: 'alert' }), go = h('button', { class: 'big' });
    const tabs = h('div', { class: 'tabs' }, ['parent', 'staff'].map((m) => h('button', { 'aria-selected': m === mode, onclick: () => { mode = m; step = 1; draw(); } }, t()[m])));
    const f = h('div');
    if (mode === 'parent') { f.append(h('label', { for: 'ph' }, t().phone), h('input', { id: 'ph', inputmode: 'numeric', maxlength: 10, autocomplete: 'tel', value: phoneVal, oninput: (e) => (phoneVal = e.target.value) }));
      if (step === 2) f.append(h('label', { for: 'otp' }, t().otp), h('input', { id: 'otp', inputmode: 'numeric', maxlength: 6, value: '123456' }), h('p', { class: 'mut' }, 'Demo OTP: 123456'));
      go.textContent = step === 1 ? t().getotp : t().login; go.onclick = busy(go, async () => { err.textContent = ''; try { const phone = $('#ph').value;
        if (step === 1) { await api('POST', '/api/otp/request', { phone }); step = 2; draw(); } else { const r = await api('POST', '/api/otp/verify', { phone, otp: $('#otp').value }); session = r; sessionStorage.setItem('s', JSON.stringify(r)); render(); } } catch (e) { err.textContent = e.message; } }); }
    else { f.append(h('label', { for: 'em' }, t().email), h('input', { id: 'em', type: 'email', value: 'accounts@demo.test', autocomplete: 'username' }), h('label', { for: 'pw' }, t().pw), h('input', { id: 'pw', type: 'password', value: 'demo-accounts-1', autocomplete: 'current-password' }));
      go.textContent = t().login; go.onclick = busy(go, async () => { err.textContent = ''; try { const r = await api('POST', '/api/login', { email: $('#em').value, password: $('#pw').value }); session = r; sessionStorage.setItem('s', JSON.stringify(r)); render(); } catch (e) { err.textContent = e.message; } }); }
    box.replaceChildren(tabs, f, err, h('div', { class: 'sp' }, go)); };
  draw(); return h('div', { style: 'max-width:420px;margin:40px auto' }, h('h1', {}, t().title), h('p', { class: 'mut' }, 'Shikshan Coaching · Jaipur'), h('p', {}, h('a', { href: '/policy' }, t().policy)), box);
}

function bars(vals) { return vals.length ? h('div', { class: 'row', style: 'gap:4px;align-items:flex-end;height:60px;border:0' }, vals.map((v) => h('div', { title: v + '%', style: `flex:1;height:${Math.max(4, v * .6)}px;background:var(--acc);border-radius:4px;opacity:.85` }))) : h('p', { class: 'mut' }, t().none); }
async function parentHome() {
  loading(); const kids = await api('GET', '/api/me/students'); const out = [];
  for (const s of kids) {
    if (s.needsConsent) { out.push(consentCard(s)); continue; }
    const n = s.nextDue;
    const pay = h('button', { class: 'big' }, t().pay);
    pay.onclick = () => { const ref = crypto.randomUUID(); const close = () => c(); const ok = h('button', {}, t().confirm), er = h('p', { class: 'err', role: 'alert' });
      ok.onclick = busy(ok, async () => { try { await api('POST', '/api/pay', { studentId: s.id, ref }); c(); await render(); app.prepend(h('p', { class: 'card paid', role: 'status' }, t().paidok)); } catch (e) { er.textContent = e.message; } });
      const c = sheet(h('h2', { style: 'margin-top:0' }, t().pay), h('div', { class: 'amt' }, inr(n.balance)), h('p', { class: 'mut' }, t().testmode), er, h('div', { class: 'sp' }, h('button', { class: 'sec', onclick: close }, t().cancel), ok)); };
    out.push(h('section', {}, h('p', { class: 'mut' }, `${s.name} · ${s.batch}`),
      h('div', { class: 'hero' }, n ? [h('div', { class: 'mut' }, t().owe), h('div', { class: 'amt' }, inr(n.balance)), h('p', {}, `${t().due}: ${n.due} `, status(n)), s.status === 'active' ? pay : h('p', {}, t().closed)] : h('div', { class: 'amt', style: 'font-size:28px' }, t().allpaid)),
      h('h2', {}, t().inst), h('div', { class: 'card' }, s.instalments.map((i) => h('div', { class: 'row' }, h('div', {}, h('b', {}, inr(i.amount)), h('div', { class: 'mut' }, i.due)), status(i)))),
      h('h2', {}, t().rec), h('div', { class: 'card' }, s.payments.length ? s.payments.map((p) => h('div', { class: 'row' }, h('div', {}, h('b', {}, inr(p.amount)), h('div', { class: 'mut' }, `${p.at} · ${t().gst}: ${inr(p.gst)}`)), h('button', { class: 'ghost', onclick: () => receipt(p.id) }, t().receipt))) : h('p', { class: 'mut' }, t().none)),
      h('div', { class: 'grid' }, h('div', { class: 'card' }, h('b', {}, t().att), bars(s.att)), h('div', { class: 'card' }, h('b', {}, t().sc), bars(s.scores))), h('p', {}, h('button', { class: 'ghost', onclick: async () => { await api('POST', '/api/consent/withdraw', { studentId: s.id }); render(); } }, t().withdraw), ' ', h('a', { href: '/policy' }, t().policy))));
  }
  app.replaceChildren(...out);
}

async function staffHome() {
  loading(); const d = await api('GET', '/api/dashboard');
  const tabs = h('div', { class: 'tabs', role: 'tablist' }, [['dash', t().dash], ['queue', t().queue], ['refund', t().refund], ['upload', t().upload], ['rem', t().rem]].map(([k, l]) => h('button', { role: 'tab', 'aria-selected': k === tab, onclick: () => { tab = k; staffHome(); } }, l)));
  const stack = (b) => { const tot = b.reduce((a, c) => a + c, 0) || 1; return h('div', { class: 'bar', title: b.map(inr).join(' / ') }, ['var(--warn)', 'var(--bad)', '#7a1510', 'var(--line)'].map((c, i) => h('i', { style: `width:${(b[i] / tot) * 100}%;background:${c}` }))); };
  const grp = (title, rows) => h('div', { class: 'card' }, h('b', {}, title), rows.map((g) => h('div', { style: 'padding:10px 0' }, h('div', { class: 'row', style: 'border:0;padding:0 0 6px' }, g.name, h('b', {}, inr(g.due))), stack(g.b))));
  let body;
  if (tab === 'dash') body = [h('div', { class: 'grid' }, h('div', { class: 'card' }, h('div', { class: 'mut' }, t().total), h('div', { class: 'amt' }, inr(d.totals.due))), h('div', { class: 'card' }, h('div', { class: 'mut' }, t().o60), h('div', { class: 'amt overdue' }, inr(d.totals.over60)))),
    h('p', { class: 'mut' }, [['var(--warn)', '0–30'], ['var(--bad)', '31–60'], ['#7a1510', '60+']].map(([c, l]) => h('span', { style: 'margin-right:12px' }, h('span', { style: `color:${c}` }, '■ '), l)), ' · ', t().late, ' · grey = not yet due'), h('div', { class: 'grid' }, grp(t().centre, d.byCentre), grp(t().batch, d.byBatch)),
    h('h2', {}, t().student), h('div', { class: 'card scroll' }, h('table', {}, h('tr', {}, ['ID', t().student, t().batch, t().total, '⏱'].map((x) => h('th', {}, x))), d.students.filter((r) => r.due > 0).map((r) => h('tr', { class: 'click', tabindex: 0, onclick: () => detail(r.id), onkeydown: (e) => e.key === 'Enter' && detail(r.id) }, h('td', {}, r.code), h('td', {}, r.name), h('td', {}, r.batch), h('td', {}, inr(r.due)), h('td', { class: r.maxOverdue ? 'overdue' : '' }, r.maxOverdue ? r.maxOverdue + 'd' : '–'))))),
    h('a', { href: '#', onclick: async (e) => { e.preventDefault(); const r = await fetch('/api/export/tally.csv', { headers: { Authorization: 'Bearer ' + session.token } }); const a = h('a', { href: URL.createObjectURL(await r.blob()), download: 'tally-export.csv' }); a.click(); } }, '⬇ ' + t().tally)];
  if (tab === 'queue') body = [h('h2', { style: 'margin-top:0' }, t().counsel), d.tasks.length ? d.tasks.map((k) => h('div', { class: 'card' }, h('b', {}, `${k.name} (${k.code})`), h('span', { class: 'pill overdue', style: 'margin-left:8px' }, `${t().risk} ${k.score}`), h('ul', { class: 'mut' }, k.reasons.map((r) => h('li', {}, r))),
      h('div', { class: 'sp' }, h('button', { onclick: async () => { await api('POST', '/api/tasks/' + k.id, { status: 'done' }); staffHome(); } }, t().done), h('button', { class: 'sec', onclick: async () => { await api('POST', '/api/tasks/' + k.id, { status: 'false_flag' }); staffHome(); } }, t().falsef)))) : h('div', { class: 'empty' }, t().none),
    h('h2', {}, t().unm), d.unmatched.length ? d.unmatched.map((u) => { const sel = h('select', { 'aria-label': t().pick }, d.students.map((s) => h('option', { value: s.id }, `${s.code} ${s.name}`))); return h('div', { class: 'card' }, h('b', {}, inr(u.amount)), h('span', { class: 'mut' }, ` ${u.ref} · ${u.payer}`), sel, h('div', { class: 'sp' }, h('button', { onclick: async () => { await api('POST', `/api/unmatched/${u.id}/assign`, { studentId: Number(sel.value) }); staffHome(); } }, t().assign))); }) : h('div', { class: 'empty' }, t().none)];
  if (tab === 'refund') body = await refundPane(d);
  if (tab === 'upload') body = await uploadPane();
  if (tab === 'rem') { const b = h('button', {}, t().run), msg = h('p', { class: 'mut', role: 'status' }); b.onclick = busy(b, async () => { const r = await api('POST', '/api/automation/run'); msg.textContent = `+${r.remindersSent} reminders, +${r.tasksCreated} tasks`; setTimeout(staffHome, 900); });
    body = [h('p', { class: 'mut' }, 'Reminders go out at −3, 0, +3, +7, +15 days and stop the moment an instalment is paid.'), b, msg, h('div', { class: 'card' }, d.reminders.length ? d.reminders.map((r) => h('div', { class: 'row' }, h('div', {}, h('b', {}, r.name), h('div', { class: 'mut' }, r.body)), h('span', { class: 'pill' }, r.off))) : h('p', { class: 'mut' }, t().none))]; }
  app.replaceChildren(tabs, ...body);
}
async function refundPane(d) {
  const list = await api('GET', '/api/refunds');
  const sel = h('select', { id: 'rs' }, d.students.map((s) => h('option', { value: s.id }, `${s.code} ${s.name}`))), dt = h('input', { type: 'date', id: 'rd', value: new Date().toISOString().slice(0, 10) }), out = h('div'), err = h('p', { class: 'err', role: 'alert' }), go = h('button', {}, t().calc);
  go.onclick = busy(go, async () => { err.textContent = ''; out.replaceChildren(); try { const body = { studentId: Number(sel.value), leaveDate: dt.value }; const r = await api('POST', '/api/refund/preview', body);
    const row = (l, v, c = '') => h('div', { class: 'row' }, l, h('b', { class: c }, v)); const ok = h('button', { class: 'sec' }, t().confirmRefund);
    ok.onclick = busy(ok, async () => { await api('POST', '/api/refund/confirm', body); out.replaceChildren(h('p', { class: 'card paid' }, '✓ ' + t().payby + ': ' + r.payBy)); });
    out.replaceChildren(h('div', { class: 'card' }, row(t().paidSoFar, inr(r.paid)), row(t().consumed, '− ' + inr(r.consumed)), row(t().admin, '− ' + inr(r.adminFee)), row(t().refundAmt, inr(r.amount), 'paid'), row(t().payby, r.payBy), h('p', { class: 'mut' }, `${r.elapsedDays}/${r.totalDays}`), ok)); } catch (e) { err.textContent = e.message; } });
  const tracker = h('div', {}, h('h2', {}, t().refunds), list.length ? h('div', { class: 'card' }, list.map((r) => h('div', { class: 'row' }, h('div', {}, h('b', {}, `${r.name} · ${inr(r.amount)}`), h('div', { class: 'mut' }, `${t().payby}: ${r.pay_by}`)), r.status === 'paid' ? h('span', { class: 'pill paid' }, '✓') : h('span', {}, r.overdue ? h('span', { class: 'pill overdue' }, t().late + ' ') : '', h('button', { class: 'ghost', onclick: async () => { await api('POST', `/api/refunds/${r.id}/paid`); staffHome(); } }, t().markPaid))))) : h('div', { class: 'empty' }, t().none));
  return [h('p', {}, h('a', { href: '/policy' }, t().policy)), h('div', { class: 'card', style: 'max-width:520px' }, h('label', { for: 'rs' }, t().pick), sel, h('label', { for: 'rd' }, t().leave), dt, err, h('div', { class: 'sp' }, go)), out, tracker];
}
async function detail(id) { const s = await api('GET', '/api/students/' + id); let c; const amt = h('input', { type: 'number', min: 1, step: 1, 'aria-label': t().amtRs }), why = h('input', { 'aria-label': t().reason, placeholder: t().reason, maxlength: 80 }), er = h('p', { class: 'err', role: 'alert' });
  const ap = h('button', { class: 'sec' }, t().apply); ap.onclick = busy(ap, async () => { try { await api('POST', `/api/students/${id}/discount`, { amount: Math.round(Number(amt.value) * 100), reason: why.value }); c(); staffHome(); } catch (e) { er.textContent = e.message; } });
  c = sheet(h('h2', { style: 'margin-top:0' }, s.name), h('p', { class: 'mut' }, `${s.code} · ${s.batch} · ${s.centre}`), h('p', { class: 'mut' }, `${t().plan}: ${s.plan} · ${inr(s.gross)}${s.discount ? ` − ${inr(s.discount)} (${s.discountReason}) = ${t().net} ${inr(s.net)}` : ''}`),
    s.instalments.map((i) => h('div', { class: 'row' }, h('div', {}, h('b', {}, inr(i.amount)), h('div', { class: 'mut' }, `${i.due} · ${t().paidSoFar} ${inr(i.paid)}`)), h('div', {}, status(i), i.link ? h('button', { class: 'ghost', style: 'margin-left:8px', onclick: (e) => { navigator.clipboard?.writeText(location.origin + i.link); e.target.textContent = '✓'; } }, t().copy) : ''))),
    h('label', {}, t().discount), h('div', { class: 'sp', style: 'margin-top:0' }, amt, why), er, h('div', { class: 'sp' }, ap, h('button', { class: 'sec', onclick: () => c() }, '✕'))); }
async function uploadPane() {
  const batches = await api('GET', '/api/batches'); const b = h('select', { id: 'ub' }, batches.map((x) => h('option', {}, x))), k = h('select', { id: 'uk' }, h('option', { value: 'att' }, t().att2), h('option', { value: 'score' }, t().sc2)), f = h('input', { type: 'file', accept: '.csv,text/csv', id: 'uf' }), out = h('div'), go = h('button', {}, t().send);
  go.onclick = busy(go, async () => { out.replaceChildren(); try { if (!f.files[0]) throw new Error(t().file); if (f.files[0].size > 1e5) throw new Error('File too large (max 100 KB)'); const r = await api('POST', '/api/upload/metrics', { batch: b.value, kind: k.value, csv: await f.files[0].text() });
    out.replaceChildren(h('p', { class: 'paid', role: 'status' }, `${t().accepted}: ${r.accepted}`), r.rejected.length ? h('div', { class: 'card' }, h('b', { class: 'overdue' }, `${t().rejected}: ${r.rejected.length}`), r.rejected.slice(0, 50).map((e) => h('div', { class: 'mut' }, `Line ${e.line}: ${e.reason}`))) : '', ); } catch (e) { out.replaceChildren(h('p', { class: 'err', role: 'alert' }, e.message)); } });
  const tmpl = h('a', { href: '#', onclick: (e) => { e.preventDefault(); const a = h('a', { href: URL.createObjectURL(new Blob(['student_id,value\nSTU-0412,92\nSTU-0587,71\n'], { type: 'text/csv' })), download: 'sample.csv' }); a.click(); } }, t().tmpl);
  return [h('div', { class: 'card', style: 'max-width:520px' }, h('label', { for: 'ub' }, t().batchL), b, h('label', { for: 'uk' }, t().kind), k, h('label', { for: 'uf' }, t().file), f, h('p', { class: 'mut' }, 'student_id,value (0–100) · one row per student, added as the next entry'), tmpl, h('div', { class: 'sp' }, go)), out];
}
function consentCard(s) {
  const nm = h('input', { id: 'gn', maxlength: 80, autocomplete: 'name' }), rl = h('select', { id: 'gr' }, ['Mother', 'Father', 'Guardian'].map((x) => h('option', { value: x }, t()[x]))), ck = h('input', { type: 'checkbox', id: 'ag', style: 'width:auto;min-height:0;margin-right:8px' }), er = h('p', { class: 'err', role: 'alert' }), go = h('button', { class: 'big' }, t().give);
  go.onclick = busy(go, async () => { try { await api('POST', '/api/consent', { studentId: s.id, guardianName: nm.value, relation: rl.value, agree: ck.checked }); render(); } catch (e) { er.textContent = e.message; } });
  return h('section', { class: 'card' }, h('h2', { style: 'margin-top:0' }, `${t().consentT}: ${s.name}`), h('p', {}, t().consentP), h('label', { for: 'gn' }, t().guardian), nm, h('label', { for: 'gr' }, t().relation), rl, h('label', { for: 'ag', style: 'display:flex;align-items:center;color:var(--ink);font-size:16px' }, ck, t().agree), er, h('div', { class: 'sp' }, go), h('p', {}, h('a', { href: '/policy' }, t().policy)));
}
async function receipt(id) { let c; try { const r = await api('GET', '/api/receipts/' + id); const row = (l, v) => h('div', { class: 'row' }, l, h('b', {}, v));
  c = sheet(h('div', { class: 'print' }, h('h2', { style: 'margin-top:0' }, `${r.institute} · ${t().receipt}`), h('p', { class: 'mut' }, `${r.no} · ${r.date}`), row(t().student, `${r.student} (${r.code})`), row(t().batchL, r.batch), row('Base', inr(r.base)), row(`CGST ${r.gstPct / 2}%`, inr(r.cgst)), row(`SGST ${r.gstPct / 2}%`, inr(r.sgst)), row('Total', inr(r.amount)), h('p', { class: 'mut' }, `GSTIN ${r.gstin} · SAC ${r.sac} · Ref ${r.ref}`)), h('div', { class: 'sp noprint' }, h('button', { onclick: () => window.print() }, t().print), h('button', { class: 'sec', onclick: () => c() }, '✕'))); } catch (e) { alert(e.message); } }
async function policyPage() {
  loading(); const p = await api('GET', '/api/policy'); const li = (x) => h('li', {}, x);
  app.replaceChildren(h('h1', {}, t().policy), h('p', { class: 'mut' }, 'Ministry of Education 2024 coaching guidelines'), h('div', { class: 'card' }, h('ol', {}, [
    lang === 'hi' ? 'जब कोई छात्र कोर्स छोड़ता है तो जमा फीस में से उपयोग की गई अवधि की फीस (कुल फीस × बीते दिन ÷ कोर्स के कुल दिन) काटी जाती है।' : 'When a student leaves, the fee for the period attended (total fee × days attended ÷ course days) is deducted from what was paid.',
    lang === 'hi' ? `प्रशासनिक शुल्क: फीस का ${p.adminFeePct}%, अधिकतम ₹${p.adminFeeCapRs}।` : `Admin fee: ${p.adminFeePct}% of the fee, capped at ₹${p.adminFeeCapRs}.`,
    lang === 'hi' ? `शेष रिफंड छोड़ने की तारीख से ${p.payWithinDays} दिन के भीतर दिया जाता है।` : `The remaining refund is paid within ${p.payWithinDays} days of the leaving date.`,
    lang === 'hi' ? 'रिफंड जमा राशि से अधिक या शून्य से कम नहीं होता।' : 'A refund is never more than the amount paid or below zero.', lang === 'hi' ? 'छूट के बाद की शुद्ध फीस पर गणना होती है।' : 'Calculated on the net fee after any discount.'].map(li))), h('p', {}, h('a', { href: '/' }, t().back))); }
async function payLinkPage() {
  loading(); const token = location.pathname.slice(5); const r = await api('GET', '/api/link/' + token); const pay = h('button', { class: 'big' }, t().pay);
  pay.onclick = () => { const ref = crypto.randomUUID(), er = h('p', { class: 'err', role: 'alert' }), ok = h('button', {}, t().confirm); let c;
    ok.onclick = busy(ok, async () => { try { await api('POST', `/api/link/${token}/pay`, { ref }); c(); payLinkPage(); } catch (e) { er.textContent = e.message; } });
    c = sheet(h('h2', { style: 'margin-top:0' }, t().pay), h('div', { class: 'amt' }, inr(r.amount)), h('p', { class: 'mut' }, t().testmode), er, h('div', { class: 'sp' }, h('button', { class: 'sec', onclick: () => c() }, t().cancel), ok)); };
  app.replaceChildren(h('div', { style: 'max-width:420px;margin:24px auto' }, h('p', {}, `${t().hello} ${r.student}`), h('div', { class: 'hero' }, r.blocked ? h('p', {}, r.blocked) : [h('div', { class: 'mut' }, t().owe), h('div', { class: 'amt' }, inr(r.amount)), h('p', {}, `${t().due}: ${r.due} `, status({ status: r.daysOverdue ? 'overdue' : 'due', daysOverdue: r.daysOverdue, daysToDue: 0 })), pay])));
}

async function render() {
  document.querySelectorAll('.modal').forEach((m) => m.remove()); document.documentElement.lang = lang; $('#lang').textContent = lang === 'hi' ? 'English' : 'हिंदी'; $('#out').hidden = !session; $('#out').textContent = t().out;
  try { if (location.pathname.startsWith('/pay/')) return await payLinkPage(); if (location.pathname === '/policy') return await policyPage(); if (!session) return app.replaceChildren(login()); await (session.role === 'parent' ? parentHome() : staffHome()); } catch (e) { if (session) fail(e); }
}
$('#lang').onclick = () => { lang = lang === 'hi' ? 'en' : 'hi'; localStorage.setItem('lang', lang); render(); }; $('#out').onclick = logout; render();
