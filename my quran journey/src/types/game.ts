export type GameId =
  | 'letter-pop'
  | 'match-pair'
  | 'find-it-word'
  | 'harakah-hero'
  | 'surah-stars';

export interface GameDefinition {
  id: GameId;
  titleKey: string;
  descriptionKey: string;
  level: 'easy' | 'medium';
}

export interface AnswerResult {
  correct: boolean;
  feedbackKey: 'greatJob' | 'tryAgain' | 'youFoundLetter' | 'beautifulEffort';
}
