import React, { useRef, useState } from 'react';
import ConfirmDialog from './components/ConfirmDialog';
import Header from './components/Header';
import QuickActionModal from './components/QuickActionModal';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import { FitnessProvider, useFitness } from './context/FitnessContext';
import Activity from './pages/Activity';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import HealthMetrics from './pages/HealthMetrics';
import Nutrition from './pages/Nutrition';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Workouts from './pages/Workouts';

const PAGE_COMPONENTS = {
  dashboard: Dashboard,
  activity: Activity,
  workouts: Workouts,
  nutrition: Nutrition,
  health: HealthMetrics,
  goals: Goals,
  reports: Reports,
  profile: Profile,
};

function FitPulseShell() {
  const { activePage } = useFitness();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const mobileMenuBtnRef = useRef(null);

  const ActivePageComponent = PAGE_COMPONENTS[activePage] || Dashboard;

  return (
    <div className="fp-shell">
      <Sidebar
        mobileDrawerOpen={mobileDrawerOpen}
        onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
        mobileMenuBtnRef={mobileMenuBtnRef}
      />

      <div className="fp-main-wrap">
        <Header
          onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
          mobileMenuBtnRef={mobileMenuBtnRef}
        />

        <main className="fp-content" id="main-content">
          <div key={activePage}>
            <ActivePageComponent />
          </div>
        </main>
      </div>

      <QuickActionModal />
      <ConfirmDialog />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <FitnessProvider>
      <FitPulseShell />
    </FitnessProvider>
  );
}
