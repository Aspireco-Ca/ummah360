import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/theme';

interface ModuleTileProps {
  title: string;
  subtitle: string;
  symbol: string;
  accent: string;
  meta?: string;
  onPress: () => void;
}

export const ModuleTile = ({ title, subtitle, symbol, accent, meta, onPress }: ModuleTileProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={title}
    onPress={onPress}
    style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
  >
    <View style={[styles.symbolWrap, { backgroundColor: accent }]}>
      <Text style={styles.symbol}>{symbol}</Text>
    </View>
    <View style={styles.copy}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  tile: {
    minHeight: 118,
    width: '48%',
    minWidth: 154,
    flexGrow: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  symbolWrap: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  subtitle: {
    ...typography.caption,
    color: colors.muted,
  },
  meta: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
