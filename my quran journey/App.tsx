import { StatusBar } from 'expo-status-bar';
import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ProgressProvider } from '@/store/progressStore';

type ScalableComponent = {
  defaultProps?: {
    allowFontScaling?: boolean;
    maxFontSizeMultiplier?: number;
  };
};

const capTextScaling = (component: ScalableComponent) => {
  component.defaultProps = {
    ...component.defaultProps,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1.12,
  };
};

capTextScaling(Text as unknown as ScalableComponent);
capTextScaling(TextInput as unknown as ScalableComponent);

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
