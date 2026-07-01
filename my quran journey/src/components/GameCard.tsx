import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing } from '@/app/theme';

interface GameCardProps {
  title: string;
  description: string;
  active?: boolean;
  onPress: () => void;
}

export const GameCard = ({ title, description, active = false, onPress }: GameCardProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={title}
    onPress={onPress}
    style={({ pressed }) => [styles.card, active && styles.active, pressed && styles.pressed]}
  >
    <View style={styles.marker} />
    <View style={styles.copy}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.soft,
  },
  active: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSoft,
  },
  pressed: {
    opacity: 0.78,
  },
  marker: {
    width: 18,
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
