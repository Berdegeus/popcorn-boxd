import { DarkTheme, DefaultTheme, ThemeProvider, useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <AuthProvider>
      <ThemeProvider value={theme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { isSessionLoading, user } = useAuth();
  const theme = useTheme();

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

  if (isSessionLoading) {
    return loadingView;
  }

  if (user) {
    return <AppStackNavigator />;
  }

  return <AuthStackNavigator />;
}

function AuthStackNavigator() {
  return (
    <Stack key="auth-stack" initialRouteName="(auth)" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

function AppStackNavigator() {
  return (
    <Stack key="app-stack" initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}
