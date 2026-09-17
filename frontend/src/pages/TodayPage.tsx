import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Commitment, commitmentApi, DayPhase } from '../api/commitmentApi';
import { DailyProgressHeader } from '../components/commitment/DailyProgressHeader';
import { CommitmentCard } from '../components/commitment/CommitmentCard';
import { AddCommitmentModal } from '../components/commitment/AddCommitmentModal';
import { EditCommitmentModal } from '../components/commitment/EditCommitmentModal';
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
  Trophy,
  SunMedium,
  Sunrise,
  Sun,
  Moon,
  Layers
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
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('active');
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(false);
  const [isPostponedCollapsed, setIsPostponedCollapsed] = useState(false);
  const [isCatchUpDismissed, setIsCatchUpDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(`catchup_dismissed_${yesterdayStr}`) === 'true';
    } catch {
      return false;
    }
  });
  const [reviewDate, setReviewDate] = useState<string>(todayStr);

  const dismissCatchUp = useCallback(() => {
    setIsCatchUpDismissed(true);
    try {
      sessionStorage.setItem(`catchup_dismissed_${yesterdayStr}`, 'true');
    } catch {}
  }, [yesterdayStr]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);
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
    staleTime: 1000 * 30,
  });

  const refreshCommitments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['commitments'] });
    queryClient.invalidateQueries({ queryKey: ['unreadSummary'] });
  }, [queryClient]);

  // Categorize commitments for smart visual grouping (memoized)
  const activeList = useMemo(() => commitments.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS'), [commitments]);
  const completedList = useMemo(() => commitments.filter(c => c.status === 'COMPLETED'), [commitments]);
  const postponedList = useMemo(() => commitments.filter(c => c.status === 'POSTPONED'), [commitments]);
  const missedList = useMemo(() => commitments.filter(c => c.status === 'MISSED'), [commitments]);

  // Group active commitments by optional Day Phase
  const morningList = useMemo(() => activeList.filter(c => c.dayPhase === 'MORNING'), [activeList]);
  const dayList = useMemo(() => activeList.filter(c => c.dayPhase === 'DAY'), [activeList]);
  const eveningList = useMemo(() => activeList.filter(c => c.dayPhase === 'EVENING'), [activeList]);
  const anytimeList = useMemo(() => activeList.filter(c => !c.dayPhase || c.dayPhase === 'ANYTIME'), [activeList]);

  // Drag and Drop state for moving cards across Day Phases
  const [draggedCommitmentId, setDraggedCommitmentId] = useState<string | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<DayPhase | 'ANYTIME' | null>(null);

  const handleDragStart = useCallback((_e: React.DragEvent, commitment: Commitment) => {
    setDraggedCommitmentId(commitment.id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedCommitmentId(null);
    setActiveDropTarget(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, phase: DayPhase | 'ANYTIME') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setActiveDropTarget(prev => (prev === phase ? prev : phase));
  }, []);

  const handleDragLeave = useCallback((_e: React.DragEvent, phase: DayPhase | 'ANYTIME') => {
    setActiveDropTarget(prev => (prev === phase ? null : prev));
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetPhase: DayPhase | 'ANYTIME') => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedCommitmentId;
    setDraggedCommitmentId(null);
    setActiveDropTarget(null);

    if (!id) return;
    const targetItem = commitments.find(c => c.id === id);
    if (!targetItem) return;

    const newPhase = targetPhase === 'ANYTIME' ? null : targetPhase;
    if (targetItem.dayPhase === newPhase) return;

    // Optimistically update React Query cache
    queryClient.setQueryData(['commitments', selectedDate], (old: Commitment[] | undefined) => {
      if (!old) return old;
      return old.map(c => c.id === id ? { ...c, dayPhase: newPhase } : c);
    });

    try {
      await commitmentApi.update(id, { dayPhase: targetPhase });
      const phaseName = targetPhase === 'MORNING' ? '🌅 Morning' : targetPhase === 'DAY' ? '☀️ Day' : targetPhase === 'EVENING' ? '🌙 Evening' : '📋 Anytime';
      showToast(`Moved to ${phaseName}`, 'info');
    } catch (err: any) {
      showToast('Failed to update phase', 'error');
      refreshCommitments();
    }
  }, [draggedCommitmentId, commitments, selectedDate, queryClient, showToast, refreshCommitments]);

  const totalFocusMinutes = useMemo(() => activeList.filter(c => c.category !== 'ROUTINE').reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0), [activeList]);
  const totalCompletedMinutes = useMemo(() => completedList.filter(c => c.category !== 'ROUTINE').reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0), [completedList]);

  // Check for unreviewed tasks from yesterday (excluding already reviewed, postponed, or completed tasks)
  const unreviewedYesterday = useMemo(() => yesterdayCommitments.filter(
    c => !c.isReviewed && !(c as any).reviewed && c.status !== 'POSTPONED' && c.status !== 'COMPLETED' && (c.status === 'MISSED' || c.status === 'PENDING')
  ), [yesterdayCommitments]);
  const unreviewedYesterdayCount = unreviewedYesterday.length;
  const showCatchUpBanner = selectedDate === todayStr && !isCatchUpDismissed && unreviewedYesterdayCount > 0;

  const handleStartCatchUp = useCallback(() => {
    setReviewDate(yesterdayStr);
    setIsReviewModalOpen(true);
  }, [yesterdayStr]);

  const handleOpenStandardReview = useCallback(() => {
    setReviewDate(selectedDate);
    setIsReviewModalOpen(true);
  }, [selectedDate]);

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

  const activeReviewCommitments = useMemo(() => {
    return reviewDate === selectedDate 
      ? commitments 
      : (reviewDate === yesterdayStr ? unreviewedYesterday : commitments);
  }, [reviewDate, selectedDate, commitments, yesterdayStr, unreviewedYesterday]);

  const handleOpenDiscussion = useCallback((c: Commitment) => {
    setDiscussionCommitment(c);
  }, []);

  const handlePostponeClick = useCallback((c: Commitment) => {
    setPostponingCommitment(c);
  }, []);

  const unreadCommitmentIds = unreadSummary?.unreadCommitmentIds;
  const renderCard = useCallback((commitment: Commitment) => {
    const isUnread = !!commitment.hasUnreadDiscussion || !!(unreadCommitmentIds?.includes(commitment.id));
    const enriched = isUnread ? { ...commitment, hasUnreadDiscussion: true } : commitment;
    return (
      <CommitmentCard
        key={commitment.id}
        commitment={enriched}
        onRefresh={refreshCommitments}
        onOpenDiscussion={handleOpenDiscussion}
        onPostponeClick={handlePostponeClick}
        onEditClick={(c) => setEditingCommitment(c)}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        isDraggable={true}
      />
    );
  }, [unreadCommitmentIds, refreshCommitments, handleOpenDiscussion, handlePostponeClick, handleDragStart, handleDragEnd]);

  const renderPhaseBlock = (
    phase: DayPhase | 'ANYTIME',
    title: string,
    icon: React.ReactNode,
    items: Commitment[],
    color: string,
    accentBg: string
  ) => {
    const isTarget = activeDropTarget === phase;
    const isDraggingAny = draggedCommitmentId !== null;
    const phaseTotalMins = items.reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0);

    return (
      <div
        key={phase}
        onDragOver={(e) => handleDragOver(e, phase)}
        onDragLeave={(e) => handleDragLeave(e, phase)}
        onDrop={(e) => handleDrop(e, phase)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: isTarget 
            ? 'rgba(226, 149, 59, 0.12)' 
            : isDraggingAny 
            ? 'rgba(26, 17, 13, 0.45)' 
            : 'rgba(26, 17, 13, 0.25)',
          border: isTarget
            ? '1.5px dashed var(--saffron-ember)'
            : isDraggingAny
            ? '1px dashed rgba(226, 149, 59, 0.3)'
            : '1px solid var(--border-walnut-faint)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isTarget ? '0 0 20px rgba(226, 149, 59, 0.2)' : 'none',
        }}
      >
        {/* Phase Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: accentBg,
              color: color,
            }}>
              {icon}
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-kehwa-cream)' }}>
              {title}
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '10px',
              background: items.length > 0 ? accentBg : 'rgba(255,255,255,0.05)',
              color: items.length > 0 ? color : 'var(--text-tweed-dim)',
            }}>
              {items.length}
            </span>
          </div>

          {items.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tweed-dim)', fontWeight: 600 }}>
              ~{(phaseTotalMins / 60).toFixed(1)}h planned
            </span>
          )}
        </div>

        {/* Phase Cards or Empty Drop Placeholder */}
        {items.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map(renderCard)}
          </div>
        ) : (
          <div
            style={{
              padding: isDraggingAny ? '18px 12px' : '12px 12px',
              borderRadius: '6px',
              border: '1px dashed rgba(140, 130, 122, 0.22)',
              textAlign: 'center',
              color: isTarget ? 'var(--saffron-ember)' : 'var(--text-tweed-dim)',
              fontSize: '0.78rem',
              fontWeight: isTarget ? 700 : 500,
              background: isTarget ? 'rgba(226, 149, 59, 0.08)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {isTarget
              ? `Drop here to assign to ${title}`
              : isDraggingAny
              ? `Drop card here for ${title}`
              : `No commitments scheduled for ${title}. Drag cards here anytime.`}
          </div>
        )}
      </div>
    );
  };

  const renderActiveCommitmentsWithPhases = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {renderPhaseBlock(
        'MORNING',
        'Morning Focus',
        <Sunrise size={14} color="var(--saffron-ember)" />,
        morningList,
        'var(--saffron-ember)',
        'rgba(226, 149, 59, 0.15)'
      )}
      {renderPhaseBlock(
        'DAY',
        'Day Focus',
        <Sun size={14} color="#FBBF24" />,
        dayList,
        '#FBBF24',
        'rgba(251, 191, 36, 0.15)'
      )}
      {renderPhaseBlock(
        'EVENING',
        'Evening Focus',
        <Moon size={14} color="#A78BFA" />,
        eveningList,
        '#A78BFA',
        'rgba(167, 139, 250, 0.15)'
      )}
      {(anytimeList.length > 0 || draggedCommitmentId !== null) && renderPhaseBlock(
        'ANYTIME',
        'Flexible / Anytime',
        <Layers size={14} color="var(--text-parchment-muted)" />,
        anytimeList,
        'var(--text-parchment-muted)',
        'rgba(140, 130, 122, 0.15)'
      )}
    </div>
  );

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

      {/* Morning Accountability Catch-Up Banner */}
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
            <SunMedium size={26} color="var(--saffron-ember)" style={{ flexShrink: 0 }} />
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
              <Zap size={14} />
              <span>Quick 30s Catch-Up</span>
            </button>
            <button
              onClick={dismissCatchUp}
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
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: activeFilter === 'all' ? 700 : 500,
              borderRadius: '20px',
              cursor: 'pointer',
              background: activeFilter === 'all' ? 'var(--bg-walnut-surface)' : 'transparent',
              color: activeFilter === 'all' ? 'var(--saffron-ember)' : 'var(--text-parchment-muted)',
              border: `1px solid ${activeFilter === 'all' ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            All Commitments ({commitments.length})
          </button>

          <button
            onClick={() => setActiveFilter('active')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: activeFilter === 'active' ? 700 : 500,
              borderRadius: '20px',
              cursor: 'pointer',
              background: activeFilter === 'active' ? 'var(--bg-walnut-surface)' : 'transparent',
              color: activeFilter === 'active' ? 'var(--saffron-ember)' : 'var(--text-parchment-muted)',
              border: `1px solid ${activeFilter === 'active' ? 'var(--saffron-ember)' : 'var(--border-walnut-faint)'}`,
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Zap size={13} color={activeFilter === 'active' ? 'var(--saffron-ember)' : 'currentColor'} />
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
                border: `1px solid ${activeFilter === 'completed' ? 'rgba(46, 125, 82, 0.5)' : 'var(--border-walnut-faint)'}`,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <CheckCircle2 size={13} color={activeFilter === 'completed' ? '#4ADE80' : 'currentColor'} />
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
                background: activeFilter === 'postponed' ? 'rgba(226, 149, 59, 0.15)' : 'transparent',
                color: activeFilter === 'postponed' ? 'var(--saffron-ember)' : 'var(--text-parchment-muted)',
                border: `1px solid ${activeFilter === 'postponed' ? 'rgba(226, 149, 59, 0.4)' : 'var(--border-walnut-faint)'}`,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <CalendarClock size={13} color={activeFilter === 'postponed' ? 'var(--saffron-ember)' : 'currentColor'} />
              <span>Postponed ({postponedList.length})</span>
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
          /* ⚡ ALL VIEW: Smart Sectioned Layout with Day Phasing */
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
                renderActiveCommitmentsWithPhases()
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
              activeList.length === 0 ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(46, 125, 82, 0.12), rgba(226, 149, 59, 0.08))',
                  border: '1px solid rgba(46, 125, 82, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(46, 125, 82, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4ADE80',
                  }}>
                    <Trophy size={22} />
                  </div>
                  <strong style={{ fontSize: '1.05rem', color: '#4ADE80' }}>
                    Active Focus Clear!
                  </strong>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-parchment-muted)', margin: 0, maxWidth: '360px' }}>
                    All scheduled focus commitments for today are completed or resolved. Excellent operational integrity!
                  </p>
                  {completedList.length > 0 && (
                    <button
                      onClick={() => setActiveFilter('completed')}
                      className="btn-secondary"
                      style={{ marginTop: '6px', fontSize: '0.80rem', padding: '6px 14px' }}
                    >
                      View Kept Commitments ({completedList.length})
                    </button>
                  )}
                </div>
              ) : (
                renderActiveCommitmentsWithPhases()
              )
            )}
            {activeFilter === 'completed' && (
              completedList.length === 0 
                ? <p style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', padding: '30px 0' }}>No completed commitments yet.</p>
                : completedList.map(renderCard)
            )}
            {activeFilter === 'postponed' && (
              postponedList.length === 0 
                ? <p style={{ textAlign: 'center', color: 'var(--text-tweed-dim)', padding: '30px 0' }}>No postponed commitments.</p>
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

      <EditCommitmentModal
        isOpen={!!editingCommitment}
        commitment={editingCommitment}
        onClose={() => setEditingCommitment(null)}
        onSuccess={refreshCommitments}
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
        isYesterdayCatchUp={reviewDate === yesterdayStr}
        onClose={() => {
          setIsReviewModalOpen(false);
          refreshCommitments();
        }}
        onSuccess={() => {
          if (reviewDate === yesterdayStr) {
            dismissCatchUp();
          }
          refreshCommitments();
        }}
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
