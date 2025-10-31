import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useThemeColor } from '@/hooks/use-theme-color';
import { addStoredUser, findUserByEmail } from '@/storage/auth';
import { createPasswordHash } from '@/utils/password';

export default function SignUpScreen() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'icon');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setErrorMessage('Preencha todos os campos para continuar.');
      return;
    }

    if (!imageUri) {
      setErrorMessage('Selecione uma foto de perfil.');
      return;
    }

    const emailPattern = /\S+@\S+\.\S+/;

    if (!emailPattern.test(normalizedEmail)) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const userExists = await findUserByEmail(normalizedEmail);

      if (userExists) {
        setErrorMessage('Este e-mail já está cadastrado.');
        return;
      }

      await addStoredUser({
        email: normalizedEmail,
        name: trimmedName,
        passwordHash: createPasswordHash(trimmedPassword),
        imageUri,
      });

      Alert.alert('Cadastro concluído', 'Sua conta foi criada com sucesso! Faça login para continuar.');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Failed to create account', error);
      Alert.alert('Erro', 'Não foi possível concluir o cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateToLogin = () => {
    router.replace('/(auth)/login');
  };

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
              <TouchableOpacity
                onPress={handlePickFromLibrary}
                style={styles.photoButton}
                accessibilityRole="button"
                accessibilityLabel="Selecionar foto da galeria"
              >
                <ThemedText style={styles.photoButtonText}>Galeria</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleOpenCamera}
                style={styles.photoButton}
                accessibilityRole="button"
                accessibilityLabel="Tirar foto com a câmera"
              >
                <ThemedText style={styles.photoButtonText}>Câmera</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Nome completo</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor={mutedColor}
              accessibilityLabel="Campo de nome"
              style={styles.input}
              textContentType="name"
            />
          </View>

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
              placeholder="Crie uma senha"
              placeholderTextColor={mutedColor}
              accessibilityLabel="Campo de senha"
              style={styles.input}
              textContentType="newPassword"
            />
          </View>

          {errorMessage ? (
            <ThemedText style={styles.error} accessibilityLiveRegion="polite">
              {errorMessage}
            </ThemedText>
          ) : null}

          <TouchableOpacity
            onPress={handleSignUp}
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            accessibilityRole="button"
            accessibilityLabel="Concluir cadastro"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.primaryButtonText}>Cadastrar</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNavigateToLogin}
            style={styles.secondaryButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela de login"
          >
            <ThemedText style={styles.secondaryButtonText}>Já tenho conta</ThemedText>
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
    gap: 16,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
