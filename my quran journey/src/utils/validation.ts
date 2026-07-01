import { arabicLetters } from '@/data/arabicLetters';

export const hasAllArabicLetters = (): boolean => arabicLetters.length === 28;

export const hasRequiredLetterForms = (): boolean =>
  arabicLetters.every(
    (letter) =>
      Boolean(letter.isolatedForm) &&
      Boolean(letter.beginningForm) &&
      Boolean(letter.middleForm) &&
      Boolean(letter.endForm),
  );
