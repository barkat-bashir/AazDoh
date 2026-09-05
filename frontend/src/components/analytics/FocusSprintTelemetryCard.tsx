import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { focusApi, FocusSprintAnalytics } from '../../api/focusApi';
import { Zap, Flame, ShieldAlert, TrendingUp, Layers, CheckCircle2, BatteryMedium, StickyNote } from 'lucide-react';

interface FocusSprintTelemetryCardProps {
  days: number;
}

export const FocusSprintTelemetryCard: React.FC<FocusSprintTelemetryCardProps> = ({ days }) => {
  const { data: telemetry = null, isLoading } = useQuery<FocusSprintAnalytics | null>({
    queryKey: ['focusSprintAnalytics', days],
    queryFn: () => focusApi.getAnalytics(days),
    staleTime: 1000 * 60 * 3,
  });

  if (isLoading) {
    return (
      <div className="harud-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tweed-dim)' }}>
        Loading focus sprint telemetry...
      </div>
    );
  }

  if (!telemetry || telemetry.totalSprintsAttempted === 0) {
    return (
      <div className="harud-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={17} color="#fff" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
              Focus Sprint Telemetry
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-parchment-muted)', margin: '2px 0 0 0' }}>
              Launch your first Pomodoro Focus Sprint from any commitment card to unlock deep cognitive telemetry.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px',
      }}>
        {/* Total Clean Sprints */}
        <div className="harud-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>Clean Sprints Kept</span>
            <Zap size={14} color="var(--saffron-ember)" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#4ADE80', marginTop: '4px', lineHeight: 1.1 }}>
            {telemetry.totalSprintsCompleted}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', marginTop: '3px' }}>
            {telemetry.totalFocusMinutesLogged}m ({ (telemetry.totalFocusMinutesLogged / 60).toFixed(1) }h) deep focus
          </div>
        </div>

        {/* Sprint Follow-through Rate */}
        <div className="harud-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>Sprint Win Rate</span>
            <TrendingUp size={14} color="#4ADE80" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: telemetry.sprintCompletionRate >= 75 ? '#4ADE80' : 'var(--saffron-ember)', marginTop: '4px', lineHeight: 1.1 }}>
            {Math.round(telemetry.sprintCompletionRate)}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', marginTop: '3px' }}>
            {telemetry.totalSprintsCompleted}/{telemetry.totalSprintsAttempted} finished to 00:00
          </div>
        </div>

        {/* Distraction Density */}
        <div className="harud-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>Distraction Density</span>
            <StickyNote size={14} color="var(--chinar-rust)" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: telemetry.avgDistractionsPerSprint <= 1.0 ? '#4ADE80' : 'var(--saffron-ember)', marginTop: '4px', lineHeight: 1.1 }}>
            {telemetry.avgDistractionsPerSprint.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', marginTop: '3px' }}>
            Avg parked thoughts per sprint
          </div>
        </div>

        {/* Actual vs Estimated Calibration */}
        <div className="harud-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tweed-dim)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>Estimation Calibration</span>
            <BatteryMedium size={14} color="var(--saffron-ember)" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-kehwa-cream)', marginTop: '4px', lineHeight: 1.1 }}>
            {telemetry.actualVsEstimatedRatio}x
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', marginTop: '3px' }}>
            {telemetry.actualVsEstimatedRatio > 1.2 ? 'Tasks take longer than planned' : 'Accurately sized commitments'}
          </div>
        </div>
      </div>

      {/* Deep Work Fatigue Curve & Cadence Efficiency */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Fatigue Curve Card */}
        <div className="harud-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="var(--saffron-ember)" />
            <h4 style={{ fontSize: '0.98rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
              Deep Work Fatigue Curve (Daily Sprint Index)
            </h4>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', margin: 0 }}>
            Completion rate decays as daily sprint sequence increases
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            {telemetry.fatigueCurve.map((pos) => {
              const hasData = pos.totalSprints > 0;
              const isHigh = pos.completionRate >= 75 && hasData;
              const isLow = pos.completionRate < 50 && hasData;

              return (
                <div key={pos.positionIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-kehwa-cream)', fontWeight: 600 }}>{pos.positionLabel}</span>
                    <span style={{ color: !hasData ? 'var(--text-tweed-dim)' : isHigh ? '#4ADE80' : isLow ? '#F87171' : 'var(--saffron-ember)', fontWeight: 700 }}>
                      {hasData ? `${Math.round(pos.completionRate)}% (${pos.completedSprints}/${pos.totalSprints})` : '—'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${hasData ? pos.completionRate : 0}%`,
                      background: isHigh ? '#4ADE80' : isLow ? '#F87171' : 'var(--saffron-ember)',
                      borderRadius: 'var(--radius-full)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cadence Efficiency Card */}
        <div className="harud-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={16} color="var(--chinar-rust)" />
            <h4 style={{ fontSize: '0.98rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
              Sprint Cadence Follow-Through
            </h4>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', margin: 0 }}>
            Efficiency comparison across sprint duration presets
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            {telemetry.cadenceStats.map((c) => {
              const hasData = c.totalAttempted > 0;
              const isHigh = c.successRate >= 75 && hasData;
              const isLow = c.successRate < 50 && hasData;

              return (
                <div key={c.cadenceLabel} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-kehwa-cream)', fontWeight: 600 }}>{c.cadenceLabel}</span>
                    <span style={{ color: !hasData ? 'var(--text-tweed-dim)' : isHigh ? '#4ADE80' : isLow ? '#F87171' : 'var(--saffron-ember)', fontWeight: 700 }}>
                      {hasData ? `${Math.round(c.successRate)}% (${c.completedCount}/${c.totalAttempted})` : '—'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${hasData ? c.successRate : 0}%`,
                      background: isHigh ? 'linear-gradient(90deg, var(--pine-emerald), #4ADE80)' : isLow ? '#F87171' : 'var(--saffron-ember)',
                      borderRadius: 'var(--radius-full)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
