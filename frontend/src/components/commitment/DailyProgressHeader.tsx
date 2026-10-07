import React, { useRef } from 'react';
import { Commitment } from '../../api/commitmentApi';
import { PlanStressTestResponse } from '../../api/aiApi';
import { Plus, CheckSquare, Sparkles, Flame, ChevronLeft, ChevronRight, Calendar, Zap, ShieldAlert, Activity } from 'lucide-react';

import { getLocalTodayStr, getLocalYesterdayStr, formatLocalDate, parseLocalDate } from '../../utils/dateUtils';

interface DailyProgressHeaderProps {
  commitments: Commitment[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenAddModal: () => void;
  onOpenReviewModal: () => void;
  onOpenAiReview: () => void;
  stressTestData?: PlanStressTestResponse | null;
  isStressTestLoading?: boolean;
}

export const DailyProgressHeader: React.FC<DailyProgressHeaderProps> = ({
  commitments,
  selectedDate,
  onDateChange,
  onOpenAddModal,
  onOpenReviewModal,
  onOpenAiReview,
  stressTestData,
  isStressTestLoading,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const total = commitments.length;
  const completed = commitments.filter((c) => c.status === 'COMPLETED').length;
  const deepWorkCommitments = commitments.filter((c) => c.category !== 'ROUTINE');
  const totalFocusMinutes = deepWorkCommitments.reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0);
  const completedFocusMinutes = deepWorkCommitments
    .filter((c) => c.status === 'COMPLETED')
    .reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0);

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalHours = (totalFocusMinutes / 60).toFixed(1);
  const completedHours = (completedFocusMinutes / 60).toFixed(1);

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

  const plannedHoursNum = Number((totalFocusMinutes / 60).toFixed(1));
  const capacityHoursNum = stressTestData?.historicalCapacityHours ?? 2.0;
  const ratio = capacityHoursNum > 0 ? (plannedHoursNum / capacityHoursNum) : 1;
  const isCriticalOverload = ratio > 1.25 || stressTestData?.riskLevel === 'CRITICAL' || stressTestData?.riskLevel === 'HIGH';
  const isModerateStretch = (!isCriticalOverload && ratio > 1.0) || stressTestData?.riskLevel === 'MODERATE';
  const gaugeColor = isCriticalOverload ? '#F87171' : isModerateStretch ? 'var(--saffron-ember)' : '#4ADE80';
  const gaugeBg = isCriticalOverload ? 'rgba(248, 113, 113, 0.12)' : isModerateStretch ? 'rgba(226, 149, 59, 0.12)' : 'rgba(74, 222, 128, 0.10)';
  const gaugeBorder = isCriticalOverload ? 'rgba(248, 113, 113, 0.35)' : isModerateStretch ? 'rgba(226, 149, 59, 0.35)' : 'rgba(74, 222, 128, 0.3)';

  return (
    <div className="harud-card" style={{ padding: 'clamp(14px, 3vw, 24px)', marginBottom: '20px' }}>
      {/* Top row: Date Switcher & Main Actions */}
      <div className="daily-progress-top" style={{ marginBottom: total > 0 ? '16px' : '0' }}>
        {/* Left: Date Switcher Pill & Jump to Today */}
        <div className="daily-date-switcher">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: '36px',
            background: 'var(--bg-walnut-surface)',
            border: '1px solid var(--border-walnut-faint)',
            borderRadius: 'var(--radius-full)',
            padding: '0 6px',
            boxSizing: 'border-box',
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
                justifyContent: 'center',
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
                fontSize: '0.86rem',
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
                justifyContent: 'center',
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
              style={{
                height: '36px',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-walnut-faint)',
                background: 'var(--bg-walnut-surface)',
                color: 'var(--text-parchment-muted)',
                boxSizing: 'border-box',
              }}
            >
              Jump to Today
            </button>
          )}
        </div>

        {/* Right: Primary Actions (Review Day & Add Commitment) */}
        <div className="daily-header-actions">
          {total > 0 && (
            <button
              onClick={onOpenReviewModal}
              className="btn-secondary"
              style={{
                height: '36px',
                border: '1px solid var(--border-walnut-faint)',
                background: 'var(--bg-walnut-surface)',
                color: 'var(--text-kehwa-cream)',
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: '0 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: 'var(--radius-full)',
                boxSizing: 'border-box',
              }}
              title="Run daily accountability reflection ceremony"
            >
              <CheckSquare size={14} color="var(--saffron-ember)" />
              <span>Review Day</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="btn-primary daily-add-btn"
            style={{
              height: '36px',
              fontSize: '0.84rem',
              fontWeight: 700,
              padding: '0 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: 'var(--radius-full)',
              boxSizing: 'border-box',
            }}
          >
            <Plus size={15} />
            <span>Add Commitment</span>
          </button>
        </div>
      </div>

      {/* Progress & Workload Feasibility Bar (Only when tasks exist) */}
      {total > 0 && (
        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-walnut-faint)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-tweed-dim)',
            marginBottom: '8px',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {/* Left: Completion Progress */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-parchment-muted)' }}>
              <Flame size={14} color="var(--chinar-rust)" />
              <span>{completed} of {total} Kept • {completedHours}h of {totalHours}h focused</span>
            </span>

            {/* Right: Feasibility Gauge & Progress Percentage */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={onOpenAiReview}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: gaugeBg,
                  border: `1px solid ${gaugeBorder}`,
                  borderRadius: 'var(--radius-full)',
                  padding: '3px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  color: gaugeColor,
                  boxShadow: isCriticalOverload ? '0 0 10px rgba(248, 113, 113, 0.12)' : isModerateStretch ? '0 0 10px rgba(226, 149, 59, 0.12)' : 'none',
                  boxSizing: 'border-box',
                }}
                title="Click to view AI Feasibility Audit & Workload Rebalancing in Side Drawer"
              >
                <Zap size={12} color={gaugeColor} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>
                  {plannedHoursNum}h / {capacityHoursNum}h
                </span>
                <span style={{ fontSize: '0.70rem', opacity: 0.85, fontWeight: 600 }}>
                  ({Math.round(ratio * 100)}%)
                </span>
                {isCriticalOverload ? (
                  <span style={{ fontSize: '0.64rem', background: 'rgba(248, 113, 113, 0.25)', color: '#F87171', padding: '1px 5px', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.03em' }}>
                    OVERLOAD
                  </span>
                ) : isModerateStretch ? (
                  <span style={{ fontSize: '0.64rem', background: 'rgba(226, 149, 59, 0.25)', color: 'var(--saffron-ember)', padding: '1px 5px', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.03em' }}>
                    STRETCH
                  </span>
                ) : (
                  <span style={{ fontSize: '0.64rem', background: 'rgba(74, 222, 128, 0.2)', color: '#4ADE80', padding: '1px 5px', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.03em' }}>
                    OPTIMAL
                  </span>
                )}
                <Sparkles size={11} color={gaugeColor} style={{ opacity: 0.8, marginLeft: '1px' }} />
              </button>

              <span style={{ color: percentage === 100 ? '#4ADE80' : 'var(--saffron-ember)', fontWeight: 700, fontSize: '0.82rem' }}>
                {percentage}%
              </span>
            </div>
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
