import React, { useState, useRef, useEffect } from 'react';
import { Commitment, commitmentApi } from '../../api/commitmentApi';
import { useToast } from '../../context/ToastContext';
import { triggerLeafCelebration } from '../../utils/leafCelebration';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  MessageSquare, 
  CalendarClock, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  RotateCcw,
  Zap,
  Pencil,
  XCircle,
  GripVertical,
  Sunrise,
  Sun,
  Moon,
  MoreVertical
} from 'lucide-react';
import { useFocusTimer } from '../../context/FocusTimerContext';

interface CommitmentCardProps {
  commitment: Commitment;
  onRefresh: () => void;
  onOpenDiscussion: (commitment: Commitment) => void;
  onPostponeClick: (commitment: Commitment) => void;
  onEditClick?: (commitment: Commitment) => void;
  onReviewClick?: (commitment: Commitment) => void;
  onDragStart?: (e: React.DragEvent, commitment: Commitment) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDraggable?: boolean;
}

const CommitmentCardComponent: React.FC<CommitmentCardProps> = ({
  commitment,
  onRefresh,
  onOpenDiscussion,
  onPostponeClick,
  onEditClick,
  onReviewClick,
  onDragStart,
  onDragEnd,
  isDraggable = true,
}) => {
  const { showToast, showActionToast } = useToast();
  const { startFocusSession } = useFocusTimer();
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOptimisticallyDeleted, setIsOptimisticallyDeleted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleToggleComplete = async (e: React.MouseEvent) => {
    try {
      setLoading(true);
      if (commitment.status === 'COMPLETED' || commitment.status === 'MISSED') {
        await commitmentApi.update(commitment.id, { status: 'PENDING' });
        showToast('Commitment reset to pending', 'info');
      } else {
        // Trigger celebratory leaf particles at click position
        triggerLeafCelebration(e.clientX, e.clientY);
        await commitmentApi.complete(commitment.id);
        showToast('Commitment kept! Well done.', 'success');
      }
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update commitment status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkMissed = async () => {
    try {
      setLoading(true);
      await commitmentApi.update(commitment.id, { status: 'MISSED' });
      showToast(`Marked "${commitment.title}" as missed.`, 'info');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to mark commitment as missed', 'error');
    } finally {
      setLoading(false);
      setIsMenuOpen(false);
    }
  };

  const handleReopen = async () => {
    try {
      setLoading(true);
      await commitmentApi.reopen(commitment.id);
      showToast('Commitment reopened for today!', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to reopen commitment', 'error');
    } finally {
      setLoading(false);
      setIsMenuOpen(false);
    }
  };

  const handleDeleteOptimistic = () => {
    setIsMenuOpen(false);
    setIsOptimisticallyDeleted(true);

    let isCancelled = false;
    const deleteTimer = setTimeout(async () => {
      if (!isCancelled) {
        try {
          await commitmentApi.delete(commitment.id);
          onRefresh();
        } catch (err: any) {
          setIsOptimisticallyDeleted(false);
          showToast(err.message || 'Failed to delete commitment', 'error');
        }
      }
    }, 5000);

    showActionToast(
      `Deleted "${commitment.title}"`,
      {
        label: 'Undo',
        onClick: () => {
          isCancelled = true;
          clearTimeout(deleteTimer);
          setIsOptimisticallyDeleted(false);
          showToast('Deletion undone', 'info');
        },
      },
      'info',
      5000
    );
  };

  if (isOptimisticallyDeleted) {
    return null;
  }

  const isCompleted = commitment.status === 'COMPLETED';
  const isMissed = commitment.status === 'MISSED';
  const isPostponed = commitment.status === 'POSTPONED';
  const isRoutine = commitment.category === 'ROUTINE';

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'badge-priority-urgent';
      case 'HIGH': return 'badge-priority-high';
      case 'LOW': return 'badge-priority-low';
      default: return 'badge-priority-medium';
    }
  };

  const getStatusBadge = () => {
    if (isCompleted) return <span className="badge badge-completed">KEPT</span>;
    if (isMissed) return <span className="badge badge-missed">MISSED</span>;
    if (isPostponed) return <span className="badge badge-postponed">POSTPONED</span>;
    return <span className="badge badge-pending">PENDING</span>;
  };

  const canDrag = isDraggable && !isCompleted && !isPostponed && !loading;

  return (
    <div
      className={`harud-card ${isCompleted ? 'harud-card-glow' : ''}`}
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) return;
        e.dataTransfer.setData('text/plain', commitment.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(e, commitment);
      }}
      onDragEnd={(e) => {
        onDragEnd?.(e);
      }}
      style={{
        padding: 'clamp(14px, 3.5vw, 20px)',
        opacity: loading ? 0.6 : 1,
        cursor: canDrag ? 'grab' : 'default',
        transition: 'all 0.15s ease',
        borderColor: isCompleted 
          ? 'var(--pine-emerald)' 
          : isMissed 
          ? 'rgba(184, 58, 58, 0.4)' 
          : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Drag handle affordance when draggable */}
        {canDrag && (
          <div
            style={{
              color: 'var(--text-tweed-dim)',
              opacity: 0.4,
              marginTop: '4px',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none',
            }}
            title="Drag to move across Day Phases"
          >
            <GripVertical size={16} />
          </div>
        )}

        {/* Toggle Complete / Status Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            color: isCompleted ? '#4ADE80' : isMissed ? '#F87171' : isPostponed ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
            cursor: loading ? 'wait' : 'pointer',
            padding: '2px',
            marginTop: '2px',
            transition: 'var(--transition-smooth)',
          }}
          title={isCompleted ? 'Mark as pending' : isMissed ? 'Missed commitment. Click to reset to pending.' : isPostponed ? 'Complete today (cancel postpone)' : 'Mark as completed'}
        >
          {isCompleted ? (
            <CheckCircle size={24} color="#4ADE80" />
          ) : isMissed ? (
            <XCircle size={24} color="#F87171" />
          ) : (
            <Circle size={24} />
          )}
        </button>

        {/* Commitment Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px 12px',
            flexWrap: 'wrap',
          }}>
            <h4 style={{
              fontSize: '1.02rem',
              color: isCompleted ? 'var(--text-parchment-muted)' : 'var(--text-kehwa-cream)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              wordBreak: 'break-word',
              flex: '1 1 140px',
              margin: 0,
            }}>
              {commitment.title}
            </h4>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
              {commitment.dayPhase === 'MORNING' && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: 'rgba(226, 149, 59, 0.12)',
                  border: '1px solid rgba(226, 149, 59, 0.3)',
                  color: 'var(--saffron-ember)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}>
                  <Sunrise size={11} /> Morning
                </span>
              )}
              {commitment.dayPhase === 'DAY' && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: 'rgba(251, 191, 36, 0.12)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  color: '#FBBF24',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}>
                  <Sun size={11} /> Day
                </span>
              )}
              {commitment.dayPhase === 'EVENING' && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: 'rgba(167, 139, 250, 0.12)',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  color: '#A78BFA',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}>
                  <Moon size={11} /> Evening
                </span>
              )}
              {isRoutine && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: 'rgba(226, 149, 59, 0.12)',
                  border: '1px solid rgba(226, 149, 59, 0.3)',
                  color: 'var(--saffron-ember)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}>
                  ⚡ Routine
                </span>
              )}
              <span className={`badge ${getPriorityBadgeClass(commitment.priority)}`}>
                {commitment.priority}
              </span>
              {getStatusBadge()}
            </div>
          </div>

          {commitment.description && (
            <p style={{
              marginTop: '6px',
              fontSize: '0.88rem',
              color: isCompleted ? 'var(--text-tweed-dim)' : 'var(--text-parchment-muted)',
              lineHeight: 1.5,
              wordBreak: 'break-word',
            }}>
              {commitment.description}
            </p>
          )}

          {commitment.expectedOutcome && (
            <div style={{
              marginTop: '8px',
              padding: '6px 10px',
              background: 'rgba(28, 21, 16, 0.6)',
              borderRadius: '6px',
              borderLeft: '2px solid var(--chinar-rust)',
              fontSize: '0.8rem',
              color: 'var(--text-parchment-muted)',
              wordBreak: 'break-word',
            }}>
              <span style={{ color: 'var(--saffron-ember)', fontWeight: 600 }}>Expected: </span>
              {commitment.expectedOutcome}
            </div>
          )}

          {/* Meta & Action Footer */}
          <div className="commitment-card-footer">
            <div className="commitment-card-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} color="var(--saffron-ember)" />
                <span>{commitment.estimatedMinutes} mins</span>
              </span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {commitment.visibility === 'SHARED_WITH_PARTNER' ? (
                  <>
                    <Eye size={14} color="var(--chinar-rust)" />
                    <span>
                      {commitment.targetPartnerName ? `Shared with ${commitment.targetPartnerName}` : 'Shared with Partners'}
                    </span>
                  </>
                ) : (
                  <>
                    <EyeOff size={14} />
                    <span>Private</span>
                  </>
                )}
              </span>

              {(commitment.postponedFromId || (commitment.postponementCount != null && commitment.postponementCount > 0)) && (
                <span style={{ color: 'var(--saffron-ember)', display: 'flex', alignItems: 'center', gap: '4px' }} title={`Rescheduled ${commitment.postponementCount || 1} time(s)`}>
                  <AlertTriangle size={13} />
                  <span>Rescheduled {commitment.postponementCount && commitment.postponementCount > 1 ? `(${commitment.postponementCount}x)` : ''}</span>
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="commitment-card-actions" style={{ position: 'relative' }}>
              {/* Primary Focus Button (when pending) */}
              {!isCompleted && !isPostponed && !isRoutine && (
                <button
                  onClick={() => startFocusSession(commitment)}
                  className="btn-primary"
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                    boxShadow: '0 2px 8px rgba(192, 83, 48, 0.3)',
                  }}
                  title="Launch Pomodoro focus sprint for this commitment"
                >
                  <Zap size={13} />
                  <span>Focus ({commitment.estimatedMinutes}m)</span>
                </button>
              )}

              {/* Discussion Thread Trigger */}
              <button
                onClick={() => onOpenDiscussion(commitment)}
                className="btn-outline"
                style={{
                  padding: '5px 10px',
                  fontSize: '0.78rem',
                  ...(commitment.hasUnreadDiscussion ? {
                    borderColor: 'var(--saffron-ember)',
                    background: 'rgba(226, 149, 59, 0.16)',
                    color: 'var(--saffron-ember)',
                    fontWeight: 700,
                    boxShadow: '0 0 12px rgba(226, 149, 59, 0.25)',
                  } : (commitment.discussionMessageCount && commitment.discussionMessageCount > 0) ? {
                    borderColor: 'rgba(226, 149, 59, 0.35)',
                    color: 'var(--text-kehwa-cream)',
                  } : {}),
                }}
                title="Discuss with accountability partner"
              >
                <MessageSquare size={14} color={commitment.hasUnreadDiscussion ? 'var(--saffron-ember)' : undefined} />
                <span>
                  {commitment.hasUnreadDiscussion 
                    ? `Discussion (${commitment.discussionMessageCount || 1}) • ⚡ New`
                    : (commitment.discussionMessageCount && commitment.discussionMessageCount > 0)
                      ? `Discussion (${commitment.discussionMessageCount})`
                      : 'Discussion'}
                </span>
              </button>

              {/* Reopen Button if Postponed or Missed */}
              {(isPostponed || isMissed) && (
                <button
                  onClick={handleReopen}
                  disabled={loading}
                  className="btn-outline"
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.78rem',
                    borderColor: 'var(--saffron-ember)',
                    color: 'var(--saffron-ember)',
                    background: 'rgba(226, 149, 59, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  title="Reopen commitment for today"
                >
                  <RotateCcw size={13} />
                  <span>Reopen for Today</span>
                </button>
              )}

              {onReviewClick && (
                <button
                  onClick={() => onReviewClick(commitment)}
                  className="btn-outline"
                  style={{ padding: '5px 10px', fontSize: '0.78rem', borderColor: 'var(--chinar-rust)', color: 'var(--chinar-rust)' }}
                >
                  <span>Review</span>
                </button>
              )}

              {/* Kebab / More Actions Menu for secondary operations */}
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="btn-outline"
                  style={{
                    padding: '5px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="More actions"
                  aria-label="More actions"
                >
                  <MoreVertical size={14} />
                </button>

                {isMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 'calc(100% + 6px)',
                      background: 'var(--bg-walnut-surface)',
                      border: '1px solid var(--border-copper-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-warm-md)',
                      minWidth: '160px',
                      zIndex: 100,
                      padding: '4px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      animation: 'fadeIn 0.12s ease-out',
                    }}
                  >
                    {onEditClick && !isCompleted && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onEditClick(commitment);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-kehwa-cream)',
                          padding: '8px 12px',
                          fontSize: '0.82rem',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <Pencil size={13} />
                        <span>Edit Details</span>
                      </button>
                    )}

                    {!isCompleted && !isPostponed && !isMissed && (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onPostponeClick(commitment);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-kehwa-cream)',
                          padding: '8px 12px',
                          fontSize: '0.82rem',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <CalendarClock size={13} />
                        <span>Postpone to Future</span>
                      </button>
                    )}

                    {!isCompleted && !isPostponed && !isMissed && (
                      <button
                        onClick={handleMarkMissed}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#F87171',
                          padding: '8px 12px',
                          fontSize: '0.82rem',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        <XCircle size={13} />
                        <span>Mark as Missed</span>
                      </button>
                    )}

                    <div style={{ height: '1px', background: 'var(--border-walnut-faint)', margin: '4px 0' }} />

                    <button
                      onClick={handleDeleteOptimistic}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#F87171',
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Delete Commitment</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CommitmentCard = React.memo(CommitmentCardComponent);
