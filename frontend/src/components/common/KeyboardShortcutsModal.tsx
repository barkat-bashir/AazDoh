import React from 'react';
import { X, Command, Sparkles, Plus, CalendarCheck, Users, BarChart3, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcutGroups = [
    {
      title: 'Navigation',
      shortcuts: [
        { key: '1', label: 'Go to Today Dashboard', icon: CalendarCheck },
        { key: '2', label: 'Go to Partner Feed', icon: Users },
        { key: '3', label: 'Go to Analytics & Insights', icon: BarChart3 },
      ],
    },
    {
      title: 'Actions & Creation',
      shortcuts: [
        { key: 'C or N', label: 'Create New Commitment', icon: Plus },
        { key: `${modKey} + K`, label: 'Toggle AI Coach Drawer', icon: Sparkles },
        { key: '?', label: 'Open Shortcuts Cheat Sheet', icon: HelpCircle },
        { key: 'Esc', label: 'Close active modal / drawer' },
      ],
    },
  ];

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 6, 4, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="harud-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-walnut-card)',
          border: '1px solid var(--border-copper-subtle)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(192, 83, 48, 0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-walnut-faint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-walnut-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Command size={18} color="var(--saffron-ember)" />
            <h3 id="shortcuts-title" style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-tweed-dim)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--saffron-ember)',
                  marginBottom: '10px',
                }}
              >
                {group.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {group.shortcuts.map((s) => (
                  <div
                    key={s.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-walnut-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-walnut-faint)',
                    }}
                  >
                    <span style={{ fontSize: '0.86rem', color: 'var(--text-kehwa-cream)' }}>
                      {s.label}
                    </span>
                    <kbd
                      style={{
                        background: 'var(--bg-walnut-deep)',
                        border: '1px solid var(--border-copper-subtle)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--saffron-ember)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: 'var(--bg-walnut-surface)',
            borderTop: '1px solid var(--border-walnut-faint)',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: 'var(--text-tweed-dim)',
          }}
        >
          Press <kbd style={{ color: 'var(--saffron-ember)', fontWeight: 700 }}>Esc</kbd> anytime to dismiss this dialog.
        </div>
      </div>
    </div>
  );
};
