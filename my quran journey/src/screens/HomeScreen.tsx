import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radii, shadows, spacing } from '@/theme/theme';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { translate } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { useProgress } from '@/store/progressStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const { progress } = useProgress();
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.moon} />
        <Text style={styles.appName}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>
        <View style={styles.gardenRow}>
          <Text style={styles.gardenLetter}>ا</Text>
          <Text style={styles.gardenLetter}>ب</Text>
          <Text style={styles.gardenLetter}>ت</Text>
          <Text style={styles.gardenLetter}>ث</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <BigButton
          title={t('learnLetters')}
          subtitle="Start with friendly letter stations"
          symbol="ا"
          tone="green"
          onPress={() => navigation.navigate('LetterMap')}
        />
        <BigButton
          title={t('practiceWords')}
          subtitle={t('practiceWordsSafeLabel')}
          symbol="ح"
          tone="blue"
          onPress={() => navigation.navigate('QuranWords')}
        />
        <BigButton
          title={t('shortSurahs')}
          subtitle={t('surahPlaceholder')}
          symbol="س"
          tone="gold"
          onPress={() => navigation.navigate('Surahs')}
        />
        <BigButton
          title={t('games')}
          subtitle="Gentle letter games"
          symbol="م"
          tone="rose"
          onPress={() => navigation.navigate('Games')}
        />
        <BigButton
          title={t('progress')}
          subtitle={`${progress.starsEarned} ${translate('stars', progress.settings.language)}`}
          symbol="★"
          tone="purple"
          onPress={() => navigation.navigate('Progress')}
        />
        <BigButton
          title={t('parentArea')}
          subtitle={t('quranDisclaimer')}
          symbol="✓"
          tone="green"
          onPress={() => navigation.navigate('ParentArea')}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  hero: {
    minHeight: 240,
    borderRadius: radii.lg,
    backgroundColor: colors.mint,
    padding: spacing.xl,
    overflow: 'hidden',
    justifyContent: 'center',
    ...shadows.soft,
  },
  moon: {
    position: 'absolute',
    top: 24,
    right: 28,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 8,
    borderColor: colors.sky,
  },
  appName: {
    color: colors.primaryDark,
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 46,
  },
  tagline: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    marginTop: spacing.sm,
    maxWidth: 560,
  },
  gardenRow: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
    marginTop: spacing.xl,
    alignSelf: 'flex-start',
  },
  gardenLetter: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    color: colors.primaryDark,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    textAlignVertical: 'center',
    writingDirection: 'rtl',
  },
  grid: {
    gap: spacing.md,
  },
});
