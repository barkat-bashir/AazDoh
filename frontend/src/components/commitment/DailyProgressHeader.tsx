import React from 'react';
import { Commitment } from '../../api/commitmentApi';
import { Plus, CheckSquare, Sparkles, Flame, Clock } from 'lucide-react';

interface DailyProgressHeaderProps {
  commitments: Commitment[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenAddModal: () => void;
  onOpenReviewModal: () => void;
  onOpenAiReview: () => void;
}

export const DailyProgressHeader: React.FC<DailyProgressHeaderProps> = ({
  commitments,
  selectedDate,
  onDateChange,
  onOpenAddModal,
  onOpenReviewModal,
  onOpenAiReview,
}) => {
  const total = commitments.length;
  const completed = commitments.filter((c) => c.status === 'COMPLETED').length;
  const totalMinutes = commitments.reduce((acc, c) => acc + c.estimatedMinutes, 0);
  const completedMinutes = commitments
    .filter((c) => c.status === 'COMPLETED')
    .reduce((acc, c) => acc + c.estimatedMinutes, 0);

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalHours = (totalMinutes / 60).toFixed(1);
  const completedHours = (completedMinutes / 60).toFixed(1);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="harud-card" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.45rem', color: 'var(--text-kehwa-cream)' }}>
              {isToday ? "Today's Commitments" : `Commitments for ${selectedDate}`}
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              style={{
                background: 'var(--bg-walnut-surface)',
                border: '1px solid var(--border-walnut-faint)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                color: 'var(--text-parchment-muted)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            />
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', marginTop: '4px' }}>
            {total === 0
              ? 'No commitments defined yet. Set your daily goals.'
              : `${completed} of ${total} Kept • ${completedHours}h of ${totalHours}h focused`}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenAiReview}
            className="btn-secondary"
            style={{ borderColor: 'var(--border-copper-subtle)', background: 'rgba(226, 149, 59, 0.12)', color: 'var(--saffron-ember)', fontWeight: '700' }}
            title="Chief of Staff 60-second plan stress-test with risk index and de-risking actions"
          >
            <Sparkles size={15} color="var(--saffron-ember)" />
            <span>⚡ Plan Stress-Test</span>
          </button>

          <button
            onClick={onOpenReviewModal}
            className="btn-saffron"
            title="Run end-of-day reflection review"
          >
            <CheckSquare size={16} />
            <span>Daily Review</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Add Commitment</span>
          </button>
        </div>
      </div>

      {/* Visual Kashmir Momentum Bar */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-tweed-dim)',
          marginBottom: '6px',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={13} color="var(--chinar-rust)" />
            <span>Daily Accountability Completion</span>
          </span>
          <span style={{ color: percentage === 100 ? '#4ADE80' : 'var(--saffron-ember)' }}>
            {percentage}%
          </span>
        </div>

        <div style={{
          width: '100%',
          height: '8px',
          background: 'var(--bg-walnut-surface)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--border-walnut-faint)',
        }}>
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            background: percentage === 100
              ? 'linear-gradient(90deg, #2E7D52, #4ADE80)'
              : 'linear-gradient(90deg, var(--chinar-rust), var(--saffron-ember))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: percentage > 0 ? '0 0 10px var(--chinar-glow)' : 'none',
          }} />
        </div>
      </div>
    </div>
  );
};
