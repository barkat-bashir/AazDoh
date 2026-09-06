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
      title="Create Commitment"
      subtitle="Lock in your promise for today"
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Top: Compact Work Mode Segmented Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-walnut-surface)',
          padding: '3px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-walnut-faint)',
          gap: '4px',
        }}>
          <button
            type="button"
            onClick={() => handleCategoryChange('DEEP_WORK')}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: '5px',
              border: 'none',
              background: category === 'DEEP_WORK' ? 'linear-gradient(135deg, var(--chinar-rust), #8A3016)' : 'transparent',
              color: category === 'DEEP_WORK' ? '#fff' : 'var(--text-tweed-dim)',
              fontSize: '0.82rem',
              fontWeight: category === 'DEEP_WORK' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'var(--transition-smooth)',
              boxShadow: category === 'DEEP_WORK' ? '0 2px 8px var(--chinar-glow)' : 'none',
            }}
          >
            <Target size={14} />
            <span>🎯 Deep Focus</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange('ROUTINE')}
            style={{
              flex: 1,
              padding: '7px 10px',
              borderRadius: '5px',
              border: 'none',
              background: category === 'ROUTINE' ? 'rgba(226, 149, 59, 0.22)' : 'transparent',
              color: category === 'ROUTINE' ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
              fontSize: '0.82rem',
              fontWeight: category === 'ROUTINE' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'var(--transition-smooth)',
              borderWidth: category === 'ROUTINE' ? '1px' : '0',
              borderStyle: 'solid',
              borderColor: category === 'ROUTINE' ? 'var(--saffron-ember)' : 'transparent',
            }}
          >
            <CheckCircle2 size={14} />
            <span>⚡ Routine / Errand</span>
          </button>
        </div>

        {/* Primary Title Input */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
              {category === 'DEEP_WORK' ? 'What will you focus on?' : 'Task / Errand Description'}
            </label>
            {!isManuallySelected && activeMatch && (
              <span style={{ fontSize: '0.72rem', color: 'var(--saffron-ember)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Sparkles size={11} />
                <span>Auto-detected: {activeMatch === 'DEEP_WORK' ? 'Deep Focus' : 'Routine'}</span>
              </span>
            )}
          </div>
          <input
            type="text"
            className="input-field"
            placeholder={category === 'DEEP_WORK' ? 'e.g. Implement Payment Idempotency Endpoint' : 'e.g. Haircut, market groceries, pay bills'}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            autoFocus
            required
            style={{ fontSize: '0.96rem', padding: '10px 14px' }}
          />
        </div>

        {/* Definition of Done (Only shown for Deep Work) */}
        {category === 'DEEP_WORK' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-parchment-muted)', marginBottom: '4px' }}>
              Deliverable / Definition of Done <span style={{ color: 'var(--text-tweed-dim)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. All unit tests passing & endpoint merged"
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              style={{ fontSize: '0.84rem', padding: '8px 12px' }}
            />
          </div>
        )}

        {/* Time & Priority Grid (2 columns side by side) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Estimated Time */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '5px' }}>
              <Clock size={12} color="var(--saffron-ember)" />
              <span>{category === 'DEEP_WORK' ? 'Focus Duration' : 'Duration'}</span>
            </label>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {focusOptions.map((opt) => {
                const isSelected = estimatedMinutes === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEstimatedMinutes(opt.value)}
                    style={{
                      flex: '1 1 auto',
                      minWidth: '38px',
                      padding: '5px 6px',
                      borderRadius: '5px',
                      fontSize: '0.76rem',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? 'var(--chinar-rust)' : 'var(--bg-walnut-card)',
                      color: isSelected ? '#fff' : 'var(--text-parchment-muted)',
                      border: `1px solid ${isSelected ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '5px' }}>
              <Flame size={12} color="var(--chinar-rust)" />
              <span>Priority</span>
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    style={{
                      flex: 1,
                      padding: '5px 4px',
                      borderRadius: '5px',
                      fontSize: '0.76rem',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? 'var(--bg-walnut-surface)' : 'var(--bg-walnut-card)',
                      color: isSelected ? opt.color : 'var(--text-tweed-dim)',
                      border: `1px solid ${isSelected ? opt.color : 'var(--border-walnut-faint)'}`,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Accountability Visibility (Compact Single Line) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          background: 'var(--bg-walnut-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-walnut-faint)',
          fontSize: '0.78rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-parchment-muted)' }}>
            <Shield size={13} color="var(--saffron-ember)" />
            <span>Accountability:</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setVisibility('SHARED_WITH_PARTNER')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.74rem',
                fontWeight: visibility === 'SHARED_WITH_PARTNER' ? 700 : 500,
                background: visibility === 'SHARED_WITH_PARTNER' ? 'rgba(192, 83, 48, 0.25)' : 'transparent',
                color: visibility === 'SHARED_WITH_PARTNER' ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
                border: `1px solid ${visibility === 'SHARED_WITH_PARTNER' ? 'var(--chinar-rust)' : 'transparent'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Users size={12} />
              <span>Partners</span>
            </button>

            <button
              type="button"
              onClick={() => setVisibility('PRIVATE')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.74rem',
                fontWeight: visibility === 'PRIVATE' ? 700 : 500,
                background: visibility === 'PRIVATE' ? 'rgba(226, 149, 59, 0.2)' : 'transparent',
                color: visibility === 'PRIVATE' ? 'var(--text-kehwa-cream)' : 'var(--text-tweed-dim)',
                border: `1px solid ${visibility === 'PRIVATE' ? 'var(--border-copper-subtle)' : 'transparent'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Lock size={12} />
              <span>Private</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-walnut-faint)',
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
            <kbd style={{ padding: '1px 4px', borderRadius: '3px', background: 'var(--bg-walnut-card)', border: '1px solid var(--border-walnut-faint)', fontSize: '0.7rem' }}>Ctrl</kbd> + <kbd style={{ padding: '1px 4px', borderRadius: '3px', background: 'var(--bg-walnut-card)', border: '1px solid var(--border-walnut-faint)', fontSize: '0.7rem' }}>Enter</kbd> to save
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '7px 12px', fontSize: '0.82rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ padding: '7px 16px', fontSize: '0.82rem', fontWeight: 700 }}
            >
              <Sparkles size={14} />
              <span>{loading ? 'Saving...' : 'Commit to Today'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
