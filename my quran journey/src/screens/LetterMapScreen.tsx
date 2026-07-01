import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing } from '@/theme/theme';
import { ArabicLetterCard } from '@/components/ArabicLetterCard';
import { Screen } from '@/components/Screen';
import { arabicLetters } from '@/data/arabicLetters';
import { translate } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { useProgress } from '@/store/progressStore';

type Props = NativeStackScreenProps<RootStackParamList, 'LetterMap'>;

export const LetterMapScreen = ({ navigation }: Props) => {
  const { progress } = useProgress();
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);

  return (
    <Screen>
      <View>
        <Text style={styles.title}>{t('lettersTitle')}</Text>
        <Text style={styles.subtitle}>{t('keepPracticing')}</Text>
      </View>
      <View style={styles.grid}>
        {arabicLetters.map((letter) => (
          <ArabicLetterCard
            key={letter.id}
            letter={letter}
            learned={progress.lettersLearned.includes(letter.id)}
            onPress={() => navigation.navigate('LetterLesson', { letterId: letter.id })}
          />
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.primaryDark,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
