import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { commitmentApi, CommitmentCategory, CommitmentPriority, CommitmentVisibility } from '../../api/commitmentApi';
import { partnershipApi } from '../../api/partnershipApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Clock, Shield, Flame, Users, Lock, Target, Zap, Plus, X, ChevronDown } from 'lucide-react';
import { getLocalTodayStr } from '../../utils/dateUtils';

interface AddCommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: string;
  onTriggerAiPlanReview?: () => void;
}

// Fast regex for detecting intellectual / cognitive deep work (case-insensitive)
const DEEP_WORK_REGEX = /\b(code|coding|coded|coder|implement|implementation|implementing|build|building|study|studying|studied|research|researching|design|designing|designed|debug|debugging|debugged|refactor|refactoring|write|writing|written|draft|drafting|article|essay|thesis|paper|interview|lecture|prep|algorithm|algorithms|dsa|system design|architecture|course|learn|learning|reading|read|analysis|analyze|analyzing|backend|frontend|api|endpoint|endpoints|test|tests|testing|feature|deploy|deployment|pipeline|database|sql|schema|auth|security|documentation|pr review|git|bugfix|script|scripting)\b/i;

// Comprehensive regex for detecting everyday routines, chores, habits, and errands (case-insensitive)
const ROUTINE_REGEX = /\b(buy|buying|bought|purchase|shopping|shop|store|mall|market|bazaar|groceries|grocery|vegetables|fruits|milk|bread|meat|haircut|hair cut|cutting|cut hair|barber|salon|trim|trimming|shave|shaving|groom|grooming|clean|cleaning|cleaned|tidy|tidying|sweep|sweeping|mop|mopping|wash|washing|washed|iron|ironing|fold|folding|laundry|dishes|trash|garbage|dust|dusting|vacuum|vacuuming|cook|cooking|cooked|meal|bake|baking|breakfast|lunch|dinner|kitchen|tea|coffee|gym|workout|working out|exercise|exercising|walk|walking|run|running|jog|jogging|swim|swimming|yoga|stretch|cardio|doctor|dentist|appointment|clinic|hospital|checkup|therapy|physio|medicine|meds|pharmacy|refill|pill|pills|prescription|bill|bills|pay|paying|payment|recharge|electricity|wifi|water bill|rent|fee|fees|tax|taxes|invoice|receipt|bank|atm|deposit|withdraw|transfer|money|cash|car|bike|scooter|vehicle|fuel|petrol|diesel|gas|oil|mechanic|repair|repairing|fix|service|servicing|tyre|tire|wash car|plumber|electrician|carpenter|courier|parcel|package|post office|mail|mail box|drop off|pick up|deliver|delivery|feed|dog|cat|pet|vet|water plants|plants|gardening|pack|packing|unpack)\b/i;

export interface IntentDetectionResult {
  category: CommitmentCategory;
  isMatched: boolean;
}

export const classifyCommitmentIntent = (text: string): IntentDetectionResult => {
  if (!text || text.trim().length < 2) {
    return { category: 'DEEP_WORK', isMatched: false };
  }

  const normalized = text.toLowerCase().trim();

  if (DEEP_WORK_REGEX.test(normalized)) {
    return { category: 'DEEP_WORK', isMatched: true };
  }

  if (ROUTINE_REGEX.test(normalized)) {
    return { category: 'ROUTINE', isMatched: true };
  }

  return { category: 'DEEP_WORK', isMatched: false };
};

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
  const [category, setCategory] = useState<CommitmentCategory>('DEEP_WORK');
  const [isManuallySelected, setIsManuallySelected] = useState(false);
  const [activeMatch, setActiveMatch] = useState<CommitmentCategory | null>(null);
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [showDeliverable, setShowDeliverable] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<CommitmentPriority>('MEDIUM');
  const [visibility, setVisibility] = useState<CommitmentVisibility>('PRIVATE');
  const [targetPartnerId, setTargetPartnerId] = useState<string | null>(null);
  const [activePartners, setActivePartners] = useState<{ id: string; name: string }[]>([]);
  const [activeMenu, setActiveMenu] = useState<'duration' | 'priority' | 'visibility' | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsManuallySelected(false);
      setActiveMatch(null);
      setCategory('DEEP_WORK');
      setEstimatedMinutes(60);
      setPriority('MEDIUM');
      setVisibility('PRIVATE');
      setTargetPartnerId(null);
      setShowDeliverable(false);
      setExpectedOutcome('');
      setTitle('');
      setActiveMenu(null);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

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

  const deepWorkFocusOptions = [
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '1 Hour', value: 60 },
    { label: '1.5h', value: 90 },
    { label: '2 Hours', value: 120 },
    { label: '3h+', value: 180 },
  ];

  const routineFocusOptions = [
    { label: '10m', value: 10 },
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '1 Hour', value: 60 },
  ];

  const focusOptions = category === 'DEEP_WORK' ? deepWorkFocusOptions : routineFocusOptions;

  const handleCategoryToggle = () => {
    const nextCat = category === 'DEEP_WORK' ? 'ROUTINE' : 'DEEP_WORK';
    setIsManuallySelected(true);
    setCategory(nextCat);
    if (nextCat === 'ROUTINE' && estimatedMinutes > 45) {
      setEstimatedMinutes(15);
    } else if (nextCat === 'DEEP_WORK' && estimatedMinutes < 30) {
      setEstimatedMinutes(60);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isManuallySelected) {
      if (val.trim().length >= 2) {
        const result = classifyCommitmentIntent(val);
        if (result.isMatched) {
          setActiveMatch(result.category);
          setCategory(result.category);
          if (result.category === 'ROUTINE' && estimatedMinutes > 45) {
            setEstimatedMinutes(15);
          } else if (result.category === 'DEEP_WORK' && estimatedMinutes < 30) {
            setEstimatedMinutes(60);
          }
        } else {
          setActiveMatch(null);
        }
      } else {
        setActiveMatch(null);
      }
    }
  };

  const priorityConfig: Record<CommitmentPriority, { label: string; color: string; iconColor: string }> = {
    LOW: { label: 'Low', color: 'var(--text-parchment-muted)', iconColor: 'var(--text-tweed-dim)' },
    MEDIUM: { label: 'Medium', color: 'var(--saffron-ember)', iconColor: 'var(--saffron-ember)' },
    HIGH: { label: 'High', color: 'var(--chinar-rust)', iconColor: 'var(--chinar-rust)' },
    URGENT: { label: 'Urgent', color: '#F87171', iconColor: '#F87171' },
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      showToast('Commitment title is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const targetDate = selectedDate || getLocalTodayStr();
      await commitmentApi.create({
        title: title.trim(),
        expectedOutcome: expectedOutcome.trim() || undefined,
        estimatedMinutes: Number(estimatedMinutes),
        priority,
        category,
        commitmentDate: targetDate,
        visibility,
        targetPartnerId: visibility === 'SHARED_WITH_PARTNER' ? (targetPartnerId || undefined) : undefined,
      });

      showToast('Commitment locked in for today', 'success');
      setTitle('');
      setCategory('DEEP_WORK');
      setExpectedOutcome('');
      setEstimatedMinutes(60);
      setPriority('MEDIUM');
      setVisibility('PRIVATE');
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatDurationLabel = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    if (mins === 60) return '1h';
    if (mins === 90) return '1.5h';
    if (mins === 120) return '2h';
    return `${mins / 60}h`;
  };

  const selectedPartnerName = targetPartnerId
    ? activePartners.find(p => p.id === targetPartnerId)?.name
    : null;

  const visibilityLabel = visibility === 'PRIVATE'
    ? 'Private'
    : selectedPartnerName
      ? `Shared: ${selectedPartnerName}`
      : 'Shared with Partners';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideHeader={true}
      bodyPadding="0"
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Top Section: Expansive Command Input Canvas */}
        <div style={{ padding: '22px 24px 16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Header Row: Live Smart Mode Badge + Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCategoryToggle}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: category === 'DEEP_WORK'
                    ? '1px solid rgba(192, 83, 48, 0.45)'
                    : '1px solid rgba(226, 149, 59, 0.45)',
                  background: category === 'DEEP_WORK'
                    ? 'rgba(192, 83, 48, 0.15)'
                    : 'rgba(226, 149, 59, 0.15)',
                  color: category === 'DEEP_WORK' ? 'var(--chinar-rust)' : 'var(--saffron-ember)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                title="Click to toggle Deep Focus vs Routine"
              >
                {category === 'DEEP_WORK' ? <Target size={13} /> : <Zap size={13} />}
                <span>{category === 'DEEP_WORK' ? 'Deep Focus' : 'Routine Task'}</span>
              </button>

              {!isManuallySelected && activeMatch && (
                <span style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-parchment-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: 0.9,
                }}>
                  <Sparkles size={11} color="var(--saffron-ember)" />
                  <span>Auto-detected</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tweed-dim)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Clean Main Title Input (No box-in-box, no focus outlines) */}
          <input
            ref={inputRef}
            type="text"
            placeholder={category === 'DEEP_WORK' ? 'What are you focusing on today?' : 'What errand or task do you need to do?'}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              color: 'var(--text-kehwa-cream)',
              fontSize: '1.18rem',
              fontWeight: 500,
              fontFamily: 'inherit',
              padding: '4px 0',
              lineHeight: 1.4,
            }}
          />

          {/* Collapsible Deliverable / Outcome Field */}
          {showDeliverable && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'var(--bg-walnut-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--border-walnut-faint)',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tweed-dim)', whiteSpace: 'nowrap' }}>
                Deliverable:
              </span>
              <input
                type="text"
                placeholder="e.g. Unit tests passing & PR opened"
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  color: 'var(--text-kehwa-cream)',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => { setShowDeliverable(false); setExpectedOutcome(''); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tweed-dim)', cursor: 'pointer', padding: '2px' }}
                title="Remove deliverable"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Row 1: Metadata & Properties Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 22px',
          background: 'rgba(26, 17, 13, 0.5)',
          borderTop: '1px solid var(--border-walnut-faint)',
          flexWrap: 'wrap',
        }}>
          {/* 1. Duration Chip with Popover */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'duration' ? null : 'duration')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'var(--bg-walnut-surface)',
                color: 'var(--text-kehwa-cream)',
                border: '1px solid var(--border-walnut-faint)',
                transition: 'all 0.15s ease',
              }}
            >
              <Clock size={13} color="var(--saffron-ember)" />
              <span>{formatDurationLabel(estimatedMinutes)}</span>
              <ChevronDown size={12} opacity={0.6} />
            </button>

            {activeMenu === 'duration' && (
              <div style={{
                position: 'absolute',
                bottom: '125%',
                left: 0,
                zIndex: 100,
                background: 'var(--bg-walnut-card)',
                border: '1px solid var(--border-walnut-faint)',
                borderRadius: '8px',
                padding: '6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                display: 'flex',
                gap: '4px',
                minWidth: '250px',
              }}>
                {focusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setEstimatedMinutes(opt.value); setActiveMenu(null); }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: estimatedMinutes === opt.value ? 700 : 500,
                      background: estimatedMinutes === opt.value ? 'var(--chinar-rust)' : 'transparent',
                      color: estimatedMinutes === opt.value ? '#fff' : 'var(--text-parchment-muted)',
                      border: 'none',
                      cursor: 'pointer',
                      flex: 1,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Priority Chip with Popover */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'priority' ? null : 'priority')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'var(--bg-walnut-surface)',
                color: priorityConfig[priority].color,
                border: '1px solid var(--border-walnut-faint)',
                transition: 'all 0.15s ease',
              }}
            >
              <Flame size={13} color={priorityConfig[priority].iconColor} />
              <span>{priorityConfig[priority].label}</span>
              <ChevronDown size={12} opacity={0.6} />
            </button>

            {activeMenu === 'priority' && (
              <div style={{
                position: 'absolute',
                bottom: '125%',
                left: 0,
                zIndex: 100,
                background: 'var(--bg-walnut-card)',
                border: '1px solid var(--border-walnut-faint)',
                borderRadius: '8px',
                padding: '6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                display: 'flex',
                gap: '4px',
              }}>
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as CommitmentPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setPriority(p); setActiveMenu(null); }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: priority === p ? 700 : 500,
                      background: priority === p ? 'var(--bg-walnut-surface)' : 'transparent',
                      color: priorityConfig[p].color,
                      border: `1px solid ${priority === p ? priorityConfig[p].color : 'transparent'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {priorityConfig[p].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Visibility & Partner Selection Popover */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'visibility' ? null : 'visibility')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                background: 'var(--bg-walnut-surface)',
                color: visibility === 'PRIVATE' ? 'var(--text-kehwa-cream)' : 'var(--saffron-ember)',
                border: `1px solid ${visibility === 'PRIVATE' ? 'var(--border-walnut-faint)' : 'rgba(226, 149, 59, 0.4)'}`,
                transition: 'all 0.15s ease',
              }}
              title="Click to choose visibility and partners"
            >
              {visibility === 'PRIVATE' ? <Lock size={13} /> : <Users size={13} />}
              <span>{visibilityLabel}</span>
              <ChevronDown size={12} opacity={0.6} />
            </button>

            {activeMenu === 'visibility' && (
              <div style={{
                position: 'absolute',
                bottom: '125%',
                left: 0,
                zIndex: 100,
                background: 'var(--bg-walnut-card)',
                border: '1px solid var(--border-walnut-faint)',
                borderRadius: '8px',
                padding: '6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: '220px',
              }}>
                {/* Option 1: Private */}
                <button
                  type="button"
                  onClick={() => {
                    setVisibility('PRIVATE');
                    setTargetPartnerId(null);
                    setActiveMenu(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '5px',
                    fontSize: '0.78rem',
                    fontWeight: visibility === 'PRIVATE' ? 700 : 500,
                    background: visibility === 'PRIVATE' ? 'var(--bg-walnut-surface)' : 'transparent',
                    color: visibility === 'PRIVATE' ? 'var(--saffron-ember)' : 'var(--text-parchment-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Lock size={13} />
                  <span>Private (Just me)</span>
                </button>

                {/* Option 2: Shared with all partners */}
                <button
                  type="button"
                  onClick={() => {
                    setVisibility('SHARED_WITH_PARTNER');
                    setTargetPartnerId(null);
                    setActiveMenu(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '5px',
                    fontSize: '0.78rem',
                    fontWeight: (visibility === 'SHARED_WITH_PARTNER' && !targetPartnerId) ? 700 : 500,
                    background: (visibility === 'SHARED_WITH_PARTNER' && !targetPartnerId) ? 'var(--bg-walnut-surface)' : 'transparent',
                    color: (visibility === 'SHARED_WITH_PARTNER' && !targetPartnerId) ? 'var(--saffron-ember)' : 'var(--text-parchment-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Users size={13} />
                  <span>All Partners</span>
                </button>

                {/* Option 3+: Specific active partners */}
                {activePartners.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-walnut-faint)', paddingTop: '4px', marginTop: '2px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tweed-dim)', padding: '2px 10px 4px', fontWeight: 600 }}>
                      Specific Partner:
                    </div>
                    {activePartners.map((partner) => (
                      <button
                        key={partner.id}
                        type="button"
                        onClick={() => {
                          setVisibility('SHARED_WITH_PARTNER');
                          setTargetPartnerId(partner.id);
                          setActiveMenu(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '5px',
                          fontSize: '0.78rem',
                          fontWeight: (visibility === 'SHARED_WITH_PARTNER' && targetPartnerId === partner.id) ? 700 : 500,
                          background: (visibility === 'SHARED_WITH_PARTNER' && targetPartnerId === partner.id) ? 'var(--bg-walnut-surface)' : 'transparent',
                          color: (visibility === 'SHARED_WITH_PARTNER' && targetPartnerId === partner.id) ? 'var(--saffron-ember)' : 'var(--text-parchment-muted)',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                        }}
                      >
                        <span>👤</span>
                        <span>{partner.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Add Deliverable Button */}
          {!showDeliverable && category === 'DEEP_WORK' && (
            <button
              type="button"
              onClick={() => setShowDeliverable(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 500,
                cursor: 'pointer',
                background: 'transparent',
                color: 'var(--text-tweed-dim)',
                border: '1px dashed var(--border-walnut-faint)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={13} />
              <span>Deliverable</span>
            </button>
          )}
        </div>

        {/* Row 2: Clean Actions Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '12px 22px',
          background: 'rgba(20, 14, 11, 0.9)',
          borderTop: '1px solid var(--border-walnut-faint)',
          gap: '10px',
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tweed-dim)',
              fontSize: '0.84rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              borderRadius: '6px',
              background: title.trim() ? 'var(--chinar-rust)' : 'var(--bg-walnut-surface)',
              color: title.trim() ? '#fff' : 'var(--text-tweed-dim)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              boxShadow: title.trim() ? '0 2px 10px var(--chinar-glow)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{loading ? 'Saving...' : 'Commit to Today'}</span>
            <kbd style={{
              background: title.trim() ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.05)',
              padding: '1px 5px',
              borderRadius: '3px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>↵</kbd>
          </button>
        </div>

      </form>
    </Modal>
  );
};
