import { useMemo, useState, type ReactNode } from 'react';
import { computePlan, type Parsed, type PlanResult } from '../calc';
import { Field } from '../components/Field';
import { ConfirmDialog } from '../components/Modal';
import { Val } from '../components/Val';
import { Verdict } from '../components/Verdict';
import { useI18n } from '../i18n';
import { hasSample, sampleFor } from '../templates';
import {
  BUSINESS_TYPES,
  COST_KEYS,
  EXPENSE_KEYS,
  type BusinessType,
  type MonthlyKey,
  type Plan,
  type StartupKey,
} from '../types';

interface Props {
  plan: Plan;
  saveError: boolean;
  onChange: (fn: (p: Plan) => Plan) => void;
}

type Dialog = 'sample' | 'zero' | null;

export function Editor({ plan, saveError, onChange }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState(plan.name);
  const [dialog, setDialog] = useState<Dialog>(null);
  const r = useMemo(() => computePlan(plan), [plan]);
  const nameError = name.trim() === '' ? t('planNameRequired') : null;

  const setStartup = (k: StartupKey, v: string) => onChange((p) => ({ ...p, startup: { ...p.startup, [k]: v } }));
  const setMonthly = (k: MonthlyKey, v: string) => onChange((p) => ({ ...p, monthly: { ...p.monthly, [k]: v } }));

  function errorFor(p: Parsed, percent: boolean): string | null {
    if (p.status !== 'invalid') return null;
    if (p.reason === 'negative') return t('errNegative');
    if (p.reason === 'range') return percent ? t('errPercent') : t('errTooBig');
    return t('errNumber');
  }

  // Cost boxes the person may really want to set to 0 (not savings, sales or margin).
  const emptyCosts = {
    startup: (['reserve', ...COST_KEYS] as StartupKey[]).filter((k) => plan.startup[k].trim() === ''),
    monthly: EXPENSE_KEYS.filter((k) => plan.monthly[k].trim() === ''),
  };
  const canZeroFill = emptyCosts.startup.length + emptyCosts.monthly.length > 0;
  const sample = sampleFor(plan.type);

  function applySample() {
    if (!sample) return;
    onChange((p) => ({
      ...p,
      startup: { ...p.startup, ...sample.startup },
      monthly: { ...p.monthly, ...sample.monthly },
    }));
    setDialog(null);
  }

  function applyZero() {
    onChange((p) => {
      const startup = { ...p.startup };
      for (const k of emptyCosts.startup) startup[k] = '0';
      const monthly = { ...p.monthly };
      for (const k of emptyCosts.monthly) monthly[k] = '0';
      return { ...p, startup, monthly };
    });
    setDialog(null);
  }

  const missingLabels = [
    ...r.missingStartup.map((k) => t(`f_s_${k}`)),
    ...r.missingMonthly.map((k) => t(`f_m_${k}`)),
  ];

  const startupField = (k: StartupKey): ReactNode => (
    <Field
      key={k}
      id={`s-${k}`}
      label={t(`f_s_${k}`)}
      help={t(`h_s_${k}`)}
      value={plan.startup[k]}
      onChange={(v) => setStartup(k, v)}
      unit={t('currency')}
      placeholder={t('placeholderZero')}
      error={errorFor(r.startupParsed[k], false)}
    />
  );

  return (
    <>
      <p className="no-print">
        <a href="#/plans">{t('editBack')}</a>
      </p>
      <div className="page-head">
        <h1>{plan.name.trim() || t('planUnnamed')}</h1>
        <button type="button" className="btn small secondary no-print" onClick={() => window.print()}>
          {t('printBtn')}
        </button>
      </div>
      <p className="muted autosave no-print">{t('editAutosave')}</p>
      {saveError && <div className="notice bad">{t('storageError')}</div>}

      <div className="editor">
        <div className="editor-form">
          <section className="card">
            <div className={`field${nameError ? ' has-error' : ''}`}>
              <label htmlFor="plan-name">{t('planNameLabel')}</label>
              <input
                id="plan-name"
                className="control"
                value={name}
                maxLength={80}
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? 'plan-name-e' : undefined}
                onChange={(e) => {
                  setName(e.target.value);
                  const trimmed = e.target.value.trim();
                  if (trimmed) onChange((p) => ({ ...p, name: trimmed }));
                }}
              />
              {nameError && (
                <p id="plan-name-e" className="error" aria-live="polite">
                  {nameError}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="plan-type">{t('businessTypeLabel')}</label>
              <select
                id="plan-type"
                className="control"
                value={plan.type}
                onChange={(e) => onChange((p) => ({ ...p, type: e.target.value as BusinessType }))}
              >
                {BUSINESS_TYPES.map((b) => (
                  <option key={b} value={b}>
                    {t(`type_${b}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="tool-row no-print">
              {hasSample(plan.type) && (
                <button type="button" className="btn small secondary" onClick={() => setDialog('sample')}>
                  {t('editLoadSample')}
                </button>
              )}
              <button type="button" className="btn small secondary" disabled={!canZeroFill} onClick={() => setDialog('zero')}>
                {t('editZeroFill')}
              </button>
            </div>
            {hasSample(plan.type) && <p className="help">{t('sampleHelp')}</p>}
          </section>

          <section className="card" aria-labelledby="sec-money">
            <h2 id="sec-money">{t('secMoney')}</h2>
            <p className="help section-help">{t('secMoneyHelp')}</p>
            {(['savings', 'reserve'] as StartupKey[]).map(startupField)}
          </section>

          <section className="card" aria-labelledby="sec-startup">
            <h2 id="sec-startup">{t('secStartup')}</h2>
            <p className="help section-help">{t('secStartupHelp')}</p>
            {COST_KEYS.map(startupField)}
            <p className="subtotal">
              <span>{t('subtotalStartup')}</span>
              <strong>
                <Val n={r.totalStartup} />
              </strong>
            </p>
          </section>

          <section className="card" aria-labelledby="sec-monthly">
            <h2 id="sec-monthly">{t('secMonthly')}</h2>
            <p className="help section-help">{t('secMonthlyHelp')}</p>
            {(['sales', 'margin'] as MonthlyKey[]).map((k) => (
              <Field
                key={k}
                id={`m-${k}`}
                label={t(`f_m_${k}`)}
                help={t(`h_m_${k}`)}
                value={plan.monthly[k]}
                onChange={(v) => setMonthly(k, v)}
                unit={k === 'margin' ? '%' : t('currency')}
                placeholder={k === 'margin' ? '0–100' : t('placeholderZero')}
                error={errorFor(r.monthlyParsed[k], k === 'margin')}
              />
            ))}
            <div className="notice">{t('marginNote')}</div>
            <div className="expenses">
              {EXPENSE_KEYS.map((k) => (
                <Field
                  key={k}
                  id={`m-${k}`}
                  label={t(`f_m_${k}`)}
                  help={t(`h_m_${k}`)}
                  value={plan.monthly[k]}
                  onChange={(v) => setMonthly(k, v)}
                  unit={t('currency')}
                  placeholder={t('placeholderZero')}
                  error={errorFor(r.monthlyParsed[k], false)}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="results-panel" aria-labelledby="res-h">
          <Verdict result={r} planName={plan.name.trim() || t('planUnnamed')} />
          <section className="card">
            <h2 id="res-h">{t('resultsTitle')}</h2>
            {missingLabels.length > 0 && (
              <div className="notice warn">{t('resFill', { list: missingLabels.join(', ') })}</div>
            )}
            <ResultRows r={r} />
            <p className="estimate-note">{t('estimateNote')}</p>
          </section>
        </aside>
      </div>

      {dialog === 'sample' && (
        <ConfirmDialog
          title={t('loadSampleTitle')}
          body={t('loadSampleBody')}
          confirmLabel={t('loadSampleConfirm')}
          onCancel={() => setDialog(null)}
          onConfirm={applySample}
        />
      )}
      {dialog === 'zero' && (
        <ConfirmDialog
          title={t('zeroFillTitle')}
          body={t('zeroFillBody')}
          confirmLabel={t('zeroFillConfirm')}
          onCancel={() => setDialog(null)}
          onConfirm={applyZero}
        />
      )}
    </>
  );
}

function ResultRows({ r }: { r: PlanResult }) {
  const { t } = useI18n();
  // Keep these in sync with the formulas in calc.ts.
  const start: { id: string; label: string; help: string; node: ReactNode; key?: boolean }[] = [
    { id: 'totalStartup', label: t('res_totalStartup'), help: t('resHelp_totalStartup'), node: <Val n={r.totalStartup} /> },
    { id: 'moneyNeeded', label: t('res_moneyNeeded'), help: t('resHelp_moneyNeeded'), node: <Val n={r.moneyNeeded} /> },
    { id: 'cashAfterStartup', label: t('res_cashAfterStartup'), help: t('resHelp_cashAfterStartup'), node: <Val n={r.cashAfterStartup} /> },
    { id: 'remaining', label: t('res_remaining'), help: t('resHelp_remaining'), node: <Val n={r.remaining} /> },
    { id: 'shortfall', label: t('res_shortfall'), help: t('resHelp_shortfall'), node: <Val n={r.shortfall} />, key: true },
  ];
  const month: typeof start = [
    { id: 'grossProfit', label: t('res_grossProfit'), help: t('resHelp_grossProfit'), node: <Val n={r.grossProfit} /> },
    { id: 'opex', label: t('res_opex'), help: t('resHelp_opex'), node: <Val n={r.opex} /> },
    { id: 'opProfit', label: t('res_opProfit'), help: t('resHelp_opProfit'), node: <Val n={r.opProfit} />, key: true },
    {
      id: 'breakEven',
      label: t('res_breakEven'),
      help: t('resHelp_breakEven'),
      node:
        r.breakEvenIssue === 'zeroMargin' ? <span className="note">{t('breakEvenZeroMargin')}</span> : <Val n={r.breakEven} />,
    },
    {
      id: 'payback',
      label: t('res_payback'),
      help: t('resHelp_payback'),
      node:
        r.paybackIssue === 'noProfit' ? (
          <span className="note">{t('paybackNoProfit')}</span>
        ) : (
          <Val n={r.paybackMonths} kind="months" />
        ),
    },
  ];
  const group = (title: string, rows: typeof start) => (
    <div className="res-group">
      <h3>{title}</h3>
      {rows.map((row) => (
        <div key={row.id} className={`res-row${row.key ? ' key' : ''}`}>
          <div>
            <div className="res-label">{row.label}</div>
            <div className="res-help">{row.help}</div>
          </div>
          <div className="res-val">{row.node}</div>
        </div>
      ))}
    </div>
  );
  return (
    <>
      {group(t('resGroupStart'), start)}
      {group(t('resGroupMonth'), month)}
    </>
  );
}
