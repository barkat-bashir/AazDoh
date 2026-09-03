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
import { 
  CalendarCheck, 
  Plus, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  CalendarClock, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Trophy
} from 'lucide-react';
import { discussionApi } from '../api/discussionApi';

import { getLocalTodayStr, getLocalYesterdayStr } from '../utils/dateUtils';

interface TodayPageProps {
  onOpenAi?: () => void;
}

type TaskFilter = 'all' | 'active' | 'completed' | 'postponed' | 'missed';

export const TodayPage: React.FC<TodayPageProps> = ({ onOpenAi }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const todayStr = getLocalTodayStr();
  const yesterdayStr = getLocalYesterdayStr();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(false);
  const [isPostponedCollapsed, setIsPostponedCollapsed] = useState(false);
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

  // Categorize commitments for smart visual grouping
  const activeList = commitments.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS');
  const completedList = commitments.filter(c => c.status === 'COMPLETED');
  const postponedList = commitments.filter(c => c.status === 'POSTPONED');
  const missedList = commitments.filter(c => c.status === 'MISSED');

  const totalFocusMinutes = activeList.reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0);
  const totalCompletedMinutes = completedList.reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0);

  // Check for unreviewed tasks from yesterday (excluding already reviewed, postponed, or completed tasks)
  const unreviewedYesterday = yesterdayCommitments.filter(
    c => !c.isReviewed && c.status !== 'POSTPONED' && c.status !== 'COMPLETED' && (c.status === 'MISSED' || c.status === 'PENDING')
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

  const renderCard = (commitment: Commitment) => {
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
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

      {/* 🏷️ Smart Filter Pills */}
      {commitments.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: activeFilter === 'all' ? 700 : 500,
              borderRadius: '20px',
              cursor: 'pointer',
              background: activeFilter === 'all' ? 'var(--bg-walnut-card)' : 'transparent',
              color: activeFilter === 'all' ? 'var(--text-kehwa-cream)' : 'var(--text-parchment-muted)',
              border: `1px solid ${activeFilter === 'all' ? 'var(--border-copper-subtle)' : 'var(--border-walnut-faint)'}`,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            All ({commitments.length})
          </button>

          <button
            onClick={() => setActiveFilter('active')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: activeFilter === 'active' ? 700 : 500,
              borderRadius: '20px',
              cursor: 'pointer',
              background: activeFilter === 'active' ? 'rgba(226, 149, 59, 0.18)' : 'transparent',
              color: activeFilter === 'active' ? 'var(--saffron-ember)' : 'var(--text-parchment-muted)',
              border: `1px solid ${activeFilter === 'active' ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Zap size={13} />
            <span>Active Focus ({activeList.length})</span>
          </button>

          {completedList.length > 0 && (
            <button
              onClick={() => setActiveFilter('completed')}
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: activeFilter === 'completed' ? 700 : 500,
                borderRadius: '20px',
                cursor: 'pointer',
                background: activeFilter === 'completed' ? 'rgba(46, 125, 82, 0.2)' : 'transparent',
                color: activeFilter === 'completed' ? '#4ADE80' : 'var(--text-parchment-muted)',
                border: `1px solid ${activeFilter === 'completed' ? 'var(--pine-emerald)' : 'var(--border-walnut-faint)'}`,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <CheckCircle2 size={13} />
              <span>Kept ({completedList.length})</span>
            </button>
          )}

          {postponedList.length > 0 && (
            <button
              onClick={() => setActiveFilter('postponed')}
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: activeFilter === 'postponed' ? 700 : 500,
                borderRadius: '20px',
                cursor: 'pointer',
                background: activeFilter === 'postponed' ? 'rgba(192, 83, 48, 0.18)' : 'transparent',
                color: activeFilter === 'postponed' ? 'var(--chinar-rust)' : 'var(--text-parchment-muted)',
                border: `1px solid ${activeFilter === 'postponed' ? 'var(--chinar-rust)' : 'var(--border-walnut-faint)'}`,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <CalendarClock size={13} />
              <span>Rescheduled ({postponedList.length})</span>
            </button>
          )}

          {missedList.length > 0 && (
            <button
              onClick={() => setActiveFilter('missed')}
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: activeFilter === 'missed' ? 700 : 500,
                borderRadius: '20px',
                cursor: 'pointer',
                background: activeFilter === 'missed' ? 'rgba(184, 58, 58, 0.2)' : 'transparent',
                color: activeFilter === 'missed' ? '#F87171' : 'var(--text-parchment-muted)',
                border: `1px solid ${activeFilter === 'missed' ? 'var(--crimson-rose)' : 'var(--border-walnut-faint)'}`,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <AlertTriangle size={13} />
              <span>Missed ({missedList.length})</span>
            </button>
          )}
        </div>
      )}

      {/* Main Commitment List / Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', padding: '40px 0' }}>
            Loading commitments...
          </p>
        ) : commitments.length === 0 ? (
          /* Empty State */
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
        ) : activeFilter === 'all' ? (
          /* ⚡ ALL VIEW: Smart Sectioned Layout */
          <>
            {/* 1. Active Focus Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2px 4px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="var(--saffron-ember)" />
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-kehwa-cream)', margin: 0 }}>
                    Active Focus ({activeList.length})
                  </h3>
                </div>
                {activeList.length > 0 && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-tweed-dim)', fontWeight: 600 }}>
                    ~{(totalFocusMinutes / 60).toFixed(1)} hrs planned
                  </span>
                )}
              </div>

              {activeList.length === 0 ? (
                /* Daily Victory State */
                <div style={{
                  background: 'linear-gradient(135deg, rgba(46, 125, 82, 0.12), rgba(226, 149, 59, 0.08))',
                  border: '1px solid rgba(46, 125, 82, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(46, 125, 82, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4ADE80',
                  }}>
                    <Trophy size={20} />
                  </div>
                  <strong style={{ fontSize: '0.98rem', color: '#4ADE80' }}>
                    Active Focus Clear!
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-parchment-muted)', margin: 0, maxWidth: '340px' }}>
                    All scheduled focus commitments for today are completed or resolved. Excellent operational integrity!
                  </p>
                </div>
              ) : (
                activeList.map(renderCard)
              )}
            </div>

            {/* 2. Completed Today (Collapsible Drawer) */}
            {completedList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsCompletedCollapsed(prev => !prev)}
                  style={{
                    background: 'var(--bg-walnut-surface)',
                    border: '1px solid var(--border-walnut-faint)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: 'var(--text-kehwa-cream)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#4ADE80" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>
                      Kept Today ({completedList.length} of {commitments.length})
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-tweed-dim)', marginLeft: '4px' }}>
                      • ~{(totalCompletedMinutes / 60).toFixed(1)} hrs logged
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-tweed-dim)' }}>
                    <span>{isCompletedCollapsed ? 'Show' : 'Hide'}</span>
                    {isCompletedCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                  </div>
                </button>

                {!isCompletedCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {completedList.map(renderCard)}
                  </div>
                )}
              </div>
            )}

            {/* 3. Rescheduled to Future (Collapsible Drawer) */}
            {postponedList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsPostponedCollapsed(prev => !prev)}
                  style={{
                    background: 'rgba(192, 83, 48, 0.08)',
                    border: '1px dashed rgba(192, 83, 48, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: 'var(--text-kehwa-cream)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarClock size={16} color="var(--saffron-ember)" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--saffron-ember)' }}>
                      Rescheduled to Future ({postponedList.length})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-tweed-dim)' }}>
                    <span>{isPostponedCollapsed ? 'Show' : 'Hide'}</span>
                    {isPostponedCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                  </div>
                </button>

                {!isPostponedCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {postponedList.map(renderCard)}
                  </div>
                )}
              </div>
            )}

            {/* 4. Missed Commitments (if any) */}
            {missedList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 4px' }}>
                  <AlertTriangle size={15} color="var(--crimson-rose)" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F87171' }}>
                    Missed Commitments ({missedList.length})
                  </span>
                </div>
                {missedList.map(renderCard)}
              </div>
            )}
          </>
        ) : (
          /* Specific Filter View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeFilter === 'active' && (
              activeList.length === 0 
                ? <p style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', padding: '30px 0' }}>No active commitments remaining.</p>
                : activeList.map(renderCard)
            )}
            {activeFilter === 'completed' && (
              completedList.length === 0 
                ? <p style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', padding: '30px 0' }}>No completed commitments yet.</p>
                : completedList.map(renderCard)
            )}
            {activeFilter === 'postponed' && (
              postponedList.length === 0 
                ? <p style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', padding: '30px 0' }}>No rescheduled commitments for this date.</p>
                : postponedList.map(renderCard)
            )}
            {activeFilter === 'missed' && (
              missedList.length === 0 
                ? <p style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', padding: '30px 0' }}>No missed commitments.</p>
                : missedList.map(renderCard)
            )}
          </div>
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
