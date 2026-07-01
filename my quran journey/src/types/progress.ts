export type UiLanguage = 'en' | 'ar' | 'bilingual';

export interface ProgressSettings {
  language: UiLanguage;
  audioEnabled: boolean;
  transliterationEnabled: boolean;
  reduceSoundEffects: boolean;
}

export interface ChildProgress {
  lettersLearned: string[];
  lettersPracticed: string[];
  gamesCompleted: Record<string, number>;
  starsEarned: number;
  flowersEarned: number;
  lanternBadges: string[];
  surahsPracticed: Record<number, number>;
  harakatUnlocked: string[];
  gentleStreakDays: number;
  lastPracticeDate?: string;
  settings: ProgressSettings;
}

export interface ProgressSummary {
  learnedLetterCount: number;
  practicedLetterCount: number;
  gamesCompletedCount: number;
  starsEarned: number;
  surahsPracticedCount: number;
  harakatUnlockedCount: number;
  gentleStreakDays: number;
}
