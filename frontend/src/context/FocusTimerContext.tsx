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
  const startedAtRef = useRef<string>(new Date().toISOString());

  // Countdown loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsCompleted(true);
            playChimeSound();
            if (mode === 'FOCUS') {
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
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, activeCommitment, totalDurationSeconds, distractionNotes]);

  const startFocusSession = useCallback((commitment: Commitment, initialMinutes?: number) => {
    const mins = initialMinutes || commitment.estimatedMinutes || 25;
    const boundedMins = Math.min(Math.max(mins, 5), 180);
    const secs = boundedMins * 60;
    
    startedAtRef.current = new Date().toISOString();
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
    const secs = minutes * 60;
    startedAtRef.current = new Date().toISOString();
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
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (timeLeftSeconds > 0) {
      setIsRunning(true);
    }
  }, [timeLeftSeconds]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeftSeconds(totalDurationSeconds);
    setIsCompleted(false);
  }, [totalDurationSeconds]);

  const addMinutes = useCallback((mins: number) => {
    const additionalSecs = mins * 60;
    setTimeLeftSeconds((prev) => prev + additionalSecs);
    setTotalDurationSeconds((prev) => prev + additionalSecs);
    setIsCompleted(false);
  }, []);

  const subtractMinutes = useCallback((mins: number) => {
    const deductSecs = mins * 60;
    setTimeLeftSeconds((prev) => Math.max(60, prev - deductSecs));
    setTotalDurationSeconds((prev) => Math.max(60, prev - deductSecs));
  }, []);

  const setCadence = useCallback((mins: number, targetMode: FocusMode = 'FOCUS') => {
    const secs = mins * 60;
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
