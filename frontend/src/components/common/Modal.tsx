import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '560px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth, margin: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-box" style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--border-walnut-faint)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: 'var(--bg-walnut-surface)',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.2rem)', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-parchment-muted)', margin: '4px 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn-outline"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-tweed-dim)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-box" style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
