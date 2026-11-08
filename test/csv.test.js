const test = require('node:test'), assert = require('node:assert'); const { parseMetrics } = require('../src/csv');
test('csv: header, bounds, duplicates, BOM, extra columns', () => {
  const r = parseMetrics('\uFEFFstudent_id,value\nA,10\nB,101\nA,20\nC,5,9\nD,abc\n');
  assert.equal(r.rows.length, 1); assert.deepEqual(r.errors.map((e) => e.line), [3, 4, 5, 6]);
  assert.equal(parseMetrics('').errors.length, 1); assert.equal(parseMetrics('x,y\n1,2').errors[0].line, 1);
});
