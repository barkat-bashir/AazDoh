import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { partnershipApi } from '../../api/partnershipApi';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Mail } from 'lucide-react';

interface InvitePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvitePartnerModal: React.FC<InvitePartnerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      await partnershipApi.invite(email.trim());
      showToast(`Partnership invitation sent to ${email}`, 'success');
      setEmail('');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to send invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Accountability Partner"
      subtitle="Enter your partner's email address to connect (1:1 accountability)"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
            <Mail size={14} color="var(--chinar-rust)" />
            <span>Partner's Email Address *</span>
          </label>
          <input
            type="email"
            className="input-field"
            placeholder="partner@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-tweed-dim)', lineHeight: 1.4 }}>
          Once accepted, you both will be able to see each other's daily shared commitments, completion rates, and ask direct questions on missed tasks.
        </p>

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
            <UserPlus size={16} />
            <span>{loading ? 'Sending Invite...' : 'Send Invitation'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
