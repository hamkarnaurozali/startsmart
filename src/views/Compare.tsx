import { useMemo, type ReactNode } from 'react';
import { computePlan, okValue, type PlanResult } from '../calc';
import { BarChart } from '../components/BarChart';
import { Val } from '../components/Val';
import { useI18n } from '../i18n';
import type { Plan } from '../types';

export function Compare({ plans }: { plans: Plan[] }) {
  const { t, money } = useI18n();
  const results = useMemo(() => plans.map((p) => computePlan(p)), [plans]);

  if (plans.length < 2) {
    return (
      <>
        <h1>{t('compareTitle')}</h1>
        <div className="card empty">
          <h2>{t('compareEmptyTitle')}</h2>
          <p>{t('compareEmptyBody')}</p>
          <a className="btn" href="#/plans">
            {t('compareGo')}
          </a>
        </div>
      </>
    );
  }

  const nm = (p: Plan) => p.name.trim() || t('planUnnamed');
  const rows: { label: string; cell: (p: Plan, r: PlanResult) => ReactNode }[] = [
    { label: t('compareRowType'), cell: (p) => t(`type_${p.type}`) },
    {
      label: t('compareRowStatus'),
      cell: (_p, r) => (r.complete ? t('planComplete') : t('planIncomplete')),
    },
    { label: t('f_s_savings'), cell: (_p, r) => <Val n={okValue(r.startupParsed.savings)} /> },
    { label: t('f_s_reserve'), cell: (_p, r) => <Val n={okValue(r.startupParsed.reserve)} /> },
    { label: t('res_totalStartup'), cell: (_p, r) => <Val n={r.totalStartup} /> },
    { label: t('res_remaining'), cell: (_p, r) => <Val n={r.remaining} /> },
    { label: t('res_shortfall'), cell: (_p, r) => <Val n={r.shortfall} /> },
    { label: t('res_grossProfit'), cell: (_p, r) => <Val n={r.grossProfit} /> },
    { label: t('res_opex'), cell: (_p, r) => <Val n={r.opex} /> },
    { label: t('res_opProfit'), cell: (_p, r) => <Val n={r.opProfit} /> },
    {
      label: t('res_breakEven'),
      cell: (_p, r) => (r.breakEvenIssue === 'zeroMargin' ? t('breakEvenZeroMargin') : <Val n={r.breakEven} />),
    },
    {
      label: t('res_payback'),
      cell: (_p, r) => (r.paybackIssue === 'noProfit' ? t('paybackNoProfit') : <Val n={r.paybackMonths} kind="months" />),
    },
  ];

  const startupBars = plans.flatMap((p, i) =>
    results[i].totalStartup === null ? [] : [{ label: nm(p), value: results[i].totalStartup as number, tone: 'slate' as const }],
  );
  const profitBars = plans.flatMap((p, i) => {
    const v = results[i].opProfit;
    return v === null ? [] : [{ label: nm(p), value: v, tone: v < 0 ? ('bad' as const) : ('brand' as const) }];
  });

  return (
    <>
      <div className="page-head">
        <h1>{t('compareTitle')}</h1>
        <button type="button" className="btn small secondary no-print" onClick={() => window.print()}>
          {t('printBtn')}
        </button>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <td />
              {plans.map((p) => (
                <th key={p.id} scope="col">
                  {nm(p)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {plans.map((p, i) => (
                  <td key={p.id}>{row.cell(p, results[i])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="two-col">
        {startupBars.length > 0 && (
          <section className="card">
            <BarChart title={t('compareChartStartup')} bars={startupBars} format={money} />
          </section>
        )}
        {profitBars.length > 0 && (
          <section className="card">
            <BarChart title={t('compareChartProfit')} bars={profitBars} format={money} />
          </section>
        )}
      </div>
      <p className="estimate-note">{t('estimateNote')}</p>
    </>
  );
}
