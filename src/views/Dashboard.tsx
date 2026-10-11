import { useMemo, useState } from 'react';
import { computePlan, okValue } from '../calc';
import { BarChart, type Bar } from '../components/BarChart';
import { Val } from '../components/Val';
import { Verdict } from '../components/Verdict';
import { plansToCsv, downloadCsv } from '../csv';
import { useI18n } from '../i18n';
import type { Plan } from '../types';

interface Props {
  plans: Plan[];
  onNew: () => void;
}

export function Dashboard({ plans, onNew }: Props) {
  const { t, money } = useI18n();
  const latest = useMemo(() => [...plans].sort((a, b) => b.updatedAt - a.updatedAt), [plans]);
  const [selectedId, setSelectedId] = useState<string>('');
  const plan = latest.find((p) => p.id === selectedId) ?? latest[0];
  const r = useMemo(() => (plan ? computePlan(plan) : null), [plan]);

  if (!plan || !r) {
    return (
      <>
        <h1>{t('dashTitle')}</h1>
        <div className="card empty">
          <h2>{t('dashNoPlansTitle')}</h2>
          <p>{t('dashNoPlansBody')}</p>
          <button type="button" className="btn" onClick={onNew}>
            {t('dashFirstPlan')}
          </button>
        </div>
      </>
    );
  }

  const savings = okValue(r.startupParsed.savings);
  const sales = okValue(r.monthlyParsed.sales);
  const reserve = okValue(r.startupParsed.reserve);

  const moneyBars: Bar[] | null =
    savings !== null && r.totalStartup !== null && reserve !== null && r.moneyNeeded !== null
      ? [
          { label: t('barStartup'), value: r.totalStartup, tone: 'slate' },
          { label: t('barReserve'), value: reserve, tone: 'muted' },
          { label: t('barNeeded'), value: r.moneyNeeded, tone: 'slate' },
          { label: t('barSavings'), value: savings, tone: 'brand' },
        ]
      : null;

  const monthBars: Bar[] | null =
    sales !== null && r.cogs !== null && r.grossProfit !== null && r.opex !== null && r.opProfit !== null
      ? [
          { label: t('barSales'), value: sales, tone: 'slate' },
          { label: t('barCogs'), value: r.cogs, tone: 'muted' },
          { label: t('barGross'), value: r.grossProfit, tone: 'brand' },
          { label: t('barOpex'), value: r.opex, tone: 'muted' },
          { label: t('barOpProfit'), value: r.opProfit, tone: r.opProfit < 0 ? 'bad' : 'brand' },
        ]
      : null;

  return (
    <>
      <div className="page-head">
        <h1>{t('dashTitle')}</h1>
        <div className="head-actions no-print">
          <button type="button" className="btn small secondary" onClick={() => window.print()}>
            {t('printBtn')}
          </button>
          <button
            type="button"
            className="btn small secondary"
            onClick={() => downloadCsv('startsmart-plans.csv', plansToCsv(plans))}
          >
            {t('csvBtn')}
          </button>
        </div>
      </div>

      {plans.length > 1 && (
        <div className="field picker no-print">
          <label htmlFor="dash-plan">{t('dashPlanShown')}</label>
          <select id="dash-plan" className="control" value={plan.id} onChange={(e) => setSelectedId(e.target.value)}>
            {latest.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.trim() || t('planUnnamed')}
              </option>
            ))}
          </select>
        </div>
      )}

      <Verdict result={r} planName={plan.name.trim() || t('planUnnamed')} />
      <p className="estimate-note">{t('estimateNote')}</p>

      {!r.complete && (
        <div className="notice warn">
          <p>{t('dashIncomplete')}</p>
          <p className="notice-action no-print">
            <a className="btn small" href={`#/plan/${encodeURIComponent(plan.id)}`}>
              {t('dashFillIn')}
            </a>
          </p>
        </div>
      )}

      <section className="tiles" aria-label={t('dashTitle')}>
        <div className="tile">
          <span className="label">{t('statPlans')}</span>
          <span className="value">{plans.length}</span>
        </div>
        <div className="tile">
          <span className="label">{t('statStartup')}</span>
          <span className="value">
            <Val n={r.totalStartup} />
          </span>
        </div>
        <div className="tile">
          <span className="label">{t('statSavings')}</span>
          <span className="value">
            <Val n={savings} />
          </span>
        </div>
        <div className="tile">
          <span className="label">{t('statShortfall')}</span>
          <span className="value">
            <Val n={r.shortfall} />
          </span>
        </div>
        <div className="tile">
          <span className="label">{t('statProfit')}</span>
          <span className="value">
            <Val n={r.opProfit} />
          </span>
        </div>
      </section>

      <div className="two-col">
        <section className="card">
          {moneyBars ? (
            <BarChart title={t('chartMoneyTitle')} bars={moneyBars} format={money} />
          ) : (
            <>
              <h2 className="chart-title">{t('chartMoneyTitle')}</h2>
              <p className="muted">{t('chartNeedsData')}</p>
            </>
          )}
        </section>
        <section className="card">
          {monthBars ? (
            <BarChart title={t('chartMonthTitle')} bars={monthBars} format={money} />
          ) : (
            <>
              <h2 className="chart-title">{t('chartMonthTitle')}</h2>
              <p className="muted">{t('chartNeedsData')}</p>
            </>
          )}
        </section>
      </div>

      <section className="card no-print" aria-labelledby="dash-list">
        <h2 id="dash-list">{t('dashPlansList')}</h2>
        <ul className="plain-list">
          {latest.slice(0, 5).map((p) => {
            const pr = computePlan(p);
            return (
              <li key={p.id}>
                <a href={`#/plan/${encodeURIComponent(p.id)}`}>{p.name.trim() || t('planUnnamed')}</a>
                <span className="muted">{t(`type_${p.type}`)}</span>
                <span className={`badge${pr.complete ? '' : ' warn'}`}>
                  {pr.complete ? t('planComplete') : t('planIncomplete')}
                </span>
              </li>
            );
          })}
        </ul>
        <p>
          <a className="btn small secondary" href="#/plans">
            {t('seeAll')}
          </a>
        </p>
      </section>
    </>
  );
}
