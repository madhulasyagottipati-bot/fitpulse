import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  addDaysISO,
  computeAchievements,
  computeDailySummary,
  computeStreakDays,
  estimateWorkoutCalories,
  estimateWorkoutSteps,
  getTodayISO,
} from '../utils/calculations';
import { createInitialState } from '../utils/sampleData';

const STORAGE_KEY = 'fitpulse_app_state_v1';
const THEME_STORAGE_KEY = 'fitpulse_color_scheme';

const FitnessContext = createContext(null);

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.profile || !parsed.goals) {
      return createInitialState();
    }
    const fallback = createInitialState();
    // Catch up elapsed timer if workout was actively ticking before refresh
    let activeWorkout = { ...fallback.activeWorkout, ...(parsed.activeWorkout || {}) };
    if (activeWorkout.isRunning && !activeWorkout.isPaused && activeWorkout.lastTickMs) {
      const deltaSec = Math.max(0, Math.floor((Date.now() - activeWorkout.lastTickMs) / 1000));
      activeWorkout = {
        ...activeWorkout,
        elapsedSeconds: (Number(activeWorkout.elapsedSeconds) || 0) + deltaSec,
        lastTickMs: Date.now(),
      };
    }
    return {
      ...fallback,
      ...parsed,
      profile: { ...fallback.profile, ...(parsed.profile || {}) },
      goals: { ...fallback.goals, ...(parsed.goals || {}) },
      activeWorkout,
    };
  } catch {
    return createInitialState();
  }
}

function getSystemScheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadSavedThemeMode() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    // Ignore restricted storage
  }
  return 'dark';
}

export function FitnessProvider({ children }) {
  const [state, setState] = useState(loadSavedState);
  const [themeMode, setThemeModeState] = useState(loadSavedThemeMode);
  const [systemScheme, setSystemScheme] = useState(getSystemScheme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('fitpulse_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [quickModal, setQuickModal] = useState(null); // 'steps' | 'meal' | null
  const [activePage, setActivePage] = useState('dashboard');
  const [announcement, setAnnouncement] = useState('');
  const pendingToastsRef = useRef([]);
  const isModalOpen = Boolean(confirmState || quickModal);

  // Persist core fitness data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors gracefully
    }
  }, [state]);

  // Persist sidebar collapse preference
  useEffect(() => {
    try {
      localStorage.setItem('fitpulse_sidebar_collapsed', String(sidebarCollapsed));
    } catch {
      // Ignore
    }
  }, [sidebarCollapsed]);

  // Listen to OS color-scheme changes cleanly (without stripping stored overrides)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemScheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Sync theme override across browser tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === THEME_STORAGE_KEY) {
        const next = e.newValue;
        setThemeModeState(next === 'light' || next === 'dark' || next === 'system' ? next : 'dark');
      } else if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.profile) setState(parsed);
        } catch {
          // Ignore malformed external update
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const resolvedTheme = themeMode === 'system' ? systemScheme : themeMode;

  // Apply theme to <meta name="color-scheme"> and root dataset
  useEffect(() => {
    const metaContent = themeMode === 'system' ? 'light dark' : themeMode;
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute('content', metaContent);
    document.documentElement.dataset.themeMode = themeMode;
    document.documentElement.dataset.resolvedTheme = resolvedTheme;
  }, [themeMode, resolvedTheme]);

  const setThemeMode = useCallback((nextMode) => {
    const valid = nextMode === 'light' || nextMode === 'dark' || nextMode === 'system' ? nextMode : 'dark';
    setThemeModeState(valid);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, valid);
    } catch {
      // Ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const target = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemeMode(target);
  }, [resolvedTheme, setThemeMode]);

  // Flush queued toasts after modal closes (per persistent-toast-notifications rule)
  const addToast = useCallback(
    ({ title, message, type = 'success' }) => {
      const payload = {
        id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        message,
        type,
        createdAt: Date.now(),
      };
      if (isModalOpen) {
        pendingToastsRef.current.push(payload);
        return;
      }
      setToasts((prev) => [...prev.slice(-3), payload]);
      setAnnouncement(`${title}${message ? `: ${message}` : ''}`);
    },
    [isModalOpen]
  );

  useEffect(() => {
    if (!isModalOpen && pendingToastsRef.current.length > 0) {
      const queued = [...pendingToastsRef.current];
      pendingToastsRef.current = [];
      setToasts((prev) => [...prev, ...queued].slice(-4));
      const latest = queued[queued.length - 1];
      setAnnouncement(`${latest.title}${latest.message ? `: ${latest.message}` : ''}`);
    }
  }, [isModalOpen]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Confirmation modal dialog helper
  const requestConfirm = useCallback((config) => {
    setConfirmState({
      title: config.title || 'Confirm Action',
      message: config.message || 'Are you sure you want to proceed?',
      confirmLabel: config.confirmLabel || 'Delete',
      cancelLabel: config.cancelLabel || 'Cancel',
      tone: config.tone || 'danger',
      onConfirm: config.onConfirm,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(null);
  }, []);

  // Live Workout Timer Tick
  useEffect(() => {
    if (!state.activeWorkout.isRunning || state.activeWorkout.isPaused) return undefined;
    const timer = setInterval(() => {
      setState((prev) => {
        if (!prev.activeWorkout.isRunning || prev.activeWorkout.isPaused) return prev;
        return {
          ...prev,
          activeWorkout: {
            ...prev.activeWorkout,
            elapsedSeconds: prev.activeWorkout.elapsedSeconds + 1,
            lastTickMs: Date.now(),
          },
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.activeWorkout.isRunning, state.activeWorkout.isPaused]);

  // Actions: Steps & Activities
  const addSteps = useCallback(
    (stepsCount, date = getTodayISO(), mode = 'add') => {
      const amount = Math.max(0, Math.round(Number(stepsCount) || 0));
      setState((prev) => {
        const currentBase = Number(prev.baseStepsByDate[date]) || 0;
        const nextBase = mode === 'set' ? amount : currentBase + amount;
        return {
          ...prev,
          baseStepsByDate: {
            ...prev.baseStepsByDate,
            [date]: nextBase,
          },
        };
      });
      addToast({
        title: mode === 'set' ? 'Daily steps updated' : `+${amount.toLocaleString()} steps logged`,
        message: `Synced to ${date === getTodayISO() ? 'today’s' : date} movement ring.`,
        type: 'success',
      });
    },
    [addToast]
  );

  const addActivity = useCallback(
    (payload) => {
      const date = payload.date || getTodayISO();
      const durationMin = Math.max(1, Number(payload.durationMin) || 0);
      const distanceKm = Math.max(0, Number(payload.distanceKm) || 0);
      const steps =
        payload.steps !== undefined && payload.steps !== ''
          ? Math.max(0, Math.round(Number(payload.steps)))
          : estimateWorkoutSteps(payload.type, durationMin, distanceKm);
      const caloriesBurned =
        payload.caloriesBurned !== undefined && payload.caloriesBurned !== ''
          ? Math.max(1, Math.round(Number(payload.caloriesBurned)))
          : estimateWorkoutCalories(payload.type, durationMin, state.profile.weight);

      const newActivity = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date,
        type: payload.type || 'Walking',
        title: (payload.title || `${payload.type || 'Walking'} Session`).trim(),
        steps,
        distanceKm: Number(distanceKm.toFixed(2)),
        durationMin: Math.round(durationMin),
        caloriesBurned,
        notes: (payload.notes || '').trim(),
      };

      setState((prev) => ({
        ...prev,
        activities: [newActivity, ...prev.activities],
      }));

      addToast({
        title: 'Activity logged',
        message: `${newActivity.title} (${newActivity.caloriesBurned} kcal burned)`,
        type: 'success',
      });
    },
    [addToast, state.profile.weight]
  );

  const deleteActivity = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        activities: prev.activities.filter((a) => a.id !== id),
      }));
      addToast({
        title: 'Activity removed',
        message: 'Daily totals and weekly charts updated.',
        type: 'info',
      });
    },
    [addToast]
  );

  // Actions: Live Workout Timer & History
  const updateActiveWorkoutConfig = useCallback((patch) => {
    setState((prev) => ({
      ...prev,
      activeWorkout: {
        ...prev.activeWorkout,
        ...patch,
      },
    }));
  }, []);

  const startLiveWorkout = useCallback(
    (config = {}) => {
      setState((prev) => ({
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          ...config,
          isRunning: true,
          isPaused: false,
          lastTickMs: Date.now(),
        },
      }));
      addToast({
        title: 'Workout timer started',
        message: `${config.category || state.activeWorkout.category} session is live.`,
        type: 'info',
      });
    },
    [addToast, state.activeWorkout.category]
  );

  const togglePauseLiveWorkout = useCallback(() => {
    setState((prev) => {
      const nextPaused = !prev.activeWorkout.isPaused;
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          isPaused: nextPaused,
          lastTickMs: nextPaused ? null : Date.now(),
        },
      };
    });
  }, []);

  const discardLiveWorkout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeWorkout: {
        ...prev.activeWorkout,
        isRunning: false,
        isPaused: false,
        elapsedSeconds: 0,
        lastTickMs: null,
        notes: '',
      },
    }));
    addToast({
      title: 'Live session reset',
      message: 'Timer cleared without saving.',
      type: 'info',
    });
  }, [addToast]);

  const finishLiveWorkout = useCallback(
    (overrides = {}) => {
      const today = getTodayISO();
      const aw = state.activeWorkout;
      const elapsedMin = Math.max(1, Math.round(aw.elapsedSeconds / 60));
      const durationMin = Math.max(1, Number(overrides.durationMin) || elapsedMin);
      const category = overrides.category || aw.category || 'Running';
      const distanceKm =
        overrides.distanceKm !== undefined
          ? Math.max(0, Number(overrides.distanceKm) || 0)
          : category === 'Running' || category === 'Walking' || category === 'Cycling' || category === 'Swimming'
          ? Number(aw.targetDistanceKm || 0)
          : 0;
      const caloriesBurned = Math.max(
        5,
        Math.round(estimateWorkoutCalories(category, durationMin, state.profile.weight))
      );
      const steps = estimateWorkoutSteps(category, durationMin, distanceKm);

      const newWorkout = {
        id: `wrk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date: today,
        timestamp: new Date().toISOString(),
        category,
        title: (overrides.title || aw.title || `${category} Session`).trim(),
        durationMin,
        distanceKm: Number(distanceKm.toFixed(2)),
        steps,
        caloriesBurned,
        avgHeartRate: category === 'Yoga' ? 98 : category === 'Running' ? 154 : 136,
        intensity: category === 'Yoga' || category === 'Walking' ? 'Moderate' : 'High',
        notes: (overrides.notes ?? aw.notes ?? '').trim() || `Completed live ${category.toLowerCase()} session.`,
      };

      setState((prev) => ({
        ...prev,
        workouts: [newWorkout, ...prev.workouts],
        activeWorkout: {
          ...prev.activeWorkout,
          isRunning: false,
          isPaused: false,
          elapsedSeconds: 0,
          lastTickMs: null,
          notes: '',
        },
      }));

      addToast({
        title: 'Workout saved!',
        message: `${newWorkout.title} • ${durationMin} min • ${caloriesBurned} kcal burned`,
        type: 'success',
      });
    },
    [addToast, state.activeWorkout, state.profile.weight]
  );

  const addManualWorkout = useCallback(
    (payload) => {
      const date = payload.date || getTodayISO();
      const category = payload.category || 'Running';
      const durationMin = Math.max(1, Math.round(Number(payload.durationMin) || 30));
      const distanceKm = Math.max(0, Number(payload.distanceKm) || 0);
      const caloriesBurned =
        payload.caloriesBurned !== undefined && payload.caloriesBurned !== ''
          ? Math.max(1, Math.round(Number(payload.caloriesBurned)))
          : estimateWorkoutCalories(category, durationMin, state.profile.weight);
      const steps = estimateWorkoutSteps(category, durationMin, distanceKm);

      const newWorkout = {
        id: `wrk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date,
        timestamp: `${date}T12:00:00`,
        category,
        title: (payload.title || `${category} Workout`).trim(),
        durationMin,
        distanceKm: Number(distanceKm.toFixed(2)),
        steps,
        caloriesBurned,
        avgHeartRate: category === 'Yoga' ? 96 : category === 'Running' ? 151 : 134,
        intensity: category === 'Yoga' || category === 'Walking' ? 'Moderate' : 'High',
        notes: (payload.notes || '').trim(),
      };

      setState((prev) => ({
        ...prev,
        workouts: [newWorkout, ...prev.workouts],
      }));

      addToast({
        title: 'Workout logged',
        message: `${newWorkout.title} (${caloriesBurned} kcal)`,
        type: 'success',
      });
    },
    [addToast, state.profile.weight]
  );

  const deleteWorkout = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        workouts: prev.workouts.filter((w) => w.id !== id),
      }));
      addToast({
        title: 'Workout deleted',
        message: 'Workout history and statistics updated.',
        type: 'info',
      });
    },
    [addToast]
  );

  // Actions: Nutrition
  const addMeal = useCallback(
    (payload) => {
      const date = payload.date || getTodayISO();
      const calories = Math.max(1, Math.round(Number(payload.calories) || 0));
      const protein = payload.protein !== '' && payload.protein !== undefined
        ? Math.max(0, Math.round(Number(payload.protein)))
        : Math.round((calories * 0.25) / 4);
      const carbs = payload.carbs !== '' && payload.carbs !== undefined
        ? Math.max(0, Math.round(Number(payload.carbs)))
        : Math.round((calories * 0.45) / 4);
      const fat = payload.fat !== '' && payload.fat !== undefined
        ? Math.max(0, Math.round(Number(payload.fat)))
        : Math.round((calories * 0.30) / 9);

      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newMeal = {
        id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date,
        time,
        name: String(payload.name || '').trim(),
        mealType: payload.mealType || 'Breakfast',
        calories,
        protein,
        carbs,
        fat,
      };

      setState((prev) => ({
        ...prev,
        meals: [newMeal, ...prev.meals],
      }));

      addToast({
        title: 'Meal added',
        message: `${newMeal.name} (+${calories} kcal to ${newMeal.mealType})`,
        type: 'success',
      });
    },
    [addToast]
  );

  const deleteMeal = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        meals: prev.meals.filter((m) => m.id !== id),
      }));
      addToast({
        title: 'Food entry removed',
        message: 'Daily calorie totals recalculated.',
        type: 'info',
      });
    },
    [addToast]
  );

  // Actions: Hydration, Weight & Sleep
  const addWater = useCallback(
    (deltaMl, date = getTodayISO()) => {
      const delta = Math.round(Number(deltaMl) || 0);
      setState((prev) => {
        const current = Number(prev.waterLogsByDate[date]) || 0;
        return {
          ...prev,
          waterLogsByDate: {
            ...prev.waterLogsByDate,
            [date]: Math.max(0, current + delta),
          },
        };
      });
      addToast({
        title: delta >= 0 ? `Added ${delta} ml water` : `Removed ${Math.abs(delta)} ml water`,
        message: 'Hydration progress updated.',
        type: delta >= 0 ? 'success' : 'info',
      });
    },
    [addToast]
  );

  const logWeight = useCallback(
    (weightKg, note = '', date = getTodayISO()) => {
      const cleanWeight = Number(Number(weightKg).toFixed(1));
      setState((prev) => {
        const existingIndex = prev.weightLogs.findIndex((w) => w.date === date);
        const nextEntry = {
          id: existingIndex >= 0 ? prev.weightLogs[existingIndex].id : `wt-${Date.now()}`,
          date,
          weightKg: cleanWeight,
          note: note.trim() || 'Logged weigh-in',
        };
        const updatedLogs =
          existingIndex >= 0
            ? prev.weightLogs.map((item, idx) => (idx === existingIndex ? nextEntry : item))
            : [...prev.weightLogs, nextEntry].sort((a, b) => a.date.localeCompare(b.date));

        return {
          ...prev,
          weightLogs: updatedLogs,
          profile: date === getTodayISO() ? { ...prev.profile, weight: cleanWeight } : prev.profile,
        };
      });
      addToast({
        title: 'Weight logged',
        message: `${cleanWeight} kg recorded and synced to your profile.`,
        type: 'success',
      });
    },
    [addToast]
  );

  const logSleepHours = useCallback(
    (hours, date = getTodayISO()) => {
      const cleanHrs = Math.min(16, Math.max(1, Number(Number(hours).toFixed(1))));
      setState((prev) => {
        const existing = prev.healthDaily[date] || {
          restingHr: 57,
          avgHr: 74,
          maxHr: 144,
        };
        return {
          ...prev,
          healthDaily: {
            ...prev.healthDaily,
            [date]: {
              ...existing,
              sleepHours: cleanHrs,
              sleepQuality: Math.min(98, Math.round(72 + cleanHrs * 2.6)),
              deepSleepHrs: Number((cleanHrs * 0.24).toFixed(1)),
              remSleepHrs: Number((cleanHrs * 0.25).toFixed(1)),
              lightSleepHrs: Number((cleanHrs * 0.51).toFixed(1)),
            },
          },
        };
      });
      addToast({
        title: 'Sleep duration updated',
        message: `${cleanHrs} hrs recorded for ${date === getTodayISO() ? 'last night' : date}.`,
        type: 'success',
      });
    },
    [addToast]
  );

  // Actions: Goals & Profile
  const updateGoals = useCallback(
    (nextGoals) => {
      setState((prev) => ({
        ...prev,
        goals: {
          ...prev.goals,
          dailySteps: Math.max(500, Math.round(Number(nextGoals.dailySteps) || 10000)),
          dailyCaloriesBurn: Math.max(100, Math.round(Number(nextGoals.dailyCaloriesBurn) || 600)),
          dailyCaloriesIntake: Math.max(800, Math.round(Number(nextGoals.dailyCaloriesIntake) || 2200)),
          dailyWorkoutMinutes: Math.max(10, Math.round(Number(nextGoals.dailyWorkoutMinutes) || 60)),
          dailyWaterMl: Math.max(500, Math.round(Number(nextGoals.dailyWaterMl) || 3000)),
          weeklyWorkouts: Math.max(1, Math.min(14, Math.round(Number(nextGoals.weeklyWorkouts) || 5))),
        },
      }));
      addToast({
        title: 'Fitness goals saved',
        message: 'Daily targets and progress rings updated across the app.',
        type: 'success',
      });
    },
    [addToast]
  );

  const updateProfile = useCallback(
    (nextProfile) => {
      setState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...nextProfile,
          age: Math.max(13, Math.min(110, Math.round(Number(nextProfile.age) || prev.profile.age))),
          height: Math.max(100, Math.min(250, Math.round(Number(nextProfile.height) || prev.profile.height))),
          weight: Number(Number(nextProfile.weight || prev.profile.weight).toFixed(1)),
          targetWeight: Number(Number(nextProfile.targetWeight || prev.profile.targetWeight).toFixed(1)),
        },
      }));
      addToast({
        title: 'Profile updated',
        message: 'Your biometric profile and preferences are saved.',
        type: 'success',
      });
    },
    [addToast]
  );

  const resetDemoData = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    addToast({
      title: 'Demo dataset restored',
      message: 'All sample metrics, workouts, and meals have been reset.',
      type: 'info',
    });
  }, [addToast]);

  const clearAllLogs = useCallback(() => {
    setState((prev) => ({
      ...prev,
      baseStepsByDate: {},
      waterLogsByDate: {},
      activities: [],
      workouts: [],
      meals: [],
      weightLogs: [{ id: `wt-${Date.now()}`, date: getTodayISO(), weightKg: prev.profile.weight, note: 'Starting weight' }],
      activeWorkout: {
        ...prev.activeWorkout,
        isRunning: false,
        isPaused: false,
        elapsedSeconds: 0,
        lastTickMs: null,
      },
    }));
    addToast({
      title: 'All logs cleared',
      message: 'Starting fresh with your profile and goals preserved.',
      type: 'warning',
    });
  }, [addToast]);

  // Computed derived summaries
  const todayISO = getTodayISO();
  const todaySummary = useMemo(() => computeDailySummary(todayISO, state), [state, todayISO]);
  const streakDays = useMemo(() => computeStreakDays(state, todayISO), [state, todayISO]);
  const achievements = useMemo(() => computeAchievements(state, todayISO), [state, todayISO]);

  const weeklySeries = useMemo(() => {
    return Array.from({ length: 7 }, (_, idx) => {
      const date = addDaysISO(todayISO, idx - 6);
      const sum = computeDailySummary(date, state);
      const dt = new Date(`${date}T12:00:00`);
      return {
        date,
        day: dt.toLocaleDateString('en-US', { weekday: 'short' }),
        shortDate: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        steps: sum.steps,
        caloriesBurned: sum.caloriesBurned,
        caloriesConsumed: sum.caloriesConsumed,
        activeMinutes: sum.activeMinutes,
        distanceKm: sum.distanceKm,
        waterMl: sum.waterMl,
        sleepHours: sum.health.sleepHours,
        restingHr: sum.health.restingHr,
        goalCompletionPct: sum.goalCompletionPct,
      };
    });
  }, [state, todayISO]);

  const monthlySeries = useMemo(() => {
    return Array.from({ length: 30 }, (_, idx) => {
      const date = addDaysISO(todayISO, idx - 29);
      const sum = computeDailySummary(date, state);
      const dt = new Date(`${date}T12:00:00`);
      return {
        date,
        label: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        steps: sum.steps,
        caloriesBurned: sum.caloriesBurned,
        caloriesConsumed: sum.caloriesConsumed,
        activeMinutes: sum.activeMinutes,
        distanceKm: sum.distanceKm,
        goalCompletionPct: sum.goalCompletionPct,
      };
    });
  }, [state, todayISO]);

  const value = {
    state,
    todayISO,
    todaySummary,
    streakDays,
    achievements,
    weeklySeries,
    monthlySeries,
    activePage,
    setActivePage,
    themeMode,
    resolvedTheme,
    setThemeMode,
    toggleTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    toasts,
    addToast,
    dismissToast,
    announcement,
    confirmState,
    requestConfirm,
    closeConfirm,
    quickModal,
    setQuickModal,
    isModalOpen,
    addSteps,
    addActivity,
    deleteActivity,
    updateActiveWorkoutConfig,
    startLiveWorkout,
    togglePauseLiveWorkout,
    discardLiveWorkout,
    finishLiveWorkout,
    addManualWorkout,
    deleteWorkout,
    addMeal,
    deleteMeal,
    addWater,
    logWeight,
    logSleepHours,
    updateGoals,
    updateProfile,
    resetDemoData,
    clearAllLogs,
  };

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>;
}

export function useFitness() {
  const ctx = useContext(FitnessContext);
  if (!ctx) throw new Error('useFitness must be used inside FitnessProvider');
  return ctx;
}
