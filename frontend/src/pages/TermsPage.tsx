import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, Scale } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 24px) 60px', color: 'var(--text-kehwa-cream)' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn-secondary"
        style={{ marginBottom: '24px', padding: '8px 14px', fontSize: '0.84rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to AazDoh</span>
      </button>

      <div className="harud-card" style={{ padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--chinar-rust), #8A3016)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Scale size={20} color="#F5EFEB" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Terms of Service</h1>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-tweed-dim)', marginBottom: '28px' }}>
          Last Updated: June 2026 • Version 1.0
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--text-parchment-muted)' }}>
          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              1. Acceptance of Terms
            </h3>
            <p>
              By accessing or using the AazDoh platform ("AazDoh", "we", "our", or "the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              2. The AazDoh Commitment & Accountability Philosophy
            </h3>
            <p>
              AazDoh is designed to foster genuine personal discipline through a daily loop: <strong>Commit • Do • Report • Reflect</strong>. Users are encouraged to maintain honest logs of their commitments, root-cause failure classifications, and reflections.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              3. User Accounts & Responsibilities
            </h3>
            <p>
              You must provide accurate information when creating an account. You are responsible for safeguarding your password and for all activities occurring under your account. You agree not to share your account credentials with unauthorized third parties.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              4. 1:1 Peer Partnerships & Code of Conduct
            </h3>
            <p>
              AazDoh offers peer accountability features allowing users to connect and share designated commitments. When interacting with partners in discussion threads:
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Treat your accountability partner with constructive respect and good faith.</li>
              <li>Do not post abusive, discriminatory, harassing, or illegal content.</li>
              <li>Respect confidentiality regarding tasks, business objectives, or personal notes shared by your partner.</li>
            </ul>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              5. AI Accountability Challenger Disclaimer
            </h3>
            <p>
              The AI Accountability Challenger (including Gentle, Balanced, and Strict persona modes) provides automated behavioral feedback, feasibility analysis, and planning coaching. It is not a substitute for professional mental health counseling, medical advice, financial consulting, or legal counsel.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              6. Privacy & Data Ownership
            </h3>
            <p>
              You retain all ownership rights to the commitment text, reflections, and notes you post on AazDoh. Please review our <span style={{ color: 'var(--saffron-ember)', fontWeight: 600 }}>Privacy Policy</span> for detailed information on how your data is encrypted and handled.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              7. Termination
            </h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate our terms or engage in malicious activity. You may delete your account and data at any time through your account preferences.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              8. Contact
            </h3>
            <p>
              For questions regarding these Terms of Service, reach out to our team at <span style={{ color: 'var(--saffron-ember)' }}>support@aazdoh.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
