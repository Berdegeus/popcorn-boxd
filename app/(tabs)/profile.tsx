import { useCallback, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import placeholderAvatar from '@/assets/images/react-logo.png';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleEditProfile = useCallback(() => {
    Alert.alert(
      'Em breve',
      'A edição de perfil estará disponível em uma atualização futura.',
      undefined,
      { cancelable: true },
    );
  }, []);

  const handleLogout = useCallback(async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
      void AccessibilityInfo.announceForAccessibility(
        'Sessão encerrada com sucesso. Faça login novamente.',
      );
      router.replace({ pathname: '/(auth)/login', params: { status: 'signed-out' } });
    } catch (error) {
      console.error('Failed to sign out user', error);
      Alert.alert('Não foi possível encerrar a sessão', (error as Error).message);
    } finally {
      setIsSigningOut(false);
    }
  }, [isSigningOut, router, signOut]);

  if (!user) {
    return (
      <ThemedView style={styles.fallbackContainer} accessibilityLabel="Perfil indisponível">
        <ThemedText accessibilityRole="header" type="title" style={styles.fallbackTitle}>
          Perfil
        </ThemedText>
        <ThemedText style={styles.fallbackMessage}>
          Não foi possível carregar os dados do usuário.
        </ThemedText>
      </ThemedView>
    );
  }

  const profileImageSource = user.imageUri ? { uri: user.imageUri } : placeholderAvatar;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel="Tela de perfil do usuário"
        accessibilityHint="Revise seus dados pessoais e gerencie sua sessão"
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle} accessibilityRole="header">
            Perfil
          </ThemedText>
        </View>

        <View
          style={[styles.profileCard, { backgroundColor: theme.colors.card }]}
        >
          <Image
            source={profileImageSource}
            style={styles.avatar}
            accessibilityRole="image"
            accessibilityLabel={user.imageUri ? `Foto de ${user.name}` : 'Imagem padrão de perfil'}
            accessibilityHint="Foto utilizada no seu perfil"
          />

          <ThemedText
            type="subtitle"
            style={styles.name}
            accessibilityLabel={`Nome: ${user.name}`}
            accessibilityRole="header"
          >
            {user.name}
          </ThemedText>

          <ThemedText
            style={styles.email}
            accessibilityLabel={`E-mail: ${user.email}`}
            accessibilityHint="Seu endereço de e-mail cadastrado"
          >
            {user.email}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleEditProfile}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Editar perfil"
            accessibilityHint="Exibe uma mensagem informando sobre a disponibilidade futura da edição de perfil"
            focusable
          >
            <ThemedText style={[styles.buttonText, styles.buttonTextLight]}>Editar perfil</ThemedText>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={[
              styles.button,
              styles.outlinedButton,
              { borderColor: theme.colors.notification ?? theme.colors.text },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Encerrar sessão"
            accessibilityHint="Finaliza sua sessão atual e retorna à tela de login"
            accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
            disabled={isSigningOut}
            focusable
          >
            {isSigningOut ? (
              <ActivityIndicator color={theme.colors.notification ?? '#ff3b30'} />
            ) : (
              <ThemedText
                style={[styles.buttonText, { color: theme.colors.notification ?? '#ff3b30' }]}
              >
                Sair / Trocar usuário
              </ThemedText>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    gap: 24,
  },
  header: {
    width: '100%',
  },
  headerTitle: {
    textAlign: 'center',
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  name: {
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
  },
  actions: {
    gap: 16,
  },
  button: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextLight: {
    color: '#ffffff',
  },
  outlinedButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fallbackTitle: {
    marginBottom: 16,
  },
  fallbackMessage: {
    textAlign: 'center',
  },
});
