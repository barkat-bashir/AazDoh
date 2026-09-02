import React, { useState, useEffect } from 'react';
import { Partnership, PartnerDailyOverview, partnershipApi } from '../../api/partnershipApi';
import { Commitment } from '../../api/commitmentApi';
import { discussionApi } from '../../api/discussionApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  Sparkles,
  Activity,
  Zap,
  Coffee,
  ThumbsUp,
  History,
  ShieldCheck
} from 'lucide-react';

interface PartnerDashboardProps {
  onOpenInviteModal: () => void;
  onOpenDiscussion: (commitment: Commitment) => void;
}

import { useQuery, useQueryClient } from '@tanstack/react-query';

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({
  onOpenInviteModal,
  onOpenDiscussion,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPartner, setSelectedPartner] = useState<Partnership | null>(null);
  const [acceptShareOverrides, setAcceptShareOverrides] = useState<Record<string, boolean>>({});

  // TanStack Query: in-memory caching & deduplication
  const { data: unreadSummary } = useQuery({
    queryKey: ['unreadSummary'],
    queryFn: () => discussionApi.getUnreadSummary(),
    enabled: !!user,
  });

  const { data: partners = [], isLoading: loadingPartners } = useQuery({
    queryKey: ['partners', 'active'],
    queryFn: () => partnershipApi.getActive(),
  });

  const { data: incomingInvites = [] } = useQuery({
    queryKey: ['partners', 'incoming'],
    queryFn: () => partnershipApi.getIncomingInvites(),
  });

  const { data: outgoingInvites = [] } = useQuery({
    queryKey: ['partners', 'outgoing'],
    queryFn: () => partnershipApi.getOutgoingInvites(),
  });

  const loading = loadingPartners && partners.length === 0;

  // Keep selectedPartner in sync with partner list
  useEffect(() => {
    if (partners.length > 0 && !selectedPartner) {
      setSelectedPartner(partners[0]);
    } else if (partners.length > 0 && selectedPartner) {
      const updated = partners.find(p => p.id === selectedPartner.id);
      if (updated) {
        setSelectedPartner(updated);
      } else {
        setSelectedPartner(partners[0]);
      }
    }
  }, [partners]);

  const partnerUserId = selectedPartner
    ? (selectedPartner.requesterId === user?.id ? selectedPartner.partnerId : selectedPartner.requesterId)
    : null;

  const { data: partnerOverview = null, isLoading: loadingOverview } = useQuery({
    queryKey: ['partnerOverview', partnerUserId],
    queryFn: () => partnershipApi.getPartnerOverview(partnerUserId!),
    enabled: !!partnerUserId,
  });

  const refreshPartnerships = () => {
    queryClient.invalidateQueries({ queryKey: ['partners'] });
    queryClient.invalidateQueries({ queryKey: ['unreadSummary'] });
    queryClient.invalidateQueries({ queryKey: ['partnerOverview'] });
  };

  const handleAccept = async (id: string, shareMyCommitments?: boolean) => {
    try {
      await partnershipApi.accept(id, shareMyCommitments);
      showToast(
        shareMyCommitments === false
          ? 'Accepted as 1-Way Accountability Sponsor. Your day remains private.'
          : 'Partnership accepted! You are now connected.',
        'success'
      );
      refreshPartnerships();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept partnership', 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await partnershipApi.reject(id);
      showToast('Partnership declined', 'info');
      refreshPartnerships();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject partnership', 'error');
    }
  };

  const toProperCase = (str?: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDiagnosticForMentor = (summary?: string, partnerName?: string) => {
    if (!summary) return '';
    const name = toProperCase(partnerName);
    return summary
      .replace(/^Your planned load/gi, `${name}'s planned load`)
      .replace(/ your planned load/gi, ` ${name}'s planned load`)
      .replace(/within your 7-day average/gi, `within their 7-day average`)
      .replace(/exceeds your 7-day average/gi, `exceeds ${name}'s 7-day average`)
      .replace(/your historical/gi, `their historical`)
      .replace(/your momentum/gi, `their momentum`)
      .replace(/your baseline/gi, `their baseline`);
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'LOW':
        return '#4ADE80';
      case 'MODERATE':
        return 'var(--saffron-ember)';
      case 'HIGH':
        return 'var(--chinar-rust)';
      case 'CRITICAL':
        return '#F87171';
      default:
        return 'var(--saffron-ember)';
    }
  };

  return (
    <div className="partner-layout">
      {/* Sidebar: Partners & Invitations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Active Partners Box */}
        <div className="harud-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-kehwa-cream)', margin: 0 }}>
                Partners ({partners.length})
              </h4>
              {unreadSummary?.unreadPartnerMessages && unreadSummary.unreadPartnerMessages > 0 ? (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await discussionApi.markAllAsRead();
                      queryClient.invalidateQueries({ queryKey: ['unreadSummary'] });
                      queryClient.invalidateQueries({ queryKey: ['partnerOverview'] });
                      queryClient.invalidateQueries({ queryKey: ['commitments'] });
                      showToast('All notifications marked as read', 'info');
                    } catch (err) {}
                  }}
                  style={{
                    background: 'rgba(226, 149, 59, 0.12)',
                    border: '1px solid rgba(226, 149, 59, 0.3)',
                    color: 'var(--saffron-ember)',
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  title="Clear all unread notification badges"
                >
                  Clear All
                </button>
              ) : null}
            </div>
            <button
              onClick={onOpenInviteModal}
              className="btn-primary"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              <UserPlus size={13} />
              <span>Invite</span>
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-tweed-dim)', fontSize: '0.86rem' }}>Loading partners...</p>
          ) : partners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-tweed-dim)' }}>
              <p style={{ fontSize: '0.85rem' }}>No active partners yet.</p>
              <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Invite a friend to unlock 1:1 accountability.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {partners.map((p) => {
                const rawName = p.requesterId === user?.id ? p.partnerName : p.requesterName;
                const partnerName = toProperCase(rawName);
                const isSelected = selectedPartner?.id === p.id;
                const otherUserId = p.requesterId === user?.id ? p.partnerId : p.requesterId;
                const hasPartnerUnread = !!unreadSummary?.unreadPartnerIds?.includes(otherUserId);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPartner(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: isSelected
                        ? 'linear-gradient(90deg, rgba(226, 149, 59, 0.12), rgba(30, 23, 18, 0.95))'
                        : 'var(--bg-walnut-surface)',
                      border: isSelected ? '1px solid rgba(226, 149, 59, 0.45)' : '1px solid var(--border-walnut-faint)',
                      borderLeft: isSelected ? '3px solid var(--saffron-ember)' : '3px solid transparent',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: isSelected ? '0 4px 16px rgba(192, 83, 48, 0.15)' : 'none',
                      color: 'var(--text-kehwa-cream)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isSelected
                        ? 'linear-gradient(135deg, var(--saffron-ember), var(--chinar-rust))'
                        : 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: '#FFF',
                      boxShadow: isSelected ? '0 0 10px rgba(226, 149, 59, 0.4)' : 'none',
                    }}>
                      {partnerName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {partnerName}
                        </span>
                        {hasPartnerUnread && (
                          <span style={{
                            background: 'var(--chinar-rust)',
                            color: '#fff',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            boxShadow: '0 0 8px rgba(192, 83, 48, 0.6)',
                            flexShrink: 0,
                          }}>
                            <MessageSquare size={9} />
                            New
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
                          Connected
                        </span>
                        {p.partnershipType === 'ONE_WAY_SPONSOR' || p.sharePartnerCommitments === false ? (
                          <span style={{ fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(226, 149, 59, 0.15)', color: 'var(--saffron-ember)', fontWeight: 600 }}>
                            Sponsor
                          </span>
                        ) : (
                          <span style={{ fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(74, 222, 128, 0.15)', color: '#4ADE80', fontWeight: 600 }}>
                            Mutual
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Accountability Cadence Info Card */}
        <div style={{
          padding: '14px 16px',
          background: 'rgba(226, 149, 59, 0.04)',
          border: '1px solid rgba(226, 149, 59, 0.12)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}>
          <Zap size={16} color="var(--saffron-ember)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--saffron-ember)', marginBottom: '3px' }}>
              Accountability Cadence
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', lineHeight: 1.45, margin: 0 }}>
              Leave quick mentor feedback on your partner's tasks before midday to keep daily execution momentum sharp.
            </p>
          </div>
        </div>

        {/* Incoming Invitations */}
        {incomingInvites.length > 0 && (
          <div className="harud-card" style={{ padding: '18px', border: '1px solid var(--saffron-ember)' }}>
            <h4 style={{ fontSize: '0.92rem', color: 'var(--saffron-ember)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={15} />
              <span>Pending Invitations ({incomingInvites.length})</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incomingInvites.map((inv) => {
                const isSponsorInvite = inv.partnershipType === 'ONE_WAY_SPONSOR';
                const shareMyTasks = acceptShareOverrides[inv.id] !== undefined ? acceptShareOverrides[inv.id] : !isSponsorInvite;

                return (
                  <div
                    key={inv.id}
                    style={{
                      padding: '12px',
                      background: 'var(--bg-walnut-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-walnut-faint)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
                        {inv.requesterName}
                      </div>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isSponsorInvite ? 'rgba(226, 149, 59, 0.2)' : 'rgba(74, 222, 128, 0.15)',
                        color: isSponsorInvite ? 'var(--saffron-ember)' : '#4ADE80',
                        fontWeight: 700,
                      }}>
                        {isSponsorInvite ? '🛡️ Sponsor Request' : '🤝 Mutual Sparring'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', marginBottom: '8px' }}>
                      {inv.requesterEmail}
                    </div>

                    {/* Sovereign Privacy Checkbox for Acceptor */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.74rem',
                      color: 'var(--text-kehwa-cream)',
                      background: 'rgba(255,255,255,0.03)',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      marginBottom: '10px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={shareMyTasks}
                        onChange={(e) => setAcceptShareOverrides(prev => ({ ...prev, [inv.id]: e.target.checked }))}
                      />
                      <span>Also share my daily commitments with {inv.requesterName}</span>
                    </label>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleAccept(inv.id, shareMyTasks)}
                        className="btn-primary"
                        style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                      >
                        <Check size={13} />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleReject(inv.id)}
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                      >
                        <X size={13} />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main View: Partner's Commitments & Progress */}
      <div>
        {selectedPartner && partnerOverview ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* 🤖 Partner AI Accountability Brief Card */}
            {partnerOverview.aiDiagnosticSummary && (
              <div 
                className="harud-card"
                style={{
                  padding: '22px 24px',
                  background: 'rgba(30, 23, 18, 0.95)',
                  border: '1px solid var(--border-copper-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-warm-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(226, 149, 59, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--saffron-ember)'
                    }}>
                      <Sparkles size={17} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--saffron-ember)', letterSpacing: '0.04em' }}>
                        Partner AI Brief • Mentor View
                      </span>
                      <div style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-kehwa-cream)', marginTop: '1px' }}>
                        {toProperCase(partnerOverview.partnerName)}'s Feasibility Diagnostic
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        background: 'rgba(255,255,255,0.06)', 
                        color: getRiskColor(partnerOverview.aiRiskLevel),
                        border: `1px solid ${getRiskColor(partnerOverview.aiRiskLevel)}40`,
                        fontWeight: '700' 
                      }}
                    >
                      {partnerOverview.aiRiskScore !== undefined ? `${partnerOverview.aiRiskScore}% Risk (${partnerOverview.aiRiskLevel})` : 'Feasible'}
                    </span>
                    {partnerOverview.plannedHours !== undefined && (
                      <span style={{ fontSize: '11.5px', color: 'var(--text-tweed-dim)' }}>
                        Planned: {partnerOverview.plannedHours}h / Capacity: {partnerOverview.capacityHours}h
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--warm-cream)', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                  "{formatDiagnosticForMentor(partnerOverview.aiDiagnosticSummary, partnerOverview.partnerName)}"
                </p>

                {/* Quick Mentor Nudges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border-walnut-faint)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tweed-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '2px', fontWeight: 600 }}>
                    Quick Mentor Actions:
                  </span>
                  <button
                    onClick={() => showToast(`Sent kudos to ${toProperCase(partnerOverview.partnerName)}! 👏`, 'success')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '11.5px',
                      borderRadius: '20px',
                      background: 'rgba(74, 222, 128, 0.1)',
                      border: '1px solid rgba(74, 222, 128, 0.35)',
                      color: '#4ADE80',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(74, 222, 128, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(74, 222, 128, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <ThumbsUp size={13} />
                    <span>👏 Looking Solid</span>
                  </button>
                  <button
                    onClick={() => showToast(`Invited ${toProperCase(partnerOverview.partnerName)} to a 10-min pair unblock! ☕`, 'info')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '11.5px',
                      borderRadius: '20px',
                      background: 'rgba(226, 149, 59, 0.1)',
                      border: '1px solid rgba(226, 149, 59, 0.35)',
                      color: 'var(--saffron-ember)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(226, 149, 59, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(226, 149, 59, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Coffee size={13} />
                    <span>☕ Offer 10-Min Unblock</span>
                  </button>
                </div>
              </div>
            )}

            {/* Commitments Card */}
            <div className="harud-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--saffron-ember)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Shared Commitments
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-kehwa-cream)', marginTop: '2px', fontWeight: 700 }}>
                    {toProperCase(partnerOverview.partnerName)}'s Task List
                  </h3>
                </div>

                {/* Soft Dual-Progress Indicator */}
                {partnerOverview.sharedCommitments.length > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tweed-dim)', marginBottom: '5px' }}>
                      {partnerOverview.sharedCommitments.filter(c => c.status === 'COMPLETED').length} of {partnerOverview.sharedCommitments.length} Finished
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '84px',
                        height: '6px',
                        borderRadius: '3px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${Math.round(partnerOverview.completionRate)}%`,
                          height: '100%',
                          borderRadius: '3px',
                          background: partnerOverview.completionRate === 100
                            ? '#4ADE80'
                            : 'linear-gradient(90deg, var(--chinar-rust), var(--saffron-ember))',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <span style={{
                        fontSize: '0.96rem',
                        fontWeight: 700,
                        color: partnerOverview.completionRate === 100 ? '#4ADE80' : 'var(--text-kehwa-cream)',
                      }}>
                        {Math.round(partnerOverview.completionRate)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Commitment List */}
              {loadingOverview ? (
                <p style={{ color: 'var(--text-tweed-dim)', padding: '20px 0' }}>Loading shared commitments...</p>
              ) : partnerOverview.isOneWaySponsor ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', background: 'rgba(226, 149, 59, 0.04)', borderRadius: '12px', border: '1px dashed rgba(226, 149, 59, 0.3)' }}>
                  <ShieldCheck size={38} color="var(--saffron-ember)" style={{ marginBottom: '10px' }} />
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
                    1-Way Accountability Sponsor
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-parchment-muted)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
                    {toProperCase(partnerOverview.partnerName)} is serving as your accountability sponsor. They can inspect your commitments and keep you honest, while their own daily schedule remains private.
                  </p>
                </div>
              ) : partnerOverview.sharedCommitments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tweed-dim)' }}>
                  <Users size={36} color="var(--border-copper-subtle)" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.95rem' }}>No shared commitments for today yet.</p>
                  <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                    Your partner hasn't posted shared commitments for today.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {partnerOverview.sharedCommitments.map((c) => {
                    const isDone = c.status === 'COMPLETED';
                    const isMissed = c.status === 'MISSED';
                    const isPostponed = c.status === 'POSTPONED';
                    return (
                      <div
                        key={c.id}
                        style={{
                          padding: '16px',
                          background: 'var(--bg-walnut-surface)',
                          border: `1px solid ${isDone ? 'var(--pine-emerald)' : isMissed ? 'rgba(184, 58, 58, 0.4)' : isPostponed ? 'rgba(226, 149, 59, 0.3)' : 'var(--border-walnut-faint)'}`,
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {isDone ? (
                            <CheckCircle size={20} color="#4ADE80" />
                          ) : isMissed ? (
                            <AlertCircle size={20} color="#F87171" />
                          ) : (
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: '1.5px dashed var(--border-copper-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-tweed-dim)',
                              flexShrink: 0,
                            }}>
                              <Clock size={11} />
                            </div>
                          )}
                          <div>
                            <div style={{
                              fontSize: '0.98rem',
                              fontWeight: 600,
                              color: isDone ? 'var(--text-parchment-muted)' : 'var(--text-kehwa-cream)',
                              textDecoration: isDone ? 'line-through' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flexWrap: 'wrap',
                            }}>
                              <span>{c.title}</span>
                              {c.postponementCount && c.postponementCount > 0 ? (
                                <span style={{
                                  fontSize: '10.5px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: 'rgba(226, 149, 59, 0.15)',
                                  color: 'var(--saffron-ember)',
                                  border: '1px solid rgba(226, 149, 59, 0.3)',
                                  fontWeight: 600,
                                }}>
                                  Rescheduled ({c.postponementCount}x)
                                </span>
                              ) : null}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)', marginTop: '2px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <span>~{c.estimatedMinutes} mins</span>
                              <span>•</span>
                              <span style={{ color: 'var(--saffron-ember)', textTransform: 'capitalize' }}>
                                {c.priority ? c.priority.toLowerCase() : 'medium'} priority
                              </span>
                              {c.status && (
                                <>
                                  <span>•</span>
                                  <span style={{
                                    fontWeight: 600,
                                    fontSize: '10px',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    background: isDone ? 'rgba(74, 222, 128, 0.1)' : isMissed ? 'rgba(248, 113, 113, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    color: isDone ? '#4ADE80' : isMissed ? '#F87171' : 'var(--text-tweed-dim)',
                                    border: `1px solid ${isDone ? 'rgba(74, 222, 128, 0.25)' : isMissed ? 'rgba(248, 113, 113, 0.25)' : 'rgba(255, 255, 255, 0.1)'}`,
                                    textTransform: 'uppercase',
                                  }}>
                                    {c.status}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {(() => {
                          const isUnread = !!c.hasUnreadDiscussion || !!(unreadSummary?.unreadCommitmentIds?.includes(c.id));
                          return (
                            <button
                              onClick={() => onOpenDiscussion(c)}
                              className="btn-outline"
                              style={isUnread ? {
                                borderColor: 'var(--saffron-ember)',
                                background: 'rgba(226, 149, 59, 0.16)',
                                color: 'var(--saffron-ember)',
                                fontWeight: 700,
                                boxShadow: '0 0 12px rgba(226, 149, 59, 0.25)',
                              } : (c.discussionMessageCount && c.discussionMessageCount > 0) ? {
                                borderColor: 'rgba(226, 149, 59, 0.35)',
                                color: 'var(--text-kehwa-cream)',
                              } : { borderColor: 'var(--border-copper-subtle)' }}
                            >
                              <MessageSquare size={14} color={isUnread ? 'var(--saffron-ember)' : undefined} />
                              <span>
                                {isUnread
                                  ? `Discuss • ⚡ New`
                                  : (c.discussionMessageCount && c.discussionMessageCount > 0)
                                    ? `Discuss (${c.discussionMessageCount})`
                                    : 'Discuss'}
                              </span>
                            </button>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="harud-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-tweed-dim)' }}>
            <Users size={48} color="var(--border-copper-subtle)" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-kehwa-cream)' }}>1-to-1 Peer Accountability</h3>
            <p style={{ maxWidth: '440px', margin: '8px auto 20px', fontSize: '0.88rem' }}>
              Connect with a friend or colleague to share daily commitments and hold each other accountable to keeping your word.
            </p>
            <button onClick={onOpenInviteModal} className="btn-primary">
              <UserPlus size={16} />
              <span>Invite Your First Partner</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
