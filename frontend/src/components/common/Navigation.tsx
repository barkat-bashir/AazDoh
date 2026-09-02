import React from 'react';
import { CalendarCheck, Users, BarChart3, Settings, Sparkles } from 'lucide-react';

export type TabType = 'today' | 'partners' | 'analytics';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadPartnerCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, unreadPartnerCount = 0 }) => {
  const tabs = [
    { id: 'today' as TabType, label: 'Today', icon: CalendarCheck },
    { id: 'partners' as TabType, label: 'Partners', icon: Users, badge: unreadPartnerCount },
    { id: 'analytics' as TabType, label: 'Insights', icon: BarChart3 },
  ];

  return (
    <div className="app-nav-wrapper">
      <nav className="app-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
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
