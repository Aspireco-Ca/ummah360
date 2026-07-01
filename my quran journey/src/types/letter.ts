export type DifficultyLevel = 1 | 2 | 3;

export interface ArabicLetter {
  id: string;
  arabic: string;
  nameArabic: string;
  nameEnglish: string;
  transliteration: string;
  isolatedForm: string;
  beginningForm: string;
  middleForm: string;
  endForm: string;
  exampleWordArabic: string;
  exampleWordMeaning: string;
  audioKey: string;
  difficultyLevel: DifficultyLevel;
  unlockOrder: number;
  pronunciationTip: string;
}

export interface Harakah {
  id: string;
  arabicName: string;
  englishName: string;
  mark: string;
  soundHint: string;
  unlockLevel: number;
}
