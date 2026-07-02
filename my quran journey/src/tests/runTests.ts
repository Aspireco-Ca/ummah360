import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { arabicLetters } from '@/data/arabicLetters';
import { practiceWords } from '@/data/practiceWords';
import { placeholderSurahs } from '@/data/surahs.placeholder';
import {
  canPublishQuranContent,
  isVerified,
} from '@/services/contentVerificationService';
import {
  createDefaultProgress,
  loadProgress,
  markLetterLearned,
  recordGameCompleted,
  saveProgress,
  type StorageAdapter,
} from '@/services/progressService';
import { checkHarakahAnswer, checkLetterAnswer, checkTextAnswer } from '@/utils/gameLogic';
import { hasAllArabicLetters, hasRequiredLetterForms } from '@/utils/validation';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const createMemoryStorage = (): StorageAdapter => {
  const data = new Map<string, string>();

  return {
    async getItem(key) {
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      data.set(key, value);
    },
    async removeItem(key) {
      data.delete(key);
    },
  };
};

const testArabicLetters = () => {
  assert(hasAllArabicLetters(), 'Arabic letters array should contain exactly 28 letters.');
  assert(hasRequiredLetterForms(), 'Every Arabic letter should define isolated, beginning, middle, and end forms.');
  assert(arabicLetters.every((letter) => letter.audioKey.startsWith('letters/')), 'Every letter needs a placeholder audio key.');
};

const testProgressService = async () => {
  const storage = createMemoryStorage();
  const initial = createDefaultProgress();
  const updated = recordGameCompleted(markLetterLearned(initial, 'alif'), 'letter-pop');

  await saveProgress(updated, storage);
  const loaded = await loadProgress(storage);

  assert(loaded.lettersLearned.includes('alif'), 'Saved progress should include learned letter.');
  assert(loaded.gamesCompleted['letter-pop'] === 1, 'Saved progress should include completed game count.');
  assert(loaded.starsEarned >= 2, 'Progress should award stars for lessons and games.');
};

const testGameLogic = () => {
  assert(checkLetterAnswer('ba', 'ba').correct, 'Letter answer should pass when ids match.');
  assert(!checkLetterAnswer('ta', 'ba').correct, 'Letter answer should fail when ids differ.');
  assert(checkTextAnswer('Alif', 'Alif').correct, 'Text answer should pass when values match.');
  assert(checkHarakahAnswer('fatha', 'fatha').correct, 'Harakah answer should pass when ids match.');
};

const testContentVerification = () => {
  const placeholder = placeholderSurahs[0];

  assert(!isVerified(placeholder.verification), 'Placeholder verification should not be treated as verified.');
  assert(!canPublishQuranContent(placeholder), 'Placeholder Quran content should be blocked from production use.');
};

const testLearningAudioAssets = () => {
  const audioKeys = [
    ...arabicLetters.map((letter) => letter.audioKey),
    ...practiceWords.map((word) => word.audioKey),
    'ui/great-job',
    'ui/try-again',
    'ui/you-found-letter',
    'ui/beautiful-effort',
    'ui/keep-practicing',
  ];

  for (const audioKey of audioKeys) {
    const filePath = path.join(process.cwd(), 'assets', 'audio', `${audioKey}.mp3`);
    assert(existsSync(filePath), `Missing generated audio asset for ${audioKey}.`);
    assert(statSync(filePath).size > 1024, `Generated audio asset for ${audioKey} should not be empty.`);
  }
};

const run = async () => {
  testArabicLetters();
  await testProgressService();
  testGameLogic();
  testContentVerification();
  testLearningAudioAssets();
  console.log('All Quran Garden tests passed.');
};

void run();
