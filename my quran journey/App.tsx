import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ProgressProvider } from '@/store/progressStore';

export default function App() {
  return (
    <SafeAreaProvider>
      <ProgressProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </ProgressProvider>
    </SafeAreaProvider>
  );
}
