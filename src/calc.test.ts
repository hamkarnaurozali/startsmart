// Run with: npm test
import assert from 'node:assert/strict';
import { computePlan, parseAmount } from './calc';
import { sampleFor } from './templates';
import { BUSINESS_TYPES, MONTHLY_KEYS, STARTUP_KEYS, type Plan } from './types';

function blank(): Pick<Plan, 'startup' | 'monthly'> {
  const startup = {} as Plan['startup'];
  for (const k of STARTUP_KEYS) startup[k] = '';
  const monthly = {} as Plan['monthly'];
  for (const k of MONTHLY_KEYS) monthly[k] = '';
  return { startup, monthly };
}

// 1. Parsing
assert.deepEqual(parseAmount(''), { status: 'empty' });
assert.deepEqual(parseAmount('  '), { status: 'empty' });
assert.deepEqual(parseAmount('12,500'), { status: 'ok', value: 12500 });
assert.deepEqual(parseAmount('۱۲۵۰۰'), { status: 'ok', value: 12500 }); // Persian digits
assert.deepEqual(parseAmount('١٢٥٠٠'), { status: 'ok', value: 12500 }); // Arabic-Indic digits
assert.deepEqual(parseAmount('12.5'), { status: 'ok', value: 12.5 });
assert.deepEqual(parseAmount('-5'), { status: 'invalid', reason: 'negative' });
assert.deepEqual(parseAmount('abc'), { status: 'invalid', reason: 'format' });
assert.deepEqual(parseAmount('101', 100), { status: 'invalid', reason: 'range' });
assert.deepEqual(parseAmount('0'), { status: 'ok', value: 0 });

// 2. Blank plan: nothing is silently zero
const b = computePlan(blank());
assert.equal(b.totalStartup, null);
assert.equal(b.shortfall, null);
assert.equal(b.opProfit, null);
assert.equal(b.breakEven, null);
assert.equal(b.complete, false);

// 3. Worked example (grocery sample + savings 200,000 and reserve 30,000)
const g = blank();
const s = sampleFor('grocery');
assert.ok(s);
Object.assign(g.startup, s.startup, { savings: '200000', reserve: '30000' });
Object.assign(g.monthly, s.monthly);
const r = computePlan(g);
assert.equal(r.complete, true);
assert.equal(r.totalStartup, 218000); // 30000+25000+150000+5000+3000+5000 (reserve NOT included)
assert.equal(r.moneyNeeded, 248000);
assert.equal(r.cashAfterStartup, -18000);
assert.equal(r.remaining, -48000);
assert.equal(r.shortfall, 48000);
assert.equal(r.moneyStatus, 'short');
assert.equal(r.grossProfit, 37500); // 250000 x 15%
assert.equal(r.cogs, 212500);
assert.equal(r.opex, 25000); // cost of goods is NOT added again
assert.equal(r.opProfit, 12500);
assert.equal(r.breakEven, 166666.67);
assert.equal(r.monthStatus, 'profit');
assert.ok(r.paybackMonths !== null && Math.abs(r.paybackMonths - 17.44) < 0.01);

// 4. Enough savings -> shortfall exactly 0
g.startup.savings = '300000';
const r2 = computePlan(g);
assert.equal(r2.remaining, 52000);
assert.equal(r2.shortfall, 0);
assert.equal(r2.moneyStatus, 'enough');

// 5. Break-even is not calculated when margin is 0, and it needs valid inputs
g.monthly.margin = '0';
const r3 = computePlan(g);
assert.equal(r3.breakEven, null);
assert.equal(r3.breakEvenIssue, 'zeroMargin');
assert.equal(r3.opProfit, -25000);
assert.equal(r3.monthStatus, 'loss');
assert.equal(r3.paybackIssue, 'noProfit');
g.monthly.margin = '150'; // invalid
const r4 = computePlan(g);
assert.equal(r4.grossProfit, null);
assert.equal(r4.breakEvenIssue, 'missing');

// 6. One missing cost makes the total unknown (not a partial sum)
g.monthly.margin = '15';
g.startup.licensing = '';
const r5 = computePlan(g);
assert.equal(r5.totalStartup, null);
assert.equal(r5.shortfall, null);
assert.equal(r5.opProfit, 12500); // monthly numbers are still complete
assert.deepEqual(r5.missingStartup, ['licensing']);

// 7. Floating-point safety
const f = blank();
Object.assign(f.monthly, { sales: '1000.10', margin: '12.5', rent: '0.1', electricity: '0.2', wages: '0', transport: '0', phone: '0', other: '0' });
const rf = computePlan(f);
assert.equal(rf.grossProfit, 125.01);
assert.equal(rf.opex, 0.3);

// 8. Every sample is profitable and internally consistent
for (const type of BUSINESS_TYPES) {
  const smp = sampleFor(type);
  if (!smp) continue;
  const p = blank();
  Object.assign(p.startup, smp.startup, { savings: '1', reserve: '1' });
  Object.assign(p.monthly, smp.monthly);
  const x = computePlan(p);
  assert.equal(x.complete, true, type);
  assert.ok((x.opProfit ?? -1) > 0, `${type} sample should show a profit`);
  assert.equal(round(x.grossProfit! - x.opex!), x.opProfit, type);
}
function round(n: number) { return Math.round(n * 100) / 100; }

console.log('All calculation tests passed.');
