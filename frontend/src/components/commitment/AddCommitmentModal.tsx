import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { commitmentApi, CommitmentPriority, CommitmentVisibility } from '../../api/commitmentApi';
import { partnershipApi } from '../../api/partnershipApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Clock, Shield, Flame, Users, Lock, Check, User as UserIcon } from 'lucide-react';

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
  const { user } = useAuth();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<CommitmentPriority>('MEDIUM');
  const [visibility, setVisibility] = useState<CommitmentVisibility>('SHARED_WITH_PARTNER');
  const [targetPartnerId, setTargetPartnerId] = useState<string | null>(null);
  const [activePartners, setActivePartners] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      partnershipApi.getActive().then(partnerships => {
        const list = partnerships.map(p => {
          const partnerUserId = p.requesterId === user.id ? p.partnerId : p.requesterId;
          const partnerName = p.requesterId === user.id ? p.partnerName : p.requesterName;
          return { id: partnerUserId, name: partnerName };
        });
        setActivePartners(list);
      }).catch(() => {});
    }
  }, [isOpen, user?.id]);

  const focusOptions = [
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '1 Hour', value: 60 },
    { label: '1.5 Hours', value: 90 },
    { label: '2 Hours', value: 120 },
    { label: '3h+', value: 180 },
  ];

  const priorityOptions: { label: string; value: CommitmentPriority; icon?: any; color: string }[] = [
    { label: 'Low', value: 'LOW', color: 'var(--text-parchment-muted)' },
    { label: 'Medium', value: 'MEDIUM', color: 'var(--saffron-ember)' },
    { label: 'High', value: 'HIGH', icon: Flame, color: 'var(--chinar-rust)' },
    { label: 'Urgent', value: 'URGENT', color: '#F87171' },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      showToast('Commitment title is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const targetDate = selectedDate || new Date().toISOString().split('T')[0];
      await commitmentApi.create({
        title: title.trim(),
        expectedOutcome: expectedOutcome.trim() || undefined,
        estimatedMinutes: Number(estimatedMinutes),
        priority,
        commitmentDate: targetDate,
        visibility,
        targetPartnerId: visibility === 'SHARED_WITH_PARTNER' ? (targetPartnerId || undefined) : undefined,
      });

      showToast('Commitment created successfully', 'success');
      setTitle('');
      setExpectedOutcome('');
      setEstimatedMinutes(60);
      setPriority('MEDIUM');
      setTargetPartnerId(null);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
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
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Title */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-kehwa-cream)', marginBottom: '5px' }}>
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

        {/* Definition of Done */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '5px' }}>
            Definition of Done / Deliverable <span style={{ color: 'var(--text-tweed-dim)', fontWeight: 400 }}>(Optional)</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. All idempotency integration tests passing in Postman"
            value={expectedOutcome}
            onChange={(e) => setExpectedOutcome(e.target.value)}
          />
        </div>

        {/* Estimated Focus Time Pills */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
            <Clock size={13} color="var(--saffron-ember)" />
            <span>Estimated Focus Time</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(76px, 1fr))', gap: '6px' }}>
            {focusOptions.map((opt) => {
              const isSelected = estimatedMinutes === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEstimatedMinutes(opt.value)}
                  style={{
                    padding: '7px 4px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? 'var(--chinar-rust)' : 'var(--bg-walnut-card)',
                    color: isSelected ? '#fff' : 'var(--text-parchment-muted)',
                    border: `1px solid ${isSelected ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    boxShadow: isSelected ? '0 2px 8px rgba(192, 83, 48, 0.35)' : 'none',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Level Pills */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
            <Flame size={13} color="var(--chinar-rust)" />
            <span>Priority Level</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {priorityOptions.map((opt) => {
              const isSelected = priority === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  style={{
                    padding: '7px 4px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-card)',
                    color: isSelected ? opt.color : 'var(--text-tweed-dim)',
                    border: `1.5px solid ${isSelected ? opt.color : 'var(--border-walnut-faint)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  {Icon && <Icon size={12} color={opt.color} />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accountability Visibility Cards */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
            <Shield size={13} color="var(--saffron-ember)" />
            <span>Accountability Visibility</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Share with Partner */}
            <div
              onClick={() => setVisibility('SHARED_WITH_PARTNER')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                background: visibility === 'SHARED_WITH_PARTNER' ? 'rgba(192, 83, 48, 0.12)' : 'var(--bg-walnut-card)',
                border: `1.5px solid ${visibility === 'SHARED_WITH_PARTNER' ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.82rem', fontWeight: 600, color: visibility === 'SHARED_WITH_PARTNER' ? 'var(--text-kehwa-cream)' : 'var(--text-parchment-muted)' }}>
                <Users size={14} color={visibility === 'SHARED_WITH_PARTNER' ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)'} />
                <span>Share with Partner</span>
              </div>
              {visibility === 'SHARED_WITH_PARTNER' && (
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--chinar-rust)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={11} color="#fff" />
                </div>
              )}
            </div>

            {/* Private Only */}
            <div
              onClick={() => setVisibility('PRIVATE')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                background: visibility === 'PRIVATE' ? 'rgba(226, 149, 59, 0.12)' : 'var(--bg-walnut-card)',
                border: `1.5px solid ${visibility === 'PRIVATE' ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.82rem', fontWeight: 600, color: visibility === 'PRIVATE' ? 'var(--text-kehwa-cream)' : 'var(--text-parchment-muted)' }}>
                <Lock size={14} color={visibility === 'PRIVATE' ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)'} />
                <span>Private Only</span>
              </div>
              {visibility === 'PRIVATE' && (
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--saffron-ember)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={11} color="#fff" />
                </div>
              )}
            </div>
          </div>

          {/* Targeted Partner Selector */}
          {visibility === 'SHARED_WITH_PARTNER' && activePartners.length > 0 && (
            <div style={{ marginTop: '10px', padding: '10px 12px', background: 'var(--bg-walnut-surface)', borderRadius: '8px', border: '1px solid var(--border-walnut-faint)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
                  Visible To:
                </span>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-parchment-muted)' }}>
                  {targetPartnerId ? 'Targeted Partner Only' : 'All Connected Partners'}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setTargetPartnerId(null)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    border: '1px solid',
                    borderColor: targetPartnerId === null ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)',
                    background: targetPartnerId === null ? 'rgba(226, 149, 59, 0.2)' : 'transparent',
                    color: targetPartnerId === null ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
                    cursor: 'pointer',
                    fontWeight: targetPartnerId === null ? 700 : 500,
                  }}
                >
                  👥 All Partners
                </button>

                {activePartners.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTargetPartnerId(p.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      border: '1px solid',
                      borderColor: targetPartnerId === p.id ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)',
                      background: targetPartnerId === p.id ? 'rgba(192, 83, 48, 0.2)' : 'transparent',
                      color: targetPartnerId === p.id ? 'var(--chinar-rust)' : 'var(--text-tweed-dim)',
                      cursor: 'pointer',
                      fontWeight: targetPartnerId === p.id ? 700 : 500,
                    }}
                  >
                    👤 {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '4px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-walnut-faint)',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
            Press <kbd style={{ padding: '1px 4px', borderRadius: '3px', background: 'var(--bg-walnut-card)', border: '1px solid var(--border-walnut-faint)', fontSize: '0.7rem' }}>Ctrl</kbd> + <kbd style={{ padding: '1px 4px', borderRadius: '3px', background: 'var(--bg-walnut-card)', border: '1px solid var(--border-walnut-faint)', fontSize: '0.7rem' }}>Enter</kbd> to save
          </span>

          <div style={{ display: 'flex', gap: '10px' }}>
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
        </div>
      </form>
    </Modal>
  );
};
