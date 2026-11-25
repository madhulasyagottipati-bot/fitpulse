import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

export default function ConfirmDialog() {
  const { confirmState, closeConfirm } = useFitness();
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (confirmState && !dialog.open) {
      dialog.showModal();
    } else if (!confirmState && dialog.open) {
      dialog.close();
    }
    return undefined;
  }, [confirmState]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    dialog.setAttribute('closedby', 'any');
    const handleClose = () => {
      const value = dialog.returnValue;
      dialog.returnValue = '';
      if (value === 'confirm' && confirmState?.onConfirm) {
        confirmState.onConfirm();
      }
      closeConfirm();
    };

    dialog.addEventListener('close', handleClose);

    // Fallback for browsers without native `closedby="any"` (e.g. Safari)
    let cleanupFallback;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const onDown = (e) => {
        pressedOutside = isOutside(e);
      };
      const onUp = (e) => {
        if (pressedOutside && isOutside(e) && dialog.open) {
          dialog.close('');
        }
        pressedOutside = false;
      };
      dialog.addEventListener('pointerdown', onDown);
      dialog.addEventListener('pointerup', onUp);
      cleanupFallback = () => {
        dialog.removeEventListener('pointerdown', onDown);
        dialog.removeEventListener('pointerup', onUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      cleanupFallback?.();
    };
  }, [confirmState, closeConfirm]);

  return (
    <dialog
      ref={dialogRef}
      className="fp-modal"
      aria-labelledby="fp-confirm-title"
    >
      <div className="fp-modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            className="fp-metric-icon"
            style={{
              width: 38,
              height: 38,
              background: confirmState?.tone === 'danger' ? 'var(--danger-soft)' : 'var(--warning-soft)',
              color: confirmState?.tone === 'danger' ? 'var(--danger)' : 'var(--warning)',
            }}
            aria-hidden="true"
          >
            <AlertTriangle size={19} />
          </div>
          <h1 id="fp-confirm-title" style={{ fontSize: '1.12rem', fontWeight: 700 }}>
            {confirmState?.title || 'Confirm Action'}
          </h1>
        </div>
        <button
          type="button"
          className="fp-collapse-btn"
          aria-label="Close dialog"
          onClick={() => dialogRef.current?.close('cancel')}
        >
          <X size={17} />
        </button>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.55 }}>
        {confirmState?.message}
      </p>

      <form method="dialog" className="fp-modal-actions">
        <button
          type="submit"
          value="cancel"
          className="fp-btn fp-btn-ghost"
          autoFocus
        >
          {confirmState?.cancelLabel || 'Cancel'}
        </button>
        <button
          type="submit"
          value="confirm"
          className={`fp-btn ${
            confirmState?.tone === 'danger' ? 'fp-btn-danger-solid' : 'fp-btn-primary'
          }`}
        >
          {confirmState?.confirmLabel || 'Confirm'}
        </button>
      </form>
    </dialog>
  );
}
