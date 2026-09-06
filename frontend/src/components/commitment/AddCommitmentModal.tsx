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
  const [visibility, setVisibility] = useState<CommitmentVisibility>('SHARED_WITH_PARTNER');
  const [activeMenu, setActiveMenu] = useState<'category' | 'duration' | 'priority' | 'visibility' | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsManuallySelected(false);
      setActiveMatch(null);
      setCategory('DEEP_WORK');
      setEstimatedMinutes(60);
      setPriority('MEDIUM');
      setShowDeliverable(false);
      setExpectedOutcome('');
      setTitle('');
      setActiveMenu(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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

  const handleCategoryChange = (newCat: CommitmentCategory) => {
    setIsManuallySelected(true);
    setCategory(newCat);
    if (newCat === 'ROUTINE' && estimatedMinutes > 45) {
      setEstimatedMinutes(15);
    } else if (newCat === 'DEEP_WORK' && estimatedMinutes < 30) {
      setEstimatedMinutes(60);
    }
    setActiveMenu(null);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isManuallySelected) {
      if (val.trim().length >= 2) {
        const result = classifyCommitmentIntent(val);
        if (result.isMatched) {
          setActiveMatch(result.category);
          setCategory(result.category);
        } else {
          setActiveMatch(null);
        }
      } else {
        setActiveMatch(null);
      }
    }
  };

  const priorityConfig: Record<CommitmentPriority, { label: string; color: string }> = {
    LOW: { label: 'Low', color: 'var(--text-parchment-muted)' },
    MEDIUM: { label: 'Med', color: 'var(--saffron-ember)' },
    HIGH: { label: 'High', color: 'var(--chinar-rust)' },
    URGENT: { label: 'Urgent', color: '#F87171' },
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
      });

      showToast('Commitment created successfully', 'success');
      setTitle('');
      setCategory('DEEP_WORK');
      setExpectedOutcome('');
      setEstimatedMinutes(60);
      setPriority('MEDIUM');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Add Commitment"
      subtitle="Type your task & press Enter to commit"
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        <div style={{
          background: 'var(--bg-walnut-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--border-walnut-faint)',
          padding: '12px 14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          transition: 'border-color 0.2s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: category === 'DEEP_WORK' ? 'var(--chinar-rust)' : 'var(--saffron-ember)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {category === 'DEEP_WORK' ? <Target size={12} /> : <Zap size={12} />}
              {category === 'DEEP_WORK' ? 'Deep Focus' : 'Routine / Errand'}
            </span>

            {!isManuallySelected && activeMatch && (
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--saffron-ember)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: 'rgba(226, 149, 59, 0.12)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                <Sparkles size={11} />
                <span>Auto-detected</span>
              </span>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder={category === 'DEEP_WORK' ? 'What focus task are you locking in? (e.g. Implement auth API)' : 'What errand or chore? (e.g. Buy groceries, haircut)'}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-kehwa-cream)',
              fontSize: '1.05rem',
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          />

          {showDeliverable && (
            <div style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px dashed var(--border-walnut-faint)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tweed-dim)', whiteSpace: 'nowrap' }}>Deliverable:</span>
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
                  color: 'var(--text-parchment-muted)',
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

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '6px',
          padding: '4px 2px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleCategoryChange(category === 'DEEP_WORK' ? 'ROUTINE' : 'DEEP_WORK')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 9px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: category === 'DEEP_WORK' ? 'rgba(192, 83, 48, 0.18)' : 'rgba(226, 149, 59, 0.18)',
                color: category === 'DEEP_WORK' ? 'var(--chinar-rust)' : 'var(--saffron-ember)',
                border: `1px solid ${category === 'DEEP_WORK' ? 'rgba(192, 83, 48, 0.4)' : 'rgba(226, 149, 59, 0.4)'}`,
                transition: 'all 0.15s ease',
              }}
              title="Click to toggle Focus vs Routine mode"
            >
              {category === 'DEEP_WORK' ? <Target size={12} /> : <Zap size={12} />}
              <span>{category === 'DEEP_WORK' ? 'Deep Focus' : 'Routine'}</span>
            </button>

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'duration' ? null : 'duration')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 9px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'var(--bg-walnut-surface)',
                  color: 'var(--text-parchment-muted)',
                  border: '1px solid var(--border-walnut-faint)',
                }}
              >
                <Clock size={12} color="var(--saffron-ember)" />
                <span>{formatDurationLabel(estimatedMinutes)}</span>
                <ChevronDown size={11} opacity={0.6} />
              </button>

              {activeMenu === 'duration' && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  zIndex: 100,
                  background: 'var(--bg-walnut-card)',
                  border: '1px solid var(--border-walnut-faint)',
                  borderRadius: '6px',
                  padding: '4px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  display: 'flex',
                  gap: '4px',
                  minWidth: '220px',
                  flexWrap: 'wrap'
                }}>
                  {focusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setEstimatedMinutes(opt.value); setActiveMenu(null); }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        fontWeight: estimatedMinutes === opt.value ? 700 : 500,
                        background: estimatedMinutes === opt.value ? 'var(--chinar-rust)' : 'transparent',
                        color: estimatedMinutes === opt.value ? '#fff' : 'var(--text-parchment-muted)',
                        border: 'none',
                        cursor: 'pointer',
                        flex: '1 1 auto',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'priority' ? null : 'priority')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 9px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'var(--bg-walnut-surface)',
                  color: priorityConfig[priority].color,
                  border: '1px solid var(--border-walnut-faint)',
                }}
              >
                <Flame size={12} color={priorityConfig[priority].color} />
                <span>{priorityConfig[priority].label}</span>
                <ChevronDown size={11} opacity={0.6} />
              </button>

              {activeMenu === 'priority' && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  zIndex: 100,
                  background: 'var(--bg-walnut-card)',
                  border: '1px solid var(--border-walnut-faint)',
                  borderRadius: '6px',
                  padding: '4px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  display: 'flex',
                  gap: '4px',
                }}>
                  {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as CommitmentPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setPriority(p); setActiveMenu(null); }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
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

            <button
              type="button"
              onClick={() => setVisibility(visibility === 'SHARED_WITH_PARTNER' ? 'PRIVATE' : 'SHARED_WITH_PARTNER')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 9px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: 'pointer',
                background: 'var(--bg-walnut-surface)',
                color: visibility === 'SHARED_WITH_PARTNER' ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
                border: '1px solid var(--border-walnut-faint)',
              }}
              title="Click to toggle Partner vs Private"
            >
              {visibility === 'SHARED_WITH_PARTNER' ? <Users size={12} /> : <Lock size={12} />}
              <span>{visibility === 'SHARED_WITH_PARTNER' ? 'Shared' : 'Private'}</span>
            </button>

            {!showDeliverable && category === 'DEEP_WORK' && (
              <button
                type="button"
                onClick={() => setShowDeliverable(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: 'var(--text-tweed-dim)',
                  border: '1px dashed var(--border-walnut-faint)',
                }}
              >
                <Plus size={11} />
                <span>Deliverable</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tweed-dim)',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Esc
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '6px',
                background: title.trim() ? 'var(--chinar-rust)' : 'var(--bg-walnut-card)',
                color: title.trim() ? '#fff' : 'var(--text-tweed-dim)',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: title.trim() ? 'pointer' : 'not-allowed',
                boxShadow: title.trim() ? '0 2px 8px var(--chinar-glow)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{loading ? 'Saving...' : 'Commit'}</span>
              <kbd style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '1px 4px',
                borderRadius: '3px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}>↵</kbd>
            </button>
          </div>
        </div>

      </form>
    </Modal>
  );
};
