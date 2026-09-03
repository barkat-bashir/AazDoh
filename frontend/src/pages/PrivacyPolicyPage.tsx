import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Server, Sparkles } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate(-1));

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 24px) 60px', color: 'var(--text-kehwa-cream)' }}>
      {/* Back Button */}
      <button
        onClick={handleBack}
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
            background: 'linear-gradient(135deg, var(--pine-emerald), #1A4D31)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield size={20} color="#F5EFEB" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Privacy Policy</h1>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-tweed-dim)', marginBottom: '28px' }}>
          Last Updated: June 2026 • Privacy-First Architecture
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--text-parchment-muted)' }}>
          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              1. Our Privacy Philosophy
            </h3>
            <p>
              At AazDoh, privacy is a fundamental pillar of genuine accountability. You cannot be truly honest about why you failed a task if your data is harvested, monetized, or publicly exposed. We do not sell your personal data, run targeted ads, or share your private reflections.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              2. Information We Collect
            </h3>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Account Credentials:</strong> Email address, hashed password (using BCrypt), full name, and timezone.</li>
              <li><strong>Commitment Records:</strong> Task titles, descriptions, planned minutes, priorities, and timestamps.</li>
              <li><strong>Daily Reviews & Reflections:</strong> Self-selected failure reasons (e.g. Underestimated, Distracted), written reflections, and next action dispatches.</li>
              <li><strong>1:1 Peer Discussions:</strong> Messages sent between you and your verified accountability partners.</li>
            </ul>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              3. How We Use AI & LLM Data Boundaries
            </h3>
            <div style={{
              background: 'rgba(226, 149, 59, 0.08)',
              border: '1px solid var(--border-copper-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              marginTop: '8px',
            }}>
              <p style={{ color: 'var(--text-kehwa-cream)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Sparkles size={16} color="var(--saffron-ember)" />
                <span>Zero-Training Guarantee</span>
              </p>
              <p style={{ fontSize: '0.86rem' }}>
                When you request an AI Plan Check or Behavioral Reflection, only an anonymized, ephemeral context bundle of your 7-day velocity is processed to generate the response. <strong>Your private reflections and commitments are NEVER used to train foundational AI models.</strong>
              </p>
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              4. Visibility & Peer Sharing Controls
            </h3>
            <p>
              Every commitment has a strict visibility setting:
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Private Only:</strong> Accessible strictly by you and your private AI challenger.</li>
              <li><strong>Shared with Partner:</strong> Visible exclusively to the verified accountability partner you have mutually connected with.</li>
            </ul>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              5. Data Security & Storage
            </h3>
            <p>
              All traffic is encrypted via TLS/HTTPS. Passwords are salted and hashed using BCrypt. Stateless JSON Web Tokens (JWT) are signed via HMAC-SHA256 with strict expiration boundaries.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              6. Your Rights & Data Deletion
            </h3>
            <p>
              You have the right to export all your commitment history or permanently delete your account and all associated review memory at any time.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', marginBottom: '8px' }}>
              7. Privacy Contact
            </h3>
            <p>
              If you have questions about our privacy architecture, contact our security officer at <span style={{ color: 'var(--saffron-ember)' }}>privacy@aazdoh.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
