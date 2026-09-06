import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { commitmentApi, CommitmentCategory, CommitmentPriority, CommitmentVisibility } from '../../api/commitmentApi';
import { partnershipApi } from '../../api/partnershipApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Clock, Shield, Flame, Users, Lock, Check, User as UserIcon, Target, CheckCircle2 } from 'lucide-react';
import { getLocalTodayStr } from '../../utils/dateUtils';

interface AddCommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: string;
  onTriggerAiPlanReview?: () => void;
}

// Fast, robust regex for detecting intellectual / cognitive focus work (case-insensitive)
const DEEP_WORK_REGEX = /\b(code|coding|coded|coder|implement|implementation|implementing|build|building|study|studying|studied|research|researching|design|designing|designed|debug|debugging|debugged|refactor|refactoring|write|writing|written|draft|drafting|article|essay|thesis|paper|interview|prep|algorithm|algorithms|dsa|system design|architecture|course|learn|learning|reading|read|analysis|analyze|analyzing|backend|frontend|api|endpoint|endpoints|test|tests|testing|feature|deploy|deployment|pipeline|database|sql|schema|auth|security|documentation|pr review|git|bugfix|script|scripting)\b/i;

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

  // 1. Deep work signals always win conflicts (e.g. "Clean up auth codebase" -> DEEP_WORK)
  if (DEEP_WORK_REGEX.test(normalized)) {
    return { category: 'DEEP_WORK', isMatched: true };
  }

  // 2. Clear routine signal
  if (ROUTINE_REGEX.test(normalized)) {
    return { category: 'ROUTINE', isMatched: true };
  }

  // 3. Default bias (no concrete keyword matched)
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
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<CommitmentPriority>('MEDIUM');
  const [visibility, setVisibility] = useState<CommitmentVisibility>('SHARED_WITH_PARTNER');
  const [targetPartnerId, setTargetPartnerId] = useState<string | null>(null);
  const [activePartners, setActivePartners] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsManuallySelected(false);
      setActiveMatch(null);
      setCategory('DEEP_WORK');
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
    { label: '1.5 Hours', value: 90 },
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

  const handleCategoryChange = (newCat: CommitmentCategory) => {
    setIsManuallySelected(true);
    setActiveMatch(null);
    setCategory(newCat);
    if (newCat === 'ROUTINE' && estimatedMinutes > 45) {
      setEstimatedMinutes(15);
    } else if (newCat === 'DEEP_WORK' && estimatedMinutes < 30) {
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

      showToast('Commitment created successfully', 'success');
      setTitle('');
      setCategory('DEEP_WORK');
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
        {/* Work Mode / Category Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
            Work Mode / Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleCategoryChange('DEEP_WORK')}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${category === 'DEEP_WORK' ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
                background: category === 'DEEP_WORK' ? 'rgba(192, 83, 48, 0.16)' : 'var(--bg-walnut-card)',
                color: category === 'DEEP_WORK' ? 'var(--text-kehwa-cream)' : 'var(--text-parchment-muted)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                transition: 'var(--transition-smooth)',
                boxShadow: category === 'DEEP_WORK' ? '0 0 12px var(--chinar-glow)' : 'none',
              }}
            >
              <Target size={18} color={category === 'DEEP_WORK' ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)'} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.88rem', display: 'block', color: category === 'DEEP_WORK' ? 'var(--saffron-ember)' : 'var(--text-kehwa-cream)' }}>
                  🎯 Deep Focus
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>
                  Intellectual work & Pomodoro sprints
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange('ROUTINE')}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${category === 'ROUTINE' ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                background: category === 'ROUTINE' ? 'rgba(226, 149, 59, 0.14)' : 'var(--bg-walnut-card)',
                color: category === 'ROUTINE' ? 'var(--text-kehwa-cream)' : 'var(--text-parchment-muted)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                transition: 'var(--transition-smooth)',
                boxShadow: category === 'ROUTINE' ? '0 0 12px var(--saffron-glow)' : 'none',
              }}
            >
              <CheckCircle2 size={18} color={category === 'ROUTINE' ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)'} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.88rem', display: 'block', color: category === 'ROUTINE' ? 'var(--saffron-ember)' : 'var(--text-kehwa-cream)' }}>
                  ⚡ Routine / Errand
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>
                  Quick chores, market, habits
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
              {category === 'DEEP_WORK' ? 'Commitment Title *' : 'Task / Errand Description *'}
            </label>
            {!isManuallySelected && activeMatch && (
              <span style={{ fontSize: '0.72rem', color: 'var(--saffron-ember)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Sparkles size={11} />
                <span>Auto-detected as {activeMatch === 'DEEP_WORK' ? 'Deep Focus' : 'Routine'}</span>
              </span>
            )}
          </div>
          <input
            type="text"
            className="input-field"
            placeholder={category === 'DEEP_WORK' ? 'e.g. Implement Payment Idempotency Endpoint' : 'e.g. Go to market, haircut, pay electricity bill'}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
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
