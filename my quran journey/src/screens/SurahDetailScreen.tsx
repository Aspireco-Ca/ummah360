import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radii, shadows, spacing } from '@/theme/theme';
import { Screen } from '@/components/Screen';
import { VerificationBadge } from '@/components/VerificationBadge';
import { getSurahByNumber } from '@/data/surahs.placeholder';
import { translate } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { canDisplayAyahAsFinal, getQuranSafetyMessage } from '@/services/contentVerificationService';
import { useProgress } from '@/store/progressStore';

type Props = NativeStackScreenProps<RootStackParamList, 'SurahDetail'>;

export const SurahDetailScreen = ({ route }: Props) => {
  const { progress, practiceSurah } = useProgress();
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);
  const surah = getSurahByNumber(route.params.surahNumber);

  if (!surah) {
    return (
      <Screen>
        <Text style={styles.title}>{t('emptyState')}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{surah.surahNameEnglish}</Text>
        <Text style={styles.arabicTitle}>{surah.surahNameArabic}</Text>
        <VerificationBadge verification={surah.verification} />
        <Text style={styles.bodyText}>{getQuranSafetyMessage(surah)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('memorizationProgress')}</Text>
        <Text style={styles.bodyText}>
          {(progress.surahsPracticed[surah.surahNumber] ?? 0).toString()} {t('stars')}
        </Text>
        <Pressable style={styles.primaryAction} onPress={() => practiceSurah(surah.surahNumber)}>
          <Text style={styles.primaryActionText}>{t('repeatAfterMe')}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ayah-by-ayah</Text>
        {surah.ayahs.length === 0 ? (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>{t('surahPlaceholder')}</Text>
            <Text style={styles.bodyText}>{t('quranDisclaimer')}</Text>
          </View>
        ) : (
          surah.ayahs.map((ayah) => (
            <View key={ayah.ayahNumber} style={styles.ayahCard}>
              {canDisplayAyahAsFinal(ayah) ? (
                <>
                  <Text style={styles.ayahArabic}>{ayah.arabicText}</Text>
                  <Text style={styles.bodyText}>{ayah.translation}</Text>
                </>
              ) : (
                <Text style={styles.placeholderText}>
                  Ayah {ayah.ayahNumber} is not verified for display.
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      <Text style={styles.parentNote}>{t('surahParentNote')}</Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  title: {
    color: colors.primaryDark,
    fontSize: 30,
    fontWeight: '900',
  },
  arabicTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  sectionTitle: {
    color: colors.primaryDark,
    fontSize: 20,
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
  primaryAction: {
    minHeight: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  placeholderBox: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  placeholderText: {
    color: colors.placeholder,
    fontSize: 16,
    fontWeight: '800',
  },
  ayahCard: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  ayahArabic: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 42,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  parentNote: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 23,
  },
});
