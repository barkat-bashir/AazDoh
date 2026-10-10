import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarCheck, Users, BarChart3, Plus, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  unreadTodayCount?: number;
  unreadPartnerCount?: number;
  onOpenAddModal?: () => void;
  onOpenAgent?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  unreadTodayCount = 0,
  unreadPartnerCount = 0,
  onOpenAddModal,
  onOpenAgent,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isToday = location.pathname === '/today' || location.pathname === '/' || location.pathname === '/app';
  const isPartners = location.pathname === '/partners';
  const isInsights = location.pathname === '/insights';

  const handleQuickAdd = () => {
    if (onOpenAddModal) {
      onOpenAddModal();
    } else {
      window.dispatchEvent(new CustomEvent('aazdoh:open-add-modal'));
    }
  };

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(20, 14, 10, 0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-copper-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px calc(env(safe-area-inset-bottom, 0px) + 4px)',
        zIndex: 900,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* 1. Today Tab */}
      <button
        onClick={() => navigate('/today')}
        style={{
          background: 'none',
          border: 'none',
          color: isToday ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          padding: '6px 12px',
          fontSize: '0.72rem',
          fontWeight: isToday ? 700 : 500,
          cursor: 'pointer',
          position: 'relative',
          minWidth: '54px',
          transition: 'var(--transition-smooth)',
        }}
      >
        <CalendarCheck size={20} color={isToday ? 'var(--saffron-ember)' : 'currentColor'} />
        <span>Today</span>
        {unreadTodayCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '12px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--chinar-rust)',
          }} />
        )}
      </button>

      {/* 2. Partners Tab */}
      <button
        onClick={() => navigate('/partners')}
        style={{
          background: 'none',
          border: 'none',
          color: isPartners ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          padding: '6px 12px',
          fontSize: '0.72rem',
          fontWeight: isPartners ? 700 : 500,
          cursor: 'pointer',
          position: 'relative',
          minWidth: '54px',
          transition: 'var(--transition-smooth)',
        }}
      >
        <Users size={20} color={isPartners ? 'var(--saffron-ember)' : 'currentColor'} />
        <span>Partners</span>
        {unreadPartnerCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '12px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--chinar-rust)',
          }} />
        )}
      </button>

      {/* 3. Center Quick Add FAB */}
      <button
        onClick={handleQuickAdd}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--chinar-rust), #A03D20)',
          border: '2px solid rgba(245, 239, 235, 0.2)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(192, 83, 48, 0.45)',
          cursor: 'pointer',
          marginTop: '-18px',
          flexShrink: 0,
          transition: 'transform 0.15s ease',
        }}
        title="Quick Add Commitment"
        aria-label="Quick Add Commitment"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* 4. Insights Tab */}
      <button
        onClick={() => navigate('/insights')}
        style={{
          background: 'none',
          border: 'none',
          color: isInsights ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          padding: '6px 12px',
          fontSize: '0.72rem',
          fontWeight: isInsights ? 700 : 500,
          cursor: 'pointer',
          minWidth: '54px',
          transition: 'var(--transition-smooth)',
        }}
      >
        <BarChart3 size={20} color={isInsights ? 'var(--saffron-ember)' : 'currentColor'} />
        <span>Insights</span>
      </button>

      {/* 5. AI Coach Button */}
      <button
        onClick={onOpenAgent}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-tweed-dim)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          padding: '6px 12px',
          fontSize: '0.72rem',
          fontWeight: 500,
          cursor: 'pointer',
          minWidth: '54px',
          transition: 'var(--transition-smooth)',
        }}
      >
        <Sparkles size={20} color="var(--saffron-ember)" />
        <span>AI Coach</span>
      </button>
    </nav>
  );
};
