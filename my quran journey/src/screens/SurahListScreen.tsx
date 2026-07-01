import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radii, shadows, spacing } from '@/app/theme';
import { Screen } from '@/components/Screen';
import { VerificationBadge } from '@/components/VerificationBadge';
import { placeholderSurahs } from '@/data/surahs.placeholder';
import { translate } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { getQuranSafetyMessage } from '@/services/contentVerificationService';
import { useProgress } from '@/store/progressStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Surahs'>;

export const SurahListScreen = ({ navigation }: Props) => {
  const { progress } = useProgress();
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);

  return (
    <Screen>
      <View style={styles.notice}>
        <Text style={styles.title}>{t('shortSurahs')}</Text>
        <Text style={styles.bodyText}>{t('surahPlaceholder')}</Text>
        <Text style={styles.bodyText}>{t('surahParentNote')}</Text>
      </View>

      {placeholderSurahs.map((surah) => (
        <Pressable
          key={surah.surahNumber}
          accessibilityRole="button"
          onPress={() => navigation.navigate('SurahDetail', { surahNumber: surah.surahNumber })}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.surahName}>{surah.surahNameEnglish}</Text>
              <Text style={styles.surahArabic}>{surah.surahNameArabic}</Text>
            </View>
            <Text style={styles.surahNumber}>{surah.surahNumber}</Text>
          </View>
          <VerificationBadge verification={surah.verification} />
          <Text style={styles.bodyText}>{getQuranSafetyMessage(surah)}</Text>
        </Pressable>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  notice: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  title: {
    color: colors.primaryDark,
    fontSize: 28,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  surahName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  surahArabic: {
    color: colors.primaryDark,
    fontSize: 26,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  surahNumber: {
    color: colors.secondary,
    fontSize: 28,
    fontWeight: '900',
  },
});
