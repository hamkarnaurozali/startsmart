import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { en, type Dict, type Key } from './en';
import { fa } from './fa';
import { ps } from './ps';

export type Lang = 'en' | 'fa' | 'ps';
export type { Key };

export const LANGS: { code: Lang; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'fa', name: 'دری' },
  { code: 'ps', name: 'پښتو' },
];

const dicts: Record<Lang, Dict> = { en, fa, ps };
const locales: Record<Lang, string> = { en: 'en', fa: 'fa-AF', ps: 'ps-AF' };

export interface I18n {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  t: (key: Key, params?: Record<string, string | number>) => string;
  /** Formats an amount in AFN. Wrapped in bidi isolates so it reads correctly inside RTL text. */
  money: (n: number) => string;
  num: (n: number, maxDigits?: number) => string;
  date: (ts: number) => string;
}

const Ctx = createContext<I18n | null>(null);

export function isLang(v: unknown): v is Lang {
  return v === 'en' || v === 'fa' || v === 'ps';
}

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo<I18n>(() => {
    const dict = dicts[lang];
    const locale = locales[lang];
    const dir = lang === 'en' ? 'ltr' : 'rtl';
    const nf = (digits: number) => {
      try {
        return new Intl.NumberFormat(locale, { maximumFractionDigits: digits });
      } catch {
        return new Intl.NumberFormat('en', { maximumFractionDigits: digits });
      }
    };
    const t: I18n['t'] = (key, params) => {
      let s = dict[key] ?? en[key] ?? key;
      if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
      return s;
    };
    return {
      lang,
      dir,
      t,
      money: (n) => `\u2068${nf(0).format(Math.round(n))} ${dict.currency}\u2069`,
      num: (n, d = 1) => nf(d).format(n),
      date: (ts) => {
        try {
          return new Date(ts).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
          return new Date(ts).toLocaleDateString();
        }
      },
    };
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locales[lang];
    root.dir = value.dir;
  }, [lang, value.dir]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n must be used inside I18nProvider');
  return v;
}

export function defaultLang(): Lang {
  const n = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
  if (n.startsWith('fa') || n.startsWith('prs')) return 'fa';
  if (n.startsWith('ps')) return 'ps';
  return 'en';
}
