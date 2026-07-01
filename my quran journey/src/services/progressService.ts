import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChildProgress, ProgressSettings, ProgressSummary } from '@/types/progress';

const STORAGE_KEY = 'quranGarden.progress.v1';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const defaultSettings: ProgressSettings = {
  language: 'bilingual',
  audioEnabled: true,
  transliterationEnabled: true,
  reduceSoundEffects: false,
};

export const createDefaultProgress = (): ChildProgress => ({
  lettersLearned: [],
  lettersPracticed: [],
  gamesCompleted: {},
  starsEarned: 0,
  flowersEarned: 0,
  lanternBadges: [],
  surahsPracticed: {},
  harakatUnlocked: ['fatha', 'kasra', 'damma'],
  gentleStreakDays: 0,
  settings: defaultSettings,
});

const unique = (items: string[]): string[] => Array.from(new Set(items));

const touchPracticeDate = (progress: ChildProgress, today = new Date()): ChildProgress => {
  const todayKey = today.toISOString().slice(0, 10);

  if (progress.lastPracticeDate === todayKey) {
    return progress;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  return {
    ...progress,
    gentleStreakDays: progress.lastPracticeDate === yesterdayKey ? progress.gentleStreakDays + 1 : 1,
    lastPracticeDate: todayKey,
  };
};

export const loadProgress = async (
  storage: StorageAdapter = AsyncStorage,
): Promise<ChildProgress> => {
  const raw = await storage.getItem(STORAGE_KEY);

  if (!raw) {
    return createDefaultProgress();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ChildProgress>;
    return {
      ...createDefaultProgress(),
      ...parsed,
      lettersLearned: unique(parsed.lettersLearned ?? []),
      lettersPracticed: unique(parsed.lettersPracticed ?? []),
      lanternBadges: unique(parsed.lanternBadges ?? []),
      harakatUnlocked: unique(parsed.harakatUnlocked ?? ['fatha', 'kasra', 'damma']),
      settings: {
        ...defaultSettings,
        ...(parsed.settings ?? {}),
      },
    };
  } catch {
    return createDefaultProgress();
  }
};

export const saveProgress = async (
  progress: ChildProgress,
  storage: StorageAdapter = AsyncStorage,
): Promise<void> => {
  await storage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const resetProgress = async (storage: StorageAdapter = AsyncStorage): Promise<ChildProgress> => {
  await storage.removeItem(STORAGE_KEY);
  return createDefaultProgress();
};

export const markLetterLearned = (progress: ChildProgress, letterId: string): ChildProgress =>
  touchPracticeDate({
    ...progress,
    lettersLearned: unique([...progress.lettersLearned, letterId]),
    lettersPracticed: unique([...progress.lettersPracticed, letterId]),
    starsEarned: progress.lettersLearned.includes(letterId)
      ? progress.starsEarned
      : progress.starsEarned + 1,
  });

export const markLetterPracticed = (progress: ChildProgress, letterId: string): ChildProgress =>
  touchPracticeDate({
    ...progress,
    lettersPracticed: unique([...progress.lettersPracticed, letterId]),
    flowersEarned: progress.flowersEarned + 1,
  });

export const recordGameCompleted = (progress: ChildProgress, gameId: string): ChildProgress =>
  touchPracticeDate({
    ...progress,
    gamesCompleted: {
      ...progress.gamesCompleted,
      [gameId]: (progress.gamesCompleted[gameId] ?? 0) + 1,
    },
    starsEarned: progress.starsEarned + 1,
  });

export const markSurahPracticed = (progress: ChildProgress, surahNumber: number): ChildProgress =>
  touchPracticeDate({
    ...progress,
    surahsPracticed: {
      ...progress.surahsPracticed,
      [surahNumber]: (progress.surahsPracticed[surahNumber] ?? 0) + 1,
    },
    starsEarned: progress.starsEarned + 1,
  });

export const updateSettings = (
  progress: ChildProgress,
  settings: Partial<ProgressSettings>,
): ChildProgress => ({
  ...progress,
  settings: {
    ...progress.settings,
    ...settings,
  },
});

export const summarizeProgress = (progress: ChildProgress): ProgressSummary => ({
  learnedLetterCount: progress.lettersLearned.length,
  practicedLetterCount: progress.lettersPracticed.length,
  gamesCompletedCount: Object.values(progress.gamesCompleted).reduce((sum, count) => sum + count, 0),
  starsEarned: progress.starsEarned,
  surahsPracticedCount: Object.keys(progress.surahsPracticed).length,
  harakatUnlockedCount: progress.harakatUnlocked.length,
  gentleStreakDays: progress.gentleStreakDays,
});
