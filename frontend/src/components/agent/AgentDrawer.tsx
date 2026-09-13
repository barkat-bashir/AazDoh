import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { agentApi, AgentChatMessage, AgentActionReceipt } from '../../api/agentApi';
import {
  Bot,
  Sparkles,
  Send,
  Undo2,
  X,
  Zap,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  CalendarClock,
  Clock,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface AgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  { label: 'Audit my day', prompt: 'Audit my day in 2-3 short bullet points: progress, capacity bottleneck, and next step.' },
  { label: 'Evening debrief & review', prompt: 'Conduct my evening debrief: inspect completed vs missed commitments, analyze blockers, and submit my reflections.' },
  { label: 'Partner progress digest', prompt: 'Generate an objective accountability progress brief for my partner based on today’s shared commitments.' },
  { label: 'I am procrastinating', prompt: 'I am feeling friction on my priority task. Break it down into a 15-minute micro-sprint right now.' },
  { label: 'Short on time (90m)', prompt: 'I only have 90 minutes remaining today. Postpone non-essential tasks to tomorrow and prioritize my main focus.' },
];

export const AgentDrawer: React.FC<AgentDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<AgentChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('aazdoh_agent_chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [liveSteps, setLiveSteps] = useState<string[]>([]);
  const [streamingReply, setStreamingReply] = useState<string>('');
  const [recentActions, setRecentActions] = useState<AgentActionReceipt[]>([]);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [cognitiveWarning, setCognitiveWarning] = useState<string | null>(null);
  const [undoing, setUndoing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, loading, liveSteps, streamingReply]);

  // Persist session messages
  useEffect(() => {
    try {
      sessionStorage.setItem('aazdoh_agent_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    setInputMessage('');
    const newHistory: AgentChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newHistory);
    setLoading(true);
    setLiveSteps([]);
    setStreamingReply('');
    setCognitiveWarning(null);

    await agentApi.streamChat(
      {
        message: text,
        history: messages.slice(-6),
      },
      (stepMessage) => {
        setLiveSteps((prev) => {
          if (!prev.includes(stepMessage)) {
            return [...prev, stepMessage];
          }
          return prev;
        });
      },
      (deltaChunk) => {
        setStreamingReply((prev) => prev + deltaChunk);
      },
      (res) => {
        setMessages([...newHistory, { role: 'assistant', content: res.reply }]);
        setLiveSteps([]);
        setStreamingReply('');
        setLoading(false);

        if (res.executedActions && res.executedActions.length > 0) {
          setRecentActions(res.executedActions);
          setUndoAvailable(true);
          queryClient.invalidateQueries({ queryKey: ['commitments'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          showToast(`Agent executed ${res.executedActions.length} action(s)`, 'info');
        } else {
          setRecentActions([]);
          setUndoAvailable(false);
        }

        if (res.cognitiveWarning) {
          setCognitiveWarning(res.cognitiveWarning);
        }
      },
      (errMessage) => {
        setMessages([
          ...newHistory,
          {
            role: 'assistant',
            content: `Sorry, I encountered an issue: ${errMessage}`,
          },
        ]);
        setLiveSteps([]);
        setStreamingReply('');
        setLoading(false);
        showToast(errMessage || 'Failed to communicate with AI Coach', 'error');
      }
    );
  };

  const handleUndo = async () => {
    try {
      setUndoing(true);
      const receipt = await agentApi.undoLast();
      setUndoAvailable(false);
      setRecentActions([]);
      queryClient.invalidateQueries({ queryKey: ['commitments'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      showToast(receipt.description || 'Last agent action reverted', 'success');

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `↩ **Action Reverted**: ${receipt.description || 'The last change has been undone.'}`,
        },
      ]);
    } catch (err: any) {
      showToast(err.message || 'Failed to undo action', 'error');
    } finally {
      setUndoing(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setRecentActions([]);
    setUndoAvailable(false);
    setCognitiveWarning(null);
    try {
      sessionStorage.removeItem('aazdoh_agent_chat_history');
    } catch {}
    showToast('Chat cleared', 'info');
  };

  // Sleek Markdown Parser for formatted assistant bubbles
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul
            key={`ul-${elements.length}`}
            style={{
              margin: '4px 0 8px 0',
              paddingLeft: '6px',
              listStyleType: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {listItems}
          </ul>
        );
        listItems = [];
      }
    };

    const parseInline = (str: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
      let lastIdx = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(str)) !== null) {
        if (match.index > lastIdx) {
          parts.push(str.substring(lastIdx, match.index));
        }
        const token = match[0];
        if (token.startsWith('**') && token.endsWith('**')) {
          parts.push(
            <strong key={match.index} style={{ color: 'var(--text-kehwa-cream)', fontWeight: 700 }}>
              {token.slice(2, -2)}
            </strong>
          );
        } else if (token.startsWith('`') && token.endsWith('`')) {
          parts.push(
            <code
              key={match.index}
              style={{
                background: 'rgba(0,0,0,0.4)',
                color: 'var(--saffron-ember)',
                padding: '2px 5px',
                borderRadius: '4px',
                fontSize: '0.76rem',
                fontFamily: 'monospace',
              }}
            >
              {token.slice(1, -1)}
            </code>
          );
        }
        lastIdx = regex.lastIndex;
      }
      if (lastIdx < str.length) {
        parts.push(str.substring(lastIdx));
      }
      return parts;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        return;
      }

      if (trimmed === '---' || trimmed === '***') {
        flushList();
        elements.push(
          <hr
            key={`hr-${idx}`}
            style={{ border: 'none', borderTop: '1px solid var(--border-walnut-faint)', margin: '8px 0' }}
          />
        );
        return;
      }

      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        flushList();
        const headerText = trimmed.replace(/^#+\s*/, '');
        elements.push(
          <div
            key={`h-${idx}`}
            style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--saffron-ember)',
              margin: '8px 0 3px 0',
            }}
          >
            {parseInline(headerText)}
          </div>
        );
        return;
      }

      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^(\*|-|\d+\.)\s+/, '');
        listItems.push(
          <li
            key={`li-${idx}`}
            style={{
              fontSize: '0.81rem',
              lineHeight: 1.5,
              position: 'relative',
              paddingLeft: '14px',
              color: 'var(--text-parchment-muted)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: '2px',
                top: '7px',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'var(--saffron-ember)',
              }}
            />
            {parseInline(itemText)}
          </li>
        );
        return;
      }

      flushList();
      elements.push(
        <p key={`p-${idx}`} style={{ margin: '0 0 6px 0', fontSize: '0.82rem', lineHeight: 1.55 }}>
          {parseInline(line)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 6, 4, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: 'var(--bg-walnut-surface)',
          borderLeft: '1px solid var(--border-copper-subtle)',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-walnut-faint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(30, 20, 16, 0.8), rgba(20, 13, 10, 0.95))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--chinar-rust), var(--saffron-ember))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(192, 83, 48, 0.4)',
              }}
            >
              <Bot size={18} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-kehwa-cream)' }}>
                  AazDoh AI Coach
                </h3>
                <span
                  style={{
                    fontSize: '0.66rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'var(--bg-walnut-card)',
                    color: 'var(--saffron-ember)',
                    fontWeight: 700,
                    border: '1px solid var(--border-walnut-faint)',
                  }}
                >
                  {user?.aiPersona || 'BALANCED'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}>
                Commit • Do • Report • Reflect
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="btn-outline"
                style={{ padding: '6px 8px', borderRadius: '6px', fontSize: '0.72rem', color: 'var(--text-tweed-dim)' }}
                title="Clear Chat"
              >
                <RotateCcw size={13} />
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-outline"
              style={{ padding: '6px 8px', borderRadius: '6px', fontSize: '0.72rem', color: 'var(--text-parchment-muted)' }}
              title="Close (Esc)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Cognitive Warning Banner */}
        {cognitiveWarning && (
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(234, 179, 8, 0.12)',
              borderBottom: '1px solid rgba(234, 179, 8, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.76rem',
              color: '#FACC15',
            }}
          >
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{cognitiveWarning}</span>
          </div>
        )}

        {/* 1-Click Undo Banner */}
        {undoAvailable && (
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(192, 83, 48, 0.12)',
              borderBottom: '1px solid rgba(192, 83, 48, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              fontSize: '0.78rem',
              color: 'var(--text-kehwa-cream)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color="var(--saffron-ember)" />
              <span>Agent made changes to your commitments.</span>
            </div>
            <button
              onClick={handleUndo}
              disabled={undoing}
              className="btn-primary"
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--chinar-rust)',
              }}
            >
              <Undo2 size={12} />
              <span>{undoing ? 'Reverting...' : 'Undo'}</span>
            </button>
          </div>
        )}

        {/* Messages Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-parchment-muted)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(192, 83, 48, 0.15)',
                  border: '1px solid var(--border-copper-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Sparkles size={22} color="var(--saffron-ember)" />
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '0.94rem', color: 'var(--text-kehwa-cream)', fontWeight: 700 }}>
                High-Candor Execution Coach
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '0.78rem', color: 'var(--text-tweed-dim)', lineHeight: 1.5, maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
                Ask me to audit your day, break down high-friction tasks, or reschedule non-essentials when capacity is tight.
              </p>

              {/* Quick Action Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px', margin: '0 auto' }}>
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(qp.prompt)}
                    style={{
                      padding: '10px 14px',
                      background: 'var(--bg-walnut-card)',
                      border: '1px solid var(--border-walnut-faint)',
                      borderRadius: '8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-copper-subtle)';
                      e.currentTarget.style.background = 'rgba(192, 83, 48, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-walnut-faint)';
                      e.currentTarget.style.background = 'var(--bg-walnut-card)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Flame size={14} color="var(--saffron-ember)" />
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-kehwa-cream)', fontWeight: 600 }}>
                        {qp.label}
                      </span>
                    </div>
                    <ArrowRight size={13} color="var(--text-tweed-dim)" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '12px 16px',
                    borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background:
                      m.role === 'user'
                        ? 'linear-gradient(135deg, var(--chinar-rust), #A03D20)'
                        : 'var(--bg-walnut-card)',
                    color: m.role === 'user' ? '#FFFFFF' : 'var(--text-kehwa-cream)',
                    border:
                      m.role === 'user'
                        ? 'none'
                        : '1px solid var(--border-walnut-faint)',
                    fontSize: '0.84rem',
                    lineHeight: 1.55,
                    boxShadow: 'var(--shadow-warm-sm)',
                  }}
                >
                  {m.role === 'user' ? m.content : renderFormattedContent(m.content)}
                </div>
              </div>
            ))
          )}

          {/* Live Streaming Response Bubble (Word-by-word) */}
          {streamingReply && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              <div
                style={{
                  maxWidth: '88%',
                  padding: '12px 16px',
                  borderRadius: '12px 12px 12px 2px',
                  background: 'var(--bg-walnut-card)',
                  color: 'var(--text-kehwa-cream)',
                  border: '1px solid var(--border-copper-subtle)',
                  fontSize: '0.84rem',
                  lineHeight: 1.55,
                  boxShadow: 'var(--shadow-warm-sm)',
                }}
              >
                {renderFormattedContent(streamingReply)}
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '13px',
                    background: 'var(--saffron-ember)',
                    marginLeft: '4px',
                    verticalAlign: 'middle',
                    animation: 'pulse 1s infinite',
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Pills from most recent response */}
          {recentActions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tweed-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                Actions Executed
              </span>
              {recentActions.map((action, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-walnut-faint)',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    color: 'var(--saffron-ember)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Zap size={13} style={{ flexShrink: 0 }} />
                  <span>{action.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Live Execution Stepper */}
          {loading && (
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(25, 17, 13, 0.85)',
                border: '1px solid var(--border-copper-subtle)',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                animation: 'fadeIn 0.2s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--saffron-ember)',
                    boxShadow: '0 0 8px var(--saffron-ember)',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-kehwa-cream)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Executing Plan & Tools
                </span>
              </div>

              {liveSteps.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                  {liveSteps.map((step, idx) => {
                    const isLast = idx === liveSteps.length - 1;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.78rem',
                          color: isLast ? 'var(--text-kehwa-cream)' : 'var(--text-parchment-muted)',
                        }}
                      >
                        {isLast ? (
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              border: '2px solid var(--border-walnut-faint)',
                              borderTopColor: 'var(--saffron-ember)',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <CheckCircle2 size={13} color="#10B981" style={{ flexShrink: 0 }} />
                        )}
                        <span style={{ fontWeight: isLast ? 600 : 400 }}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tweed-dim)', fontSize: '0.78rem' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      border: '2px solid var(--border-walnut-faint)',
                      borderTopColor: 'var(--saffron-ember)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      flexShrink: 0,
                    }}
                  />
                  <span>Initializing agent reasoning...</span>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border-walnut-faint)',
            background: 'var(--bg-walnut-card)',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <input
              ref={inputRef}
              type="text"
              className="input-field"
              placeholder="Ask coach to audit, reschedule, or break down tasks..."
              value={inputMessage}
              maxLength={500}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '0.84rem',
                borderRadius: '8px',
                background: 'var(--bg-walnut-surface)',
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="btn-primary"
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !inputMessage.trim() || loading ? 0.5 : 1,
              }}
              title="Send Prompt"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
