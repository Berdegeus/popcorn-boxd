import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { status: statusParam } = useLocalSearchParams<{ status?: string }>();
  const { signIn } = useAuth();

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

  const passwordInputRef = useRef<TextInput | null>(null);

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

  const isSubmitDisabled = useMemo(() => {
    return email.trim().length === 0 || password.trim().length === 0 || isSubmitting;
  }, [email, isSubmitting, password]);

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

          <View style={styles.fieldsGroup}>
            <TextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="seu@email.com"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordInputRef.current?.focus?.();
              }}
              blurOnSubmit={false}
            />

            <TextField
              ref={passwordInputRef}
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Sua senha"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {feedbackMessage ? (
            <FormMessage message={feedbackMessage} variant="success" style={styles.messageSpacing} />
          ) : null}

          {errorMessage ? (
            <FormMessage message={errorMessage} variant="error" style={styles.messageSpacing} />
          ) : null}

          <Button
            label="Entrar"
            onPress={handleLogin}
            loading={isSubmitting}
            disabled={isSubmitDisabled}
            accessibilityLabel="Entrar na conta"
          />

          <Button
            label="Criar conta"
            onPress={handleNavigateToSignUp}
            variant="secondary"
            accessibilityLabel="Ir para tela de cadastro"
          />
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
    gap: 24,
  },
  title: {
    textAlign: 'center',
  },
  fieldsGroup: {
    gap: 16,
  },
  messageSpacing: {
    marginTop: -4,
  },
});
