import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { SectionPanel } from '@/components/SectionPanel';
import { VerificationBadge } from '@/components/VerificationBadge';
import { getSurahByNumber } from '@/data/surahs.placeholder';
import { translate } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { canDisplayAyahAsFinal, getQuranSafetyMessage } from '@/services/contentVerificationService';
import { useProgress } from '@/store/progressStore';
import { colors, radii, spacing, typography } from '@/theme/theme';

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
      <SectionPanel
        title={surah.surahNameEnglish}
        caption={surah.surahNameArabic}
        tone="warm"
        trailing={<VerificationBadge verification={surah.verification} />}
      >
        <Text style={styles.bodyText}>{getQuranSafetyMessage(surah)}</Text>
      </SectionPanel>

      <SectionPanel title={t('memorizationProgress')} caption={t('surahParentNote')} tone="plain">
        <View style={styles.practiceRow}>
          <View style={styles.practiceCount}>
            <Text style={styles.practiceValue}>
              {(progress.surahsPracticed[surah.surahNumber] ?? 0).toString()}
            </Text>
            <Text style={styles.practiceLabel}>{t('stars')}</Text>
          </View>
          <Pressable style={styles.primaryAction} onPress={() => practiceSurah(surah.surahNumber)}>
            <Text style={styles.primaryActionText}>{t('repeatAfterMe')}</Text>
          </Pressable>
        </View>
      </SectionPanel>

      <SectionPanel title="Ayah-by-ayah" caption={t('surahPlaceholder')} tone="plain">
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
      </SectionPanel>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.primaryDark,
  },
  bodyText: {
    ...typography.body,
    color: colors.text,
  },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  practiceCount: {
    width: 84,
    minHeight: 70,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceCool,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceValue: {
    color: colors.primaryDark,
    fontSize: 28,
    fontWeight: '900',
  },
  practiceLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  primaryAction: {
    minHeight: 52,
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  placeholderBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  placeholderText: {
    color: colors.placeholder,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '800',
  },
  ayahCard: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  ayahArabic: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 42,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
