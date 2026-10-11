// One-time costs (not including savings or reserve, which are "your money").
export const COST_KEYS = [
  'rentDeposit',
  'equipment',
  'inventory',
  'transport',
  'licensing',
  'otherStartup',
] as const;

// Everything on the startup page: money you have + one-time costs.
export const STARTUP_KEYS = ['savings', 'reserve', ...COST_KEYS] as const;

// Monthly operating expenses. Cost of goods is NOT here: it is removed by gross margin.
export const EXPENSE_KEYS = ['rent', 'electricity', 'wages', 'transport', 'phone', 'other'] as const;

export const MONTHLY_KEYS = ['sales', 'margin', ...EXPENSE_KEYS] as const;

export type CostKey = (typeof COST_KEYS)[number];
export type StartupKey = (typeof STARTUP_KEYS)[number];
export type ExpenseKey = (typeof EXPENSE_KEYS)[number];
export type MonthlyKey = (typeof MONTHLY_KEYS)[number];

export const BUSINESS_TYPES = ['grocery', 'tailoring', 'mobile', 'food', 'beauty', 'home', 'other'] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

/**
 * Inputs are stored as the text the person typed. An empty string means
 * "not entered" and is never silently treated as zero.
 */
export interface Plan {
  id: string;
  name: string;
  type: BusinessType;
  startup: Record<StartupKey, string>;
  monthly: Record<MonthlyKey, string>;
  createdAt: number;
  updatedAt: number;
}
