import React, { useState } from 'react';
import { HeatmapDay } from '../../api/analyticsApi';
import { Calendar, Flame, Clock, CheckCircle2 } from 'lucide-react';

interface ConsistencyHeatmapProps {
  data: HeatmapDay[];
}

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({ data }) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="harud-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tweed-dim)' }}>
        No consistency history recorded yet. Complete commitments to build your heatmap.
      </div>
    );
  }

  // Calculate summary stats from heatmap data
  const totalDays = data.length;
  const activeDays = data.filter(d => d.focusMinutes > 0).length;
  const totalFocusMins = data.reduce((acc, d) => acc + d.focusMinutes, 0);
  const totalCompleted = data.reduce((acc, d) => acc + d.completedCount, 0);
  const consistencyPct = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

  // Group data into weeks (columns of 7 days)
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  if (data.length > 0) {
    const firstDate = new Date(data[0].date);
    const dayOfWeek = (firstDate.getDay() + 6) % 7;
    for (let p = 0; p < dayOfWeek; p++) {
      currentWeek.push({
        date: '',
        completedCount: 0,
        totalCount: 0,
        focusMinutes: 0,
        intensityLevel: -1,
      });
    }
  }

  data.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: '',
        completedCount: 0,
        totalCount: 0,
        focusMinutes: 0,
        intensityLevel: -1,
      });
    }
    weeks.push(currentWeek);
  }

  const getCellColor = (level: number) => {
    switch (level) {
      case 1: return 'rgba(46, 125, 82, 0.45)';
      case 2: return 'rgba(46, 125, 82, 0.75)';
      case 3: return 'var(--pine-emerald)';
      case 4: return '#4ADE80';
      case 0: return 'rgba(255, 255, 255, 0.05)';
      default: return 'transparent';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleCellMouseEnter = (day: HeatmapDay, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const container = e.currentTarget.closest('.heatmap-container')?.getBoundingClientRect();
    if (container) {
      setTooltipPos({
        x: rect.left - container.left + rect.width / 2,
        y: rect.top - container.top - 8,
      });
    }
    setHoveredDay(day);
  };

  return (
    <div className="harud-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--pine-emerald), #1A4D31)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Calendar size={17} color="#4ADE80" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
              Execution Consistency Heatmap
            </h4>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)' }}>
              {activeDays} active focus days across the last {totalDays} days ({consistencyPct}% consistency)
            </span>
          </div>
        </div>

        {/* Quick Micro-Stats */}
        <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-parchment-muted)' }}>
            <Clock size={13} color="var(--saffron-ember)" />
            <span>{(totalFocusMins / 60).toFixed(1)}h logged</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-parchment-muted)' }}>
            <CheckCircle2 size={13} color="#4ADE80" />
            <span>{totalCompleted} kept</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="heatmap-container" style={{ overflowX: 'auto', paddingBottom: '6px', position: 'relative' }}>
        {/* Floating Tooltip */}
        {hoveredDay && tooltipPos && (
          <div
            style={{
              position: 'absolute',
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              transform: 'translate(-50%, -100%)',
              background: 'rgba(18, 14, 11, 0.95)',
              border: '1px solid var(--border-copper-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontSize: '0.74rem',
              color: 'var(--text-kehwa-cream)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 999,
              boxShadow: '0 8px 20px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              animation: 'fadeIn 0.15s ease-in-out',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--saffron-ember)', marginBottom: '2px' }}>
              {formatDate(hoveredDay.date)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-parchment-muted)' }}>
              <span>{hoveredDay.focusMinutes > 0 ? `${hoveredDay.focusMinutes}m (${(hoveredDay.focusMinutes / 60).toFixed(1)}h)` : '0m'} focus</span>
              <span>•</span>
              <span style={{ color: hoveredDay.completedCount > 0 ? '#4ADE80' : 'inherit' }}>
                {hoveredDay.completedCount}/{hoveredDay.totalCount} kept
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '4px', minWidth: 'max-content', alignItems: 'flex-start' }}>
          {/* Day of week labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginRight: '6px', fontSize: '10px', color: 'var(--text-tweed-dim)', fontWeight: 600, height: '94px', justifyContent: 'space-between' }}>
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
            <span>Sun</span>
          </div>

          {/* Weeks Columns */}
          {weeks.map((week, wIdx) => (
            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {week.map((day, dIdx) => {
                if (day.intensityLevel === -1) {
                  return (
                    <div
                      key={dIdx}
                      style={{
                        width: '11px',
                        height: '11px',
                        borderRadius: '2px',
                        background: 'transparent',
                      }}
                    />
                  );
                }

                const isHovered = hoveredDay?.date === day.date;

                return (
                  <div
                    key={dIdx}
                    onMouseEnter={(e) => handleCellMouseEnter(day, e)}
                    onMouseLeave={() => {
                      setHoveredDay(null);
                      setTooltipPos(null);
                    }}
                    style={{
                      width: '11px',
                      height: '11px',
                      borderRadius: '2px',
                      background: getCellColor(day.intensityLevel),
                      border: isHovered ? '1px solid #fff' : day.intensityLevel > 0 ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease, border-color 0.1s ease',
                      transform: isHovered ? 'scale(1.35)' : 'scale(1)',
                      zIndex: isHovered ? 2 : 1,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Live Hover Inspector + Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-walnut-faint)', fontSize: '0.76rem' }}>
        {/* Hover Inspector */}
        <div style={{ minHeight: '18px', color: 'var(--text-kehwa-cream)' }}>
          {hoveredDay ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--saffron-ember)' }}>
                {formatDate(hoveredDay.date)}:
              </span>
              <span>
                {hoveredDay.focusMinutes > 0 ? `${hoveredDay.focusMinutes}m (${(hoveredDay.focusMinutes / 60).toFixed(1)}h)` : '0m'} focus • {hoveredDay.completedCount}/{hoveredDay.totalCount} kept
              </span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-tweed-dim)' }}>
              Hover over squares to inspect daily output
            </span>
          )}
        </div>

        {/* Intensity Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-tweed-dim)' }}>
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(lvl => (
            <div
              key={lvl}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: getCellColor(lvl),
                border: lvl > 0 ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
