import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Commitment, commitmentApi } from '../../api/commitmentApi';
import { useToast } from '../../context/ToastContext';
import { 
  CalendarClock, 
  Zap, 
  Clock, 
  AlertTriangle, 
  Users, 
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react';

interface PostponeCommitmentModalProps {
  commitment: Commitment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REASON_PRESETS = [
  { id: 'time', label: '⏱️ Ran out of time', text: 'Ran out of planned time today' },
  { id: 'blocked', label: '🚧 Blocked by dependency', text: 'Waiting on external blocker / person / API' },
  { id: 'energy', label: '🔋 Low energy / Drained', text: 'Energy depleted; needs deep morning focus' },
  { id: 'urgent', label: '🔥 Urgent fire came up', text: 'Higher-priority emergency displaced this' },
  { id: 'custom', label: '✏️ Custom note...', text: '' },
];

export const PostponeCommitmentModal: React.FC<PostponeCommitmentModalProps> = ({
  commitment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getInTwoDaysStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const getNextWeekendStr = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 6 ? 1 : 6 - day; // Saturday
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  const tomorrowStr = getTomorrowStr();
  const inTwoDaysStr = getInTwoDaysStr();
  const weekendStr = getNextWeekendStr();

  const [newDate, setNewDate] = useState(tomorrowStr);
  const [selectedReasonId, setSelectedReasonId] = useState<string>('time');
  const [customReason, setCustomReason] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMicroStarting, setIsMicroStarting] = useState(false);

  // State Hygiene: Reset all states cleanly whenever modal opens or commitment changes
  useEffect(() => {
    if (isOpen && commitment) {
      setNewDate(getTomorrowStr());
      setSelectedReasonId('time');
      setCustomReason('');
      setShowCustomDate(false);
      setLoading(false);
      setIsMicroStarting(false);
    }
  }, [isOpen, commitment?.id]);

  if (!commitment) return null;

  const handlePostpone = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPreset = REASON_PRESETS.find(p => p.id === selectedReasonId);
    const finalReason = selectedReasonId === 'custom' 
      ? customReason.trim() 
      : (selectedPreset?.text || selectedPreset?.label || 'Rescheduled');

    if (selectedReasonId === 'custom' && !finalReason) {
      showToast('Please enter a brief custom reason', 'error');
      return;
    }

    try {
      setLoading(true);
      await commitmentApi.postpone(commitment.id, {
        newDate,
        reason: finalReason,
      });

      showToast(`Rescheduled "${commitment.title}" to ${newDate}`, 'info');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to postpone commitment', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Hero Action: 15-Minute Micro-Start Sprint
  const handle15MinMicroStart = async () => {
    try {
      setIsMicroStarting(true);
      const cleanTitle = commitment.title.replace(/^⚡\s*15m\s*Sprint:\s*/i, '');
      await commitmentApi.update(commitment.id, {
        title: `⚡ 15m Sprint: ${cleanTitle}`,
        estimatedMinutes: 15,
      });
      showToast(`Switched to 15-Minute Micro-Start! Momentum protected.`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Could not convert to micro-start', 'error');
    } finally {
      setIsMicroStarting(false);
    }
  };

  const isShared = commitment.visibility === 'SHARED_WITH_PARTNER';
  const isChronicallyPostponed = commitment.postponementCount && commitment.postponementCount >= 2;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Postpone Commitment"
      subtitle={`Manage schedule for "${commitment.title}" (~${commitment.estimatedMinutes} mins)`}
      maxWidth="560px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* ⚡ TOP HERO ACTION: Momentum Rescue */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(226, 149, 59, 0.14), rgba(192, 83, 48, 0.08))',
          border: '1.5px solid rgba(226, 149, 59, 0.38)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 4px 18px rgba(226, 149, 59, 0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'var(--saffron-ember)',
                color: '#1a0e08',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                flexShrink: 0,
              }}>
                <Zap size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--saffron-ember)', margin: 0 }}>
                  Momentum Rescue • 15m Sprint
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-parchment-muted)', margin: '2px 0 0 0' }}>
                  Can't do {commitment.estimatedMinutes} mins? Shrink it to 15 mins today to keep your streak unbroken.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handle15MinMicroStart}
            disabled={isMicroStarting}
            className="btn-primary"
            style={{
              padding: '10px 16px',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--saffron-ember), var(--chinar-rust))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              boxShadow: '0 4px 14px rgba(226, 149, 59, 0.3)',
            }}
          >
            <Zap size={15} />
            <span>{isMicroStarting ? 'Activating Sprint...' : '⚡ Start 15-Minute Sprint Today'}</span>
          </button>
        </div>

        {/* Chronic Postpone Insight Tip */}
        {isChronicallyPostponed && (
          <div style={{
            background: 'rgba(192, 83, 48, 0.12)',
            border: '1px solid rgba(192, 83, 48, 0.35)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: 'var(--saffron-ember)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>
              This task has been rescheduled <strong>{commitment.postponementCount}x</strong>. Consider shrinking the scope or breaking it into 2 smaller milestones.
            </span>
          </div>
        )}

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-tweed-dim)',
          fontSize: '0.74rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-walnut-faint)' }} />
          <span>Or Reschedule to a Future Date</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-walnut-faint)' }} />
        </div>

        <form onSubmit={handlePostpone} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 1. Target Date Pills */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              Reschedule Target Date
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={() => { setNewDate(tomorrowStr); setShowCustomDate(false); }}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: (!showCustomDate && newDate === tomorrowStr) ? 'var(--saffron-ember)' : 'var(--bg-walnut-surface)',
                  color: (!showCustomDate && newDate === tomorrowStr) ? '#1a0e08' : 'var(--text-parchment-muted)',
                  border: `1px solid ${(!showCustomDate && newDate === tomorrowStr) ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                Tomorrow ({tomorrowStr.slice(5)})
              </button>

              <button
                type="button"
                onClick={() => { setNewDate(inTwoDaysStr); setShowCustomDate(false); }}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: (!showCustomDate && newDate === inTwoDaysStr) ? 'var(--saffron-ember)' : 'var(--bg-walnut-surface)',
                  color: (!showCustomDate && newDate === inTwoDaysStr) ? '#1a0e08' : 'var(--text-parchment-muted)',
                  border: `1px solid ${(!showCustomDate && newDate === inTwoDaysStr) ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                In 2 Days ({inTwoDaysStr.slice(5)})
              </button>

              <button
                type="button"
                onClick={() => { setNewDate(weekendStr); setShowCustomDate(false); }}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: (!showCustomDate && newDate === weekendStr) ? 'var(--saffron-ember)' : 'var(--bg-walnut-surface)',
                  color: (!showCustomDate && newDate === weekendStr) ? '#1a0e08' : 'var(--text-parchment-muted)',
                  border: `1px solid ${(!showCustomDate && newDate === weekendStr) ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                This Weekend ({weekendStr.slice(5)})
              </button>

              <button
                type="button"
                onClick={() => setShowCustomDate(true)}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: showCustomDate ? 'var(--saffron-ember)' : 'var(--bg-walnut-surface)',
                  color: showCustomDate ? '#1a0e08' : 'var(--text-parchment-muted)',
                  border: `1px solid ${showCustomDate ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                📅 Custom Date...
              </button>
            </div>

            {showCustomDate && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="date"
                  className="input-field"
                  value={newDate}
                  min={tomorrowStr}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {/* 2. Structured Reason Chips */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
                Reason for Rescheduling
              </label>
              {isShared && (
                <span style={{ fontSize: '0.74rem', color: 'var(--saffron-ember)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={12} />
                  <span>Shared with partner</span>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {REASON_PRESETS.map((preset) => {
                const isSelected = selectedReasonId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedReasonId(preset.id)}
                    style={{
                      padding: '9px 12px',
                      fontSize: '0.84rem',
                      fontWeight: isSelected ? 600 : 500,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(226, 149, 59, 0.12)' : 'var(--bg-walnut-surface)',
                      color: isSelected ? 'var(--saffron-ember)' : 'var(--text-parchment-muted)',
                      border: `1px solid ${isSelected ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <Check size={14} color="var(--saffron-ember)" />}
                  </button>
                );
              })}
            </div>

            {selectedReasonId === 'custom' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Need to review documentation before coding"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-walnut-faint)',
          }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading || isMicroStarting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || isMicroStarting}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CalendarClock size={15} />
              <span>{loading ? 'Rescheduling...' : 'Confirm Postpone'}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
