import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/theme';
import { hasAudio, playLetterAudio, playPracticeWordAudio, playSurahAyahAudio } from '@/services/audioService';
import { useProgress } from '@/store/progressStore';

interface AudioButtonProps {
  label: string;
  audioKey: string;
  kind: 'letter' | 'practiceWord' | 'surahAyah';
  disabled?: boolean;
  onPlayed?: () => void;
}

export const AudioButton = ({ label, audioKey, kind, disabled = false, onPlayed }: AudioButtonProps) => {
  const { progress } = useProgress();
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const unavailable = kind === 'surahAyah' || !hasAudio(audioKey);
  const isDisabled = disabled || unavailable || !progress.settings.audioEnabled;

  const play = async () => {
    if (isDisabled) {
      return;
    }

    try {
      if (kind === 'letter') {
        await playLetterAudio(audioKey);
      } else if (kind === 'practiceWord') {
        await playPracticeWordAudio(audioKey);
      } else {
        await playSurahAyahAudio(audioKey);
      }

      onPlayed?.();
      setIsPlaying(true);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setIsPlaying(false);
      }, 1400);
    } catch (error) {
      setIsPlaying(false);
      console.warn('[audio playback failed]', audioKey, error);
    }
  };

  const visibleLabel = isPlaying ? 'Playing' : label;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={play}
      style={({ pressed }) => [styles.button, isDisabled && styles.disabled, pressed && !isDisabled && styles.pressed]}
    >
      <Text style={styles.symbol}>♪</Text>
      <Text style={styles.label}>{visibleLabel}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  disabled: {
    backgroundColor: colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  symbol: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  label: {
    color: '#FFFFFF',
    ...typography.caption,
  },
});
