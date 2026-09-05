import React from 'react';
import { DayOfWeekStats } from '../../api/analyticsApi';
import { CalendarDays, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DayOfWeekMatrixProps {
  stats: DayOfWeekStats[];
}

export const DayOfWeekMatrix: React.FC<DayOfWeekMatrixProps> = ({ stats }) => {
  if (!stats || stats.length === 0) return null;

  const peakDay = stats.find(s => s.isPeakDay && s.totalPlanned > 0);
  const frictionDay = stats.find(s => s.isFrictionDay && s.totalPlanned > 0 && s.winRate < (peakDay?.winRate ?? 100));

  return (
    <div className="harud-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--saffron-ember), #9A5B18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CalendarDays size={17} color="#fff" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
              Day-of-Week Rhythm Matrix
            </h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)' }}>
              Identify your high-velocity momentum days vs friction days
            </span>
          </div>
        </div>

        {/* Highlights */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {peakDay && (
            <span style={{
              fontSize: '0.74rem',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(74, 222, 128, 0.15)',
              color: '#4ADE80',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Zap size={12} />
              <span>Peak: {peakDay.dayName} ({Math.round(peakDay.winRate)}%)</span>
            </span>
          )}
          {frictionDay && (
            <span style={{
              fontSize: '0.74rem',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(248, 113, 113, 0.15)',
              color: '#F87171',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <AlertTriangle size={12} />
              <span>Friction: {frictionDay.dayName} ({Math.round(frictionDay.winRate)}%)</span>
            </span>
          )}
        </div>
      </div>

      {/* 7-Day Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
        gap: '10px',
      }}>
        {stats.map((day) => {
          const hasData = day.totalPlanned > 0;
          const isHighWin = day.winRate >= 75 && hasData;
          const isLowWin = day.winRate < 50 && hasData;

          return (
            <div
              key={day.dayIndex}
              style={{
                background: day.isPeakDay
                  ? 'rgba(46, 125, 82, 0.12)'
                  : day.isFrictionDay
                    ? 'rgba(192, 83, 48, 0.12)'
                    : 'var(--bg-walnut-surface)',
                border: `1px solid ${
                  day.isPeakDay
                    ? 'rgba(74, 222, 128, 0.35)'
                    : day.isFrictionDay
                      ? 'rgba(248, 113, 113, 0.35)'
                      : 'var(--border-walnut-faint)'
                }`,
                borderRadius: 'var(--radius-sm)',
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* Day Name */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                  {day.dayName}
                </span>
                {day.isPeakDay && <Zap size={12} color="#4ADE80" />}
                {day.isFrictionDay && <AlertTriangle size={12} color="#F87171" />}
              </div>

              {/* Win Rate */}
              <div style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: !hasData ? 'var(--text-tweed-dim)' : isHighWin ? '#4ADE80' : isLowWin ? '#F87171' : 'var(--saffron-ember)',
                lineHeight: 1,
              }}>
                {hasData ? `${Math.round(day.winRate)}%` : '—'}
              </div>

              {/* Progress Mini Bar */}
              <div style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${hasData ? day.winRate : 0}%`,
                  background: isHighWin ? '#4ADE80' : isLowWin ? '#F87171' : 'var(--saffron-ember)',
                  borderRadius: 'var(--radius-full)',
                }} />
              </div>

              {/* Sub-text: Count & Focus Time */}
              <div style={{ fontSize: '0.70rem', color: 'var(--text-tweed-dim)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>{hasData ? `${day.completedCount}/${day.totalPlanned} kept` : 'No tasks'}</span>
                {hasData && (
                  <span style={{ color: 'var(--text-parchment-muted)' }}>
                    {(day.totalFocusMinutes / 60).toFixed(1)}h focus
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
