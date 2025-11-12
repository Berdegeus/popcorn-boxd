import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
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

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [imageUri, setImageUri] = useState<string | null>(user?.imageUri ?? null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setImageUri(user.imageUri);
    }
  }, [user]);

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

  const handleSaveProfile = async () => {
    if (!user) {
      setErrorMessage('Você não está autenticado. Faça login novamente.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await updateProfile({
        name,
        email,
        imageUri,
      });

      Alert.alert('Perfil atualizado', 'Suas informações foram salvas com sucesso.');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    } catch (error) {
      console.error('Failed to update profile', error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar seu perfil. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
              returnKeyType="done"
              onSubmitEditing={handleSaveProfile}
            />
          </View>

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
            onPress={() => router.back()}
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
    width: 140,
    height: 140,
    borderRadius: 70,
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
