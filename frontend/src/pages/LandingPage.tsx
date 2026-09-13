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
  Target,
  Terminal,
  Cpu,
  Code2,
  Copy,
  Check,
  Layers,
  Bot
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

  const [terminalTab, setTerminalTab] = React.useState<'live' | 'today' | 'action' | 'stress' | 'chat'>('live');
  const [copiedCli, setCopiedCli] = React.useState(false);
  const [copiedMcp, setCopiedMcp] = React.useState(false);

  // Animation cycle for CLI Live Terminal Simulation
  const [cliStep, setCliStep] = React.useState(0);
  // Animation cycle for MCP Tool Invocation Simulation
  const [mcpStep, setMcpStep] = React.useState(0);

  React.useEffect(() => {
    const cliTimer = setInterval(() => {
      setCliStep((prev) => (prev + 1) % 4);
    }, 2800);

    const mcpTimer = setInterval(() => {
      setMcpStep((prev) => (prev + 1) % 4);
    }, 3200);

    return () => {
      clearInterval(cliTimer);
      clearInterval(mcpTimer);
    };
  }, []);

  const copyToClipboard = (text: string, isMcp = false) => {
    navigator.clipboard.writeText(text);
    if (isMcp) {
      setCopiedMcp(true);
      setTimeout(() => setCopiedMcp(false), 2000);
    } else {
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2000);
    }
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--text-kehwa-cream)' }}>
      {/* Navigation Header */}
      <nav className="landing-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '16px 24px' }}>
        <BrandLogo size="lg" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="#developer-ecosystem"
            style={{
              color: 'var(--text-parchment-muted)',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--saffron-ember)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-parchment-muted)')}
          >
            CLI & MCP
          </a>
          <button
            onClick={handleSignIn}
            className="btn-secondary"
            style={{ padding: '6px 16px', fontSize: '0.88rem', borderRadius: 'var(--radius-sm)' }}
          >
            Sign In
          </button>
        </div>
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

      {/* Developer & AI Ecosystem: CLI & MCP Server */}
      <section id="developer-ecosystem" style={{
        padding: '60px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--saffron-ember)',
            textTransform: 'uppercase',
            background: 'rgba(226, 149, 59, 0.1)',
            padding: '4px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(226, 149, 59, 0.25)',
            marginBottom: '10px'
          }}>
            <Terminal size={14} />
            <span>Developer Ecosystem</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.3rem)', fontWeight: 800, marginTop: '4px', color: 'var(--text-kehwa-cream)' }}>
            Terminal CLI & Model Context Protocol (MCP)
          </h2>
          <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.96rem', maxWidth: '680px', margin: '10px auto 0', lineHeight: 1.6 }}>
            Manage commitments from your terminal or connect AazDoh directly to your AI assistants (<strong style={{ color: 'var(--text-kehwa-cream)' }}>Claude Desktop, Cursor, Antigravity</strong>).
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
        }}>
          {/* Card 1: Autonomous CLI Agent */}
          <div className="harud-card" style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(26, 18, 14, 0.95), rgba(16, 12, 10, 0.98))',
            border: '1px solid rgba(226, 149, 59, 0.25)',
          }}>
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--chinar-rust), #782711)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}>
                    <Terminal size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                      Terminal CLI Agent
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)' }}>
                      npm: aazdoh-cli / bin: az, aazdoh
                    </span>
                  </div>
                </div>
                <span className="badge badge-completed" style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ADE80', fontSize: '0.72rem' }}>
                  Live on NPM
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-parchment-muted)', lineHeight: 1.55, marginBottom: '16px' }}>
                Execute natural language instructions, stress-test your day, inspect 7-day velocity, and converse with an interactive REPL directly in your shell.
              </p>

              {/* Terminal Interactive Window Frame */}
              <div style={{
                background: '#0D0907',
                borderRadius: '8px',
                border: '1px solid var(--border-walnut-faint)',
                overflow: 'hidden',
                marginBottom: '16px',
              }}>
                {/* Window Bar with Traffic Dots + Tabs */}
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                    </div>
                    {terminalTab === 'live' && (
                      <span style={{ fontSize: '0.68rem', color: '#4ADE80', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                        LIVE ACTION
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(['live', 'today', 'action', 'stress', 'chat'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setTerminalTab(tab)}
                        style={{
                          background: terminalTab === tab ? 'rgba(226, 149, 59, 0.2)' : 'transparent',
                          color: terminalTab === tab ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          cursor: 'pointer',
                          fontWeight: terminalTab === tab ? 700 : 400,
                        }}
                      >
                        {tab === 'live' ? '⚡ live demo' : tab === 'today' ? 'az today' : tab === 'action' ? 'az "..."' : tab === 'stress' ? 'az stress' : 'az chat'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Terminal Content Body */}
                <div style={{
                  padding: '14px',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  lineHeight: 1.55,
                  minHeight: '175px',
                  color: '#F5EFEB',
                }}>
                  {terminalTab === 'live' && (
                    <div>
                      <div style={{ color: '#E2953B', fontWeight: 700 }}>
                        $ az "completed Redis lock, add 30m security audit"
                        {cliStep === 0 && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
                      </div>

                      {cliStep >= 1 && (
                        <div style={{ color: '#8C827A', marginTop: '6px' }}>
                          ⚡ Reasoning over execution options...
                        </div>
                      )}

                      {cliStep >= 2 && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ color: '#4ADE80' }}>✓ Completed: "Redis Distributed Lock"</div>
                          <div style={{ color: '#4ADE80' }}>✓ Created: "Security Audit" (30m, HIGH Priority)</div>
                        </div>
                      )}

                      {cliStep >= 3 && (
                        <div style={{ color: '#8C827A', marginTop: '10px', borderTop: '1px dashed #3A2A22', paddingTop: '6px' }}>
                          Summary: 2 Done | 1 Pending | 2.75h Scheduled • <span style={{ color: '#4ADE80', fontWeight: 700 }}>OPTIMAL</span>
                        </div>
                      )}
                    </div>
                  )}

                  {terminalTab === 'today' && (
                    <>
                      <div style={{ color: '#E2953B', fontWeight: 700 }}>$ az today</div>
                      <div style={{ color: '#8C827A', marginTop: '4px' }}>Plan for: 2026-09-13 | User: Barkat [Persona: BALANCED]</div>
                      <div style={{ color: '#4ADE80', marginTop: '6px' }}>✔ [DONE] 60m Deep Focus — Architecture PR Review</div>
                      <div style={{ color: '#4ADE80' }}>✔ [DONE] 60m Deep Focus — PostgreSQL Query Optimization</div>
                      <div style={{ color: '#F59E0B' }}>⭕ [PEND] 45m Deep Focus — Redis Distributed Lock</div>
                      <div style={{ color: '#8C827A', marginTop: '8px', borderTop: '1px dashed #3A2A22', paddingTop: '6px' }}>
                        Summary: 2 Done | 1 Pending | 2.75h Scheduled • <span style={{ color: '#4ADE80', fontWeight: 700 }}>OPTIMAL</span>
                      </div>
                    </>
                  )}

                  {terminalTab === 'action' && (
                    <>
                      <div style={{ color: '#E2953B', fontWeight: 700 }}>$ az "completed Redis lock, add 30m security audit"</div>
                      <div style={{ color: '#8C827A', marginTop: '4px' }}>⚡ Reasoning over execution options...</div>
                      <div style={{ color: '#4ADE80', marginTop: '6px' }}>✓ Completed Commitment: "Redis Distributed Lock"</div>
                      <div style={{ color: '#4ADE80' }}>✓ Created Commitment: "Security Audit" (30m, HIGH Priority)</div>
                      <div style={{ color: '#8C827A', marginTop: '6px' }}>(Run 'az undo' anytime to revert)</div>
                    </>
                  )}

                  {terminalTab === 'stress' && (
                    <>
                      <div style={{ color: '#E2953B', fontWeight: 700 }}>$ az stress-test</div>
                      <div style={{ color: '#4ADE80', marginTop: '4px' }}>[LOW RISK] [████████░░░░░░░░░░░░] 22%</div>
                      <div style={{ color: '#F5EFEB', marginTop: '6px' }}>
                        "Planned 3.2h load sits safely within your 4.1h historical capacity. Protect your morning 90m block to maintain maximum momentum."
                      </div>
                    </>
                  )}

                  {terminalTab === 'chat' && (
                    <>
                      <div style={{ color: '#E2953B', fontWeight: 700 }}>$ az chat</div>
                      <div style={{ color: '#8C827A' }}>Logged in as Barkat. Commands: /today /undo /stats /exit</div>
                      <div style={{ color: '#E2953B', marginTop: '4px' }}>az&gt; how is my 7-day velocity looking?</div>
                      <div style={{ color: '#F5EFEB', marginTop: '4px' }}>
                        "Solid execution. You are tracking at an 84% completion rate across 43.1 focus hours with minimal postponement drift."
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Copy Command */}
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(226, 149, 59, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
            }}>
              <span style={{ color: 'var(--saffron-ember)' }}>npm install -g aazdoh-cli</span>
              <button
                onClick={() => copyToClipboard('npm install -g aazdoh-cli')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedCli ? '#4ADE80' : 'var(--text-parchment-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                }}
              >
                {copiedCli ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCli ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Model Context Protocol (MCP Server) */}
          <div className="harud-card" style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(20, 24, 36, 0.95), rgba(12, 16, 26, 0.98))',
            border: '1px solid rgba(144, 205, 244, 0.25)',
          }}>
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2B6CB0, #1A365D)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}>
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                      Model Context Protocol (MCP)
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: '#90CDF4' }}>
                      npm: aazdoh-mcp
                    </span>
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(144, 205, 244, 0.15)', color: '#90CDF4', fontSize: '0.72rem', border: '1px solid rgba(144, 205, 244, 0.3)' }}>
                  Open Standard
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-parchment-muted)', lineHeight: 1.55, marginBottom: '12px' }}>
                Connect your commitments, plan stress-testing, excuse analysis, and peer accountability feeds directly into your AI clients.
              </p>

              {/* Supported AI IDE Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                {['Claude Desktop', 'Cursor IDE', 'Antigravity'].map((ide) => (
                  <span
                    key={ide}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-kehwa-cream)',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Bot size={11} color="#90CDF4" />
                    <span>{ide}</span>
                  </span>
                ))}
              </div>

              {/* Live MCP Tool Invocation Animation Frame */}
              <div style={{
                background: '#0B111A',
                borderRadius: '8px',
                border: '1px solid rgba(144, 205, 244, 0.2)',
                padding: '12px',
                marginBottom: '16px',
                fontFamily: 'monospace',
                fontSize: '0.76rem',
                lineHeight: 1.5,
                minHeight: '175px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', marginBottom: '8px' }}>
                  <span style={{ color: '#90CDF4', fontWeight: 700 }}>IDE AI Session</span>
                  <span style={{ fontSize: '0.68rem', color: '#4ADE80' }}>● MCP CONNECTED</span>
                </div>

                <div style={{ color: '#E2E8F0', marginBottom: '6px' }}>
                  <strong style={{ color: '#90CDF4' }}>Developer: </strong>
                  "Check my AazDoh commitments and start my next task."
                </div>

                {mcpStep >= 1 && (
                  <div style={{
                    background: 'rgba(43, 108, 176, 0.2)',
                    border: '1px solid rgba(144, 205, 244, 0.3)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    margin: '6px 0',
                    color: '#90CDF4',
                  }}>
                    ⚙️ Invoking: <code>mcp.aazdoh.get_today_plan()</code> ➔ 3 tasks (2.75h)
                  </div>
                )}

                {mcpStep >= 2 && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    margin: '6px 0',
                    color: '#4ADE80',
                  }}>
                    🛡️ Invoking: <code>mcp.aazdoh.stress_test_plan()</code> ➔ Feasible (22% Risk)
                  </div>
                )}

                {mcpStep >= 3 && (
                  <div style={{ color: '#CBD5E1', marginTop: '6px' }}>
                    <strong style={{ color: '#4ADE80' }}>AI Assistant: </strong>
                    "Your schedule is optimal. Ready to begin your 60m focus block on PostgreSQL Query Optimization."
                  </div>
                )}
              </div>
            </div>

            {/* Quick MCP Config snippet */}
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(144, 205, 244, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
            }}>
              <span style={{ color: '#90CDF4' }}>npx -y aazdoh-mcp</span>
              <button
                onClick={() => copyToClipboard('npx -y aazdoh-mcp', true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedMcp ? '#4ADE80' : 'var(--text-parchment-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                }}
              >
                {copiedMcp ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedMcp ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
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

      {/* Closing Call to Action Banner */}
      <section style={{
        padding: '40px 24px 70px',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div className="harud-card" style={{
          padding: '48px 32px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(192, 83, 48, 0.25), rgba(26, 18, 14, 0.95))',
          border: '1px solid rgba(226, 149, 59, 0.35)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(226, 149, 59, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-kehwa-cream)',
            marginBottom: '12px',
            lineHeight: 1.2,
          }}>
            Ready to honor the promises you make to yourself?
          </h2>

          <p style={{
            color: 'var(--text-parchment-muted)',
            fontSize: '1rem',
            maxWidth: '620px',
            margin: '0 auto 28px',
            lineHeight: 1.6,
          }}>
            Build sustainable daily momentum with plan feasibility checks, excuse analysis, and genuine accountability.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleGetStarted}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
            >
              <span>Start Committing Today</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleSignIn}
              className="btn-secondary"
              style={{ padding: '12px 24px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
            >
              <span>Sign In</span>
            </button>
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
