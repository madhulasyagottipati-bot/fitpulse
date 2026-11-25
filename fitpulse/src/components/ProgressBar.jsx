import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercent = true,
  fill = 'linear-gradient(90deg, #22C55E, #38BDF8)',
  height = 9,
  ariaLabel,
}) {
  const safeMax = Math.max(1, Number(max) || 100);
  const safeVal = Math.max(0, Number(value) || 0);
  const clampedForBar = Math.min(safeMax, safeVal);
  const pct = Math.round((safeVal / safeMax) * 100);

  return (
    <div className="fp-progress-wrap">
      {(label || showPercent) && (
        <div className="fp-progress-label-row">
          <span>{label}</span>
          {showPercent && <span className="tabular-nums" style={{ fontWeight: 600 }}>{pct}%</span>}
        </div>
      )}
      <progress
        className="fp-progress"
        value={clampedForBar}
        max={safeMax}
        aria-label={ariaLabel || label || 'Goal progress'}
        aria-valuetext={`${pct}% (${safeVal} of ${safeMax})`}
        style={{
          '--progress-fill': fill,
          '--progress-height': `${height}px`,
        }}
      />
    </div>
  );
}
