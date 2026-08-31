import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  CalendarClock, 
  Flame, 
  Send, 
  X, 
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Lock
} from 'lucide-react';
import { PlanStressTestResponse, OptimizedTaskProposal, aiApi } from '../../api/aiApi';

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
  const [showDefenseInput, setShowDefenseInput] = useState(false);
  const [defenseText, setDefenseText] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const data = stressTestData;

  const handleApplyOptimizations = async () => {
    if (!data || !data.proposedOptimizations || data.proposedOptimizations.length === 0) {
      onClose();
      return;
    }
    try {
      setIsApplying(true);
      await aiApi.applyOptimizedPlan({
        acceptedProposals: data.proposedOptimizations,
      });
      setSuccessMessage('Optimized plan applied successfully! Your day is now de-risked.');
      setTimeout(() => {
        setIsApplying(false);
        setSuccessMessage(null);
        onPlanApplied();
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to apply optimized plan', err);
      setIsApplying(false);
    }
  };

  const handleSendDefense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defenseText.trim()) return;
    onReStressTest(defenseText.trim(), false);
    setShowDefenseInput(false);
    setDefenseText('');
  };

  const handleOverrideSprint = () => {
    onReStressTest(undefined, true);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return 'var(--chinar-rust)';
      case 'MODERATE':
        return 'var(--saffron-ember)';
      default:
        return '#48bb78';
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '680px', 
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid rgba(226, 149, 59, 0.3)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.7), 0 0 30px rgba(192, 83, 48, 0.15)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(192, 83, 48, 0.3)'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--warm-cream)' }}>
                AI Chief of Staff • 60-Second Stress-Test
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                Executive capacity audit & proactive failure prevention
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="btn-outline" 
            style={{ padding: '6px', borderRadius: '50%', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div 
              className="spinner" 
              style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid rgba(226, 149, 59, 0.2)', 
                borderTopColor: 'var(--saffron-ember)',
                borderRadius: '50%',
                margin: '0 auto 16px auto',
                animation: 'spin 0.8s linear infinite'
              }} 
            />
            <p style={{ fontWeight: '600', color: 'var(--warm-cream)', marginBottom: '4px' }}>
              Cross-examining today's plan against historical focus velocity...
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Calculating task entropy, postponement lineage, and energy curves.
            </p>
          </div>
        ) : data ? (
          <div>
            {/* Success Overlay */}
            {successMessage && (
              <div 
                style={{ 
                  background: 'rgba(72, 187, 120, 0.15)', 
                  border: '1px solid #48bb78', 
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  color: '#48bb78',
                  fontWeight: '600',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle2 size={20} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Risk Index Banner */}
            <div 
              style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: `1px solid ${getRiskColor(data.riskLevel)}40`,
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div 
                  style={{ 
                    width: '54px', 
                    height: '54px', 
                    borderRadius: '50%', 
                    background: `conic-gradient(${getRiskColor(data.riskLevel)} ${data.riskScore * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  <div 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      borderRadius: '50%', 
                      background: 'var(--bg-card)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '14px',
                      color: getRiskColor(data.riskLevel)
                    }}
                  >
                    {data.riskScore}%
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      Failure Probability
                    </span>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        background: `${getRiskColor(data.riskLevel)}20`, 
                        color: getRiskColor(data.riskLevel),
                        fontWeight: '700'
                      }}
                    >
                      {data.riskLevel} RISK
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--warm-cream)', marginTop: '2px', fontWeight: '500' }}>
                    Planned: <strong style={{ color: 'var(--saffron-ember)' }}>{data.plannedHours}h</strong> • 7-Day Capacity: <strong>{data.historicalCapacityHours}h</strong>
                  </div>
                </div>
              </div>

              {data.optimizedHours < data.plannedHours && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#48bb78', fontSize: '12px', fontWeight: '600' }}>
                  <TrendingDown size={16} />
                  <span>Optimizes to {data.optimizedHours}h (94% win rate)</span>
                </div>
              )}
            </div>

            {/* Diagnostic Box */}
            <div 
              style={{ 
                background: 'rgba(226, 149, 59, 0.05)', 
                borderLeft: '4px solid var(--saffron-ember)', 
                padding: '14px 18px', 
                borderRadius: '0 12px 12px 0',
                marginBottom: '20px'
              }}
            >
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--warm-cream)' }}>
                "{data.diagnosticSummary}"
              </p>
              {data.defenseFeedback && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: '#48bb78', fontWeight: '600' }}>
                  ✓ {data.defenseFeedback}
                </div>
              )}
            </div>

            {/* Proposed Adjustments List */}
            {data.proposedOptimizations && data.proposedOptimizations.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  ✨ Chief of Staff Proposed De-Risking Actions
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.proposedOptimizations.map((prop: OptimizedTaskProposal, idx: number) => {
                    const isTrim = prop.suggestedAction === 'TRIM' || prop.suggestedAction === 'SPLIT';
                    const isShift = prop.suggestedAction === 'SHIFT_TO_TOMORROW';
                    const isKeep = prop.suggestedAction === 'KEEP';

                    return (
                      <div 
                        key={idx}
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            {isTrim && (
                              <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '6px', background: 'rgba(226, 149, 59, 0.15)', color: 'var(--saffron-ember)', fontWeight: '700' }}>
                                TRIMMED
                              </span>
                            )}
                            {isShift && (
                              <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '6px', background: 'rgba(192, 83, 48, 0.15)', color: 'var(--chinar-rust)', fontWeight: '700' }}>
                                REBALANCED TOMORROW
                              </span>
                            )}
                            {isKeep && (
                              <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '6px', background: 'rgba(72, 187, 120, 0.15)', color: '#48bb78', fontWeight: '700' }}>
                                KEPT AS-IS
                              </span>
                            )}
                            <strong style={{ fontSize: '13px', color: 'var(--warm-cream)' }}>
                              {prop.currentTitle}
                            </strong>
                          </div>
                          
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                            {prop.reasoning}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' }}>
                            <span style={{ color: isShift ? 'var(--chinar-rust)' : isTrim ? 'var(--text-muted)' : '#48bb78', textDecoration: isTrim || isShift ? 'line-through' : 'none' }}>
                              {prop.currentMinutes}m
                            </span>
                            {isTrim && (
                              <>
                                <ArrowRight size={12} style={{ color: 'var(--saffron-ember)' }} />
                                <span style={{ color: 'var(--saffron-ember)' }}>{prop.proposedMinutes}m</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Defense Input Section */}
            {showDefenseInput && (
              <form onSubmit={handleSendDefense} style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--warm-cream)', marginBottom: '6px' }}>
                  💬 Defend your capacity to your Chief of Staff (1 sentence):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. I already have the starter template ready, so Part 1 will only take 30 mins."
                    value={defenseText}
                    onChange={(e) => setDefenseText(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px' }}
                    autoFocus
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Send size={14} />
                    <span>Validate</span>
                  </button>
                </div>
              </form>
            )}

            {/* Action Bar */}
            <div 
              style={{ 
                borderTop: '1px solid rgba(255,255,255,0.08)', 
                paddingTop: '18px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              {data.validated ? (
                <button 
                  onClick={onClose} 
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Lock size={16} />
                  <span>Plan Validated & Locked • Begin Execution</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleApplyOptimizations}
                    disabled={isApplying}
                    className="btn-primary"
                    style={{ 
                      flex: '1 1 200px', 
                      padding: '12px 18px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px',
                      fontWeight: '700'
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{isApplying ? 'Applying...' : '✨ Accept Optimized Plan (1-Click)'}</span>
                  </button>

                  <button
                    onClick={() => setShowDefenseInput(!showDefenseInput)}
                    className="btn-outline"
                    style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>💬 Quick Defense</span>
                  </button>

                  <button
                    onClick={handleOverrideSprint}
                    className="btn-outline"
                    title="Accept risk and log a high-entropy sprint under sovereign override"
                    style={{ padding: '12px 16px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Flame size={14} style={{ color: 'var(--chinar-rust)' }} />
                    <span>Override & Sprint</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
