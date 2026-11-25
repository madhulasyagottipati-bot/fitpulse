import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Coffee,
  Cookie,
  Moon,
  Plus,
  Search,
  Sun,
  Trash2,
  Utensils,
} from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import { useFitness } from '../context/FitnessContext';
import { FOOD_PRESETS } from '../utils/sampleData';

const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const SLOT_COLORS = {
  Breakfast: '#22C55E',
  Lunch: '#38BDF8',
  Dinner: '#A855F7',
  Snacks: '#F59E0B',
};
const SLOT_ICONS = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Moon,
  Snacks: Cookie,
};

function MealPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="fp-chart-tooltip">
      <div style={{ fontWeight: 700 }}>{item.name}</div>
      <div style={{ color: item.payload.color, fontWeight: 600 }}>
        {Number(item.value).toLocaleString()} kcal
      </div>
    </div>
  );
}

export default function Nutrition() {
  const {
    state,
    todayISO,
    todaySummary,
    addMeal,
    deleteMeal,
    requestConfirm,
  } = useFitness();

  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [formError, setFormError] = useState('');

  const [slotFilter, setSlotFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const dayMeals = useMemo(() => {
    return state.meals.filter((m) => m.date === selectedDate);
  }, [state.meals, selectedDate]);

  const totalConsumed = useMemo(
    () => dayMeals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0),
    [dayMeals]
  );

  const macroTotals = useMemo(
    () =>
      dayMeals.reduce(
        (acc, m) => ({
          protein: acc.protein + (Number(m.protein) || 0),
          carbs: acc.carbs + (Number(m.carbs) || 0),
          fat: acc.fat + (Number(m.fat) || 0),
        }),
        { protein: 0, carbs: 0, fat: 0 }
      ),
    [dayMeals]
  );

  const target = state.goals.dailyCaloriesIntake || 2200;
  const remaining = target - totalConsumed;

  const pieData = useMemo(() => {
    return MEAL_SLOTS.map((slot) => ({
      name: slot,
      value: dayMeals
        .filter((m) => m.mealType === slot)
        .reduce((sum, m) => sum + (Number(m.calories) || 0), 0),
      color: SLOT_COLORS[slot],
    })).filter((item) => item.value > 0);
  }, [dayMeals]);

  const filteredMeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dayMeals
      .filter((m) => (slotFilter === 'All' ? true : m.mealType === slotFilter))
      .filter((m) => !q || m.name.toLowerCase().includes(q));
  }, [dayMeals, slotFilter, searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cal = Number(calories);
    if (!name.trim()) {
      setFormError('Please enter a food item name.');
      return;
    }
    if (!Number.isFinite(cal) || cal <= 0 || cal > 5000) {
      setFormError('Please enter calories between 1 and 5,000 kcal.');
      return;
    }
    setFormError('');
    addMeal({
      name: name.trim(),
      calories: cal,
      mealType,
      protein,
      carbs,
      fat,
      date: selectedDate,
    });
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  return (
    <div className="fp-page">
      {/* Summary Metric Cards */}
      <section className="fp-grid-4" aria-label="Daily nutrition summary">
        <MetricCard
          title="Calories Consumed"
          value={totalConsumed.toLocaleString()}
          unit="kcal"
          icon={Utensils}
          accent="blue"
          badgeText={`${dayMeals.length} items`}
          progress={Math.round((totalConsumed / target) * 100)}
          targetLabel={`${totalConsumed.toLocaleString()} / ${target.toLocaleString()} kcal`}
        />
        <MetricCard
          title="Daily Calorie Target"
          value={target.toLocaleString()}
          unit="kcal"
          icon={Sun}
          accent="green"
          badgeText="Goal"
        />
        <MetricCard
          title={remaining >= 0 ? 'Remaining Calories' : 'Over Daily Target'}
          value={Math.abs(remaining).toLocaleString()}
          unit="kcal"
          icon={Coffee}
          accent={remaining >= 0 ? 'green' : 'amber'}
          badgeText={remaining >= 0 ? 'Available' : 'Surplus'}
        />
        <MetricCard
          title="Macro Balance"
          value={`${macroTotals.protein}g P`}
          unit={`/ ${macroTotals.carbs}g C / ${macroTotals.fat}g F`}
          icon={Cookie}
          accent="purple"
          badgeText={`${todaySummary.caloriesBurned} burned`}
        />
      </section>

      {/* Add Food + Visualization */}
      <div className="fp-grid-form-layout">
        {/* Add Food Form */}
        <section className="fp-card" aria-label="Add food item">
          <div className="fp-card-header">
            <div>
              <h2 className="fp-card-title">Log Food & Calories</h2>
              <p className="fp-card-subtitle">Track Breakfast, Lunch, Dinner, and Snacks</p>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div className="fp-hint" style={{ marginBottom: '0.4rem' }}>
              Quick-add healthy presets:
            </div>
            <div className="fp-pill-group">
              {FOOD_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="fp-pill-btn"
                  onClick={() => {
                    setName(preset.name);
                    setCalories(String(preset.calories));
                    setMealType(preset.mealType);
                    setProtein(String(preset.protein));
                    setCarbs(String(preset.carbs));
                    setFat(String(preset.fat));
                    setFormError('');
                  }}
                >
                  {preset.name.split(' ').slice(0, 2).join(' ')} • {preset.calories}
                </button>
              ))}
            </div>
          </div>

          <form className="fp-form" onSubmit={handleSubmit} noValidate>
            <div className="fp-field">
              <label htmlFor="food-name" className="fp-label">
                Food Name
              </label>
              <input
                id="food-name"
                type="text"
                required
                placeholder="e.g., Grilled Salmon & Avocado Rice"
                className="fp-input"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formError) setFormError('');
                }}
              />
            </div>

            <div className="fp-form-row">
              <div className="fp-field">
                <label htmlFor="food-cals" className="fp-label">
                  Calories (kcal)
                </label>
                <input
                  id="food-cals"
                  type="number"
                  min="1"
                  max="5000"
                  required
                  placeholder="420"
                  className="fp-input"
                  value={calories}
                  onChange={(e) => {
                    setCalories(e.target.value);
                    if (formError) setFormError('');
                  }}
                />
              </div>

              <div className="fp-field">
                <label htmlFor="food-slot" className="fp-label">
                  Meal Category
                </label>
                <select
                  id="food-slot"
                  className="fp-select"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  {MEAL_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="fp-grid-3" style={{ gap: '0.6rem' }}>
              <div className="fp-field">
                <label htmlFor="food-pro" className="fp-label">
                  Protein (g)
                </label>
                <input
                  id="food-pro"
                  type="number"
                  min="0"
                  max="400"
                  placeholder="Auto"
                  className="fp-input"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
              <div className="fp-field">
                <label htmlFor="food-carb" className="fp-label">
                  Carbs (g)
                </label>
                <input
                  id="food-carb"
                  type="number"
                  min="0"
                  max="600"
                  placeholder="Auto"
                  className="fp-input"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
              <div className="fp-field">
                <label htmlFor="food-fat" className="fp-label">
                  Fat (g)
                </label>
                <input
                  id="food-fat"
                  type="number"
                  min="0"
                  max="300"
                  placeholder="Auto"
                  className="fp-input"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
            </div>

            <div className="fp-field">
              <label htmlFor="food-date" className="fp-label">
                Date
              </label>
              <input
                id="food-date"
                type="date"
                max={todayISO}
                className="fp-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {formError && (
              <div className="fp-error-msg">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            <button type="submit" className="fp-btn fp-btn-primary">
              <Plus size={16} aria-hidden="true" />
              <span>Add Food Item</span>
            </button>
          </form>
        </section>

        {/* Right Column: Progress Visualization & Meal Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <section className="fp-card" aria-label="Nutrition progress visualization">
            <div className="fp-card-header">
              <div>
                <h2 className="fp-card-title">Nutrition & Meal Distribution</h2>
                <p className="fp-card-subtitle">
                  Calories allocated by meal slot for {selectedDate === todayISO ? 'Today' : selectedDate}
                </p>
              </div>
              <span className={`fp-badge ${remaining >= 0 ? 'fp-badge-green' : 'fp-badge-amber'}`}>
                {remaining >= 0 ? `${remaining} kcal left` : `${Math.abs(remaining)} kcal over`}
              </span>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <ProgressBar
                value={totalConsumed}
                max={target}
                label={`Daily Target Progress (${totalConsumed.toLocaleString()} / ${target.toLocaleString()} kcal)`}
                fill={
                  remaining >= 0
                    ? 'linear-gradient(90deg, #22C55E, #38BDF8)'
                    : 'linear-gradient(90deg, #F59E0B, #EF4444)'
                }
                height={11}
              />
            </div>

            <div className="fp-grid-2" style={{ alignItems: 'center' }}>
              <div style={{ width: '100%', height: 210 }}>
                {pieData.length === 0 ? (
                  <div className="fp-empty" style={{ height: '100%', padding: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Log a meal to see distribution
                    </span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={54}
                        outerRadius={82}
                        paddingAngle={4}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<MealPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {MEAL_SLOTS.map((slot) => {
                  const slotCals = dayMeals
                    .filter((m) => m.mealType === slot)
                    .reduce((s, m) => s + (Number(m.calories) || 0), 0);
                  const Icon = SLOT_ICONS[slot];
                  return (
                    <div
                      key={slot}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '11px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.86rem' }}>
                        <Icon size={15} color={SLOT_COLORS[slot]} aria-hidden="true" />
                        {slot}
                      </span>
                      <strong className="tabular-nums" style={{ fontSize: '0.88rem' }}>
                        {slotCals} kcal
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Food Log List */}
          <section className="fp-card" aria-label="Logged meals">
            <div className="fp-card-header">
              <div>
                <h2 className="fp-card-title">Food Diary ({filteredMeals.length})</h2>
                <p className="fp-card-subtitle">Manage entries and inspect meal calories</p>
              </div>
            </div>

            <search style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="fp-search-box">
                <Search size={16} className="fp-search-icon" aria-hidden="true" />
                <input
                  type="search"
                  className="fp-input fp-search-input"
                  placeholder="Search logged foods..."
                  aria-label="Search food items"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="fp-pill-group">
                {['All', ...MEAL_SLOTS].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`fp-pill-btn ${slotFilter === slot ? 'is-active' : ''}`}
                    onClick={() => setSlotFilter(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </search>

            {filteredMeals.length === 0 ? (
              <div className="fp-empty">
                <Utensils size={28} color="var(--text-muted)" aria-hidden="true" />
                <strong>No food entries for this filter</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  Add a meal on the left or pick a preset to track your daily nutrition.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {filteredMeals.map((meal) => (
                  <div key={meal.id} className="fp-workout-item">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.94rem' }}>{meal.name}</strong>
                        <span
                          className="fp-badge"
                          style={{
                            background: `${SLOT_COLORS[meal.mealType]}1E`,
                            color: SLOT_COLORS[meal.mealType],
                            borderColor: `${SLOT_COLORS[meal.mealType]}40`,
                          }}
                        >
                          {meal.mealType}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.18rem' }}>
                        {meal.time || 'Logged'} • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <strong className="tabular-nums" style={{ color: '#38BDF8', fontSize: '0.95rem' }}>
                        {meal.calories} kcal
                      </strong>
                      <button
                        type="button"
                        className="fp-btn fp-btn-danger fp-btn-sm"
                        aria-label={`Delete ${meal.name}`}
                        onClick={() =>
                          requestConfirm({
                            title: 'Delete Food Entry?',
                            message: `Remove "${meal.name}" (${meal.calories} kcal) from ${meal.mealType}?`,
                            confirmLabel: 'Delete Entry',
                            onConfirm: () => deleteMeal(meal.id),
                          })
                        }
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
