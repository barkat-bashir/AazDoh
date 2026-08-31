import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { Settings, Save, Sparkles, User, Globe, HeartHandshake, Compass, ShieldAlert } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
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
  }, [user]);

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
      showToast('Settings saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <div className="harud-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Settings size={20} color="var(--chinar-rust)" />
          <h3 style={{ fontSize: '1.3rem', color: 'var(--text-kehwa-cream)' }}>
            Account & Accountability Preferences
          </h3>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
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
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-tweed-dim)', marginBottom: '6px' }}>
              Email Address (Cannot be changed)
            </label>
            <input
              type="text"
              className="input-field"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
              <Globe size={14} color="var(--chinar-rust)" />
              <span>Timezone (Affects Daily Review & Day boundary)</span>
            </label>
            <input
              type="text"
              className="input-field"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              <Sparkles size={14} color="var(--saffron-ember)" />
              <span>AI Accountability Challenger Persona</span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <label style={{
                padding: '12px',
                background: aiPersona === 'GENTLE' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                border: `1px solid ${aiPersona === 'GENTLE' ? 'var(--pine-emerald)' : 'var(--border-walnut-faint)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.88rem',
                color: '#4ADE80',
              }}>
                <input
                  type="radio"
                  name="aiPersona"
                  checked={aiPersona === 'GENTLE'}
                  onChange={() => setAiPersona('GENTLE')}
                />
                <HeartHandshake size={16} />
                <span>Gentle</span>
              </label>

              <label style={{
                padding: '12px',
                background: aiPersona === 'BALANCED' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                border: `1px solid ${aiPersona === 'BALANCED' ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.88rem',
                color: 'var(--saffron-ember)',
              }}>
                <input
                  type="radio"
                  name="aiPersona"
                  checked={aiPersona === 'BALANCED'}
                  onChange={() => setAiPersona('BALANCED')}
                />
                <Compass size={16} />
                <span>Balanced</span>
              </label>

              <label style={{
                padding: '12px',
                background: aiPersona === 'STRICT' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                border: `1px solid ${aiPersona === 'STRICT' ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.88rem',
                color: '#F87171',
              }}>
                <input
                  type="radio"
                  name="aiPersona"
                  checked={aiPersona === 'STRICT'}
                  onChange={() => setAiPersona('STRICT')}
                />
                <ShieldAlert size={16} />
                <span>Strict</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px', paddingTop: '16px', borderTop: '1px solid var(--border-walnut-faint)' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
