import React, { useState } from 'react';
import { Commitment, commitmentApi } from '../../api/commitmentApi';
import { useToast } from '../../context/ToastContext';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  MessageSquare, 
  CalendarClock, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertTriangle 
} from 'lucide-react';

interface CommitmentCardProps {
  commitment: Commitment;
  onRefresh: () => void;
  onOpenDiscussion: (commitment: Commitment) => void;
  onPostponeClick: (commitment: Commitment) => void;
  onReviewClick?: (commitment: Commitment) => void;
}

export const CommitmentCard: React.FC<CommitmentCardProps> = ({
  commitment,
  onRefresh,
  onOpenDiscussion,
  onPostponeClick,
  onReviewClick,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleToggleComplete = async () => {
    try {
      setLoading(true);
      if (commitment.status === 'COMPLETED') {
        await commitmentApi.update(commitment.id, { status: 'PENDING' });
        showToast('Commitment marked pending', 'info');
      } else {
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

  const handleDelete = async () => {
    if (!window.confirm(`Delete commitment "${commitment.title}"?`)) return;
    try {
      setLoading(true);
      await commitmentApi.delete(commitment.id);
      showToast('Commitment deleted', 'info');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete commitment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = commitment.status === 'COMPLETED';
  const isMissed = commitment.status === 'MISSED';
  const isPostponed = commitment.status === 'POSTPONED';

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

  return (
    <div
      className={`harud-card ${isCompleted ? 'harud-card-glow' : ''}`}
      style={{
        padding: '20px',
        opacity: loading ? 0.6 : 1,
        borderColor: isCompleted 
          ? 'var(--pine-emerald)' 
          : isMissed 
          ? 'rgba(184, 58, 58, 0.4)' 
          : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Toggle Complete Checkbox */}
        <button
          onClick={handleToggleComplete}
          disabled={loading || isPostponed}
          style={{
            background: 'none',
            border: 'none',
            color: isCompleted ? '#4ADE80' : 'var(--text-tweed-dim)',
            cursor: isPostponed ? 'not-allowed' : 'pointer',
            padding: '2px',
            marginTop: '2px',
            transition: 'var(--transition-smooth)',
          }}
          title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          {isCompleted ? (
            <CheckCircle size={24} color="#4ADE80" />
          ) : (
            <Circle size={24} />
          )}
        </button>

        {/* Commitment Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <h4 style={{
              fontSize: '1.05rem',
              color: isCompleted ? 'var(--text-parchment-muted)' : 'var(--text-kehwa-cream)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              fontWeight: 600,
            }}>
              {commitment.title}
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={`badge ${getPriorityBadgeClass(commitment.priority)}`}>
                {commitment.priority}
              </span>
              {getStatusBadge()}
            </div>
          </div>

          {commitment.description && (
            <p style={{
              fontSize: '0.86rem',
              color: 'var(--text-parchment-muted)',
              marginTop: '6px',
              lineHeight: 1.45,
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
            }}>
              <span style={{ color: 'var(--saffron-ember)', fontWeight: 600 }}>Expected: </span>
              {commitment.expectedOutcome}
            </div>
          )}

          {/* Meta & Action Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-walnut-faint)',
            fontSize: '0.8rem',
            color: 'var(--text-tweed-dim)',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onOpenDiscussion(commitment)}
                className="btn-outline"
                title="Discuss with accountability partner"
              >
                <MessageSquare size={14} />
                <span>Discussion</span>
              </button>

              {!isCompleted && !isPostponed && (
                <button
                  onClick={() => onPostponeClick(commitment)}
                  className="btn-outline"
                  title="Postpone to a future date"
                >
                  <CalendarClock size={14} />
                  <span>Postpone</span>
                </button>
              )}

              {onReviewClick && (
                <button
                  onClick={() => onReviewClick(commitment)}
                  className="btn-outline"
                  style={{ borderColor: 'var(--chinar-rust)', color: 'var(--chinar-rust)' }}
                >
                  <span>Review</span>
                </button>
              )}

              <button
                onClick={handleDelete}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tweed-dim)',
                  cursor: 'pointer',
                  padding: '5px',
                  borderRadius: '4px',
                }}
                title="Delete commitment"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
