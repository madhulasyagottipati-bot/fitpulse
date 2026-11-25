import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BedDouble,
  Calculator,
  Droplets,
  HeartPulse,
  Info,
  Minus,
  Plus,
  Scale,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import { useFitness } from '../context/FitnessContext';
import { calculateBMI, formatShortDate } from '../utils/calculations';
import { SIMULATED_HOURLY_HR } from '../utils/sampleData';

function HealthTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="fp-chart-tooltip">
      <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value} {unit || ''}
        </div>
      ))}
    </div>
  );
}

export default function HealthMetrics() {
  const {
    state,
    todayISO,
    todaySummary,
    weeklySeries,
    addWater,
    logWeight,
    logSleepHours,
    updateProfile,
  } = useFitness();

  const { profile, goals, weightLogs } = state;

  // Hydration custom input
  const [customWater, setCustomWater] = useState('350');
  const [waterError, setWaterError] = useState('');

  // Weight form
  const [weightInput, setWeightInput] = useState(String(profile.weight));
  const [weightNote, setWeightNote] = useState('');
  const [weightError, setWeightError] = useState('');

  // Sleep override form
  const [sleepInput, setSleepInput] = useState(String(todaySummary.health.sleepHours));
  const [sleepError, setSleepError] = useState('');

  // Interactive BMI calculator state
  const [bmiHeight, setBmiHeight] = useState(String(profile.height));
  const [bmiWeight, setBmiWeight] = useState(String(profile.weight));

  // Weekly trend tab
  const [trendTab, setTrendTab] = useState('sleep');

  const bmiResult = useMemo(
    () => calculateBMI(Number(bmiWeight), Number(bmiHeight)),
    [bmiWeight, bmiHeight]
  );

  const weightChartData = useMemo(
    () =>
      weightLogs.map((w) => ({
        dateLabel: formatShortDate(w.date),
        weightKg: w.weightKg,
      })),
    [weightLogs]
  );

  const weightDelta = useMemo(() => {
    if (weightLogs.length < 2) return 0;
    return Number((weightLogs[weightLogs.length - 1].weightKg - weightLogs[0].weightKg).toFixed(1));
  }, [weightLogs]);

  const handleCustomWaterSubmit = (e) => {
    e.preventDefault();
    const ml = Number(customWater);
    if (!Number.isFinite(ml) || ml <= 0 || ml > 5000) {
      setWaterError('Enter water intake between 1 and 5,000 ml.');
      return;
    }
    setWaterError('');
    addWater(ml, todayISO);
  };

  const handleWeightSubmit = (e) => {
    e.preventDefault();
    const kg = Number(weightInput);
    if (!Number.isFinite(kg) || kg < 25 || kg > 300) {
      setWeightError('Weight must be between 25 and 300 kg.');
      return;
    }
    setWeightError('');
    logWeight(kg, weightNote, todayISO);
    setBmiWeight(String(kg));
    setWeightNote('');
  };

  const handleSleepSubmit = (e) => {
    e.preventDefault();
    const hrs = Number(sleepInput);
    if (!Number.isFinite(hrs) || hrs < 1 || hrs > 16) {
      setSleepError('Sleep duration must be between 1 and 16 hours.');
      return;
    }
    setSleepError('');
    logSleepHours(hrs, todayISO);
  };

  const bmiBadgeClass =
    bmiResult.tone === 'success'
      ? 'fp-badge-green'
      : bmiResult.tone === 'warning'
      ? 'fp-badge-amber'
      : bmiResult.tone === 'danger'
      ? 'fp-badge-danger'
      : 'fp-badge-blue';

  return (
    <div className="fp-page">
      {/* Simulated Metrics Notice */}
      <div
        className="fp-card"
        style={{
          padding: '0.9rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          borderColor: 'rgba(56, 189, 248, 0.35)',
          background: 'var(--secondary-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <Info size={18} color="var(--secondary)" aria-hidden="true" />
          <span style={{ fontSize: '0.86rem' }}>
            <strong>Telemetry Notice:</strong> Heart rate curves and sleep stage breakdowns are{' '}
            <span className="fp-badge fp-badge-blue">Simulated Wearable Metrics</span>, while Hydration,
            Weight logs, Sleep hours, and BMI calculations update live from your inputs.
          </span>
        </div>
      </div>

      {/* Top 4 Health KPI Cards */}
      <section className="fp-grid-4" aria-label="Health vital metrics">
        <MetricCard
          title="Resting Heart Rate"
          value={todaySummary.health.restingHr}
          unit="BPM"
          icon={HeartPulse}
          accent="amber"
          badgeText="Simulated"
          progress={Math.min(100, Math.round((todaySummary.health.avgHr / 160) * 100))}
          targetLabel={`Avg ${todaySummary.health.avgHr} • Peak ${todaySummary.health.maxHr} BPM`}
        />
        <MetricCard
          title="Sleep Duration"
          value={todaySummary.health.sleepHours}
          unit="hrs"
          icon={BedDouble}
          accent="purple"
          badgeText={`Score ${todaySummary.health.sleepQuality}% • Simulated`}
          progress={Math.min(100, Math.round((todaySummary.health.sleepHours / 8) * 100))}
          targetLabel={`Deep ${todaySummary.health.deepSleepHrs}h • REM ${todaySummary.health.remSleepHrs}h`}
        />
        <MetricCard
          title="Water Intake"
          value={(todaySummary.waterMl / 1000).toFixed(2)}
          unit="L"
          icon={Droplets}
          accent="blue"
          badgeText={`${todaySummary.subProgress.waterMl}% of goal`}
          progress={todaySummary.subProgress.waterMl}
          targetLabel={`${todaySummary.waterMl.toLocaleString()} / ${goals.dailyWaterMl.toLocaleString()} ml`}
        />
        <MetricCard
          title="Current Weight"
          value={profile.weight}
          unit="kg"
          icon={Scale}
          accent="green"
          badgeText={`${weightDelta <= 0 ? '' : '+'}${weightDelta} kg (30d)`}
          progress={Math.min(
            100,
            Math.max(0, Math.round((profile.targetWeight / Math.max(1, profile.weight)) * 100))
          )}
          targetLabel={`Target ${profile.targetWeight} kg`}
        />
      </section>

      {/* Interactive Water + Weight + Sleep + BMI */}
      <div className="fp-grid-2">
        {/* Hydration & Sleep Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <section className="fp-card" aria-label="Hydration tracker">
            <div className="fp-card-header">
              <div>
                <h2 className="fp-card-title">Hydration Tracker</h2>
                <p className="fp-card-subtitle">
                  {todaySummary.waterMl.toLocaleString()} ml of {goals.dailyWaterMl.toLocaleString()} ml daily goal
                </p>
              </div>
              <span className="fp-badge fp-badge-blue">
                {Math.max(0, goals.dailyWaterMl - todaySummary.waterMl)} ml left
              </span>
            </div>

            <ProgressBar
              value={todaySummary.waterMl}
              max={goals.dailyWaterMl}
              label="Daily Hydration Progress"
              fill="linear-gradient(90deg, #0284C7, #38BDF8)"
              height={12}
            />

            <div className="fp-pill-group" style={{ marginTop: '1rem' }}>
              <button type="button" className="fp-btn fp-btn-secondary fp-btn-sm" onClick={() => addWater(250)}>
                <Plus size={14} />
                <span>250 ml Glass</span>
              </button>
              <button type="button" className="fp-btn fp-btn-secondary fp-btn-sm" onClick={() => addWater(500)}>
                <Plus size={14} />
                <span>500 ml Bottle</span>
              </button>
              <button type="button" className="fp-btn fp-btn-ghost fp-btn-sm" onClick={() => addWater(750)}>
                <Plus size={14} />
                <span>750 ml Flask</span>
              </button>
              <button
                type="button"
                className="fp-btn fp-btn-ghost fp-btn-sm"
                onClick={() => addWater(-250)}
                aria-label="Subtract 250 ml water"
              >
                <Minus size={14} />
                <span>250 ml</span>
              </button>
            </div>

            <form
              className="fp-form"
              style={{ marginTop: '1rem' }}
              onSubmit={handleCustomWaterSubmit}
              noValidate
            >
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="fp-field" style={{ flex: 1, minWidth: 160 }}>
                  <label htmlFor="custom-water-ml" className="fp-label">
                    Custom Amount (ml)
                  </label>
                  <input
                    id="custom-water-ml"
                    type="number"
                    min="1"
                    max="5000"
                    className="fp-input"
                    value={customWater}
                    onChange={(e) => {
                      setCustomWater(e.target.value);
                      if (waterError) setWaterError('');
                    }}
                  />
                </div>
                <button type="submit" className="fp-btn fp-btn-primary">
                  Add Water
                </button>
              </div>
              {waterError && (
                <div className="fp-error-msg">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{waterError}</span>
                </div>
              )}
            </form>
          </section>

          {/* Log Weight + Log Sleep */}
          <section className="fp-card" aria-label="Weight and sleep check-in">
            <div className="fp-card-header">
              <div>
                <h2 className="fp-card-title">Log Weight & Sleep</h2>
                <p className="fp-card-subtitle">Record body weight or adjust last night’s sleep</p>
              </div>
            </div>

            <div className="fp-grid-2">
              <form className="fp-form" onSubmit={handleWeightSubmit} noValidate>
                <div className="fp-field">
                  <label htmlFor="log-weight-kg" className="fp-label">
                    Body Weight (kg)
                  </label>
                  <input
                    id="log-weight-kg"
                    type="number"
                    step="0.1"
                    min="25"
                    max="300"
                    className="fp-input"
                    value={weightInput}
                    onChange={(e) => {
                      setWeightInput(e.target.value);
                      if (weightError) setWeightError('');
                    }}
                  />
                </div>
                <div className="fp-field">
                  <label htmlFor="log-weight-note" className="fp-label">
                    Note <span className="fp-hint">(optional)</span>
                  </label>
                  <input
                    id="log-weight-note"
                    type="text"
                    placeholder="Morning fasted..."
                    className="fp-input"
                    value={weightNote}
                    onChange={(e) => setWeightNote(e.target.value)}
                  />
                </div>
                {weightError && (
                  <div className="fp-error-msg">
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>{weightError}</span>
                  </div>
                )}
                <button type="submit" className="fp-btn fp-btn-primary">
                  Log Weight
                </button>
              </form>

              <form className="fp-form" onSubmit={handleSleepSubmit} noValidate>
                <div className="fp-field">
                  <label htmlFor="log-sleep-hrs" className="fp-label">
                    Sleep Duration (hrs)
                  </label>
                  <input
                    id="log-sleep-hrs"
                    type="number"
                    step="0.1"
                    min="1"
                    max="16"
                    className="fp-input"
                    value={sleepInput}
                    onChange={(e) => {
                      setSleepInput(e.target.value);
                      if (sleepError) setSleepError('');
                    }}
                  />
                </div>
                <div className="fp-card" style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-elevated)' }}>
                  <div className="fp-hint">Simulated Stage Split</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: '0.2rem' }}>
                    Deep {todaySummary.health.deepSleepHrs}h • REM {todaySummary.health.remSleepHrs}h • Light{' '}
                    {todaySummary.health.lightSleepHrs}h
                  </div>
                </div>
                {sleepError && (
                  <div className="fp-error-msg">
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>{sleepError}</span>
                  </div>
                )}
                <button type="submit" className="fp-btn fp-btn-ghost">
                  Update Sleep
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Interactive BMI Calculator */}
        <section className="fp-card" aria-label="Interactive BMI calculator">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={19} color="#22C55E" aria-hidden="true" />
                Interactive BMI Calculator
              </h2>
              <p className="fp-card-subtitle">
                Experiment with height and weight sliders or sync directly with your profile
              </p>
            </div>
            <button
              type="button"
              className="fp-btn fp-btn-ghost fp-btn-sm"
              onClick={() => {
                setBmiHeight(String(profile.height));
                setBmiWeight(String(profile.weight));
              }}
            >
              Sync Profile
            </button>
          </div>

          <div
            className="fp-card"
            style={{
              background: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1rem',
            }}
          >
            <div>
              <div className="fp-hint">Calculated Body Mass Index</div>
              <div style={{ fontSize: '2.45rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.05 }}>
                {bmiResult.bmi}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`fp-badge ${bmiBadgeClass}`} style={{ fontSize: '0.84rem', padding: '0.32rem 0.8rem' }}>
                {bmiResult.category}
              </span>
              <div className="fp-hint" style={{ marginTop: '0.4rem' }}>
                Healthy range: {bmiResult.healthyMinKg} – {bmiResult.healthyMaxKg} kg
              </div>
            </div>
          </div>

          {/* Visual BMI Spectrum */}
          <div>
            <div className="fp-bmi-scale" aria-hidden="true">
              <div
                className="fp-bmi-marker"
                style={{ left: `${bmiResult.pointerPercent}%` }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.73rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>Under (&lt;18.5)</span>
              <span>Normal (18.5–24.9)</span>
              <span>Over (25–29.9)</span>
              <span>30+</span>
            </div>
          </div>

          <div className="fp-form" style={{ marginTop: '1.25rem' }}>
            <div className="fp-field">
              <label htmlFor="bmi-height" className="fp-label">
                <span>Height (cm)</span>
                <strong className="mono">{bmiHeight} cm</strong>
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  id="bmi-height-range"
                  type="range"
                  min="120"
                  max="230"
                  value={bmiHeight}
                  aria-label="Height slider in centimeters"
                  style={{ flex: 1 }}
                  onChange={(e) => setBmiHeight(e.target.value)}
                />
                <input
                  id="bmi-height"
                  type="number"
                  min="100"
                  max="250"
                  className="fp-input"
                  style={{ width: 92 }}
                  value={bmiHeight}
                  onChange={(e) => setBmiHeight(e.target.value)}
                />
              </div>
            </div>

            <div className="fp-field">
              <label htmlFor="bmi-weight" className="fp-label">
                <span>Weight (kg)</span>
                <strong className="mono">{bmiWeight} kg</strong>
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  id="bmi-weight-range"
                  type="range"
                  min="35"
                  max="180"
                  step="0.5"
                  value={bmiWeight}
                  aria-label="Weight slider in kilograms"
                  style={{ flex: 1 }}
                  onChange={(e) => setBmiWeight(e.target.value)}
                />
                <input
                  id="bmi-weight"
                  type="number"
                  min="25"
                  max="300"
                  step="0.1"
                  className="fp-input"
                  style={{ width: 92 }}
                  value={bmiWeight}
                  onChange={(e) => setBmiWeight(e.target.value)}
                />
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {bmiResult.guidance}
            </p>

            <button
              type="button"
              className="fp-btn fp-btn-primary"
              onClick={() => {
                const h = Number(bmiHeight);
                const w = Number(bmiWeight);
                if (h >= 100 && h <= 250 && w >= 25 && w <= 300) {
                  updateProfile({ height: h, weight: w });
                }
              }}
            >
              Save Height & Weight to Profile
            </button>
          </div>
        </section>
      </div>

      {/* Charts Row: Heart Rate 24h + Weekly Health Trends + Weight History */}
      <div className="fp-grid-2">
        <section className="fp-card" aria-label="Heart rate 24-hour curve">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">24-Hour Heart Rate Curve</h2>
              <p className="fp-card-subtitle">Simulated wearable BPM across rest, cardio & recovery</p>
            </div>
            <span className="fp-badge fp-badge-amber">Simulated Wearable Data</span>
          </div>
          <div style={{ width: '100%', height: 255 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SIMULATED_HOURLY_HR} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="fpHrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.42} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[45, 165]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<HealthTooltip unit="BPM" />} />
                <Area
                  type="monotone"
                  dataKey="bpm"
                  name="Heart Rate"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  fill="url(#fpHrGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="fp-card" aria-label="Weekly health trends">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Weekly Health Trends</h2>
              <p className="fp-card-subtitle">
                {trendTab === 'sleep'
                  ? '7-day sleep duration (Simulated + Logged)'
                  : trendTab === 'hr'
                  ? '7-day resting heart rate (Simulated Wearable)'
                  : '7-day hydration volume (Tracked)'}
              </p>
            </div>
            <div className="fp-pill-group">
              <button
                type="button"
                className={`fp-pill-btn ${trendTab === 'sleep' ? 'is-active' : ''}`}
                onClick={() => setTrendTab('sleep')}
              >
                Sleep
              </button>
              <button
                type="button"
                className={`fp-pill-btn ${trendTab === 'hr' ? 'is-active' : ''}`}
                onClick={() => setTrendTab('hr')}
              >
                Resting HR
              </button>
              <button
                type="button"
                className={`fp-pill-btn ${trendTab === 'water' ? 'is-active' : ''}`}
                onClick={() => setTrendTab('water')}
              >
                Water
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 255 }}>
            <ResponsiveContainer width="100%" height="100%">
              {trendTab === 'sleep' ? (
                <BarChart data={weeklySeries} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<HealthTooltip unit="hrs" />} cursor={{ fill: 'var(--bg-hover)' }} />
                  <Bar dataKey="sleepHours" name="Sleep" fill="#A855F7" radius={[8, 8, 2, 2]} maxBarSize={34} />
                </BarChart>
              ) : trendTab === 'hr' ? (
                <LineChart data={weeklySeries} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[45, 75]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<HealthTooltip unit="BPM" />} />
                  <Line type="monotone" dataKey="restingHr" name="Resting HR" stroke="#F59E0B" strokeWidth={2.8} dot={{ r: 4 }} />
                </LineChart>
              ) : (
                <BarChart data={weeklySeries} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<HealthTooltip unit="ml" />} cursor={{ fill: 'var(--bg-hover)' }} />
                  <Bar dataKey="waterMl" name="Water" fill="#38BDF8" radius={[8, 8, 2, 2]} maxBarSize={34} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Weight History Chart */}
      <section className="fp-card" aria-label="Weight trajectory chart">
        <div className="fp-card-header">
          <div>
            <h2 className="fp-card-title">Weight Tracking History</h2>
            <p className="fp-card-subtitle">
              Logged weigh-ins compared against your {profile.targetWeight} kg target
            </p>
          </div>
          <span className="fp-badge fp-badge-green">{weightLogs.length} check-ins</span>
        </div>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightChartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="dateLabel" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<HealthTooltip unit="kg" />} />
              <Line
                type="monotone"
                dataKey="weightKg"
                name="Weight"
                stroke="#22C55E"
                strokeWidth={3}
                dot={{ r: 4, fill: '#22C55E' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
