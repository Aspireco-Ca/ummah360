import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing } from '@/app/theme';
import { AudioButton } from '@/components/AudioButton';
import { Screen } from '@/components/Screen';
import { arabicLetters, harakat } from '@/data/arabicLetters';
import { practiceWords } from '@/data/practiceWords';
import { translate } from '@/i18n';
import { useProgress } from '@/store/progressStore';
import { checkHarakahAnswer, checkLetterAnswer } from '@/utils/gameLogic';
import { shuffle } from '@/utils/randomize';

export const QuranWordsScreen = () => {
  const { progress, practiceLetter } = useProgress();
  const [feedback, setFeedback] = useState('');
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);
  const word = practiceWords[0];
  const targetLetter = arabicLetters.find((letter) => letter.id === word.targetLetterIds[0]) ?? arabicLetters[0];
  const targetHarakah = harakat[0];
  const harakahOptions = useMemo(() => shuffle(harakat.slice(0, 4)), []);

  const answerLetter = async (letterId: string) => {
    const result = checkLetterAnswer(letterId, targetLetter.id);
    setFeedback(t(result.feedbackKey));

    if (result.correct) {
      await practiceLetter(targetLetter.id);
    }
  };

  const answerHarakah = (harakahId: string) => {
    const result = checkHarakahAnswer(harakahId, targetHarakah.id);
    setFeedback(t(result.feedbackKey));
  };

  return (
    <Screen>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>{t('practiceWords')}</Text>
        <Text style={styles.noticeText}>{t('practiceWordsSafeLabel')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('harakatIntro')}</Text>
        <View style={styles.harakatGrid}>
          {harakat.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.harakahCard}>
              <Text style={styles.harakahMark}>{item.mark}</Text>
              <Text style={styles.harakahName}>{item.englishName}</Text>
              <Text style={styles.harakahArabic}>{item.arabicName}</Text>
              <Text style={styles.harakahHint}>{item.soundHint}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('matchHarakah')}</Text>
        <Text style={styles.bigCombo}>{targetLetter.arabic + targetHarakah.mark}</Text>
        <View style={styles.optionRow}>
          {harakahOptions.map((item) => (
            <Pressable key={item.id} style={styles.option} onPress={() => answerHarakah(item.id)}>
              <Text style={styles.optionText}>{item.englishName}</Text>
              <Text style={styles.optionArabic}>{item.mark}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('findInPracticeWord')}</Text>
        <Text style={styles.word}>{word.arabic}</Text>
        <Text style={styles.bodyText}>{`${targetLetter.nameEnglish} / ${targetLetter.nameArabic}`}</Text>
        <View style={styles.optionRow}>
          {word.targetLetterIds.map((letterId) => {
            const item = arabicLetters.find((letter) => letter.id === letterId) ?? arabicLetters[0];
            return (
              <Pressable key={letterId} style={styles.letterOption} onPress={() => answerLetter(letterId)}>
                <Text style={styles.letterOptionText}>{item.arabic}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('listenPick')}</Text>
        <Text style={styles.bodyText}>{t('audioPlaceholder')}</Text>
        <AudioButton label={t('playAudio')} audioKey={word.audioKey} kind="practiceWord" />
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  notice: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  noticeTitle: {
    color: colors.primaryDark,
    fontSize: 26,
    fontWeight: '900',
  },
  noticeText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.soft,
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
  harakatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  harakahCard: {
    minWidth: 112,
    flexGrow: 1,
    backgroundColor: colors.mint,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  harakahMark: {
    color: colors.primaryDark,
    fontSize: 40,
    fontWeight: '900',
  },
  harakahName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  harakahArabic: {
    color: colors.muted,
    fontSize: 15,
    writingDirection: 'rtl',
  },
  harakahHint: {
    color: colors.text,
    fontSize: 13,
  },
  bigCombo: {
    color: colors.primaryDark,
    fontSize: 88,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    minHeight: 64,
    minWidth: 126,
    flexGrow: 1,
    borderRadius: radii.md,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  optionArabic: {
    color: colors.primaryDark,
    fontSize: 30,
    writingDirection: 'rtl',
  },
  word: {
    color: colors.primaryDark,
    fontSize: 64,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  letterOption: {
    width: 74,
    height: 74,
    borderRadius: radii.md,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterOptionText: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  feedback: {
    color: colors.success,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
});
