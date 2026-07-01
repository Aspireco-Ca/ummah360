import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/app/theme';

export const ProgressStars = ({ count }: { count: number }) => {
  const shown = Math.min(count, 5);

  return (
    <View accessibilityLabel={`${count} stars`} style={styles.row}>
      {Array.from({ length: shown }).map((_, index) => (
        <Text key={index} style={styles.star}>
          ★
        </Text>
      ))}
      {count > shown ? <Text style={styles.more}>+{count - shown}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  star: {
    color: colors.secondary,
    fontSize: 24,
  },
  more: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
});
