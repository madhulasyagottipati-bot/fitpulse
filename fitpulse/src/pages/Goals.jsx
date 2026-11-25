import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  Lock,
  MapPin,
  RotateCcw,
  Target,
  Trophy,
  Utensils,
  Zap,
} from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import ProgressRing from '../components/ProgressRing';
import { useFitness } from '../context/FitnessContext';
import { addDaysISO } from '../utils/calculations';

const BADGE_ICONS = {
  dumbbell: Dumbbell,
  footprints: Footprints,
  flame: Flame,
  trophy: Trophy,
  droplets: Droplets,
  zap: Zap,
  utensils: Utensils,
  'map-pin': MapPin,
};

export default function Goals() {
  const {
    state,
    todayISO,
    todaySummary,
    achievements,
    updateGoals,
  } = useFitness();

  const { goals, workouts } = state;

  const [form, setForm] = useState({
    dailySteps: String(goals.dailySteps),
    dailyCaloriesBurn: String(goals.dailyCaloriesBurn),
    dailyCaloriesIntake: String(goals.dailyCaloriesIntake),
    dailyWorkoutMinutes: String(goals.dailyWorkoutMinutes),
    dailyWaterMl: String(goals.dailyWaterMl),
    weeklyWorkouts: String(goals.weeklyWorkouts),
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm({
      dailySteps: String(goals.dailySteps),
      dailyCaloriesBurn: String(goals.dailyCaloriesBurn),
      dailyCaloriesIntake: String(goals.dailyCaloriesIntake),
      dailyWorkoutMinutes: String(goals.dailyWorkoutMinutes),
      dailyWaterMl: String(goals.dailyWaterMl),
      weeklyWorkouts: String(goals.weeklyWorkouts),
    });
  }, [goals]);
  const [badgeFilter, setBadgeFilter] = useState('all');

  const workoutsThisWeek = useMemo(() => {
    const startISO = addDaysISO(todayISO, -6);
    return workouts.filter((w) => w.date >= startISO && w.date <= todayISO).length;
  }, [workouts, todayISO]);

  const unlockedCount = achievements.filter((b) => b.unlocked).length;

  const filteredBadges = useMemo(() => {
    if (badgeFilter === 'unlocked') return achievements.filter((b) => b.unlocked);
    if (badgeFilter === 'locked') return achievements.filter((b) => !b.unlocked);
    return achievements;
  }, [achievements, badgeFilter]);

  const handleSaveGoals = (e) => {
    e.preventDefault();
    const steps = Number(form.dailySteps);
    const burn = Number(form.dailyCaloriesBurn);
    const intake = Number(form.dailyCaloriesIntake);
    const mins = Number(form.dailyWorkoutMinutes);
    const water = Number(form.dailyWaterMl);
    const weekly = Number(form.weeklyWorkouts);

    if (steps < 500 || steps > 100000) {
      setFormError('Daily step goal must be between 500 and 100,000 steps.');
      return;
    }
    if (burn < 100 || burn > 5000 || intake < 800 || intake > 8000) {
      setFormError('Calorie goals must be realistic (Burn: 100–5,000, Intake: 800–8,000 kcal).');
      return;
    }
    if (mins < 10 || mins > 480 || water < 500 || water > 10000 || weekly < 1 || weekly > 14) {
      setFormError('Check workout duration (10–480 min), water (500–10,000 ml), and weekly workouts (1–14).');
      return;
    }
    setFormError('');
    updateGoals({
      dailySteps: steps,
      dailyCaloriesBurn: burn,
      dailyCaloriesIntake: intake,
      dailyWorkoutMinutes: mins,
      dailyWaterMl: water,
      weeklyWorkouts: weekly,
    });
  };

  const handleResetRecommended = () => {
    const defaults = {
      dailySteps: '10000',
      dailyCaloriesBurn: '600',
      dailyCaloriesIntake: '2200',
      dailyWorkoutMinutes: '60',
      dailyWaterMl: '3000',
      weeklyWorkouts: '5',
    };
    setForm(defaults);
    setFormError('');
    updateGoals(defaults);
  };

  const goalCards = [
    {
      label: 'Daily Step Goal',
      current: todaySummary.steps,
      target: goals.dailySteps,
      unit: 'steps',
      fill: 'linear-gradient(90deg, #22C55E, #4ADE80)',
    },
    {
      label: 'Daily Active Burn Goal',
      current: todaySummary.caloriesBurned,
      target: goals.dailyCaloriesBurn,
      unit: 'kcal',
      fill: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
    },
    {
      label: 'Workout Duration Goal',
      current: todaySummary.activeMinutes,
      target: goals.dailyWorkoutMinutes,
      unit: 'min',
      fill: 'linear-gradient(90deg, #A855F7, #EC4899)',
    },
    {
      label: 'Water Intake Goal',
      current: todaySummary.waterMl,
      target: goals.dailyWaterMl,
      unit: 'ml',
      fill: 'linear-gradient(90deg, #0284C7, #38BDF8)',
    },
    {
      label: 'Weekly Workout Goal',
      current: workoutsThisWeek,
      target: goals.weeklyWorkouts,
      unit: 'workouts',
      fill: 'linear-gradient(90deg, #22C55E, #38BDF8)',
    },
    {
      label: 'Daily Calorie Intake Target',
      current: todaySummary.caloriesConsumed,
      target: goals.dailyCaloriesIntake,
      unit: 'kcal',
      fill: 'linear-gradient(90deg, #38BDF8, #22C55E)',
    },
  ];

  return (
    <div className="fp-page">
      {/* Goal Editor + Live Progress Overview */}
      <div className="fp-grid-form-layout">
        <section className="fp-card" aria-label="Configure fitness goals">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={19} color="#22C55E" aria-hidden="true" />
                Set Your Fitness Targets
              </h2>
              <p className="fp-card-subtitle">All rings and progress bars update immediately</p>
            </div>
          </div>

          <form className="fp-form" onSubmit={handleSaveGoals} noValidate>
            <div className="fp-field">
              <label htmlFor="goal-steps" className="fp-label">
                Daily Step Goal
              </label>
              <input
                id="goal-steps"
                type="number"
                min="500"
                max="100000"
                required
                className="fp-input"
                value={form.dailySteps}
                onChange={(e) => setForm((f) => ({ ...f, dailySteps: e.target.value }))}
              />
            </div>

            <div className="fp-form-row">
              <div className="fp-field">
                <label htmlFor="goal-burn" className="fp-label">
                  Calorie Burn Goal (kcal)
                </label>
                <input
                  id="goal-burn"
                  type="number"
                  min="100"
                  max="5000"
                  required
                  className="fp-input"
                  value={form.dailyCaloriesBurn}
                  onChange={(e) => setForm((f) => ({ ...f, dailyCaloriesBurn: e.target.value }))}
                />
              </div>

              <div className="fp-field">
                <label htmlFor="goal-intake" className="fp-label">
                  Calorie Intake Target
                </label>
                <input
                  id="goal-intake"
                  type="number"
                  min="800"
                  max="8000"
                  required
                  className="fp-input"
                  value={form.dailyCaloriesIntake}
                  onChange={(e) => setForm((f) => ({ ...f, dailyCaloriesIntake: e.target.value }))}
                />
              </div>
            </div>

            <div className="fp-form-row">
              <div className="fp-field">
                <label htmlFor="goal-mins" className="fp-label">
                  Workout Duration (min)
                </label>
                <input
                  id="goal-mins"
                  type="number"
                  min="10"
                  max="480"
                  required
                  className="fp-input"
                  value={form.dailyWorkoutMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, dailyWorkoutMinutes: e.target.value }))}
                />
              </div>

              <div className="fp-field">
                <label htmlFor="goal-water" className="fp-label">
                  Water Intake Goal (ml)
                </label>
                <input
                  id="goal-water"
                  type="number"
                  min="500"
                  max="10000"
                  step="50"
                  required
                  className="fp-input"
                  value={form.dailyWaterMl}
                  onChange={(e) => setForm((f) => ({ ...f, dailyWaterMl: e.target.value }))}
                />
              </div>
            </div>

            <div className="fp-field">
              <label htmlFor="goal-weekly-wrk" className="fp-label">
                Weekly Workout Goal (sessions/week)
              </label>
              <input
                id="goal-weekly-wrk"
                type="number"
                min="1"
                max="14"
                required
                className="fp-input"
                value={form.weeklyWorkouts}
                onChange={(e) => setForm((f) => ({ ...f, weeklyWorkouts: e.target.value }))}
              />
            </div>

            {formError && (
              <div className="fp-error-msg">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button type="submit" className="fp-btn fp-btn-primary" style={{ flex: 1 }}>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Save Goals</span>
              </button>
              <button
                type="button"
                className="fp-btn fp-btn-ghost"
                onClick={handleResetRecommended}
                title="Reset to recommended defaults"
              >
                <RotateCcw size={15} aria-hidden="true" />
                <span>Defaults</span>
              </button>
            </div>
          </form>
        </section>

        {/* Progress Toward Each Goal */}
        <section className="fp-card" aria-label="Progress toward each fitness goal">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Live Progress Toward Goals</h2>
              <p className="fp-card-subtitle">Real-time completion percentages calculated from your logs</p>
            </div>
            <ProgressRing
              value={todaySummary.goalCompletionPct}
              max={100}
              size={76}
              thickness={8}
              label="Overall daily goal completion"
              sublabel="Today"
            />
          </div>

          <div className="fp-grid-2" style={{ gap: '0.95rem' }}>
            {goalCards.map((g) => {
              const pct = Math.round((g.current / Math.max(1, g.target)) * 100);
              const done = pct >= 100;
              return (
                <div
                  key={g.label}
                  className="fp-card"
                  style={{ padding: '1rem', background: 'var(--bg-elevated)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <strong style={{ fontSize: '0.88rem' }}>{g.label}</strong>
                    <span className={`fp-badge ${done ? 'fp-badge-green' : 'fp-badge-blue'}`}>
                      {done ? 'Reached!' : `${pct}%`}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.55rem' }} className="tabular-nums">
                    {g.current.toLocaleString()}{' '}
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                      / {g.target.toLocaleString()} {g.unit}
                    </span>
                  </div>
                  <ProgressBar
                    value={g.current}
                    max={g.target}
                    showPercent={false}
                    ariaLabel={g.label}
                    fill={g.fill}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Achievement Badges */}
      <section className="fp-card" aria-label="Achievement badges">
        <div className="fp-card-header">
          <div>
            <h2 className="fp-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="#F59E0B" aria-hidden="true" />
              Achievement Badges ({unlockedCount} / {achievements.length} Unlocked)
            </h2>
            <p className="fp-card-subtitle">
              Badges unlock automatically as you hit milestones in steps, workouts, streaks, and hydration
            </p>
          </div>
          <div className="fp-pill-group">
            {[
              { id: 'all', label: `All (${achievements.length})` },
              { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
              { id: 'locked', label: `In Progress (${achievements.length - unlockedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`fp-pill-btn ${badgeFilter === tab.id ? 'is-active' : ''}`}
                onClick={() => setBadgeFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fp-grid-4">
          {filteredBadges.map((badge) => {
            const Icon = BADGE_ICONS[badge.iconKey] || Trophy;
            return (
              <article
                key={badge.id}
                className="fp-card fp-card-hover"
                style={{
                  background: badge.unlocked
                    ? 'linear-gradient(145deg, rgba(34, 197, 94, 0.14), rgba(56, 189, 248, 0.08)), var(--bg-elevated)'
                    : 'var(--bg-elevated)',
                  borderColor: badge.unlocked ? 'rgba(34, 197, 94, 0.42)' : 'var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  opacity: badge.unlocked ? 1 : 0.85,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    className="fp-metric-icon"
                    style={{
                      background: badge.unlocked ? 'var(--primary-soft)' : 'var(--bg-hover)',
                      color: badge.unlocked ? '#22C55E' : 'var(--text-muted)',
                    }}
                    aria-hidden="true"
                  >
                    <Icon size={21} />
                  </div>
                  <span className={`fp-badge ${badge.unlocked ? 'fp-badge-green' : 'fp-badge-muted'}`}>
                    {badge.unlocked ? (
                      <>
                        <CheckCircle2 size={12} aria-hidden="true" />
                        Unlocked
                      </>
                    ) : (
                      <>
                        <Lock size={12} aria-hidden="true" />
                        {badge.tier}
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{badge.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {badge.description}
                  </p>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <ProgressBar
                    value={badge.progressCurrent}
                    max={badge.progressTarget}
                    label={`${badge.progressCurrent.toLocaleString()} / ${badge.progressTarget.toLocaleString()}`}
                    fill={
                      badge.unlocked
                        ? 'linear-gradient(90deg, #22C55E, #4ADE80)'
                        : 'linear-gradient(90deg, #38BDF8, #A855F7)'
                    }
                    height={7}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
