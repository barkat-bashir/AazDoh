import React, { useState, useEffect } from 'react';
import { aiApi, AiFeedbackResponse, BehavioralSynthesisDto } from '../../api/aiApi';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Compass, ShieldAlert, HeartHandshake, RefreshCw, Check, Flame, Zap } from 'lucide-react';

export const AiAccountabilityPanel: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [planReview, setPlanReview] = useState<AiFeedbackResponse | null>(null);
  const [insights, setInsights] = useState<BehavioralSynthesisDto | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [updatingPersona, setUpdatingPersona] = useState(false);

  useEffect(() => {
    fetchPlanReview();
    fetchInsights();
  }, []);

  const fetchPlanReview = async () => {
    try {
      setLoadingPlan(true);
      const res = await aiApi.reviewDailyPlan();
      setPlanReview(res);
    } catch (err: any) {
      showToast('Could not load plan review', 'error');
    } finally {
      setLoadingPlan(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await aiApi.getInsights();
      setInsights(res);
    } catch (err: any) {
      showToast('Could not load behavioral insights', 'error');
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSetPersona = async (persona: 'GENTLE' | 'BALANCED' | 'STRICT') => {
    try {
      setUpdatingPersona(true);
      await authApi.updatePreferences({ aiPersona: persona });
      await refreshUser();
      showToast(`AI Challenger Persona switched to ${persona}`, 'success');
      fetchPlanReview();
    } catch (err: any) {
      showToast('Failed to update persona', 'error');
    } finally {
      setUpdatingPersona(false);
    }
  };

  const currentPersona = user?.aiPersona || 'BALANCED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Persona Mode Selector */}
      <div className="harud-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={18} color="#F5EFEB" />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-kehwa-cream)' }}>
                AI Accountability Challenger
              </h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', marginTop: '4px' }}>
              Objective, unvarnished feedback on your planning realism and commitment follow-through.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={fetchPlanReview}
              className="btn-secondary"
              disabled={loadingPlan}
              style={{ padding: '8px 12px', fontSize: '0.82rem' }}
            >
              <RefreshCw size={14} className={loadingPlan ? 'animate-spin' : ''} />
              <span>Re-analyze Today</span>
            </button>
          </div>
        </div>

        {/* Persona Mode Switcher */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--saffron-ember)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Select AI Challenger Persona
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {/* GENTLE */}
            <div
              onClick={() => handleSetPersona('GENTLE')}
              style={{
                padding: '14px',
                background: currentPersona === 'GENTLE' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                border: `1px solid ${currentPersona === 'GENTLE' ? 'var(--pine-emerald)' : 'var(--border-walnut-faint)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HeartHandshake size={16} />
                  <span>Gentle</span>
                </span>
                {currentPersona === 'GENTLE' && <Check size={16} color="#4ADE80" />}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-parchment-muted)', marginTop: '6px' }}>
                Supportive inquiry: "Today didn't go as planned. What got in the way?"
              </p>
            </div>

            {/* BALANCED */}
            <div
              onClick={() => handleSetPersona('BALANCED')}
              style={{
                padding: '14px',
                background: currentPersona === 'BALANCED' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                border: `1px solid ${currentPersona === 'BALANCED' ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--saffron-ember)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={16} />
                  <span>Balanced</span>
                </span>
                {currentPersona === 'BALANCED' && <Check size={16} color="var(--saffron-ember)" />}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-parchment-muted)', marginTop: '6px' }}>
                Pragmatic realism: "You've postponed this twice. Let's inspect scope vs execution."
              </p>
            </div>

            {/* STRICT */}
            <div
              onClick={() => handleSetPersona('STRICT')}
              style={{
                padding: '14px',
                background: currentPersona === 'STRICT' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                border: `1px solid ${currentPersona === 'STRICT' ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={16} />
                  <span>Strict</span>
                </span>
                {currentPersona === 'STRICT' && <Check size={16} color="#F87171" />}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-parchment-muted)', marginTop: '6px' }}>
                Direct confrontation: "Either this isn't a true priority, or your sizing is broken."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Feasibility Analysis */}
      <div className="harud-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Flame size={18} color="var(--chinar-rust)" />
          <h4 style={{ fontSize: '1.1rem', color: 'var(--text-kehwa-cream)' }}>
            Today's Plan Feasibility Check
          </h4>
        </div>

        {loadingPlan ? (
          <p style={{ color: 'var(--text-tweed-dim)', padding: '16px 0' }}>AI Agent is evaluating your plan...</p>
        ) : planReview ? (
          <div style={{
            padding: '18px',
            background: 'var(--bg-walnut-surface)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid var(--chinar-rust)',
            fontSize: '0.92rem',
            color: 'var(--text-kehwa-cream)',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}>
            {planReview.feedback}
          </div>
        ) : (
          <p style={{ color: 'var(--text-tweed-dim)' }}>No active commitments found to analyze for today.</p>
        )}
      </div>

      {/* Synthesized Behavioral Patterns */}
      <div className="harud-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Compass size={18} color="var(--saffron-ember)" />
          <h4 style={{ fontSize: '1.1rem', color: 'var(--text-kehwa-cream)' }}>
            Synthesized Behavioral Insights
          </h4>
        </div>

        {loadingInsights ? (
          <p style={{ color: 'var(--text-tweed-dim)', padding: '16px 0' }}>Extracting patterns from your accountability memory...</p>
        ) : insights ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '14px 16px',
              background: 'var(--bg-walnut-surface)',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '3px solid var(--saffron-ember)',
              fontSize: '0.92rem',
              color: 'var(--text-kehwa-cream)',
              lineHeight: 1.5,
              fontWeight: 600,
            }}>
              {insights.summary}
            </div>

            {insights.keyObservations && insights.keyObservations.length > 0 && (
              <div style={{ display: 'grid', gap: '6px' }}>
                {insights.keyObservations.map((obs, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: 'var(--text-kehwa-cream)' }}>
                    <span style={{ color: 'var(--saffron-ember)', fontWeight: 700 }}>•</span>
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            )}

            {insights.quickTweak && (
              <div style={{
                padding: '8px 12px',
                background: 'rgba(217, 119, 6, 0.08)',
                border: '1px solid rgba(217, 119, 6, 0.25)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                color: 'var(--text-kehwa-cream)',
              }}>
                <Zap size={15} color="var(--saffron-ember)" style={{ flexShrink: 0 }} />
                <span><strong style={{ color: 'var(--saffron-ember)' }}>Tweak:</strong> {insights.quickTweak}</span>
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: 'var(--text-tweed-dim)' }}>Complete more daily reviews to unlock deeper behavioral insights.</p>
        )}
      </div>
    </div>
  );
};
