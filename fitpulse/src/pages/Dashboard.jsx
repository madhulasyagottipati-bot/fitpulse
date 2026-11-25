import React, { useState } from 'react';
import {
  ArrowRight,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  MapPin,
  Play,
  Plus,
  Quote,
  RefreshCw,
  Sparkles,
  Timer,
  Utensils,
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
import ActivityChart from '../components/ActivityChart';
import HeroIllustration from '../components/HeroIllustration';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import ProgressRing from '../components/ProgressRing';
import WorkoutCard from '../components/WorkoutCard';
import { useFitness } from '../context/FitnessContext';
import {
  computeMotivationalMessage,
  formatDisplayDate,
  formatDurationMinutes,
  getGreeting,
} from '../utils/calculations';
import { MOTIVATIONAL_QUOTES } from '../utils/sampleData';

function CalorieBalanceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="fp-chart-tooltip">
      <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ color: entry.color, fontWeight: 600 }}>
          {entry.name}: {Number(entry.value).toLocaleString()} kcal
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const {
    state,
    todayISO,
    todaySummary,
    streakDays,
    weeklySeries,
    setActivePage,
    setQuickModal,
    addWater,
    requestConfirm,
    deleteWorkout,
  } = useFitness();

  const [quoteIdx, setQuoteIdx] = useState(0);
  const { profile, goals, workouts } = state;
  const recentWorkouts = workouts.slice(0, 3);
  const motivationalMsg = computeMotivationalMessage(
    todaySummary.goalCompletionPct,
    streakDays,
    profile.name
  );
  const activeQuote = MOTIVATIONAL_QUOTES[quoteIdx % MOTIVATIONAL_QUOTES.length];

  return (
    <div className="fp-page">
      {/* Hero Banner */}
      <section className="fp-hero" aria-label="Daily overview">
        <div className="fp-hero-content">
          <div className="fp-hero-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            <span>{formatDisplayDate(todayISO)}</span>
            <span>•</span>
            <span>{streakDays}-Day Streak</span>
          </div>

          <h2 className="fp-hero-title">{getGreeting(profile.name)}</h2>
          <p className="fp-hero-message">{motivationalMsg}</p>

          <div className="fp-quick-actions">
            <button
              type="button"
              className="fp-btn fp-btn-primary"
              onClick={() => setActivePage('workouts')}
            >
              <Play size={16} fill="currentColor" aria-hidden="true" />
              <span>{state.activeWorkout.isRunning ? 'Resume Live Workout' : 'Start Workout'}</span>
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-secondary"
              onClick={() => setQuickModal('steps')}
            >
              <Footprints size={16} aria-hidden="true" />
              <span>Log Steps</span>
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-ghost"
              onClick={() => setQuickModal('meal')}
            >
              <Utensils size={16} aria-hidden="true" />
              <span>Log Meal</span>
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-ghost"
              onClick={() => addWater(250)}
            >
              <Droplets size={16} color="#38BDF8" aria-hidden="true" />
              <span>+250 ml Water</span>
            </button>
          </div>
        </div>

        <HeroIllustration />

        <div className="fp-hero-ring-box">
          <ProgressRing
            value={todaySummary.goalCompletionPct}
            max={100}
            size={136}
            thickness={12}
            label="Overall daily goal completion"
            sublabel="Daily Goal"
          />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            {todaySummary.workoutsCount} workout{todaySummary.workoutsCount === 1 ? '' : 's'} today
          </div>
        </div>
      </section>

      {/* Four Core Metric Cards */}
      <section className="fp-grid-4" aria-label="Daily fitness metrics">
        <MetricCard
          title="Steps Today"
          value={todaySummary.steps.toLocaleString()}
          icon={Footprints}
          accent="green"
          badgeText={`Goal ${(goals.dailySteps / 1000).toFixed(1)}k`}
          progress={todaySummary.subProgress.steps}
          targetLabel={`${todaySummary.steps.toLocaleString()} / ${goals.dailySteps.toLocaleString()}`}
          onClick={() => setActivePage('activity')}
        />
        <MetricCard
          title="Calories Burned"
          value={todaySummary.caloriesBurned.toLocaleString()}
          unit="kcal"
          icon={Flame}
          accent="amber"
          badgeText={`Target ${goals.dailyCaloriesBurn}`}
          progress={todaySummary.subProgress.caloriesBurned}
          targetLabel={`${todaySummary.caloriesBurned} / ${goals.dailyCaloriesBurn} kcal`}
          onClick={() => setActivePage('workouts')}
        />
        <MetricCard
          title="Distance Covered"
          value={todaySummary.distanceKm.toFixed(1)}
          unit="km"
          icon={MapPin}
          accent="blue"
          badgeText={`${todaySummary.activitiesCount + todaySummary.workoutsCount} sessions`}
          progress={Math.min(100, Math.round((todaySummary.distanceKm / 8) * 100))}
          targetLabel={`${todaySummary.distanceKm.toFixed(1)} / 8.0 km daily pace`}
          onClick={() => setActivePage('activity')}
        />
        <MetricCard
          title="Active Duration"
          value={formatDurationMinutes(todaySummary.activeMinutes)}
          icon={Timer}
          accent="purple"
          badgeText={`Goal ${goals.dailyWorkoutMinutes}m`}
          progress={todaySummary.subProgress.activeMinutes}
          targetLabel={`${todaySummary.activeMinutes} / ${goals.dailyWorkoutMinutes} min`}
          onClick={() => setActivePage('workouts')}
        />
      </section>

      {/* Charts Row */}
      <div className="fp-grid-2">
        <ActivityChart
          data={weeklySeries}
          title="Weekly Activity & Output"
          subtitle="Switch between Steps, Calories Burned, and Active Minutes"
        />

        <section className="fp-card" aria-label="Calorie intake versus calorie burn">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Calorie Intake vs. Active Burn</h2>
              <p className="fp-card-subtitle">
                Today: {todaySummary.caloriesConsumed.toLocaleString()} kcal in vs{' '}
                {todaySummary.caloriesBurned.toLocaleString()} kcal active burn
              </p>
            </div>
            <button
              type="button"
              className="fp-btn fp-btn-ghost fp-btn-sm"
              onClick={() => setActivePage('nutrition')}
            >
              <span>Nutrition</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div style={{ width: '100%', height: 270 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySeries} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CalorieBalanceTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                <Bar
                  dataKey="caloriesConsumed"
                  name="Intake (kcal)"
                  fill="#38BDF8"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="caloriesBurned"
                  name="Active Burn (kcal)"
                  fill="#22C55E"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Bottom Row: Recent Workouts + Daily Goal Breakdown + Quote */}
      <div className="fp-grid-sidebar">
        <section className="fp-card" aria-label="Recent workouts">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Recent Workout History</h2>
              <p className="fp-card-subtitle">Your latest logged training sessions</p>
            </div>
            <button
              type="button"
              className="fp-btn fp-btn-ghost fp-btn-sm"
              onClick={() => setActivePage('workouts')}
            >
              <span>All Workouts</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>

          {recentWorkouts.length === 0 ? (
            <div className="fp-empty">
              <Dumbbell size={30} color="var(--text-muted)" aria-hidden="true" />
              <strong>No workouts logged yet</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                Start the live workout timer or log a completed session to see it here.
              </p>
              <button
                type="button"
                className="fp-btn fp-btn-primary fp-btn-sm"
                onClick={() => setActivePage('workouts')}
              >
                <Plus size={15} />
                <span>Start First Workout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  compact
                  onViewDetails={() => setActivePage('workouts')}
                  onDelete={(item) =>
                    requestConfirm({
                      title: 'Delete Workout?',
                      message: `Remove "${item.title}" (${item.durationMin} min, ${item.caloriesBurned} kcal) from your history?`,
                      confirmLabel: 'Delete Workout',
                      onConfirm: () => deleteWorkout(item.id),
                    })
                  }
                />
              ))}
            </div>
          )}
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <section className="fp-card" aria-label="Daily fitness goal progress">
            <div className="fp-card-header">
              <div>
                <h2 className="fp-card-title">Daily Goal Breakdown</h2>
                <p className="fp-card-subtitle">Live progress across all targets</p>
              </div>
              <button
                type="button"
                className="fp-btn fp-btn-ghost fp-btn-sm"
                onClick={() => setActivePage('goals')}
              >
                Edit Goals
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <ProgressBar
                value={todaySummary.steps}
                max={goals.dailySteps}
                label={`Steps (${todaySummary.steps.toLocaleString()} / ${goals.dailySteps.toLocaleString()})`}
                fill="linear-gradient(90deg, #22C55E, #4ADE80)"
              />
              <ProgressBar
                value={todaySummary.caloriesBurned}
                max={goals.dailyCaloriesBurn}
                label={`Active Burn (${todaySummary.caloriesBurned} / ${goals.dailyCaloriesBurn} kcal)`}
                fill="linear-gradient(90deg, #F59E0B, #FBBF24)"
              />
              <ProgressBar
                value={todaySummary.activeMinutes}
                max={goals.dailyWorkoutMinutes}
                label={`Active Minutes (${todaySummary.activeMinutes} / ${goals.dailyWorkoutMinutes} min)`}
                fill="linear-gradient(90deg, #A855F7, #EC4899)"
              />
              <ProgressBar
                value={todaySummary.waterMl}
                max={goals.dailyWaterMl}
                label={`Hydration (${todaySummary.waterMl.toLocaleString()} / ${goals.dailyWaterMl.toLocaleString()} ml)`}
                fill="linear-gradient(90deg, #0284C7, #38BDF8)"
              />
              <ProgressBar
                value={todaySummary.caloriesConsumed}
                max={goals.dailyCaloriesIntake}
                label={`Calorie Intake (${todaySummary.caloriesConsumed.toLocaleString()} / ${goals.dailyCaloriesIntake.toLocaleString()} kcal)`}
                fill="linear-gradient(90deg, #38BDF8, #22C55E)"
              />
            </div>
          </section>

          <section
            className="fp-card"
            style={{
              background:
                'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(34, 197, 94, 0.08)), var(--bg-card)',
            }}
            aria-label="Motivational fitness quote"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span className="fp-badge fp-badge-blue">
                <Quote size={13} aria-hidden="true" />
                Daily Inspiration
              </span>
              <button
                type="button"
                className="fp-btn fp-btn-ghost fp-btn-sm"
                onClick={() => setQuoteIdx((i) => i + 1)}
                aria-label="Show next motivational quote"
              >
                <RefreshCw size={13} aria-hidden="true" />
                <span>Next</span>
              </button>
            </div>
            <blockquote style={{ margin: 0, fontSize: '0.96rem', fontWeight: 600, lineHeight: 1.5 }}>
              “{activeQuote.quote}”
            </blockquote>
            <div style={{ marginTop: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              — {activeQuote.author}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
