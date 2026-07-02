import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/theme/theme';
import type { ArabicLetter } from '@/types/letter';

interface ArabicLetterCardProps {
  letter: ArabicLetter;
  learned?: boolean;
  onPress: () => void;
}

export const ArabicLetterCard = ({ letter, learned = false, onPress }: ArabicLetterCardProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${letter.nameEnglish} ${letter.arabic}`}
    onPress={onPress}
    style={({ pressed }) => [styles.card, learned && styles.learned, pressed && styles.pressed]}
  >
    {learned ? <View style={styles.learnedDot} /> : null}
    <Text style={styles.arabic}>{letter.arabic}</Text>
    <View style={styles.copy}>
      <Text style={styles.name}>{letter.nameEnglish}</Text>
      <Text style={styles.arabicName}>{letter.nameArabic}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    width: '22.8%',
    minWidth: 76,
    aspectRatio: 0.92,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    gap: spacing.xs,
  },
  learned: {
    borderColor: colors.secondary,
    backgroundColor: colors.surfaceSoft,
  },
  learnedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  pressed: {
    opacity: 0.78,
  },
  arabic: {
    fontSize: 38,
    color: colors.primaryDark,
    fontWeight: '900',
    writingDirection: 'rtl',
    lineHeight: 48,
  },
  copy: {
    alignItems: 'center',
  },
  name: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  arabicName: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
