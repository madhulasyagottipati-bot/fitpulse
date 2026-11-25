export const WORKOUT_CATEGORIES = {
  Running: {
    label: 'Running',
    met: 9.8,
    stepsPerMin: 155,
    defaultSpeedKmh: 9.5,
    color: '#22C55E',
    intensity: 'High',
  },
  Walking: {
    label: 'Walking',
    met: 3.8,
    stepsPerMin: 108,
    defaultSpeedKmh: 5.2,
    color: '#38BDF8',
    intensity: 'Moderate',
  },
  Cycling: {
    label: 'Cycling',
    met: 7.5,
    stepsPerMin: 0,
    defaultSpeedKmh: 21.0,
    color: '#A855F7',
    intensity: 'High',
  },
  Swimming: {
    label: 'Swimming',
    met: 8.3,
    stepsPerMin: 0,
    defaultSpeedKmh: 2.6,
    color: '#06B6D4',
    intensity: 'High',
  },
  Gym: {
    label: 'Gym',
    met: 6.0,
    stepsPerMin: 35,
    defaultSpeedKmh: 0,
    color: '#F59E0B',
    intensity: 'Moderate-High',
  },
  Yoga: {
    label: 'Yoga',
    met: 3.0,
    stepsPerMin: 0,
    defaultSpeedKmh: 0,
    color: '#EC4899',
    intensity: 'Low-Moderate',
  },
  'Strength Training': {
    label: 'Strength Training',
    met: 5.8,
    stepsPerMin: 15,
    defaultSpeedKmh: 0,
    color: '#10B981',
    intensity: 'Moderate-High',
  },
};

export const ACTIVITY_TYPES = {
  Walking: { label: 'Walking', met: 3.8, stepsPerKm: 1320, defaultKmh: 5.2 },
  Running: { label: 'Running', met: 9.8, stepsPerKm: 1220, defaultKmh: 9.6 },
  'Trail Run': { label: 'Trail Run', met: 10.5, stepsPerKm: 1280, defaultKmh: 8.4 },
  Treadmill: { label: 'Treadmill', met: 8.5, stepsPerKm: 1250, defaultKmh: 8.8 },
  Hiking: { label: 'Hiking', met: 6.2, stepsPerKm: 1380, defaultKmh: 4.5 },
  Cycling: { label: 'Cycling', met: 7.5, stepsPerKm: 0, defaultKmh: 20.0 },
};

export function pad2(value) {
  return String(value).padStart(2, '0');
}

export function getTodayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export function parseISODate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysISO(isoDate, deltaDays) {
  const dt = parseISODate(isoDate);
  dt.setDate(dt.getDate() + deltaDays);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

export function formatDisplayDate(isoDate, options) {
  const dt = parseISODate(isoDate);
  return dt.toLocaleDateString(
    'en-US',
    options || { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  );
}

export function formatShortDate(isoDate) {
  const dt = parseISODate(isoDate);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatShortDay(isoDate) {
  const dt = parseISODate(isoDate);
  return dt.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDurationSeconds(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return `${pad2(hrs)}:${pad2(mins)}:${pad2(secs)}`;
}

export function formatDurationMinutes(minutes) {
  const safe = Math.max(0, Math.round(minutes));
  if (safe < 60) return `${safe} min`;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function getGreeting(name = 'Athlete') {
  const hour = new Date().getHours();
  const firstName = String(name || 'Athlete').trim().split(/\s+/)[0];
  if (hour < 12) return `Good morning, ${firstName}`;
  if (hour < 17) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
}

export function estimateWorkoutCalories(category, durationMin, weightKg = 74.5) {
  const meta = WORKOUT_CATEGORIES[category] || ACTIVITY_TYPES[category] || { met: 5.5 };
  const safeWeight = Number(weightKg) > 25 ? Number(weightKg) : 74.5;
  const safeDuration = Math.max(0, Number(durationMin) || 0);
  return Math.round(((meta.met * 3.5 * safeWeight) / 200) * safeDuration);
}

export function estimateWorkoutSteps(category, durationMin, distanceKm = 0) {
  const catMeta = WORKOUT_CATEGORIES[category];
  if (catMeta) {
    if (catMeta.stepsPerMin === 0) return 0;
    if ((category === 'Running' || category === 'Walking') && Number(distanceKm) > 0) {
      const perKm = category === 'Running' ? 1220 : 1320;
      return Math.round(Number(distanceKm) * perKm);
    }
    return Math.round(Math.max(0, Number(durationMin) || 0) * catMeta.stepsPerMin);
  }
  const actMeta = ACTIVITY_TYPES[category];
  if (actMeta) {
    if (actMeta.stepsPerKm === 0) return 0;
    if (Number(distanceKm) > 0) return Math.round(Number(distanceKm) * actMeta.stepsPerKm);
    return Math.round(Math.max(0, Number(durationMin) || 0) * 115);
  }
  return 0;
}

export function estimateDistanceFromSteps(steps) {
  return Number((Math.max(0, Number(steps) || 0) * 0.00076).toFixed(2));
}

export function calculateBMI(weightKg, heightCm) {
  const weight = Number(weightKg);
  const height = Number(heightCm);
  if (!weight || !height || weight <= 0 || height <= 0) {
    return {
      bmi: 0,
      category: 'Invalid Input',
      tone: 'muted',
      healthyMinKg: 0,
      healthyMaxKg: 0,
      pointerPercent: 0,
      guidance: 'Enter valid height and weight measurements.',
    };
  }
  const heightM = height / 100;
  const rawBmi = weight / (heightM * heightM);
  const bmi = Number(rawBmi.toFixed(1));
  const healthyMinKg = Number((18.5 * heightM * heightM).toFixed(1));
  const healthyMaxKg = Number((24.9 * heightM * heightM).toFixed(1));

  let category = 'Normal Weight';
  let tone = 'success';
  let guidance = 'You are within the balanced healthy weight range. Maintain consistent activity and protein intake.';

  if (bmi < 18.5) {
    category = 'Underweight';
    tone = 'info';
    guidance = 'Consider gradual strength training and a slight caloric surplus focused on nutrient-dense meals.';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    tone = 'warning';
    guidance = 'A gentle 300–400 kcal daily deficit paired with regular cardio and resistance training supports steady progress.';
  } else if (bmi >= 30) {
    category = 'Obesity Range';
    tone = 'danger';
    guidance = 'Focus on low-impact daily movement, hydration, and sustainable nutrition habits. Consult a clinician for tailored targets.';
  }

  // Map BMI 14..38 onto 0..100% scale cleanly
  const pointerPercent = Math.min(100, Math.max(0, ((bmi - 14) / (38 - 14)) * 100));

  return {
    bmi,
    category,
    tone,
    healthyMinKg,
    healthyMaxKg,
    pointerPercent,
    guidance,
  };
}

export function calculateBMRAndTDEE(profile) {
  const age = Number(profile?.age) || 27;
  const height = Number(profile?.height) || 178;
  const weight = Number(profile?.weight) || 74.5;
  // Mifflin-St Jeor neutral baseline
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  const multipliers = {
    Sedentary: 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    Athlete: 1.9,
  };
  const mult = multipliers[profile?.activityLevel] || 1.55;
  const tdee = Math.round(bmr * mult);
  return { bmr, tdee };
}

export function computeDailySummary(date, state) {
  const {
    baseStepsByDate = {},
    activities = [],
    workouts = [],
    meals = [],
    waterLogsByDate = {},
    healthDaily = {},
    goals = {},
  } = state;

  const dayActivities = activities.filter((a) => a.date === date);
  const dayWorkouts = workouts.filter((w) => w.date === date);
  const dayMeals = meals.filter((m) => m.date === date);

  const activitySteps = dayActivities.reduce((sum, a) => sum + (Number(a.steps) || 0), 0);
  const workoutSteps = dayWorkouts.reduce((sum, w) => sum + (Number(w.steps) || 0), 0);
  const baseSteps = Number(baseStepsByDate[date]) || 0;
  const steps = Math.max(0, Math.round(baseSteps + activitySteps + workoutSteps));

  const activityDistance = dayActivities.reduce((sum, a) => sum + (Number(a.distanceKm) || 0), 0);
  const workoutDistance = dayWorkouts.reduce((sum, w) => sum + (Number(w.distanceKm) || 0), 0);
  // If user only added manual steps without activities, include passive walking distance gracefully
  const passiveDistance = baseSteps > 0 && activityDistance === 0 && workoutDistance === 0
    ? estimateDistanceFromSteps(baseSteps)
    : 0;
  const distanceKm = Number((activityDistance + workoutDistance + passiveDistance).toFixed(2));

  const activityCalories = dayActivities.reduce((sum, a) => sum + (Number(a.caloriesBurned) || 0), 0);
  const workoutCalories = dayWorkouts.reduce((sum, w) => sum + (Number(w.caloriesBurned) || 0), 0);
  const passiveStepBurn = Math.round(baseSteps * 0.032);
  const caloriesBurned = Math.round(activityCalories + workoutCalories + passiveStepBurn);

  const activityMinutes = dayActivities.reduce((sum, a) => sum + (Number(a.durationMin) || 0), 0);
  const workoutMinutes = dayWorkouts.reduce((sum, w) => sum + (Number(w.durationMin) || 0), 0);
  const activeMinutes = Math.round(activityMinutes + workoutMinutes);

  const caloriesConsumed = Math.round(
    dayMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0)
  );
  const proteinG = Math.round(dayMeals.reduce((sum, m) => sum + (Number(m.protein) || 0), 0));
  const carbsG = Math.round(dayMeals.reduce((sum, m) => sum + (Number(m.carbs) || 0), 0));
  const fatG = Math.round(dayMeals.reduce((sum, m) => sum + (Number(m.fat) || 0), 0));

  const waterMl = Math.max(0, Math.round(Number(waterLogsByDate[date]) || 0));
  const health = healthDaily[date] || {
    restingHr: 58,
    avgHr: 74,
    maxHr: 142,
    sleepHours: 7.5,
    sleepQuality: 86,
    deepSleepHrs: 1.8,
    remSleepHrs: 1.9,
    lightSleepHrs: 3.8,
  };

  const stepGoal = Math.max(1, Number(goals.dailySteps) || 10000);
  const burnGoal = Math.max(1, Number(goals.dailyCaloriesBurn) || 600);
  const minGoal = Math.max(1, Number(goals.dailyWorkoutMinutes) || 45);
  const waterGoal = Math.max(1, Number(goals.dailyWaterMl) || 3000);

  const stepPct = Math.min(100, (steps / stepGoal) * 100);
  const burnPct = Math.min(100, (caloriesBurned / burnGoal) * 100);
  const minPct = Math.min(100, (activeMinutes / minGoal) * 100);
  const waterPct = Math.min(100, (waterMl / waterGoal) * 100);

  const goalCompletionPct = Math.round((stepPct + burnPct + minPct + waterPct) / 4);

  return {
    date,
    steps,
    distanceKm,
    caloriesBurned,
    activeMinutes,
    caloriesConsumed,
    macros: { protein: proteinG, carbs: carbsG, fat: fatG },
    waterMl,
    workoutsCount: dayWorkouts.length,
    activitiesCount: dayActivities.length,
    health,
    goalCompletionPct,
    subProgress: {
      steps: Math.round((steps / stepGoal) * 100),
      caloriesBurned: Math.round((caloriesBurned / burnGoal) * 100),
      activeMinutes: Math.round((activeMinutes / minGoal) * 100),
      waterMl: Math.round((waterMl / waterGoal) * 100),
    },
  };
}

export function computeStreakDays(state, todayISO = getTodayISO()) {
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = addDaysISO(todayISO, -i);
    const summary = computeDailySummary(d, state);
    const isActive =
      summary.steps >= 5000 || summary.workoutsCount > 0 || summary.activitiesCount > 0;
    if (isActive) {
      streak += 1;
    } else if (i === 0) {
      // Allow today to still be in progress without breaking yesterday's streak
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function computeMotivationalMessage(completionPct, streakDays, name = 'Athlete') {
  const firstName = String(name || 'Athlete').trim().split(/\s+/)[0];
  if (completionPct >= 100) {
    return `Outstanding work, ${firstName}! You crushed 100% of today's fitness targets (${streakDays}-day streak active).`;
  }
  if (completionPct >= 75) {
    return `Almost at the finish line, ${firstName}! One short session or walk locks in your ${streakDays}-day streak.`;
  }
  if (completionPct >= 40) {
    return `Solid momentum today, ${firstName}. Keep hydrating and stay consistent toward your daily rings.`;
  }
  if (completionPct > 0) {
    return `Great start, ${firstName}! Every step and rep builds long-term metabolic fitness.`;
  }
  return `Fresh slate today, ${firstName}. Start a quick workout or log a morning walk to spark your streak.`;
}

export function computeAchievements(state, todayISO = getTodayISO()) {
  const workouts = state.workouts || [];
  const activities = state.activities || [];
  const meals = state.meals || [];
  const goals = state.goals || {};
  const streakDays = computeStreakDays(state, todayISO);

  // Max steps on any single day in last 30 days
  let maxSingleDaySteps = 0;
  let maxGoalCompletion = 0;
  let totalDistanceKm = 0;
  let maxSingleWorkoutBurn = 0;

  for (let i = 0; i < 30; i++) {
    const d = addDaysISO(todayISO, -i);
    const s = computeDailySummary(d, state);
    if (s.steps > maxSingleDaySteps) maxSingleDaySteps = s.steps;
    if (s.goalCompletionPct > maxGoalCompletion) maxGoalCompletion = s.goalCompletionPct;
    totalDistanceKm += s.distanceKm;
  }

  for (const w of workouts) {
    if ((Number(w.caloriesBurned) || 0) > maxSingleWorkoutBurn) {
      maxSingleWorkoutBurn = Number(w.caloriesBurned) || 0;
    }
  }
  for (const a of activities) {
    if ((Number(a.caloriesBurned) || 0) > maxSingleWorkoutBurn) {
      maxSingleWorkoutBurn = Number(a.caloriesBurned) || 0;
    }
  }

  const todaySummary = computeDailySummary(todayISO, state);
  const todayMeals = meals.filter((m) => m.date === todayISO);
  const mealTypesToday = new Set(todayMeals.map((m) => m.mealType)).size;
  const totalWorkouts = workouts.length;

  const badges = [
    {
      id: 'first-workout',
      title: 'First Workout',
      description: 'Complete and save your first tracked workout session.',
      tier: 'Starter',
      iconKey: 'dumbbell',
      progressCurrent: Math.min(1, totalWorkouts),
      progressTarget: 1,
      unlocked: totalWorkouts >= 1,
    },
    {
      id: 'ten-k-steps',
      title: '10K Steps',
      description: 'Reach 10,000 or more steps in a single day.',
      tier: 'Silver',
      iconKey: 'footprints',
      progressCurrent: Math.min(10000, maxSingleDaySteps),
      progressTarget: 10000,
      unlocked: maxSingleDaySteps >= 10000,
    },
    {
      id: 'seven-day-streak',
      title: '7-Day Streak',
      description: 'Stay active for 7 consecutive days (5,000+ steps or workout).',
      tier: 'Gold',
      iconKey: 'flame',
      progressCurrent: Math.min(7, streakDays),
      progressTarget: 7,
      unlocked: streakDays >= 7,
    },
    {
      id: 'fitness-champion',
      title: 'Fitness Champion',
      description: 'Log 15+ total workouts and hit 100% daily goal completion.',
      tier: 'Platinum',
      iconKey: 'trophy',
      progressCurrent: Math.min(15, totalWorkouts),
      progressTarget: 15,
      unlocked: totalWorkouts >= 15 && maxGoalCompletion >= 100,
    },
    {
      id: 'hydration-hero',
      title: 'Hydration Hero',
      description: 'Meet or exceed your daily water intake goal today.',
      tier: 'Bronze',
      iconKey: 'droplets',
      progressCurrent: Math.min(goals.dailyWaterMl || 3000, todaySummary.waterMl),
      progressTarget: goals.dailyWaterMl || 3000,
      unlocked: todaySummary.waterMl >= (goals.dailyWaterMl || 3000),
    },
    {
      id: 'calorie-crusher',
      title: 'Calorie Crusher',
      description: 'Burn 450+ kcal in a single workout or cardio session.',
      tier: 'Gold',
      iconKey: 'zap',
      progressCurrent: Math.min(450, maxSingleWorkoutBurn),
      progressTarget: 450,
      unlocked: maxSingleWorkoutBurn >= 450,
    },
    {
      id: 'balanced-fuel',
      title: 'Balanced Fuel',
      description: 'Log entries across all 4 meal slots (Breakfast, Lunch, Dinner, Snacks) today.',
      tier: 'Silver',
      iconKey: 'utensils',
      progressCurrent: mealTypesToday,
      progressTarget: 4,
      unlocked: mealTypesToday >= 4,
    },
    {
      id: 'distance-explorer',
      title: '50K Explorer',
      description: 'Cover 50 km total distance over the last 30 days.',
      tier: 'Platinum',
      iconKey: 'map-pin',
      progressCurrent: Math.min(50, Math.round(totalDistanceKm)),
      progressTarget: 50,
      unlocked: totalDistanceKm >= 50,
    },
  ];

  return badges.map((b) => ({
    ...b,
    progressPct: Math.min(100, Math.round((b.progressCurrent / b.progressTarget) * 100)),
  }));
}
