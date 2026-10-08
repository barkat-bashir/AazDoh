import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { ChinarLeavesCanvas } from './components/common/ChinarLeavesCanvas';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TodayPage } from './pages/TodayPage';
import { PartnersPage } from './pages/PartnersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsModal } from './components/settings/SettingsModal';
import { AgentDrawer } from './components/agent/AgentDrawer';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { discussionApi } from './api/discussionApi';
import { useQuery } from '@tanstack/react-query';
import { FocusTimerProvider } from './context/FocusTimerContext';
import { FocusSprintModal } from './components/focus/FocusSprintModal';
import { FloatingFocusBar } from './components/focus/FloatingFocusBar';

// Reset Password Handler Route
const ResetPasswordRoute: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('reset-token') || searchParams.get('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-walnut-deep)' }}>
      <ChinarLeavesCanvas />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <ResetPasswordPage
          token={token}
          onSuccess={() => {
            navigate('/login');
          }}
        />
      </div>
    </div>
  );
};

// Authenticated Layout Container (Header, Nav, MobileBottomNav, Outlet, Modals, Footer)
const AuthenticatedLayout: React.FC<{
  unreadSummary: any;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isAgentOpen: boolean;
  setIsAgentOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
}> = ({
  unreadSummary,
  isSettingsOpen,
  setIsSettingsOpen,
  isAgentOpen,
  setIsAgentOpen,
  isShortcutsOpen,
  setIsShortcutsOpen,
}) => {
  const unreadTodayCount = unreadSummary?.unreadTodayMessages || 0;
  const unreadPartnerCount = unreadSummary?.unreadPartnerMessages !== undefined
    ? unreadSummary.unreadPartnerMessages
    : (unreadSummary?.pendingInvitations || 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-walnut-deep)', position: 'relative' }}>
      <ChinarLeavesCanvas />
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAgent={() => setIsAgentOpen(true)}
      />
      <Navigation
        unreadTodayCount={unreadTodayCount}
        unreadPartnerCount={unreadPartnerCount}
      />

      <main style={{ flex: 1, paddingBottom: '60px', position: 'relative' }}>
        <Outlet />
      </main>

      {/* Mobile-Optimized Fixed Bottom Bar */}
      <MobileBottomNav
        unreadTodayCount={unreadTodayCount}
        unreadPartnerCount={unreadPartnerCount}
        onOpenAgent={() => setIsAgentOpen(true)}
        onOpenAddModal={() => window.dispatchEvent(new CustomEvent('aazdoh:open-add-modal'))}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Autonomous AI Coach Drawer */}
      <AgentDrawer
        isOpen={isAgentOpen}
        onClose={() => setIsAgentOpen(false)}
      />

      {/* Integrated Task Pomodoro / Focus Sprint Cockpit & Minimized Floating Bar */}
      <FocusSprintModal />
      <FloatingFocusBar />

      {/* Authenticated Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-walnut-faint)',
        background: 'var(--bg-walnut-deep)',
        padding: '20px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-tweed-dim)',
        position: 'relative',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <span>AazDoh • Commit • Do • Report • Reflect</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={() => setIsShortcutsOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-tweed-dim)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Keyboard Shortcuts (?)
          </button>
          <span>© {new Date().getFullYear()} AazDoh</span>
        </div>
      </footer>
    </div>
  );
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Global Keyboard Shortcuts (1, 2, 3, C, N, ?, Cmd+K, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );

      // AI Coach Toggle (Cmd+K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (user) {
          setIsAgentOpen((prev) => !prev);
        }
        return;
      }

      // If user is currently typing in a text field, ignore single-key shortcuts
      if (isInput) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (!user) return;

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === '1') {
        navigate('/today');
      } else if (e.key === '2') {
        navigate('/partners');
      } else if (e.key === '3') {
        navigate('/insights');
      } else if (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'n') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('aazdoh:open-add-modal'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, navigate]);

  // TanStack Query for unread notifications & background sync
  const { data: unreadSummary } = useQuery({
    queryKey: ['unreadSummary'],
    queryFn: () => discussionApi.getUnreadSummary(),
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds fresh cache
    refetchInterval: 1000 * 60, // 60s quiet background sync
    refetchIntervalInBackground: false,
  });

  const unreadCount = unreadSummary?.totalUnreadNotifications || 0;

  // Out-of-tab awareness (Dynamic Tab Title alert)
  useEffect(() => {
    const defaultTitle = 'AazDoh • Commit • Do • Report • Reflect';

    if (unreadCount > 0) {
      document.title = `(${unreadCount}) 💬 Partner update • AazDoh`;
    } else {
      document.title = defaultTitle;
    }

    return () => {
      document.title = defaultTitle;
    };
  }, [unreadCount]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-walnut-deep)',
        color: 'var(--text-parchment-muted)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-walnut-faint)',
            borderTopColor: 'var(--chinar-rust)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 14px',
          }} />
          <p style={{ fontSize: '0.9rem' }}>Connecting to AazDoh...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={user ? <Navigate to="/today" replace /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/today" replace /> : <AuthPage />}
      />
      <Route
        path="/auth"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="/terms"
        element={<TermsPage />}
      />
      <Route
        path="/privacy"
        element={<PrivacyPolicyPage />}
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordRoute />}
      />

      {/* Authenticated Dashboard Routes */}
      <Route
        element={
          user ? (
            <AuthenticatedLayout
              unreadSummary={unreadSummary}
              isSettingsOpen={isSettingsOpen}
              setIsSettingsOpen={setIsSettingsOpen}
              isAgentOpen={isAgentOpen}
              setIsAgentOpen={setIsAgentOpen}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/today" element={<TodayPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/insights" element={<AnalyticsPage />} />
        <Route path="/app" element={<Navigate to="/today" replace />} />
      </Route>

      {/* Wildcard catch-all */}
      <Route
        path="*"
        element={<Navigate to={user ? '/today' : '/'} replace />}
      />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <FocusTimerProvider>
            <AppContent />
          </FocusTimerProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
