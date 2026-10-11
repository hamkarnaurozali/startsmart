import { useState } from 'react';
import { ConfirmDialog } from '../components/Modal';
import { PlanCard } from '../components/PlanCard';
import { RenameDialog } from '../components/PlanDialogs';
import { useI18n } from '../i18n';
import { go } from '../route';
import type { Plan } from '../types';

interface Props {
  plans: Plan[];
  compareIds: string[];
  maxCompare: number;
  onToggleCompare: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

type Dialog = { kind: 'rename'; id: string } | { kind: 'delete'; id: string } | null;

export function Plans({ plans, compareIds, maxCompare, onToggleCompare, onNew, onRename, onDuplicate, onDelete }: Props) {
  const { t } = useI18n();
  const [dialog, setDialog] = useState<Dialog>(null);
  const target = dialog ? plans.find((p) => p.id === dialog.id) : undefined;
  const atMax = compareIds.length >= maxCompare;

  return (
    <>
      <div className="page-head">
        <h1>{t('plansTitle')}</h1>
        <button type="button" className="btn no-print" onClick={onNew}>
          {t('plansNew')}
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="card empty">
          <h2>{t('plansEmptyTitle')}</h2>
          <p>{t('plansEmptyBody')}</p>
          <button type="button" className="btn" onClick={onNew}>
            {t('plansNew')}
          </button>
        </div>
      ) : (
        <>
          {plans.length > 1 && (
            <div className="compare-bar no-print">
              <p className="muted">{atMax ? t('planCompareMax') : t('plansCompareHint')}</p>
              <button
                type="button"
                className="btn"
                disabled={compareIds.length < 2}
                onClick={() => go('/compare')}
              >
                {t('plansCompareBtn', { n: compareIds.length })}
              </button>
            </div>
          )}
          <ul className="plan-grid">
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                checked={compareIds.includes(p.id)}
                checkDisabled={atMax && !compareIds.includes(p.id)}
                onToggle={() => onToggleCompare(p.id)}
                onRename={() => setDialog({ kind: 'rename', id: p.id })}
                onDuplicate={() => onDuplicate(p.id)}
                onDelete={() => setDialog({ kind: 'delete', id: p.id })}
              />
            ))}
          </ul>
        </>
      )}

      {dialog?.kind === 'rename' && target && (
        <RenameDialog
          current={target.name}
          onClose={() => setDialog(null)}
          onSave={(name) => {
            onRename(target.id, name);
            setDialog(null);
          }}
        />
      )}
      {dialog?.kind === 'delete' && target && (
        <ConfirmDialog
          danger
          title={t('deleteTitle')}
          body={t('deleteBody', { name: target.name.trim() || t('planUnnamed') })}
          confirmLabel={t('deleteConfirm')}
          cancelLabel={t('deleteKeep')}
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            onDelete(target.id);
            setDialog(null);
          }}
        />
      )}
    </>
  );
}
