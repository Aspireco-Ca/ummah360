import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { colors, radii, shadows, spacing } from '@/theme/theme';
import { Screen } from '@/components/Screen';
import { VerificationBadge } from '@/components/VerificationBadge';
import { placeholderSurahs } from '@/data/surahs.placeholder';
import { translate } from '@/i18n';
import { summarizeProgress } from '@/services/progressService';
import { useProgress } from '@/store/progressStore';
import type { UiLanguage } from '@/types/progress';

export const ParentAreaScreen = () => {
  const { progress, reset, setSettings } = useProgress();
  const [answer, setAnswer] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState('');
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);
  const summary = summarizeProgress(progress);

  if (!unlocked) {
    return (
      <Screen>
        <View style={styles.gateCard}>
          <Text style={styles.title}>{t('parentArea')}</Text>
          <Text style={styles.bodyText}>{t('parentGateQuestion')}</Text>
          <TextInput
            accessibilityLabel={t('parentGateQuestion')}
            value={answer}
            onChangeText={setAnswer}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Pressable
            style={styles.primaryAction}
            onPress={() => {
              if (answer.trim() === '12') {
                setUnlocked(true);
                setMessage('');
              } else {
                setMessage(t('tryAgain'));
              }
            }}
          >
            <Text style={styles.primaryActionText}>{t('unlockParentArea')}</Text>
          </Pressable>
          {message ? <Text style={styles.feedback}>{message}</Text> : null}
        </View>
      </Screen>
    );
  }

  const setLanguage = (language: UiLanguage) => {
    void setSettings({ language });
  };

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>{t('parentArea')}</Text>
        <Text style={styles.bodyText}>{t('quranDisclaimer')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('progress')}</Text>
        <Text style={styles.bodyText}>{`${t('lettersLearned')}: ${summary.learnedLetterCount}`}</Text>
        <Text style={styles.bodyText}>{`${t('gamesCompleted')}: ${summary.gamesCompletedCount}`}</Text>
        <Text style={styles.bodyText}>{`${t('stars')}: ${summary.starsEarned}`}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <View style={styles.segmentedRow}>
          {(['en', 'ar', 'bilingual'] as UiLanguage[]).map((language) => (
            <Pressable
              key={language}
              style={[
                styles.segment,
                progress.settings.language === language && styles.segmentActive,
              ]}
              onPress={() => setLanguage(language)}
            >
              <Text
                style={[
                  styles.segmentText,
                  progress.settings.language === language && styles.segmentTextActive,
                ]}
              >
                {language === 'en' ? t('english') : language === 'ar' ? t('arabic') : t('bilingual')}
              </Text>
            </Pressable>
          ))}
        </View>

        <SettingSwitch
          label={t('audio')}
          value={progress.settings.audioEnabled}
          onValueChange={(value) => setSettings({ audioEnabled: value })}
        />
        <SettingSwitch
          label={t('transliteration')}
          value={progress.settings.transliterationEnabled}
          onValueChange={(value) => setSettings({ transliterationEnabled: value })}
        />
        <SettingSwitch
          label={t('reduceSoundEffects')}
          value={progress.settings.reduceSoundEffects}
          onValueChange={(value) => setSettings({ reduceSoundEffects: value })}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('contentVerification')}</Text>
        {placeholderSurahs.map((surah) => (
          <View key={surah.surahNumber} style={styles.verificationRow}>
            <View>
              <Text style={styles.bodyText}>{surah.surahNameEnglish}</Text>
              <Text style={styles.surahArabic}>{surah.surahNameArabic}</Text>
            </View>
            <VerificationBadge verification={surah.verification} />
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('aboutSources')}</Text>
        <Text style={styles.bodyText}>
          TODO: Add verified Mushaf source files, scholar/teacher review metadata, and certified
          recitation audio references before release.
        </Text>
      </View>

      <Pressable
        style={styles.dangerAction}
        onPress={() => {
          void reset();
          setMessage(t('greatJob'));
        }}
      >
        <Text style={styles.dangerActionText}>{t('resetProgress')}</Text>
      </Pressable>
      {message ? <Text style={styles.feedback}>{message}</Text> : null}
    </Screen>
  );
};

const SettingSwitch = ({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) => (
  <View style={styles.switchRow}>
    <Text style={styles.switchLabel}>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} />
  </View>
);

const styles = StyleSheet.create({
  gateCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.soft,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.soft,
  },
  title: {
    color: colors.primaryDark,
    fontSize: 28,
    fontWeight: '900',
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
  input: {
    minHeight: 58,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: 22,
    color: colors.text,
    backgroundColor: colors.background,
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
  dangerAction: {
    minHeight: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerActionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  feedback: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  segmentedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  segment: {
    minHeight: 48,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentText: {
    color: colors.text,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    minHeight: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  verificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  surahArabic: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
});
