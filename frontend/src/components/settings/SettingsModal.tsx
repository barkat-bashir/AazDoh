import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import { apiKeyApi, ApiKey, CreatedApiKey } from '../../api/apiKeyApi';
import { 
  Settings, 
  Save, 
  Sparkles, 
  User, 
  Globe, 
  HeartHandshake, 
  Compass, 
  ShieldAlert, 
  X, 
  LogOut,
  Terminal,
  Key,
  Copy,
  Check,
  Trash2,
  Plus,
  Bot,
  ExternalLink,
  Cpu
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, refreshUser, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'PREFERENCES' | 'MCP'>('PREFERENCES');

  // Preferences State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata');
  const [aiPersona, setAiPersona] = useState<'GENTLE' | 'BALANCED' | 'STRICT'>(user?.aiPersona || 'BALANCED');
  const [saving, setSaving] = useState(false);

  // API Key / MCP State
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState<number | undefined>(undefined);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<CreatedApiKey | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [mcpClientTarget, setMcpClientTarget] = useState<'CLAUDE' | 'CURSOR' | 'ANTIGRAVITY'>('CLAUDE');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setTimezone(user.timezone);
      setAiPersona(user.aiPersona);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'MCP') {
      fetchApiKeys();
    }
  }, [isOpen, activeTab]);

  const fetchApiKeys = async () => {
    try {
      setLoadingKeys(true);
      const keys = await apiKeyApi.list();
      setApiKeys(keys);
    } catch (err: any) {
      showToast(err.message || 'Failed to load API keys', 'error');
    } finally {
      setLoadingKeys(false);
    }
  };

  if (!isOpen) return null;

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authApi.updatePreferences({
        fullName: fullName.trim(),
        timezone,
        aiPersona,
      });
      await refreshUser();
      showToast('Preferences updated successfully', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      showToast('Please provide a name for this API key', 'error');
      return;
    }
    try {
      setGeneratingKey(true);
      const created = await apiKeyApi.create({
        name: newKeyName.trim(),
        expiresInDays: newKeyExpiry,
      });
      setNewlyCreatedKey(created);
      setNewKeyName('');
      fetchApiKeys();
      showToast('API key generated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate API key', 'error');
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleRevokeKey = async (id: string, name: string) => {
    if (!window.confirm(`Revoke API key "${name}"? Any active agent using this key will immediately lose access.`)) {
      return;
    }
    try {
      await apiKeyApi.revoke(id);
      showToast('API key revoked', 'info');
      fetchApiKeys();
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke key', 'error');
    }
  };

  const handleCopy = (text: string, isSnippet = false) => {
    navigator.clipboard.writeText(text);
    if (isSnippet) {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
    showToast('Copied to clipboard', 'info');
  };

  const activeKeyForConfig = newlyCreatedKey?.rawKey || (apiKeys.length > 0 ? `${apiKeys[0].keyPrefix}` : 'aazdoh_live_YOUR_API_KEY_HERE');

  const getClaudeConfig = () => {
    return JSON.stringify(
      {
        mcpServers: {
          aazdoh: {
            command: "npx",
            args: ["-y", "aazdoh-mcp"],
            env: {
              AAZDOH_API_KEY: activeKeyForConfig,
              AAZDOH_API_URL: window.location.origin.includes('localhost') ? 'http://localhost:8080' : 'https://aazdoh.onrender.com'
            }
          }
        }
      },
      null,
      2
    );
  };

  const getCursorConfig = () => {
    return JSON.stringify(
      {
        mcpServers: {
          aazdoh: {
            command: "node",
            args: ["./node_modules/aazdoh-mcp/dist/index.js"],
            env: {
              AAZDOH_API_KEY: activeKeyForConfig
            }
          }
        }
      },
      null,
      2
    );
  };

  const getAntigravityConfig = () => {
    return `# Add this to your agent's MCP configuration:\n{\n  "mcpServers": {\n    "aazdoh": {\n      "command": "npx",\n      "args": ["-y", "aazdoh-mcp"],\n      "env": {\n        "AAZDOH_API_KEY": "${activeKeyForConfig}"\n      }\n    }\n  }\n}`;
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 99999 }}>
      <div 
        className="modal-content"
        style={{ 
          maxWidth: '680px', 
          width: '95%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: 0,
        }}
      >
        {/* Modal Header */}
        <div 
          className="modal-header-box"
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-walnut-faint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-walnut-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <Settings size={18} color="#F5EFEB" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-kehwa-cream)', margin: 0, fontWeight: 700 }}>
                Settings & Integrations
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-parchment-muted)', margin: 0 }}>
                Account preferences & AI Agent Model Context Protocol (MCP)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '6px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-walnut-faint)',
          background: 'rgba(28, 20, 16, 0.4)',
          padding: '0 20px',
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('PREFERENCES')}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === 'PREFERENCES' ? 'var(--saffron-ember)' : 'transparent'}`,
              color: activeTab === 'PREFERENCES' ? 'var(--text-kehwa-cream)' : 'var(--text-tweed-dim)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition-smooth)',
            }}
          >
            <User size={15} color={activeTab === 'PREFERENCES' ? 'var(--saffron-ember)' : 'inherit'} />
            <span>Profile & Persona</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MCP')}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === 'MCP' ? 'var(--saffron-ember)' : 'transparent'}`,
              color: activeTab === 'MCP' ? 'var(--text-kehwa-cream)' : 'var(--text-tweed-dim)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition-smooth)',
            }}
          >
            <Terminal size={15} color={activeTab === 'MCP' ? 'var(--saffron-ember)' : 'inherit'} />
            <span>Developer & MCP</span>
            <span style={{
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(74, 222, 128, 0.15)',
              color: '#4ADE80',
              fontWeight: 800,
            }}>
              AGENT READY
            </span>
          </button>
        </div>

        {/* TAB 1: PREFERENCES & PERSONA */}
        {activeTab === 'PREFERENCES' && (
          <form onSubmit={handleSavePreferences} className="modal-body-box" style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* User Profile Summary Card */}
            {user && (
              <div style={{
                background: 'var(--bg-walnut-card)',
                border: '1px solid var(--border-copper-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#fff',
                    boxShadow: '0 3px 10px rgba(192, 83, 48, 0.35)',
                    flexShrink: 0,
                  }}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                      {user.fullName}
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-tweed-dim)' }}>
                      {user.email}
                    </span>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'var(--bg-walnut-surface)',
                  border: '1px solid var(--border-walnut-faint)',
                  color: 'var(--saffron-ember)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}>
                  {user.aiPersona || 'BALANCED'} COACHING
                </div>
              </div>
            )}

            {/* Accountability Coaching Rigor Section */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-kehwa-cream)', marginBottom: '4px' }}>
                <Sparkles size={15} color="var(--saffron-ember)" />
                <span>Accountability Coaching Rigor</span>
              </label>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-parchment-muted)', marginBottom: '10px', marginTop: 0 }}>
                Adjust the tone and directness of behavioral feedback and feasibility checks.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {/* Gentle */}
                <label style={{
                  padding: '12px 10px',
                  background: aiPersona === 'GENTLE' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                  border: `1.5px solid ${aiPersona === 'GENTLE' ? 'var(--pine-emerald)' : 'var(--border-walnut-faint)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'var(--transition-smooth)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ADE80', fontWeight: 700, fontSize: '0.86rem' }}>
                      <HeartHandshake size={15} />
                      <span>Gentle</span>
                    </div>
                    <input
                      type="radio"
                      name="modalAiPersona"
                      checked={aiPersona === 'GENTLE'}
                      onChange={() => setAiPersona('GENTLE')}
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', lineHeight: 1.3 }}>
                    Encouraging & supportive feedback
                  </span>
                </label>

                {/* Balanced */}
                <label style={{
                  padding: '12px 10px',
                  background: aiPersona === 'BALANCED' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                  border: `1.5px solid ${aiPersona === 'BALANCED' ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'var(--transition-smooth)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--saffron-ember)', fontWeight: 700, fontSize: '0.86rem' }}>
                      <Compass size={15} />
                      <span>Balanced</span>
                    </div>
                    <input
                      type="radio"
                      name="modalAiPersona"
                      checked={aiPersona === 'BALANCED'}
                      onChange={() => setAiPersona('BALANCED')}
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', lineHeight: 1.3 }}>
                    Direct, objective & realistic coaching
                  </span>
                </label>

                {/* Strict */}
                <label style={{
                  padding: '12px 10px',
                  background: aiPersona === 'STRICT' ? 'var(--bg-walnut-card-hover)' : 'var(--bg-walnut-surface)',
                  border: `1.5px solid ${aiPersona === 'STRICT' ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'var(--transition-smooth)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontWeight: 700, fontSize: '0.86rem' }}>
                      <ShieldAlert size={15} />
                      <span>Strict</span>
                    </div>
                    <input
                      type="radio"
                      name="modalAiPersona"
                      checked={aiPersona === 'STRICT'}
                      onChange={() => setAiPersona('STRICT')}
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)', lineHeight: 1.3 }}>
                    No excuses, hard truth accountability
                  </span>
                </label>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border-walnut-faint)' }} />

            {/* Profile Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
                  <User size={14} color="var(--saffron-ember)" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-kehwa-cream)', marginBottom: '6px' }}>
                  <Globe size={14} color="var(--chinar-rust)" />
                  <span>Timezone</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-walnut-faint)',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="btn-secondary"
                style={{
                  color: '#F87171',
                  borderColor: 'rgba(248, 113, 113, 0.3)',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                  style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                >
                  <Save size={15} />
                  <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: DEVELOPER & MCP */}
        {activeTab === 'MCP' && (
          <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(192, 83, 48, 0.12), rgba(226, 149, 71, 0.08))',
              border: '1px solid var(--border-copper-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(226, 149, 71, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--saffron-ember)',
                flexShrink: 0,
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.94rem', color: 'var(--text-kehwa-cream)', fontWeight: 700 }}>
                  Model Context Protocol (MCP) Integration
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-parchment-muted)', lineHeight: 1.45 }}>
                  Connect <strong>Claude Desktop</strong>, <strong>Cursor</strong>, <strong>Antigravity</strong>, or custom AI agents directly to your AazDoh commitments and cognitive telemetry via local stdio.
                </p>
              </div>
            </div>

            {/* Key Revealed Callout (If just created) */}
            {newlyCreatedKey && (
              <div style={{
                background: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} />
                    New API Key Generated: {newlyCreatedKey.name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tweed-dim)' }}>
                    Copy now. It will not be shown again.
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#120D0A',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-walnut-faint)',
                }}>
                  <code style={{ flex: 1, fontSize: '0.82rem', color: 'var(--saffron-ember)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {newlyCreatedKey.rawKey}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(newlyCreatedKey.rawKey)}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Generate API Key Form */}
            <form onSubmit={handleCreateApiKey} style={{
              background: 'var(--bg-walnut-card)',
              border: '1px solid var(--border-walnut-faint)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <h5 style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-kehwa-cream)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} color="var(--saffron-ember)" />
                <span>Create New API Key</span>
              </h5>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-parchment-muted)', marginBottom: '4px', display: 'block' }}>
                    Key Name / Client
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Claude Desktop, Cursor IDE"
                    className="input-field"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-parchment-muted)', marginBottom: '4px', display: 'block' }}>
                    Expiration
                  </label>
                  <select
                    className="input-field"
                    value={newKeyExpiry || ''}
                    onChange={(e) => setNewKeyExpiry(e.target.value ? Number(e.target.value) : undefined)}
                    style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                  >
                    <option value="">Never Expires</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={generatingKey || !newKeyName.trim()}
                  className="btn-primary"
                  style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} />
                  <span>{generatingKey ? 'Creating...' : 'Generate'}</span>
                </button>
              </div>
            </form>

            {/* Active API Keys List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                  Active API Keys ({apiKeys.length})
                </span>
                {loadingKeys && <span style={{ fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>Refreshing...</span>}
              </div>

              {apiKeys.length === 0 ? (
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-walnut-faint)',
                  textAlign: 'center',
                  color: 'var(--text-tweed-dim)',
                  fontSize: '0.78rem',
                }}>
                  No active API keys found. Generate one above to connect AI agents.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {apiKeys.map((k) => (
                    <div
                      key={k.id}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-walnut-surface)',
                        border: '1px solid var(--border-walnut-faint)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
                            {k.name}
                          </span>
                          <code style={{ fontSize: '0.72rem', color: 'var(--saffron-ember)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                            {k.keyPrefix}
                          </code>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tweed-dim)', marginTop: '2px' }}>
                          Created: {new Date(k.createdAt).toLocaleDateString()} | Last used: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRevokeKey(k.id, k.name)}
                        className="btn-outline"
                        style={{
                          color: '#F87171',
                          borderColor: 'rgba(248, 113, 113, 0.3)',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                        title="Revoke Key"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 1-Click Client Configuration Snippets */}
            <div style={{
              background: 'var(--bg-walnut-card)',
              border: '1px solid var(--border-walnut-faint)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-kehwa-cream)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={15} color="var(--saffron-ember)" />
                  <span>1-Click MCP Client Configuration</span>
                </span>

                {/* Sub-tabs */}
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setMcpClientTarget('CLAUDE')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: mcpClientTarget === 'CLAUDE' ? 'var(--chinar-rust)' : 'transparent',
                      color: mcpClientTarget === 'CLAUDE' ? '#fff' : 'var(--text-tweed-dim)',
                      fontWeight: 700,
                    }}
                  >
                    Claude Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setMcpClientTarget('CURSOR')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: mcpClientTarget === 'CURSOR' ? 'var(--chinar-rust)' : 'transparent',
                      color: mcpClientTarget === 'CURSOR' ? '#fff' : 'var(--text-tweed-dim)',
                      fontWeight: 700,
                    }}
                  >
                    Cursor IDE
                  </button>
                  <button
                    type="button"
                    onClick={() => setMcpClientTarget('ANTIGRAVITY')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: mcpClientTarget === 'ANTIGRAVITY' ? 'var(--chinar-rust)' : 'transparent',
                      color: mcpClientTarget === 'ANTIGRAVITY' ? '#fff' : 'var(--text-tweed-dim)',
                      fontWeight: 700,
                    }}
                  >
                    Antigravity / CLI
                  </button>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <pre style={{
                  background: '#0E0A08',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-walnut-faint)',
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  color: '#4ADE80',
                  overflowX: 'auto',
                  margin: 0,
                  maxHeight: '160px',
                }}>
                  {mcpClientTarget === 'CLAUDE' && getClaudeConfig()}
                  {mcpClientTarget === 'CURSOR' && getCursorConfig()}
                  {mcpClientTarget === 'ANTIGRAVITY' && getAntigravityConfig()}
                </pre>

                <button
                  type="button"
                  onClick={() => {
                    const text = mcpClientTarget === 'CLAUDE' 
                      ? getClaudeConfig() 
                      : mcpClientTarget === 'CURSOR' 
                      ? getCursorConfig() 
                      : getAntigravityConfig();
                    handleCopy(text, true);
                  }}
                  className="btn-secondary"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    background: 'rgba(28, 20, 16, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {copiedSnippet ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedSnippet ? 'Copied' : 'Copy Config'}</span>
                </button>
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-tweed-dim)' }}>
                {mcpClientTarget === 'CLAUDE' && (
                  <span>Paste into <code>claude_desktop_config.json</code> under <code>%APPDATA%\Claude</code> or <code>~/Library/Application Support/Claude</code></span>
                )}
                {mcpClientTarget === 'CURSOR' && (
                  <span>Add to Cursor Settings &rarr; Features &rarr; MCP Servers or <code>.cursor/mcp.json</code></span>
                )}
                {mcpClientTarget === 'ANTIGRAVITY' && (
                  <span>Run directly via <code>npx aazdoh-mcp</code> with <code>AAZDOH_API_KEY</code> exported in your environment.</span>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
