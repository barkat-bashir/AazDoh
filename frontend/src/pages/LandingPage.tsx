import React from 'react';
import { 
  Flame,
  Sparkles, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Compass, 
  AlertTriangle,
  Zap,
  Activity,
  History,
  Shield,
  BarChart3,
  Scale,
  Calendar,
  Target
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

import { useNavigate } from 'react-router-dom';

interface LandingPageProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  const navigate = useNavigate();
  const handleGetStarted = onGetStarted || (() => navigate('/login'));
  const handleSignIn = onSignIn || (() => navigate('/login'));
  const handleOpenTerms = onOpenTerms || (() => navigate('/terms'));
  const handleOpenPrivacy = onOpenPrivacy || (() => navigate('/privacy'));
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--text-kehwa-cream)' }}>
      {/* Navigation Header */}
      <nav className="landing-nav">
        <BrandLogo size="lg" />
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <h1 style={{
          fontSize: 'clamp(1.85rem, 5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: '850px',
          marginBottom: '18px',
        }}>
          Keep the promises you make to yourself.
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
          color: 'var(--text-parchment-muted)',
          maxWidth: '740px',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Standard to-do apps reward dopamine checkmarks. <strong>AazDoh</strong> replaces wishful thinking with operational integrity: <strong>Plan Feasibility Checks</strong>, a <strong>Cognitive Excuse Classifier</strong> with historical receipts, and true 1-on-1 peer accountability.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleGetStarted}
            className="btn-primary"
            style={{ padding: '12px 26px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
          >
            <span>Start Committing Today</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={handleSignIn}
            className="btn-secondary"
            style={{ padding: '12px 22px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
          >
            <span>Sign In</span>
          </button>
        </div>

        {/* Live Interactive Product Card Mockup */}
        <div className="landing-mockup-card">
          {/* Card Mock Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--saffron-ember)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={13} />
                <span>Plan Feasibility Check</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-kehwa-cream)', marginTop: '2px' }}>
                Today's Workload: 3.5h Planned • 15% Failure Risk
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-completed" style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ADE80', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                Feasible Plan
              </span>
              <span className="badge badge-priority-high">7-Day Avg: 4.2h</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-walnut-card)', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ width: '83%', height: '100%', background: 'linear-gradient(90deg, var(--chinar-rust), var(--saffron-ember))', borderRadius: '999px' }} />
          </div>

          {/* Mock Commitment Item */}
          <div style={{
            padding: '14px 16px',
            background: 'var(--bg-walnut-card)',
            border: '1px solid var(--border-walnut-faint)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={20} color="#4ADE80" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
                  Deploy Zero-Downtime Database Migration
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-tweed-dim)' }}>
                  ~60 mins • High Priority • Shared
                </div>
              </div>
            </div>
            <span className="badge badge-completed" style={{ flexShrink: 0 }}>Kept</span>
          </div>

          {/* Mock Feasibility Diagnostic Box */}
          <div style={{
            padding: '14px 16px',
            background: 'rgba(226, 149, 59, 0.08)',
            border: '1px solid rgba(226, 149, 59, 0.35)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            fontSize: '0.86rem',
            lineHeight: 1.5,
          }}>
            <Sparkles size={18} color="var(--saffron-ember)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--saffron-ember)', fontWeight: 700 }}>Plan Feasibility Assessment: </span>
              "Your 3.5h load sits comfortably below your 4.2h baseline velocity. No friction bottleneck detected today. Protect your primary 90-minute block for high-momentum execution."
            </div>
          </div>
        </div>
      </section>

      {/* Behavioral Engineering Features Grid */}
      <section className="landing-features-section">
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--saffron-ember)', textTransform: 'uppercase' }}>
            Behavioral Engineering
          </span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.2rem)', fontWeight: 800, marginTop: '6px' }}>
            Built to Eliminate Human Rationalization
          </h2>
          <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.94rem', maxWidth: '650px', margin: '10px auto 0' }}>
            Most tools are passive logs. AazDoh actively intervenes when you are about to overcommit or make excuses.
          </p>
        </div>

        <div className="landing-features-grid">
          {/* Feature 1: Plan Feasibility Check */}
          <div className="harud-card landing-feature-card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}>
              <Activity size={22} color="#F5EFEB" />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--text-kehwa-cream)' }}>
              Plan Feasibility Check
            </h3>
            <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '18px' }}>
              Before starting your day, AazDoh checks your proposed commitments against your 7-day historical focus velocity. If you are overloaded, it generates <strong>1-Click Rebalanced Proposals</strong> to trim, split, or reschedule lower-priority items.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-walnut-faint)', fontSize: '0.82rem', color: 'var(--saffron-ember)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} />
              <span>Includes Quick Defense & Sovereign Override</span>
            </div>
          </div>

          {/* Feature 2: Cognitive Excuse Mirror */}
          <div className="harud-card landing-feature-card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--saffron-ember), #965B17)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}>
              <History size={22} color="#140E0A" />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--text-kehwa-cream)' }}>
              Cognitive Excuse Mirror & Receipts
            </h3>
            <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '18px' }}>
              When you postpone a commitment, AazDoh cross-references your stated reason against your past postponement history. It detects recurring avoidance traps (<em>Morning Illusion</em>, <em>Perfectionist Stalling</em>) and offers an instant <strong>15-Minute Micro-Start</strong> to break inertia.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-walnut-faint)', fontSize: '0.82rem', color: 'var(--chinar-rust)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} />
              <span>Historical Receipts & Cognitive Distortion Classifier</span>
            </div>
          </div>

          {/* Feature 3: 1:1 Peer Accountability */}
          <div className="harud-card landing-feature-card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2A4365, #1A365D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}>
              <Users size={22} color="#F5EFEB" />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--text-kehwa-cream)' }}>
              1-to-1 Peer Transparency
            </h3>
            <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '18px' }}>
              Pair up with a trusted colleague or accountability partner. Share daily commitments with timezone-aware alignment. When commitments are missed or postponed, discuss blockers directly in-context.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-walnut-faint)', fontSize: '0.82rem', color: '#90CDF4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} />
              <span>Timezone-Aware Partner Sync & Discussion Threads</span>
            </div>
          </div>
        </div>
      </section>

      {/* Empirical Velocity & Behavioral Analytics Infinite Auto-Scroll Carousel */}
      <section style={{
        padding: '50px 0',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px', padding: '0 24px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--saffron-ember)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Empirical Telemetry
          </span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.2rem)', fontWeight: 800, marginTop: '6px', color: 'var(--text-kehwa-cream)' }}>
            Behavioral Analytics That Actually Change How You Work
          </h2>
          <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.94rem', maxWidth: '650px', margin: '10px auto 0', lineHeight: 1.6 }}>
            Traditional apps display vanity graphs. AazDoh gives you diagnostic telemetry to pinpoint where friction occurs, discover your cognitive stamina thresholds, and calibrate daily capacity.
          </p>
        </div>

        {/* Marquee Wrapper with side gradient masks */}
        <div style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          padding: '12px 0',
        }}>
          <div className="analytics-marquee-track">
            {/* Set 1 + Set 2 (for seamless infinite right-to-left loop) */}
            {[1, 2].map((setIndex) => (
              <React.Fragment key={setIndex}>
                {/* Card 1: 52-Week Consistency Heatmap */}
                <div className="harud-card analytics-marquee-card" style={{ width: '340px', minWidth: '340px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--pine-emerald), #1A4D31)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Calendar size={18} color="#4ADE80" />
                    </div>
                    <h4 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                      Consistency Heatmap
                    </h4>
                  </div>

                  {/* Mini Visual Preview */}
                  <div style={{
                    background: 'rgba(16, 12, 10, 0.6)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-walnut-faint)',
                  }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '6px' }}>
                      {[3, 4, 2, 4, 1, 0, 4, 3, 4, 2, 4, 4, 3].map((lvl, i) => (
                        <div key={i} style={{
                          width: '13px',
                          height: '13px',
                          borderRadius: '2px',
                          background: lvl === 4 ? '#4ADE80' : lvl === 3 ? 'var(--pine-emerald)' : lvl === 2 ? 'rgba(46, 125, 82, 0.75)' : lvl === 1 ? 'rgba(46, 125, 82, 0.45)' : 'rgba(255,255,255,0.05)',
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#4ADE80', fontWeight: 600, textAlign: 'center' }}>
                      88% Consistency • Compounding Momentum
                    </div>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.55 }}>
                    <strong style={{ color: 'var(--text-kehwa-cream)' }}>Why it matters: </strong>
                    Eliminates fragile "all-or-nothing" streak anxiety by shifting focus to sustainable compounding momentum and long-range rhythm.
                  </div>
                </div>

                {/* Card 2: Capacity Execution Efficiency */}
                <div className="harud-card analytics-marquee-card" style={{ width: '340px', minWidth: '340px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Scale size={18} color="#fff" />
                    </div>
                    <h4 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                      Planning Optimism Ratio
                    </h4>
                  </div>

                  {/* Mini Visual Preview */}
                  <div style={{
                    background: 'rgba(16, 12, 10, 0.6)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-walnut-faint)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-parchment-muted)' }}>Executed 3.8h / 4.2h planned</span>
                      <span style={{ color: '#4ADE80', fontWeight: 700 }}>90%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: '90%', height: '100%', background: '#4ADE80', borderRadius: '999px' }} />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.55 }}>
                    <strong style={{ color: 'var(--text-kehwa-cream)' }}>Why it matters: </strong>
                    Compares planned load against delivered focus hours to systematically cure chronic daily overbooking and planning fallacy.
                  </div>
                </div>

                {/* Card 3: Sprint Duration Sweet-Spot Curve */}
                <div className="harud-card analytics-marquee-card" style={{ width: '340px', minWidth: '340px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--saffron-ember), #965B17)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Target size={18} color="#140E0A" />
                    </div>
                    <h4 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                      Duration Sweet Spots
                    </h4>
                  </div>

                  {/* Mini Visual Preview */}
                  <div style={{
                    background: 'rgba(16, 12, 10, 0.6)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-walnut-faint)',
                    display: 'flex',
                    justifyContent: 'space-around',
                    textAlign: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-parchment-muted)' }}>25m Sprint</div>
                      <div style={{ fontSize: '0.86rem', color: '#4ADE80', fontWeight: 800 }}>94% Win</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-parchment-muted)' }}>45m Deep</div>
                      <div style={{ fontSize: '0.86rem', color: 'var(--saffron-ember)', fontWeight: 800 }}>88% Win</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-parchment-muted)' }}>90m+ Block</div>
                      <div style={{ fontSize: '0.86rem', color: '#F87171', fontWeight: 800 }}>52% Win</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.55 }}>
                    <strong style={{ color: 'var(--text-kehwa-cream)' }}>Why it matters: </strong>
                    Reveals your empirical cognitive stamina drop-off so you right-size tasks into time blocks where you complete them without stalling.
                  </div>
                </div>

                {/* Card 4: Friction & Failure Classification */}
                <div className="harud-card analytics-marquee-card" style={{ width: '340px', minWidth: '340px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #B91C1C, #7F1D1D)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <AlertTriangle size={18} color="#fff" />
                    </div>
                    <h4 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                      Friction Breakdown
                    </h4>
                  </div>

                  {/* Mini Visual Preview */}
                  <div style={{
                    background: 'rgba(16, 12, 10, 0.6)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-walnut-faint)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--text-kehwa-cream)' }}>Underestimated Scope</span>
                      <span style={{ color: 'var(--saffron-ember)', fontWeight: 700 }}>45%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--text-kehwa-cream)' }}>Distraction / Drift</span>
                      <span style={{ color: 'var(--saffron-ember)', fontWeight: 700 }}>30%</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.55 }}>
                    <strong style={{ color: 'var(--text-kehwa-cream)' }}>Why it matters: </strong>
                    Exposes recurring failure modes (e.g. Underestimating vs. Distraction) with historical receipts so you fix the root cause instead of feeling guilty.
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Dynamic CSS for smooth infinite right-to-left marquee scroll & hover pause */}
        <style>{`
          .analytics-marquee-track {
            display: flex;
            gap: 24px;
            width: max-content;
            animation: scrollAnalyticsMarquee 32s linear infinite;
          }
          .analytics-marquee-track:hover {
            animation-play-state: paused;
          }
          .analytics-marquee-card {
            transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          }
          .analytics-marquee-card:hover {
            transform: translateY(-4px);
            border-color: var(--saffron-ember);
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
          }
          @keyframes scrollAnalyticsMarquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </section>

      {/* The 4-Step Daily Cycle */}
      <section className="landing-cycle-section">
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--saffron-ember)', textTransform: 'uppercase' }}>
            The Core Habit Operating System
          </span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.2rem)', fontWeight: 800, marginTop: '6px', marginBottom: '36px' }}>
            The 4-Step Daily Accountability Cycle
          </h2>

          <div className="landing-cycle-grid">
            <div className="harud-card" style={{ padding: '22px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--chinar-rust)' }}>01</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Commit</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                Define 2–4 high-leverage deliverables. Run a quick feasibility check to ensure sustainable capacity before you begin.
              </p>
            </div>

            <div className="harud-card" style={{ padding: '22px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--saffron-ember)' }}>02</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Do</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                Execute deep work blocks with zero fake busywork. Let your partner see progress in real time.
              </p>
            </div>

            <div className="harud-card" style={{ padding: '22px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ADE80' }}>03</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Report</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                100% honesty: Toggle kept items or mark misses without artificial streak penalties or shame.
              </p>
            </div>

            <div className="harud-card" style={{ padding: '22px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F87171' }}>04</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Reflect</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                Confront avoidance patterns with historical receipts, classify root failure causes, and dispatch actionable next steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="var(--chinar-rust)" />
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800 }}>
                AazDoh
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)', marginTop: '4px' }}>
              Commit • Do • Report • Reflect
            </p>
          </div>

          <div className="landing-footer-links">
            <button
              onClick={handleOpenTerms}
              style={{ background: 'none', border: 'none', color: 'var(--text-parchment-muted)', cursor: 'pointer' }}
            >
              Terms of Service
            </button>
            <button
              onClick={handleOpenPrivacy}
              style={{ background: 'none', border: 'none', color: 'var(--text-parchment-muted)', cursor: 'pointer' }}
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
