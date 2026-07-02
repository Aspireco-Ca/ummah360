import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { hasLearningAudioSource, learningAudioSources } from '@/data/audioManifest';

export type AudioKind = 'letter' | 'practiceWord' | 'surahAyah' | 'ui';

export interface AudioRequest {
  kind: AudioKind;
  key: string;
}

export interface AudioService {
  play(request: AudioRequest): Promise<void>;
  stop(): Promise<void>;
}

const feedbackAudioKeys: Record<string, string> = {
  greatJob: 'ui/great-job',
  tryAgain: 'ui/try-again',
  youFoundLetter: 'ui/you-found-letter',
  beautifulEffort: 'ui/beautiful-effort',
  keepPracticing: 'ui/keep-practicing',
};

class LocalAudioService implements AudioService {
  private currentPlayer?: AudioPlayer;

  async play(request: AudioRequest): Promise<void> {
    if (request.kind === 'surahAyah') {
      // TODO: Add certified recitation files and verified source metadata before enabling Quran audio.
      console.info(`[quran audio placeholder] ${request.key}`);
      return;
    }

    const source = learningAudioSources[request.key];

    if (!source) {
      console.info(`[audio missing] ${request.kind}: ${request.key}`);
      return;
    }

    await this.stop();
    const player = createAudioPlayer(source);
    this.currentPlayer = player;
    player.seekTo(0);
    player.play();
  }

  async stop(): Promise<void> {
    if (!this.currentPlayer) {
      return;
    }

    try {
      this.currentPlayer.pause();
      this.currentPlayer.release();
    } finally {
      this.currentPlayer = undefined;
    }
  }
}

export const audioService: AudioService = new LocalAudioService();

export const hasAudio = (audioKey: string): boolean => hasLearningAudioSource(audioKey);

export const playLetterAudio = (audioKey: string): Promise<void> =>
  audioService.play({ kind: 'letter', key: audioKey });

export const playPracticeWordAudio = (audioKey: string): Promise<void> =>
  audioService.play({ kind: 'practiceWord', key: audioKey });

export const playSurahAyahAudio = (audioKey: string): Promise<void> =>
  audioService.play({ kind: 'surahAyah', key: audioKey });

export const playUiSound = (audioKey: string): Promise<void> =>
  audioService.play({ kind: 'ui', key: audioKey });

export const playFeedbackAudio = (feedbackKey: string): Promise<void> => {
  const audioKey = feedbackAudioKeys[feedbackKey];
  return audioKey ? playUiSound(audioKey) : Promise.resolve();
};
