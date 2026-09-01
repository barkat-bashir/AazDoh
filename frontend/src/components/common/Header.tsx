import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, LogOut, Flame } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { user, logout } = useAuth();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="app-header">
      {/* Brand Logo & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'inherit',
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--chinar-glow)',
            flexShrink: 0,
          }}>
            <Flame size={18} color="#F5EFEB" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-kehwa-cream)',
              }}>
                AazDoh
              </span>
            </div>
            <div className="hide-mobile" style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', fontWeight: 500 }}>
              Commit • Do • Report • Reflect
            </div>
          </div>
        </div>

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

      {/* Right controls: AI Persona quick pill & Profile Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onOpenSettings}
          className="btn-secondary"
          style={{
            borderColor: 'var(--border-copper-subtle)',
            background: 'rgba(192, 83, 48, 0.1)',
            padding: '6px 10px',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
          title="AI Challenger Persona (Click to Change)"
        >
          <Sparkles size={15} color="var(--saffron-ember)" />
          <span className="hide-mobile">AI Mode:</span>
          <span style={{
            fontSize: '0.66rem',
            padding: '1px 5px',
            borderRadius: '4px',
            background: 'var(--bg-walnut-card)',
            color: 'var(--text-kehwa-cream)',
            fontWeight: 700,
          }}>
            {user?.aiPersona || 'BALANCED'}
          </span>
        </button>

        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '3px 8px 3px 4px',
            background: 'var(--bg-walnut-surface)',
            border: '1px solid var(--border-walnut-faint)',
            borderRadius: 'var(--radius-full)',
          }}>
            <div 
              onClick={onOpenSettings}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
              title="Click to open Account & Preferences"
            >
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--bg-walnut-card-hover)',
                border: '1px solid var(--border-copper-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--saffron-ember)',
                flexShrink: 0,
              }}>
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="hide-mobile" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.fullName}
              </span>
            </div>

            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-tweed-dim)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'var(--transition-smooth)',
              }}
              title="Log out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
