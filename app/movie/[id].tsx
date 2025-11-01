import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/context/AuthContext';
import { useWatchedMovies } from '@/context/WatchedMoviesContext';
import { useThemeColor } from '@/hooks/use-theme-color';

const TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/w342';

type MovieDetailsParams = {
  id?: string | string[];
  title?: string | string[];
  releaseDate?: string | string[];
  voteAverage?: string | string[];
  posterPath?: string | string[];
  overview?: string | string[];
};

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function getReleaseYear(releaseDate?: string) {
  if (!releaseDate) {
    return undefined;
  }

  const [year] = releaseDate.split('-');
  return year && year !== '0' ? year : undefined;
}

export default function MovieDetailsScreen() {
  const params = useLocalSearchParams<MovieDetailsParams>();
  const { getWatchedMovie, saveWatchedMovie } = useWatchedMovies();
  const { user } = useAuth();
  const router = useRouter();
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const posterBorderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'background');
  const starSelectedColor = useThemeColor({ light: '#F97316', dark: '#F59E0B' }, 'tint');
  const starUnselectedColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'icon');
  const buttonBackgroundColor = useThemeColor({ light: '#0A7EA4', dark: '#1D9BF0' }, 'tint');
  const buttonDisabledColor = useThemeColor({ light: '#9CA3AF', dark: '#4B5563' }, 'icon');
  const captionColor = useThemeColor({ light: '#4B5563', dark: '#9CA3AF' }, 'icon');

  const idParam = getParamValue(params.id);
  const movieId = useMemo(() => {
    const parsed = Number(idParam);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [idParam]);

  const title = getParamValue(params.title);
  const overview = getParamValue(params.overview);
  const releaseDate = getParamValue(params.releaseDate) || undefined;
  const voteAverageParam = getParamValue(params.voteAverage);
  const posterPath = getParamValue(params.posterPath) || undefined;

  const voteAverage = useMemo(() => {
    if (!voteAverageParam) {
      return undefined;
    }

    const parsed = Number(voteAverageParam);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [voteAverageParam]);

  const savedMovie = useMemo(() => {
    if (movieId == null) {
      return undefined;
    }

    return getWatchedMovie(movieId);
  }, [getWatchedMovie, movieId]);

  useEffect(() => {
    if (savedMovie) {
      setUserRating(savedMovie.userRating);
      setReviewText(savedMovie.review ?? '');
    }
  }, [savedMovie]);

  const handleSelectRating = useCallback((value: number) => {
    setUserRating(value);
    setSaveStatus(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!user) {
      const msg = 'Você precisa entrar para salvar avaliações.';
      setSaveStatus({ type: 'error', message: msg });
      void AccessibilityInfo.announceForAccessibility(msg);
      return;
    }
    if (!movieId) {
      Alert.alert('Não foi possível salvar', 'Identificador do filme inválido.');
      return;
    }

    if (userRating === 0) {
      Alert.alert('Defina uma avaliação', 'Selecione pelo menos uma estrela antes de salvar.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus(null);
      saveWatchedMovie({
        id: movieId,
        title,
        posterPath,
        overview,
        voteAverage,
        releaseDate,
        userRating,
        review: reviewText?.trim() || undefined,
      });
      const successMessage = savedMovie
        ? 'Avaliação atualizada com sucesso.'
        : 'Filme salvo na lista de assistidos.';
      setSaveStatus({ type: 'success', message: successMessage });
      void AccessibilityInfo.announceForAccessibility(successMessage);
    } catch (error) {
      console.error('Falha ao salvar filme assistido', error);
      Alert.alert('Erro ao salvar', 'Não foi possível salvar o filme nos assistidos.');
      setSaveStatus({ type: 'error', message: 'Não foi possível salvar o filme. Tente novamente.' });
    } finally {
      setIsSaving(false);
    }
  }, [movieId, overview, releaseDate, saveWatchedMovie, title, userRating, voteAverage, posterPath, savedMovie]);

  const releaseYear = useMemo(() => getReleaseYear(releaseDate), [releaseDate]);

  const ratingLabel = useMemo(() => {
    if (!voteAverage) {
      return 'Avaliação média indisponível';
    }

    return `Avaliação média: ${voteAverage.toFixed(1)} de 10`;
  }, [voteAverage]);

  const userRatingDescription = useMemo(() => {
    if (userRating === 0) {
      return 'Toque em uma estrela para avaliar este filme de 1 a 5.';
    }

    return `Sua avaliação atual é ${userRating} de 5.`;
  }, [userRating]);

  const posterSource = useMemo(() => {
    if (!posterPath) {
      return undefined;
    }

    return { uri: `${TMDB_POSTER_URL}${posterPath}` };
  }, [posterPath]);

  if (!movieId || !title) {
    return (
      <ThemedView style={styles.fallbackContainer}>
        <Stack.Screen options={{ title: 'Detalhes do filme' }} />
        <ThemedText style={styles.fallbackText} accessibilityRole="text">
          Não foi possível carregar os detalhes do filme.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title }} />
      <ScrollView contentContainerStyle={styles.scrollContent} accessibilityLabel={`Detalhes do filme ${title}`}>
        <View style={styles.posterContainer}>
          {posterSource ? (
            <Image
              source={posterSource}
              style={styles.poster}
              accessibilityLabel={`Poster do filme ${title}`}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View
              style={[styles.posterPlaceholder, { borderColor: posterBorderColor }]}
              accessibilityRole="image"
              accessibilityLabel={`Poster não disponível para ${title}`}
            >
              <ThemedText style={styles.posterPlaceholderText}>Poster indisponível</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.detailsSection}>
          <ThemedText type="title" style={styles.title} accessibilityRole="header">
            {title}
          </ThemedText>
          <ThemedText style={styles.metaText} accessibilityRole="text">
            {releaseYear ? `Ano de lançamento: ${releaseYear}` : 'Ano de lançamento indisponível'}
          </ThemedText>
          <ThemedText style={styles.metaText} accessibilityRole="text">
            {ratingLabel}
          </ThemedText>
        </View>

        <View style={styles.synopsisSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle} accessibilityRole="header">
            Sinopse
          </ThemedText>
          <ThemedText style={styles.synopsisText} accessibilityRole="text">
            {overview ? overview : 'Sinopse não disponível para este título.'}
          </ThemedText>
        </View>

        <View style={styles.ratingSection}>
          <ThemedText
            type="defaultSemiBold"
            style={styles.sectionTitle}
            accessibilityRole="header"
            accessibilityLabel="Avalie este filme"
          >
            Sua avaliação
          </ThemedText>
          <ThemedText style={[styles.ratingHelperText, { color: captionColor }]} accessibilityRole="text">
            {userRatingDescription}
          </ThemedText>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => {
              const isSelected = userRating >= value;
              return (
                <Pressable
                  key={value}
                  onPress={() => handleSelectRating(value)}
                  style={styles.starButton}
                  accessibilityRole="button"
                  accessibilityLabel={`${value} ${value === 1 ? 'estrela' : 'estrelas'}`}
                  accessibilityHint="Toque para definir sua avaliação para este filme"
                  accessibilityState={{ selected: isSelected }}
                >
                  <ThemedText
                    style={[
                      styles.starText,
                      { color: isSelected ? starSelectedColor : starUnselectedColor },
                    ]}
                  >
                    {isSelected ? '★' : '☆'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Text review input */}
          <TextField
            label="Escreva sua avaliação (opcional)"
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Compartilhe sua opinião sobre o filme"
            multiline
            numberOfLines={4}
            containerStyle={styles.reviewField}
            accessibilityHint="Campo opcional para escrever uma avaliação em texto"
          />
        </View>

        {/* Show login button when not authenticated */}
        {!user ? (
          <Button
            label="Entrar para salvar"
            onPress={() => router.push('/(auth)/login')}
            variant="secondary"
            accessibilityLabel="Entrar para salvar avaliações"
            accessibilityHint="Abre a tela de login para que você possa salvar avaliações"
          />
        ) : null}

        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: isSaving ? buttonDisabledColor : buttonBackgroundColor,
              opacity: pressed || isSaving ? 0.8 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Salvar filme na lista de assistidos"
          accessibilityHint="Guarda a sua avaliação para que você consulte mais tarde"
          accessibilityState={{ busy: isSaving }}
        >
          <ThemedText style={styles.saveButtonText}>
            {savedMovie ? 'Atualizar avaliação' : 'Salvar em assistidos'}
          </ThemedText>
        </Pressable>

        {saveStatus ? (
          <FormMessage
            message={saveStatus.message}
            variant={saveStatus.type}
            style={styles.saveStatus}
          />
        ) : null}

        {savedMovie ? (
          <ThemedText style={[styles.savedInfoText, { color: captionColor }]} accessibilityRole="text">
            Última atualização em {new Date(savedMovie.savedAt).toLocaleDateString()} com nota {savedMovie.userRating}.
          </ThemedText>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  posterContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
  poster: {
    width: 220,
    height: 330,
    borderRadius: 16,
  },
  posterPlaceholder: {
    width: 220,
    height: 330,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  posterPlaceholderText: {
    textAlign: 'center',
    fontSize: 16,
  },
  detailsSection: {
    gap: 4,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 16,
  },
  synopsisSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  synopsisText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingHelperText: {
    fontSize: 14,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  starButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
    minHeight: 88,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  starText: {
    fontSize: 48,
    lineHeight: 56,
  },
  reviewField: {
    marginTop: 12,
    marginBottom: 8,
  },
  saveButton: {
    borderRadius: 999,
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveStatus: {
    marginBottom: 16,
  },
  savedInfoText: {
    fontSize: 14,
    textAlign: 'center',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  fallbackText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
