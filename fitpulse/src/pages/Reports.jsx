import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Download,
  Flame,
  Footprints,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { useFitness } from '../context/FitnessContext';
import {
  addDaysISO,
  computeDailySummary,
  formatShortDate,
  WORKOUT_CATEGORIES,
} from '../utils/calculations';

function ReportTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="fp-chart-tooltip">
      <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ color: entry.color || '#22C55E', fontWeight: 600 }}>
          {entry.name}: {Number(entry.value).toLocaleString()}
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const { state, todayISO, weeklySeries, monthlySeries, addToast } = useFitness();
  const [rangeDays, setRangeDays] = useState(30);

  const rangeSeries = useMemo(
    () => monthlySeries.slice(-rangeDays),
    [monthlySeries, rangeDays]
  );

  // Aggregate summary KPIs over selected range
  const summaryStats = useMemo(() => {
    const count = Math.max(1, rangeSeries.length);
    const totalSteps = rangeSeries.reduce((s, d) => s + d.steps, 0);
    const totalBurn = rangeSeries.reduce((s, d) => s + d.caloriesBurned, 0);
    const avgCompletion = Math.round(
      rangeSeries.reduce((s, d) => s + d.goalCompletionPct, 0) / count
    );
    return {
      avgSteps: Math.round(totalSteps / count),
      totalBurn,
      avgCompletion,
      totalWorkouts: state.workouts.filter((w) => w.date >= addDaysISO(todayISO, -(rangeDays - 1))).length,
    };
  }, [rangeSeries, state.workouts, todayISO, rangeDays]);

  // Step count comparison: Current 7 days vs Previous 7 days
  const stepComparisonData = useMemo(() => {
    return Array.from({ length: 7 }, (_, idx) => {
      const thisDate = addDaysISO(todayISO, idx - 6);
      const prevDate = addDaysISO(todayISO, idx - 13);
      const thisSum = computeDailySummary(thisDate, state);
      const prevSum = computeDailySummary(prevDate, state);
      const dt = new Date(`${thisDate}T12:00:00`);
      return {
        day: dt.toLocaleDateString('en-US', { weekday: 'short' }),
        thisWeek: thisSum.steps,
        lastWeek: prevSum.steps,
      };
    });
  }, [state, todayISO]);

  // Workout frequency by category + weekly count
  const workoutCategoryData = useMemo(() => {
    const map = {};
    state.workouts.forEach((w) => {
      map[w.category] = (map[w.category] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({
      name,
      count,
      color: WORKOUT_CATEGORIES[name]?.color || '#22C55E',
    }));
  }, [state.workouts]);

  const weeklyWorkoutFrequency = useMemo(() => {
    const weeks = [
      { label: '3 Wks Ago', start: addDaysISO(todayISO, -27), end: addDaysISO(todayISO, -21) },
      { label: '2 Wks Ago', start: addDaysISO(todayISO, -20), end: addDaysISO(todayISO, -14) },
      { label: 'Last Week', start: addDaysISO(todayISO, -13), end: addDaysISO(todayISO, -7) },
      { label: 'This Week', start: addDaysISO(todayISO, -6), end: todayISO },
    ];
    return weeks.map((wk) => ({
      week: wk.label,
      sessions: state.workouts.filter((w) => w.date >= wk.start && w.date <= wk.end).length,
      minutes: state.workouts
        .filter((w) => w.date >= wk.start && w.date <= wk.end)
        .reduce((s, w) => s + (Number(w.durationMin) || 0), 0),
    }));
  }, [state.workouts, todayISO]);

  const weightChartData = useMemo(
    () =>
      state.weightLogs.map((w) => ({
        dateLabel: formatShortDate(w.date),
        weightKg: w.weightKg,
      })),
    [state.weightLogs]
  );

  const handleExportReport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      rangeDays,
      summaryStats,
      weeklySeries,
      workoutCategoryData,
      weightLogs: state.weightLogs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitpulse-analytics-${todayISO}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast({
      title: 'Analytics report exported',
      message: `Downloaded ${rangeDays}-day performance summary as JSON.`,
      type: 'success',
    });
  };

  return (
    <div className="fp-page">
      {/* Range Toolbar */}
      <div className="fp-card" style={{ padding: '1rem 1.25rem' }}>
        <div className="fp-toolbar">
          <div>
            <h2 className="fp-card-title">Performance Analytics & Reports</h2>
            <p className="fp-card-subtitle">
              Interactive reports computed live from your stored activity, nutrition, and workout history
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="fp-pill-group">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`fp-pill-btn ${rangeDays === d ? 'is-active' : ''}`}
                  onClick={() => setRangeDays(d)}
                >
                  {d} Days
                </button>
              ))}
            </div>
            <button type="button" className="fp-btn fp-btn-ghost fp-btn-sm" onClick={handleExportReport}>
              <Download size={15} aria-hidden="true" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <section className="fp-grid-4" aria-label="Analytics highlights">
        <MetricCard
          title={`Avg Daily Steps (${rangeDays}d)`}
          value={summaryStats.avgSteps.toLocaleString()}
          icon={Footprints}
          accent="green"
          badgeText="Daily Avg"
        />
        <MetricCard
          title={`Total Active Burn (${rangeDays}d)`}
          value={summaryStats.totalBurn.toLocaleString()}
          unit="kcal"
          icon={Flame}
          accent="amber"
          badgeText="Energy"
        />
        <MetricCard
          title={`Workouts Logged (${rangeDays}d)`}
          value={summaryStats.totalWorkouts}
          unit="sessions"
          icon={BarChart3}
          accent="blue"
          badgeText="Frequency"
        />
        <MetricCard
          title="Avg Goal Completion"
          value={`${summaryStats.avgCompletion}%`}
          icon={Target}
          accent="purple"
          badgeText={`${rangeDays}d Avg`}
          progress={summaryStats.avgCompletion}
        />
      </section>

      {/* Row 1: Weekly Activity Report + Monthly Calorie Trends */}
      <div className="fp-grid-2">
        <section className="fp-card" aria-label="Weekly activity report">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Weekly Activity Report</h2>
              <p className="fp-card-subtitle">Daily steps & active minutes over the past 7 days</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 265 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ReportTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="steps" name="Steps" fill="#22C55E" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="fp-card" aria-label="Monthly calorie trends">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Calorie Trends ({rangeDays} Days)</h2>
              <p className="fp-card-subtitle">Calorie intake vs active calorie burn</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 265 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rangeSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="repIntakeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="repBurnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={18} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ReportTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="caloriesConsumed" name="Intake (kcal)" stroke="#38BDF8" strokeWidth={2.2} fill="url(#repIntakeGrad)" />
                <Area type="monotone" dataKey="caloriesBurned" name="Active Burn (kcal)" stroke="#22C55E" strokeWidth={2.4} fill="url(#repBurnGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Row 2: Step Count Comparison + Workout Frequency */}
      <div className="fp-grid-2">
        <section className="fp-card" aria-label="Step count comparison">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Step Count Comparison</h2>
              <p className="fp-card-subtitle">This week vs. previous week day-by-day</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 265 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepComparisonData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ReportTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="thisWeek" name="This Week" fill="#22C55E" radius={[6, 6, 0, 0]} maxBarSize={20} />
                <Bar dataKey="lastWeek" name="Last Week" fill="#64748B" radius={[6, 6, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="fp-card" aria-label="Workout frequency and category mix">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Workout Frequency & Mix</h2>
              <p className="fp-card-subtitle">Sessions per week and breakdown by workout type</p>
            </div>
          </div>
          <div className="fp-grid-2" style={{ alignItems: 'center' }}>
            <div style={{ width: '100%', height: 245 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyWorkoutFrequency} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ReportTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                  <Bar dataKey="sessions" name="Workouts" fill="#38BDF8" radius={[7, 7, 2, 2]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ width: '100%', height: 245 }}>
              {workoutCategoryData.length === 0 ? (
                <div className="fp-empty" style={{ height: '100%' }}>
                  <span>No workouts recorded yet</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workoutCategoryData}
                      dataKey="count"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={74}
                      paddingAngle={3}
                    >
                      {workoutCategoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ReportTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Row 3: Weight Progress + Goal Completion % */}
      <div className="fp-grid-2">
        <section className="fp-card" aria-label="Weight progress chart">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Weight Progress</h2>
              <p className="fp-card-subtitle">
                Trajectory relative to your {state.profile.targetWeight} kg goal line
              </p>
            </div>
            <span className="fp-badge fp-badge-green">
              <TrendingUp size={13} aria-hidden="true" />
              Goal {state.profile.targetWeight} kg
            </span>
          </div>
          <div style={{ width: '100%', height: 255 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="dateLabel" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 1.5', 'dataMax + 1.5']} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ReportTooltip />} />
                <ReferenceLine
                  y={state.profile.targetWeight}
                  stroke="#38BDF8"
                  strokeDasharray="5 5"
                  label={{ value: 'Target', fill: '#38BDF8', fontSize: 11, position: 'right' }}
                />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  name="Weight (kg)"
                  stroke="#22C55E"
                  strokeWidth={2.8}
                  dot={{ r: 4, fill: '#22C55E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="fp-card" aria-label="Daily goal completion percentage">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Goal Completion Percentage</h2>
              <p className="fp-card-subtitle">Daily overall goal score (%) across the past week</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 255 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySeries} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ReportTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <ReferenceLine y={100} stroke="#22C55E" strokeDasharray="4 4" />
                <Bar dataKey="goalCompletionPct" name="Completion (%)" fill="#A855F7" radius={[8, 8, 2, 2]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
