// Parses the bulk attendance / score upload. Pure function; DB checks happen in the route.
const MAX_ROWS = 5000;
function parseMetrics(text) {
  const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { rows: [], errors: [{ line: 0, reason: 'File is empty' }] };
  if (lines[0].toLowerCase().replace(/\s/g, '') !== 'student_id,value') return { rows: [], errors: [{ line: 1, reason: 'Header must be: student_id,value' }] };
  if (lines.length - 1 > MAX_ROWS) return { rows: [], errors: [{ line: 0, reason: `Max ${MAX_ROWS} rows per upload` }] };
  const rows = [], errors = [], seen = new Set();
  lines.slice(1).forEach((l, i) => {
    const [code, v, ...extra] = l.split(',').map((x) => x.trim()), line = i + 2, val = Number(v);
    if (extra.length || !code || v === undefined || v === '') errors.push({ line, reason: 'Expected 2 columns' });
    else if (!Number.isFinite(val) || val < 0 || val > 100) errors.push({ line, reason: `Value "${v}" must be a number from 0 to 100` });
    else if (seen.has(code)) errors.push({ line, reason: `Duplicate student ${code}` });
    else { seen.add(code); rows.push({ code, value: val, line }); }
  });
  return { rows, errors };
}
module.exports = { parseMetrics };
