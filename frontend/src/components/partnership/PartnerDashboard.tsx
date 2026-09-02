import React, { useState, useEffect } from 'react';
import { Partnership, PartnerDailyOverview, partnershipApi } from '../../api/partnershipApi';
import { Commitment } from '../../api/commitmentApi';
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

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({
  onOpenInviteModal,
  onOpenDiscussion,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [partners, setPartners] = useState<Partnership[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<Partnership[]>([]);
  const [outgoingInvites, setOutgoingInvites] = useState<Partnership[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partnership | null>(null);
  const [partnerOverview, setPartnerOverview] = useState<PartnerDailyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [acceptShareOverrides, setAcceptShareOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPartnerships();
  }, []);

  useEffect(() => {
    if (selectedPartner) {
      const partnerUserId = selectedPartner.requesterId === user?.id 
        ? selectedPartner.partnerId 
        : selectedPartner.requesterId;
      loadPartnerOverview(partnerUserId);
    }
  }, [selectedPartner]);

  const loadPartnerships = async () => {
    try {
      setLoading(true);
      const [active, incoming, outgoing] = await Promise.all([
        partnershipApi.getActive(),
        partnershipApi.getIncomingInvites(),
        partnershipApi.getOutgoingInvites(),
      ]);
      setPartners(active);
      setIncomingInvites(incoming);
      setOutgoingInvites(outgoing);

      if (active.length > 0 && !selectedPartner) {
        setSelectedPartner(active[0]);
      }
    } catch (err: any) {
      showToast('Failed to load partnerships', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPartnerOverview = async (partnerUserId: string) => {
    try {
      setLoadingOverview(true);
      const overview = await partnershipApi.getPartnerOverview(partnerUserId);
      setPartnerOverview(overview);
    } catch (err: any) {
      showToast('Could not load partner commitments', 'error');
    } finally {
      setLoadingOverview(false);
    }
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
      loadPartnerships();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept partnership', 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await partnershipApi.reject(id);
      showToast('Partnership declined', 'info');
      loadPartnerships();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject partnership', 'error');
    }
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
            <h4 style={{ fontSize: '1rem', color: 'var(--text-kehwa-cream)' }}>Partners ({partners.length})</h4>
            <button
              onClick={onOpenInviteModal}
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <UserPlus size={14} />
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
                const partnerName = p.requesterId === user?.id ? p.partnerName : p.requesterName;
                const isSelected = selectedPartner?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPartner(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: isSelected ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                      border: `1px solid ${isSelected ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-kehwa-cream)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}>
                      {partnerName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {partnerName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)' }}>
                          Connected
                        </span>
                        {p.partnershipType === 'ONE_WAY_SPONSOR' || p.sharePartnerCommitments === false ? (
                          <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(226, 149, 59, 0.15)', color: 'var(--saffron-ember)', fontWeight: 600 }}>
                            Sponsor
                          </span>
                        ) : (
                          <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(74, 222, 128, 0.15)', color: '#4ADE80', fontWeight: 600 }}>
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
                  padding: '20px 24px',
                  background: 'rgba(30, 23, 18, 0.95)',
                  border: '1px solid var(--border-copper-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-warm-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'rgba(226, 149, 59, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--saffron-ember)'
                    }}>
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--saffron-ember)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Partner AI Brief (Mentor View)
                      </span>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                        {partnerOverview.partnerName}'s Feasibility Diagnostic
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        padding: '4px 8px', 
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
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Planned: {partnerOverview.plannedHours}h / Capacity: {partnerOverview.capacityHours}h
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--warm-cream)', lineHeight: '1.55', margin: '0 0 14px 0' }}>
                  "{partnerOverview.aiDiagnosticSummary}"
                </p>

                {/* Quick Mentor Nudges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid var(--border-walnut-faint)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '4px' }}>
                    Quick Mentor Actions:
                  </span>
                  <button
                    onClick={() => showToast(`Sent kudos to ${partnerOverview.partnerName}! 👏`, 'success')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      borderRadius: '6px',
                      background: 'rgba(74, 222, 128, 0.1)',
                      border: '1px solid rgba(74, 222, 128, 0.25)',
                      color: '#4ADE80',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <ThumbsUp size={12} />
                    <span>👏 Looking Solid</span>
                  </button>
                  <button
                    onClick={() => showToast(`Invited ${partnerOverview.partnerName} to a 10-min pair unblock! ☕`, 'info')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      borderRadius: '6px',
                      background: 'rgba(226, 149, 59, 0.1)',
                      border: '1px solid rgba(226, 149, 59, 0.25)',
                      color: 'var(--saffron-ember)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <Coffee size={12} />
                    <span>☕ Offer 10-Min Unblock</span>
                  </button>
                </div>
              </div>
            )}

            {/* Commitments Card */}
            <div className="harud-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--saffron-ember)', textTransform: 'uppercase' }}>
                    Shared Commitments
                  </span>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--text-kehwa-cream)', marginTop: '2px' }}>
                    {partnerOverview.partnerName}'s Task List
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tweed-dim)' }}>Today's Kept Rate</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: partnerOverview.completionRate === 100 ? '#4ADE80' : 'var(--saffron-ember)' }}>
                      {Math.round(partnerOverview.completionRate)}%
                    </div>
                  </div>
                </div>
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
                    {partnerOverview.partnerName} is serving as your accountability sponsor. They can inspect your commitments and keep you honest, while their own daily schedule remains private.
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
                            <Circle size={20} color="var(--text-tweed-dim)" />
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
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)', marginTop: '2px', display: 'flex', gap: '10px' }}>
                              <span>~{c.estimatedMinutes} mins</span>
                              <span>•</span>
                              <span style={{ color: 'var(--saffron-ember)' }}>{c.priority} Priority</span>
                              {c.status && (
                                <>
                                  <span>•</span>
                                  <span style={{ fontWeight: 600, color: isDone ? '#4ADE80' : isMissed ? '#F87171' : 'var(--text-muted)' }}>
                                    {c.status}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenDiscussion(c)}
                          className="btn-outline"
                          style={{ borderColor: 'var(--border-copper-subtle)' }}
                        >
                          <MessageSquare size={14} />
                          <span>Discuss</span>
                        </button>
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
