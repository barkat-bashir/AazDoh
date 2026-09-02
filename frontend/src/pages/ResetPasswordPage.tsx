import React, { useState } from 'react';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import { KeyRound, CheckCircle, ArrowRight } from 'lucide-react';

interface ResetPasswordPageProps {
  token: string;
  onSuccess: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ token, onSuccess }) => {
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword(token, newPassword);
      setIsDone(true);
      showToast('Password reset successfully!', 'success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password. The link may have expired.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(16px, 4vw, 24px)',
      background: 'var(--bg-walnut-deep)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--bg-walnut-surface)',
        border: '1px solid var(--border-copper-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-warm-md), 0 0 35px var(--chinar-glow)',
        padding: 'clamp(24px, 6vw, 36px) clamp(18px, 5vw, 32px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 6px 18px var(--chinar-glow)',
          }}>
            <KeyRound size={24} color="#F5EFEB" />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-kehwa-cream)' }}>
            Choose New Password
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-parchment-muted)', marginTop: '8px' }}>
            Enter a strong new password for your AazDoh account.
          </p>
        </div>

        {isDone ? (
          <div style={{
            textAlign: 'center',
            padding: '24px 16px',
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: 'var(--radius-md)',
          }}>
            <CheckCircle size={36} color="#4ADE80" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ color: '#4ADE80', fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
              Password Updated!
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-parchment-muted)' }}>
              Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
                New Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '12px' }}
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={onSuccess}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.84rem' }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
