import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function LoginScreen() {
  const router = useRouter();
  const { status: statusParam } = useLocalSearchParams<{ status?: string }>();
  const { signIn } = useAuth();
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'icon');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const normalizedStatus = Array.isArray(statusParam) ? statusParam[0] : statusParam;
  const signOutFeedbackMessage =
    normalizedStatus === 'signed-out'
      ? 'Sessão encerrada com sucesso. Faça login novamente.'
      : '';
  const [feedbackMessage, setFeedbackMessage] = useState(signOutFeedbackMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFeedbackMessage(signOutFeedbackMessage);
  }, [signOutFeedbackMessage]);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !trimmedPassword) {
      setErrorMessage('Informe e-mail e senha para continuar.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    if (feedbackMessage) {
      setFeedbackMessage('');
    }

    try {
      await signIn({ email: normalizedEmail, password: trimmedPassword });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to sign in', error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
        return;
      }

      Alert.alert('Erro', 'Não foi possível realizar o login. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToSignUp = () => {
    router.push('/(auth)/signup');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoiding}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title} accessibilityRole="header">
            Bem-vindo de volta
          </ThemedText>

          <View style={styles.field}>
            <ThemedText style={styles.label}>E-mail</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="seu@email.com"
              placeholderTextColor={mutedColor}
              accessibilityLabel="Campo de e-mail"
              style={styles.input}
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Senha</ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Sua senha"
              placeholderTextColor={mutedColor}
              accessibilityLabel="Campo de senha"
              style={styles.input}
              textContentType="password"
            />
          </View>

          {feedbackMessage ? (
            <ThemedText
              style={styles.feedback}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
            >
              {feedbackMessage}
            </ThemedText>
          ) : null}

          {errorMessage ? (
            <ThemedText style={styles.error} accessibilityLiveRegion="polite">
              {errorMessage}
            </ThemedText>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            accessibilityRole="button"
            accessibilityLabel="Entrar na conta"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.primaryButtonText}>Entrar</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNavigateToSignUp}
            style={styles.secondaryButton}
            accessibilityRole="button"
            accessibilityLabel="Ir para tela de cadastro"
          >
            <ThemedText style={styles.secondaryButtonText}>Criar conta</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  field: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    minHeight: 48,
    fontSize: 16,
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 4,
  },
  feedback: {
    color: '#16A34A',
    fontSize: 14,
    marginTop: 4,
  },
  primaryButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
