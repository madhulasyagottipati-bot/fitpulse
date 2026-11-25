import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const METRICS = [
  { key: 'steps', label: 'Steps', unit: 'steps', color: '#22C55E', type: 'bar' },
  { key: 'caloriesBurned', label: 'Burned', unit: 'kcal', color: '#38BDF8', type: 'area' },
  { key: 'activeMinutes', label: 'Duration', unit: 'min', color: '#A855F7', type: 'bar' },
];

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="fp-chart-tooltip">
      <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ color: item.color, fontWeight: 600 }}>
        {Number(item.value).toLocaleString()} {unit}
      </div>
    </div>
  );
}

export default function ActivityChart({
  data = [],
  title = 'Weekly Activity',
  subtitle = '7-day movement and energy output',
  defaultMetric = 'steps',
  height = 270,
}) {
  const [metricKey, setMetricKey] = useState(defaultMetric);
  const current = METRICS.find((m) => m.key === metricKey) || METRICS[0];

  return (
    <section className="fp-card" aria-label={title}>
      <div className="fp-card-header">
        <div>
          <h2 className="fp-card-title">{title}</h2>
          <p className="fp-card-subtitle">{subtitle}</p>
        </div>
        <div className="fp-pill-group" role="tablist" aria-label="Chart metric selector">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={metricKey === m.key}
              className={`fp-pill-btn ${metricKey === m.key ? 'is-active' : ''}`}
              onClick={() => setMetricKey(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {current.type === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="fpActAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={current.color} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={current.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip unit={current.unit} />} />
              <Area
                type="monotone"
                dataKey={current.key}
                stroke={current.color}
                strokeWidth={2.7}
                fill="url(#fpActAreaGrad)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip unit={current.unit} />} cursor={{ fill: 'var(--bg-hover)' }} />
              <Bar dataKey={current.key} fill={current.color} radius={[8, 8, 2, 2]} maxBarSize={38} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
