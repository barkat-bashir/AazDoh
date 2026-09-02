import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Navigation, TabType } from './components/common/Navigation';
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

type PublicView = 'landing' | 'auth' | 'terms' | 'privacy';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [publicView, setPublicView] = useState<PublicView>('landing');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('reset-token') || params.get('token');
  });

  // TanStack Query for unread notifications & background sync
  const { data: unreadSummary } = useQuery({
    queryKey: ['unreadSummary'],
    queryFn: () => discussionApi.getUnreadSummary(),
    enabled: !!user,
    refetchInterval: 10000,
    staleTime: 0,
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

  // Unauthenticated Views: Reset Password, Landing, Auth, Terms, Privacy
  if (!user) {
    if (resetToken) {
      return (
        <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-walnut-deep)' }}>
          <ChinarLeavesCanvas />
          <div style={{ position: 'relative', zIndex: 10 }}>
            <ResetPasswordPage
              token={resetToken}
              onSuccess={() => {
                setResetToken(null);
                setPublicView('auth');
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-walnut-deep)' }}>
        <ChinarLeavesCanvas />
        <div style={{ position: 'relative', zIndex: 10 }}>
          {publicView === 'landing' && (
            <LandingPage
              onGetStarted={() => setPublicView('auth')}
              onSignIn={() => setPublicView('auth')}
              onOpenTerms={() => setPublicView('terms')}
              onOpenPrivacy={() => setPublicView('privacy')}
            />
          )}

          {publicView === 'auth' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setPublicView('landing')}
                className="btn-secondary"
                style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 20 }}
              >
                ← Back to Home
              </button>
              <AuthPage />
            </div>
          )}

          {publicView === 'terms' && (
            <TermsPage onBack={() => setPublicView('landing')} />
          )}

          {publicView === 'privacy' && (
            <PrivacyPolicyPage onBack={() => setPublicView('landing')} />
          )}
        </div>
      </div>
    );
  }

  // Authenticated Application Dashboard
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-walnut-deep)', position: 'relative' }}>
      <ChinarLeavesCanvas />
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} unreadPartnerCount={unreadCount} />
      
      <main style={{ flex: 1, paddingBottom: '60px', position: 'relative' }}>
        {activeTab === 'today' && <TodayPage />}
        {activeTab === 'partners' && <PartnersPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
