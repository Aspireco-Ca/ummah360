import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/theme';
import { hasAudio, playLetterAudio, playPracticeWordAudio, playSurahAyahAudio } from '@/services/audioService';
import { useProgress } from '@/store/progressStore';

interface AudioButtonProps {
  label: string;
  audioKey: string;
  kind: 'letter' | 'practiceWord' | 'surahAyah';
  disabled?: boolean;
}

export const AudioButton = ({ label, audioKey, kind, disabled = false }: AudioButtonProps) => {
  const { progress } = useProgress();
  const unavailable = kind === 'surahAyah' || !hasAudio(audioKey);
  const isDisabled = disabled || unavailable || !progress.settings.audioEnabled;

  const play = async () => {
    if (isDisabled) {
      return;
    }

    if (kind === 'letter') {
      await playLetterAudio(audioKey);
    } else if (kind === 'practiceWord') {
      await playPracticeWordAudio(audioKey);
    } else {
      await playSurahAyahAudio(audioKey);
    }
  };

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
      <Text style={styles.label}>{label}</Text>
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
