import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import { 
  Settings, 
  Save, 
  Sparkles, 
  User, 
  Globe, 
  HeartHandshake, 
  Compass, 
  ShieldAlert, 
  X, 
  LogOut
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, refreshUser, logout } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata');
  const [aiPersona, setAiPersona] = useState<'GENTLE' | 'BALANCED' | 'STRICT'>(user?.aiPersona || 'BALANCED');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setTimezone(user.timezone);
      setAiPersona(user.aiPersona);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authApi.updatePreferences({
        fullName: fullName.trim(),
        timezone,
        aiPersona,
      });
      await refreshUser();
      showToast('Preferences updated successfully', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 99999 }}>
      <div 
        className="modal-content"
        style={{ 
          maxWidth: '560px', 
          width: '95%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: 0,
        }}
      >
        {/* Modal Header */}
        <div 
          className="modal-header-box"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-walnut-faint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-walnut-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--chinar-glow)',
            }}>
              <Settings size={18} color="#F5EFEB" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
                Account & Preferences
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-tweed-dim)', margin: 0 }}>
                AI challenger mode & profile settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '6px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="modal-body-box" style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* User Profile Summary Card */}
          {user && (
            <div style={{
              background: 'var(--bg-walnut-card)',
              border: '1px solid var(--border-copper-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#fff',
                  boxShadow: '0 3px 10px rgba(192, 83, 48, 0.35)',
                  flexShrink: 0,
                }}>
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                    {user.fullName}
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-tweed-dim)' }}>
                    {user.email}
                  </p>
                </div>
              </div>

              <div style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'var(--bg-walnut-surface)',
                border: '1px solid var(--border-walnut-faint)',
                color: 'var(--saffron-ember)',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                {user.aiPersona || 'BALANCED'}
              </div>
            </div>
          )}

          {/* AI Persona Section */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-kehwa-cream)', marginBottom: '4px' }}>
              <Sparkles size={15} color="var(--saffron-ember)" />
              <span>AI Accountability Challenger Persona</span>
            </label>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-parchment-muted)', marginBottom: '10px', marginTop: 0 }}>
              Adjust the rigor and tone of your AI Chief of Staff and Excuse Mirror.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              {/* Gentle */}
              <label style={{
                padding: '12px 10px',
                background: aiPersona === 'GENTLE' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                border: `1.5px solid ${aiPersona === 'GENTLE' ? 'var(--pine-emerald)' : 'var(--border-walnut-faint)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'var(--transition-smooth)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ADE80', fontWeight: 700, fontSize: '0.86rem' }}>
                    <HeartHandshake size={15} />
                    <span>Gentle</span>
                  </div>
                  <input
                    type="radio"
                    name="modalAiPersona"
                    checked={aiPersona === 'GENTLE'}
                    onChange={() => setAiPersona('GENTLE')}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', lineHeight: 1.3 }}>
                  Encouraging & supportive feedback
                </span>
              </label>

              {/* Balanced */}
              <label style={{
                padding: '12px 10px',
                background: aiPersona === 'BALANCED' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                border: `1.5px solid ${aiPersona === 'BALANCED' ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'var(--transition-smooth)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--saffron-ember)', fontWeight: 700, fontSize: '0.86rem' }}>
                    <Compass size={15} />
                    <span>Balanced</span>
                  </div>
                  <input
                    type="radio"
                    name="modalAiPersona"
                    checked={aiPersona === 'BALANCED'}
                    onChange={() => setAiPersona('BALANCED')}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', lineHeight: 1.3 }}>
                  Direct, objective & realistic coaching
                </span>
              </label>

              {/* Strict */}
              <label style={{
                padding: '12px 10px',
                background: aiPersona === 'STRICT' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                border: `1.5px solid ${aiPersona === 'STRICT' ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'var(--transition-smooth)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontWeight: 700, fontSize: '0.86rem' }}>
                    <ShieldAlert size={15} />
                    <span>Strict</span>
                  </div>
                  <input
                    type="radio"
                    name="modalAiPersona"
                    checked={aiPersona === 'STRICT'}
                    onChange={() => setAiPersona('STRICT')}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', lineHeight: 1.3 }}>
                  No excuses, hard truth accountability
                </span>
              </label>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border-walnut-faint)' }} />

          {/* Profile Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
                <User size={14} color="var(--saffron-ember)" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
                <Globe size={14} color="var(--chinar-rust)" />
                <span>Timezone</span>
              </label>
              <input
                type="text"
                className="input-field"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-tweed-dim)', marginBottom: '4px' }}>
              Email: <strong style={{ color: 'var(--text-parchment-muted)' }}>{user?.email}</strong>
            </label>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-walnut-faint)',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="btn-secondary"
              style={{
                color: '#F87171',
                borderColor: 'rgba(248, 113, 113, 0.3)',
                padding: '8px 14px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.84rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ padding: '8px 18px', fontSize: '0.84rem' }}
              >
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
