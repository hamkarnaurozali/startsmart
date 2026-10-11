import type { BusinessType, CostKey, MonthlyKey, StartupKey } from './types';

/**
 * ILLUSTRATIVE sample numbers in AFN. They are NOT verified local market prices.
 * Savings and emergency reserve are never pre-filled: they are personal.
 * Monthly "sales" and "margin" are given so that margin already removes the
 * cost of goods; expenses below therefore exclude cost of goods.
 */
interface Sample {
  startup: Record<CostKey, number>;
  monthly: Record<MonthlyKey, number>;
}

const SAMPLES: Record<Exclude<BusinessType, 'other'>, Sample> = {
  grocery: {
    startup: { rentDeposit: 30000, equipment: 25000, inventory: 150000, transport: 5000, licensing: 3000, otherStartup: 5000 },
    monthly: { sales: 250000, margin: 15, rent: 10000, electricity: 2000, wages: 8000, transport: 3000, phone: 500, other: 1500 },
  },
  tailoring: {
    startup: { rentDeposit: 15000, equipment: 30000, inventory: 15000, transport: 1500, licensing: 2000, otherStartup: 2000 },
    monthly: { sales: 40000, margin: 55, rent: 5000, electricity: 1000, wages: 5000, transport: 1000, phone: 500, other: 1000 },
  },
  mobile: {
    startup: { rentDeposit: 20000, equipment: 15000, inventory: 80000, transport: 2000, licensing: 3000, otherStartup: 3000 },
    monthly: { sales: 90000, margin: 30, rent: 8000, electricity: 1500, wages: 5000, transport: 1500, phone: 1000, other: 1500 },
  },
  food: {
    startup: { rentDeposit: 5000, equipment: 25000, inventory: 10000, transport: 1000, licensing: 2000, otherStartup: 2000 },
    monthly: { sales: 80000, margin: 45, rent: 3000, electricity: 3000, wages: 6000, transport: 2000, phone: 500, other: 1000 },
  },
  beauty: {
    startup: { rentDeposit: 20000, equipment: 30000, inventory: 10000, transport: 1000, licensing: 2000, otherStartup: 2000 },
    monthly: { sales: 60000, margin: 80, rent: 7000, electricity: 2000, wages: 6000, transport: 1000, phone: 500, other: 1000 },
  },
  home: {
    startup: { rentDeposit: 0, equipment: 15000, inventory: 10000, transport: 1000, licensing: 1000, otherStartup: 2000 },
    monthly: { sales: 30000, margin: 50, rent: 0, electricity: 500, wages: 0, transport: 1500, phone: 800, other: 700 },
  },
};

export function hasSample(type: BusinessType): boolean {
  return type !== 'other';
}

export function sampleFor(
  type: BusinessType,
): { startup: Partial<Record<StartupKey, string>>; monthly: Record<MonthlyKey, string> } | null {
  if (type === 'other') return null;
  const s = SAMPLES[type];
  const startup: Partial<Record<StartupKey, string>> = {};
  for (const k of Object.keys(s.startup) as CostKey[]) startup[k] = String(s.startup[k]);
  const monthly = {} as Record<MonthlyKey, string>;
  for (const k of Object.keys(s.monthly) as MonthlyKey[]) monthly[k] = String(s.monthly[k]);
  return { startup, monthly };
}
