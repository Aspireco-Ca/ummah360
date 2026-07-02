import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AudioButton } from '@/components/AudioButton';
import { Screen } from '@/components/Screen';
import { SectionPanel } from '@/components/SectionPanel';
import { TraceCanvas } from '@/components/TraceCanvas';
import { arabicLetters, getLetterById } from '@/data/arabicLetters';
import { translate } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { useProgress } from '@/store/progressStore';
import { colors, radii, spacing, typography } from '@/theme/theme';
import { checkLetterAnswer, checkTextAnswer } from '@/utils/gameLogic';
import { shuffle, takeRandom } from '@/utils/randomize';

type Props = NativeStackScreenProps<RootStackParamList, 'LetterLesson'>;

export const LetterLessonScreen = ({ navigation, route }: Props) => {
  const { progress, completeLetter, practiceLetter } = useProgress();
  const [feedback, setFeedback] = useState('');
  const letter = getLetterById(route.params.letterId) ?? arabicLetters[0];
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);
  const learned = progress.lettersLearned.includes(letter.id);

  const findOptions = useMemo(
    () => shuffle([letter, ...takeRandom(arabicLetters.filter((item) => item.id !== letter.id), 3)]),
    [letter],
  );

  const soundOptions = useMemo(
    () =>
      shuffle([
        letter.nameEnglish,
        ...takeRandom(
          arabicLetters.filter((item) => item.id !== letter.id),
          2,
        ).map((item) => item.nameEnglish),
      ]),
    [letter],
  );

  const nextLetter = arabicLetters[letter.unlockOrder % arabicLetters.length];
  const formItems = [
    [t('isolated'), letter.isolatedForm],
    [t('beginning'), letter.beginningForm],
    [t('middle'), letter.middleForm],
    [t('end'), letter.endForm],
  ];

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

  const markComplete = async () => {
    await completeLetter(letter.id);
    setFeedback(t('beautifulEffort'));
  };

  return (
    <Screen>
      <View style={styles.lessonHero}>
        <View style={styles.letterTile}>
          <Text style={styles.bigLetter}>{letter.arabic}</Text>
        </View>
        <View style={styles.heroCopy}>
          <View style={styles.lessonMetaRow}>
            <Text style={styles.lessonMeta}>Station {letter.unlockOrder}</Text>
            {learned ? <Text style={styles.learnedPill}>{t('markComplete')}</Text> : null}
          </View>
          <Text style={styles.letterName}>{letter.nameEnglish}</Text>
          <Text style={styles.letterArabicName}>{letter.nameArabic}</Text>
          <AudioButton label={t('playAudio')} audioKey={letter.audioKey} kind="letter" />
        </View>
      </View>

      <View style={styles.formsStrip}>
        {formItems.map(([label, form]) => (
          <View key={label} style={styles.formChip}>
            <Text style={styles.formLabel}>{label}</Text>
            <Text style={styles.formLetter}>{form}</Text>
          </View>
        ))}
      </View>

      <SectionPanel title={t('exampleWord')} caption={t('pronunciationTip')} tone="plain">
        <View style={styles.infoGrid}>
          <View style={styles.wordBox}>
            <Text style={styles.example}>{letter.exampleWordArabic}</Text>
            <Text style={styles.bodyText}>{letter.exampleWordMeaning}</Text>
          </View>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>{letter.pronunciationTip}</Text>
          </View>
        </View>
      </SectionPanel>

      <SectionPanel title={t('traceLetter')} caption="Advanced stroke checking can be added later." tone="warm">
        <TraceCanvas
          guideLetter={letter.arabic}
          prompt={t('tracePrompt')}
          onTraceComplete={() => practiceLetter(letter.id)}
        />
      </SectionPanel>

      <SectionPanel title="Practice" caption="Tap, listen, and try again gently." tone="cool">
        <View style={styles.practiceBlock}>
          <View style={styles.practiceHeader}>
            <Text style={styles.practiceTitle}>{t('findLetter')}</Text>
            <Text style={styles.practicePrompt}>{letter.nameEnglish}</Text>
          </View>
          <View style={styles.optionRow}>
            {findOptions.map((option) => (
              <Pressable key={option.id} style={styles.letterOption} onPress={() => answerLetter(option.id)}>
                <Text style={styles.optionArabic}>{option.arabic}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.practiceBlock}>
          <View style={styles.practiceHeader}>
            <Text style={styles.practiceTitle}>{t('matchSound')}</Text>
            <Text style={styles.practicePrompt}>{letter.arabic}</Text>
          </View>
          <View style={styles.soundGrid}>
            {soundOptions.map((option) => (
              <Pressable key={option} style={styles.textOption} onPress={() => answerSound(option)}>
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </SectionPanel>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <View style={styles.actionRow}>
        <Pressable style={styles.primaryAction} onPress={markComplete}>
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
  lessonHero: {
    minHeight: 168,
    borderRadius: radii.xl,
    backgroundColor: colors.inkPanel,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  letterTile: {
    width: 112,
    height: 122,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigLetter: {
    fontSize: 92,
    color: colors.primaryDark,
    fontWeight: '900',
    lineHeight: 108,
    writingDirection: 'rtl',
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  lessonMetaRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  lessonMeta: {
    ...typography.caption,
    color: '#CDE2D9',
  },
  learnedPill: {
    ...typography.caption,
    color: colors.primaryDark,
    backgroundColor: colors.secondary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  letterName: {
    color: colors.white,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '900',
  },
  letterArabicName: {
    color: '#D5E7DF',
    fontSize: 20,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  formsStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  formChip: {
    flexGrow: 1,
    minWidth: 78,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  formLabel: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
  },
  formLetter: {
    color: colors.primaryDark,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  wordBox: {
    flex: 1,
    minWidth: 142,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceCool,
    padding: spacing.md,
    gap: spacing.xs,
  },
  tipBox: {
    flex: 1,
    minWidth: 142,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.md,
  },
  example: {
    color: colors.primaryDark,
    fontSize: 38,
    lineHeight: 48,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  bodyText: {
    ...typography.body,
    color: colors.text,
  },
  tipText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  practiceBlock: {
    gap: spacing.sm,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  practiceTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  practicePrompt: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  optionRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  letterOption: {
    minWidth: 65,
    minHeight: 62,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionArabic: {
    fontSize: 36,
    color: colors.primaryDark,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  textOption: {
    minHeight: 50,
    minWidth: 112,
    flexGrow: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#C9DED6',
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
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryAction: {
    minHeight: 54,
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  secondaryAction: {
    minHeight: 54,
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
});
