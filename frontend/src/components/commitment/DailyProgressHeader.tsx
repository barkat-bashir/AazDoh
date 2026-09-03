import React, { useRef } from 'react';
import { Commitment } from '../../api/commitmentApi';
import { Plus, CheckSquare, Sparkles, Flame, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

import { getLocalTodayStr, getLocalYesterdayStr, formatLocalDate, parseLocalDate } from '../../utils/dateUtils';

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
  const dateInputRef = useRef<HTMLInputElement>(null);
  const total = commitments.length;
  const completed = commitments.filter((c) => c.status === 'COMPLETED').length;
  const totalMinutes = commitments.reduce((acc, c) => acc + c.estimatedMinutes, 0);
  const completedMinutes = commitments
    .filter((c) => c.status === 'COMPLETED')
    .reduce((acc, c) => acc + c.estimatedMinutes, 0);

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalHours = (totalMinutes / 60).toFixed(1);
  const completedHours = (completedMinutes / 60).toFixed(1);

  const todayStr = getLocalTodayStr();
  const yesterdayStr = getLocalYesterdayStr();
  const isToday = selectedDate === todayStr;

  // Format date display label nicely
  const getFormattedDateLabel = () => {
    try {
      const dateObj = parseLocalDate(selectedDate);
      const formatted = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(dateObj);

      if (isToday) return `Today, ${formatted}`;
      if (selectedDate === yesterdayStr) return `Yesterday, ${formatted}`;
      return formatted;
    } catch {
      return selectedDate;
    }
  };

  const shiftDate = (days: number) => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() + days);
    onDateChange(formatLocalDate(d));
  };

  return (
    <div className="harud-card" style={{ padding: 'clamp(16px, 3vw, 24px)', marginBottom: '20px' }}>
      {/* Top row: Date Switcher & Main Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: total > 0 ? '16px' : '0',
      }}>
        {/* Left: Date Switcher Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg-walnut-surface)',
            border: '1px solid var(--border-walnut-faint)',
            borderRadius: 'var(--radius-full)',
            padding: '3px 6px',
          }}>
            <button
              onClick={() => shiftDate(-1)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-parchment-muted)',
                cursor: 'pointer',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '50%',
              }}
              title="Previous Day"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
              style={{
                background: 'none',
                border: 'none',
                color: isToday ? 'var(--saffron-ember)' : 'var(--text-kehwa-cream)',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Pick a date"
            >
              <Calendar size={14} color="var(--chinar-rust)" />
              <span>{getFormattedDateLabel()}</span>
            </button>

            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
            />

            <button
              onClick={() => shiftDate(1)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-parchment-muted)',
                cursor: 'pointer',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '50%',
              }}
              title="Next Day"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {!isToday && (
            <button
              onClick={() => onDateChange(todayStr)}
              className="btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.76rem', borderRadius: 'var(--radius-full)' }}
            >
              Jump to Today
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {total > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-walnut-surface)',
              border: '1px solid var(--border-walnut-faint)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
              gap: '2px',
            }}>
              <button
                onClick={onOpenAiReview}
                className="btn-secondary"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--saffron-ember)',
                  fontSize: '0.8rem',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRadius: '4px',
                }}
                title="Check Plan Feasibility & Capacity"
              >
                <Sparkles size={13} color="var(--saffron-ember)" />
                <span>Feasibility</span>
              </button>

              <div style={{ width: '1px', height: '16px', background: 'var(--border-walnut-faint)' }} />

              <button
                onClick={onOpenReviewModal}
                className="btn-secondary"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-kehwa-cream)',
                  fontSize: '0.8rem',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRadius: '4px',
                }}
                title="Run daily accountability reflection ceremony"
              >
                <CheckSquare size={13} color="var(--saffron-ember)" />
                <span>Review Day</span>
              </button>
            </div>
          )}

          <button
            onClick={onOpenAddModal}
            className="btn-primary"
            style={{ fontSize: '0.84rem', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Plus size={15} />
            <span>Add Commitment</span>
          </button>
        </div>
      </div>

      {/* Progress & Stats Bar (Only when tasks exist) */}
      {total > 0 && (
        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-walnut-faint)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-tweed-dim)',
            marginBottom: '6px',
            flexWrap: 'wrap',
            gap: '6px',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-parchment-muted)' }}>
              <Flame size={13} color="var(--chinar-rust)" />
              <span>{completed} of {total} Kept • {completedHours}h of {totalHours}h focused</span>
            </span>
            <span style={{ color: percentage === 100 ? '#4ADE80' : 'var(--saffron-ember)', fontWeight: 700 }}>
              {percentage}%
            </span>
          </div>

          <div style={{
            width: '100%',
            height: '7px',
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
      )}
    </div>
  );
};
