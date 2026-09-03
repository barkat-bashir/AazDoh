import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarCheck, Users, BarChart3 } from 'lucide-react';

export type TabType = 'today' | 'partners' | 'analytics';

interface NavigationProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  unreadTodayCount?: number;
  unreadPartnerCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  unreadTodayCount = 0,
  unreadPartnerCount = 0,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'today' as TabType, path: '/today', label: 'Today', icon: CalendarCheck, badge: unreadTodayCount },
    { id: 'partners' as TabType, path: '/partners', label: 'Partners', icon: Users, badge: unreadPartnerCount },
    { id: 'analytics' as TabType, path: '/insights', label: 'Insights', icon: BarChart3 },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (onTabChange) {
      onTabChange(tab.id);
    }
    navigate(tab.path);
  };

  return (
    <div className="app-nav-wrapper">
      <nav className="app-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab
            ? activeTab === tab.id
            : location.pathname === tab.path || (tab.path === '/today' && (location.pathname === '/' || location.pathname === '/app'));

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              style={{
                background: isActive ? 'var(--bg-walnut-card)' : 'transparent',
                color: isActive ? 'var(--text-kehwa-cream)' : 'var(--text-parchment-muted)',
                border: `1px solid ${isActive ? 'var(--border-copper-subtle)' : 'transparent'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '8px 14px',
                fontSize: '0.86rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? 'var(--shadow-warm-sm)' : 'none',
                transition: 'var(--transition-smooth)',
                flexShrink: 0,
              }}
            >
              <Icon
                size={16}
                color={isActive ? 'var(--chinar-rust)' : 'var(--text-tweed-dim)'}
              />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span
                  style={{
                    background: 'var(--chinar-rust)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    minWidth: '18px',
                    textAlign: 'center',
                    boxShadow: '0 0 8px rgba(192, 83, 48, 0.5)',
                  }}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
