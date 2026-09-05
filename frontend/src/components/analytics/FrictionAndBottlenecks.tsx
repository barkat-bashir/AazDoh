import React from 'react';
import { ProcrastinationBottleneck, DailyPositionDropoff } from '../../api/analyticsApi';
import { AlertOctagon, TrendingDown, ArrowDownRight, Layers, CheckCircle2, Moon } from 'lucide-react';

interface FrictionAndBottlenecksProps {
  bottlenecks: ProcrastinationBottleneck[];
  dailyDropoff: DailyPositionDropoff[];
}

export const FrictionAndBottlenecks: React.FC<FrictionAndBottlenecksProps> = ({
  bottlenecks,
  dailyDropoff,
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
      {/* Repeat Offender Tasks (Procrastination Bottlenecks) */}
      <div className="harud-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #EF4444, #991B1B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AlertOctagon size={17} color="#fff" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
              Procrastination Bottlenecks
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
              Tasks repeatedly postponed or rolled over
            </span>
          </div>
        </div>

        {/* Bottleneck Task List */}
        {bottlenecks.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tweed-dim)', fontSize: '0.84rem' }}>
            🎉 No repeat procrastination bottlenecks found! Your follow-through is solid.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {bottlenecks.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(192, 83, 48, 0.08)',
                  border: '1px solid rgba(248, 113, 113, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <Moon size={13} color="#F87171" style={{ flexShrink: 0 }} />
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-kehwa-cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.70rem', color: 'var(--text-tweed-dim)' }}>
                    First logged: {item.firstSeenDate} • Status: {item.latestStatus}
                  </span>
                </div>

                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(248, 113, 113, 0.18)',
                  color: '#F87171',
                  border: '1px solid rgba(248, 113, 113, 0.35)',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  Pushed {item.postponementCount}x
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Task Sequence Position Drop-off */}
      <div className="harud-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--saffron-ember), #8A4D10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Layers size={17} color="#fff" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
              Daily Sequence Drop-off Curve
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
              How completion rate decays across chronological task order
            </span>
          </div>
        </div>

        {/* Position Drop-off List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {dailyDropoff.map((pos) => {
            const hasData = pos.totalCount > 0;
            const isHigh = pos.winRate >= 75 && hasData;
            const isLow = pos.winRate < 50 && hasData;

            return (
              <div
                key={pos.positionIndex}
                style={{
                  background: 'var(--bg-walnut-surface)',
                  border: '1px solid var(--border-walnut-faint)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
                    {pos.positionLabel}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
                      {pos.completedCount}/{pos.totalCount} kept
                    </span>
                    <strong style={{ color: !hasData ? 'var(--text-tweed-dim)' : isHigh ? '#4ADE80' : isLow ? '#F87171' : 'var(--saffron-ember)', fontSize: '0.86rem' }}>
                      {hasData ? `${Math.round(pos.winRate)}%` : '—'}
                    </strong>
                  </div>
                </div>

                <div style={{
                  width: '100%',
                  height: '5px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${hasData ? pos.winRate : 0}%`,
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
  );
};
