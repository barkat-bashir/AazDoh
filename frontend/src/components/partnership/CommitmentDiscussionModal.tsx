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

export const CommitmentDiscussionModal: React.FC<CommitmentDiscussionModalProps> = ({
  commitment,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
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
    } catch (err: any) {
      showToast(err.message || 'Failed to post message', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!commitment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Commitment Discussion"
      subtitle={`Peer accountability thread for "${commitment.title}"`}
      maxWidth="600px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '480px' }}>
        {/* Commitment brief header */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg-walnut-card)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-walnut-faint)',
          fontSize: '0.86rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <span style={{ color: 'var(--text-kehwa-cream)', fontWeight: 600 }}>{commitment.title}</span>
            <span style={{ color: 'var(--text-tweed-dim)', marginLeft: '8px' }}>({commitment.estimatedMinutes}m)</span>
          </div>
          <span className={`badge ${commitment.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}`}>
            {commitment.status}
          </span>
        </div>

        {/* Message Thread */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '10px 4px',
        }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', marginTop: '40px' }}>
              Loading discussion...
            </p>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', marginTop: '40px' }}>
              <MessageSquare size={32} color="var(--border-copper-subtle)" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.9rem' }}>No messages yet.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tweed-dim)' }}>
                Ask questions about blockers or share progress updates.
              </p>
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
                    maxWidth: '80%',
                    background: isMe ? 'linear-gradient(135deg, #3A2A20, #2E221A)' : 'var(--bg-walnut-card)',
                    border: `1px solid ${isMe ? 'var(--border-copper-subtle)' : 'var(--border-walnut-faint)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    boxShadow: 'var(--shadow-warm-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isMe ? 'var(--saffron-ember)' : 'var(--chinar-rust)',
                    }}>
                      {isMe ? 'You' : msg.authorFullName}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-tweed-dim)' }}>
                      {formattedTime}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-kehwa-cream)', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                    {msg.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Ask your partner or reply with details..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={sending || !newMessage.trim()}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Modal>
  );
};
