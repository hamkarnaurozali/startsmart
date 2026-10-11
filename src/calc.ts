import {
  COST_KEYS,
  EXPENSE_KEYS,
  MONTHLY_KEYS,
  STARTUP_KEYS,
  type MonthlyKey,
  type Plan,
  type StartupKey,
} from './types';

export type Parsed =
  | { status: 'empty' }
  | { status: 'invalid'; reason: 'format' | 'negative' | 'range' }
  | { status: 'ok'; value: number };

const MAX_AMOUNT = 1_000_000_000_000;

/** Accepts Latin, Persian and Arabic-Indic digits; removes spaces and thousand separators. */
export function normalizeDigits(input: string): string {
  return input
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/\u066B/g, '.')
    .replace(/[,\u066C\u060C\s\u200E\u200F]/g, '')
    .replace(/\u2212/g, '-');
}

export function parseAmount(raw: string, max: number = MAX_AMOUNT): Parsed {
  const s = normalizeDigits(raw ?? '');
  if (s === '') return { status: 'empty' };
  if (s.startsWith('-')) return { status: 'invalid', reason: 'negative' };
  if (!/^(\d+(\.\d*)?|\.\d+)$/.test(s)) return { status: 'invalid', reason: 'format' };
  const value = Number(s);
  if (!Number.isFinite(value) || value > max) return { status: 'invalid', reason: 'range' };
  return { status: 'ok', value };
}

export function okValue(p: Parsed): number | null {
  return p.status === 'ok' ? p.value : null;
}

export function round2(x: number): number {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

export interface PlanResult {
  startupParsed: Record<StartupKey, Parsed>;
  monthlyParsed: Record<MonthlyKey, Parsed>;
  /** Fields that are empty or invalid. */
  missingStartup: StartupKey[];
  missingMonthly: MonthlyKey[];
  complete: boolean;

  /** One-time costs only: deposit + equipment + inventory + transport + licenses + other. */
  totalStartup: number | null;
  /** Startup costs + emergency reserve. */
  moneyNeeded: number | null;
  /** Savings - startup costs (reserve NOT yet set aside). */
  cashAfterStartup: number | null;
  /** Savings - startup costs - reserve. Negative means short. */
  remaining: number | null;
  /** Extra money needed (0 if none). */
  shortfall: number | null;

  /** Sales x margin. Cost of goods is already removed here. */
  grossProfit: number | null;
  /** Sum of monthly operating expenses. Does not include cost of goods. */
  opex: number | null;
  /** Gross profit - operating expenses. */
  opProfit: number | null;
  /** Sales - gross profit. */
  cogs: number | null;

  breakEven: number | null;
  breakEvenIssue: 'none' | 'missing' | 'zeroMargin';
  paybackMonths: number | null;
  paybackIssue: 'none' | 'missing' | 'noProfit';

  moneyStatus: 'enough' | 'short' | null;
  monthStatus: 'profit' | 'breakeven' | 'loss' | null;
}

function sumAll(values: (number | null)[]): number | null {
  let total = 0;
  for (const v of values) {
    if (v === null) return null; // never treat a missing input as 0
    total += v;
  }
  return round2(total);
}

export function computePlan(plan: Pick<Plan, 'startup' | 'monthly'>): PlanResult {
  const sp = {} as Record<StartupKey, Parsed>;
  for (const k of STARTUP_KEYS) sp[k] = parseAmount(plan.startup[k]);
  const mp = {} as Record<MonthlyKey, Parsed>;
  for (const k of MONTHLY_KEYS) mp[k] = parseAmount(plan.monthly[k], k === 'margin' ? 100 : undefined);

  const savings = okValue(sp.savings);
  const reserve = okValue(sp.reserve);
  const totalStartup = sumAll(COST_KEYS.map((k) => okValue(sp[k])));

  const moneyNeeded = totalStartup !== null && reserve !== null ? round2(totalStartup + reserve) : null;
  const cashAfterStartup = totalStartup !== null && savings !== null ? round2(savings - totalStartup) : null;
  const remaining = moneyNeeded !== null && savings !== null ? round2(savings - moneyNeeded) : null;
  const shortfall = remaining === null ? null : remaining < 0 ? round2(-remaining) : 0;

  const sales = okValue(mp.sales);
  const margin = okValue(mp.margin);
  const grossProfit = sales !== null && margin !== null ? round2((sales * margin) / 100) : null;
  const cogs = sales !== null && grossProfit !== null ? round2(sales - grossProfit) : null;
  const opex = sumAll(EXPENSE_KEYS.map((k) => okValue(mp[k])));
  const opProfit = grossProfit !== null && opex !== null ? round2(grossProfit - opex) : null;

  let breakEven: number | null = null;
  let breakEvenIssue: PlanResult['breakEvenIssue'] = 'none';
  if (opex === null || margin === null) breakEvenIssue = 'missing';
  else if (margin <= 0) breakEvenIssue = 'zeroMargin';
  else breakEven = round2(opex / (margin / 100));

  let paybackMonths: number | null = null;
  let paybackIssue: PlanResult['paybackIssue'] = 'none';
  if (totalStartup === null || opProfit === null) paybackIssue = 'missing';
  else if (opProfit <= 0) paybackIssue = 'noProfit';
  else paybackMonths = totalStartup / opProfit;

  const missingStartup = STARTUP_KEYS.filter((k) => sp[k].status !== 'ok');
  const missingMonthly = MONTHLY_KEYS.filter((k) => mp[k].status !== 'ok');

  return {
    startupParsed: sp,
    monthlyParsed: mp,
    missingStartup,
    missingMonthly,
    complete: missingStartup.length === 0 && missingMonthly.length === 0,
    totalStartup,
    moneyNeeded,
    cashAfterStartup,
    remaining,
    shortfall,
    grossProfit,
    opex,
    opProfit,
    cogs,
    breakEven,
    breakEvenIssue,
    paybackMonths,
    paybackIssue,
    moneyStatus: shortfall === null ? null : shortfall > 0 ? 'short' : 'enough',
    monthStatus: opProfit === null ? null : opProfit > 0 ? 'profit' : opProfit === 0 ? 'breakeven' : 'loss',
  };
}
