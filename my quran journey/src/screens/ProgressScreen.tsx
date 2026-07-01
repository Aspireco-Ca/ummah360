import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing } from '@/theme/theme';
import { ProgressStars } from '@/components/ProgressStars';
import { Screen } from '@/components/Screen';
import { arabicLetters } from '@/data/arabicLetters';
import { translate } from '@/i18n';
import { summarizeProgress } from '@/services/progressService';
import { useProgress } from '@/store/progressStore';

export const ProgressScreen = () => {
  const { progress } = useProgress();
  const summary = summarizeProgress(progress);
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);

  const rows = [
    [t('lettersLearned'), `${summary.learnedLetterCount} / ${arabicLetters.length}`],
    [t('lettersPracticed'), summary.practicedLetterCount.toString()],
    [t('gamesCompleted'), summary.gamesCompletedCount.toString()],
    [t('surahsPracticed'), summary.surahsPracticedCount.toString()],
    [t('harakatUnlocked'), summary.harakatUnlockedCount.toString()],
    [t('gentleStreak'), summary.gentleStreakDays.toString()],
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{t('progress')}</Text>
        <ProgressStars count={progress.starsEarned} />
        <Text style={styles.bodyText}>
          {progress.flowersEarned} {t('flowers')}
        </Text>
      </View>

      <View style={styles.card}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Lantern badges</Text>
        <Text style={styles.bodyText}>
          {progress.lanternBadges.length > 0 ? progress.lanternBadges.join(', ') : t('emptyState')}
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.mint,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.soft,
  },
  title: {
    color: colors.primaryDark,
    fontSize: 30,
    fontWeight: '900',
  },
  bodyText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.soft,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  rowValue: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionTitle: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: '900',
  },
});
