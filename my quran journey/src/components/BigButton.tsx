import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing } from '@/theme/theme';

interface BigButtonProps {
  title: string;
  subtitle?: string;
  symbol?: string;
  tone?: 'green' | 'gold' | 'rose' | 'blue' | 'purple';
  onPress: () => void;
}

const toneStyles = {
  green: { backgroundColor: colors.primary, color: '#FFFFFF' },
  gold: { backgroundColor: colors.secondary, color: colors.text },
  rose: { backgroundColor: colors.accent, color: '#FFFFFF' },
  blue: { backgroundColor: colors.sky, color: colors.text },
  purple: { backgroundColor: colors.lavender, color: colors.text },
};

export const BigButton = ({ title, subtitle, symbol, tone = 'green', onPress }: BigButtonProps) => {
  const toneStyle = toneStyles[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: toneStyle.backgroundColor, opacity: pressed ? 0.82 : 1 },
      ]}
    >
      {symbol ? <Text style={[styles.symbol, { color: toneStyle.color }]}>{symbol}</Text> : null}
      <View style={styles.copy}>
        <Text style={[styles.title, { color: toneStyle.color }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: toneStyle.color }]}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 88,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.soft,
  },
  symbol: {
    minWidth: 42,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 27,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 19,
    opacity: 0.88,
  },
});
