import { StyleSheet, Text, View } from 'react-native';
import { ProgressStars } from '@/components/ProgressStars';
import { Screen } from '@/components/Screen';
import { SectionPanel } from '@/components/SectionPanel';
import { arabicLetters } from '@/data/arabicLetters';
import { translate } from '@/i18n';
import { summarizeProgress } from '@/services/progressService';
import { useProgress } from '@/store/progressStore';
import { colors, radii, spacing, typography } from '@/theme/theme';

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
      <SectionPanel title={t('progress')} caption="A quiet summary for parents and teachers." tone="ink">
        <View style={styles.rewardRow}>
          <View style={styles.rewardTile}>
            <Text style={styles.rewardValue}>{progress.starsEarned}</Text>
            <Text style={styles.rewardLabel}>{t('stars')}</Text>
          </View>
          <View style={styles.rewardTile}>
            <Text style={styles.rewardValue}>{progress.flowersEarned}</Text>
            <Text style={styles.rewardLabel}>{t('flowers')}</Text>
          </View>
          <View style={styles.rewardTileWide}>
            <ProgressStars count={progress.starsEarned} />
          </View>
        </View>
      </SectionPanel>

      <SectionPanel title="Learning summary" tone="plain">
        {rows.map(([label, value], index) => (
          <View key={label} style={[styles.row, index === rows.length - 1 && styles.lastRow]}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
          </View>
        ))}
      </SectionPanel>

      <SectionPanel title="Lantern badges" caption="Milestone badges stay calm and non-competitive." tone="warm">
        <Text style={styles.bodyText}>
          {progress.lanternBadges.length > 0 ? progress.lanternBadges.join(', ') : t('emptyState')}
        </Text>
      </SectionPanel>
    </Screen>
  );
};

const styles = StyleSheet.create({
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rewardTile: {
    minWidth: 96,
    flexGrow: 1,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: spacing.md,
  },
  rewardTileWide: {
    minHeight: 76,
    minWidth: 130,
    flexGrow: 2,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md,
    justifyContent: 'center',
  },
  rewardValue: {
    color: colors.secondary,
    fontSize: 31,
    fontWeight: '900',
  },
  rewardLabel: {
    ...typography.caption,
    color: '#D9ECE5',
  },
  bodyText: {
    ...typography.body,
    color: colors.text,
  },
  row: {
    minHeight: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    flex: 1,
  },
  rowValue: {
    color: colors.primaryDark,
    fontSize: 17,
    fontWeight: '900',
  },
});
