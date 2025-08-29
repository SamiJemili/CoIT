// app/_layout.tsx
import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
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
        headerTitleStyle: { fontWeight: '800', color: colors.text },
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
export default function RootLayout() {
  return (
    <ThemeProvider>
      <LayoutStack />
    </ThemeProvider>
  );
}