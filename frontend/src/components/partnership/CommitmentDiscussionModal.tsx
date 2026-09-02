import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Commitment } from '../../api/commitmentApi';
import { discussionApi, DiscussionMessage } from '../../api/discussionApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Send, MessageSquare, Clock } from 'lucide-react';

interface CommitmentDiscussionModalProps {
  commitment: Commitment | null;
  isOpen: boolean;
  onClose: () => void;
}

import { useQueryClient } from '@tanstack/react-query';

export const CommitmentDiscussionModal: React.FC<CommitmentDiscussionModalProps> = ({
  commitment,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (commitment && isOpen) {
      loadDiscussion();
    }
  }, [commitment, isOpen]);

  const loadDiscussion = async () => {
    if (!commitment) return;
    try {
      setLoading(true);
      const res = await discussionApi.getDiscussion(commitment.id);
      setMessages(res.messages || []);
      // Instantly clear unread badges across navbar and task cards upon opening
      queryClient.invalidateQueries({ queryKey: ['unreadSummary'] });
      queryClient.invalidateQueries({ queryKey: ['partnerOverview'] });
      queryClient.invalidateQueries({ queryKey: ['commitments'] });
    } catch (err: any) {
      showToast('Could not load discussion messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !commitment) return;

    try {
      setSending(true);
      const saved = await discussionApi.postMessage(commitment.id, newMessage.trim());
      setMessages((prev) => [...prev, saved]);
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['unreadSummary'] });
      queryClient.invalidateQueries({ queryKey: ['partnerOverview'] });
      queryClient.invalidateQueries({ queryKey: ['commitments'] });
    } catch (err: any) {
      showToast(err.message || 'Failed to post message', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!commitment) return null;

  const quickPrompts = [
    'Need help unblocking?',
    'Checking in on your progress!',
    'Almost done with this.',
    'On track for today!',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Commitment Discussion"
      subtitle={`Peer accountability thread for "${commitment.title}"`}
      maxWidth="580px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: 'clamp(280px, 50vh, 440px)' }}>
        {/* Commitment brief header */}
        <div style={{
          padding: '10px 14px',
          background: 'var(--bg-walnut-card)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-copper-subtle)',
          fontSize: '0.86rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <span style={{ color: 'var(--text-kehwa-cream)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {commitment.title}
            </span>
            <span style={{ color: 'var(--saffron-ember)', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>
              ({commitment.estimatedMinutes}m)
            </span>
          </div>
          <span className={`badge ${commitment.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}`} style={{ flexShrink: 0 }}>
            {commitment.status}
          </span>
        </div>

        {/* Message Thread */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '4px 2px',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', padding: '30px 0' }}>
              <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.84rem' }}>Loading thread...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', padding: '24px 10px', margin: 'auto 0' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(192, 83, 48, 0.1)',
                border: '1px solid var(--border-copper-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
              }}>
                <MessageSquare size={22} color="var(--saffron-ember)" />
              </div>
              <h4 style={{ fontSize: '0.96rem', color: 'var(--text-kehwa-cream)', margin: '0 0 4px', fontWeight: 700 }}>
                No messages yet
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-parchment-muted)', margin: '0 0 14px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
                Ask questions about blockers, share progress updates, or cheer on your partner.
              </p>

              {/* Quick Prompt Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewMessage(prompt)}
                    className="btn-secondary"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-walnut-card)',
                      borderColor: 'var(--border-walnut-faint)',
                    }}
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.authorId === user?.id;
              const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: isMe ? 'linear-gradient(135deg, #3A2A20, #2E221A)' : 'var(--bg-walnut-card)',
                    border: `1px solid ${isMe ? 'var(--border-copper-subtle)' : 'var(--border-walnut-faint)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    boxShadow: 'var(--shadow-warm-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: isMe ? 'var(--saffron-ember)' : 'var(--chinar-rust)',
                    }}>
                      {isMe ? 'You' : msg.authorFullName}
                    </span>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-tweed-dim)' }}>
                      {formattedTime}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-kehwa-cream)', whiteSpace: 'pre-wrap', lineHeight: 1.4, margin: 0 }}>
                    {msg.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexShrink: 0 }}>
          <input
            type="text"
            className="input-field"
            placeholder="Ask your partner or reply with details..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={sending || !newMessage.trim()}
            style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Send message"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </Modal>
  );
};
