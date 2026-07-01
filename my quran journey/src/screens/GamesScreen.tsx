import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing } from '@/theme/theme';
import { AudioButton } from '@/components/AudioButton';
import { GameCard } from '@/components/GameCard';
import { Screen } from '@/components/Screen';
import { arabicLetters, harakat } from '@/data/arabicLetters';
import { practiceWords } from '@/data/practiceWords';
import { placeholderSurahs } from '@/data/surahs.placeholder';
import { translate, type TranslationKey } from '@/i18n';
import { useProgress } from '@/store/progressStore';
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
        <View style={styles.playCard}>
          <Text style={styles.gameTitle}>{t('letterPop')}</Text>
          <Text style={styles.prompt}>{`${t('findLetter')}: ${target.nameEnglish}`}</Text>
          <AudioButton label={t('playAudio')} audioKey={target.audioKey} kind="letter" />
          <View style={styles.floatingRow}>
            {options.map((letter) => (
              <Pressable
                key={letter.id}
                style={styles.floatingLetter}
                onPress={() => {
                  const result = checkLetterAnswer(letter.id, target.id);
                  void answer('letter-pop', result.correct, result.feedbackKey);
                }}
              >
                <Text style={styles.floatingLetterText}>{letter.arabic}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      );
    }

    if (activeGame === 'match-pair') {
      const target = arabicLetters[4];
      const options = [target.nameEnglish, arabicLetters[1].nameEnglish, arabicLetters[8].nameEnglish];
      return (
        <View style={styles.playCard}>
          <Text style={styles.gameTitle}>{t('matchPair')}</Text>
          <Text style={styles.largeArabic}>{target.arabic}</Text>
          <View style={styles.optionColumn}>
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
        </View>
      );
    }

    if (activeGame === 'find-it-word') {
      const word = practiceWords[1];
      const target = arabicLetters.find((letter) => letter.id === word.targetLetterIds[0]) ?? arabicLetters[0];
      return (
        <View style={styles.playCard}>
          <Text style={styles.gameTitle}>{t('findItWord')}</Text>
          <Text style={styles.safeLabel}>{t('practiceWordsSafeLabel')}</Text>
          <Text style={styles.word}>{word.arabic}</Text>
          <Text style={styles.prompt}>{`${t('findLetter')}: ${target.nameEnglish}`}</Text>
          <View style={styles.floatingRow}>
            {word.targetLetterIds.map((letterId) => {
              const item = arabicLetters.find((letter) => letter.id === letterId) ?? arabicLetters[0];
              return (
                <Pressable
                  key={letterId}
                  style={styles.floatingLetter}
                  onPress={() => {
                    const result = checkLetterAnswer(letterId, target.id);
                    void answer('find-it-word', result.correct, result.feedbackKey);
                  }}
                >
                  <Text style={styles.floatingLetterText}>{item.arabic}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    if (activeGame === 'harakah-hero') {
      const letter = arabicLetters[1];
      const target = harakat[1];
      return (
        <View style={styles.playCard}>
          <Text style={styles.gameTitle}>{t('harakahHero')}</Text>
          <Text style={styles.largeArabic}>{letter.arabic + target.mark}</Text>
          <View style={styles.optionColumn}>
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
        </View>
      );
    }

    const surah = placeholderSurahs[1];
    return (
      <View style={styles.playCard}>
        <Text style={styles.gameTitle}>{t('surahStars')}</Text>
        <Text style={styles.safeLabel}>{t('surahPlaceholder')}</Text>
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
      </View>
    );
  };

  return (
    <Screen>
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

      {renderGame()}
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  gameList: {
    gap: spacing.sm,
  },
  playCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.soft,
  },
  gameTitle: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: '900',
  },
  prompt: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  bodyText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },
  safeLabel: {
    color: colors.placeholder,
    fontSize: 14,
    fontWeight: '800',
  },
  floatingRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  floatingLetter: {
    width: 86,
    height: 86,
    borderRadius: radii.pill,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  floatingLetterText: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  largeArabic: {
    color: colors.primaryDark,
    fontSize: 92,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  optionColumn: {
    gap: spacing.sm,
  },
  textOption: {
    minHeight: 58,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  textOptionLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  word: {
    color: colors.primaryDark,
    fontSize: 64,
    fontWeight: '900',
    textAlign: 'center',
    writingDirection: 'rtl',
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
  feedback: {
    color: colors.success,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
});
