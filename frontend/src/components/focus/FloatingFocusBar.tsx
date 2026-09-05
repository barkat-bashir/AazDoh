import React from 'react';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { Play, Pause, Maximize2, X, Zap, Coffee } from 'lucide-react';

export const FloatingFocusBar: React.FC = () => {
  const {
    activeCommitment,
    isOpen,
    isMinimized,
    timeLeftSeconds,
    isRunning,
    mode,
    isCompleted,
    pause,
    resume,
    maximize,
    closeSession,
  } = useFocusTimer();

  if (!isOpen || !isMinimized) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isBreak = mode === 'SHORT_BREAK' || mode === 'LONG_BREAK';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99990,
        background: 'linear-gradient(135deg, var(--bg-walnut-card) 0%, var(--bg-walnut-deep) 100%)',
        border: `1.5px solid ${isCompleted ? '#4ADE80' : isBreak ? 'var(--pine-emerald)' : 'var(--saffron-ember)'}`,
        borderRadius: 'var(--radius-full)',
        boxShadow: isRunning 
          ? '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(226, 149, 59, 0.3)' 
          : '0 10px 30px rgba(0,0,0,0.8)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'fadeIn 0.2s ease-in-out',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: isBreak ? 'rgba(74, 222, 128, 0.2)' : 'rgba(226, 149, 59, 0.2)',
        color: isBreak ? '#4ADE80' : 'var(--saffron-ember)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {isBreak ? <Coffee size={13} /> : <Zap size={13} />}
      </div>

      {/* Task & Time */}
      <div 
        onClick={maximize} 
        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', minWidth: '120px', maxWidth: '220px' }}
      >
        <div style={{
          fontSize: '0.80rem',
          fontWeight: 700,
          color: 'var(--text-kehwa-cream)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {activeCommitment ? activeCommitment.title : isBreak ? 'Rest Break' : 'Focus Sprint'}
        </div>
        <div style={{
          fontSize: '0.94rem',
          fontWeight: 800,
          color: isCompleted ? '#4ADE80' : 'var(--saffron-ember)',
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {isCompleted ? '✓ Complete!' : timeFormatted}
        </div>
      </div>

      {/* Play/Pause Control */}
      <button
        onClick={isRunning ? pause : resume}
        className="btn-pill"
        style={{ padding: '6px', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={isRunning ? 'Pause' : 'Resume'}
      >
        {isRunning ? <Pause size={13} /> : <Play size={13} />}
      </button>

      {/* Maximize Button */}
      <button
        onClick={maximize}
        style={{ background: 'none', border: 'none', color: 'var(--text-parchment-muted)', cursor: 'pointer', padding: '4px' }}
        title="Maximize timer"
      >
        <Maximize2 size={14} />
      </button>

      {/* Close Button */}
      <button
        onClick={closeSession}
        style={{ background: 'none', border: 'none', color: 'var(--text-tweed-dim)', cursor: 'pointer', padding: '4px' }}
        title="Stop & Close"
      >
        <X size={14} />
      </button>
    </div>
  );
};
