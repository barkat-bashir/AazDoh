import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Commitment, commitmentApi } from '../api/commitmentApi';
import { DailyProgressHeader } from '../components/commitment/DailyProgressHeader';
import { CommitmentCard } from '../components/commitment/CommitmentCard';
import { AddCommitmentModal } from '../components/commitment/AddCommitmentModal';
import { PostponeCommitmentModal } from '../components/commitment/PostponeCommitmentModal';
import { DailyReviewModal } from '../components/review/DailyReviewModal';
import { CommitmentDiscussionModal } from '../components/partnership/CommitmentDiscussionModal';
import { PlanStressTestModal } from '../components/ai/PlanStressTestModal';
import { aiApi, PlanStressTestResponse } from '../api/aiApi';
import { useToast } from '../context/ToastContext';
import { CalendarCheck, Plus } from 'lucide-react';

interface TodayPageProps {
  onOpenAi?: () => void;
}

export const TodayPage: React.FC<TodayPageProps> = ({ onOpenAi }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [postponingCommitment, setPostponingCommitment] = useState<Commitment | null>(null);
  const [discussionCommitment, setDiscussionCommitment] = useState<Commitment | null>(null);

  // 60-Second AI Plan Stress-Test Modal
  const [isStressTestOpen, setIsStressTestOpen] = useState(false);
  const [stressTestData, setStressTestData] = useState<PlanStressTestResponse | null>(null);
  const [isStressTestLoading, setIsStressTestLoading] = useState(false);

  // TanStack Query: in-memory caching (0ms tab switching)
  const { data: commitments = [], isLoading: loading } = useQuery({
    queryKey: ['commitments', selectedDate],
    queryFn: () => commitmentApi.getToday(selectedDate),
  });

  const refreshCommitments = () => {
    queryClient.invalidateQueries({ queryKey: ['commitments'] });
    queryClient.invalidateQueries({ queryKey: ['unreadSummary'] });
  };

  const handleRunFeasibilityCheck = async (
    defenseText?: string, 
    overrideSprint?: boolean, 
    forceOpenModal: boolean = false
  ) => {
    if (forceOpenModal) {
      setIsStressTestOpen(true);
    }
    try {
      setIsStressTestLoading(true);
      const response = await aiApi.stressTestPlan({
        date: selectedDate,
        quickDefense: defenseText,
        overrideSprint: overrideSprint,
      });
      setStressTestData(response);

      const isStressed = 
        response.riskScore >= 45 || 
        response.plannedHours > response.historicalCapacityHours ||
        response.proposedOptimizations?.some(p => p.suggestedAction === 'TRIM' || p.suggestedAction === 'SPLIT' || p.suggestedAction === 'SHIFT_TO_TOMORROW');

      if (isStressed) {
        setIsStressTestOpen(true);
      }
    } catch (err: any) {
      if (forceOpenModal) {
        showToast('Could not run plan feasibility check', 'error');
      }
    } finally {
      setIsStressTestLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Progress and Action Header */}
      <DailyProgressHeader
        commitments={commitments}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenReviewModal={() => setIsReviewModalOpen(true)}
        onOpenAiReview={() => handleRunFeasibilityCheck(undefined, undefined, true)}
      />

      {/* Commitment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', padding: '40px 0' }}>
            Loading commitments...
          </p>
        ) : commitments.length === 0 ? (
          <div className="harud-card" style={{ padding: 'clamp(36px, 7vw, 52px) 20px', textAlign: 'center', color: 'var(--text-tweed-dim)' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(192, 83, 48, 0.15), rgba(226, 149, 59, 0.1))',
              border: '1px solid var(--border-copper-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CalendarCheck size={28} color="var(--saffron-ember)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-kehwa-cream)', fontWeight: 700 }}>
              {selectedDate === todayStr ? 'No Commitments Yet Today' : `No Commitments for ${selectedDate}`}
            </h3>
            <p style={{ maxWidth: '380px', margin: '8px auto 22px', fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text-parchment-muted)' }}>
              Accountability begins with clear promises. What are the 2 or 3 essential tasks you commit to completing?
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.92rem' }}
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
              onRefresh={refreshCommitments}
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
        onSuccess={refreshCommitments}
        selectedDate={selectedDate}
        onTriggerAiPlanReview={() => handleRunFeasibilityCheck()}
      />

      <PlanStressTestModal
        isOpen={isStressTestOpen}
        onClose={() => setIsStressTestOpen(false)}
        stressTestData={stressTestData}
        isLoading={isStressTestLoading}
        onPlanApplied={refreshCommitments}
        onReStressTest={(defenseText, override) => handleRunFeasibilityCheck(defenseText, override, true)}
      />

      <DailyReviewModal
        commitments={commitments}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={refreshCommitments}
      />

      <PostponeCommitmentModal
        commitment={postponingCommitment}
        isOpen={!!postponingCommitment}
        onClose={() => setPostponingCommitment(null)}
        onSuccess={refreshCommitments}
      />

      <CommitmentDiscussionModal
        commitment={discussionCommitment}
        isOpen={!!discussionCommitment}
        onClose={() => {
          setDiscussionCommitment(null);
          refreshCommitments();
          queryClient.invalidateQueries({ queryKey: ['unreadSummary'] });
        }}
      />
    </div>
  );
};
