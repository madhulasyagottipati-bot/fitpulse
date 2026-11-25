import React, { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
  error: AlertCircle,
};

const COLORS = {
  success: '#22C55E',
  info: '#38BDF8',
  warning: '#F59E0B',
  error: '#EF4444',
};

function ToastItem({ toast, onDismiss }) {
  const toastRef = useRef(null);
  const closeBtnRef = useRef(null);
  const pausedRef = useRef(false);
  const timerRef = useRef(null);
  const Icon = ICONS[toast.type] || CheckCircle2;
  const color = COLORS[toast.type] || '#22C55E';

  const scheduleDismiss = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!pausedRef.current) onDismiss(toast.id);
    }, 4200);
  };

  useEffect(() => {
    const el = toastRef.current;
    const btn = closeBtnRef.current;
    if (!el) return undefined;

    el.setAttribute('popover', 'manual');
    if (btn) {
      btn.setAttribute('popovertarget', toast.id);
      btn.setAttribute('popovertargetaction', 'hide');
    }

    if (typeof el.showPopover === 'function') {
      try {
        if (!el.matches(':popover-open')) {
          el.showPopover();
        }
      } catch {
        el.classList.add(':popover-open');
      }
    } else {
      el.classList.add(':popover-open');
    }

    scheduleDismiss();

    return () => {
      clearTimeout(timerRef.current);
      if (typeof el.hidePopover === 'function') {
        try {
          if (el.matches(':popover-open')) el.hidePopover();
        } catch {
          // Ignore already hidden
        }
      }
    };
  }, [toast.id]);

  return (
    <div
      ref={toastRef}
      id={toast.id}
      className="fp-toast"
      onMouseEnter={() => {
        pausedRef.current = true;
        clearTimeout(timerRef.current);
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
        scheduleDismiss();
      }}
      onFocus={() => {
        pausedRef.current = true;
        clearTimeout(timerRef.current);
      }}
      onBlur={() => {
        pausedRef.current = false;
        scheduleDismiss();
      }}
    >
      <Icon size={20} color={color} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{toast.title}</div>
        {toast.message && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {toast.message}
          </div>
        )}
      </div>
      <button
        ref={closeBtnRef}
        type="button"
        className="fp-collapse-btn"
        style={{ width: 28, height: 28 }}
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, dismissToast, announcement } = useFitness();

  useEffect(() => {
    if (announcement && typeof document.ariaNotify === 'function') {
      try {
        document.ariaNotify(announcement);
      } catch {
        // Fallback live region below handles it
      }
    }
  }, [announcement]);

  return (
    <>
      <p className="visually-hidden">Notification announcements</p>
      <div className="visually-hidden" aria-live="polite">
        {announcement}
      </div>
      <div role="region" aria-label="Notifications" className="fp-toast-region">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </>
  );
}
