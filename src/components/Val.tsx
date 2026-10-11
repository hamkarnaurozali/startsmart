import { useI18n } from '../i18n';

/** Shows an amount, or a dash when it cannot be calculated yet. Never shows a fake 0. */
export function Val({ n, kind = 'money' }: { n: number | null; kind?: 'money' | 'months' }) {
  const { money, num, t } = useI18n();
  if (n === null) {
    return (
      <span className="na" aria-label={t('notReady')} title={t('notReady')}>
        —
      </span>
    );
  }
  const text = kind === 'months' ? t('monthsUnit', { n: num(n, 1) }) : money(n);
  return <span className={n < 0 ? 'neg' : undefined}>{text}</span>;
}
