import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radii, shadows, spacing } from '@/app/theme';
import { AudioButton } from '@/components/AudioButton';
import { Screen } from '@/components/Screen';
import { TraceCanvas } from '@/components/TraceCanvas';
import { arabicLetters, getLetterById } from '@/data/arabicLetters';
import { translate } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { useProgress } from '@/store/progressStore';
import { checkLetterAnswer, checkTextAnswer } from '@/utils/gameLogic';
import { shuffle, takeRandom } from '@/utils/randomize';

type Props = NativeStackScreenProps<RootStackParamList, 'LetterLesson'>;

export const LetterLessonScreen = ({ navigation, route }: Props) => {
  const { progress, completeLetter, practiceLetter } = useProgress();
  const [feedback, setFeedback] = useState('');
  const letter = getLetterById(route.params.letterId) ?? arabicLetters[0];
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);

  const findOptions = useMemo(
    () => shuffle([letter, ...takeRandom(arabicLetters.filter((item) => item.id !== letter.id), 3)]),
    [letter],
  );

  const soundOptions = useMemo(
    () => shuffle([letter.nameEnglish, ...takeRandom(arabicLetters.filter((item) => item.id !== letter.id), 2).map((item) => item.nameEnglish)]),
    [letter],
  );

  const nextLetter = arabicLetters[letter.unlockOrder % arabicLetters.length];

  const answerLetter = async (letterId: string) => {
    const result = checkLetterAnswer(letterId, letter.id);
    setFeedback(t(result.feedbackKey));

    if (result.correct) {
      await practiceLetter(letter.id);
    }
  };

  const answerSound = async (name: string) => {
    const result = checkTextAnswer(name, letter.nameEnglish);
    setFeedback(t(result.feedbackKey));

    if (result.correct) {
      await practiceLetter(letter.id);
    }
  };

  return (
    <Screen>
      <View style={styles.lessonCard}>
        <Text style={styles.bigLetter}>{letter.arabic}</Text>
        <Text style={styles.letterName}>{letter.nameEnglish}</Text>
        <Text style={styles.letterArabicName}>{letter.nameArabic}</Text>
        <AudioButton label={t('playAudio')} audioKey={letter.audioKey} kind="letter" />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('exampleWord')}</Text>
        <Text style={styles.example}>{letter.exampleWordArabic}</Text>
        <Text style={styles.bodyText}>{letter.exampleWordMeaning}</Text>
        <Text style={styles.sectionTitle}>{t('pronunciationTip')}</Text>
        <Text style={styles.bodyText}>{letter.pronunciationTip}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('letterForms')}</Text>
        <View style={styles.formsGrid}>
          {[
            [t('isolated'), letter.isolatedForm],
            [t('beginning'), letter.beginningForm],
            [t('middle'), letter.middleForm],
            [t('end'), letter.endForm],
          ].map(([label, form]) => (
            <View key={label} style={styles.formBox}>
              <Text style={styles.formLabel}>{label}</Text>
              <Text style={styles.formLetter}>{form}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('traceLetter')}</Text>
        <TraceCanvas
          guideLetter={letter.arabic}
          prompt={t('tracePrompt')}
          onTraceComplete={() => practiceLetter(letter.id)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('findLetter')}</Text>
        <Text style={styles.bodyText}>{letter.nameEnglish}</Text>
        <View style={styles.optionRow}>
          {findOptions.map((option) => (
            <Pressable key={option.id} style={styles.letterOption} onPress={() => answerLetter(option.id)}>
              <Text style={styles.optionArabic}>{option.arabic}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('matchSound')}</Text>
        <View style={styles.optionColumn}>
          {soundOptions.map((option) => (
            <Pressable key={option} style={styles.textOption} onPress={() => answerSound(option)}>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <View style={styles.actionRow}>
        <Pressable style={styles.primaryAction} onPress={() => completeLetter(letter.id)}>
          <Text style={styles.primaryActionText}>{t('markComplete')}</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryAction}
          onPress={() => navigation.replace('LetterLesson', { letterId: nextLetter.id })}
        >
          <Text style={styles.secondaryActionText}>{t('nextLetter')}</Text>
        </Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  lessonCard: {
    backgroundColor: colors.mint,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.soft,
  },
  bigLetter: {
    fontSize: 126,
    color: colors.primaryDark,
    fontWeight: '900',
    lineHeight: 146,
    writingDirection: 'rtl',
  },
  letterName: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  letterArabicName: {
    color: colors.muted,
    fontSize: 24,
    writingDirection: 'rtl',
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
    fontSize: 19,
    fontWeight: '900',
  },
  bodyText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  example: {
    color: colors.primaryDark,
    fontSize: 44,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  formsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  formBox: {
    flexGrow: 1,
    minWidth: 126,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  formLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  formLetter: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  optionRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionColumn: {
    gap: spacing.sm,
  },
  letterOption: {
    minWidth: 76,
    minHeight: 72,
    borderRadius: radii.md,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionArabic: {
    fontSize: 40,
    color: colors.text,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  textOption: {
    minHeight: 56,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  optionText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  feedback: {
    color: colors.success,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  actionRow: {
    gap: spacing.md,
  },
  primaryAction: {
    minHeight: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  secondaryAction: {
    minHeight: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
});
