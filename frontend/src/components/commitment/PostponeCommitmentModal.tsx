import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Commitment, commitmentApi } from '../../api/commitmentApi';
import { useToast } from '../../context/ToastContext';
import { CalendarClock } from 'lucide-react';

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
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
            Reason for Postponing (Optional)
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Scope was larger than expected, shifted priorities"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

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
            <span>{loading ? 'Rescheduling...' : 'Confirm Reschedule'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
