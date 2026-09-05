import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsApi, AccountabilityStats } from '../../api/analyticsApi';
import { aiApi, BehavioralSynthesisDto } from '../../api/aiApi';
import { useToast } from '../../context/ToastContext';
import { BarChart3, TrendingUp, Clock, CheckCircle2, AlertTriangle, Flame, Sparkles, RefreshCw, ChevronDown, ChevronUp, Zap, Target, BookOpen, Lightbulb } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [days, setDays] = useState(30);
  const [showDeepDive, setShowDeepDive] = useState(false);

  const { data: stats = null, isLoading: loading } = useQuery<AccountabilityStats | null>({
    queryKey: ['analytics', days],
    queryFn: () => analyticsApi.getSummary(days),
    staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
  });

  const { data: insights = null, isLoading: loadingInsights, refetch: refetchInsights } = useQuery<BehavioralSynthesisDto | null>({
    queryKey: ['aiInsights'],
    queryFn: () => aiApi.getInsights(),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh cache
  });

  const loadInsights = () => {
    refetchInsights();
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
          <div className="analytics-stats-grid">
            {/* Completion Rate */}
            <div className="harud-card" style={{ padding: '18px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Completion Velocity</span>
                <TrendingUp size={15} color="var(--saffron-ember)" />
              </div>
              <div style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                color: stats.completionRate >= 75 ? '#4ADE80' : 'var(--saffron-ember)',
                marginTop: '6px',
                lineHeight: 1.1,
              }}>
                {Math.round(stats.completionRate)}%
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', marginTop: '4px' }}>
                {stats.completedCommitments} kept out of {stats.totalCommitments} total
              </div>
            </div>

            {/* Total Focus Hours */}
            <div className="harud-card" style={{ padding: '18px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Total Focus Time</span>
                <Clock size={15} color="var(--chinar-rust)" />
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-kehwa-cream)', marginTop: '6px', lineHeight: 1.1 }}>
                {stats.totalFocusHours.toFixed(1)}h
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', marginTop: '4px' }}>
                Avg {stats.avgDailyFocusHours.toFixed(1)}h per day
              </div>
            </div>

            {/* Kept Commitments */}
            <div className="harud-card" style={{ padding: '18px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Promises Honored</span>
                <CheckCircle2 size={15} color="#4ADE80" />
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#4ADE80', marginTop: '6px', lineHeight: 1.1 }}>
                {stats.completedCommitments}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', marginTop: '4px' }}>
                Executed without fail
              </div>
            </div>

            {/* Missed / Postponed */}
            <div className="harud-card" style={{ padding: '18px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Rescheduled / Missed</span>
                <AlertTriangle size={15} color={stats.postponedCommitments + stats.missedCommitments > 0 ? '#F87171' : 'var(--text-tweed-dim)'} />
              </div>
              <div style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                color: stats.postponedCommitments + stats.missedCommitments > 0 ? '#F87171' : 'var(--text-tweed-dim)',
                marginTop: '6px',
                lineHeight: 1.1,
              }}>
                {stats.postponedCommitments + stats.missedCommitments}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', marginTop: '4px' }}>
                {stats.postponedCommitments} rescheduled • {stats.missedCommitments} dropped
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

          {/* Structured Behavioral Synthesis Card (Approach A: Progressive Disclosure) */}
          <div className="harud-card" style={{ padding: '24px', border: '1px solid var(--border-copper-subtle)', background: 'linear-gradient(180deg, var(--bg-walnut-card) 0%, var(--bg-walnut-surface) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
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
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
                    Behavioral Execution Synthesis
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
                    Instant O(1) Rollup Memory • Dual-Layer Progressive Synthesis
                  </span>
                </div>
              </div>

              <button
                onClick={loadInsights}
                disabled={loadingInsights}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Refresh behavioral synthesis"
              >
                <RefreshCw size={12} className={loadingInsights ? 'spinner' : ''} />
                <span>{loadingInsights ? 'Synthesizing...' : 'Refresh'}</span>
              </button>
            </div>

            {loadingInsights ? (
              <p style={{ color: 'var(--text-tweed-dim)', fontSize: '0.86rem', fontStyle: 'italic', margin: 0 }}>
                Synthesizing multi-day execution trends and friction patterns...
              </p>
            ) : insights ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. Executive Summary */}
                <div style={{
                  background: 'rgba(28, 21, 16, 0.7)',
                  borderLeft: '4px solid var(--saffron-ember)',
                  padding: '12px 16px',
                  borderRadius: '0 8px 8px 0',
                  color: 'var(--text-kehwa-cream)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}>
                  {insights.summary}
                </div>

                {/* 2. Exactly 3 Key Observations */}
                {insights.keyObservations && insights.keyObservations.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-parchment-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Key Empirical Observations
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {insights.keyObservations.map((obs, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '8px 12px',
                            background: 'rgba(20, 15, 12, 0.4)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-walnut-faint)',
                            fontSize: '0.86rem',
                            color: 'var(--text-kehwa-cream)',
                            lineHeight: 1.45,
                          }}
                        >
                          <span style={{
                            minWidth: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(217, 119, 6, 0.18)',
                            color: 'var(--saffron-ember)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            flexShrink: 0,
                            marginTop: '1px',
                          }}>
                            {idx + 1}
                          </span>
                          <span>{obs}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Quick High-Leverage Tweak */}
                {insights.quickTweak && (
                  <div style={{
                    padding: '10px 14px',
                    background: 'rgba(217, 119, 6, 0.08)',
                    border: '1px solid rgba(217, 119, 6, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <Zap size={18} color="var(--saffron-ember)" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-kehwa-cream)', lineHeight: 1.4 }}>
                      <strong style={{ color: 'var(--saffron-ember)' }}>Tactical Tweak: </strong>
                      {insights.quickTweak}
                    </div>
                  </div>
                )}

                {/* 4. Progressive Disclosure Expand / Collapse Button */}
                {(insights.rootCauseDeconstruction || (insights.tacticalHabits && insights.tacticalHabits.length > 0)) && (
                  <div style={{ marginTop: '4px' }}>
                    <button
                      onClick={() => setShowDeepDive(!showDeepDive)}
                      className="btn-secondary"
                      style={{
                        width: '100%',
                        padding: '9px 14px',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: showDeepDive ? 'var(--bg-walnut-card-hover)' : 'rgba(28, 21, 16, 0.5)',
                        border: '1px solid var(--border-copper-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-kehwa-cream)',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)',
                      }}
                    >
                      {showDeepDive ? <ChevronUp size={15} color="var(--saffron-ember)" /> : <ChevronDown size={15} color="var(--saffron-ember)" />}
                      <span style={{ fontWeight: 600 }}>
                        {showDeepDive ? 'Collapse Deep-Dive Deconstruction' : '🔍 View Deep-Dive Root Cause & Habit Deconstruction'}
                      </span>
                    </button>

                    {/* Deep-Dive Deconstruction Accordion Drawer (Instant 0ms client-side toggle) */}
                    {showDeepDive && (
                      <div style={{
                        marginTop: '12px',
                        padding: '16px',
                        background: 'rgba(16, 12, 10, 0.85)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-copper-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        animation: 'fadeIn 0.2s ease-in-out',
                      }}>
                        {/* Root Cause Deconstruction */}
                        {insights.rootCauseDeconstruction && (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--saffron-ember)', fontSize: '0.84rem', fontWeight: 700 }}>
                              <Target size={15} />
                              <span>Root Cause Friction Mechanism</span>
                            </div>
                            <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.6, margin: 0 }}>
                              {insights.rootCauseDeconstruction}
                            </p>
                          </div>
                        )}

                        {/* Tactical Habit Protocols */}
                        {insights.tacticalHabits && insights.tacticalHabits.length > 0 && (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#4ADE80', fontSize: '0.84rem', fontWeight: 700 }}>
                              <Lightbulb size={15} />
                              <span>Tactical Habit Protocols</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {insights.tacticalHabits.map((habit, hIdx) => (
                                <div
                                  key={hIdx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                    fontSize: '0.84rem',
                                    color: 'var(--text-kehwa-cream)',
                                    lineHeight: 1.45,
                                  }}
                                >
                                  <span style={{ color: '#4ADE80', fontWeight: 700 }}>•</span>
                                  <span>{habit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-tweed-dim)', fontSize: '0.86rem', margin: 0 }}>
                Keep logging daily commitments to generate long-term behavioral pattern analysis.
              </p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
