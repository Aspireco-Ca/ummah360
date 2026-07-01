import type { ContentVerification } from '@/types/surah';

export interface PracticeWord {
  id: string;
  arabic: string;
  meaning: string;
  targetLetterIds: string[];
  audioKey: string;
  isQuranic: false;
  label: 'practice_word';
  verification: ContentVerification;
}

const practiceVerification: ContentVerification = {
  status: 'placeholder',
  sourceName: 'Practice word placeholder set',
  sourceReference: 'Not Quran text. Replace or review before production curriculum use.',
  verifiedBy: '',
  verifiedDate: '',
};

export const practiceWords: PracticeWord[] = [
  {
    id: 'practice-bab',
    arabic: 'باب',
    meaning: 'door',
    targetLetterIds: ['ba', 'alif'],
    audioKey: 'practice-words/bab',
    isQuranic: false,
    label: 'practice_word',
    verification: practiceVerification,
  },
  {
    id: 'practice-qalam',
    arabic: 'قلم',
    meaning: 'pencil',
    targetLetterIds: ['qaf', 'lam', 'meem'],
    audioKey: 'practice-words/qalam',
    isQuranic: false,
    label: 'practice_word',
    verification: practiceVerification,
  },
  {
    id: 'practice-najm',
    arabic: 'نجم',
    meaning: 'star',
    targetLetterIds: ['noon', 'jeem', 'meem'],
    audioKey: 'practice-words/najm',
    isQuranic: false,
    label: 'practice_word',
    verification: practiceVerification,
  },
  {
    id: 'practice-zahra',
    arabic: 'زهرة',
    meaning: 'flower',
    targetLetterIds: ['zay', 'ha2', 'ra'],
    audioKey: 'practice-words/zahra',
    isQuranic: false,
    label: 'practice_word',
    verification: practiceVerification,
  },
  {
    id: 'practice-kitab',
    arabic: 'كتاب',
    meaning: 'book',
    targetLetterIds: ['kaf', 'ta', 'alif', 'ba'],
    audioKey: 'practice-words/kitab',
    isQuranic: false,
    label: 'practice_word',
    verification: practiceVerification,
  },
];
