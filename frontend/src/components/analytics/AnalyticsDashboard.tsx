import React, { useState, useEffect } from 'react';
import { analyticsApi, AccountabilityStats } from '../../api/analyticsApi';
import { aiApi, AiFeedbackResponse } from '../../api/aiApi';
import { useToast } from '../../context/ToastContext';
import { BarChart3, TrendingUp, Clock, CheckCircle2, XCircle, AlertTriangle, Flame, Sparkles, RefreshCw } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<AccountabilityStats | null>(null);
  const [insights, setInsights] = useState<AiFeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    loadStats(days);
    loadInsights();
  }, [days]);

  const loadStats = async (d: number) => {
    try {
      setLoading(true);
      const res = await analyticsApi.getSummary(d);
      setStats(res);
    } catch (err: any) {
      showToast('Could not load analytics summary', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await aiApi.getInsights();
      setInsights(res);
    } catch (err: any) {
      // Non-critical if insights fail
    } finally {
      setLoadingInsights(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'UNDERESTIMATED': return 'Underestimated Work';
      case 'DISTRACTED': return 'Distraction';
      case 'BLOCKED': return 'Blocked / Dependency';
      case 'DID_NOT_PRIORITIZE': return 'Did Not Prioritize';
      case 'UNEXPECTED_SITUATION': return 'Unexpected Event';
      case 'FORGOT': return 'Forgot';
      default: return 'Other Reason';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Window Selector */}
      <div className="harud-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BarChart3 size={18} color="#F5EFEB" />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-kehwa-cream)' }}>
                Behavioral Velocity & Patterns
              </h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', marginTop: '4px' }}>
              True accountability metrics: your completion velocity and failure breakdown.
            </p>
          </div>

          {/* Time Window Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setDays(7)}
              className={days === 7 ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDays(30)}
              className={days === 30 ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              Last 30 Days
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-tweed-dim)', padding: '24px 0', textAlign: 'center' }}>Loading metrics...</p>
      ) : stats ? (
        <>
          {/* Key Stat Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Completion Rate */}
            <div className="harud-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.82rem' }}>
                <span>Completion Velocity</span>
                <TrendingUp size={16} color="var(--saffron-ember)" />
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: stats.completionRate >= 75 ? '#4ADE80' : 'var(--saffron-ember)',
                marginTop: '8px',
              }}>
                {Math.round(stats.completionRate)}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)', marginTop: '4px' }}>
                {stats.completedCommitments} kept out of {stats.totalCommitments} total
              </div>
            </div>

            {/* Total Focus Hours */}
            <div className="harud-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.82rem' }}>
                <span>Total Focus Time</span>
                <Clock size={16} color="var(--chinar-rust)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-kehwa-cream)', marginTop: '8px' }}>
                {stats.totalFocusHours.toFixed(1)}h
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)', marginTop: '4px' }}>
                Avg {stats.avgDailyFocusHours.toFixed(1)}h per day
              </div>
            </div>

            {/* Kept Commitments */}
            <div className="harud-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.82rem' }}>
                <span>Commitments Kept</span>
                <CheckCircle2 size={16} color="#4ADE80" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ADE80', marginTop: '8px' }}>
                {stats.completedCommitments}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)', marginTop: '4px' }}>
                Promises honored
              </div>
            </div>

            {/* Missed / Postponed */}
            <div className="harud-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.82rem' }}>
                <span>Missed / Rescheduled</span>
                <AlertTriangle size={16} color="#F87171" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F87171', marginTop: '8px' }}>
                {stats.missedCommitments}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)', marginTop: '4px' }}>
                {stats.postponedCommitments} rescheduled tasks
              </div>
            </div>
          </div>

          {/* Failure Reasons Breakdown Chart */}
          <div className="harud-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-kehwa-cream)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="var(--chinar-rust)" />
              <span>Common Failure Reasons Breakdown</span>
            </h4>

            {stats.failureBreakdown.length === 0 ? (
              <p style={{ color: 'var(--text-tweed-dim)', fontSize: '0.88rem' }}>
                No missed commitments or failure reasons recorded in this window. Keep going!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {stats.failureBreakdown.map((item) => (
                  <div key={item.reason}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-kehwa-cream)', fontWeight: 600 }}>
                        {getReasonLabel(item.reason)}
                      </span>
                      <span style={{ color: 'var(--saffron-ember)', fontWeight: 700 }}>
                        {item.count} times ({Math.round(item.percentage)}%)
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'var(--bg-walnut-surface)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        background: 'linear-gradient(90deg, var(--chinar-rust), var(--saffron-ember))',
                        borderRadius: 'var(--radius-full)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Behavioral Insights Card */}
          <div className="harud-card" style={{ padding: '24px', border: '1px solid var(--border-copper-subtle)', background: 'linear-gradient(180deg, var(--bg-walnut-card) 0%, var(--bg-walnut-surface) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Sparkles size={16} color="#fff" />
                </div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
                  AI Behavioral Synthesis
                </h4>
              </div>

              <button
                onClick={loadInsights}
                disabled={loadingInsights}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Refresh AI synthesis"
              >
                <RefreshCw size={12} className={loadingInsights ? 'spinner' : ''} />
                <span>{loadingInsights ? 'Synthesizing...' : 'Refresh'}</span>
              </button>
            </div>

            {loadingInsights ? (
              <p style={{ color: 'var(--text-tweed-dim)', fontSize: '0.86rem', fontStyle: 'italic', margin: 0 }}>
                Synthesizing multi-day execution patterns with AI Chief of Staff...
              </p>
            ) : insights ? (
              <div style={{
                background: 'rgba(28, 21, 16, 0.6)',
                borderLeft: '4px solid var(--saffron-ember)',
                padding: '14px 16px',
                borderRadius: '0 10px 10px 0',
                color: 'var(--text-kehwa-cream)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {insights.feedback}
              </div>
            ) : (
              <p style={{ color: 'var(--text-tweed-dim)', fontSize: '0.86rem', margin: 0 }}>
                Keep logging daily commitments to generate long-term AI behavioral pattern analysis.
              </p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
