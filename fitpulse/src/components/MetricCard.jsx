import React from 'react';
import ProgressBar from './ProgressBar';

export default function MetricCard({
  title,
  value,
  unit = '',
  icon: Icon,
  accent = 'green',
  badgeText,
  progress,
  targetLabel,
  onClick,
}) {
  const palette = {
    green: {
      iconBg: 'rgba(34, 197, 94, 0.14)',
      iconColor: '#22C55E',
      fill: 'linear-gradient(90deg, #22C55E, #4ADE80)',
      badgeClass: 'fp-badge-green',
    },
    blue: {
      iconBg: 'rgba(56, 189, 248, 0.14)',
      iconColor: '#38BDF8',
      fill: 'linear-gradient(90deg, #0284C7, #38BDF8)',
      badgeClass: 'fp-badge-blue',
    },
    amber: {
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#F59E0B',
      fill: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
      badgeClass: 'fp-badge-amber',
    },
    purple: {
      iconBg: 'rgba(168, 85, 247, 0.15)',
      iconColor: '#A855F7',
      fill: 'linear-gradient(90deg, #A855F7, #EC4899)',
      badgeClass: 'fp-badge-blue',
    },
  }[accent] || {
    iconBg: 'rgba(34, 197, 94, 0.14)',
    iconColor: '#22C55E',
    fill: 'linear-gradient(90deg, #22C55E, #38BDF8)',
    badgeClass: 'fp-badge-green',
  };

  return (
    <article
      className="fp-card fp-card-hover fp-metric-card"
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="fp-metric-top">
        <div
          className="fp-metric-icon"
          style={{ background: palette.iconBg, color: palette.iconColor }}
          aria-hidden="true"
        >
          {Icon && <Icon size={21} />}
        </div>
        {badgeText && <span className={`fp-badge ${palette.badgeClass}`}>{badgeText}</span>}
      </div>

      <div>
        <div className="fp-metric-label">{title}</div>
        <div className="fp-metric-value">
          {value}
          {unit && (
            <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.28rem' }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {typeof progress === 'number' && (
        <ProgressBar
          value={progress}
          max={100}
          label={targetLabel}
          fill={palette.fill}
          height={8}
        />
      )}
    </article>
  );
}
