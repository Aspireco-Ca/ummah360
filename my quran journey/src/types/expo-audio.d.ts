declare module 'expo-audio' {
  export type AudioSource = number | string | { uri: string };

  export interface AudioPlayer {
    play(): void;
    pause(): void;
    seekTo(seconds: number): void;
    release(): void;
  }

  export function createAudioPlayer(source?: AudioSource | null): AudioPlayer;
}
