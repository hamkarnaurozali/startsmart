import { useState, type FormEvent } from 'react';
import { useI18n } from '../i18n';
import { hasSample } from '../templates';
import { BUSINESS_TYPES, type BusinessType } from '../types';
import { Modal } from './Modal';

export function NewPlanDialog({
  onCreate,
  onClose,
}: {
  onCreate: (name: string, type: BusinessType, sample: boolean) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [type, setType] = useState<BusinessType>('grocery');
  const [name, setName] = useState(t('type_grocery'));
  const [touched, setTouched] = useState(false);
  const [sample, setSample] = useState(true);
  const [error, setError] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('planNameRequired'));
      return;
    }
    onCreate(trimmed, type, sample && hasSample(type));
  }

  return (
    <Modal title={t('newPlanTitle')} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="np-type">{t('businessTypeLabel')}</label>
          <select
            id="np-type"
            className="control"
            value={type}
            onChange={(e) => {
              const next = e.target.value as BusinessType;
              setType(next);
              if (!touched) setName(t(`type_${next}`));
            }}
          >
            {BUSINESS_TYPES.map((b) => (
              <option key={b} value={b}>
                {t(`type_${b}`)}
              </option>
            ))}
          </select>
        </div>
        <div className={`field${error ? ' has-error' : ''}`}>
          <label htmlFor="np-name">{t('planNameLabel')}</label>
          <p className="help" id="np-name-h">
            {t('planNameHelp')}
          </p>
          <input
            id="np-name"
            className="control"
            value={name}
            maxLength={80}
            aria-describedby={error ? 'np-name-h np-name-e' : 'np-name-h'}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              setName(e.target.value);
              setTouched(true);
              setError('');
            }}
          />
          {error && (
            <p id="np-name-e" className="error" aria-live="polite">
              {error}
            </p>
          )}
        </div>
        {hasSample(type) && (
          <div className="field">
            <label className="check">
              <input type="checkbox" checked={sample} onChange={(e) => setSample(e.target.checked)} />
              <span>{t('sampleCheckbox')}</span>
            </label>
            <p className="help">{t('sampleHelp')}</p>
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn">
            {t('createPlan')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function RenameDialog({
  current,
  onSave,
  onClose,
}: {
  current: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(current);
  const [error, setError] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('planNameRequired'));
      return;
    }
    onSave(trimmed);
  }

  return (
    <Modal title={t('renameTitle')} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className={`field${error ? ' has-error' : ''}`}>
          <label htmlFor="rn-name">{t('planNameLabel')}</label>
          <input
            id="rn-name"
            className="control"
            value={name}
            maxLength={80}
            aria-describedby={error ? 'rn-name-e' : undefined}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
          />
          {error && (
            <p id="rn-name-e" className="error" aria-live="polite">
              {error}
            </p>
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn secondary" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn">
            {t('renameSave')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
