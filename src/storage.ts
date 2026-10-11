import { defaultLang, isLang, type Lang } from './i18n';
import { sampleFor } from './templates';
import {
  BUSINESS_TYPES,
  MONTHLY_KEYS,
  STARTUP_KEYS,
  type BusinessType,
  type Plan,
} from './types';

const KEY = 'startsmart.v1';

export interface StoredState {
  plans: Plan[];
  lang: Lang;
}

export function newId(): string {
  // crypto.randomUUID needs a secure context, so it may be missing on a phone over http.
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function newPlan(name: string, type: BusinessType, useSample: boolean): Plan {
  const startup = {} as Plan['startup'];
  for (const k of STARTUP_KEYS) startup[k] = '';
  const monthly = {} as Plan['monthly'];
  for (const k of MONTHLY_KEYS) monthly[k] = '';
  const plan: Plan = { id: newId(), name, type, startup, monthly, createdAt: Date.now(), updatedAt: Date.now() };
  const sample = useSample ? sampleFor(type) : null;
  if (sample) {
    Object.assign(plan.startup, sample.startup);
    Object.assign(plan.monthly, sample.monthly);
  }
  return plan;
}

function str(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return '';
}

function sanitizePlan(raw: unknown): Plan | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || r.id === '') return null;
  const s = (r.startup && typeof r.startup === 'object' ? r.startup : {}) as Record<string, unknown>;
  const m = (r.monthly && typeof r.monthly === 'object' ? r.monthly : {}) as Record<string, unknown>;
  const startup = {} as Plan['startup'];
  for (const k of STARTUP_KEYS) startup[k] = str(s[k]);
  const monthly = {} as Plan['monthly'];
  for (const k of MONTHLY_KEYS) monthly[k] = str(m[k]);
  const type = BUSINESS_TYPES.includes(r.type as BusinessType) ? (r.type as BusinessType) : 'other';
  const now = Date.now();
  return {
    id: r.id,
    name: typeof r.name === 'string' ? r.name : '',
    type,
    startup,
    monthly,
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : now,
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : now,
  };
}

export function loadState(): StoredState {
  const fallback: StoredState = { plans: [], lang: defaultLang() };
  try {
    const text = window.localStorage.getItem(KEY);
    if (!text) return fallback;
    const data = JSON.parse(text) as { plans?: unknown; lang?: unknown };
    const plans = Array.isArray(data.plans)
      ? data.plans.map(sanitizePlan).filter((p): p is Plan => p !== null)
      : [];
    return { plans, lang: isLang(data.lang) ? data.lang : fallback.lang };
  } catch {
    return fallback;
  }
}

/** Returns false if the browser refused to store the data. */
export function saveState(state: StoredState): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
