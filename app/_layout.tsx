import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUser } from '@/storage/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

type InitialRoute = '(auth)' | '(tabs)';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<InitialRoute>('(auth)');

  useEffect(() => {
    async function prepare() {
      const storedUser = await getCurrentUser();
      setInitialRoute(storedUser ? '(tabs)' : '(auth)');
      setIsReady(true);
    }

    void prepare();
  }, []);

  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  const loadingView = useMemo(
    () => (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}
        accessibilityRole="progressbar"
        accessibilityLabel="Carregando preferências de autenticação"
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    ),
    [theme.colors.background, theme.colors.primary],
  );

  return (
    <ThemeProvider value={theme}>
      {isReady ? (
        <Stack initialRouteName={initialRoute}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      ) : (
        loadingView
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
