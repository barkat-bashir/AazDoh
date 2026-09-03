import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Commitment } from '../../api/commitmentApi';
import { reviewApi, FailureReason, NextAction } from '../../api/reviewApi';
import { aiApi, AiFeedbackResponse } from '../../api/aiApi';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, CornerDownRight, Check } from 'lucide-react';

interface DailyReviewModalProps {
  commitments: Commitment[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DailyReviewModal: React.FC<DailyReviewModalProps> = ({
  commitments,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<Record<string, {
    status: 'COMPLETED' | 'MISSED' | 'POSTPONED';
    failureReason?: FailureReason;
    reflection?: string;
    nextAction?: NextAction;
    rescheduleDate?: string;
  }>>({});

  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiFeedbackResponse | null>(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);

  if (commitments.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Daily Review">
        <p style={{ color: 'var(--text-parchment-muted)', textAlign: 'center', padding: '20px 0' }}>
          No commitments found for today to review.
        </p>
      </Modal>
    );
  }

  const currentCommitment = commitments[currentIndex];
  const defaultCurrentStatus = currentCommitment?.status === 'COMPLETED' 
    ? 'COMPLETED' 
    : (currentCommitment?.status === 'POSTPONED' ? 'POSTPONED' : 'MISSED');

  const currentReview = reviews[currentCommitment?.id] || {
    status: defaultCurrentStatus,
    failureReason: 'UNDERESTIMATED',
    nextAction: currentCommitment?.status === 'POSTPONED' ? undefined : 'MOVE_TO_TOMORROW',
  };

  const handleStatusChange = (status: 'COMPLETED' | 'MISSED' | 'POSTPONED') => {
    setReviews(prev => ({
      ...prev,
      [currentCommitment.id]: {
        ...currentReview,
        status,
      }
    }));
  };

  const handleReasonChange = (reason: FailureReason) => {
    setReviews(prev => ({
      ...prev,
      [currentCommitment.id]: {
        ...currentReview,
        failureReason: reason,
      }
    }));
  };

  const handleNextActionChange = (action: NextAction) => {
    setReviews(prev => ({
      ...prev,
      [currentCommitment.id]: {
        ...currentReview,
        nextAction: action,
      }
    }));
  };

  const handleReflectionChange = (reflection: string) => {
    setReviews(prev => ({
      ...prev,
      [currentCommitment.id]: {
        ...currentReview,
        reflection,
      }
    }));
  };

  const handleNextOrFinish = async () => {
    if (currentIndex < commitments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Submit all reviews to backend
      try {
        setLoading(true);
        for (const commitment of commitments) {
          const rev = reviews[commitment.id] || {
            status: commitment.status === 'COMPLETED' ? 'COMPLETED' : 'MISSED',
            failureReason: 'UNDERESTIMATED',
            nextAction: 'MOVE_TO_TOMORROW',
          };

          await reviewApi.submitReview(commitment.id, {
            status: rev.status,
            failureReason: rev.status === 'MISSED' ? rev.failureReason : undefined,
            reflection: rev.reflection,
            nextAction: rev.status === 'MISSED' ? rev.nextAction : undefined,
          });
        }

        showToast('Daily accountability review submitted!', 'success');
        
        // Trigger AI Insight synthesis
        try {
          setAnalyzingAi(true);
          const feedback = await aiApi.getInsights();
          setAiAnalysis(feedback);
        } catch {
          onSuccess();
          onClose();
        } finally {
          setAnalyzingAi(false);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to submit review', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  if (aiAnalysis) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onSuccess();
          onClose();
        }}
        title="Daily Review Complete • AI Reflection"
        subtitle="Observations synthesized from your day's review"
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(192, 83, 48, 0.12), rgba(226, 149, 59, 0.08))',
          border: '1px solid var(--border-copper-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          color: 'var(--text-kehwa-cream)',
          lineHeight: 1.6,
          fontSize: '0.94rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--saffron-ember)', fontWeight: 700 }}>
            <Sparkles size={18} />
            <span>AI Agent Analysis ({aiAnalysis.persona} Persona)</span>
          </div>
          <div style={{ whiteSpace: 'pre-line' }}>
            {aiAnalysis.feedback}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="btn-primary"
          >
            <Check size={16} />
            <span>Close & View Dashboard</span>
          </button>
        </div>
      </Modal>
    );
  }

  const isLast = currentIndex === commitments.length - 1;

  const failureReasons: { value: FailureReason; label: string }[] = [
    { value: 'UNDERESTIMATED', label: 'Underestimated Effort' },
    { value: 'DISTRACTED', label: 'Got Distracted' },
    { value: 'BLOCKED', label: 'Blocked / Stuck' },
    { value: 'DID_NOT_PRIORITIZE', label: 'Did Not Prioritize' },
    { value: 'UNEXPECTED_SITUATION', label: 'Unexpected Interruption' },
    { value: 'FORGOT', label: 'Forgot' },
    { value: 'OTHER', label: 'Other Reason' },
  ];

  const nextActions: { value: NextAction; label: string }[] = [
    { value: 'MOVE_TO_TOMORROW', label: 'Move to Tomorrow' },
    { value: 'BREAK_DOWN', label: 'Break into Smaller Chunks' },
    { value: 'RESCHEDULE', label: 'Reschedule for Later' },
    { value: 'DROP', label: 'Drop / Cancel' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Accountability Review"
      subtitle={`Commitment ${currentIndex + 1} of ${commitments.length}`}
      maxWidth="620px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Commitment Title Header */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-walnut-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-walnut-faint)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--saffron-ember)', fontWeight: 700, textTransform: 'uppercase' }}>
            {currentCommitment.priority} PRIORITY • ~{currentCommitment.estimatedMinutes} MINS
          </span>
          <h4 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginTop: '4px' }}>
            {currentCommitment.title}
          </h4>
          {currentCommitment.expectedOutcome && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-parchment-muted)', marginTop: '4px' }}>
              Expected: {currentCommitment.expectedOutcome}
            </p>
          )}
          {currentCommitment.status === 'POSTPONED' && (
            <div style={{
              marginTop: '8px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(226, 149, 59, 0.12)',
              border: '1px solid rgba(226, 149, 59, 0.3)',
              fontSize: '0.78rem',
              color: 'var(--saffron-ember)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>📅 Rescheduled earlier today: {currentCommitment.postponeReason ? `"${currentCommitment.postponeReason}"` : 'Moved to future date'}</span>
            </div>
          )}
        </div>

        {/* Question: Did you do it? */}
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
            Did you keep this commitment today?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="button"
              onClick={() => handleStatusChange('COMPLETED')}
              style={{
                background: currentReview.status === 'COMPLETED' ? 'rgba(46, 125, 82, 0.2)' : 'var(--bg-walnut-surface)',
                border: `2px solid ${currentReview.status === 'COMPLETED' ? 'var(--pine-emerald)' : 'var(--border-walnut-faint)'}`,
                color: currentReview.status === 'COMPLETED' ? '#4ADE80' : 'var(--text-parchment-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Yes, Kept!</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('MISSED')}
              style={{
                background: currentReview.status === 'MISSED' ? 'rgba(184, 58, 58, 0.2)' : 'var(--bg-walnut-surface)',
                border: `2px solid ${currentReview.status === 'MISSED' ? 'var(--crimson-rose)' : 'var(--border-walnut-faint)'}`,
                color: currentReview.status === 'MISSED' ? '#F87171' : 'var(--text-parchment-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              <XCircle size={18} />
              <span>Missed</span>
            </button>
          </div>
        </div>

        {/* If Missed: Failure Reasons, Reflections & Next Actions */}
        {currentReview.status === 'MISSED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s ease-out' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
                Why was this commitment missed?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
                {failureReasons.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => handleReasonChange(r.value)}
                    style={{
                      background: currentReview.failureReason === r.value ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                      border: `1px solid ${currentReview.failureReason === r.value ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
                      color: currentReview.failureReason === r.value ? 'var(--text-kehwa-cream)' : 'var(--text-parchment-muted)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
                Reflection: What actually happened and what will change?
              </label>
              <textarea
                className="input-field"
                placeholder="Be honest with yourself: What blocked execution? How will you tackle this differently?"
                value={currentReview.reflection || ''}
                onChange={(e) => handleReflectionChange(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
                What happens to this commitment next?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {nextActions.map((act) => (
                  <button
                    key={act.value}
                    type="button"
                    onClick={() => handleNextActionChange(act.value)}
                    style={{
                      background: currentReview.nextAction === act.value ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                      border: `1px solid ${currentReview.nextAction === act.value ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                      color: currentReview.nextAction === act.value ? 'var(--text-kehwa-cream)' : 'var(--text-parchment-muted)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    <CornerDownRight size={14} color="var(--saffron-ember)" />
                    <span>{act.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Next Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-walnut-faint)',
        }}>
          {currentIndex > 0 ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCurrentIndex(currentIndex - 1)}
            >
              Previous
            </button>
          ) : <div />}

          <button
            type="button"
            className="btn-primary"
            onClick={handleNextOrFinish}
            disabled={loading || analyzingAi}
          >
            <span>{isLast ? (analyzingAi ? 'Synthesizing with AI...' : 'Complete Daily Review') : 'Next Commitment'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Modal>
  );
};
