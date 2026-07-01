import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  createDefaultProgress,
  loadProgress,
  markLetterLearned,
  markLetterPracticed,
  markSurahPracticed,
  recordGameCompleted,
  resetProgress,
  saveProgress,
  updateSettings,
} from '@/services/progressService';
import type { GameId } from '@/types/game';
import type { ChildProgress, ProgressSettings } from '@/types/progress';

interface ProgressContextValue {
  progress: ChildProgress;
  loading: boolean;
  completeLetter: (letterId: string) => Promise<void>;
  practiceLetter: (letterId: string) => Promise<void>;
  completeGame: (gameId: GameId) => Promise<void>;
  practiceSurah: (surahNumber: number) => Promise<void>;
  setSettings: (settings: Partial<ProgressSettings>) => Promise<void>;
  reset: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<ChildProgress>(createDefaultProgress());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadProgress()
      .then((loaded) => {
        if (mounted) {
          setProgress(loaded);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (nextProgress: ChildProgress) => {
    setProgress(nextProgress);
    await saveProgress(nextProgress);
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      loading,
      completeLetter: async (letterId) => persist(markLetterLearned(progress, letterId)),
      practiceLetter: async (letterId) => persist(markLetterPracticed(progress, letterId)),
      completeGame: async (gameId) => persist(recordGameCompleted(progress, gameId)),
      practiceSurah: async (surahNumber) => persist(markSurahPracticed(progress, surahNumber)),
      setSettings: async (settings) => persist(updateSettings(progress, settings)),
      reset: async () => {
        const fresh = await resetProgress();
        setProgress(fresh);
      },
    }),
    [loading, persist, progress],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = (): ProgressContextValue => {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error('useProgress must be used inside ProgressProvider');
  }

  return context;
};
