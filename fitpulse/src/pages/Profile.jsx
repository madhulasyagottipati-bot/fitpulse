import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Monitor,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
  UserCircle2,
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { calculateBMRAndTDEE, calculateBMI } from '../utils/calculations';
import { AVATAR_OPTIONS } from '../utils/sampleData';

const FITNESS_GOALS = [
  'Lose Weight',
  'Build Muscle',
  'Improve Endurance',
  'Maintain Fitness',
  'Athletic Performance',
];

const ACTIVITY_LEVELS = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
  'Athlete',
];

export default function Profile() {
  const {
    state,
    todayISO,
    themeMode,
    setThemeMode,
    sidebarCollapsed,
    setSidebarCollapsed,
    updateProfile,
    resetDemoData,
    clearAllLogs,
    requestConfirm,
    addToast,
  } = useFitness();

  const { profile } = state;
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    age: String(profile.age),
    height: String(profile.height),
    weight: String(profile.weight),
    targetWeight: String(profile.targetWeight),
    fitnessGoal: profile.fitnessGoal,
    activityLevel: profile.activityLevel,
    avatar: profile.avatar,
    customAvatarUrl: profile.customAvatarUrl || '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm({
      name: profile.name,
      email: profile.email,
      age: String(profile.age),
      height: String(profile.height),
      weight: String(profile.weight),
      targetWeight: String(profile.targetWeight),
      fitnessGoal: profile.fitnessGoal,
      activityLevel: profile.activityLevel,
      avatar: profile.avatar,
      customAvatarUrl: profile.customAvatarUrl || '',
    });
  }, [profile]);
  const [systemIsDark, setSystemIsDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemIsDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const avatarPreset = AVATAR_OPTIONS.find((a) => a.id === form.avatar) || AVATAR_OPTIONS[2];
  const initials = (form.name || 'AR')
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('');

  const { bmr, tdee } = calculateBMRAndTDEE({
    age: Number(form.age),
    height: Number(form.height),
    weight: Number(form.weight),
    activityLevel: form.activityLevel,
  });
  const bmi = calculateBMI(Number(form.weight), Number(form.height));

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
      setFormError('Avatar image must be smaller than 512 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((f) => ({ ...f, customAvatarUrl: reader.result }));
        updateProfile({ ...form, customAvatarUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    const age = Number(form.age);
    const height = Number(form.height);
    const weight = Number(form.weight);
    const targetWeight = Number(form.targetWeight);

    if (!form.name.trim() || form.name.trim().length < 2) {
      setFormError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!emailValid) {
      setFormError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (age < 13 || age > 110 || height < 100 || height > 250 || weight < 25 || weight > 300 || targetWeight < 25 || targetWeight > 300) {
      setFormError('Check biometric bounds: Age 13–110, Height 100–250 cm, Weight 25–300 kg.');
      return;
    }

    setFormError('');
    updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      age,
      height,
      weight,
      targetWeight,
      fitnessGoal: form.fitnessGoal,
      activityLevel: form.activityLevel,
      avatar: form.avatar,
      customAvatarUrl: form.customAvatarUrl,
    });
  };

  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitpulse-backup-${todayISO}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      title: 'Backup downloaded',
      message: 'All LocalStorage fitness records saved to JSON.',
      type: 'success',
    });
  };

  return (
    <div className="fp-page">
      {/* Top Profile Banner */}
      <section className="fp-card" aria-label="Profile overview">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap' }}>
            <div
              className="fp-avatar fp-avatar-lg"
              style={{ background: form.customAvatarUrl ? undefined : avatarPreset.gradient }}
            >
              {form.customAvatarUrl ? (
                <img src={form.customAvatarUrl} alt={form.name} />
              ) : (
                initials
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{form.name}</h2>
                <span className="fp-badge fp-badge-green">{form.fitnessGoal}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.18rem' }}>
                {form.email} • {form.age} yrs • {form.height} cm • {form.weight} kg
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div className="fp-card" style={{ padding: '0.7rem 1rem', background: 'var(--bg-elevated)' }}>
              <div className="fp-hint">Est. BMR</div>
              <strong style={{ fontSize: '1.08rem' }}>{bmr.toLocaleString()} kcal</strong>
            </div>
            <div className="fp-card" style={{ padding: '0.7rem 1rem', background: 'var(--bg-elevated)' }}>
              <div className="fp-hint">Est. Daily Burn (TDEE)</div>
              <strong style={{ fontSize: '1.08rem', color: '#22C55E' }}>{tdee.toLocaleString()} kcal</strong>
            </div>
            <div className="fp-card" style={{ padding: '0.7rem 1rem', background: 'var(--bg-elevated)' }}>
              <div className="fp-hint">Profile BMI</div>
              <strong style={{ fontSize: '1.08rem', color: '#38BDF8' }}>
                {bmi.bmi} ({bmi.category})
              </strong>
            </div>
          </div>
        </div>
      </section>

      <div className="fp-grid-form-layout">
        {/* Left: Avatar + Theme & Data Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <section className="fp-card" aria-label="Avatar customization">
            <h2 className="fp-card-title" style={{ marginBottom: '0.35rem' }}>
              Avatar & Appearance
            </h2>
            <p className="fp-card-subtitle" style={{ marginBottom: '0.9rem' }}>
              Pick a signature badge gradient or upload a custom profile photo
            </p>

            <div className="fp-pill-group" style={{ marginBottom: '1rem' }}>
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`fp-pill-btn ${form.avatar === opt.id && !form.customAvatarUrl ? 'is-active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, avatar: opt.id, customAvatarUrl: '' }))}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: opt.gradient,
                      display: 'inline-block',
                    }}
                    aria-hidden="true"
                  />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <label className="fp-btn fp-btn-ghost fp-btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} aria-hidden="true" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="visually-hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
              {form.customAvatarUrl && (
                <button
                  type="button"
                  className="fp-btn fp-btn-danger fp-btn-sm"
                  onClick={() => setForm((f) => ({ ...f, customAvatarUrl: '' }))}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </section>

          {/* Theme Settings (3-way control per modern-web-guidance) */}
          <section className="fp-card" aria-label="Theme settings">
            <h2 className="fp-card-title" style={{ marginBottom: '0.35rem' }}>
              Theme Settings
            </h2>
            <p className="fp-card-subtitle" style={{ marginBottom: '0.9rem' }}>
              Choose explicit Dark or Light theme, or follow your OS color scheme
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }} role="radiogroup" aria-label="Theme preference">
              {[
                { id: 'dark', label: 'Dark Navy (#0B1220)', icon: Moon, desc: 'Signature FitPulse SaaS dark theme' },
                { id: 'light', label: 'Crisp Light', icon: Sun, desc: 'High-contrast daylight workspace' },
                {
                  id: 'system',
                  label: `System (Currently ${systemIsDark ? 'dark' : 'light'})`,
                  icon: Monitor,
                  desc: 'Automatically match your device setting',
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = themeMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`fp-nav-item ${active ? 'is-active' : ''}`}
                    style={{
                      border: active ? '1px solid rgba(34, 197, 94, 0.45)' : '1px solid var(--border-subtle)',
                      background: active ? 'var(--primary-soft)' : 'var(--bg-elevated)',
                    }}
                    onClick={() => setThemeMode(opt.id)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '1rem',
                paddingTop: '0.9rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <label htmlFor="pref-sidebar-collapse" style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                Compact Sidebar Rail
              </label>
              <input
                id="pref-sidebar-collapse"
                type="checkbox"
                checked={sidebarCollapsed}
                onChange={(e) => setSidebarCollapsed(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
            </div>
          </section>

          {/* LocalStorage Data Controls */}
          <section className="fp-card" aria-label="Local data management">
            <h2 className="fp-card-title" style={{ marginBottom: '0.35rem' }}>
              LocalStorage Data
            </h2>
            <p className="fp-card-subtitle" style={{ marginBottom: '0.9rem' }}>
              All entries are stored locally in your browser
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button type="button" className="fp-btn fp-btn-ghost" onClick={handleExportAll}>
                <Download size={16} aria-hidden="true" />
                <span>Export Full JSON Backup</span>
              </button>
              <button
                type="button"
                className="fp-btn fp-btn-ghost"
                onClick={() =>
                  requestConfirm({
                    title: 'Restore Sample Demo Data?',
                    message: 'This will replace your current workouts, meals, and steps with the default FitPulse 30-day sample dataset.',
                    confirmLabel: 'Restore Demo Data',
                    tone: 'warning',
                    onConfirm: resetDemoData,
                  })
                }
              >
                <RotateCcw size={16} aria-hidden="true" />
                <span>Reset to Demo Dataset</span>
              </button>
              <button
                type="button"
                className="fp-btn fp-btn-danger"
                onClick={() =>
                  requestConfirm({
                    title: 'Clear All Activity Logs?',
                    message: 'Permanently remove all logged workouts, activities, meals, and water entries while keeping your profile?',
                    confirmLabel: 'Clear All Logs',
                    tone: 'danger',
                    onConfirm: clearAllLogs,
                  })
                }
              >
                <Trash2 size={16} aria-hidden="true" />
                <span>Clear All Logs</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right: Editable Profile Form */}
        <section className="fp-card" aria-label="Edit user profile">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCircle2 size={20} color="#38BDF8" aria-hidden="true" />
                Personal & Biometric Details
              </h2>
              <p className="fp-card-subtitle">
                Used to calibrate calorie burn estimates, BMI, and daily recommendations
              </p>
            </div>
          </div>

          <form className="fp-form" onSubmit={handleProfileSave} noValidate>
            <div className="fp-form-row">
              <div className="fp-field">
                <label htmlFor="prof-name" className="fp-label">
                  Full Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  className="fp-input"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    if (formError) setFormError('');
                  }}
                />
              </div>
              <div className="fp-field">
                <label htmlFor="prof-email" className="fp-label">
                  Email Address
                </label>
                <input
                  id="prof-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="fp-input"
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }));
                    if (formError) setFormError('');
                  }}
                />
              </div>
            </div>

            <div className="fp-grid-2">
              <div className="fp-field">
                <label htmlFor="prof-age" className="fp-label">
                  Age (years)
                </label>
                <input
                  id="prof-age"
                  type="number"
                  min="13"
                  max="110"
                  required
                  className="fp-input"
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                />
              </div>
              <div className="fp-field">
                <label htmlFor="prof-height" className="fp-label">
                  Height (cm)
                </label>
                <input
                  id="prof-height"
                  type="number"
                  min="100"
                  max="250"
                  required
                  className="fp-input"
                  value={form.height}
                  onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
                />
              </div>
            </div>

            <div className="fp-grid-2">
              <div className="fp-field">
                <label htmlFor="prof-weight" className="fp-label">
                  Current Weight (kg)
                </label>
                <input
                  id="prof-weight"
                  type="number"
                  step="0.1"
                  min="25"
                  max="300"
                  required
                  className="fp-input"
                  value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                />
              </div>
              <div className="fp-field">
                <label htmlFor="prof-target-weight" className="fp-label">
                  Target Weight (kg)
                </label>
                <input
                  id="prof-target-weight"
                  type="number"
                  step="0.1"
                  min="25"
                  max="300"
                  required
                  className="fp-input"
                  value={form.targetWeight}
                  onChange={(e) => setForm((f) => ({ ...f, targetWeight: e.target.value }))}
                />
              </div>
            </div>

            <div className="fp-form-row">
              <div className="fp-field">
                <label htmlFor="prof-goal" className="fp-label">
                  Primary Fitness Goal
                </label>
                <select
                  id="prof-goal"
                  className="fp-select"
                  value={form.fitnessGoal}
                  onChange={(e) => setForm((f) => ({ ...f, fitnessGoal: e.target.value }))}
                >
                  {FITNESS_GOALS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fp-field">
                <label htmlFor="prof-activity" className="fp-label">
                  Activity Level
                </label>
                <select
                  id="prof-activity"
                  className="fp-select"
                  value={form.activityLevel}
                  onChange={(e) => setForm((f) => ({ ...f, activityLevel: e.target.value }))}
                >
                  {ACTIVITY_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <div className="fp-error-msg">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
              <button type="submit" className="fp-btn fp-btn-primary">
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
