import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  X, 
  TrendingDown, 
  Timer, 
  Brain, 
  Moon, 
  Calendar, 
  Zap,
  MessageSquarePlus,
  Check,
  Activity
} from 'lucide-react';
import { PlanStressTestResponse, OptimizedTaskProposal, aiApi } from '../../api/aiApi';
import { useToast } from '../../context/ToastContext';

interface PlanStressTestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stressTestData: PlanStressTestResponse | null;
  isLoading: boolean;
  onPlanApplied: () => void;
  onReStressTest: (defenseText?: string, override?: boolean) => void;
}

export const PlanStressTestDrawer: React.FC<PlanStressTestDrawerProps> = ({
  isOpen,
  onClose,
  stressTestData,
  isLoading,
  onPlanApplied,
  onReStressTest,
}) => {
  const { showToast } = useToast();
  const [showDefenseInput, setShowDefenseInput] = useState(false);
  const [defenseText, setDefenseText] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyingSingleId, setApplyingSingleId] = useState<string | null>(null);
  const [proposals, setProposals] = useState<OptimizedTaskProposal[]>([]);

  useEffect(() => {
    if (stressTestData?.proposedOptimizations) {
      const cloned = JSON.parse(JSON.stringify(stressTestData.proposedOptimizations));
      cloned.forEach((p: OptimizedTaskProposal) => {
        if (p.splitBlocks) {
          p.splitBlocks.forEach((b: any) => {
            b.scheduleTomorrow = false; // Default to Today
          });
        }
      });
      setProposals(cloned);
    }
  }, [stressTestData]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const data = stressTestData;

  const handleToggleSplitSchedule = (proposalIdx: number, scheduleTomorrow: boolean) => {
    setProposals(prev => {
      const copy = [...prev];
      const target = { ...copy[proposalIdx] };
      if (target.splitBlocks) {
        target.splitBlocks = target.splitBlocks.map((b, idx) => {
          if (idx === 0) return b; // Part 1 stays on Today
          return { ...b, scheduleTomorrow };
        });
      }
      copy[proposalIdx] = target;
      return copy;
    });
  };

  const handleRecalculateChunkSize = (proposalIdx: number, chunkSize: number) => {
    setProposals(prev => {
      const copy = [...prev];
      const target = { ...copy[proposalIdx] };
      const totalMinutes = target.currentMinutes;
      const willScheduleTomorrow = target.splitBlocks?.[1]?.scheduleTomorrow ?? false;

      const newBlocks: { blockIndex: number; title: string; minutes: number; scheduleTomorrow: boolean }[] = [];
      let remaining = totalMinutes;
      let partNum = 1;
      while (remaining > 0) {
        const size = Math.min(remaining, chunkSize);
        newBlocks.push({
          blockIndex: partNum,
          title: `Part ${partNum}: ${target.currentTitle}`,
          minutes: size,
          scheduleTomorrow: partNum > 1 ? willScheduleTomorrow : false,
        });
        remaining -= size;
        partNum++;
      }
      target.splitBlocks = newBlocks;
      target.proposedMinutes = newBlocks[0]?.minutes || chunkSize;
      copy[proposalIdx] = target;
      return copy;
    });
  };

  const handleToggleShiftAction = (proposalIdx: number, shouldShift: boolean) => {
    setProposals(prev => {
      const copy = [...prev];
      const target = { ...copy[proposalIdx] };
      target.suggestedAction = shouldShift ? 'SHIFT_TO_TOMORROW' : 'KEEP';
      copy[proposalIdx] = target;
      return copy;
    });
  };

  const handleApplySingleProposal = async (proposalIdx: number) => {
    const target = proposals[proposalIdx] || data?.proposedOptimizations?.[proposalIdx];
    if (!target || !target.originalCommitmentId) return;

    try {
      setApplyingSingleId(target.originalCommitmentId);
      await aiApi.applyOptimizedPlan({
        acceptedProposals: [target],
      });
      setApplyingSingleId(null);
      const isSplit = target.suggestedAction === 'SPLIT';
      showToast(isSplit ? `Split "${target.currentTitle}" into ${target.splitBlocks?.length || 2} sprints!` : 'Adjustment applied!', 'success');
      onPlanApplied();
    } catch (err) {
      console.error('Failed to apply proposal', err);
      setApplyingSingleId(null);
      showToast('Could not apply adjustment', 'error');
    }
  };

  const handleApplyOptimizations = async () => {
    const toApply = proposals.length > 0 ? proposals : data?.proposedOptimizations;
    if (!toApply || toApply.length === 0) {
      onClose();
      return;
    }
    try {
      setIsApplying(true);
      await aiApi.applyOptimizedPlan({
        acceptedProposals: toApply,
      });
      setIsApplying(false);
      showToast('Selected plan adjustments applied!', 'success');
      onPlanApplied();
      onClose();
    } catch (err) {
      console.error('Failed to apply optimized plan', err);
      setIsApplying(false);
      showToast('Could not apply plan adjustments', 'error');
    }
  };

  const handleSendDefense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defenseText.trim()) return;
    onReStressTest(defenseText.trim(), false);
    setShowDefenseInput(false);
    setDefenseText('');
  };

  const handleKeepOriginal = () => {
    showToast(`Proceeding with your original ${data?.plannedHours || ''}h plan. Have a productive day!`, 'info');
    onClose();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return '#F87171';
      case 'MODERATE':
        return 'var(--saffron-ember)';
      default:
        return '#4ADE80';
    }
  };

  const currentProposals = proposals.length > 0 ? proposals : (data?.proposedOptimizations || []);
  const hasOptimizations = currentProposals.some(p => 
    p.suggestedAction === 'TRIM' || p.suggestedAction === 'SPLIT' || p.suggestedAction === 'SHIFT_TO_TOMORROW'
  );

  const rebalancedCount = currentProposals.filter(p => p.suggestedAction === 'SHIFT_TO_TOMORROW').length;
  const splitCount = currentProposals.filter(p => p.suggestedAction === 'SPLIT').length;

  const dynamicTotalOptimizedMinutes = currentProposals.reduce((sum, prop) => {
    if (prop.suggestedAction === 'SHIFT_TO_TOMORROW') {
      return sum;
    }
    if (prop.suggestedAction === 'SPLIT' && prop.splitBlocks && prop.splitBlocks.length > 0) {
      const todayMinutes = prop.splitBlocks
        .filter(b => !b.scheduleTomorrow)
        .reduce((bSum, b) => bSum + b.minutes, 0);
      return sum + todayMinutes;
    }
    if (prop.suggestedAction === 'TRIM') {
      return sum + (prop.proposedMinutes || prop.currentMinutes);
    }
    return sum + prop.currentMinutes;
  }, 0);
  const dynamicOptimizedHours = Math.round((dynamicTotalOptimizedMinutes / 60.0) * 10.0) / 10.0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 7, 5, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          background: 'linear-gradient(180deg, var(--bg-walnut-card) 0%, var(--bg-walnut-deep) 100%)',
          borderLeft: '1px solid var(--border-copper-subtle)',
          boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-walnut-faint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(30, 20, 16, 0.8), rgba(20, 13, 10, 0.95))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 2px 10px rgba(192, 83, 48, 0.4)',
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-kehwa-cream)' }}>
                  Plan Feasibility Audit
                </h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(226, 149, 59, 0.15)',
                    color: 'var(--saffron-ember)',
                    fontWeight: 700,
                    border: '1px solid rgba(226, 149, 59, 0.3)',
                  }}
                >
                  AI Chief of Staff
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
                Cognitive load verification & focus protection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-outline"
            style={{
              width: '32px',
              height: '32px',
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-walnut-faint)',
              color: 'var(--text-parchment-muted)',
              cursor: 'pointer',
            }}
            title="Close Audit Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div
                className="spinner"
                style={{
                  width: '38px',
                  height: '38px',
                  border: '3px solid rgba(226, 149, 59, 0.2)',
                  borderTopColor: 'var(--saffron-ember)',
                  borderRadius: '50%',
                  margin: '0 auto 16px auto',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <p style={{ fontWeight: '600', color: 'var(--text-kehwa-cream)', marginBottom: '4px' }}>
                Verifying commitments against 7-day velocity...
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-tweed-dim)' }}>
                Evaluating cognitive capacity, task sizing, and momentum health.
              </p>
            </div>
          ) : data ? (
            <>
              {/* Capacity & Risk Card */}
              <div
                style={{
                  background: 'rgba(28, 21, 16, 0.75)',
                  border: '1px solid var(--border-walnut-faint)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: `${getRiskColor(data.riskLevel)}20`,
                      color: getRiskColor(data.riskLevel),
                      fontWeight: '800',
                      border: `1px solid ${getRiskColor(data.riskLevel)}40`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Activity size={12} />
                    <span>{data.riskScore}% {data.riskLevel} RISK</span>
                  </span>

                  {data.optimizedHours < data.plannedHours && (
                    <span style={{ fontSize: '0.74rem', color: '#4ADE80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingDown size={13} />
                      <span>Optimizes to {data.optimizedHours}h (94% win rate)</span>
                    </span>
                  )}
                </div>

                {/* Capacity Progress Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-parchment-muted)' }}>
                      Planned: <strong style={{ color: 'var(--saffron-ember)' }}>{data.plannedHours}h</strong>
                    </span>
                    <span style={{ color: 'var(--text-tweed-dim)' }}>
                      7-Day Proven Capacity: <strong>{data.historicalCapacityHours}h</strong>
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min((data.plannedHours / Math.max(data.plannedHours, data.historicalCapacityHours * 1.5)) * 100, 100)}%`,
                        background:
                          data.plannedHours > data.historicalCapacityHours
                            ? 'linear-gradient(90deg, var(--saffron-ember), var(--chinar-rust))'
                            : 'linear-gradient(90deg, var(--pine-emerald), #4ADE80)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Summary */}
              <div
                style={{
                  background: 'rgba(226, 149, 59, 0.06)',
                  borderLeft: '3px solid var(--saffron-ember)',
                  borderRight: '1px solid rgba(226, 149, 59, 0.15)',
                  borderTop: '1px solid rgba(226, 149, 59, 0.15)',
                  borderBottom: '1px solid rgba(226, 149, 59, 0.15)',
                  padding: '12px 14px',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                }}
              >
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--saffron-ember)', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldAlert size={12} />
                  <span>Executive Diagnostic</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: '1.55', color: 'var(--text-kehwa-cream)' }}>
                  "{data.plannedHours <= data.historicalCapacityHours && data.diagnosticSummary?.toLowerCase().includes('exceeds')
                    ? `Your planned load of ${data.plannedHours}h sits comfortably within your 7-day average focus capacity (${data.historicalCapacityHours}h). High probability of strong follow-through today.`
                    : data.diagnosticSummary}"
                </p>
                {data.defenseFeedback && (
                  <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.76rem', color: '#4ADE80', fontWeight: '600' }}>
                    ✓ {data.defenseFeedback}
                  </div>
                )}
              </div>

              {/* Quick Defense Sparring Box */}
              <div>
                {!showDefenseInput ? (
                  <button
                    type="button"
                    onClick={() => setShowDefenseInput(true)}
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      border: '1px dashed var(--border-copper-subtle)',
                      background: 'transparent',
                    }}
                  >
                    <MessageSquarePlus size={14} color="var(--saffron-ember)" />
                    <span>Spar with Chief of Staff / Add Context</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleSendDefense}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      background: 'rgba(20, 15, 12, 0.6)',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-copper-subtle)',
                    }}
                  >
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-parchment-muted)', fontWeight: 600 }}>
                      Explain context (e.g. "DSA is 80% done, only need 15m"):
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Type quick defense..."
                        value={defenseText}
                        onChange={(e) => setDefenseText(e.target.value)}
                        style={{ flex: 1, fontSize: '0.80rem', padding: '6px 10px' }}
                        autoFocus
                      />
                      <button type="submit" className="btn-primary" style={{ padding: '0 12px', fontSize: '0.78rem' }}>
                        <Send size={12} />
                      </button>
                      <button type="button" onClick={() => setShowDefenseInput(false)} className="btn-secondary" style={{ padding: '0 8px', fontSize: '0.78rem' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Action Plan Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--saffron-ember)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={13} />
                    <span>Proposed De-Risk Blueprint</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
                    {currentProposals.length} tasks
                  </span>
                </div>

                {currentProposals.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentProposals.map((prop: OptimizedTaskProposal, idx: number) => {
                      const isSplit = prop.suggestedAction === 'SPLIT';
                      const isTrim = prop.suggestedAction === 'TRIM';
                      const isShift = prop.suggestedAction === 'SHIFT_TO_TOMORROW';
                      const isKeep = prop.suggestedAction === 'KEEP';
                      const hasSplitBlocks = isSplit && prop.splitBlocks && prop.splitBlocks.length > 1;

                      return (
                        <div
                          key={idx}
                          style={{
                            background: isShift
                              ? 'rgba(192, 83, 48, 0.08)'
                              : isSplit
                                ? 'rgba(226, 149, 59, 0.06)'
                                : 'var(--bg-walnut-surface)',
                            border: `1px solid ${isShift ? 'rgba(248, 113, 113, 0.35)' : isSplit ? 'rgba(226, 149, 59, 0.3)' : 'var(--border-walnut-faint)'}`,
                            borderRadius: 'var(--radius-sm)',
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                                {isSplit && (
                                  <span className="badge" style={{ fontSize: '10px', background: 'rgba(226, 149, 59, 0.15)', color: 'var(--saffron-ember)', border: '1px solid rgba(226, 149, 59, 0.35)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Zap size={10} />
                                    <span>SPLIT ({prop.splitBlocks?.length || 2} SPRINTS)</span>
                                  </span>
                                )}
                                {isTrim && (
                                  <span className="badge badge-postponed" style={{ fontSize: '10px' }}>
                                    TRIMMED
                                  </span>
                                )}
                                {isShift && (
                                  <span className="badge" style={{ fontSize: '10px', background: 'rgba(248, 113, 113, 0.15)', color: '#F87171', border: '1px solid rgba(248, 113, 113, 0.3)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Moon size={10} />
                                    <span>SHIFT TO TOMORROW</span>
                                  </span>
                                )}
                                {isKeep && (
                                  <span className="badge badge-completed" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Check size={10} />
                                    <span>KEPT AS-IS</span>
                                  </span>
                                )}
                                <strong style={{ fontSize: '0.84rem', color: 'var(--text-kehwa-cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {prop.currentTitle}
                                </strong>
                              </div>

                              <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--text-parchment-muted)', lineHeight: 1.35 }}>
                                {prop.reasoning}
                              </p>
                            </div>

                            <div style={{ textAlign: 'right', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700' }}>
                                <span style={{ color: isShift ? '#F87171' : isTrim || isSplit ? 'var(--text-tweed-dim)' : '#4ADE80', textDecoration: isTrim || isShift || isSplit ? 'line-through' : 'none' }}>
                                  {prop.currentMinutes}m
                                </span>
                                {(isTrim || isSplit) && (
                                  <>
                                    <ArrowRight size={10} style={{ color: 'var(--saffron-ember)' }} />
                                    <span style={{ color: 'var(--saffron-ember)' }}>{prop.proposedMinutes}m</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Interactive Sprints Breakdown for SPLIT */}
                          {hasSplitBlocks && (
                            <div
                              style={{
                                padding: '8px',
                                background: 'var(--bg-walnut-card)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-walnut-faint)',
                                marginTop: '2px',
                              }}
                            >
                              {/* Cadence Preset Pills */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.70rem', color: 'var(--text-parchment-muted)', fontWeight: 600 }}>Cadence:</span>
                                {[25, 45, 60].map(mins => {
                                  const currentChunk = prop.splitBlocks?.[0]?.minutes || 45;
                                  const isSelected = currentChunk === mins || (![25, 45, 60].includes(currentChunk) && mins === 45);
                                  return (
                                    <button
                                      key={mins}
                                      type="button"
                                      onClick={() => handleRecalculateChunkSize(idx, mins)}
                                      className={`btn-pill ${isSelected ? 'active' : ''}`}
                                      style={{ padding: '2px 7px', fontSize: '0.72rem' }}
                                    >
                                      {mins === 25 && <Timer size={10} />}
                                      {mins === 45 && <Zap size={10} />}
                                      {mins === 60 && <Brain size={10} />}
                                      <span>{mins}m</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Sprint blocks chips */}
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                {prop.splitBlocks!.map((b, bIdx) => {
                                  const isTomorrow = b.scheduleTomorrow && bIdx > 0;
                                  return (
                                    <span
                                      key={bIdx}
                                      style={{
                                        fontSize: '0.70rem',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        background: bIdx === 0
                                          ? 'rgba(74, 222, 128, 0.15)'
                                          : isTomorrow
                                            ? 'rgba(248, 113, 113, 0.18)'
                                            : 'rgba(226, 149, 59, 0.16)',
                                        color: bIdx === 0
                                          ? '#4ADE80'
                                          : isTomorrow
                                            ? '#F87171'
                                            : 'var(--saffron-ember)',
                                        border: `1px solid ${bIdx === 0 ? 'rgba(74, 222, 128, 0.35)' : isTomorrow ? 'rgba(248, 113, 113, 0.35)' : 'rgba(226, 149, 59, 0.4)'}`,
                                      }}
                                    >
                                      <strong>{b.title}</strong>: {b.minutes}m {bIdx === 0 ? '(Today)' : isTomorrow ? '(Tomorrow)' : '(Today)'}
                                    </span>
                                  );
                                })}
                              </div>

                              {/* Destination toggle for Part 2+ and Independent Apply Button */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap', paddingTop: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.70rem', color: 'var(--text-parchment-muted)', fontWeight: 600 }}>Part 2+:</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSplitSchedule(idx, false)}
                                    className={`btn-pill ${!prop.splitBlocks![1]?.scheduleTomorrow ? 'active' : ''}`}
                                    style={{ padding: '2px 7px', fontSize: '0.70rem' }}
                                  >
                                    <Calendar size={10} />
                                    <span>Keep Today</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSplitSchedule(idx, true)}
                                    className={`btn-pill ${prop.splitBlocks![1]?.scheduleTomorrow ? 'active' : ''}`}
                                    style={{ padding: '2px 7px', fontSize: '0.70rem' }}
                                  >
                                    <Moon size={10} />
                                    <span>Move Tomorrow</span>
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleApplySingleProposal(idx)}
                                  disabled={applyingSingleId === prop.originalCommitmentId || isApplying}
                                  className="btn-primary"
                                  style={{
                                    padding: '4px 10px',
                                    fontSize: '0.74rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                                    boxShadow: '0 2px 6px rgba(192, 83, 48, 0.3)',
                                  }}
                                  title="Split this task immediately without affecting other tasks"
                                >
                                  <Zap size={11} />
                                  <span>{applyingSingleId === prop.originalCommitmentId ? 'Splitting...' : `Split This Task Only`}</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Independent Controls for SHIFT_TO_TOMORROW / Rebalance */}
                          {(isShift || (prop.originalCommitmentId && data?.proposedOptimizations?.some(p => p.originalCommitmentId === prop.originalCommitmentId && p.suggestedAction === 'SHIFT_TO_TOMORROW'))) && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleShiftAction(idx, true)}
                                  className={`btn-pill ${isShift ? 'active' : ''}`}
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '0.70rem',
                                    background: isShift ? 'rgba(248, 113, 113, 0.2)' : 'transparent',
                                    color: isShift ? '#F87171' : 'var(--text-parchment-muted)',
                                    borderColor: isShift ? 'rgba(248, 113, 113, 0.4)' : 'var(--border-walnut-faint)',
                                  }}
                                >
                                  <Moon size={10} />
                                  <span>Shift to Tomorrow</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleShiftAction(idx, false)}
                                  className={`btn-pill ${!isShift ? 'active' : ''}`}
                                  style={{
                                    padding: '2px 8px',
                                    fontSize: '0.70rem',
                                    background: !isShift ? 'rgba(74, 222, 128, 0.2)' : 'transparent',
                                    color: !isShift ? '#4ADE80' : 'var(--text-parchment-muted)',
                                    borderColor: !isShift ? 'rgba(74, 222, 128, 0.4)' : 'var(--border-walnut-faint)',
                                  }}
                                >
                                  <Check size={10} />
                                  <span>Keep on Today</span>
                                </button>
                              </div>

                              {isShift && (
                                <button
                                  type="button"
                                  onClick={() => handleApplySingleProposal(idx)}
                                  disabled={applyingSingleId === prop.originalCommitmentId || isApplying}
                                  className="btn-secondary"
                                  style={{
                                    padding: '3px 8px',
                                    fontSize: '0.70rem',
                                    color: '#F87171',
                                    border: '1px solid rgba(248, 113, 113, 0.35)',
                                    background: 'rgba(248, 113, 113, 0.1)',
                                  }}
                                  title="Postpone this task to tomorrow immediately"
                                >
                                  <span>{applyingSingleId === prop.originalCommitmentId ? 'Moving...' : 'Shift to Tomorrow Now'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-tweed-dim)', fontSize: '0.80rem' }}>No commitments to optimize.</p>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Drawer Sticky Footer Actions */}
        {data && !isLoading && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-walnut-faint)',
              background: 'linear-gradient(180deg, rgba(20, 13, 10, 0.95), rgba(15, 10, 8, 1))',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-parchment-muted)' }}>
              {hasOptimizations ? (
                <span style={{ color: 'var(--saffron-ember)', fontWeight: 600 }}>
                  💡 {rebalancedCount > 0 ? `${rebalancedCount} shifted` : ''} {splitCount > 0 ? `${splitCount} split into sprints` : ''}
                </span>
              ) : (
                <span style={{ color: '#4ADE80', fontWeight: 600 }}>✓ All commitments sized within capacity</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {hasOptimizations ? (
                <>
                  <button
                    type="button"
                    onClick={handleKeepOriginal}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      fontSize: '0.80rem',
                      fontWeight: '600',
                      color: 'var(--text-kehwa-cream)',
                      border: '1px solid var(--border-walnut-faint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                    title="Keep full plan without adjustments"
                  >
                    <span>Keep {data.plannedHours}h</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyOptimizations}
                    disabled={isApplying}
                    className="btn-primary"
                    style={{
                      flex: 2,
                      padding: '9px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontWeight: '700',
                      fontSize: '0.84rem',
                      background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                      boxShadow: '0 2px 10px rgba(192, 83, 48, 0.35)',
                    }}
                  >
                    <Sparkles size={14} />
                    <span>{isApplying ? 'Applying...' : `Apply Selected Plan (${dynamicOptimizedHours}h)`}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '9px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontWeight: '700',
                    fontSize: '0.84rem',
                    background: 'linear-gradient(135deg, #2E7D52, #1B5E38)',
                    borderColor: 'rgba(74, 222, 128, 0.4)',
                  }}
                >
                  <CheckCircle2 size={14} color="#4ADE80" />
                  <span>Plan Verified • Proceed with Day</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
