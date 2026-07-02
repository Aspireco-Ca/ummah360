import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ModuleTile } from '@/components/ModuleTile';
import { Screen } from '@/components/Screen';
import { SectionPanel } from '@/components/SectionPanel';
import { arabicLetters } from '@/data/arabicLetters';
import { translate } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { useProgress } from '@/store/progressStore';
import { colors, radii, shadows, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const { progress } = useProgress();
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);
  const nextLetter =
    arabicLetters.find((letter) => !progress.lettersLearned.includes(letter.id)) ?? arabicLetters[0];
  const learnedCount = progress.lettersLearned.length;
  const progressPercent = Math.round((learnedCount / arabicLetters.length) * 100);

  return (
    <Screen contentStyle={styles.screenContent}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.brandMark}>
            <Text style={styles.brandLetter}>{arabicLetters[0].arabic}</Text>
          </View>
          <View style={styles.progressPill}>
            <Text style={styles.progressPillValue}>{progress.starsEarned}</Text>
            <Text style={styles.progressPillLabel}>{t('stars')}</Text>
          </View>
        </View>

        <Text style={styles.appName}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>

        <View style={styles.gardenPath}>
          {arabicLetters.slice(0, 6).map((letter, index) => (
            <View key={letter.id} style={styles.pathStepWrap}>
              {index > 0 ? <View style={styles.pathLine} /> : null}
              <View
                style={[
                  styles.pathStep,
                  progress.lettersLearned.includes(letter.id) && styles.pathStepDone,
                ]}
              >
                <Text style={styles.pathLetter}>{letter.arabic}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <SectionPanel
        title="Today in the garden"
        caption={`${learnedCount} of ${arabicLetters.length} letters learned`}
        tone="plain"
        trailing={<Text style={styles.percent}>{progressPercent}%</Text>}
      >
        <View style={styles.todayRow}>
          <View style={styles.todayLetterTile}>
            <Text style={styles.todayLetter}>{nextLetter.arabic}</Text>
          </View>
          <View style={styles.todayCopy}>
            <Text style={styles.todayTitle}>{nextLetter.nameEnglish}</Text>
            <Text style={styles.todaySubtitle}>{nextLetter.nameArabic}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start lesson"
              style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
              onPress={() => navigation.navigate('LetterLesson', { letterId: nextLetter.id })}
            >
              <Text style={styles.primaryActionText}>Start lesson</Text>
            </Pressable>
          </View>
        </View>
      </SectionPanel>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Learning paths</Text>
        <Text style={styles.sectionCaption}>{t('keepPracticing')}</Text>
      </View>

      <View style={styles.tileGrid}>
        <ModuleTile
          title={t('learnLetters')}
          subtitle="Letter stations, tracing, and sounds"
          symbol={arabicLetters[1].arabic}
          accent={colors.mint}
          meta={`${learnedCount}/${arabicLetters.length}`}
          onPress={() => navigation.navigate('LetterMap')}
        />
        <ModuleTile
          title={t('practiceWords')}
          subtitle={t('practiceWordsSafeLabel')}
          symbol={arabicLetters[6].arabic}
          accent={colors.sky}
          onPress={() => navigation.navigate('QuranWords')}
        />
        <ModuleTile
          title={t('shortSurahs')}
          subtitle={t('surahPlaceholder')}
          symbol={arabicLetters[11].arabic}
          accent={colors.surfaceSoft}
          onPress={() => navigation.navigate('Surahs')}
        />
        <ModuleTile
          title={t('games')}
          subtitle="Calm games for letter practice"
          symbol={arabicLetters[23].arabic}
          accent={colors.lavender}
          onPress={() => navigation.navigate('Games')}
        />
        <ModuleTile
          title={t('progress')}
          subtitle={`${progress.flowersEarned} ${t('flowers')}`}
          symbol="*"
          accent="#F7DCA2"
          onPress={() => navigation.navigate('Progress')}
        />
        <ModuleTile
          title={t('parentArea')}
          subtitle="Settings, reset, and content status"
          symbol="i"
          accent="#F0C6CC"
          onPress={() => navigation.navigate('ParentArea')}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: spacing.lg,
  },
  hero: {
    minHeight: 206,
    borderRadius: radii.xl,
    backgroundColor: colors.inkPanel,
    padding: spacing.lg,
    overflow: 'hidden',
    gap: spacing.md,
    ...shadows.raised,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: {
    color: colors.primaryDark,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  progressPill: {
    minHeight: 44,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressPillValue: {
    color: colors.secondary,
    fontSize: 19,
    fontWeight: '900',
  },
  progressPillLabel: {
    color: '#D9ECE5',
    ...typography.caption,
  },
  appName: {
    color: colors.white,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  tagline: {
    color: '#D5E7DF',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  gardenPath: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  pathStepWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  pathLine: {
    width: 14,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  pathStep: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  pathStepDone: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  pathLetter: {
    color: colors.white,
    fontSize: 21,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  percent: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900',
  },
  todayRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  todayLetterTile: {
    width: 76,
    height: 80,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceCool,
    borderWidth: 1,
    borderColor: '#CDE2DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayLetter: {
    color: colors.primaryDark,
    fontSize: 54,
    lineHeight: 68,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  todayCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  todayTitle: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  todaySubtitle: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  primaryAction: {
    minHeight: 44,
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  sectionHeader: {
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  sectionCaption: {
    ...typography.caption,
    color: colors.muted,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
