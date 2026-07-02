import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { SectionPanel } from '@/components/SectionPanel';
import { VerificationBadge } from '@/components/VerificationBadge';
import { placeholderSurahs } from '@/data/surahs.placeholder';
import { translate } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { getQuranSafetyMessage } from '@/services/contentVerificationService';
import { useProgress } from '@/store/progressStore';
import { colors, radii, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Surahs'>;

export const SurahListScreen = ({ navigation }: Props) => {
  const { progress } = useProgress();
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);

  return (
    <Screen>
      <SectionPanel title={t('shortSurahs')} caption={t('surahParentNote')} tone="warm">
        <Text style={styles.noticeText}>{t('surahPlaceholder')}</Text>
      </SectionPanel>

      {placeholderSurahs.map((surah) => (
        <Pressable
          key={surah.surahNumber}
          accessibilityRole="button"
          onPress={() => navigation.navigate('SurahDetail', { surahNumber: surah.surahNumber })}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.surahNumberBadge}>
              <Text style={styles.surahNumber}>{surah.surahNumber}</Text>
            </View>
            <View style={styles.surahCopy}>
              <Text style={styles.surahName}>{surah.surahNameEnglish}</Text>
              <Text style={styles.surahArabic}>{surah.surahNameArabic}</Text>
            </View>
            <VerificationBadge verification={surah.verification} />
          </View>
          <Text style={styles.bodyText}>{getQuranSafetyMessage(surah)}</Text>
        </Pressable>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  noticeText: {
    ...typography.body,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.78,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  surahNumberBadge: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNumber: {
    color: colors.secondary,
    fontSize: 19,
    fontWeight: '900',
  },
  surahCopy: {
    flex: 1,
  },
  surahName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  surahArabic: {
    color: colors.primaryDark,
    fontSize: 23,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  bodyText: {
    ...typography.body,
    color: colors.text,
  },
});
