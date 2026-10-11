import type { PlanResult } from '../calc';
import { useI18n } from '../i18n';

type Tone = 'ok' | 'warn' | 'bad' | 'unknown';
const ICON: Record<Tone, string> = { ok: '✓', warn: '!', bad: '✕', unknown: '?' };

export function Verdict({ result, planName }: { result: PlanResult; planName: string }) {
  const { t, money } = useI18n();

  let moneyTone: Tone = 'unknown';
  let moneyText = t('verdictMoneyUnknown');
  if (result.moneyStatus === 'enough') {
    moneyTone = 'ok';
    moneyText = t('verdictMoneyOk');
  } else if (result.moneyStatus === 'short' && result.shortfall !== null) {
    moneyTone = 'bad';
    moneyText = t('verdictMoneyShort', { amount: money(result.shortfall) });
  }

  let monthTone: Tone = 'unknown';
  let monthText = t('verdictMonthUnknown');
  if (result.opProfit !== null) {
    if (result.monthStatus === 'profit') {
      monthTone = 'ok';
      monthText = t('verdictMonthProfit', { amount: money(result.opProfit) });
    } else if (result.monthStatus === 'breakeven') {
      monthTone = 'warn';
      monthText = t('verdictMonthBreak');
    } else {
      monthTone = 'bad';
      monthText = t('verdictMonthLoss', { amount: money(-result.opProfit) });
    }
  }

  const rows: { label: string; tone: Tone; text: string }[] = [
    { label: t('verdictMoneyLabel'), tone: moneyTone, text: moneyText },
    { label: t('verdictMonthLabel'), tone: monthTone, text: monthText },
  ];

  return (
    <section className="verdict" aria-labelledby="verdict-h">
      <p className="verdict-plan">{planName}</p>
      <h2 id="verdict-h">{t('verdictTitle')}</h2>
      <ul>
        {rows.map((r) => (
          <li key={r.label}>
            <span className={`chip chip-${r.tone}`} aria-hidden="true">
              {ICON[r.tone]}
            </span>
            <div>
              <strong>{r.label}</strong>
              <p>{r.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
