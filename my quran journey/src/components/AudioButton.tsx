import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '@/app/theme';
import { playLetterAudio, playPracticeWordAudio, playSurahAyahAudio } from '@/services/audioService';

interface AudioButtonProps {
  label: string;
  audioKey: string;
  kind: 'letter' | 'practiceWord' | 'surahAyah';
  disabled?: boolean;
}

export const AudioButton = ({ label, audioKey, kind, disabled = false }: AudioButtonProps) => {
  const play = async () => {
    if (disabled) {
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
      onPress={play}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={styles.symbol}>♪</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
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
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
