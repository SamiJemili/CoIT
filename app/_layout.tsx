// app/_layout.tsx
import { Stack } from 'expo-router';
import { ActivityIndicator, LogBox, Text } from 'react-native';
import { useFonts } from 'expo-font';
import { ThemeProvider, useTheme } from '../lib/theme';

LogBox.ignoreLogs([
  /WebChannelConnection .* transport errored/i,
  /RPC 'Write' stream .* transport errored/i,
  /RPC 'Listen' stream .* transport errored/i,
]);

function LayoutStack() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerTitle: 'CoIT',
        headerStyle: { backgroundColor: colors.bg },
         headerTintColor: colors.accent,
       headerTitleStyle: { fontWeight: '800', color: colors.text, fontFamily: 'Inter' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
export default function RootLayout() {
   const [fontsLoaded, error] = useFonts({
    Inter: require('../assets/fonts/Inter-VariableFont.ttf'),
  });
  if (error) {
    console.error(error);
    return <Text>Failed to load fonts</Text>;
  }


  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }
 const TextAny = Text as any;
  if (TextAny.defaultProps == null) TextAny.defaultProps = {};
  TextAny.defaultProps.style = [TextAny.defaultProps.style, { fontFamily: 'Inter' }];


  return (
    <ThemeProvider>
      <LayoutStack />
    </ThemeProvider>
  );
}