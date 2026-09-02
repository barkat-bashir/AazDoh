import React, { useState } from 'react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Flame, Sparkles, Shield, Users, ArrowRight } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);

      if (authMode === 'forgot') {
        await authApi.forgotPassword(email.trim());
        setForgotSent(true);
        showToast('Reset link sent! Check your inbox.', 'success');
        return;
      }

      if (!password) return;

      if (authMode === 'register') {
        if (!fullName.trim()) {
          showToast('Full name is required', 'error');
          return;
        }
        const res = await authApi.register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          timezone,
        });
        login(res.accessToken, {
          id: res.userId,
          email: res.email,
          fullName: res.fullName,
          timezone,
          aiPersona: 'BALANCED',
          role: res.role as any,
        });
        showToast('Welcome to AazDoh!', 'success');
      } else {
        const res = await authApi.login({
          email: email.trim(),
          password,
        });
        login(res.accessToken, {
          id: res.userId,
          email: res.email,
          fullName: res.fullName,
          timezone,
          aiPersona: 'BALANCED',
          role: res.role as any,
        });
        showToast('Logged in successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
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
        {/* Logo & Kashmir Harud Header */}
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
            <Flame size={26} color="#F5EFEB" />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-kehwa-cream)' }}>
            AazDoh
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--saffron-ember)', fontWeight: 600, marginTop: '2px' }}>
            Commit • Do • Report • Reflect
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-parchment-muted)', marginTop: '8px' }}>
            {authMode === 'forgot'
              ? 'Enter your email to receive a password reset link'
              : authMode === 'register'
              ? 'Create your private accountability account'
              : 'Welcome back. Did you keep your word today?'}
          </p>
        </div>

        {authMode === 'forgot' && forgotSent ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
          }}>
            <p style={{ fontSize: '0.88rem', color: '#4ADE80', fontWeight: 600, marginBottom: '6px' }}>
              Check Your Inbox
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
              If an account exists for <strong>{email}</strong>, a password reset link has been sent. Please check your inbox and spam folder.
            </p>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setForgotSent(false); }}
              className="btn-secondary"
              style={{ marginTop: '16px', width: '100%', justifyContent: 'center', fontSize: '0.84rem' }}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {authMode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Barkat Ali"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={authMode === 'register'}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {authMode !== 'forgot' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
                    Password
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('forgot'); setForgotSent(false); }}
                      style={{ background: 'none', border: 'none', color: 'var(--saffron-ember)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {authMode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
                  Your Timezone
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '12px' }}
            >
              <span>
                {loading
                  ? 'Processing...'
                  : authMode === 'forgot'
                  ? 'Send Reset Link'
                  : authMode === 'register'
                  ? 'Create Account'
                  : 'Sign In'}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Switch Mode Links */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-parchment-muted)' }}>
          {authMode === 'forgot' ? (
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setForgotSent(false); }}
              style={{ background: 'none', border: 'none', color: 'var(--saffron-ember)', fontWeight: 600, cursor: 'pointer' }}
            >
              ← Back to Sign In
            </button>
          ) : authMode === 'register' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--saffron-ember)', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                style={{ background: 'none', border: 'none', color: 'var(--saffron-ember)', fontWeight: 600, cursor: 'pointer' }}
              >
                Register
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
