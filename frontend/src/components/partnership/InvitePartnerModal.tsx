import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { partnershipApi } from '../../api/partnershipApi';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Mail, Users, ShieldCheck } from 'lucide-react';

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
  const [partnershipType, setPartnershipType] = useState<'MUTUAL' | 'ONE_WAY_SPONSOR'>('MUTUAL');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      await partnershipApi.invite(email.trim(), partnershipType);
      showToast(
        partnershipType === 'ONE_WAY_SPONSOR'
          ? `Accountability Sponsor invite sent to ${email}`
          : `Mutual partnership invitation sent to ${email}`,
        'success'
      );
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
      subtitle="Connect 1:1 with a peer or invite a mentor to hold you to your word"
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

        {/* Partnership Mode Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
            Partnership Mode
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setPartnershipType('MUTUAL')}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: partnershipType === 'MUTUAL' ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)',
                background: partnershipType === 'MUTUAL' ? 'rgba(226, 149, 59, 0.15)' : 'var(--bg-walnut-surface)',
                color: partnershipType === 'MUTUAL' ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.86rem' }}>
                <Users size={15} />
                <span>Mutual Sparring</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-parchment-muted)', lineHeight: 1.3 }}>
                We both share daily commitments and inspect each other's execution.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPartnershipType('ONE_WAY_SPONSOR')}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: partnershipType === 'ONE_WAY_SPONSOR' ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)',
                background: partnershipType === 'ONE_WAY_SPONSOR' ? 'rgba(226, 149, 59, 0.15)' : 'var(--bg-walnut-surface)',
                color: partnershipType === 'ONE_WAY_SPONSOR' ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.86rem' }}>
                <ShieldCheck size={15} />
                <span>Sponsor / Mentor</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-parchment-muted)', lineHeight: 1.3 }}>
                I share my commitments with them; their day remains private.
              </span>
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)', lineHeight: 1.4, margin: 0 }}>
          {partnershipType === 'MUTUAL'
            ? 'Both of you will see each other’s daily commitments, completion rates, and unblock each other.'
            : 'Your sponsor can inspect your commitments and call you out on missed tasks, without having to log their own.'}
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
