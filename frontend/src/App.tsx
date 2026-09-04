import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { ChinarLeavesCanvas } from './components/common/ChinarLeavesCanvas';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TodayPage } from './pages/TodayPage';
import { PartnersPage } from './pages/PartnersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsModal } from './components/settings/SettingsModal';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { discussionApi } from './api/discussionApi';
import { useQuery } from '@tanstack/react-query';

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

// Authenticated Layout Container (Header, Nav, Outlet, Modals, Footer)
const AuthenticatedLayout: React.FC<{
  unreadSummary: any;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}> = ({ unreadSummary, isSettingsOpen, setIsSettingsOpen }) => {
  const unreadTodayCount = unreadSummary?.unreadTodayMessages || 0;
  const unreadPartnerCount = unreadSummary?.unreadPartnerMessages !== undefined
    ? unreadSummary.unreadPartnerMessages
    : (unreadSummary?.pendingInvitations || 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-walnut-deep)', position: 'relative' }}>
      <ChinarLeavesCanvas />
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <Navigation
        unreadTodayCount={unreadTodayCount}
        unreadPartnerCount={unreadPartnerCount}
      />

      <main style={{ flex: 1, paddingBottom: '60px', position: 'relative' }}>
        <Outlet />
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

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
        <div style={{ display: 'flex', gap: '16px' }}>
          <a
            href="https://github.com/bb-code1/AazDoh"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--text-parchment-muted)', textDecoration: 'none' }}
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
