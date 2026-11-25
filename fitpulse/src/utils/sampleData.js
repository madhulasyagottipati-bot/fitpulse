import { addDaysISO, getTodayISO } from './calculations.js';

export const MOTIVATIONAL_QUOTES = [
  {
    quote: 'Consistency beats intensity when intensity cannot be repeated tomorrow.',
    author: 'FitPulse Coaching Lab',
  },
  {
    quote: 'Take care of your body. It is the only place you have to live.',
    author: 'Jim Rohn',
  },
  {
    quote: 'Small daily habits compound into extraordinary cardiovascular resilience.',
    author: 'Sports Performance Journal',
  },
  {
    quote: 'The hardest step of any workout is deciding to start the timer.',
    author: 'FitPulse Community',
  },
  {
    quote: 'Discipline is choosing between what you want now and what you want most.',
    author: 'Abraham Lincoln',
  },
];

export const FOOD_PRESETS = [
  { name: 'Oatmeal, Berries & Chia', calories: 340, mealType: 'Breakfast', protein: 14, carbs: 52, fat: 8 },
  { name: 'Avocado Egg Sourdough Toast', calories: 410, mealType: 'Breakfast', protein: 19, carbs: 36, fat: 21 },
  { name: 'Grilled Chicken Quinoa Bowl', calories: 560, mealType: 'Lunch', protein: 46, carbs: 54, fat: 16 },
  { name: 'Salmon & Sweet Potato Greens', calories: 620, mealType: 'Dinner', protein: 44, carbs: 48, fat: 24 },
  { name: 'Whey Protein Banana Shake', calories: 260, mealType: 'Snacks', protein: 28, carbs: 26, fat: 4 },
  { name: 'Greek Yogurt & Roasted Almonds', calories: 220, mealType: 'Snacks', protein: 17, carbs: 14, fat: 11 },
];

export const AVATAR_OPTIONS = [
  { id: 'pulse-emerald', label: 'Emerald Pulse', gradient: 'linear-gradient(135deg, #22C55E, #10B981)', initialsBg: '#064E3B' },
  { id: 'electric-sky', label: 'Electric Sky', gradient: 'linear-gradient(135deg, #38BDF8, #2563EB)', initialsBg: '#0C4A6E' },
  { id: 'aurora-duo', label: 'Aurora Duo', gradient: 'linear-gradient(135deg, #22C55E, #38BDF8)', initialsBg: '#0F172A' },
  { id: 'solar-amber', label: 'Solar Energy', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)', initialsBg: '#7C2D12' },
  { id: 'violet-stride', label: 'Violet Stride', gradient: 'linear-gradient(135deg, #A855F7, #EC4899)', initialsBg: '#581C87' },
];

export const SIMULATED_HOURLY_HR = [
  { hour: '00:00', bpm: 56, zone: 'Rest' },
  { hour: '03:00', bpm: 54, zone: 'Deep Sleep' },
  { hour: '06:00', bpm: 60, zone: 'Wake' },
  { hour: '07:30', bpm: 124, zone: 'Cardio' },
  { hour: '09:00', bpm: 74, zone: 'Recovery' },
  { hour: '12:00', bpm: 81, zone: 'Active' },
  { hour: '15:00', bpm: 76, zone: 'Active' },
  { hour: '18:00', bpm: 144, zone: 'Peak' },
  { hour: '20:00', bpm: 79, zone: 'Recovery' },
  { hour: '22:00', bpm: 64, zone: 'Wind Down' },
];

export function createInitialState() {
  const today = getTodayISO();

  const baseStepsByDate = {};
  const waterLogsByDate = {};
  const healthDaily = {};
  const activities = [];
  const workouts = [];
  const meals = [];

  const workoutTemplates = [
    { category: 'Running', title: 'Tempo Morning Run', durationMin: 36, distanceKm: 5.8, caloriesBurned: 430, avgHeartRate: 152, notes: 'Steady negative splits around the lake trail.' },
    { category: 'Strength Training', title: 'Upper Body Push & Pull', durationMin: 48, distanceKm: 0, caloriesBurned: 335, avgHeartRate: 128, notes: 'Progressive overload on incline press and weighted rows.' },
    { category: 'Cycling', title: 'Endurance Road Spin', durationMin: 45, distanceKm: 15.6, caloriesBurned: 410, avgHeartRate: 141, notes: 'Zone 2 cadence drill at 90 RPM average.' },
    { category: 'Yoga', title: 'Mobility & Core Flow', durationMin: 32, distanceKm: 0, caloriesBurned: 130, avgHeartRate: 96, notes: 'Hip flexor release and thoracic spine mobility.' },
    { category: 'Swimming', title: 'Freestyle Lap Intervals', durationMin: 35, distanceKm: 1.4, caloriesBurned: 355, avgHeartRate: 138, notes: '14x100m threshold sets with 20s rest.' },
    { category: 'Walking', title: 'Evening Recovery Stroll', durationMin: 30, distanceKm: 2.6, caloriesBurned: 140, avgHeartRate: 102, notes: 'Easy outdoor sunset walk.' },
    { category: 'Gym', title: 'Metabolic Kettlebell Circuit', durationMin: 40, distanceKm: 0, caloriesBurned: 360, avgHeartRate: 146, notes: '5 rounds EMOM swings, goblet squats, battle ropes.' },
  ];

  // Populate 29 previous days (-29 to -1)
  for (let offset = 29; offset >= 1; offset--) {
    const date = addDaysISO(today, -offset);
    const wave = (offset * 7) % 10;

    // Base passive steps + activities -> realistic 6,800 to 12,400 daily totals
    baseStepsByDate[date] = 4200 + wave * 280;
    waterLogsByDate[date] = 2250 + (wave % 4) * 250;

    const sleepHours = Number((6.9 + (wave % 5) * 0.3).toFixed(1));
    healthDaily[date] = {
      restingHr: 56 + (wave % 5),
      avgHr: 71 + (wave % 6),
      maxHr: 134 + (wave % 5) * 6,
      sleepHours,
      sleepQuality: Math.min(96, Math.round(74 + sleepHours * 2.5)),
      deepSleepHrs: Number((sleepHours * 0.24).toFixed(1)),
      remSleepHrs: Number((sleepHours * 0.25).toFixed(1)),
      lightSleepHrs: Number((sleepHours * 0.51).toFixed(1)),
    };

    // Add daily movement activity for almost every day to keep week-over-week rich
    if (offset % 5 !== 0) {
      const isRun = offset % 3 === 0;
      const dist = isRun ? Number((4.2 + (wave % 4) * 0.6).toFixed(1)) : Number((2.4 + (wave % 3) * 0.5).toFixed(1));
      const dur = isRun ? Math.round(dist * 6.2) : Math.round(dist * 11.2);
      const steps = Math.round(dist * (isRun ? 1220 : 1320));
      const cals = Math.round(dur * (isRun ? 11.4 : 4.8));
      activities.push({
        id: `act-hist-${offset}`,
        date,
        type: isRun ? 'Running' : 'Walking',
        title: isRun ? 'Neighborhood Stride Run' : 'Midday Step Walk',
        steps,
        distanceKm: dist,
        durationMin: dur,
        caloriesBurned: cals,
        notes: 'Logged outdoor movement session.',
      });
    }

    // Add structured workouts ~5 days/week (skipping every 4th & 7th day)
    if (offset % 4 !== 0 && offset % 7 !== 0) {
      const tpl = workoutTemplates[offset % workoutTemplates.length];
      const wSteps = tpl.category === 'Running'
        ? Math.round(tpl.distanceKm * 1220)
        : tpl.category === 'Walking'
        ? Math.round(tpl.distanceKm * 1320)
        : 0;
      workouts.push({
        id: `wrk-hist-${offset}`,
        date,
        timestamp: `${date}T07:30:00`,
        category: tpl.category,
        title: tpl.title,
        durationMin: tpl.durationMin,
        distanceKm: tpl.distanceKm,
        steps: wSteps,
        caloriesBurned: tpl.caloriesBurned,
        avgHeartRate: tpl.avgHeartRate,
        intensity: tpl.category === 'Yoga' || tpl.category === 'Walking' ? 'Moderate' : 'High',
        notes: tpl.notes,
      });
    }

    // Historical daily nutrition entries for realistic monthly calorie trends
    const dailyIntake = 1920 + ((offset * 97) % 440);
    meals.push(
      {
        id: `meal-hist-${offset}-b`,
        date,
        time: '08:15',
        name: 'Protein Oatmeal & Berries',
        mealType: 'Breakfast',
        calories: Math.round(dailyIntake * 0.24),
        protein: 22,
        carbs: 54,
        fat: 12,
      },
      {
        id: `meal-hist-${offset}-l`,
        date,
        time: '13:00',
        name: 'Mediterranean Power Bowl',
        mealType: 'Lunch',
        calories: Math.round(dailyIntake * 0.36),
        protein: 42,
        carbs: 58,
        fat: 18,
      },
      {
        id: `meal-hist-${offset}-d`,
        date,
        time: '19:30',
        name: 'Herb Salmon & Roasted Veggies',
        mealType: 'Dinner',
        calories: Math.round(dailyIntake * 0.30),
        protein: 40,
        carbs: 42,
        fat: 20,
      },
      {
        id: `meal-hist-${offset}-s`,
        date,
        time: '16:15',
        name: 'Greek Yogurt & Almonds',
        mealType: 'Snacks',
        calories: Math.round(dailyIntake * 0.10),
        protein: 15,
        carbs: 14,
        fat: 9,
      }
    );
  }

  // Today's live populated state (tuned around 70%-83% so user can complete goals live!)
  baseStepsByDate[today] = 4640;
  waterLogsByDate[today] = 2000;
  healthDaily[today] = {
    restingHr: 57,
    avgHr: 74,
    maxHr: 146,
    sleepHours: 7.7,
    sleepQuality: 89,
    deepSleepHrs: 1.9,
    remSleepHrs: 2.0,
    lightSleepHrs: 3.8,
  };

  activities.unshift({
    id: 'act-today-1',
    date: today,
    type: 'Walking',
    title: 'Morning Park Walk',
    steps: 3200,
    distanceKm: 2.5,
    durationMin: 26,
    caloriesBurned: 142,
    notes: 'Brisk morning sunlight walk before work.',
  });

  workouts.unshift({
    id: 'wrk-today-1',
    date: today,
    timestamp: `${today}T07:15:00`,
    category: 'Gym',
    title: 'HIIT Core & Kettlebell Circuit',
    durationMin: 24,
    distanceKm: 0,
    steps: 0,
    caloriesBurned: 278,
    avgHeartRate: 144,
    intensity: 'High',
    notes: '4 rounds of kettlebell swings, goblet squats, and plank variations.',
  });

  meals.unshift(
    {
      id: 'meal-today-1',
      date: today,
      time: '08:10',
      name: 'Oatmeal, Blueberries & Whey Scoop',
      mealType: 'Breakfast',
      calories: 430,
      protein: 29,
      carbs: 54,
      fat: 10,
    },
    {
      id: 'meal-today-2',
      date: today,
      time: '12:50',
      name: 'Grilled Chicken Quinoa Bowl',
      mealType: 'Lunch',
      calories: 640,
      protein: 48,
      carbs: 58,
      fat: 20,
    },
    {
      id: 'meal-today-3',
      date: today,
      time: '16:20',
      name: 'Greek Yogurt & Roasted Almonds',
      mealType: 'Snacks',
      calories: 250,
      protein: 18,
      carbs: 15,
      fat: 12,
    }
  );

  // Weight progress history over the last 30 days
  const weightLogs = [
    { id: 'wt-1', date: addDaysISO(today, -28), weightKg: 76.4, note: 'Baseline start of block' },
    { id: 'wt-2', date: addDaysISO(today, -24), weightKg: 76.1, note: 'Consistent hydration' },
    { id: 'wt-3', date: addDaysISO(today, -20), weightKg: 75.8, note: 'Post-tempo weigh-in' },
    { id: 'wt-4', date: addDaysISO(today, -16), weightKg: 75.6, note: 'Steady energy' },
    { id: 'wt-5', date: addDaysISO(today, -12), weightKg: 75.2, note: 'Morning fasted' },
    { id: 'wt-6', date: addDaysISO(today, -8), weightKg: 74.9, note: 'Mid-cycle check' },
    { id: 'wt-7', date: addDaysISO(today, -4), weightKg: 74.7, note: 'Feeling leaner' },
    { id: 'wt-8', date: today, weightKg: 74.5, note: 'Morning fasted check-in' },
  ];

  return {
    version: 1,
    profile: {
      name: 'Alex Rivera',
      email: 'alex.rivera@fitpulse.io',
      age: 27,
      height: 178,
      weight: 74.5,
      targetWeight: 72.0,
      fitnessGoal: 'Improve Endurance',
      activityLevel: 'Very Active',
      avatar: 'aurora-duo',
      customAvatarUrl: '',
    },
    goals: {
      dailySteps: 10000,
      dailyCaloriesBurn: 600,
      dailyCaloriesIntake: 2200,
      dailyWorkoutMinutes: 60,
      dailyWaterMl: 3000,
      weeklyWorkouts: 5,
    },
    baseStepsByDate,
    waterLogsByDate,
    healthDaily,
    activities,
    workouts,
    meals,
    weightLogs,
    activeWorkout: {
      isRunning: false,
      isPaused: false,
      category: 'Running',
      title: 'Evening Interval Run',
      elapsedSeconds: 0,
      lastTickMs: null,
      targetDistanceKm: 5.0,
      notes: '',
    },
  };
}
