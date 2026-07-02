import type { AudioSource } from 'expo-audio';

declare const require: (path: string) => AudioSource;

export const learningAudioSources: Record<string, AudioSource> = {
  'letters/alif': require('../../assets/audio/letters/alif.mp3'),
  'letters/ba': require('../../assets/audio/letters/ba.mp3'),
  'letters/ta': require('../../assets/audio/letters/ta.mp3'),
  'letters/tha': require('../../assets/audio/letters/tha.mp3'),
  'letters/jeem': require('../../assets/audio/letters/jeem.mp3'),
  'letters/ha': require('../../assets/audio/letters/ha.mp3'),
  'letters/kha': require('../../assets/audio/letters/kha.mp3'),
  'letters/dal': require('../../assets/audio/letters/dal.mp3'),
  'letters/dhal': require('../../assets/audio/letters/dhal.mp3'),
  'letters/ra': require('../../assets/audio/letters/ra.mp3'),
  'letters/zay': require('../../assets/audio/letters/zay.mp3'),
  'letters/seen': require('../../assets/audio/letters/seen.mp3'),
  'letters/sheen': require('../../assets/audio/letters/sheen.mp3'),
  'letters/sad': require('../../assets/audio/letters/sad.mp3'),
  'letters/dad': require('../../assets/audio/letters/dad.mp3'),
  'letters/tah': require('../../assets/audio/letters/tah.mp3'),
  'letters/zah': require('../../assets/audio/letters/zah.mp3'),
  'letters/ayn': require('../../assets/audio/letters/ayn.mp3'),
  'letters/ghayn': require('../../assets/audio/letters/ghayn.mp3'),
  'letters/fa': require('../../assets/audio/letters/fa.mp3'),
  'letters/qaf': require('../../assets/audio/letters/qaf.mp3'),
  'letters/kaf': require('../../assets/audio/letters/kaf.mp3'),
  'letters/lam': require('../../assets/audio/letters/lam.mp3'),
  'letters/meem': require('../../assets/audio/letters/meem.mp3'),
  'letters/noon': require('../../assets/audio/letters/noon.mp3'),
  'letters/haa': require('../../assets/audio/letters/haa.mp3'),
  'letters/waw': require('../../assets/audio/letters/waw.mp3'),
  'letters/ya': require('../../assets/audio/letters/ya.mp3'),
  'practice-words/bab': require('../../assets/audio/practice-words/bab.mp3'),
  'practice-words/qalam': require('../../assets/audio/practice-words/qalam.mp3'),
  'practice-words/najm': require('../../assets/audio/practice-words/najm.mp3'),
  'practice-words/zahra': require('../../assets/audio/practice-words/zahra.mp3'),
  'practice-words/kitab': require('../../assets/audio/practice-words/kitab.mp3'),
  'ui/great-job': require('../../assets/audio/ui/great-job.mp3'),
  'ui/try-again': require('../../assets/audio/ui/try-again.mp3'),
  'ui/you-found-letter': require('../../assets/audio/ui/you-found-letter.mp3'),
  'ui/beautiful-effort': require('../../assets/audio/ui/beautiful-effort.mp3'),
  'ui/keep-practicing': require('../../assets/audio/ui/keep-practicing.mp3'),
};

export const hasLearningAudioSource = (audioKey: string): boolean =>
  Object.prototype.hasOwnProperty.call(learningAudioSources, audioKey);
