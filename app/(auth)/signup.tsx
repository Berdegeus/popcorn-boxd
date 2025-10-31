import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
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

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailInputRef = useRef<TextInput | null>(null);
  const passwordInputRef = useRef<TextInput | null>(null);

  const handlePickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão negada', 'Autorize o acesso à galeria para selecionar uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleOpenCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão negada', 'Autorize o acesso à câmera para tirar uma foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedName || !normalizedEmail || !trimmedPassword) {
      setErrorMessage('Preencha nome, e-mail e senha para concluir seu cadastro.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await signUp({
        email: normalizedEmail,
        name: trimmedName,
        password: trimmedPassword,
        imageUri,
      });

      Alert.alert('Cadastro concluído', 'Sua conta foi criada com sucesso!');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to create account', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        Alert.alert('Erro', 'Não foi possível concluir o cadastro. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToLogin = () => {
    router.replace('/(auth)/login');
  };

  const isSubmitDisabled = useMemo(() => {
    return (
      name.trim().length === 0 || email.trim().length === 0 || password.trim().length === 0 || isSubmitting
    );
  }, [email, isSubmitting, name, password]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoiding}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title} accessibilityRole="header">
            Crie sua conta
          </ThemedText>

          <View style={styles.photoSection}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.avatar}
                accessibilityLabel="Pré-visualização da foto escolhida"
                accessible
              />
            ) : (
              <View
                style={[styles.avatar, styles.avatarPlaceholder]}
                accessibilityLabel="Sem foto selecionada"
                accessible
              >
                <ThemedText style={styles.avatarPlaceholderText}>Foto</ThemedText>
              </View>
            )}

            <View style={styles.photoButtons}>
              <Button
                label="Galeria"
                onPress={handlePickFromLibrary}
                variant="secondary"
                fullWidth={false}
                style={styles.photoButton}
                accessibilityLabel="Selecionar foto da galeria"
              />
              <Button
                label="Câmera"
                onPress={handleOpenCamera}
                variant="secondary"
                fullWidth={false}
                style={styles.photoButton}
                accessibilityLabel="Tirar foto com a câmera"
              />
            </View>
          </View>

          <View style={styles.fieldsGroup}>
            <TextField
              label="Nome completo"
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => {
                emailInputRef.current?.focus?.();
              }}
              blurOnSubmit={false}
            />

            <TextField
              ref={emailInputRef}
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
              placeholder="Crie uma senha"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />
          </View>

          {errorMessage ? (
            <FormMessage message={errorMessage} variant="error" />
          ) : null}

          <Button
            label="Cadastrar"
            onPress={handleSignUp}
            loading={isSubmitting}
            disabled={isSubmitDisabled}
            accessibilityLabel="Concluir cadastro"
          />

          <Button
            label="Já tenho conta"
            onPress={handleNavigateToLogin}
            variant="secondary"
            accessibilityLabel="Voltar para a tela de login"
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
    gap: 24,
  },
  title: {
    textAlign: 'center',
  },
  photoSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontWeight: '600',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
  },
  fieldsGroup: {
    gap: 16,
  },
});
