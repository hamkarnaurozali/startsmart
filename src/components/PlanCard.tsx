import { computePlan } from '../calc';
import { useI18n } from '../i18n';
import type { Plan } from '../types';
import { Val } from './Val';

interface Props {
  plan: Plan;
  checked: boolean;
  checkDisabled: boolean;
  onToggle: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function PlanCard({ plan, checked, checkDisabled, onToggle, onRename, onDuplicate, onDelete }: Props) {
  const { t, date } = useI18n();
  const r = computePlan(plan);
  const name = plan.name.trim() || t('planUnnamed');
  return (
    <li className="card plan-card">
      <div className="plan-card-head">
        <div>
          <h3>{name}</h3>
          <p className="muted">
            {t(`type_${plan.type}`)} · {t('planUpdated', { date: date(plan.updatedAt) })}
          </p>
        </div>
        <span className={`badge${r.complete ? '' : ' warn'}`}>{r.complete ? t('planComplete') : t('planIncomplete')}</span>
      </div>
      <dl className="mini-stats">
        <div>
          <dt>{t('cardStartup')}</dt>
          <dd>
            <Val n={r.totalStartup} />
          </dd>
        </div>
        <div>
          <dt>{t('cardRemaining')}</dt>
          <dd>
            <Val n={r.remaining} />
          </dd>
        </div>
        <div>
          <dt>{t('cardProfit')}</dt>
          <dd>
            <Val n={r.opProfit} />
          </dd>
        </div>
      </dl>
      <div className="card-actions no-print">
        <a className="btn small" href={`#/plan/${encodeURIComponent(plan.id)}`}>
          {t('open')}
        </a>
        <button type="button" className="btn small secondary" onClick={onRename}>
          {t('rename')}
        </button>
        <button type="button" className="btn small secondary" onClick={onDuplicate}>
          {t('duplicate')}
        </button>
        <button type="button" className="btn small ghost-danger" onClick={onDelete}>
          {t('delete')}
        </button>
      </div>
      <label className="check no-print">
        <input type="checkbox" checked={checked} disabled={checkDisabled} onChange={onToggle} />
        <span>{t('planCompareCheck')}</span>
      </label>
    </li>
  );
}
