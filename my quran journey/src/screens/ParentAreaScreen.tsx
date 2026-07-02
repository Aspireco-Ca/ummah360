import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SectionPanel } from '@/components/SectionPanel';
import { VerificationBadge } from '@/components/VerificationBadge';
import { placeholderSurahs } from '@/data/surahs.placeholder';
import { translate } from '@/i18n';
import { summarizeProgress } from '@/services/progressService';
import { useProgress } from '@/store/progressStore';
import { colors, radii, spacing, typography } from '@/theme/theme';
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
        <SectionPanel title={t('parentArea')} caption={t('parentGateQuestion')} tone="plain">
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
        </SectionPanel>
      </Screen>
    );
  }

  const setLanguage = (language: UiLanguage) => {
    void setSettings({ language });
  };

  return (
    <Screen>
      <SectionPanel title={t('parentArea')} caption={t('quranDisclaimer')} tone="warm">
        <View style={styles.summaryGrid}>
          <SummaryTile label={t('lettersLearned')} value={summary.learnedLetterCount.toString()} />
          <SummaryTile label={t('gamesCompleted')} value={summary.gamesCompletedCount.toString()} />
          <SummaryTile label={t('stars')} value={summary.starsEarned.toString()} />
        </View>
      </SectionPanel>

      <SectionPanel title={t('language')} caption="Choose how much Arabic appears in the interface." tone="plain">
        <View style={styles.segmentedRow}>
          {(['en', 'ar', 'bilingual'] as UiLanguage[]).map((language) => (
            <Pressable
              key={language}
              style={[styles.segment, progress.settings.language === language && styles.segmentActive]}
              onPress={() => setLanguage(language)}
            >
              <Text style={[styles.segmentText, progress.settings.language === language && styles.segmentTextActive]}>
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
      </SectionPanel>

      <SectionPanel title={t('contentVerification')} caption={t('aboutSources')} tone="plain">
        {placeholderSurahs.map((surah) => (
          <View key={surah.surahNumber} style={styles.verificationRow}>
            <View style={styles.verificationCopy}>
              <Text style={styles.bodyText}>{surah.surahNameEnglish}</Text>
              <Text style={styles.surahArabic}>{surah.surahNameArabic}</Text>
            </View>
            <VerificationBadge verification={surah.verification} />
          </View>
        ))}
        <Text style={styles.sourceNote}>
          TODO: Add verified Mushaf source files, scholar/teacher review metadata, and certified
          recitation audio references before release.
        </Text>
      </SectionPanel>

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

const SummaryTile = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.summaryTile}>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

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
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.borderStrong, true: colors.mint }}
      thumbColor={value ? colors.primary : colors.surface}
    />
  </View>
);

const styles = StyleSheet.create({
  input: {
    minHeight: 56,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
    fontSize: 22,
    color: colors.text,
    backgroundColor: colors.surfaceSoft,
  },
  primaryAction: {
    minHeight: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryTile: {
    minWidth: 104,
    flexGrow: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E6D4A6',
    padding: spacing.md,
  },
  summaryValue: {
    color: colors.primaryDark,
    fontSize: 28,
    fontWeight: '900',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  bodyText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '800',
  },
  sourceNote: {
    ...typography.caption,
    color: colors.placeholder,
  },
  dangerAction: {
    minHeight: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  dangerActionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  feedback: {
    color: colors.success,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  segmentedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  segment: {
    minHeight: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
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
    color: colors.white,
  },
  switchRow: {
    minHeight: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
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
  verificationCopy: {
    flex: 1,
  },
  surahArabic: {
    color: colors.primaryDark,
    fontSize: 19,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
});
