import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Navigation, TabType } from './components/common/Navigation';
import { ChinarLeavesCanvas } from './components/common/ChinarLeavesCanvas';
import { AuthPage } from './pages/AuthPage';
import { TodayPage } from './pages/TodayPage';
import { PartnersPage } from './pages/PartnersPage';
import { AiAgentPage } from './pages/AiAgentPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('today');

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

  if (!user) {
    return (
      <>
        <ChinarLeavesCanvas />
        <AuthPage />
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-walnut-deep)', position: 'relative' }}>
      <ChinarLeavesCanvas />
      <Header onOpenAi={() => setActiveTab('ai')} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main style={{ flex: 1, paddingBottom: '60px', position: 'relative', zIndex: 10 }}>
        {activeTab === 'today' && <TodayPage onOpenAi={() => setActiveTab('ai')} />}
        {activeTab === 'ai' && <AiAgentPage />}
        {activeTab === 'partners' && <PartnersPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>
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
