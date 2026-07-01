import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/app/theme';
import { GamesScreen } from '@/screens/GamesScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { LetterLessonScreen } from '@/screens/LetterLessonScreen';
import { LetterMapScreen } from '@/screens/LetterMapScreen';
import { ParentAreaScreen } from '@/screens/ParentAreaScreen';
import { ProgressScreen } from '@/screens/ProgressScreen';
import { QuranWordsScreen } from '@/screens/QuranWordsScreen';
import { SurahDetailScreen } from '@/screens/SurahDetailScreen';
import { SurahListScreen } from '@/screens/SurahListScreen';
import type { RootStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Quran Garden' }} />
      <Stack.Screen name="LetterMap" component={LetterMapScreen} options={{ title: 'Garden of Letters' }} />
      <Stack.Screen name="LetterLesson" component={LetterLessonScreen} options={{ title: 'Letter Lesson' }} />
      <Stack.Screen name="QuranWords" component={QuranWordsScreen} options={{ title: 'Practice Words' }} />
      <Stack.Screen name="Surahs" component={SurahListScreen} options={{ title: 'Short Surahs' }} />
      <Stack.Screen name="SurahDetail" component={SurahDetailScreen} options={{ title: 'Surah Practice' }} />
      <Stack.Screen name="Games" component={GamesScreen} options={{ title: 'Games' }} />
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
      <Stack.Screen name="ParentArea" component={ParentAreaScreen} options={{ title: 'Parent Area' }} />
    </Stack.Navigator>
  </NavigationContainer>
);
