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
