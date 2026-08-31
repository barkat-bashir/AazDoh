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
  Github
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--text-kehwa-cream)' }}>
      {/* Navigation Header */}
      <nav style={{
        padding: '18px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(20, 14, 10, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-walnut-faint)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--chinar-glow)',
          }}>
            <Flame size={20} color="#F5EFEB" />
          </div>
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.35rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}>
            AazDoh
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onSignIn}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.88rem' }}
          >
            <span>Get Started Free</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '70px 24px 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '999px',
          background: 'rgba(226, 149, 59, 0.1)',
          border: '1px solid rgba(226, 149, 59, 0.3)',
          marginBottom: '20px',
          fontSize: '0.82rem',
          color: 'var(--saffron-ember)',
          fontWeight: 700,
        }}>
          <Sparkles size={14} />
          <span>Powered by Chief-of-Staff AI & 1:1 Peer Accountability</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: '850px',
          marginBottom: '20px',
        }}>
          Keep the promises you make to yourself.
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-parchment-muted)',
          maxWidth: '740px',
          lineHeight: 1.6,
          marginBottom: '36px',
        }}>
          Standard to-do apps reward dopamine checkmarks. <strong>AazDoh</strong> replaces wishful thinking with operational integrity: <strong>60-Second AI Plan Stress-Testing</strong>, an <strong>Anti-Self-Deception AI Mirror</strong> that detects chronic excuses, and true 1-on-1 peer transparency.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={onGetStarted}
            className="btn-primary"
            style={{ padding: '14px 30px', fontSize: '1.05rem', borderRadius: 'var(--radius-md)' }}
          >
            <span>Start Committing Today</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onSignIn}
            className="btn-secondary"
            style={{ padding: '14px 24px', fontSize: '1.05rem', borderRadius: 'var(--radius-md)' }}
          >
            <span>Sign In</span>
          </button>
        </div>

        {/* Live Interactive Product Card Mockup */}
        <div style={{
          width: '100%',
          maxWidth: '880px',
          marginTop: '60px',
          background: 'var(--bg-walnut-surface)',
          border: '1px solid var(--border-copper-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-warm-md), 0 0 45px var(--chinar-glow)',
          padding: '28px',
          textAlign: 'left',
        }}>
          {/* Card Mock Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--saffron-ember)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={13} />
                <span>60-Second Plan Feasibility Radar</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-kehwa-cream)', marginTop: '2px' }}>
                Today's Workload: 3.5h Planned • 15% Failure Risk
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={20} color="#4ADE80" />
              <div>
                <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-kehwa-cream)' }}>
                  Deploy Zero-Downtime Database Migration
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)' }}>
                  ~60 mins • High Priority • Shared with Partner
                </div>
              </div>
            </div>
            <span className="badge badge-completed">Kept</span>
          </div>

          {/* Mock AI Chief of Staff Box */}
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
              <span style={{ color: 'var(--saffron-ember)', fontWeight: 700 }}>Chief of Staff Feasibility Diagnostic: </span>
              "Your 3.5h load sits comfortably below your 4.2h baseline velocity. No friction bottleneck detected today. Protect your primary 90-minute block for high-momentum execution."
            </div>
          </div>
        </div>
      </section>

      {/* Flagship AI Features Grid */}
      <section style={{
        maxWidth: '1100px',
        margin: '20px auto 70px',
        padding: '0 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--saffron-ember)', textTransform: 'uppercase' }}>
            Behavioral Engineering
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px' }}>
            Built to Eliminate Human Rationalization
          </h2>
          <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.96rem', maxWidth: '650px', margin: '10px auto 0' }}>
            Most tools are passive logs. AazDoh actively intervenes when you are about to overcommit or make excuses.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {/* Feature 1: 60-Second Stress Tester */}
          <div className="harud-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
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
            <h3 style={{ fontSize: '1.35rem', marginBottom: '10px', color: 'var(--text-kehwa-cream)' }}>
              60-Second Plan Stress-Tester
            </h3>
            <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '18px' }}>
              Before starting your day, your AI Chief of Staff stress-tests your plan against your 7-day historical focus velocity. If you are overloaded, it generates <strong>1-Click De-Risked Proposals</strong> to trim, split, or reschedule lower-priority items.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-walnut-faint)', fontSize: '0.82rem', color: 'var(--saffron-ember)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} />
              <span>Includes Quick Defense & Sovereign Override</span>
            </div>
          </div>

          {/* Feature 2: Anti-Self-Deception Mirror */}
          <div className="harud-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
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
            <h3 style={{ fontSize: '1.35rem', marginBottom: '10px', color: 'var(--text-kehwa-cream)' }}>
              Anti-Self-Deception AI Mirror
            </h3>
            <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '18px' }}>
              When you try to postpone a task, the AI cross-references your reason against past postponement receipts. It identifies classic rationalization traps (<em>Morning Illusion</em>, <em>Perfectionist Stalling</em>) and offers an instant <strong>15-Minute Micro-Start</strong> to break inertia.
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-walnut-faint)', fontSize: '0.82rem', color: 'var(--chinar-rust)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} />
              <span>Historical Receipts & Cognitive Distortion Classifier</span>
            </div>
          </div>

          {/* Feature 3: 1:1 Peer Accountability */}
          <div className="harud-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
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
            <h3 style={{ fontSize: '1.35rem', marginBottom: '10px', color: 'var(--text-kehwa-cream)' }}>
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

      {/* The 4-Step Daily Cycle */}
      <section style={{
        background: 'var(--bg-walnut-surface)',
        borderTop: '1px solid var(--border-walnut-faint)',
        borderBottom: '1px solid var(--border-walnut-faint)',
        padding: '70px 24px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--saffron-ember)', textTransform: 'uppercase' }}>
            The Core Habit Operating System
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px', marginBottom: '40px' }}>
            The 4-Step Daily Accountability Cycle
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'left' }}>
            <div className="harud-card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--chinar-rust)' }}>01</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Commit & Stress-Test</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                Define 2–4 high-leverage deliverables. Run the 60-second stress-test to ensure feasibility before you begin.
              </p>
            </div>

            <div className="harud-card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--saffron-ember)' }}>02</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Do</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                Execute deep work blocks with zero fake busywork. Let your partner see progress in real time.
              </p>
            </div>

            <div className="harud-card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ADE80' }}>03</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Report</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                100% honesty: Toggle kept items or mark misses without artificial streak penalties or shame.
              </p>
            </div>

            <div className="harud-card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F87171' }}>04</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Reflect & Unblock</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                Confront excuses via the AI Mirror, classify root failure causes, and dispatch actionable next steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-walnut-faint)',
        background: 'var(--bg-walnut-deep)',
        padding: '40px 24px 30px',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.86rem' }}>
            <button
              onClick={onOpenTerms}
              style={{ background: 'none', border: 'none', color: 'var(--text-parchment-muted)', cursor: 'pointer' }}
            >
              Terms of Service
            </button>
            <button
              onClick={onOpenPrivacy}
              style={{ background: 'none', border: 'none', color: 'var(--text-parchment-muted)', cursor: 'pointer' }}
            >
              Privacy Policy
            </button>
            <a
              href="https://github.com/barkat-bashir/AazDoh"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--text-parchment-muted)', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
