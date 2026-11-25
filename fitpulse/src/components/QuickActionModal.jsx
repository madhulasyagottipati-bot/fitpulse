import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Footprints, Utensils, X } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { FOOD_PRESETS } from '../utils/sampleData';

export default function QuickActionModal() {
  const { quickModal, setQuickModal, addSteps, addMeal, todayISO } = useFitness();
  const dialogRef = useRef(null);

  const [stepsInput, setStepsInput] = useState('1500');
  const [stepsError, setStepsError] = useState('');

  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealType, setMealType] = useState('Dinner');
  const [mealError, setMealError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (quickModal && !dialog.open) {
      setStepsError('');
      setMealError('');
      dialog.showModal();
    } else if (!quickModal && dialog.open) {
      dialog.close();
    }
    return undefined;
  }, [quickModal]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    dialog.setAttribute('closedby', 'any');
    const handleClose = () => {
      dialog.returnValue = '';
      setQuickModal(null);
    };
    dialog.addEventListener('close', handleClose);

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
      dialog.removeEventListener('close', handleClose);
      cleanupFallback?.();
    };
  }, [setQuickModal]);

  const handleStepsSubmit = (e) => {
    e.preventDefault();
    const num = Number(stepsInput);
    if (!Number.isFinite(num) || num <= 0 || num > 100000) {
      setStepsError('Please enter a step count between 1 and 100,000.');
      return;
    }
    dialogRef.current?.close();
    setQuickModal(null);
    addSteps(num, todayISO, 'add');
  };

  const handleMealSubmit = (e) => {
    e.preventDefault();
    const cal = Number(mealCalories);
    if (!mealName.trim()) {
      setMealError('Please enter a food item name.');
      return;
    }
    if (!Number.isFinite(cal) || cal <= 0 || cal > 5000) {
      setMealError('Please enter calories between 1 and 5,000.');
      return;
    }
    dialogRef.current?.close();
    setQuickModal(null);
    addMeal({ name: mealName.trim(), calories: cal, mealType, date: todayISO });
    setMealName('');
    setMealCalories('');
  };

  return (
    <dialog
      ref={dialogRef}
      className="fp-modal"
      aria-labelledby="quick-modal-title"
    >
      <div className="fp-modal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            className="fp-metric-icon"
            style={{
              width: 38,
              height: 38,
              background: quickModal === 'steps' ? 'var(--primary-soft)' : 'var(--secondary-soft)',
              color: quickModal === 'steps' ? 'var(--primary)' : 'var(--secondary)',
            }}
            aria-hidden="true"
          >
            {quickModal === 'steps' ? <Footprints size={19} /> : <Utensils size={19} />}
          </div>
          <h1 id="quick-modal-title" style={{ fontSize: '1.12rem', fontWeight: 700 }}>
            {quickModal === 'steps' ? 'Quick Log Steps' : 'Quick Log Meal'}
          </h1>
        </div>
        <button
          type="button"
          className="fp-collapse-btn"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close modal"
        >
          <X size={17} />
        </button>
      </div>

      {quickModal === 'steps' ? (
        <form className="fp-form" onSubmit={handleStepsSubmit} noValidate>
          <div className="fp-pill-group">
            {[500, 1000, 2500, 5000].map((preset) => (
              <button
                key={preset}
                type="button"
                className={`fp-pill-btn ${Number(stepsInput) === preset ? 'is-active' : ''}`}
                onClick={() => {
                  setStepsInput(String(preset));
                  setStepsError('');
                }}
              >
                +{preset.toLocaleString()} steps
              </button>
            ))}
          </div>

          <div className="fp-field">
            <label htmlFor="quick-steps-input" className="fp-label">
              Steps to Add
            </label>
            <input
              id="quick-steps-input"
              type="number"
              min="1"
              max="100000"
              required
              autoFocus
              className="fp-input"
              value={stepsInput}
              aria-invalid={stepsError ? 'true' : 'false'}
              onChange={(e) => {
                setStepsInput(e.target.value);
                if (stepsError) setStepsError('');
              }}
            />
            {stepsError && (
              <div className="fp-error-msg">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{stepsError}</span>
              </div>
            )}
          </div>

          <div className="fp-modal-actions">
            <button type="button" className="fp-btn fp-btn-ghost" onClick={() => dialogRef.current?.close()}>
              Cancel
            </button>
            <button type="submit" className="fp-btn fp-btn-primary">
              Add Steps
            </button>
          </div>
        </form>
      ) : (
        <form className="fp-form" onSubmit={handleMealSubmit} noValidate>
          <div>
            <div className="fp-hint" style={{ marginBottom: '0.4rem' }}>
              Tap a preset to auto-fill:
            </div>
            <div className="fp-pill-group">
              {FOOD_PRESETS.slice(0, 4).map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className="fp-pill-btn"
                  onClick={() => {
                    setMealName(p.name);
                    setMealCalories(String(p.calories));
                    setMealType(p.mealType);
                    setMealError('');
                  }}
                >
                  {p.name.split(' ').slice(0, 2).join(' ')} ({p.calories})
                </button>
              ))}
            </div>
          </div>

          <div className="fp-field">
            <label htmlFor="quick-meal-name" className="fp-label">
              Food Name
            </label>
            <input
              id="quick-meal-name"
              type="text"
              required
              autoFocus
              placeholder="e.g., Grilled Salmon & Greens"
              className="fp-input"
              value={mealName}
              onChange={(e) => {
                setMealName(e.target.value);
                if (mealError) setMealError('');
              }}
            />
          </div>

          <div className="fp-form-row">
            <div className="fp-field">
              <label htmlFor="quick-meal-cals" className="fp-label">
                Calories (kcal)
              </label>
              <input
                id="quick-meal-cals"
                type="number"
                min="1"
                max="5000"
                required
                placeholder="450"
                className="fp-input"
                value={mealCalories}
                onChange={(e) => {
                  setMealCalories(e.target.value);
                  if (mealError) setMealError('');
                }}
              />
            </div>

            <div className="fp-field">
              <label htmlFor="quick-meal-type" className="fp-label">
                Meal Slot
              </label>
              <select
                id="quick-meal-type"
                className="fp-select"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>
          </div>

          {mealError && (
            <div className="fp-error-msg">
              <AlertCircle size={14} aria-hidden="true" />
              <span>{mealError}</span>
            </div>
          )}

          <div className="fp-modal-actions">
            <button type="button" className="fp-btn fp-btn-ghost" onClick={() => dialogRef.current?.close()}>
              Cancel
            </button>
            <button type="submit" className="fp-btn fp-btn-primary">
              Save Meal
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
