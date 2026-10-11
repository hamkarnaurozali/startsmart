import { computePlan, okValue } from './calc';
import { MONTHLY_KEYS, STARTUP_KEYS, type Plan } from './types';

// CSV headers are always English so the file stays consistent between languages.
const RESULT_HEADERS = [
  'total_startup_costs',
  'money_needed_startup_plus_reserve',
  'cash_after_startup_costs',
  'money_left_after_startup_and_reserve',
  'extra_funding_required',
  'monthly_gross_profit',
  'monthly_operating_expenses',
  'monthly_operating_profit',
  'break_even_monthly_sales',
  'months_to_earn_back_startup_costs',
];

function cell(v: string | number | null): string {
  if (v === null) return '';
  if (typeof v === 'number') return String(v);
  // Stop spreadsheet programs from running text that starts like a formula.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function plansToCsv(plans: Plan[]): string {
  const header = [
    'plan_name',
    'business_type',
    'all_numbers_entered',
    'currency',
    ...STARTUP_KEYS.map((k) => `startup_${k}`),
    ...MONTHLY_KEYS.map((k) => `monthly_${k}`),
    ...RESULT_HEADERS,
  ];
  const rows = plans.map((p) => {
    const r = computePlan(p);
    const r1 = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10);
    return [
      cell(p.name),
      cell(p.type),
      cell(r.complete ? 'yes' : 'no'),
      cell('AFN'),
      ...STARTUP_KEYS.map((k) => cell(okValue(r.startupParsed[k]))),
      ...MONTHLY_KEYS.map((k) => cell(okValue(r.monthlyParsed[k]))),
      cell(r.totalStartup),
      cell(r.moneyNeeded),
      cell(r.cashAfterStartup),
      cell(r.remaining),
      cell(r.shortfall),
      cell(r.grossProfit),
      cell(r.opex),
      cell(r.opProfit),
      cell(r.breakEven),
      cell(r1(r.paybackMonths)),
    ].join(',');
  });
  return [header.join(','), ...rows].join('\r\n');
}

export function downloadCsv(filename: string, text: string) {
  // The BOM makes Excel read Dari/Pashto names correctly.
  const blob = new Blob(['\uFEFF', text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
