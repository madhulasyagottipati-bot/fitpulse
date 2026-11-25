# FitPulse — Smart Fitness & Health Analytics Dashboard

FitPulse is a responsive, interactive personal fitness and wellness SaaS web application built with React, Vite, Recharts, Lucide icons, and browser `localStorage` persistence.

## Features

- **Dashboard (Home):** Personalized time-of-day greeting, circular daily goal completion ring, 4 live metric cards (steps, calories burned, distance, active duration), weekly activity chart, calorie intake vs. burn comparison, recent workout history, daily goal breakdown, quick-action modals, and motivational quotes.
- **Activity Tracker:** Instant step quick-add buttons, manual step check-ins, walking/running/cardio logger with automatic MET calorie and step estimation, 7-day summaries, and searchable/filterable activity logs.
- **Workout Tracker:** Live workout studio supporting 7 categories (*Running, Walking, Cycling, Swimming, Gym, Yoga, Strength Training*), live `HH:MM:SS` timer, real-time calorie burn counter, pause/resume/finish controls, manual past-workout logging, workout details modal, and search/category/sort filtering.
- **Nutrition Tracker:** Food diary across *Breakfast, Lunch, Dinner,* and *Snacks*, quick-add healthy presets, dynamic total/target/remaining calorie calculation, macro breakdown, and interactive Recharts meal distribution donut chart.
- **Health Metrics:** Resting & 24-hour heart rate curve (clearly labeled simulated wearable telemetry), sleep duration & stage breakdown, interactive hydration tracker, weight logging & trend chart, and a real-time interactive BMI calculator with visual spectrum gauge.
- **Goals & Achievements:** Editable daily and weekly targets (steps, burn, calorie intake, workout minutes, water, weekly workouts) with live progress indicators and dynamic achievement badges (*First Workout, 10K Steps, 7-Day Streak, Fitness Champion,* and bonus milestones).
- **Reports & Analytics:** Interactive 7/14/30-day analytics powered by Recharts covering weekly activity, monthly calorie trends, step count week-over-week comparison, workout frequency & category mix, weight progress against goal, and daily goal completion rates, plus JSON export.
- **Profile & Settings:** Editable biometric profile (with BMR/TDEE & BMI insights), avatar gradient picker & photo upload, Dark / Light / System theme switcher, collapsible sidebar toggle, and LocalStorage backup/reset controls.

## Technology Stack

- **Frontend Framework:** React 18 (Vite)
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Styling:** Modern CSS3 with glassmorphism surfaces, custom properties (`light-dark()`, `@property` animated progress rings), native `<dialog>` modals, and responsive breakpoints
- **Persistence:** Client-side `localStorage` (no backend required)

## Project Structure

```text
fitpulse/
├── public/
│   └── assets/
│       └── fitpulse-logo.svg
├── src/
│   ├── components/
│   │   ├── ActivityChart.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── Header.jsx
│   │   ├── HeroIllustration.jsx
│   │   ├── MetricCard.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── ProgressRing.jsx
│   │   ├── QuickActionModal.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ToastContainer.jsx
│   │   └── WorkoutCard.jsx
│   ├── context/
│   │   └── FitnessContext.jsx
│   ├── pages/
│   │   ├── Activity.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Goals.jsx
│   │   ├── HealthMetrics.jsx
│   │   ├── Nutrition.jsx
│   │   ├── Profile.jsx
│   │   ├── Reports.jsx
│   │   └── Workouts.jsx
│   ├── utils/
│   │   ├── calculations.js
│   │   └── sampleData.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

1. Navigate to the project folder:
   ```bash
   cd fitpulse
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
