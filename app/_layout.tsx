// app/_layout.tsx
import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import { colors } from '../lib/theme';

LogBox.ignoreLogs([
  /WebChannelConnection .* transport errored/i,
  /RPC 'Write' stream .* transport errored/i,
  /RPC 'Listen' stream .* transport errored/i,
]);

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: 'CoIT',
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.brand,
        headerTitleStyle: { fontWeight: '800', color: colors.text },
        contentStyle: { backgroundColor: '#fff' },
      }}
    />
  );
}
