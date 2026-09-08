import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bot, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenAgent: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenAgent }) => {
  const { user } = useAuth();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="app-header">
      {/* Brand Logo & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <BrandLogo showTagline={true} />

        <div className="hide-tablet" style={{
          height: '22px',
          width: '1px',
          background: 'var(--border-walnut-faint)',
          margin: '0 6px',
        }} />

        <div className="hide-tablet" style={{ fontSize: '0.84rem', color: 'var(--text-parchment-muted)', fontWeight: 500 }}>
          {formattedDate}
        </div>
      </div>

      {/* Right controls: AI Coach Trigger + User Profile Menu */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* AI Coach Floating Pill Button */}
          <button
            onClick={onOpenAgent}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--chinar-rust), #A03D20)',
              border: '1px solid var(--border-copper-subtle)',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(192, 83, 48, 0.35)',
              transition: 'var(--transition-smooth)',
            }}
            title="Open AazDoh AI Accountability Coach (Cmd+K)"
          >
            <Sparkles size={14} color="var(--saffron-ember)" />
            <span>AI Coach</span>
          </button>

          {/* User Menu / Settings Button */}
          <button
            onClick={onOpenSettings}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 5px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-walnut-surface)',
              border: '1px solid var(--border-copper-subtle)',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              boxShadow: 'var(--shadow-warm-sm)',
            }}
            title="Open Menu (Profile, AI Mode, Preferences & Logout)"
          >
            {/* Avatar Chip */}
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(192, 83, 48, 0.3)',
            }}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>

            {/* User Name & Persona Chip (Tablet & Desktop) */}
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-kehwa-cream)',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.fullName}
              </span>
              <span style={{
                fontSize: '0.66rem',
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'var(--bg-walnut-card)',
                color: 'var(--saffron-ember)',
                fontWeight: 700,
              }}>
                {user.aiPersona || 'BALANCED'}
              </span>
            </div>

            {/* Menu Hamburger Icon */}
            <Menu size={16} color="var(--text-parchment-muted)" style={{ flexShrink: 0 }} />
          </button>
        </div>
      )}
    </header>
  );
};
