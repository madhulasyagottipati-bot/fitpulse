import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Dumbbell,
  Flame,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Square,
  Timer,
  X,
} from 'lucide-react';
import WorkoutCard from '../components/WorkoutCard';
import { useFitness } from '../context/FitnessContext';
import {
  estimateWorkoutCalories,
  formatDisplayDate,
  formatDurationSeconds,
  WORKOUT_CATEGORIES,
} from '../utils/calculations';

const CATEGORY_LIST = Object.keys(WORKOUT_CATEGORIES);

export default function Workouts() {
  const {
    state,
    todayISO,
    updateActiveWorkoutConfig,
    startLiveWorkout,
    togglePauseLiveWorkout,
    discardLiveWorkout,
    finishLiveWorkout,
    addManualWorkout,
    deleteWorkout,
    requestConfirm,
  } = useFitness();

  const { activeWorkout, workouts, profile } = state;
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual workout form state
  const [mCategory, setMCategory] = useState('Strength Training');
  const [mTitle, setMTitle] = useState('');
  const [mDuration, setMDuration] = useState('40');
  const [mDistance, setMDistance] = useState('0');
  const [mDate, setMDate] = useState(todayISO);
  const [mNotes, setMNotes] = useState('');
  const [mError, setMError] = useState('');

  // History filters & details modal
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const detailsDialogRef = useRef(null);

  useEffect(() => {
    const dialog = detailsDialogRef.current;
    if (!dialog) return undefined;
    if (selectedWorkout && !dialog.open) dialog.showModal();
    if (!selectedWorkout && dialog.open) dialog.close();
    return undefined;
  }, [selectedWorkout]);

  useEffect(() => {
    const dialog = detailsDialogRef.current;
    if (!dialog) return undefined;
    dialog.setAttribute('closedby', 'any');
    const onClose = () => {
      dialog.returnValue = '';
      setSelectedWorkout(null);
    };
    dialog.addEventListener('close', onClose);

    let cleanupFallback;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const onDown = (e) => {
        pressedOutside = isOutside(e);
      };
      const onUp = (e) => {
        if (pressedOutside && isOutside(e) && dialog.open) dialog.close();
        pressedOutside = false;
      };
      dialog.addEventListener('pointerdown', onDown);
      dialog.addEventListener('pointerup', onUp);
      cleanupFallback = () => {
        dialog.removeEventListener('pointerdown', onDown);
        dialog.removeEventListener('pointerup', onUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', onClose);
      cleanupFallback?.();
    };
  }, []);

  const liveMinutesFloat = activeWorkout.elapsedSeconds / 60;
  const liveCalories = Math.round(
    estimateWorkoutCalories(activeWorkout.category, liveMinutesFloat, profile.weight)
  );
  const kcalPerMin = estimateWorkoutCalories(activeWorkout.category, 10, profile.weight) / 10;
  const categoryMeta = WORKOUT_CATEGORIES[activeWorkout.category] || WORKOUT_CATEGORIES.Running;

  const filteredWorkouts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = workouts
      .filter((w) => (filterCategory === 'All' ? true : w.category === filterCategory))
      .filter(
        (w) =>
          !q ||
          w.title.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          (w.notes || '').toLowerCase().includes(q)
      );
    if (sortBy === 'calories') return [...list].sort((a, b) => b.caloriesBurned - a.caloriesBurned);
    if (sortBy === 'duration') return [...list].sort((a, b) => b.durationMin - a.durationMin);
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [workouts, filterCategory, search, sortBy]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const dur = Number(mDuration);
    const dist = Number(mDistance);
    if (!Number.isFinite(dur) || dur <= 0 || dur > 600) {
      setMError('Workout duration must be between 1 and 600 minutes.');
      return;
    }
    if (!Number.isFinite(dist) || dist < 0 || dist > 300) {
      setMError('Distance must be 0 or greater (max 300 km).');
      return;
    }
    setMError('');
    addManualWorkout({
      category: mCategory,
      title: mTitle.trim() || `${mCategory} Session`,
      durationMin: dur,
      distanceKm: dist,
      date: mDate,
      notes: mNotes,
    });
    setMTitle('');
    setMNotes('');
    setShowManualForm(false);
  };

  return (
    <div className="fp-page">
      {/* Live Workout Timer Studio */}
      <section className="fp-card fp-timer-card" aria-label="Live workout tracker">
        <div className="fp-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
              <h2 className="fp-card-title" style={{ fontSize: '1.22rem' }}>
                Live Workout Session Studio
              </h2>
              {activeWorkout.isRunning && (
                <span className={`fp-badge ${activeWorkout.isPaused ? 'fp-badge-amber' : 'fp-badge-green'}`}>
                  {!activeWorkout.isPaused && <span className="fp-live-dot" aria-hidden="true" />}
                  {activeWorkout.isPaused ? 'PAUSED' : 'RECORDING'}
                </span>
              )}
            </div>
            <p className="fp-card-subtitle">
              Choose a workout category, start the live timer, pause anytime, and save estimated burn to your history
            </p>
          </div>
          <button
            type="button"
            className="fp-btn fp-btn-ghost fp-btn-sm"
            onClick={() => setShowManualForm((s) => !s)}
          >
            <Plus size={15} aria-hidden="true" />
            <span>{showManualForm ? 'Hide Manual Entry' : 'Log Past Workout'}</span>
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="fp-hint" style={{ marginBottom: '0.45rem' }}>
            Select Workout Category:
          </div>
          <div className="fp-pill-group" role="radiogroup" aria-label="Workout category">
            {CATEGORY_LIST.map((cat) => {
              const selected = activeWorkout.category === cat;
              const meta = WORKOUT_CATEGORIES[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`fp-pill-btn ${selected ? 'is-active' : ''}`}
                  style={
                    selected
                      ? {
                          borderColor: meta.color,
                          color: meta.color,
                          background: `${meta.color}22`,
                        }
                      : undefined
                  }
                  onClick={() =>
                    updateActiveWorkoutConfig({
                      category: cat,
                      title: `${cat} Session`,
                    })
                  }
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="fp-grid-sidebar" style={{ alignItems: 'center' }}>
          {/* Clock & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div className="fp-hint">Elapsed Duration</div>
                <div className="fp-timer-clock" aria-live="off">
                  {formatDurationSeconds(activeWorkout.elapsedSeconds)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div>
                  <div className="fp-hint">Estimated Burn</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22C55E', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Flame size={20} aria-hidden="true" />
                    <span className="tabular-nums">{liveCalories} kcal</span>
                  </div>
                </div>
                <div>
                  <div className="fp-hint">Burn Rate</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--secondary)' }}>
                    {kcalPerMin.toFixed(1)} kcal/min
                  </div>
                </div>
                <div>
                  <div className="fp-hint">Intensity</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{categoryMeta.intensity}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem' }}>
              {!activeWorkout.isRunning ? (
                <button
                  type="button"
                  className="fp-btn fp-btn-primary"
                  onClick={() => startLiveWorkout()}
                >
                  <Play size={17} fill="currentColor" aria-hidden="true" />
                  <span>Start Workout</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={`fp-btn ${activeWorkout.isPaused ? 'fp-btn-primary' : 'fp-btn-secondary'}`}
                    onClick={togglePauseLiveWorkout}
                  >
                    {activeWorkout.isPaused ? (
                      <>
                        <Play size={16} fill="currentColor" aria-hidden="true" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause size={16} aria-hidden="true" />
                        <span>Pause Workout</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="fp-btn fp-btn-primary"
                    onClick={() => finishLiveWorkout()}
                  >
                    <Square size={15} fill="currentColor" aria-hidden="true" />
                    <span>Finish & Save</span>
                  </button>

                  <button
                    type="button"
                    className="fp-btn fp-btn-danger"
                    onClick={() =>
                      requestConfirm({
                        title: 'Discard Live Session?',
                        message: 'Reset the active timer without saving this workout to your history?',
                        confirmLabel: 'Discard Session',
                        onConfirm: discardLiveWorkout,
                      })
                    }
                  >
                    <RotateCcw size={15} aria-hidden="true" />
                    <span>Discard</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Session Metadata Inputs */}
          <div className="fp-form">
            <div className="fp-form-row">
              <div className="fp-field">
                <label htmlFor="live-workout-title" className="fp-label">
                  Session Name
                </label>
                <input
                  id="live-workout-title"
                  type="text"
                  className="fp-input"
                  value={activeWorkout.title}
                  onChange={(e) => updateActiveWorkoutConfig({ title: e.target.value })}
                  placeholder={`${activeWorkout.category} Session`}
                />
              </div>
              <div className="fp-field">
                <label htmlFor="live-workout-dist" className="fp-label">
                  Distance (km)
                </label>
                <input
                  id="live-workout-dist"
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  className="fp-input"
                  value={activeWorkout.targetDistanceKm}
                  onChange={(e) =>
                    updateActiveWorkoutConfig({ targetDistanceKm: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="fp-field">
              <label htmlFor="live-workout-notes" className="fp-label">
                Session Notes
              </label>
              <input
                id="live-workout-notes"
                type="text"
                className="fp-input"
                placeholder="Target pace, sets, intervals, or how you feel..."
                value={activeWorkout.notes}
                onChange={(e) => updateActiveWorkoutConfig({ notes: e.target.value })}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Collapsible Manual Past Workout Form */}
      {showManualForm && (
        <section className="fp-card" aria-label="Log completed workout manually">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Log Completed Workout</h2>
              <p className="fp-card-subtitle">
                Add a workout you completed earlier without running the live timer
              </p>
            </div>
            <span className="fp-badge fp-badge-green">
              Est. {estimateWorkoutCalories(mCategory, Number(mDuration) || 0, profile.weight)} kcal
            </span>
          </div>

          <form className="fp-form" onSubmit={handleManualSubmit} noValidate>
            <div className="fp-grid-3">
              <div className="fp-field">
                <label htmlFor="manual-wrk-cat" className="fp-label">
                  Category
                </label>
                <select
                  id="manual-wrk-cat"
                  className="fp-select"
                  value={mCategory}
                  onChange={(e) => setMCategory(e.target.value)}
                >
                  {CATEGORY_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fp-field">
                <label htmlFor="manual-wrk-title" className="fp-label">
                  Workout Title
                </label>
                <input
                  id="manual-wrk-title"
                  type="text"
                  className="fp-input"
                  placeholder={`e.g., Afternoon ${mCategory}`}
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                />
              </div>
              <div className="fp-field">
                <label htmlFor="manual-wrk-date" className="fp-label">
                  Date
                </label>
                <input
                  id="manual-wrk-date"
                  type="date"
                  max={todayISO}
                  className="fp-input"
                  value={mDate}
                  onChange={(e) => setMDate(e.target.value)}
                />
              </div>
            </div>

            <div className="fp-grid-3">
              <div className="fp-field">
                <label htmlFor="manual-wrk-dur" className="fp-label">
                  Duration (min)
                </label>
                <input
                  id="manual-wrk-dur"
                  type="number"
                  min="1"
                  max="600"
                  required
                  className="fp-input"
                  value={mDuration}
                  onChange={(e) => {
                    setMDuration(e.target.value);
                    if (mError) setMError('');
                  }}
                />
              </div>
              <div className="fp-field">
                <label htmlFor="manual-wrk-dist" className="fp-label">
                  Distance (km, optional)
                </label>
                <input
                  id="manual-wrk-dist"
                  type="number"
                  step="0.1"
                  min="0"
                  max="300"
                  className="fp-input"
                  value={mDistance}
                  onChange={(e) => {
                    setMDistance(e.target.value);
                    if (mError) setMError('');
                  }}
                />
              </div>
              <div className="fp-field">
                <label htmlFor="manual-wrk-notes" className="fp-label">
                  Notes
                </label>
                <input
                  id="manual-wrk-notes"
                  type="text"
                  className="fp-input"
                  placeholder="Optional details..."
                  value={mNotes}
                  onChange={(e) => setMNotes(e.target.value)}
                />
              </div>
            </div>

            {mError && (
              <div className="fp-error-msg">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{mError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="fp-btn fp-btn-ghost"
                onClick={() => setShowManualForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="fp-btn fp-btn-primary">
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Save Workout</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Workout History Section */}
      <section className="fp-card" aria-label="Workout history">
        <div className="fp-card-header">
          <div>
            <h2 className="fp-card-title">Workout History ({filteredWorkouts.length})</h2>
            <p className="fp-card-subtitle">
              Inspect full workout telemetry, search sessions, or filter by category
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label htmlFor="wrk-sort" className="visually-hidden">
              Sort workouts
            </label>
            <select
              id="wrk-sort"
              className="fp-select"
              style={{ width: 'auto', minHeight: 38 }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="calories">Highest Calories</option>
              <option value="duration">Longest Duration</option>
            </select>
          </div>
        </div>

        <search style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="fp-search-box">
            <Search size={16} className="fp-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="fp-input fp-search-input"
              placeholder="Search workouts by title, category, or notes..."
              aria-label="Search workouts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="fp-pill-group">
            {['All', ...CATEGORY_LIST].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`fp-pill-btn ${filterCategory === cat ? 'is-active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </search>

        {filteredWorkouts.length === 0 ? (
          <div className="fp-empty">
            <Dumbbell size={32} color="var(--text-muted)" aria-hidden="true" />
            <strong>No workouts found</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Adjust your search/category filter or start a live workout above.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onViewDetails={setSelectedWorkout}
                onDelete={(item) =>
                  requestConfirm({
                    title: 'Delete Workout?',
                    message: `Are you sure you want to delete "${item.title}" (${item.durationMin} min, ${item.caloriesBurned} kcal)?`,
                    confirmLabel: 'Delete Workout',
                    onConfirm: () => deleteWorkout(item.id),
                  })
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Workout Details Native Modal */}
      <dialog
        ref={detailsDialogRef}
        className="fp-modal"
        aria-labelledby="wrk-detail-title"
      >
        {selectedWorkout && (
          <>
            <div className="fp-modal-header">
              <div>
                <span className="fp-badge fp-badge-green" style={{ marginBottom: '0.35rem' }}>
                  {selectedWorkout.category}
                </span>
                <h1 id="wrk-detail-title" style={{ fontSize: '1.22rem', fontWeight: 800 }}>
                  {selectedWorkout.title}
                </h1>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {formatDisplayDate(selectedWorkout.date)}
                </p>
              </div>
              <button
                type="button"
                className="fp-collapse-btn"
                onClick={() => detailsDialogRef.current?.close()}
                aria-label="Close workout details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="fp-grid-2" style={{ gap: '0.75rem' }}>
              <div className="fp-card" style={{ padding: '0.85rem' }}>
                <div className="fp-hint">Duration</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Timer size={17} color="#38BDF8" aria-hidden="true" />
                  {selectedWorkout.durationMin} min
                </div>
              </div>
              <div className="fp-card" style={{ padding: '0.85rem' }}>
                <div className="fp-hint">Calories Burned</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22C55E', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Flame size={17} aria-hidden="true" />
                  {selectedWorkout.caloriesBurned} kcal
                </div>
              </div>
              <div className="fp-card" style={{ padding: '0.85rem' }}>
                <div className="fp-hint">Avg Heart Rate (Est.)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {selectedWorkout.avgHeartRate || 135} BPM
                </div>
              </div>
              <div className="fp-card" style={{ padding: '0.85rem' }}>
                <div className="fp-hint">Distance / Intensity</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {selectedWorkout.distanceKm > 0
                    ? `${selectedWorkout.distanceKm} km`
                    : selectedWorkout.intensity || 'High'}
                </div>
              </div>
            </div>

            <div className="fp-card" style={{ padding: '0.95rem', background: 'var(--bg-elevated)' }}>
              <div className="fp-hint" style={{ marginBottom: '0.25rem' }}>
                Session Notes
              </div>
              <p style={{ fontSize: '0.9rem' }}>
                {selectedWorkout.notes || 'No extra notes recorded for this workout.'}
              </p>
            </div>

            <div className="fp-modal-actions">
              <button
                type="button"
                className="fp-btn fp-btn-primary"
                autoFocus
                onClick={() => detailsDialogRef.current?.close()}
              >
                Done
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
