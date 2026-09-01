import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { commitmentApi, CommitmentPriority, CommitmentVisibility } from '../../api/commitmentApi';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Clock, Shield } from 'lucide-react';

interface AddCommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: string;
  onTriggerAiPlanReview?: () => void;
}

export const AddCommitmentModal: React.FC<AddCommitmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedDate,
  onTriggerAiPlanReview,
}) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<CommitmentPriority>('MEDIUM');
  const [visibility, setVisibility] = useState<CommitmentVisibility>('SHARED_WITH_PARTNER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Commitment title is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const targetDate = selectedDate || new Date().toISOString().split('T')[0];
      await commitmentApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        expectedOutcome: expectedOutcome.trim() || undefined,
        estimatedMinutes: Number(estimatedMinutes),
        priority,
        commitmentDate: targetDate,
        visibility,
      });

      showToast('Commitment created successfully', 'success');
      setTitle('');
      setDescription('');
      setExpectedOutcome('');
      setEstimatedMinutes(60);
      onSuccess();
      onClose();

      if (onTriggerAiPlanReview) {
        onTriggerAiPlanReview();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create commitment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Daily Commitment"
      subtitle="What promise are you making to yourself for today?"
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '5px' }}>
            Commitment Title *
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Implement Payment Idempotency Endpoint"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '5px' }}>
            Expected Deliverable / Outcome
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. All idempotency key tests passing in postman"
            value={expectedOutcome}
            onChange={(e) => setExpectedOutcome(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '5px' }}>
              <Clock size={13} color="var(--saffron-ember)" />
              <span>Estimated Focus</span>
            </label>
            <select
              className="input-field"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            >
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>1 Hour (60m)</option>
              <option value={90}>1.5 Hours (90m)</option>
              <option value={120}>2 Hours (120m)</option>
              <option value={180}>3 Hours (180m)</option>
              <option value={240}>4 Hours (240m)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '5px' }}>
              Priority Level
            </label>
            <select
              className="input-field"
              value={priority}
              onChange={(e) => setPriority(e.target.value as CommitmentPriority)}
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent Priority</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '5px' }}>
            Notes & Context (Optional)
          </label>
          <textarea
            className="input-field"
            rows={2}
            placeholder="Context, blockers, or specific scope boundary..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ resize: 'vertical', minHeight: '52px' }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '5px' }}>
            <Shield size={13} color="var(--chinar-rust)" />
            <span>Accountability Visibility</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '2px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              background: visibility === 'SHARED_WITH_PARTNER' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
              border: `1px solid ${visibility === 'SHARED_WITH_PARTNER' ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              color: 'var(--text-kehwa-cream)',
            }}>
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'SHARED_WITH_PARTNER'}
                onChange={() => setVisibility('SHARED_WITH_PARTNER')}
              />
              <span>Share with Partner</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              background: visibility === 'PRIVATE' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
              border: `1px solid ${visibility === 'PRIVATE' ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              color: 'var(--text-kehwa-cream)',
            }}>
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'PRIVATE'}
                onChange={() => setVisibility('PRIVATE')}
              />
              <span>Private Only</span>
            </label>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          marginTop: '6px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-walnut-faint)',
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
            style={{ padding: '8px 14px', fontSize: '0.84rem' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ padding: '8px 18px', fontSize: '0.84rem' }}
          >
            <Sparkles size={15} />
            <span>{loading ? 'Committing...' : 'Commit to Today'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
