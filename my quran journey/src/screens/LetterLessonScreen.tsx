import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Vibration } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AudioButton } from '@/components/AudioButton';
import { Screen } from '@/components/Screen';
import { SectionPanel } from '@/components/SectionPanel';
import { TraceCanvas } from '@/components/TraceCanvas';
import { arabicLetters, getLetterById } from '@/data/arabicLetters';
import { translate } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { playFeedbackAudio, playLetterAudio } from '@/services/audioService';
import { useProgress } from '@/store/progressStore';
import { colors, radii, spacing, typography } from '@/theme/theme';
import { checkLetterAnswer, checkTextAnswer } from '@/utils/gameLogic';
import { shuffle, takeRandom } from '@/utils/randomize';

type Props = NativeStackScreenProps<RootStackParamList, 'LetterLesson'>;
type LessonStep = 'listen' | 'say' | 'trace' | 'find';

export const LetterLessonScreen = ({ navigation, route }: Props) => {
  const { progress, completeLetter, practiceLetter } = useProgress();
  const [feedback, setFeedback] = useState('');
  const [completedSteps, setCompletedSteps] = useState<Record<LessonStep, boolean>>({
    listen: false,
    say: false,
    trace: false,
    find: false,
  });
  const letter = getLetterById(route.params.letterId) ?? arabicLetters[0];
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);
  const learned = progress.lettersLearned.includes(letter.id);
  const canPlayFeedback = progress.settings.audioEnabled && !progress.settings.reduceSoundEffects;

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
  const loopItems: Array<{ id: LessonStep; step: string; label: string }> = [
    { id: 'listen', step: '1', label: 'Listen' },
    { id: 'say', step: '2', label: 'Say' },
    { id: 'trace', step: '3', label: 'Trace' },
    { id: 'find', step: '4', label: 'Find' },
  ];

  const markStep = (step: LessonStep) => {
    setCompletedSteps((current) => ({ ...current, [step]: true }));
  };

  const playLetter = async () => {
    if (!progress.settings.audioEnabled) {
      return;
    }

    try {
      Vibration.vibrate(12);
      await playLetterAudio(letter.audioKey);
      markStep('listen');
    } catch (error) {
      console.warn('[letter audio failed]', letter.audioKey, error);
    }
  };

  const answerLetter = async (letterId: string) => {
    const result = checkLetterAnswer(letterId, letter.id);
    setFeedback(t(result.feedbackKey));
    if (canPlayFeedback) {
      void playFeedbackAudio(result.feedbackKey);
    }

    if (result.correct) {
      markStep('find');
      await practiceLetter(letter.id);
    }
  };

  const answerSound = async (name: string) => {
    const result = checkTextAnswer(name, letter.nameEnglish);
    setFeedback(t(result.feedbackKey));
    if (canPlayFeedback) {
      void playFeedbackAudio(result.feedbackKey);
    }

    if (result.correct) {
      markStep('say');
      await practiceLetter(letter.id);
    }
  };

  const markComplete = async () => {
    await completeLetter(letter.id);
    setCompletedSteps({ listen: true, say: true, trace: true, find: true });
    setFeedback(t('beautifulEffort'));
    if (canPlayFeedback) {
      void playFeedbackAudio('beautifulEffort');
    }
  };

  return (
    <Screen>
      <View style={styles.lessonHero}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Hear ${letter.nameEnglish}`}
          style={({ pressed }) => [styles.letterTile, pressed && styles.letterTilePressed]}
          onPress={() => {
            void playLetter();
          }}
        >
          <View style={styles.soundBars}>
            <View style={[styles.soundBar, styles.soundBarShort]} />
            <View style={styles.soundBar} />
            <View style={[styles.soundBar, styles.soundBarTall]} />
          </View>
          <Text style={styles.bigLetter}>{letter.arabic}</Text>
        </Pressable>
        <View style={styles.heroCopy}>
          <View style={styles.lessonMetaRow}>
            <Text style={styles.lessonMeta}>Station {letter.unlockOrder}</Text>
            {learned ? <Text style={styles.learnedPill}>{t('markComplete')}</Text> : null}
          </View>
          <Text style={styles.letterName}>{letter.nameEnglish}</Text>
          <Text style={styles.letterArabicName}>{letter.nameArabic}</Text>
          <Text style={styles.audioHint}>Tap the letter to hear its sound.</Text>
          <AudioButton
            label={t('playAudio')}
            audioKey={letter.audioKey}
            kind="letter"
            onPlayed={() => markStep('listen')}
          />
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

      <SectionPanel title="Learning loop" caption="A calm routine for memory: hear it, say it, draw it, find it." tone="cool">
        <View style={styles.loopRow}>
          {loopItems.map(({ id, step, label }) => (
            <View key={id} style={[styles.loopStep, completedSteps[id] && styles.loopStepDone]}>
              <Text style={[styles.loopNumber, completedSteps[id] && styles.loopNumberDone]}>{step}</Text>
              <Text style={[styles.loopLabel, completedSteps[id] && styles.loopLabelDone]}>{label}</Text>
            </View>
          ))}
        </View>
      </SectionPanel>

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
          onTraceComplete={() => {
            void practiceLetter(letter.id);
            markStep('trace');
            Vibration.vibrate(10);
            if (canPlayFeedback) {
              void playFeedbackAudio('beautifulEffort');
            }
          }}
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
  loopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  loopStep: {
    flexGrow: 1,
    minWidth: 68,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#C9DED6',
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  loopNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    color: colors.white,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 13,
    fontWeight: '900',
  },
  loopLabel: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
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
