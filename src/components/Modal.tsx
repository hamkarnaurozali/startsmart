import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useI18n } from '../i18n';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Native <dialog>: keeps keyboard focus inside and closes with the Esc key. */
export function Modal({ title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-body">
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

interface ConfirmProps {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  cancelLabel?: string;
}

export function ConfirmDialog({ title, body, confirmLabel, cancelLabel, danger, onConfirm, onCancel }: ConfirmProps) {
  const { t } = useI18n();
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="modal-text">{body}</p>
      <div className="modal-actions">
        {/* Cancel comes first so it is the default focus for a risky action. */}
        <button type="button" className="btn secondary" onClick={onCancel}>
          {cancelLabel ?? t('cancel')}
        </button>
        <button type="button" className={`btn ${danger ? 'danger' : ''}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
