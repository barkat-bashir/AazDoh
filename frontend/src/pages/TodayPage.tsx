import React, { useState, useEffect } from 'react';
import { Commitment, commitmentApi } from '../api/commitmentApi';
import { DailyProgressHeader } from '../components/commitment/DailyProgressHeader';
import { CommitmentCard } from '../components/commitment/CommitmentCard';
import { AddCommitmentModal } from '../components/commitment/AddCommitmentModal';
import { PostponeCommitmentModal } from '../components/commitment/PostponeCommitmentModal';
import { DailyReviewModal } from '../components/review/DailyReviewModal';
import { CommitmentDiscussionModal } from '../components/partnership/CommitmentDiscussionModal';
import { useToast } from '../context/ToastContext';
import { CalendarCheck, Plus, Sparkles } from 'lucide-react';

interface TodayPageProps {
  onOpenAi: () => void;
}

export const TodayPage: React.FC<TodayPageProps> = ({ onOpenAi }) => {
  const { showToast } = useToast();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [postponingCommitment, setPostponingCommitment] = useState<Commitment | null>(null);
  const [discussionCommitment, setDiscussionCommitment] = useState<Commitment | null>(null);

  useEffect(() => {
    loadCommitments(selectedDate);
  }, [selectedDate]);

  const loadCommitments = async (date: string) => {
    try {
      setLoading(true);
      const list = await commitmentApi.getToday(date);
      setCommitments(list);
    } catch (err: any) {
      showToast('Could not load commitments', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Progress and Action Header */}
      <DailyProgressHeader
        commitments={commitments}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenReviewModal={() => setIsReviewModalOpen(true)}
        onOpenAiReview={onOpenAi}
      />

      {/* Commitment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', padding: '40px 0' }}>
            Loading commitments...
          </p>
        ) : commitments.length === 0 ? (
          <div className="harud-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-tweed-dim)' }}>
            <CalendarCheck size={48} color="var(--border-copper-subtle)" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-kehwa-cream)' }}>No Commitments for this day</h3>
            <p style={{ maxWidth: '400px', margin: '8px auto 20px', fontSize: '0.88rem' }}>
              Accountability begins with clear promises. What are the 2 or 3 essential tasks you commit to completing today?
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary"
            >
              <Plus size={16} />
              <span>Create First Commitment</span>
            </button>
          </div>
        ) : (
          commitments.map((commitment) => (
            <CommitmentCard
              key={commitment.id}
              commitment={commitment}
              onRefresh={() => loadCommitments(selectedDate)}
              onOpenDiscussion={(c) => setDiscussionCommitment(c)}
              onPostponeClick={(c) => setPostponingCommitment(c)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <AddCommitmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => loadCommitments(selectedDate)}
        selectedDate={selectedDate}
        onTriggerAiPlanReview={onOpenAi}
      />

      <DailyReviewModal
        commitments={commitments}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => loadCommitments(selectedDate)}
      />

      <PostponeCommitmentModal
        commitment={postponingCommitment}
        isOpen={!!postponingCommitment}
        onClose={() => setPostponingCommitment(null)}
        onSuccess={() => loadCommitments(selectedDate)}
      />

      <CommitmentDiscussionModal
        commitment={discussionCommitment}
        isOpen={!!discussionCommitment}
        onClose={() => setDiscussionCommitment(null)}
      />
    </div>
  );
};
