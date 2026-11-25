import React, { useEffect, useRef } from 'react';

export default function ProgressRing({
  value = 0,
  max = 100,
  size = 132,
  thickness = 12,
  label = 'Daily goal completion',
  sublabel = 'Daily Goal',
  fillColor,
}) {
  const progressRef = useRef(null);
  const safeMax = Math.max(1, Number(max) || 100);
  const pct = Math.min(100, Math.max(0, Math.round(((Number(value) || 0) / safeMax) * 100)));
  const activeColor = fillColor || (pct >= 100 ? '#22C55E' : pct >= 60 ? '#38BDF8' : '#22C55E');

  // Fallback for browsers without CSS attr(value type(<number>))
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return undefined;
    const supportsAttrNumber =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('width: attr(value type(<number>))');

    if (supportsAttrNumber) return undefined;

    const syncValue = () => {
      el.style.setProperty('--value', String(el.getAttribute('value') ?? pct));
    };
    syncValue();

    const observer = new MutationObserver(syncValue);
    observer.observe(el, { attributes: true, attributeFilter: ['value'] });
    return () => observer.disconnect();
  }, [pct]);

  return (
    <div className="fp-progress-ring-wrapper">
      <progress
        ref={progressRef}
        className="fp-progress-ring"
        value={pct}
        max={100}
        aria-label={label}
        aria-valuetext={`${pct}% ${sublabel}`}
        style={{
          '--size': `${size}px`,
          '--thickness': `${thickness}px`,
          '--fill-color': activeColor,
          '--value': pct,
        }}
      />
      <div className="fp-progress-ring-content" aria-hidden="true">
        <span
          className="tabular-nums"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: `${Math.round(size * 0.22)}px`,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          {pct}%
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {sublabel}
        </span>
      </div>
    </div>
  );
}
