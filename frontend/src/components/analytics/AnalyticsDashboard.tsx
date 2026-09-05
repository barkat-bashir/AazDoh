import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, AccountabilityStats, ComprehensiveAnalytics } from '../../api/analyticsApi';
import { aiApi, BehavioralSynthesisDto } from '../../api/aiApi';
import { useToast } from '../../context/ToastContext';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Target, 
  Lightbulb, 
  Layers, 
  Compass,
  ArrowRight,
  Scale
} from 'lucide-react';
import { ConsistencyHeatmap } from './ConsistencyHeatmap';
import { DayOfWeekMatrix } from './DayOfWeekMatrix';
import { DurationSuccessCurve } from './DurationSuccessCurve';
import { FrictionAndBottlenecks } from './FrictionAndBottlenecks';

export const AnalyticsDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'deep_dive'>('overview');
  const [days, setDays] = useState(30);
  const [showDeepDiveAi, setShowDeepDiveAi] = useState(false);
  const [hasRequestedAi, setHasRequestedAi] = useState(false);

  // Tab 1: Fast Instant Overview Query (0ms SQL, 0 AI tokens)
  const { data: stats = null, isLoading: loadingOverview } = useQuery<AccountabilityStats | null>({
    queryKey: ['analytics-overview', days],
    queryFn: () => analyticsApi.getSummary(days),
    staleTime: 1000 * 60 * 3,
  });

  // Tab 2: Lazy Loaded Deep Dive Query (Only fires when user clicks Deep Dive tab)
  const { data: deepData = null, isLoading: loadingDeep } = useQuery<ComprehensiveAnalytics | null>({
    queryKey: ['analytics-comprehensive', days],
    queryFn: () => analyticsApi.getComprehensive(days, 180),
    enabled: activeTab === 'deep_dive',
    staleTime: 1000 * 60 * 5,
  });

  // On-Demand AI Synthesis Query (Only fires when user explicitly clicks "Synthesize with AI")
  const { data: aiInsights = null, isLoading: loadingAi, refetch: fetchAiSynthesis } = useQuery<BehavioralSynthesisDto | null>({
    queryKey: ['aiInsights'],
    queryFn: () => aiApi.getInsights(),
    enabled: hasRequestedAi,
    staleTime: 1000 * 60 * 10,
  });

  const handleTriggerAiSynthesis = () => {
    setHasRequestedAi(true);
    fetchAiSynthesis();
    showToast('Synthesizing behavioral patterns with AI...', 'info');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Card with Segmented Tabs */}
      <div className="harud-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BarChart3 size={19} color="#F5EFEB" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
                  Behavioral Velocity & Analytics
                </h3>
                <p style={{ fontSize: '0.80rem', color: 'var(--text-parchment-muted)', margin: '2px 0 0 0' }}>
                  Deterministic execution metrics, consistency patterns, and empirical rhythms.
                </p>
              </div>
            </div>
          </div>

          {/* Time Window Buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setDays(7)}
              className={days === 7 ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.80rem' }}
            >
              7 Days
            </button>
            <button
              onClick={() => setDays(30)}
              className={days === 30 ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.80rem' }}
            >
              30 Days
            </button>
            <button
              onClick={() => setDays(90)}
              className={days === 90 ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 12px', fontSize: '0.80rem' }}
            >
              90 Days
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '18px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-walnut-faint)'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn-pill ${activeTab === 'overview' ? 'active' : ''}`}
            style={{
              padding: '7px 16px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
            }}
          >
            <Zap size={14} />
            <span>Velocity Overview (Instant)</span>
          </button>

          <button
            onClick={() => setActiveTab('deep_dive')}
            className={`btn-pill ${activeTab === 'deep_dive' ? 'active' : ''}`}
            style={{
              padding: '7px 16px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
            }}
          >
            <Compass size={14} />
            <span>Deep-Dive Patterns & AI</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VELOCITY OVERVIEW (Instant SQL, Zero AI tokens)                    */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <>
          {loadingOverview ? (
            <p style={{ color: 'var(--text-tweed-dim)', padding: '24px 0', textAlign: 'center' }}>Loading overview metrics...</p>
          ) : stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            </div>
          ) : null}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEEP-DIVE PATTERNS & AI (Lazy Loaded on Demand)                    */}
      {/* ========================================================================= */}
      {activeTab === 'deep_dive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loadingDeep ? (
            <div className="harud-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(226,149,59,0.2)', borderTopColor: 'var(--saffron-ember)', borderRadius: '50%', margin: '0 auto 12px auto' }} />
              <p style={{ color: 'var(--text-kehwa-cream)', fontWeight: 600, margin: 0 }}>
                Aggregating multi-day behavioral patterns...
              </p>
            </div>
          ) : deepData ? (
            <>
              {/* 1. Planned vs Executed Ratio Bar */}
              {deepData.plannedVsExecuted && (
                <div className="harud-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--pine-emerald), var(--saffron-ember))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Scale size={18} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                        Capacity Execution Efficiency: {Math.round(deepData.plannedVsExecuted.executionEfficiency)}%
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-parchment-muted)', marginTop: '2px' }}>
                        Executed <strong style={{ color: '#4ADE80' }}>{deepData.plannedVsExecuted.completedHours}h</strong> out of <strong style={{ color: 'var(--saffron-ember)' }}>{deepData.plannedVsExecuted.plannedHours}h</strong> planned load ({deepData.plannedVsExecuted.optimismRatio}x planning optimism ratio)
                      </div>
                    </div>
                  </div>

                  <div style={{ minWidth: '200px', flex: '1 1 200px', maxWidth: '300px' }}>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(deepData.plannedVsExecuted.executionEfficiency, 100)}%`,
                        background: deepData.plannedVsExecuted.executionEfficiency >= 75 ? '#4ADE80' : 'linear-gradient(90deg, var(--saffron-ember), var(--chinar-rust))',
                        borderRadius: 'var(--radius-full)',
                      }} />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Consistency Heatmap (52-week intensity matrix) */}
              <ConsistencyHeatmap data={deepData.heatmap} />

              {/* 3. Day of Week Rhythm Matrix */}
              <DayOfWeekMatrix stats={deepData.dayOfWeekStats} />

              {/* 4. Sprint Sizing Duration Success Curve & Priority Volume */}
              <DurationSuccessCurve 
                durationBuckets={deepData.durationBuckets} 
                priorityBreakdown={deepData.priorityBreakdown} 
              />

              {/* 5. Friction & Procrastination Bottlenecks + Sequence Drop-off */}
              <FrictionAndBottlenecks 
                bottlenecks={deepData.procrastinationBottlenecks} 
                dailyDropoff={deepData.dailyDropoff} 
              />

              {/* 6. On-Demand AI Chief of Staff Synthesis Card */}
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
                        AI Chief-of-Staff Behavioral Synthesis
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
                        On-demand LLM reasoning powered by your empirical execution trends
                      </span>
                    </div>
                  </div>

                  {hasRequestedAi && (
                    <button
                      onClick={handleTriggerAiSynthesis}
                      disabled={loadingAi}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Re-synthesize with AI"
                    >
                      <RefreshCw size={12} className={loadingAi ? 'spinner' : ''} />
                      <span>{loadingAi ? 'Synthesizing...' : 'Refresh AI'}</span>
                    </button>
                  )}
                </div>

                {!hasRequestedAi ? (
                  <div style={{ textAlign: 'center', padding: '20px 10px', background: 'rgba(20, 15, 12, 0.4)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-copper-subtle)' }}>
                    <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.86rem', margin: '0 0 12px 0' }}>
                      Ready to synthesize your multi-day velocity, friction patterns, and duration sweet spots with AI.
                    </p>
                    <button
                      onClick={handleTriggerAiSynthesis}
                      className="btn-primary"
                      style={{
                        padding: '9px 18px',
                        fontSize: '0.84rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                      }}
                    >
                      <Sparkles size={15} />
                      <span>✨ Synthesize Insights with AI</span>
                    </button>
                  </div>
                ) : loadingAi ? (
                  <p style={{ color: 'var(--text-tweed-dim)', fontSize: '0.86rem', fontStyle: 'italic', margin: 0 }}>
                    Synthesizing multi-day execution trends and friction patterns...
                  </p>
                ) : aiInsights ? (
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
                      {aiInsights.summary}
                    </div>

                    {/* 2. Key Observations */}
                    {aiInsights.keyObservations && aiInsights.keyObservations.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-parchment-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Key Empirical Observations
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {aiInsights.keyObservations.map((obs, idx) => (
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
                    {aiInsights.quickTweak && (
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
                          {aiInsights.quickTweak}
                        </div>
                      </div>
                    )}

                    {/* 4. Deep Dive Accordion Drawer */}
                    {(aiInsights.rootCauseDeconstruction || (aiInsights.tacticalHabits && aiInsights.tacticalHabits.length > 0)) && (
                      <div style={{ marginTop: '4px' }}>
                        <button
                          onClick={() => setShowDeepDiveAi(!showDeepDiveAi)}
                          className="btn-secondary"
                          style={{
                            width: '100%',
                            padding: '9px 14px',
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: showDeepDiveAi ? 'var(--bg-walnut-card-hover)' : 'rgba(28, 21, 16, 0.5)',
                            border: '1px solid var(--border-copper-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-kehwa-cream)',
                            cursor: 'pointer',
                          }}
                        >
                          {showDeepDiveAi ? <ChevronUp size={15} color="var(--saffron-ember)" /> : <ChevronDown size={15} color="var(--saffron-ember)" />}
                          <span style={{ fontWeight: 600 }}>
                            {showDeepDiveAi ? 'Collapse Deep-Dive Deconstruction' : '🔍 View Deep-Dive Root Cause & Habit Deconstruction'}
                          </span>
                        </button>

                        {showDeepDiveAi && (
                          <div style={{
                            marginTop: '12px',
                            padding: '16px',
                            background: 'rgba(16, 12, 10, 0.85)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-copper-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                          }}>
                            {aiInsights.rootCauseDeconstruction && (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--saffron-ember)', fontSize: '0.84rem', fontWeight: 700 }}>
                                  <Target size={15} />
                                  <span>Root Cause Friction Mechanism</span>
                                </div>
                                <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.6, margin: 0 }}>
                                  {aiInsights.rootCauseDeconstruction}
                                </p>
                              </div>
                            )}

                            {aiInsights.tacticalHabits && aiInsights.tacticalHabits.length > 0 && (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#4ADE80', fontSize: '0.84rem', fontWeight: 700 }}>
                                  <Lightbulb size={15} />
                                  <span>Tactical Habit Protocols</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {aiInsights.tacticalHabits.map((habit, hIdx) => (
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
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
