import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AudioButton } from '@/components/AudioButton';
import { GameCard } from '@/components/GameCard';
import { Screen } from '@/components/Screen';
import { SectionPanel } from '@/components/SectionPanel';
import { arabicLetters, harakat } from '@/data/arabicLetters';
import { practiceWords } from '@/data/practiceWords';
import { placeholderSurahs } from '@/data/surahs.placeholder';
import { translate, type TranslationKey } from '@/i18n';
import { useProgress } from '@/store/progressStore';
import { colors, radii, spacing, typography } from '@/theme/theme';
import type { GameDefinition, GameId } from '@/types/game';
import { checkHarakahAnswer, checkLetterAnswer, checkTextAnswer } from '@/utils/gameLogic';

const games: GameDefinition[] = [
  { id: 'letter-pop', titleKey: 'letterPop', descriptionKey: 'letterPopDesc', level: 'easy' },
  { id: 'match-pair', titleKey: 'matchPair', descriptionKey: 'matchPairDesc', level: 'easy' },
  { id: 'find-it-word', titleKey: 'findItWord', descriptionKey: 'findItWordDesc', level: 'easy' },
  { id: 'harakah-hero', titleKey: 'harakahHero', descriptionKey: 'harakahHeroDesc', level: 'medium' },
  { id: 'surah-stars', titleKey: 'surahStars', descriptionKey: 'surahStarsDesc', level: 'easy' },
];

export const GamesScreen = () => {
  const { progress, completeGame, practiceSurah } = useProgress();
  const [activeGame, setActiveGame] = useState<GameId>('letter-pop');
  const [feedback, setFeedback] = useState('');
  const t = (key: TranslationKey) => translate(key, progress.settings.language);

  const answer = async (gameId: GameId, correct: boolean, feedbackKey: TranslationKey) => {
    setFeedback(t(feedbackKey));

    if (correct) {
      await completeGame(gameId);
    }
  };

  const renderGame = () => {
    if (activeGame === 'letter-pop') {
      const target = arabicLetters[2];
      const options = [target, arabicLetters[0], arabicLetters[6], arabicLetters[12]];
      return (
        <SectionPanel title={t('letterPop')} caption={`${t('findLetter')}: ${target.nameEnglish}`} tone="ink">
          <AudioButton label={t('playAudio')} audioKey={target.audioKey} kind="letter" />
          <View style={styles.popField}>
            {options.map((letter, index) => (
              <Pressable
                key={letter.id}
                style={[styles.bubble, bubbleOffsets[index]]}
                onPress={() => {
                  const result = checkLetterAnswer(letter.id, target.id);
                  void answer('letter-pop', result.correct, result.feedbackKey);
                }}
              >
                <Text style={styles.bubbleText}>{letter.arabic}</Text>
              </Pressable>
            ))}
          </View>
        </SectionPanel>
      );
    }

    if (activeGame === 'match-pair') {
      const target = arabicLetters[4];
      const options = [target.nameEnglish, arabicLetters[1].nameEnglish, arabicLetters[8].nameEnglish];
      return (
        <SectionPanel title={t('matchPair')} caption={t('matchPairDesc')} tone="cool">
          <Text style={styles.largeArabic}>{target.arabic}</Text>
          <View style={styles.optionGrid}>
            {options.map((option) => (
              <Pressable
                key={option}
                style={styles.textOption}
                onPress={() => {
                  const result = checkTextAnswer(option, target.nameEnglish);
                  void answer('match-pair', result.correct, result.feedbackKey);
                }}
              >
                <Text style={styles.textOptionLabel}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </SectionPanel>
      );
    }

    if (activeGame === 'find-it-word') {
      const word = practiceWords[1];
      const target = arabicLetters.find((letter) => letter.id === word.targetLetterIds[0]) ?? arabicLetters[0];
      return (
        <SectionPanel title={t('findItWord')} caption={t('practiceWordsSafeLabel')} tone="warm">
          <Text style={styles.word}>{word.arabic}</Text>
          <Text style={styles.prompt}>{`${t('findLetter')}: ${target.nameEnglish}`}</Text>
          <View style={styles.optionRow}>
            {word.targetLetterIds.map((letterId) => {
              const item = arabicLetters.find((letter) => letter.id === letterId) ?? arabicLetters[0];
              return (
                <Pressable
                  key={letterId}
                  style={styles.letterOption}
                  onPress={() => {
                    const result = checkLetterAnswer(letterId, target.id);
                    void answer('find-it-word', result.correct, result.feedbackKey);
                  }}
                >
                  <Text style={styles.letterOptionText}>{item.arabic}</Text>
                </Pressable>
              );
            })}
          </View>
        </SectionPanel>
      );
    }

    if (activeGame === 'harakah-hero') {
      const letter = arabicLetters[1];
      const target = harakat[1];
      return (
        <SectionPanel title={t('harakahHero')} caption={t('harakahHeroDesc')} tone="plain">
          <Text style={styles.largeArabic}>{letter.arabic + target.mark}</Text>
          <View style={styles.optionGrid}>
            {harakat.slice(0, 4).map((item) => (
              <Pressable
                key={item.id}
                style={styles.textOption}
                onPress={() => {
                  const result = checkHarakahAnswer(item.id, target.id);
                  void answer('harakah-hero', result.correct, result.feedbackKey);
                }}
              >
                <Text style={styles.textOptionLabel}>{`${item.englishName} ${item.mark}`}</Text>
              </Pressable>
            ))}
          </View>
        </SectionPanel>
      );
    }

    const surah = placeholderSurahs[1];
    return (
      <SectionPanel title={t('surahStars')} caption={t('surahPlaceholder')} tone="plain">
        <Text style={styles.prompt}>{surah.surahNameEnglish}</Text>
        <Text style={styles.bodyText}>{t('surahParentNote')}</Text>
        <Pressable
          style={styles.primaryAction}
          onPress={() => {
            void practiceSurah(surah.surahNumber);
            setFeedback(t('beautifulEffort'));
          }}
        >
          <Text style={styles.primaryActionText}>{t('markComplete')}</Text>
        </Pressable>
      </SectionPanel>
    );
  };

  return (
    <Screen>
      <SectionPanel title={t('games')} caption="Short, calm practice games with no timers." tone="cool">
        <View style={styles.gameList}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              title={t(game.titleKey as TranslationKey)}
              description={t(game.descriptionKey as TranslationKey)}
              active={activeGame === game.id}
              onPress={() => {
                setActiveGame(game.id);
                setFeedback('');
              }}
            />
          ))}
        </View>
      </SectionPanel>

      {renderGame()}
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
    </Screen>
  );
};

const bubbleOffsets = [
  { marginTop: 0 },
  { marginTop: 28 },
  { marginTop: 10 },
  { marginTop: 36 },
];

const styles = StyleSheet.create({
  gameList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  popField: {
    minHeight: 166,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bubble: {
    width: 68,
    height: 68,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  bubbleText: {
    color: colors.primaryDark,
    fontSize: 38,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  prompt: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  bodyText: {
    ...typography.body,
    color: colors.text,
  },
  largeArabic: {
    color: colors.primaryDark,
    fontSize: 82,
    lineHeight: 98,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  textOption: {
    minHeight: 54,
    minWidth: 126,
    flexGrow: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  textOptionLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  word: {
    color: colors.primaryDark,
    fontSize: 58,
    lineHeight: 72,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  optionRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  letterOption: {
    width: 62,
    height: 62,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  letterOptionText: {
    color: colors.primaryDark,
    fontSize: 34,
    fontWeight: '900',
    writingDirection: 'rtl',
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
