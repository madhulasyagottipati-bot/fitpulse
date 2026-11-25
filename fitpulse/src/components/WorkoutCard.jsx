import React from 'react';
import {
  Activity,
  Bike,
  Dumbbell,
  Eye,
  Flame,
  Footprints,
  Sparkles,
  Trash2,
  Waves,
} from 'lucide-react';
import { formatShortDate, WORKOUT_CATEGORIES } from '../utils/calculations';

const CATEGORY_ICONS = {
  Running: Footprints,
  Walking: Activity,
  Cycling: Bike,
  Swimming: Waves,
  Gym: Dumbbell,
  Yoga: Sparkles,
  'Strength Training': Dumbbell,
};

export default function WorkoutCard({ workout, onViewDetails, onDelete, compact = false }) {
  const meta = WORKOUT_CATEGORIES[workout.category] || {
    color: '#22C55E',
    intensity: 'Moderate',
  };
  const Icon = CATEGORY_ICONS[workout.category] || Dumbbell;

  return (
    <article className="fp-workout-item">
      <div className="fp-workout-left">
        <div
          className="fp-metric-icon"
          style={{
            background: `${meta.color}22`,
            color: meta.color,
            border: `1px solid ${meta.color}44`,
          }}
          aria-hidden="true"
        >
          <Icon size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '0.95rem' }}>{workout.title}</strong>
            <span
              className="fp-badge"
              style={{
                background: `${meta.color}1E`,
                color: meta.color,
                borderColor: `${meta.color}3D`,
              }}
            >
              {workout.category}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.18rem' }}>
            {formatShortDate(workout.date)}
            {!compact && workout.notes ? ` • ${workout.notes}` : ''}
          </div>
        </div>
      </div>

      <div className="fp-workout-stats">
        <div className="fp-workout-stat">
          <strong>{workout.durationMin} min</strong>
          <span>Duration</span>
        </div>
        <div className="fp-workout-stat">
          <strong style={{ color: '#22C55E', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <Flame size={13} aria-hidden="true" />
            {workout.caloriesBurned} kcal
          </strong>
          <span>Burned</span>
        </div>
        {Number(workout.distanceKm) > 0 && (
          <div className="fp-workout-stat">
            <strong>{workout.distanceKm} km</strong>
            <span>Distance</span>
          </div>
        )}

        {(onViewDetails || onDelete) && (
          <div style={{ display: 'flex', gap: '0.45rem' }}>
            {onViewDetails && (
              <button
                type="button"
                className="fp-btn fp-btn-ghost fp-btn-sm"
                onClick={() => onViewDetails(workout)}
                aria-label={`View details for ${workout.title}`}
              >
                <Eye size={14} aria-hidden="true" />
                {!compact && <span>Details</span>}
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="fp-btn fp-btn-danger fp-btn-sm"
                onClick={() => onDelete(workout)}
                aria-label={`Delete ${workout.title}`}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
