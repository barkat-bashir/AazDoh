import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Partnership, partnershipApi } from '../../api/partnershipApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Users, ShieldCheck, Eye, EyeOff, Trash2, AlertTriangle, Check, Info } from 'lucide-react';

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
  const { user } = useAuth();
  const { showToast } = useToast();
  const [shareMyCommitments, setShareMyCommitments] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirmTerminate, setShowConfirmTerminate] = useState(false);
  const [terminating, setTerminating] = useState(false);

  const isRequester = user?.id === partnership?.requesterId;
  const partnerDisplayName = partnership
    ? (isRequester ? partnership.partnerName : partnership.requesterName)
    : '';
  const partnerDisplayEmail = partnership
    ? (isRequester ? partnership.partnerEmail : partnership.requesterEmail)
    : '';

  // Current partner's outward sharing status
  const isPartnerSharing = partnership
    ? (isRequester ? partnership.sharePartnerCommitments !== false : partnership.shareRequesterCommitments !== false)
    : true;

  useEffect(() => {
    if (partnership && user) {
      const mySharing = isRequester
        ? partnership.shareRequesterCommitments !== false
        : partnership.sharePartnerCommitments !== false;
      setShareMyCommitments(mySharing);
      setShowConfirmTerminate(false);
    }
  }, [partnership, user, isOpen]);

  if (!partnership) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await partnershipApi.update(partnership.id, {
        shareMyCommitments,
      });
      showToast('Partnership privacy settings updated!', 'success');
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

  const willBeMutual = shareMyCommitments && isPartnerSharing;

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
            background: willBeMutual ? 'rgba(74, 222, 128, 0.15)' : 'rgba(226, 149, 59, 0.15)',
            color: willBeMutual ? '#4ADE80' : 'var(--saffron-ember)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {willBeMutual ? <Users size={12} /> : <ShieldCheck size={12} />}
            <span>{willBeMutual ? 'Mutual Sparring' : '1-Way Sponsor'}</span>
          </span>
        </div>

        {/* Partner Status Card */}
        <div style={{
          padding: '12px 14px',
          background: isPartnerSharing ? 'rgba(74, 222, 128, 0.05)' : 'rgba(226, 149, 59, 0.06)',
          border: `1px solid ${isPartnerSharing ? 'rgba(74, 222, 128, 0.2)' : 'rgba(226, 149, 59, 0.25)'}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          lineHeight: '1.45',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: isPartnerSharing ? '#4ADE80' : 'var(--saffron-ember)', marginBottom: '4px' }}>
            <Info size={14} />
            <span>{partnerDisplayName}'s Sharing Status:</span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-kehwa-cream)' }}>
            {isPartnerSharing
              ? `${partnerDisplayName} is sharing their daily task list with you.`
              : `${partnerDisplayName} has private schedule enabled (serving as 1-Way Sponsor). Only they can inspect your tasks.`}
          </p>
        </div>

        {/* Sovereign Visibility: Share My Commitments Toggle */}
        <div style={{
          padding: '14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-walnut-faint)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {shareMyCommitments ? (
                <Eye size={18} color="#4ADE80" />
              ) : (
                <EyeOff size={18} color="var(--text-tweed-dim)" />
              )}
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
                  Share My Daily Commitments
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', marginTop: '2px' }}>
                  Allow {partnerDisplayName} to view and discuss your daily task progress
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={shareMyCommitments}
              onChange={(e) => setShareMyCommitments(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--saffron-ember)' }}
            />
          </label>
        </div>

        {/* Privacy Note */}
        <p style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', margin: 0, lineHeight: 1.4 }}>
          💡 <strong>Sovereign Privacy:</strong> You control your own daily schedule visibility. Partnerships automatically operate in <em>Mutual Sparring</em> mode when both partners share commitments.
        </p>

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
