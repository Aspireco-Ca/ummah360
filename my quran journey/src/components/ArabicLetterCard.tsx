import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing } from '@/theme/theme';
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
    <Text style={styles.arabic}>{letter.arabic}</Text>
    <View>
      <Text style={styles.name}>{letter.nameEnglish}</Text>
      <Text style={styles.arabicName}>{letter.nameArabic}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    width: '30.5%',
    minWidth: 96,
    aspectRatio: 0.9,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.soft,
  },
  learned: {
    borderColor: colors.secondary,
    backgroundColor: colors.surfaceSoft,
  },
  pressed: {
    opacity: 0.78,
  },
  arabic: {
    fontSize: 48,
    color: colors.primaryDark,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  arabicName: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
