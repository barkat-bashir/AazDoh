import React, { useState } from 'react';
import { useFocusTimer } from '../../context/FocusTimerContext';
import { commitmentApi } from '../../api/commitmentApi';
import { useToast } from '../../context/ToastContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  X, 
  Zap, 
  Coffee, 
  CheckCircle2, 
  StickyNote, 
  Trash2, 
  Flame, 
  Sparkles,
  Clock,
  Send
} from 'lucide-react';

interface FocusSprintModalProps {
  onCommitmentCompleted?: () => void;
}

export const FocusSprintModal: React.FC<FocusSprintModalProps> = ({ onCommitmentCompleted }) => {
  const {
    activeCommitment,
    isOpen,
    isMinimized,
    timeLeftSeconds,
    totalDurationSeconds,
    isRunning,
    mode,
    distractionNotes,
    sprintsCompletedToday,
    isCompleted,
    pause,
    resume,
    reset,
    addMinutes,
    setCadence,
    addDistractionNote,
    removeDistractionNote,
    minimize,
    closeSession,
  } = useFocusTimer();

  const { showToast } = useToast();
  const [scratchText, setScratchText] = useState('');
  const [isMarkingDone, setIsMarkingDone] = useState(false);

  if (!isOpen || isMinimized) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = totalDurationSeconds > 0 
    ? Math.max(0, Math.min(100, ((totalDurationSeconds - timeLeftSeconds) / totalDurationSeconds) * 100))
    : 0;

  const handleAddScratch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scratchText.trim()) return;
    addDistractionNote(scratchText.trim());
    setScratchText('');
  };

  const handleMarkTaskKept = async () => {
    if (!activeCommitment) return;
    try {
      setIsMarkingDone(true);
      await commitmentApi.complete(activeCommitment.id);
      setIsMarkingDone(false);
      showToast(`Commitment "${activeCommitment.title}" completed and kept!`, 'success');
      if (onCommitmentCompleted) onCommitmentCompleted();
      closeSession();
    } catch (err: any) {
      setIsMarkingDone(false);
      showToast(err.message || 'Failed to complete commitment', 'error');
    }
  };

  const isBreak = mode === 'SHORT_BREAK' || mode === 'LONG_BREAK';

  return (
    <div className="modal-backdrop" style={{ zIndex: 99999, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(8, 6, 5, 0.82)' }}>
      <div 
        className="modal-content"
        style={{
          maxWidth: '560px',
          width: '94%',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, var(--bg-walnut-card) 0%, var(--bg-walnut-deep) 100%)',
          border: `1px solid ${isBreak ? 'rgba(74, 222, 128, 0.3)' : 'rgba(226, 149, 59, 0.35)'}`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 35px rgba(192, 83, 48, 0.2)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-walnut-faint)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isBreak ? 'linear-gradient(135deg, var(--pine-emerald), #1A4D31)' : 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0
            }}>
              {isBreak ? <Coffee size={16} /> : <Zap size={16} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-kehwa-cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeCommitment ? activeCommitment.title : isBreak ? 'Rest & Recharge' : 'Quick Focus Sprint'}
                </h3>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--text-parchment-muted)' }}>
                {isBreak ? 'Step away from the screen • Hydrate' : (activeCommitment ? `Tethered to commitment (${activeCommitment.estimatedMinutes}m target)` : 'Deep single-task focus session')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={minimize}
              className="btn-outline"
              style={{ width: '30px', height: '30px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Minimize to floating bar"
            >
              <Minus size={15} />
            </button>
            <button
              onClick={closeSession}
              className="btn-outline"
              style={{ width: '30px', height: '30px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Close focus session"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Circular Progress & Ambient Digital Countdown */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
          <div style={{
            position: 'relative',
            width: '210px',
            height: '210px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(28, 21, 16, 0.8) 0%, rgba(16, 12, 10, 0.95) 100%)',
            border: `2px solid ${isBreak ? 'rgba(74, 222, 128, 0.2)' : 'rgba(226, 149, 59, 0.2)'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isRunning 
              ? (isBreak ? '0 0 35px rgba(74, 222, 128, 0.25)' : '0 0 35px rgba(226, 149, 59, 0.25)')
              : 'none',
            transition: 'box-shadow 0.4s ease',
          }}>
            {/* Ambient Progress Ring (SVG) */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle
                cx="105"
                cy="105"
                r="96"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="105"
                cy="105"
                r="96"
                stroke={isBreak ? '#4ADE80' : 'var(--saffron-ember)'}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 96}
                strokeDashoffset={2 * Math.PI * 96 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>

            {/* Time Readout */}
            <div style={{
              fontSize: '3rem',
              fontWeight: 800,
              letterSpacing: '1px',
              color: isCompleted ? '#4ADE80' : 'var(--text-kehwa-cream)',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {timeFormatted}
            </div>

            {/* Mode & Sprint Tag */}
            <span style={{
              marginTop: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: isBreak ? '#4ADE80' : 'var(--saffron-ember)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isCompleted ? '✓ SPRINT COMPLETE' : isRunning ? (isBreak ? '☕ RECHARGING' : '⚡ DEEP FOCUS') : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Completion Action Banner */}
        {isCompleted && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(46, 125, 82, 0.2), rgba(20, 83, 45, 0.4))',
            border: '1px solid rgba(74, 222, 128, 0.4)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ADE80', fontWeight: 700, fontSize: '0.88rem' }}>
              <Sparkles size={16} />
              <span>Great job! Sprint completed.</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {activeCommitment && (
                <button
                  onClick={handleMarkTaskKept}
                  disabled={isMarkingDone}
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    background: 'linear-gradient(135deg, #15803D, #166534)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>{isMarkingDone ? 'Marking Done...' : 'Mark Commitment Kept'}</span>
                </button>
              )}

              <button
                onClick={() => setCadence(5, 'SHORT_BREAK')}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Coffee size={14} />
                <span>Take 5m Break</span>
              </button>

              <button
                onClick={() => setCadence(25, 'FOCUS')}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Zap size={14} />
                <span>Next 25m Sprint</span>
              </button>
            </div>
          </div>
        )}

        {/* Cadence Preset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: '25m Sprint', mins: 25, mode: 'FOCUS' as const },
            { label: '45m Deep', mins: 45, mode: 'FOCUS' as const },
            { label: '60m Block', mins: 60, mode: 'FOCUS' as const },
            { label: '5m Break', mins: 5, mode: 'SHORT_BREAK' as const },
          ].map((preset) => {
            const isSelected = mode === preset.mode && Math.round(totalDurationSeconds / 60) === preset.mins;
            return (
              <button
                key={preset.label}
                onClick={() => setCadence(preset.mins, preset.mode)}
                className={`btn-pill ${isSelected ? 'active' : ''}`}
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              >
                {preset.mode === 'SHORT_BREAK' ? <Coffee size={12} /> : <Zap size={12} />}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Controls: Play / Pause / Reset / +5m */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <button
            onClick={reset}
            className="btn-secondary"
            style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Reset timer"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={isRunning ? pause : resume}
            className="btn-primary"
            style={{
              padding: '10px 28px',
              fontSize: '0.94rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isBreak ? 'linear-gradient(135deg, var(--pine-emerald), #1A4D31)' : 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
              boxShadow: isBreak ? '0 4px 16px rgba(46, 125, 82, 0.4)' : '0 4px 16px rgba(192, 83, 48, 0.4)',
            }}
          >
            {isRunning ? <Pause size={17} /> : <Play size={17} />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={() => addMinutes(5)}
            className="btn-secondary"
            style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Extend by +5 minutes"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* "Park Distraction" Scratchpad */}
        <div style={{
          background: 'rgba(20, 15, 12, 0.5)',
          border: '1px solid var(--border-walnut-faint)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-parchment-muted)', fontWeight: 600 }}>
            <StickyNote size={13} color="var(--saffron-ember)" />
            <span>Park Distraction (Capture stray thoughts without breaking flow):</span>
          </div>

          <form onSubmit={handleAddScratch} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 'check email after sprint', 'reply to Slack'..."
              value={scratchText}
              onChange={(e) => setScratchText(e.target.value)}
              style={{ flex: 1, fontSize: '0.78rem', padding: '6px 10px' }}
            />
            <button type="submit" className="btn-secondary" style={{ padding: '0 10px', fontSize: '0.76rem' }}>
              <Send size={12} />
            </button>
          </form>

          {distractionNotes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto', marginTop: '4px' }}>
              {distractionNotes.map((note, nIdx) => (
                <div
                  key={nIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.76rem',
                    color: 'var(--text-kehwa-cream)',
                    background: 'rgba(28, 21, 16, 0.6)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>• {note}</span>
                  <button
                    onClick={() => removeDistractionNote(nIdx)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-tweed-dim)', cursor: 'pointer', padding: '2px' }}
                    title="Remove note"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
