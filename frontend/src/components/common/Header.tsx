import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, LogOut, Flame } from 'lucide-react';

interface HeaderProps {
  onOpenAi: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAi }) => {
  const { user, logout } = useAuth();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header style={{
      borderBottom: '1px solid var(--border-walnut-faint)',
      background: 'rgba(28, 21, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Brand Logo & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'inherit',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--chinar-glow)',
          }}>
            <Flame size={20} color="#F5EFEB" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-kehwa-cream)',
              }}>
                AazDoh
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', fontWeight: 500 }}>
              Commit • Do • Report • Reflect
            </div>
          </div>
        </div>

        <div style={{
          height: '24px',
          width: '1px',
          background: 'var(--border-walnut-faint)',
          margin: '0 8px',
        }} />

        <div style={{ fontSize: '0.88rem', color: 'var(--text-parchment-muted)', fontWeight: 500 }}>
          {formattedDate}
        </div>
      </div>

      {/* Right controls: AI quick trigger & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onOpenAi}
          className="btn-secondary"
          style={{
            borderColor: 'var(--border-copper-subtle)',
            background: 'rgba(192, 83, 48, 0.1)',
            padding: '8px 14px',
            fontSize: '0.85rem',
          }}
          title="Open AI Accountability Agent"
        >
          <Sparkles size={16} color="var(--saffron-ember)" />
          <span>AI Agent</span>
          <span style={{
            fontSize: '0.68rem',
            padding: '1px 5px',
            borderRadius: '4px',
            background: 'var(--bg-walnut-card)',
            color: 'var(--text-parchment-muted)',
          }}>
            {user?.aiPersona || 'BALANCED'}
          </span>
        </button>

        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 12px',
            background: 'var(--bg-walnut-surface)',
            border: '1px solid var(--border-walnut-faint)',
            borderRadius: 'var(--radius-full)',
          }}>
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
            }}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
              {user.fullName}
            </span>
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
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
