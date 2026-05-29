import React from 'react';
import { CalendarCheck, Users, BarChart3, Settings, Sparkles } from 'lucide-react';

export type TabType = 'today' | 'partners' | 'ai' | 'analytics' | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'today' as TabType, label: 'Today', icon: CalendarCheck },
    { id: 'ai' as TabType, label: 'AI Agent', icon: Sparkles },
    { id: 'partners' as TabType, label: 'Peer Accountability', icon: Users },
    { id: 'analytics' as TabType, label: 'Behavioral Insights', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Preferences', icon: Settings },
  ];

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 28px',
      background: 'var(--bg-walnut-base)',
      borderBottom: '1px solid var(--border-walnut-faint)',
      overflowX: 'auto',
    }}>
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
              padding: '8px 16px',
              fontSize: '0.88rem',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? 'var(--shadow-warm-sm)' : 'none',
              transition: 'var(--transition-smooth)',
            }}
          >
            <Icon
              size={16}
              color={isActive ? 'var(--chinar-rust)' : 'var(--text-tweed-dim)'}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
