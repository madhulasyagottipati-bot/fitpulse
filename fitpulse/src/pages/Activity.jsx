import React, { useMemo, useState } from 'react';
import {
  Activity as ActivityIcon,
  AlertCircle,
  Footprints,
  MapPin,
  Plus,
  Search,
  Timer,
  Trash2,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { useFitness } from '../context/FitnessContext';
import {
  ACTIVITY_TYPES,
  estimateWorkoutCalories,
  estimateWorkoutSteps,
  formatShortDate,
} from '../utils/calculations';

function WeeklyActivityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="fp-chart-tooltip">
      <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {Number(p.value).toLocaleString()}
        </div>
      ))}
    </div>
  );
}

export default function Activity() {
  const {
    state,
    todayISO,
    todaySummary,
    weeklySeries,
    addSteps,
    addActivity,
    deleteActivity,
    requestConfirm,
  } = useFitness();

  // Manual step entry form state
  const [stepAmount, setStepAmount] = useState('1000');
  const [stepDate, setStepDate] = useState(todayISO);
  const [stepMode, setStepMode] = useState('add');
  const [stepError, setStepError] = useState('');

  // Activity session form state
  const [type, setType] = useState('Running');
  const [title, setTitle] = useState('');
  const [distanceKm, setDistanceKm] = useState('3.5');
  const [durationMin, setDurationMin] = useState('25');
  const [date, setDate] = useState(todayISO);
  const [notes, setNotes] = useState('');
  const [actError, setActError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const estimatedPreviewCals = estimateWorkoutCalories(
    type,
    Number(durationMin) || 0,
    state.profile.weight
  );
  const estimatedPreviewSteps = estimateWorkoutSteps(
    type,
    Number(durationMin) || 0,
    Number(distanceKm) || 0
  );

  const weeklyTotals = useMemo(() => {
    return weeklySeries.reduce(
      (acc, d) => ({
        steps: acc.steps + d.steps,
        distanceKm: Number((acc.distanceKm + d.distanceKm).toFixed(1)),
        activeMinutes: acc.activeMinutes + d.activeMinutes,
      }),
      { steps: 0, distanceKm: 0, activeMinutes: 0 }
    );
  }, [weeklySeries]);

  const filteredActivities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.activities
      .filter((a) => (filterType === 'All' ? true : a.type === filterType))
      .filter(
        (a) =>
          !q ||
          a.title.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          (a.notes || '').toLowerCase().includes(q)
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.activities, filterType, searchQuery]);

  const handleStepsSubmit = (e) => {
    e.preventDefault();
    const val = Number(stepAmount);
    if (!Number.isFinite(val) || val < 0 || val > 150000 || (stepMode === 'add' && val <= 0)) {
      setStepError(
        stepMode === 'add'
          ? 'Enter a step amount between 1 and 150,000.'
          : 'Enter a valid daily base step count between 0 and 150,000.'
      );
      return;
    }
    setStepError('');
    addSteps(val, stepDate, stepMode);
  };

  const handleActivitySubmit = (e) => {
    e.preventDefault();
    const dur = Number(durationMin);
    const dist = Number(distanceKm);
    if (!Number.isFinite(dur) || dur <= 0 || dur > 720) {
      setActError('Duration must be between 1 and 720 minutes.');
      return;
    }
    if (!Number.isFinite(dist) || dist < 0 || dist > 300) {
      setActError('Distance must be between 0 and 300 km.');
      return;
    }
    setActError('');
    addActivity({
      type,
      title: title.trim() || `${type} Activity`,
      distanceKm: dist,
      durationMin: dur,
      date,
      notes,
    });
    setTitle('');
    setNotes('');
  };

  return (
    <div className="fp-page">
      {/* Daily & Weekly Summary Cards */}
      <section className="fp-grid-4" aria-label="Daily and weekly activity summary">
        <MetricCard
          title="Today’s Steps"
          value={todaySummary.steps.toLocaleString()}
          icon={Footprints}
          accent="green"
          badgeText="Today"
          progress={todaySummary.subProgress.steps}
          targetLabel={`Goal ${state.goals.dailySteps.toLocaleString()}`}
        />
        <MetricCard
          title="Today’s Distance"
          value={todaySummary.distanceKm.toFixed(2)}
          unit="km"
          icon={MapPin}
          accent="blue"
          badgeText={`${todaySummary.activitiesCount} logs`}
        />
        <MetricCard
          title="Weekly Total Steps"
          value={weeklyTotals.steps.toLocaleString()}
          icon={ActivityIcon}
          accent="green"
          badgeText="7 Days"
        />
        <MetricCard
          title="Weekly Distance"
          value={weeklyTotals.distanceKm.toFixed(1)}
          unit="km"
          icon={Timer}
          accent="purple"
          badgeText={`${weeklyTotals.activeMinutes} active min`}
        />
      </section>

      {/* Manual Steps + Log Activity Forms */}
      <div className="fp-grid-2">
        {/* Manual Step Tracker */}
        <section className="fp-card" aria-label="Manual step counter">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Daily Step Check-in</h2>
              <p className="fp-card-subtitle">
                Add steps instantly or adjust passive step count manually
              </p>
            </div>
            <span className="fp-badge fp-badge-green">
              {todaySummary.steps.toLocaleString()} today
            </span>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div className="fp-hint" style={{ marginBottom: '0.45rem' }}>
              Quick-add to today:
            </div>
            <div className="fp-pill-group">
              {[500, 1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="fp-btn fp-btn-ghost fp-btn-sm"
                  onClick={() => addSteps(amt, todayISO, 'add')}
                >
                  <Plus size={14} aria-hidden="true" />
                  <span>{amt.toLocaleString()} steps</span>
                </button>
              ))}
            </div>
          </div>

          <form className="fp-form" onSubmit={handleStepsSubmit} noValidate>
            <div className="fp-form-row">
              <div className="fp-field">
                <label htmlFor="manual-step-count" className="fp-label">
                  Step Count
                </label>
                <input
                  id="manual-step-count"
                  type="number"
                  min={stepMode === 'add' ? 1 : 0}
                  max="150000"
                  required
                  className="fp-input"
                  value={stepAmount}
                  aria-invalid={stepError ? 'true' : 'false'}
                  onChange={(e) => {
                    setStepAmount(e.target.value);
                    if (stepError) setStepError('');
                  }}
                />
              </div>
              <div className="fp-field">
                <label htmlFor="manual-step-mode" className="fp-label">
                  Action Mode
                </label>
                <select
                  id="manual-step-mode"
                  className="fp-select"
                  value={stepMode}
                  onChange={(e) => setStepMode(e.target.value)}
                >
                  <option value="add">Add to existing steps</option>
                  <option value="set">Set base passive steps</option>
                </select>
              </div>
            </div>

            <div className="fp-field">
              <label htmlFor="manual-step-date" className="fp-label">
                Date
              </label>
              <input
                id="manual-step-date"
                type="date"
                max={todayISO}
                className="fp-input"
                value={stepDate}
                onChange={(e) => setStepDate(e.target.value)}
              />
            </div>

            {stepError && (
              <div className="fp-error-msg">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{stepError}</span>
              </div>
            )}

            <button type="submit" className="fp-btn fp-btn-primary">
              <Footprints size={16} aria-hidden="true" />
              <span>{stepMode === 'add' ? 'Add Steps' : 'Update Base Steps'}</span>
            </button>
          </form>
        </section>

        {/* Walking / Running / Movement Activity Logger */}
        <section className="fp-card" aria-label="Log walking or running activity">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Log Movement Activity</h2>
              <p className="fp-card-subtitle">
                Record walking, running, or outdoor distance sessions
              </p>
            </div>
            <span className="fp-badge fp-badge-blue">
              Est. {estimatedPreviewCals} kcal • {estimatedPreviewSteps.toLocaleString()} steps
            </span>
          </div>

          <form className="fp-form" onSubmit={handleActivitySubmit} noValidate>
            <div className="fp-form-row">
              <div className="fp-field">
                <label htmlFor="act-type" className="fp-label">
                  Activity Type
                </label>
                <select
                  id="act-type"
                  className="fp-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {Object.keys(ACTIVITY_TYPES).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fp-field">
                <label htmlFor="act-date" className="fp-label">
                  Date
                </label>
                <input
                  id="act-date"
                  type="date"
                  max={todayISO}
                  className="fp-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="fp-field">
              <label htmlFor="act-title" className="fp-label">
                Activity Label <span className="fp-hint">(optional)</span>
              </label>
              <input
                id="act-title"
                type="text"
                placeholder={`e.g., Sunset ${type} Loop`}
                className="fp-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="fp-form-row">
              <div className="fp-field">
                <label htmlFor="act-distance" className="fp-label">
                  Distance (km)
                </label>
                <input
                  id="act-distance"
                  type="number"
                  step="0.1"
                  min="0"
                  max="300"
                  required
                  className="fp-input"
                  value={distanceKm}
                  onChange={(e) => {
                    setDistanceKm(e.target.value);
                    if (actError) setActError('');
                  }}
                />
              </div>
              <div className="fp-field">
                <label htmlFor="act-duration" className="fp-label">
                  Duration (min)
                </label>
                <input
                  id="act-duration"
                  type="number"
                  min="1"
                  max="720"
                  required
                  className="fp-input"
                  value={durationMin}
                  onChange={(e) => {
                    setDurationMin(e.target.value);
                    if (actError) setActError('');
                  }}
                />
              </div>
            </div>

            <div className="fp-field">
              <label htmlFor="act-notes" className="fp-label">
                Notes <span className="fp-hint">(optional)</span>
              </label>
              <input
                id="act-notes"
                type="text"
                placeholder="Route conditions, pace feel, terrain..."
                className="fp-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {actError && (
              <div className="fp-error-msg">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{actError}</span>
              </div>
            )}

            <button type="submit" className="fp-btn fp-btn-secondary">
              <Plus size={16} aria-hidden="true" />
              <span>Save Activity Session</span>
            </button>
          </form>
        </section>
      </div>

      {/* Weekly Chart + Activity History */}
      <div className="fp-grid-2">
        <section className="fp-card" aria-label="Weekly steps and active minutes chart">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Weekly Activity Summary</h2>
              <p className="fp-card-subtitle">7-day steps and active duration overview</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<WeeklyActivityTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="steps" name="Steps" fill="#22C55E" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="fp-card" aria-label="Activity history log">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Logged Activities ({filteredActivities.length})</h2>
              <p className="fp-card-subtitle">Search or filter your walking and running entries</p>
            </div>
          </div>

          <search style={{ marginBottom: '1rem' }}>
            <div className="fp-toolbar">
              <div className="fp-search-box">
                <Search size={16} className="fp-search-icon" aria-hidden="true" />
                <input
                  type="search"
                  className="fp-input fp-search-input"
                  placeholder="Search activities..."
                  aria-label="Search logged activities"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="fp-select"
                style={{ width: 'auto', minWidth: 145 }}
                aria-label="Filter by activity type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All Types</option>
                {Object.keys(ACTIVITY_TYPES).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </search>

          {filteredActivities.length === 0 ? (
            <div className="fp-empty">
              <Footprints size={28} color="var(--text-muted)" aria-hidden="true" />
              <strong>No matching activities</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                Try clearing your filter or log a new walking/running session above.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: 340, overflowY: 'auto' }}>
              {filteredActivities.map((item) => (
                <div key={item.id} className="fp-workout-item">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.92rem' }}>{item.title}</strong>
                      <span className="fp-badge fp-badge-blue">{item.type}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {formatShortDate(item.date)} • {item.distanceKm} km • {item.durationMin} min
                      {item.steps > 0 ? ` • ${item.steps.toLocaleString()} steps` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#22C55E' }}>
                      {item.caloriesBurned} kcal
                    </span>
                    <button
                      type="button"
                      className="fp-btn fp-btn-danger fp-btn-sm"
                      aria-label={`Delete ${item.title}`}
                      onClick={() =>
                        requestConfirm({
                          title: 'Delete Activity?',
                          message: `Remove "${item.title}" (${item.distanceKm} km, ${item.caloriesBurned} kcal)?`,
                          confirmLabel: 'Delete Activity',
                          onConfirm: () => deleteActivity(item.id),
                        })
                      }
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
