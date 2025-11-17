import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/context/AuthContext';
import { makeStyles } from '@/hooks/useAppTheme';

export default function EditProfileScreen() {
  const router = useRouter();
  const styles = useStyles();
  const { user, updateProfile } = useAuth();

  const navigateBackToProfile = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  }, [router]);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [imageUri, setImageUri] = useState<string | null>(user?.imageUri ?? null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailInputRef = useRef<TextInput | null>(null);
  const passwordInputRef = useRef<TextInput | null>(null);
  const confirmPasswordInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setImageUri(user.imageUri);
    }
    setPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  }, [user]);

  const requestPermission = useCallback(async (type: 'camera' | 'library') => {
    const permissionResult =
      type === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permissão negada',
        type === 'camera'
          ? 'Autorize o acesso à câmera para tirar uma foto.'
          : 'Autorize o acesso à galeria para selecionar uma foto.',
      );
      return false;
    }

    return true;
  }, []);

  const handlePickFromLibrary = useCallback(async () => {
    const granted = await requestPermission('library');

    if (!granted) {
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
  }, [requestPermission]);

  const handleOpenCamera = useCallback(async () => {
    const granted = await requestPermission('camera');

    if (!granted) {
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
  }, [requestPermission]);

  const handleSaveProfile = useCallback(async () => {
    if (!user) {
      setErrorMessage('Você não está autenticado. Faça login novamente.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await updateProfile({
        name,
        email,
        imageUri,
        password,
        confirmPassword,
      });

      setPassword('');
      setConfirmPassword('');
      setSuccessMessage('Perfil atualizado com sucesso.');
      await AccessibilityInfo.announceForAccessibility(
        'Perfil atualizado com sucesso. Retornando à tela de perfil.',
      );

      setTimeout(() => {
        navigateBackToProfile();
      }, 400);
    } catch (error) {
      console.error('Failed to update profile', error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Não foi possível atualizar seu perfil. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmPassword, email, imageUri, name, navigateBackToProfile, updateProfile, user, password]);

  const isSubmitDisabled = useMemo(() => {
    return (
      name.trim().length === 0 ||
      email.trim().length === 0 ||
      !imageUri ||
      isSubmitting
    );
  }, [email, imageUri, isSubmitting, name]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoiding}
      accessibilityLabel="Tela de edição de perfil"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        accessibilityLabel="Formulário para editar dados do perfil"
        accessibilityHint="Atualize seu nome, e-mail, senha e foto de perfil"
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title} accessibilityRole="header">
            Editar perfil
          </ThemedText>

          <View style={styles.photoSection}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.avatar}
                accessibilityLabel="Foto de perfil selecionada"
                accessibilityRole="image"
              />
            ) : (
              <View
                style={[styles.avatar, styles.avatarPlaceholder]}
                accessible
                accessibilityLabel="Nenhuma foto selecionada"
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
                accessibilityHint="Abre a galeria de fotos para escolher uma imagem quadrada"
              />
              <Button
                label="Câmera"
                onPress={handleOpenCamera}
                variant="secondary"
                fullWidth={false}
                style={styles.photoButton}
                accessibilityLabel="Tirar foto com a câmera"
                accessibilityHint="Abre a câmera para tirar uma foto quadrada"
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
              required
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
              required
            />

            <TextField
              ref={passwordInputRef}
              label="Nova senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Deixe em branco para manter a atual"
              textContentType="newPassword"
              secureTextEntry
              returnKeyType="next"
              onSubmitEditing={() => {
                confirmPasswordInputRef.current?.focus?.();
              }}
              accessibilityHint="Informe uma nova senha caso deseje alterar"
            />

            <TextField
              ref={confirmPasswordInputRef}
              label="Confirmar nova senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repita a nova senha"
              textContentType="newPassword"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSaveProfile}
              accessibilityHint="Repita a nova senha para confirmação"
            />
          </View>

          {successMessage ? (
            <FormMessage message={successMessage} variant="success" />
          ) : null}
          {errorMessage ? <FormMessage message={errorMessage} variant="error" /> : null}

          <Button
            label="Salvar alterações"
            onPress={handleSaveProfile}
            loading={isSubmitting}
            disabled={isSubmitDisabled}
            accessibilityLabel="Salvar as alterações do perfil"
          />

          <Button
            label="Cancelar"
            onPress={navigateBackToProfile}
            variant="secondary"
            accessibilityLabel="Cancelar edição e voltar à tela anterior"
          />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((theme) => ({
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  photoSection: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.surfaceAlt,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    ...theme.typography.bodyStrong,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  photoButton: {
    flex: 1,
  },
  fieldsGroup: {
    gap: theme.spacing.sm,
  },
}));
