import React from 'react';
import { Menu, Moon, Play, Sun } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { formatDisplayDate, formatDurationSeconds } from '../utils/calculations';
import { AVATAR_OPTIONS } from '../utils/sampleData';
import { NAV_ITEMS } from './Sidebar';

export default function Header({ onOpenMobileDrawer, mobileMenuBtnRef }) {
  const {
    activePage,
    setActivePage,
    resolvedTheme,
    toggleTheme,
    state,
    todayISO,
  } = useFitness();

  const currentNav = NAV_ITEMS.find((item) => item.id === activePage) || NAV_ITEMS[0];
  const { profile, activeWorkout } = state;
  const avatarPreset = AVATAR_OPTIONS.find((a) => a.id === profile.avatar) || AVATAR_OPTIONS[2];
  const initials = (profile.name || 'AR')
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('');

  return (
    <header className="fp-header">
      <div className="fp-header-left">
        <button
          ref={mobileMenuBtnRef}
          type="button"
          className="fp-mobile-menu-btn"
          onClick={onOpenMobileDrawer}
          aria-label="Open navigation menu"
          aria-controls="mobile-nav-drawer"
          aria-expanded="false"
        >
          <Menu size={20} />
        </button>
        <div className="fp-header-title-group">
          <h1 className="fp-header-title">{currentNav.label}</h1>
          <p className="fp-header-subtitle">{formatDisplayDate(todayISO)}</p>
        </div>
      </div>

      <div className="fp-header-actions">
        {activeWorkout.isRunning && (
          <button
            type="button"
            className="fp-live-pill"
            onClick={() => setActivePage('workouts')}
            title="Jump to active workout timer"
          >
            <span className="fp-live-dot" aria-hidden="true" />
            <span>{activeWorkout.category}</span>
            <span className="mono">{formatDurationSeconds(activeWorkout.elapsedSeconds)}</span>
          </button>
        )}

        <button
          type="button"
          className="fp-btn fp-btn-primary fp-btn-sm"
          onClick={() => setActivePage('workouts')}
        >
          <Play size={14} fill="currentColor" aria-hidden="true" />
          <span>{activeWorkout.isRunning ? 'Live Session' : 'Start Workout'}</span>
        </button>

        <button
          type="button"
          className="fp-icon-btn"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={18} color="#FBBF24" aria-hidden="true" />
          ) : (
            <Moon size={18} color="#0284C7" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          className="fp-profile-chip"
          onClick={() => setActivePage('profile')}
          aria-label="Open profile and settings"
        >
          <span
            className="fp-avatar"
            style={{ background: profile.customAvatarUrl ? undefined : avatarPreset.gradient }}
          >
            {profile.customAvatarUrl ? (
              <img src={profile.customAvatarUrl} alt={profile.name} />
            ) : (
              initials
            )}
          </span>
          <span className="fp-header-chip-name" style={{ fontSize: '0.84rem', fontWeight: 600 }}>
            {profile.name}
          </span>
        </button>
      </div>
    </header>
  );
}
