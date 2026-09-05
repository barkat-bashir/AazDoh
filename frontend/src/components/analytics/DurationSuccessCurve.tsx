import React from 'react';
import { DurationBucketStats, PriorityBreakdown } from '../../api/analyticsApi';
import { Timer, CheckCircle2, Award, PieChart, ShieldAlert } from 'lucide-react';

interface DurationSuccessCurveProps {
  durationBuckets: DurationBucketStats[];
  priorityBreakdown: PriorityBreakdown[];
}

export const DurationSuccessCurve: React.FC<DurationSuccessCurveProps> = ({
  durationBuckets,
  priorityBreakdown,
}) => {
  const optimalBucket = durationBuckets.find(b => b.isOptimal && b.totalCount > 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#F87171';
      case 'MEDIUM': return 'var(--saffron-ember)';
      default: return '#4ADE80';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
      {/* Duration Success Curve (Sprint Sizing) */}
      <div className="harud-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10B981, #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Timer size={17} color="#fff" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
                Sprint Duration Success Curve
              </h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
                Empirical completion rate across task duration buckets
              </span>
            </div>
          </div>

          {optimalBucket && (
            <span style={{
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(74, 222, 128, 0.15)',
              color: '#4ADE80',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Award size={12} />
              <span>Optimal: {optimalBucket.bucketLabel}</span>
            </span>
          )}
        </div>

        {/* Bucket Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {durationBuckets.map((bucket) => {
            const hasData = bucket.totalCount > 0;
            const isHigh = bucket.winRate >= 75 && hasData;
            const isLow = bucket.winRate < 50 && hasData;

            return (
              <div
                key={bucket.bucketLabel}
                style={{
                  background: bucket.isOptimal ? 'rgba(46, 125, 82, 0.12)' : 'var(--bg-walnut-surface)',
                  border: `1px solid ${bucket.isOptimal ? 'rgba(74, 222, 128, 0.35)' : 'var(--border-walnut-faint)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
                      {bucket.bucketLabel}
                    </span>
                    {bucket.isOptimal && (
                      <span style={{ fontSize: '9px', background: 'rgba(74, 222, 128, 0.2)', color: '#4ADE80', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                        BEST
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
                      {bucket.completedCount}/{bucket.totalCount} kept
                    </span>
                    <strong style={{ color: !hasData ? 'var(--text-tweed-dim)' : isHigh ? '#4ADE80' : isLow ? '#F87171' : 'var(--saffron-ember)', fontSize: '0.86rem' }}>
                      {hasData ? `${Math.round(bucket.winRate)}%` : '—'}
                    </strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '5px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${hasData ? bucket.winRate : 0}%`,
                    background: isHigh ? 'linear-gradient(90deg, var(--pine-emerald), #4ADE80)' : isLow ? '#F87171' : 'var(--saffron-ember)',
                    borderRadius: 'var(--radius-full)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Allocation & Velocity */}
      <div className="harud-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PieChart size={17} color="#fff" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
              Priority Volume Allocation
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
              Distribution of executed focus time by commitment priority
            </span>
          </div>
        </div>

        {/* Priority Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', height: '100%' }}>
          {priorityBreakdown.map((item) => {
            const hasData = item.totalCount > 0;
            const winRate = hasData ? Math.round((item.completedCount / item.totalCount) * 100) : 0;

            return (
              <div
                key={item.priority}
                style={{
                  background: 'var(--bg-walnut-surface)',
                  border: '1px solid var(--border-walnut-faint)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: getPriorityColor(item.priority),
                    }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                      {item.priority} PRIORITY
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.76rem' }}>
                    <span style={{ color: 'var(--text-tweed-dim)' }}>
                      {(item.totalMinutes / 60).toFixed(1)}h ({Math.round(item.percentageOfTime)}% of time)
                    </span>
                    <span style={{ color: winRate >= 75 ? '#4ADE80' : 'var(--saffron-ember)', fontWeight: 700 }}>
                      {winRate}% win
                    </span>
                  </div>
                </div>

                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${item.percentageOfTime}%`,
                    background: getPriorityColor(item.priority),
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
