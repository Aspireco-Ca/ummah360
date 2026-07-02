import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArabicLetterCard } from '@/components/ArabicLetterCard';
import { Screen } from '@/components/Screen';
import { SectionPanel } from '@/components/SectionPanel';
import { arabicLetters } from '@/data/arabicLetters';
import { translate } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { useProgress } from '@/store/progressStore';
import { colors, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LetterMap'>;

export const LetterMapScreen = ({ navigation }: Props) => {
  const { progress } = useProgress();
  const t = (key: Parameters<typeof translate>[0]) => translate(key, progress.settings.language);
  const learnedCount = progress.lettersLearned.length;

  return (
    <Screen>
      <SectionPanel
        title={t('lettersTitle')}
        caption={t('keepPracticing')}
        tone="cool"
        trailing={<Text style={styles.counter}>{learnedCount}/{arabicLetters.length}</Text>}
      >
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotReady]} />
            <Text style={styles.legendText}>Ready</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotDone]} />
            <Text style={styles.legendText}>Learned</Text>
          </View>
        </View>
      </SectionPanel>

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
  counter: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendDotReady: {
    backgroundColor: colors.borderStrong,
  },
  legendDotDone: {
    backgroundColor: colors.secondary,
  },
  legendText: {
    ...typography.caption,
    color: colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
});
