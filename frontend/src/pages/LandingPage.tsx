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
        background: 'rgba(20, 14, 10, 0.8)',
        backdropFilter: 'blur(12px)',
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
        padding: '70px 24px 50px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
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
          maxWidth: '720px',
          lineHeight: 1.6,
          marginBottom: '36px',
        }}>
          Traditional to-do apps reward dopamine checks. <strong>AazDoh</strong> replaces easy checkmarks with honest accountability: 1-on-1 peer transparency and an unvarnished AI Challenger that detects chronic overplanning before you fail.
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
          maxWidth: '860px',
          marginTop: '60px',
          background: 'var(--bg-walnut-surface)',
          border: '1px solid var(--border-copper-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-warm-md), 0 0 40px var(--chinar-glow)',
          padding: '28px',
          textAlign: 'left',
        }}>
          {/* Card Mock Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--saffron-ember)', fontWeight: 700, textTransform: 'uppercase' }}>
                Daily Momentum
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-kehwa-cream)', marginTop: '2px' }}>
                Today's Commitments • 2 of 3 Kept
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-completed">67% Kept</span>
              <span className="badge badge-priority-high">4.5h Focus</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-walnut-card)', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ width: '67%', height: '100%', background: 'linear-gradient(90deg, var(--chinar-rust), var(--saffron-ember))', borderRadius: '999px' }} />
          </div>

          {/* Mock Commitment Item 1 */}
          <div style={{
            padding: '14px 16px',
            background: 'var(--bg-walnut-card)',
            border: '1px solid var(--pine-emerald)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={20} color="#4ADE80" />
              <div>
                <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-parchment-muted)', textDecoration: 'line-through' }}>
                  Deploy Zero-Downtime Database Migration
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)' }}>
                  ~90 mins • High Priority • Shared with Partner
                </div>
              </div>
            </div>
            <span className="badge badge-completed">Kept</span>
          </div>

          {/* Mock AI Challenger Box */}
          <div style={{
            padding: '14px 16px',
            background: 'rgba(226, 149, 59, 0.06)',
            border: '1px solid rgba(226, 149, 59, 0.3)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.86rem',
            lineHeight: 1.5,
          }}>
            <Sparkles size={16} color="var(--saffron-ember)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--saffron-ember)', fontWeight: 700 }}>AI Challenger (Balanced): </span>
              "You planned 6.5 hours across 3 complex tasks today, while your 7-day average focus velocity is 4.1 hours. Consider breaking down the API integration to avoid an evening miss."
            </div>
          </div>
        </div>
      </section>

      {/* Dual Pillar Section */}
      <section style={{
        maxWidth: '1100px',
        margin: '40px auto 80px',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
      }}>
        {/* Pillar 1: Human 1:1 Peer */}
        <div className="harud-card" style={{ padding: '32px' }}>
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
            <Users size={22} color="#F5EFEB" />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '10px', color: 'var(--text-kehwa-cream)' }}>
            1-to-1 Peer Transparency
          </h3>
          <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Connect with a trusted colleague or partner. Share daily commitments with time estimates. When tasks are missed, partners can ask direct questions in context to understand actual blockers.
          </p>
        </div>

        {/* Pillar 2: AI Challenger */}
        <div className="harud-card" style={{ padding: '32px' }}>
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
            <Sparkles size={22} color="#140E0A" />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '10px', color: 'var(--text-kehwa-cream)' }}>
            AI Challenger
          </h3>
          <p style={{ color: 'var(--text-parchment-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            An objective accountability engine trained to confront planning bias. Configurable in <strong>Gentle</strong>, <strong>Balanced</strong>, or <strong>Strict</strong> modes to expose repeated postponements and recurring failure patterns.
          </p>
        </div>
      </section>

      {/* The 4-Step Daily Loop */}
      <section style={{
        background: 'var(--bg-walnut-surface)',
        borderTop: '1px solid var(--border-walnut-faint)',
        borderBottom: '1px solid var(--border-walnut-faint)',
        padding: '70px 24px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--saffron-ember)', textTransform: 'uppercase' }}>
            The Core Habit Engine
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px', marginBottom: '40px' }}>
            The 4-Step Daily Accountability Cycle
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'left' }}>
            <div className="harud-card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--chinar-rust)' }}>01</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Commit</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                Define 2–4 high-leverage tasks with explicit deliverables and realistic focus minutes.
              </p>
            </div>

            <div className="harud-card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--saffron-ember)' }}>02</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Do</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                Execute with zero fake busywork. Protect focus blocks and notify your partner of shifts.
              </p>
            </div>

            <div className="harud-card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ADE80' }}>03</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Report</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                100% honesty: Toggle kept items or mark misses without shameful streak penalties.
              </p>
            </div>

            <div className="harud-card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F87171' }}>04</span>
              <h4 style={{ fontSize: '1.1rem', margin: '8px 0 6px' }}>Reflect</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-parchment-muted)', lineHeight: 1.5 }}>
                Classify failure reasons (Underestimated, Distracted, Blocked) and dispatch next actions.
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
              href="https://github.com/bb-code1/AazDoh"
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
