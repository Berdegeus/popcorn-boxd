import { DarkTheme, DefaultTheme, ThemeProvider, useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DesignSystemProvider } from '@/context/DesignSystemContext';
import { WatchedMoviesProvider } from '@/context/WatchedMoviesContext';
import { useAppTheme } from '@/hooks/useAppTheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <DesignSystemProvider>
      <AuthProvider>
        <WatchedMoviesProvider>
          <NavigationProviders />
        </WatchedMoviesProvider>
      </AuthProvider>
    </DesignSystemProvider>
  );
}

function NavigationProviders() {
  const appTheme = useAppTheme();

  const navigationTheme = useMemo(() => {
    const baseTheme = appTheme.mode === 'dark' ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: appTheme.colors.tint,
        background: appTheme.colors.background,
        card: appTheme.colors.surface,
        text: appTheme.colors.text,
        border: appTheme.colors.border,
        notification: appTheme.colors.primary,
      },
    };
  }, [appTheme]);

  return (
    <ThemeProvider value={navigationTheme}>
      <RootNavigator />
      <StatusBar style={appTheme.mode === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
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
    return <AppStackNavigator userId={user.id} />;
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

type AppStackNavigatorProps = {
  userId: string;
};

function AppStackNavigator({ userId }: AppStackNavigatorProps) {
  return (
    <Stack
      key={`app-stack-${userId}`}
      initialRouteName="(tabs)"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      <Stack.Screen name="movie/[id]" options={{ headerShown: true, title: 'Detalhes do filme' }} />
    </Stack>
  );
}
