import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/theme';

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
    <View style={[styles.marker, active && styles.markerActive]} />
    <View style={styles.copy}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexGrow: 1,
    minWidth: 150,
    width: '48%',
  },
  active: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceCool,
  },
  pressed: {
    opacity: 0.78,
  },
  marker: {
    width: 10,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
  },
  markerActive: {
    backgroundColor: colors.primary,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
  },
  description: {
    ...typography.caption,
    color: colors.muted,
  },
});
