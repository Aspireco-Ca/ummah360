import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AudioButton } from '@/components/AudioButton';
import { Screen } from '@/components/Screen';
import { SectionPanel } from '@/components/SectionPanel';
import { arabicLetters, harakat } from '@/data/arabicLetters';
import { practiceWords } from '@/data/practiceWords';
import { translate } from '@/i18n';
import { useProgress } from '@/store/progressStore';
import { colors, radii, spacing, typography } from '@/theme/theme';
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
      <SectionPanel title={t('practiceWords')} caption={t('practiceWordsSafeLabel')} tone="warm">
        <View style={styles.wordHero}>
          <Text style={styles.wordHeroText}>{word.arabic}</Text>
          <Text style={styles.wordHeroLabel}>Practice word</Text>
        </View>
      </SectionPanel>

      <SectionPanel title={t('harakatIntro')} caption="Short vowels children meet before Quran reading." tone="plain">
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
      </SectionPanel>

      <SectionPanel title={t('matchHarakah')} caption="Pick the vowel mark that matches the sound." tone="cool">
        <Text style={styles.bigCombo}>{targetLetter.arabic + targetHarakah.mark}</Text>
        <View style={styles.optionRow}>
          {harakahOptions.map((item) => (
            <Pressable key={item.id} style={styles.option} onPress={() => answerHarakah(item.id)}>
              <Text style={styles.optionText}>{item.englishName}</Text>
              <Text style={styles.optionArabic}>{item.mark}</Text>
            </Pressable>
          ))}
        </View>
      </SectionPanel>

      <SectionPanel title={t('findInPracticeWord')} caption={`${targetLetter.nameEnglish} / ${targetLetter.nameArabic}`} tone="plain">
        <Text style={styles.word}>{word.arabic}</Text>
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
      </SectionPanel>

      <SectionPanel title={t('listenPick')} caption={t('audioPlaceholder')} tone="plain">
        <AudioButton label={t('playAudio')} audioKey={word.audioKey} kind="practiceWord" />
      </SectionPanel>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  wordHero: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E6D4A6',
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  wordHeroText: {
    color: colors.primaryDark,
    fontSize: 58,
    lineHeight: 72,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  wordHeroLabel: {
    ...typography.caption,
    color: colors.placeholder,
  },
  harakatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  harakahCard: {
    minWidth: 96,
    flexGrow: 1,
    backgroundColor: colors.surfaceCool,
    borderRadius: radii.lg,
    padding: spacing.sm,
    alignItems: 'center',
  },
  harakahMark: {
    color: colors.primaryDark,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900',
  },
  harakahName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  harakahArabic: {
    color: colors.muted,
    fontSize: 14,
    writingDirection: 'rtl',
  },
  harakahHint: {
    ...typography.caption,
    color: colors.text,
  },
  bigCombo: {
    color: colors.primaryDark,
    fontSize: 76,
    lineHeight: 92,
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
    minHeight: 58,
    minWidth: 116,
    flexGrow: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  optionArabic: {
    color: colors.primaryDark,
    fontSize: 25,
    writingDirection: 'rtl',
  },
  word: {
    color: colors.primaryDark,
    fontSize: 54,
    lineHeight: 68,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  letterOption: {
    width: 62,
    height: 62,
    borderRadius: radii.lg,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterOptionText: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  feedback: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    backgroundColor: '#EAF6EE',
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
  },
});
