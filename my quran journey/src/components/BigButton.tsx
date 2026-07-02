import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/theme';

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
    minHeight: 72,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  symbol: {
    width: 42,
    height: 42,
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
  },
  subtitle: {
    ...typography.caption,
    opacity: 0.88,
  },
});
