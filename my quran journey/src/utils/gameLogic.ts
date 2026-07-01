import type { AnswerResult } from '@/types/game';

export const checkLetterAnswer = (selectedLetterId: string, targetLetterId: string): AnswerResult => ({
  correct: selectedLetterId === targetLetterId,
  feedbackKey: selectedLetterId === targetLetterId ? 'youFoundLetter' : 'tryAgain',
});

export const checkTextAnswer = (selected: string, target: string): AnswerResult => ({
  correct: selected === target,
  feedbackKey: selected === target ? 'greatJob' : 'tryAgain',
});

export const checkHarakahAnswer = (selectedHarakahId: string, targetHarakahId: string): AnswerResult => ({
  correct: selectedHarakahId === targetHarakahId,
  feedbackKey: selectedHarakahId === targetHarakahId ? 'beautifulEffort' : 'tryAgain',
});
