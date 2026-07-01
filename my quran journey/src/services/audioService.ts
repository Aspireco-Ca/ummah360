export type AudioKind = 'letter' | 'practiceWord' | 'surahAyah' | 'ui';

export interface AudioRequest {
  kind: AudioKind;
  key: string;
}

export interface AudioService {
  play(request: AudioRequest): Promise<void>;
  stop(): Promise<void>;
}

class PlaceholderAudioService implements AudioService {
  async play(request: AudioRequest): Promise<void> {
    // TODO: Replace placeholder keys with verified local files.
    // Quran recitation audio must be certified and referenced locally before production release.
    console.info(`[audio placeholder] ${request.kind}: ${request.key}`);
  }

  async stop(): Promise<void> {
    console.info('[audio placeholder] stop');
  }
}

export const audioService: AudioService = new PlaceholderAudioService();

export const playLetterAudio = (audioKey: string): Promise<void> =>
  audioService.play({ kind: 'letter', key: audioKey });

export const playPracticeWordAudio = (audioKey: string): Promise<void> =>
  audioService.play({ kind: 'practiceWord', key: audioKey });

export const playSurahAyahAudio = (audioKey: string): Promise<void> =>
  audioService.play({ kind: 'surahAyah', key: audioKey });

export const playUiSound = (audioKey: string): Promise<void> =>
  audioService.play({ kind: 'ui', key: audioKey });
