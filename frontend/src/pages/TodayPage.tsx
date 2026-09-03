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
import { CalendarCheck, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { discussionApi } from '../api/discussionApi';

interface TodayPageProps {
  onOpenAi?: () => void;
}

export const TodayPage: React.FC<TodayPageProps> = ({ onOpenAi }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const yesterdayStr = getYesterdayStr();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isCatchUpDismissed, setIsCatchUpDismissed] = useState(false);
  const [reviewDate, setReviewDate] = useState<string>(todayStr);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [postponingCommitment, setPostponingCommitment] = useState<Commitment | null>(null);
  const [discussionCommitment, setDiscussionCommitment] = useState<Commitment | null>(null);

  // 60-Second AI Plan Stress-Test Modal
  const [isStressTestOpen, setIsStressTestOpen] = useState(false);
  const [stressTestData, setStressTestData] = useState<PlanStressTestResponse | null>(null);
  const [isStressTestLoading, setIsStressTestLoading] = useState(false);

  // TanStack Query: in-memory caching for active date
  const { data: commitments = [], isLoading: loading } = useQuery({
    queryKey: ['commitments', selectedDate],
    queryFn: () => commitmentApi.getToday(selectedDate),
  });

  // Query yesterday's commitments for the morning catch-up check
  const { data: yesterdayCommitments = [] } = useQuery({
    queryKey: ['commitments', yesterdayStr],
    queryFn: () => commitmentApi.getToday(yesterdayStr),
    enabled: selectedDate === todayStr && !isCatchUpDismissed,
  });

  const { data: unreadSummary } = useQuery({
    queryKey: ['unreadSummary'],
    queryFn: () => discussionApi.getUnreadSummary(),
  });

  const refreshCommitments = () => {
    queryClient.invalidateQueries({ queryKey: ['commitments'] });
    queryClient.invalidateQueries({ queryKey: ['unreadSummary'] });
  };

  // Check for unreviewed tasks from yesterday (MISSED or PENDING past midnight)
  const unreviewedYesterday = yesterdayCommitments.filter(
    c => c.status === 'MISSED' || c.status === 'PENDING'
  );
  const unreviewedYesterdayCount = unreviewedYesterday.length;
  const showCatchUpBanner = selectedDate === todayStr && !isCatchUpDismissed && unreviewedYesterdayCount > 0;

  const handleStartCatchUp = () => {
    setReviewDate(yesterdayStr);
    setIsReviewModalOpen(true);
  };

  const handleOpenStandardReview = () => {
    setReviewDate(selectedDate);
    setIsReviewModalOpen(true);
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

  const activeReviewCommitments = reviewDate === selectedDate 
    ? commitments 
    : (reviewDate === yesterdayStr ? yesterdayCommitments : commitments);

  return (
    <div className="page-container">
      {/* Progress and Action Header */}
      <DailyProgressHeader
        commitments={commitments}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenReviewModal={handleOpenStandardReview}
        onOpenAiReview={() => handleRunFeasibilityCheck(undefined, undefined, true)}
      />

      {/* 🌅 Morning Accountability Catch-Up Banner */}
      {showCatchUpBanner && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(226, 149, 59, 0.16), rgba(192, 83, 48, 0.1))',
          border: '1.5px solid rgba(226, 149, 59, 0.42)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
          boxShadow: '0 4px 16px rgba(226, 149, 59, 0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🌅</span>
            <div>
              <strong style={{ fontSize: '0.92rem', color: 'var(--saffron-ember)', display: 'block' }}>
                Yesterday's Accountability Catch-Up
              </strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-parchment-muted)' }}>
                You have <strong>{unreviewedYesterdayCount} unreviewed commitment{unreviewedYesterdayCount > 1 ? 's' : ''}</strong> from yesterday. A 30-second review keeps your metrics, partner accountability, and streak intact!
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleStartCatchUp}
              className="btn-primary"
              style={{ padding: '8px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} />
              <span>⚡ Quick 30s Catch-Up</span>
            </button>
            <button
              onClick={() => setIsCatchUpDismissed(true)}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.84rem' }}
              title="Dismiss and focus on today"
            >
              Skip
            </button>
          </div>
        </div>
      )}

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
          commitments.map((commitment) => {
            const isUnread = !!commitment.hasUnreadDiscussion || !!(unreadSummary?.unreadCommitmentIds?.includes(commitment.id));
            const enriched = isUnread ? { ...commitment, hasUnreadDiscussion: true } : commitment;
            return (
              <CommitmentCard
                key={commitment.id}
                commitment={enriched}
                onRefresh={refreshCommitments}
                onOpenDiscussion={(c) => setDiscussionCommitment(c)}
                onPostponeClick={(c) => setPostponingCommitment(c)}
              />
            );
          })
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
        commitments={activeReviewCommitments}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          refreshCommitments();
        }}
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

export default TodayPage;
