import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Partnership, partnershipApi } from '../../api/partnershipApi';
import { useToast } from '../../context/ToastContext';
import { Settings, Users, ShieldCheck, Eye, EyeOff, Trash2, AlertTriangle, Check } from 'lucide-react';

interface ManagePartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnership: Partnership | null;
  onSuccess: () => void;
  onTerminate: () => void;
}

export const ManagePartnershipModal: React.FC<ManagePartnershipModalProps> = ({
  isOpen,
  onClose,
  partnership,
  onSuccess,
  onTerminate,
}) => {
  const { showToast } = useToast();
  const [partnershipType, setPartnershipType] = useState<'MUTUAL' | 'ONE_WAY_SPONSOR'>('MUTUAL');
  const [sharePartnerCommitments, setSharePartnerCommitments] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirmTerminate, setShowConfirmTerminate] = useState(false);
  const [terminating, setTerminating] = useState(false);

  useEffect(() => {
    if (partnership) {
      setPartnershipType(partnership.partnershipType || 'MUTUAL');
      setSharePartnerCommitments(partnership.sharePartnerCommitments !== false);
      setShowConfirmTerminate(false);
    }
  }, [partnership, isOpen]);

  if (!partnership) return null;

  const partnerDisplayName = partnership.partnerName || partnership.requesterName;
  const partnerDisplayEmail = partnership.partnerEmail || partnership.requesterEmail;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await partnershipApi.update(partnership.id, {
        partnershipType,
        sharePartnerCommitments,
      });
      showToast('Partnership settings updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update partnership', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminatePartnership = async () => {
    try {
      setTerminating(true);
      await partnershipApi.terminate(partnership.id);
      showToast('Partnership ended', 'info');
      onTerminate();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to end partnership', 'error');
    } finally {
      setTerminating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Partnership"
      subtitle={`Configure accountability settings and visibility with ${partnerDisplayName}`}
    >
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* Partner Info Summary */}
        <div style={{
          padding: '12px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-walnut-faint)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
              {partnerDisplayName}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)', marginTop: '2px' }}>
              {partnerDisplayEmail}
            </div>
          </div>
          <span style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '4px',
            background: partnership.status === 'ACCEPTED' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(226, 149, 59, 0.15)',
            color: partnership.status === 'ACCEPTED' ? '#4ADE80' : 'var(--saffron-ember)',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}>
            {partnership.status}
          </span>
        </div>

        {/* Partnership Mode Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
            Partnership Mode
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Mutual Mode */}
            <button
              type="button"
              onClick={() => setPartnershipType('MUTUAL')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '12px',
                borderRadius: '8px',
                background: partnershipType === 'MUTUAL' ? 'rgba(74, 222, 128, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: partnershipType === 'MUTUAL' ? '1.5px solid #4ADE80' : '1px solid var(--border-walnut-faint)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: partnershipType === 'MUTUAL' ? '#4ADE80' : 'var(--text-kehwa-cream)', fontWeight: 700, fontSize: '0.86rem', marginBottom: '4px' }}>
                <Users size={16} />
                <span>Mutual Sparring</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', margin: 0, lineHeight: 1.4 }}>
                Both partners see and hold each other accountable to daily tasks.
              </p>
            </button>

            {/* 1-Way Sponsor Mode */}
            <button
              type="button"
              onClick={() => setPartnershipType('ONE_WAY_SPONSOR')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '12px',
                borderRadius: '8px',
                background: partnershipType === 'ONE_WAY_SPONSOR' ? 'rgba(226, 149, 59, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: partnershipType === 'ONE_WAY_SPONSOR' ? '1.5px solid var(--saffron-ember)' : '1px solid var(--border-walnut-faint)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: partnershipType === 'ONE_WAY_SPONSOR' ? 'var(--saffron-ember)' : 'var(--text-kehwa-cream)', fontWeight: 700, fontSize: '0.86rem', marginBottom: '4px' }}>
                <ShieldCheck size={16} />
                <span>1-Way Sponsor</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', margin: 0, lineHeight: 1.4 }}>
                One-way mentorship / oversight without reciprocal task sharing.
              </p>
            </button>
          </div>
        </div>

        {/* Visibility & Commitment Sharing Toggle */}
        <div style={{
          padding: '14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-walnut-faint)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {sharePartnerCommitments ? (
                <Eye size={18} color="#4ADE80" />
              ) : (
                <EyeOff size={18} color="var(--text-tweed-dim)" />
              )}
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
                  Share Commitments
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', marginTop: '2px' }}>
                  Allow {partnerDisplayName} to see your daily shared commitments
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sharePartnerCommitments}
              onChange={(e) => setSharePartnerCommitments(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--saffron-ember)' }}
            />
          </label>
        </div>

        {/* Danger Zone: Terminate Partnership */}
        <div style={{
          padding: '14px',
          background: 'rgba(248, 113, 113, 0.04)',
          border: '1px solid rgba(248, 113, 113, 0.2)',
          borderRadius: 'var(--radius-sm)',
          marginTop: '4px',
        }}>
          {!showConfirmTerminate ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#F87171' }}>
                  End Accountability Partnership
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', marginTop: '1px' }}>
                  Unpair and stop mutual daily accountability
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmTerminate(true)}
                style={{
                  background: 'rgba(248, 113, 113, 0.12)',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  color: '#F87171',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={12} />
                <span>Unpair</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontSize: '0.82rem', fontWeight: 600 }}>
                <AlertTriangle size={15} />
                <span>Are you sure you want to end this partnership?</span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', margin: 0 }}>
                You will no longer see each other's progress and discussion history will be closed.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleTerminatePartnership}
                  disabled={terminating}
                  style={{
                    background: '#F87171',
                    border: 'none',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {terminating ? 'Ending...' : 'Yes, End Partnership'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmTerminate(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-walnut-faint)',
                    color: 'var(--text-kehwa-cream)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Close
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            <Check size={14} />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
