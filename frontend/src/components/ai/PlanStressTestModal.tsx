import React, { useState } from 'react';
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
  Flame,
  Check,
  Activity,
  AlertCircle
} from 'lucide-react';
import { PlanStressTestResponse, OptimizedTaskProposal, aiApi } from '../../api/aiApi';
import { useToast } from '../../context/ToastContext';

interface PlanStressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  stressTestData: PlanStressTestResponse | null;
  isLoading: boolean;
  onPlanApplied: () => void;
  onReStressTest: (defenseText?: string, override?: boolean) => void;
}

export const PlanStressTestModal: React.FC<PlanStressTestModalProps> = ({
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
  const [proposals, setProposals] = useState<OptimizedTaskProposal[]>([]);

  React.useEffect(() => {
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

  if (!isOpen) return null;

  const data = stressTestData;

  const handleToggleSplitSchedule = (proposalIdx: number, scheduleTomorrow: boolean) => {
    setProposals(prev => {
      const copy = [...prev];
      const target = { ...copy[proposalIdx] };
      if (target.splitBlocks) {
        target.splitBlocks = target.splitBlocks.map((b, idx) => {
          if (idx === 0) return b; // Part 1 always stays on Today
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
      showToast('Plan optimized and scheduled!', 'success');
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

  return (
    <div className="modal-backdrop" style={{ zIndex: 99999, backdropFilter: 'blur(8px)', backgroundColor: 'rgba(10, 7, 5, 0.75)' }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '920px', 
          width: '96%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, var(--bg-walnut-card) 0%, var(--bg-walnut-deep) 100%)',
          border: '1px solid rgba(226, 149, 59, 0.25)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 30px rgba(192, 83, 48, 0.15)',
          padding: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-walnut-faint)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(192, 83, 48, 0.4)',
                flexShrink: 0,
              }}
            >
              <Sparkles size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text-kehwa-cream)' }}>
                  Plan Feasibility Check
                </h3>
                <span style={{ fontSize: '0.72rem', background: 'rgba(226, 149, 59, 0.15)', color: 'var(--saffron-ember)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700, border: '1px solid rgba(226, 149, 59, 0.3)' }}>
                  AI Verification
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.80rem', color: 'var(--text-parchment-muted)' }}>
                Real-time capacity verification & workload rebalancing against your 7-day velocity.
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
              cursor: 'pointer' 
            }}
          >
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div 
              className="spinner" 
              style={{ 
                width: '42px', 
                height: '42px', 
                border: '3px solid rgba(226, 149, 59, 0.2)', 
                borderTopColor: 'var(--saffron-ember)',
                borderRadius: '50%',
                margin: '0 auto 16px auto',
                animation: 'spin 0.8s linear infinite'
              }} 
            />
            <p style={{ fontWeight: '600', color: 'var(--text-kehwa-cream)', marginBottom: '4px' }}>
              Verifying today's commitments against focus capacity...
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tweed-dim)' }}>
              Evaluating task sizing, postponement fatigue, and peak energy limits.
            </p>
          </div>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 2-Column Responsive Cockpit Grid */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
                gap: '20px', 
                alignItems: 'start' 
              }}
            >
              {/* LEFT COLUMN: Capacity & Diagnostic Intelligence */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--saffron-ember)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={14} />
                  <span>Capacity & Risk Diagnosis</span>
                </div>

                {/* Modern Capacity & Risk Gauge Card */}
                <div 
                  style={{ 
                    background: 'rgba(28, 21, 16, 0.65)', 
                    border: '1px solid var(--border-walnut-faint)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                          gap: '4px'
                        }}
                      >
                        <Activity size={12} />
                        <span>{data.riskScore}% {data.riskLevel} RISK</span>
                      </span>
                    </div>

                    {data.optimizedHours < data.plannedHours && (
                      <span style={{ fontSize: '0.74rem', color: '#4ADE80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingDown size={13} />
                        <span>Optimizes to {data.optimizedHours}h (94% win rate)</span>
                      </span>
                    )}
                  </div>

                  {/* Visual Load Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ color: 'var(--text-parchment-muted)' }}>
                        Planned: <strong style={{ color: 'var(--saffron-ember)' }}>{data.plannedHours}h</strong>
                      </span>
                      <span style={{ color: 'var(--text-tweed-dim)' }}>
                        Baseline Capacity: <strong>{data.historicalCapacityHours}h</strong>
                      </span>
                    </div>

                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min((data.plannedHours / Math.max(data.plannedHours, data.historicalCapacityHours * 1.5)) * 100, 100)}%`,
                        background: data.plannedHours > data.historicalCapacityHours 
                          ? 'linear-gradient(90deg, var(--saffron-ember), var(--chinar-rust))' 
                          : 'linear-gradient(90deg, var(--pine-emerald), #4ADE80)',
                        borderRadius: 'var(--radius-full)',
                      }} />
                    </div>
                  </div>
                </div>

                {/* AI Chief of Staff Insight Box */}
                <div 
                  style={{ 
                    background: 'rgba(226, 149, 59, 0.06)', 
                    borderLeft: '3px solid var(--saffron-ember)', 
                    borderRight: '1px solid rgba(226, 149, 59, 0.15)',
                    borderTop: '1px solid rgba(226, 149, 59, 0.15)',
                    borderBottom: '1px solid rgba(226, 149, 59, 0.15)',
                    padding: '14px 16px', 
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: '1.6', color: 'var(--text-kehwa-cream)' }}>
                    "{data.plannedHours <= data.historicalCapacityHours && data.diagnosticSummary?.toLowerCase().includes('exceeds')
                      ? `Your planned load of ${data.plannedHours}h sits comfortably within your 7-day average focus capacity (${data.historicalCapacityHours}h). High probability of strong follow-through today.`
                      : data.diagnosticSummary}"
                  </p>
                  {data.defenseFeedback && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: '#4ADE80', fontWeight: '600' }}>
                      ✓ {data.defenseFeedback}
                    </div>
                  )}
                </div>

                {/* Optional Context Drawer */}
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
                        background: 'transparent'
                      }}
                    >
                      <MessageSquarePlus size={14} color="var(--saffron-ember)" />
                      <span>Add context to re-evaluate plan</span>
                    </button>
                  ) : (
                    <form onSubmit={handleSendDefense} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(20, 15, 12, 0.5)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-copper-subtle)' }}>
                      <label style={{ fontSize: '0.74rem', color: 'var(--text-parchment-muted)', fontWeight: 600 }}>
                        Add context (e.g. "DSA is 80% finished, only need 15m"):
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input 
                          type="text"
                          className="input-field"
                          placeholder="Type quick context..."
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
              </div>

              {/* RIGHT COLUMN: Action Plan Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--saffron-ember)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} />
                    <span>Action Plan Breakdown</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)' }}>
                    {currentProposals.length} commitments
                  </span>
                </div>

                {/* Proposed Adjustments List */}
                {currentProposals.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px', paddingTop: '2px' }}>
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
                            padding: '11px 13px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            transition: 'var(--transition-smooth)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
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
                                    <span>REBALANCED TO TOMORROW</span>
                                  </span>
                                )}
                                {isKeep && (
                                  <span className="badge badge-completed" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Check size={10} />
                                    <span>KEPT AS-IS</span>
                                  </span>
                                )}
                                <strong style={{ fontSize: '0.86rem', color: 'var(--text-kehwa-cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {prop.currentTitle}
                                </strong>
                              </div>
                              
                              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-parchment-muted)', lineHeight: 1.4 }}>
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
                            <div style={{ 
                              padding: '8px 10px', 
                              background: 'var(--bg-walnut-card)', 
                              borderRadius: 'var(--radius-sm)', 
                              border: '1px solid var(--border-walnut-faint)',
                              marginTop: '2px',
                            }}>
                              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--saffron-ember)', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Zap size={12} />
                                  <span>SPRINTS ({prop.splitBlocks!.length} BLOCKS):</span>
                                </span>
                                <span style={{ color: 'var(--text-tweed-dim)', fontWeight: 500, fontSize: '0.72rem' }}>Part 1 stays on Today</span>
                              </div>

                              {/* Cadence Preset Pills */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-parchment-muted)', fontWeight: 600 }}>Cadence:</span>
                                {[25, 45, 60].map(mins => {
                                  const currentChunk = prop.splitBlocks?.[0]?.minutes || 45;
                                  const isSelected = currentChunk === mins || (![25, 45, 60].includes(currentChunk) && mins === 45);
                                  return (
                                    <button
                                      key={mins}
                                      type="button"
                                      onClick={() => handleRecalculateChunkSize(idx, mins)}
                                      className={`btn-pill ${isSelected ? 'active' : ''}`}
                                      style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                                    >
                                      {mins === 25 && <Timer size={11} />}
                                      {mins === 45 && <Zap size={11} />}
                                      {mins === 60 && <Brain size={11} />}
                                      <span>{mins === 25 ? '25m' : mins === 45 ? '45m' : '60m'}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Sprint blocks chips */}
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                {prop.splitBlocks!.map((b, bIdx) => {
                                  const isTomorrow = b.scheduleTomorrow && bIdx > 0;
                                  return (
                                    <span
                                      key={bIdx}
                                      className="sprint-chip"
                                      style={{
                                        fontSize: '0.72rem',
                                        padding: '2px 6px',
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

                              {/* Destination toggle for Part 2+ */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-parchment-muted)', fontWeight: 600 }}>Part 2+:</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSplitSchedule(idx, false)}
                                  className={`btn-pill ${!prop.splitBlocks![1]?.scheduleTomorrow ? 'active' : ''}`}
                                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                >
                                  <Calendar size={11} />
                                  <span>Keep Today</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSplitSchedule(idx, true)}
                                  className={`btn-pill ${prop.splitBlocks![1]?.scheduleTomorrow ? 'active' : ''}`}
                                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                >
                                  <Moon size={11} />
                                  <span>Move Tomorrow</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-tweed-dim)', fontSize: '0.84rem' }}>No commitments to display.</p>
                )}
              </div>
            </div>

            {/* UNIFIED DECISION ACTION FOOTER */}
            <div 
              style={{ 
                borderTop: '1px solid var(--border-walnut-faint)', 
                paddingTop: '18px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              {/* Left Context Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-parchment-muted)' }}>
                {hasOptimizations ? (
                  <>
                    <span style={{ color: 'var(--saffron-ember)', fontWeight: 600 }}>
                      💡 {rebalancedCount > 0 ? `${rebalancedCount} task rebalanced` : ''} {splitCount > 0 ? `${splitCount} task split into sprints` : ''}
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#4ADE80', fontWeight: 600 }}>✓ All commitments sized within capacity</span>
                )}
              </div>

              {/* Side-by-Side Action Button Group */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {hasOptimizations ? (
                  <>
                    <button
                      type="button"
                      onClick={handleKeepOriginal}
                      className="btn-secondary"
                      style={{ 
                        padding: '10px 18px', 
                        fontSize: '0.86rem', 
                        fontWeight: '600',
                        color: 'var(--text-kehwa-cream)',
                        border: '1px solid var(--border-copper-subtle)',
                        background: 'rgba(28, 21, 16, 0.6)',
                        cursor: 'pointer'
                      }}
                    >
                      <span>Keep Original ({data.plannedHours}h)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyOptimizations}
                      disabled={isApplying}
                      className="btn-primary"
                      style={{ 
                        padding: '10px 22px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontWeight: '700',
                        fontSize: '0.88rem',
                        background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                        boxShadow: '0 4px 16px rgba(192, 83, 48, 0.35)',
                        cursor: 'pointer'
                      }}
                    >
                      <Sparkles size={16} />
                      <span>{isApplying ? 'Applying Plan...' : `Apply Optimized Plan (${data.optimizedHours}h)`}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-primary"
                    style={{ 
                      padding: '10px 24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      background: 'linear-gradient(135deg, #2E7D52, #1B5E38)',
                      borderColor: 'rgba(74, 222, 128, 0.4)'
                    }}
                  >
                    <CheckCircle2 size={16} color="#4ADE80" />
                    <span>Plan Verified • Proceed with Day</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
