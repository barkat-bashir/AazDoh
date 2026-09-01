import React, { useState } from 'react';
import { Flame } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showTagline = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;
  const boxSize = size === 'sm' ? '30px' : size === 'lg' ? '38px' : '34px';
  const fontSize = size === 'sm' ? '1.15rem' : size === 'lg' ? '1.4rem' : '1.25rem';

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
      role="button"
      tabIndex={0}
      aria-label="AazDoh brand meaning"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: boxSize,
          height: boxSize,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isHovered ? '0 0 20px var(--chinar-glow), 0 4px 14px rgba(192, 83, 48, 0.4)' : '0 4px 12px var(--chinar-glow)',
          transform: isHovered ? 'scale(1.06)' : 'scale(1)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          flexShrink: 0,
        }}>
          <Flame size={iconSize} color="#F5EFEB" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-kehwa-cream)',
            }}>
              AazDoh
            </span>
          </div>
          {showTagline && (
            <div className="hide-mobile" style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', fontWeight: 500 }}>
              Commit • Do • Report • Reflect
            </div>
          )}
        </div>
      </div>

      {/* Cultural Easter Egg Tooltip */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: '0',
          zIndex: 9999,
          background: 'rgba(20, 14, 10, 0.96)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-copper-subtle)',
          borderRadius: '10px',
          padding: '8px 12px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.75), 0 0 20px rgba(192, 83, 48, 0.2)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.96)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--saffron-ember)' }}>
            اَز دۄہ
          </span>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
            • AazDoh
          </span>
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-parchment-muted)' }}>
          Kashmiri for <strong style={{ color: 'var(--text-kehwa-cream)' }}>"Today"</strong> • Win this day.
        </div>
      </div>
    </div>
  );
};
