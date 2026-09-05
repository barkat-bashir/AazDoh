import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Commitment } from '../api/commitmentApi';
import { focusApi } from '../api/focusApi';

export type FocusMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

interface FocusTimerContextType {
  activeCommitment: Commitment | null;
  isOpen: boolean;
  isMinimized: boolean;
  timeLeftSeconds: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  mode: FocusMode;
  distractionNotes: string[];
  sprintsCompletedToday: number;
  isCompleted: boolean;
  startFocusSession: (commitment: Commitment, initialMinutes?: number) => void;
  startQuickSprint: (minutes?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  addMinutes: (mins: number) => void;
  subtractMinutes: (mins: number) => void;
  setCadence: (mins: number, targetMode?: FocusMode) => void;
  addDistractionNote: (note: string) => void;
  removeDistractionNote: (index: number) => void;
  clearDistractionNotes: () => void;
  minimize: () => void;
  maximize: () => void;
  closeSession: () => void;
}

const FocusTimerContext = createContext<FocusTimerContextType | undefined>(undefined);

// Synthesize pleasant ambient chime using Web Audio API (zero external mp3 dependencies)
const playChimeSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play warm harmonic chord: Fundamental (523.25 Hz - C5) + E5 (659.25 Hz) + G5 (783.99 Hz)
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      const startTime = ctx.currentTime + (idx * 0.08);
      const duration = 1.8;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (err) {
    console.warn('Audio chime playback omitted', err);
  }
};

const sendDesktopNotification = (title: string, body: string) => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch {
      // Safely ignore notification errors on unsupported mobile/embedded browsers
    }
  }
};

const requestNotificationPermission = () => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
};

export const FocusTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCommitment, setActiveCommitment] = useState<Commitment | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<FocusMode>('FOCUS');
  const [distractionNotes, setDistractionNotes] = useState<string[]>([]);
  const [sprintsCompletedToday, setSprintsCompletedToday] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const timerRef = useRef<number | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);
  const startedAtRef = useRef<string>(new Date().toISOString());

  // Handles completion of sprint/break
  const completeSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    targetEndTimeRef.current = null;
    setIsRunning(false);
    setTimeLeftSeconds(0);
    setIsCompleted(true);
    playChimeSound();

    if (mode === 'FOCUS') {
      sendDesktopNotification('⚡ Focus Sprint Complete!', 'Great work! Take a short break to recharge.');
      setSprintsCompletedToday((c) => c + 1);

      // Asynchronously record sprint telemetry to backend
      focusApi.recordSprint({
        commitmentId: activeCommitment?.id,
        durationMinutes: Math.round(totalDurationSeconds / 60),
        actualSecondsSpent: totalDurationSeconds,
        mode: 'FOCUS',
        status: 'COMPLETED',
        distractionsCount: distractionNotes.length,
        distractionNotes: distractionNotes,
        startedAt: startedAtRef.current,
        completedAt: new Date().toISOString(),
      }).catch(err => console.warn('Failed to record sprint telemetry', err));
    } else {
      sendDesktopNotification('🔔 Break Finished', 'Ready to dive into the next focus block?');
    }
  }, [mode, activeCommitment, totalDurationSeconds, distractionNotes]);

  // Synchronizes timer against real-world epoch timestamps (drift & sleep immune)
  const syncWithRealTime = useCallback(() => {
    if (!targetEndTimeRef.current || !isRunning) return;

    const now = Date.now();
    const remainingMs = targetEndTimeRef.current - now;
    const remainingSecs = Math.max(0, Math.ceil(remainingMs / 1000));

    if (remainingSecs <= 0) {
      completeSession();
    } else {
      setTimeLeftSeconds(remainingSecs);
    }
  }, [isRunning, completeSession]);

  // High-frequency tick loop + tab visibility / screen unlock synchronization
  useEffect(() => {
    if (isRunning) {
      // Run interval to update UI
      timerRef.current = window.setInterval(() => {
        syncWithRealTime();
      }, 500);

      // Instantly resync when user returns from another tab or unlocks their screen
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          syncWithRealTime();
        }
      };

      const handleWindowFocus = () => {
        syncWithRealTime();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleWindowFocus);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleWindowFocus);
      };
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, syncWithRealTime]);

  const startFocusSession = useCallback((commitment: Commitment, initialMinutes?: number) => {
    requestNotificationPermission();
    const mins = initialMinutes || commitment.estimatedMinutes || 25;
    const boundedMins = Math.min(Math.max(mins, 5), 180);
    const secs = boundedMins * 60;
    
    startedAtRef.current = new Date().toISOString();
    targetEndTimeRef.current = Date.now() + secs * 1000;
    setActiveCommitment(commitment);
    setMode('FOCUS');
    setTotalDurationSeconds(secs);
    setTimeLeftSeconds(secs);
    setIsRunning(true);
    setIsCompleted(false);
    setIsMinimized(false);
    setIsOpen(true);
  }, []);

  const startQuickSprint = useCallback((minutes: number = 25) => {
    requestNotificationPermission();
    const secs = minutes * 60;
    startedAtRef.current = new Date().toISOString();
    targetEndTimeRef.current = Date.now() + secs * 1000;
    setActiveCommitment(null);
    setMode('FOCUS');
    setTotalDurationSeconds(secs);
    setTimeLeftSeconds(secs);
    setIsRunning(true);
    setIsCompleted(false);
    setIsMinimized(false);
    setIsOpen(true);
  }, []);

  const pause = useCallback(() => {
    if (targetEndTimeRef.current) {
      const remainingSecs = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
      setTimeLeftSeconds(remainingSecs);
    }
    targetEndTimeRef.current = null;
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (timeLeftSeconds > 0) {
      targetEndTimeRef.current = Date.now() + timeLeftSeconds * 1000;
      setIsRunning(true);
    }
  }, [timeLeftSeconds]);

  const reset = useCallback(() => {
    targetEndTimeRef.current = null;
    setIsRunning(false);
    setTimeLeftSeconds(totalDurationSeconds);
    setIsCompleted(false);
  }, [totalDurationSeconds]);

  const addMinutes = useCallback((mins: number) => {
    const additionalSecs = mins * 60;
    if (targetEndTimeRef.current) {
      targetEndTimeRef.current += additionalSecs * 1000;
    }
    setTimeLeftSeconds((prev) => prev + additionalSecs);
    setTotalDurationSeconds((prev) => prev + additionalSecs);
    setIsCompleted(false);
  }, []);

  const subtractMinutes = useCallback((mins: number) => {
    const deductSecs = mins * 60;
    const newSecs = Math.max(60, timeLeftSeconds - deductSecs);
    if (targetEndTimeRef.current) {
      targetEndTimeRef.current = Date.now() + newSecs * 1000;
    }
    setTimeLeftSeconds(newSecs);
    setTotalDurationSeconds((prev) => Math.max(60, prev - deductSecs));
  }, [timeLeftSeconds]);

  const setCadence = useCallback((mins: number, targetMode: FocusMode = 'FOCUS') => {
    const secs = mins * 60;
    targetEndTimeRef.current = Date.now() + secs * 1000;
    setMode(targetMode);
    setTotalDurationSeconds(secs);
    setTimeLeftSeconds(secs);
    setIsCompleted(false);
    setIsRunning(true);
  }, []);

  const addDistractionNote = useCallback((note: string) => {
    if (!note.trim()) return;
    setDistractionNotes((prev) => [note.trim(), ...prev]);
  }, []);

  const removeDistractionNote = useCallback((index: number) => {
    setDistractionNotes((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const clearDistractionNotes = useCallback(() => {
    setDistractionNotes([]);
  }, []);

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximize = useCallback(() => {
    setIsMinimized(false);
    setIsOpen(true);
  }, []);

  const closeSession = useCallback(() => {
    targetEndTimeRef.current = null;
    setIsRunning(false);
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  return (
    <FocusTimerContext.Provider
      value={{
        activeCommitment,
        isOpen,
        isMinimized,
        timeLeftSeconds,
        totalDurationSeconds,
        isRunning,
        mode,
        distractionNotes,
        sprintsCompletedToday,
        isCompleted,
        startFocusSession,
        startQuickSprint,
        pause,
        resume,
        reset,
        addMinutes,
        subtractMinutes,
        setCadence,
        addDistractionNote,
        removeDistractionNote,
        clearDistractionNotes,
        minimize,
        maximize,
        closeSession,
      }}
    >
      {children}
    </FocusTimerContext.Provider>
  );
};

export const useFocusTimer = () => {
  const context = useContext(FocusTimerContext);
  if (!context) {
    throw new Error('useFocusTimer must be used within a FocusTimerProvider');
  }
  return context;
};
