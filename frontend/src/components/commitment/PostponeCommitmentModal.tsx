import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Commitment, commitmentApi } from '../../api/commitmentApi';
import { useToast } from '../../context/ToastContext';
import { 
  CalendarClock, 
  Sparkles, 
  AlertTriangle, 
  Zap, 
  Clock, 
  History,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { aiApi, ExcuseAnalysisResponse } from '../../api/aiApi';

interface PostponeCommitmentModalProps {
  commitment: Commitment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PostponeCommitmentModal: React.FC<PostponeCommitmentModalProps> = ({
  commitment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [newDate, setNewDate] = useState(tomorrowStr);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Excuse & Rationalization Mirror State
  const [mirrorAnalysis, setMirrorAnalysis] = useState<ExcuseAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMicroStarting, setIsMicroStarting] = useState(false);

  // Debounced auto-analysis when reason is typed
  useEffect(() => {
    if (!reason || reason.trim().length < 8 || !commitment) {
      setMirrorAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsAnalyzing(true);
        const res = await aiApi.detectExcuse({
          commitmentId: commitment.id,
          excuseText: reason.trim(),
          type: 'POSTPONE',
        });
        setMirrorAnalysis(res);
      } catch (err) {
        console.warn('Excuse mirror analysis skipped', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [reason, commitment]);

  if (!commitment) return null;

  const handlePostpone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await commitmentApi.postpone(commitment.id, {
        newDate,
        reason: reason.trim() || undefined,
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

  const handle15MinMicroStart = async () => {
    try {
      setIsMicroStarting(true);
      await commitmentApi.update(commitment.id, {
        title: `⚡ 15m Sprint: ${commitment.title}`,
        estimatedMinutes: 15,
      });
      showToast(`Switched to 15-Minute Micro-Start! Momentum unlocked.`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Could not convert to micro-start', 'error');
    } finally {
      setIsMicroStarting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Postpone Commitment"
      subtitle={`Reschedule "${commitment.title}" to a future date`}
    >
      <form onSubmit={handlePostpone} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
            New Commitment Date *
          </label>
          <input
            type="date"
            className="input-field"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            required
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
              Reason for Postponing *
            </label>
            {isAnalyzing && (
              <span style={{ fontSize: '11px', color: 'var(--saffron-ember)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                <span>Checking AI Mirror...</span>
              </span>
            )}
          </div>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Will do it tomorrow morning when head is fresh"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        {/* 🪞 AI Anti-Self-Deception Mirror Card */}
        {mirrorAnalysis && mirrorAnalysis.patternDetected && (
          <div 
            style={{ 
              background: 'rgba(192, 83, 48, 0.08)',
              border: '1px solid rgba(192, 83, 48, 0.35)',
              borderRadius: '12px',
              padding: '14px 16px',
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '6px', 
                  background: 'var(--chinar-rust)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff' 
                }}
              >
                <AlertTriangle size={14} />
              </div>
              <strong style={{ fontSize: '13px', color: 'var(--chinar-rust)' }}>
                Anti-Self-Deception AI Mirror
              </strong>
              <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '6px', background: 'rgba(226, 149, 59, 0.2)', color: 'var(--saffron-ember)', fontWeight: '700', marginLeft: 'auto' }}>
                {mirrorAnalysis.similarityScore}% PATTERN MATCH
              </span>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--warm-cream)', lineHeight: '1.5', margin: '0 0 10px 0' }}>
              "{mirrorAnalysis.mirrorCallout}"
            </p>

            {/* Historical Receipts */}
            {mirrorAnalysis.receipts && mirrorAnalysis.receipts.length > 0 && (
              <div style={{ marginBottom: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <History size={12} />
                  <span>Historical Receipts Found:</span>
                </div>
                {mirrorAnalysis.receipts.slice(0, 2).map((r, idx) => (
                  <div key={idx} style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span>📅 {r.date}: "{r.pastExcuse}"</span>
                    <span style={{ color: 'var(--chinar-rust)', fontWeight: '600' }}>{r.eventualOutcome}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 1-Click Micro-Start Intervention */}
            <div style={{ background: 'rgba(226, 149, 59, 0.1)', border: '1px dashed var(--saffron-ember)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--saffron-ember)' }}>
                  Break The Inertia Trap
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Do a 15-min sprint today instead of dropping it tomorrow.
                </div>
              </div>

              <button
                type="button"
                onClick={handle15MinMicroStart}
                disabled={isMicroStarting}
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Zap size={13} />
                <span>{isMicroStarting ? 'Starting...' : '⚡ 15m Micro-Start'}</span>
              </button>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          marginTop: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-walnut-faint)',
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            <CalendarClock size={16} />
            <span>{loading ? 'Rescheduling...' : 'Confirm Postpone'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
