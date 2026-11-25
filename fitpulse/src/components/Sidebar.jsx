import React, { useEffect, useRef } from 'react';
import {
  Activity,
  Award,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  HeartPulse,
  LayoutDashboard,
  UserCircle2,
  Utensils,
  X,
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'activity', label: 'Activity Tracker', icon: Activity },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  { id: 'health', label: 'Health Metrics', icon: HeartPulse },
  { id: 'goals', label: 'Goals & Badges', icon: Award },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'profile', label: 'Profile & Settings', icon: UserCircle2 },
];

export default function Sidebar({ mobileDrawerOpen, onCloseMobileDrawer, mobileMenuBtnRef }) {
  const {
    activePage,
    setActivePage,
    sidebarCollapsed,
    setSidebarCollapsed,
    streakDays,
    state,
  } = useFitness();

  const drawerRef = useRef(null);
  const scrollerRef = useRef(null);
  const sheetRef = useRef(null);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    if (mobileDrawerOpen) {
      closeDrawerSmoothly();
    }
  };

  const closeDrawerSmoothly = () => {
    const scroller = scrollerRef.current;
    const dialog = drawerRef.current;
    if (scroller && dialog?.open) {
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'auto' });
    } else {
      onCloseMobileDrawer?.();
    }
  };

  // Native modal drawer open/close synced with scroll-snap & IntersectionObserver
  useEffect(() => {
    const dialog = drawerRef.current;
    const scroller = scrollerRef.current;
    const sheet = sheetRef.current;
    if (!dialog || !scroller || !sheet) return undefined;

    const visibleThreshold = 1 / Math.max(window.innerWidth, 320);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        if (entry.intersectionRatio < visibleThreshold && dialog.open) {
          dialog.close();
          if (mobileMenuBtnRef?.current) {
            mobileMenuBtnRef.current.setAttribute('aria-expanded', 'false');
          }
          onCloseMobileDrawer?.();
        }
        if (entry.intersectionRatio >= 0.99 && mobileMenuBtnRef?.current) {
          mobileMenuBtnRef.current.setAttribute('aria-expanded', 'true');
        }
      },
      { root: dialog, threshold: [visibleThreshold, 1] }
    );
    observer.observe(sheet);

    const handleScrollFallback = () => {
      if (!CSS.supports('animation-timeline: scroll()') && sheet.offsetWidth > 0) {
        const ratio = Math.max(0, Math.min(1, 1 - scroller.scrollLeft / sheet.offsetWidth));
        dialog.style.setProperty('--drawer-backdrop', String(ratio));
      }
    };
    scroller.addEventListener('scroll', handleScrollFallback, { passive: true });

    const handleCancel = (e) => {
      if (e.cancelable) {
        e.preventDefault();
        closeDrawerSmoothly();
      }
    };
    dialog.addEventListener('cancel', handleCancel);

    return () => {
      observer.disconnect();
      scroller.removeEventListener('scroll', handleScrollFallback);
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, [onCloseMobileDrawer, mobileMenuBtnRef]);

  useEffect(() => {
    const dialog = drawerRef.current;
    const scroller = scrollerRef.current;
    if (!dialog || !scroller) return;

    let cancelled = false;
    async function openDrawer() {
      if (!dialog.open) {
        dialog.showModal();
      }
      if (!CSS.supports('scroll-initial-target', 'nearest')) {
        scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'instant' });
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      }
      if (!cancelled) {
        scroller.scrollTo({ left: 0, behavior: 'auto' });
        dialog.style.setProperty('--drawer-backdrop', '1');
      }
    }

    if (mobileDrawerOpen) {
      openDrawer();
    } else if (dialog.open) {
      dialog.close();
    }

    return () => {
      cancelled = true;
    };
  }, [mobileDrawerOpen]);

  const renderNavItems = (isCollapsed = false) => (
    <nav className="fp-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        const showLiveBadge = item.id === 'workouts' && state.activeWorkout.isRunning && !isCollapsed;
        return (
          <button
            key={item.id}
            type="button"
            className={`fp-nav-item ${isActive ? 'is-active' : ''}`}
            onClick={() => handleNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
            title={isCollapsed ? item.label : undefined}
          >
            <Icon size={20} className="fp-nav-icon" aria-hidden="true" />
            {!isCollapsed && <span>{item.label}</span>}
            {showLiveBadge && <span className="fp-nav-badge">LIVE</span>}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop collapsible sidebar */}
      <aside
        className={`fp-sidebar ${sidebarCollapsed ? 'is-collapsed' : ''}`}
        aria-label="Primary sidebar"
      >
        <div className="fp-brand">
          <button
            type="button"
            className="fp-brand-link"
            onClick={() => handleNavigate('dashboard')}
            aria-label="Go to FitPulse Dashboard"
          >
            <img src="/assets/fitpulse-logo.svg" alt="" className="fp-brand-logo" />
            {!sidebarCollapsed && (
              <span className="fp-brand-text">
                <span className="fp-brand-name">FitPulse</span>
                <span className="fp-brand-tag">Smart Performance</span>
              </span>
            )}
          </button>
          <button
            type="button"
            className="fp-collapse-btn"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>

        {renderNavItems(sidebarCollapsed)}

        <div className="fp-sidebar-footer">
          <div className="fp-streak-pill" title={`${streakDays}-day active streak`}>
            <Flame size={20} color="#22C55E" aria-hidden="true" style={{ flexShrink: 0 }} />
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{streakDays}-Day Streak</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                  Keep momentum going
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile & Tablet Swipeable Navigation Drawer */}
      <dialog
        ref={drawerRef}
        id="mobile-nav-drawer"
        className="fp-drawer-dialog"
        aria-label="Navigation menu"
        onClick={(e) => {
          if (sheetRef.current && !sheetRef.current.contains(e.target)) {
            closeDrawerSmoothly();
          }
        }}
      >
        <div ref={scrollerRef} className="fp-drawer-scroller">
          <div ref={sheetRef} className="fp-drawer-sheet">
            <div className="fp-brand">
              <div className="fp-brand-link">
                <img src="/assets/fitpulse-logo.svg" alt="" className="fp-brand-logo" />
                <span className="fp-brand-text">
                  <span className="fp-brand-name">FitPulse</span>
                  <span className="fp-brand-tag">Smart Performance</span>
                </span>
              </div>
              <button
                type="button"
                className="fp-collapse-btn"
                onClick={closeDrawerSmoothly}
                aria-label="Close navigation menu"
                autoFocus
              >
                <X size={18} />
              </button>
            </div>

            {renderNavItems(false)}

            <div className="fp-sidebar-footer">
              <div className="fp-streak-pill">
                <Flame size={20} color="#22C55E" aria-hidden="true" />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{streakDays}-Day Streak</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                    Goal sync active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
