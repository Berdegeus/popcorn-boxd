import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useWatchedMovies, type WatchedMovie } from '@/context/WatchedMoviesContext';
import { useThemeColor } from '@/hooks/use-theme-color';

const TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/w185';

function getReleaseYear(releaseDate?: string) {
  if (!releaseDate) {
    return undefined;
  }

  const [year] = releaseDate.split('-');
  return year && year !== '0' ? year : undefined;
}

function getPosterSource(posterPath?: string | null) {
  if (!posterPath) {
    return undefined;
  }

  return { uri: `${TMDB_POSTER_URL}${posterPath}` };
}

export default function WatchedMoviesScreen() {
  const router = useRouter();
  const { watchedMovies, isLoading, removeWatchedMovie } = useWatchedMovies();

  const cardBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1F2937' }, 'background');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'background');
  const captionColor = useThemeColor({ light: '#4B5563', dark: '#9CA3AF' }, 'icon');
  const removeButtonColor = useThemeColor({ light: '#FEE2E2', dark: '#7F1D1D' }, 'background');
  const removeButtonPressedColor = useThemeColor({ light: '#FCA5A5', dark: '#991B1B' }, 'tint');
  const removeButtonTextColor = useThemeColor({ light: '#7F1D1D', dark: '#FECACA' }, 'tint');
  const activityIndicatorColor = useThemeColor({}, 'tint');

  const sortedMovies = useMemo(() => {
    return [...watchedMovies].sort((a, b) => {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });
  }, [watchedMovies]);

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <ThemedText type="title" style={styles.headerTitle} accessibilityRole="header">
          Seus filmes avaliados
        </ThemedText>
        <ThemedText
          style={[styles.headerSubtitle, { color: captionColor }]}
          accessibilityRole="text"
        >
          Toque em um filme para revisar ou atualizar a sua avaliação.
        </ThemedText>
      </View>
    ),
    [captionColor],
  );

  const handleOpenMovie = useCallback(
    (movie: WatchedMovie) => {
      const params: Record<string, string> = {
        id: String(movie.id),
        title: movie.title,
      };

      if (movie.overview) {
        params.overview = movie.overview;
      }

      if (movie.posterPath) {
        params.posterPath = movie.posterPath;
      }

      if (movie.releaseDate) {
        params.releaseDate = movie.releaseDate;
      }

      if (movie.voteAverage != null) {
        params.voteAverage = String(movie.voteAverage);
      }

      router.push({ pathname: '/movie/[id]', params });
    },
    [router],
  );

  const confirmRemoval = useCallback(
    (movie: WatchedMovie) => {
      Alert.alert(
        'Remover avaliação',
        `Deseja remover ${movie.title} da sua lista de assistidos?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: () => {
              removeWatchedMovie(movie.id);
              void AccessibilityInfo.announceForAccessibility(
                `${movie.title} removido da lista de assistidos.`,
              );
            },
          },
        ],
        { cancelable: true },
      );
    },
    [removeWatchedMovie],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<WatchedMovie>) => {
      const posterSource = getPosterSource(item.posterPath);
      const releaseYear = getReleaseYear(item.releaseDate);
      const updatedAt = new Date(item.savedAt).toLocaleDateString();

      return (
        <View style={styles.itemWrapper}>
          <Pressable
            onPress={() => handleOpenMovie(item)}
            style={({ pressed }) => [
              styles.itemButton,
              { backgroundColor: cardBackgroundColor, opacity: pressed ? 0.94 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Abrir detalhes de ${item.title}`}
            accessibilityHint="Permite atualizar a avaliação deste filme"
          >
            {posterSource ? (
              <Image
                source={posterSource}
                style={styles.poster}
                accessibilityLabel={`Poster do filme ${item.title}`}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View
                style={[styles.posterPlaceholder, { borderColor }]}
                accessibilityRole="image"
                accessibilityLabel={`Poster não disponível para ${item.title}`}
              >
                <ThemedText style={styles.posterPlaceholderText}>Poster indisponível</ThemedText>
              </View>
            )}

            <View style={styles.movieDetails}>
              <ThemedText type="defaultSemiBold" style={styles.movieTitle} numberOfLines={2}>
                {item.title}
              </ThemedText>
              <ThemedText style={styles.movieMeta} accessibilityRole="text">
                Sua avaliação: {item.userRating} de 5
              </ThemedText>
              {releaseYear ? (
                <ThemedText style={styles.movieMeta} accessibilityRole="text">
                  Ano de lançamento: {releaseYear}
                </ThemedText>
              ) : null}
              <ThemedText style={[styles.movieMeta, { color: captionColor }]} accessibilityRole="text">
                Última atualização em {updatedAt}
              </ThemedText>
            </View>
          </Pressable>

          <Pressable
            onPress={() => confirmRemoval(item)}
            style={({ pressed }) => [
              styles.removeButton,
              {
                backgroundColor: pressed ? removeButtonPressedColor : removeButtonColor,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Remover ${item.title} da lista de assistidos`}
            accessibilityHint="Exclui a avaliação salva deste filme"
          >
            <ThemedText style={[styles.removeButtonText, { color: removeButtonTextColor }]}>Remover</ThemedText>
          </Pressable>
        </View>
      );
    },
    [
      borderColor,
      cardBackgroundColor,
      captionColor,
      confirmRemoval,
      handleOpenMovie,
      removeButtonTextColor,
      removeButtonColor,
      removeButtonPressedColor,
    ],
  );

  const keyExtractor = useCallback((item: WatchedMovie) => item.id.toString(), []);
  const renderSeparator = useCallback(() => <View style={styles.listSeparator} />, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={activityIndicatorColor} />
        <ThemedText style={styles.loadingText} accessibilityRole="text">
          Carregando seus filmes avaliados...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sortedMovies}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={sortedMovies.length === 0 ? styles.emptyListContainer : styles.listContent}
        ItemSeparatorComponent={sortedMovies.length > 0 ? renderSeparator : undefined}
        ListHeaderComponent={sortedMovies.length > 0 ? listHeader : null}
        accessibilityRole="list"
        accessibilityLabel="Filmes que você avaliou"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText type="title" style={styles.emptyStateTitle} accessibilityRole="header">
              Nenhuma avaliação por aqui ainda
            </ThemedText>
            <ThemedText style={styles.emptyStateText} accessibilityRole="text">
              Assista a um filme, avalie-o e ele aparecerá nesta lista para que você acompanhe as suas
              notas.
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  emptyListContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  itemWrapper: {
    alignItems: 'flex-start',
  },
  listHeader: {
    marginBottom: 16,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemButton: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    minHeight: 96,
  },
  poster: {
    width: 72,
    height: 108,
    borderRadius: 12,
  },
  posterPlaceholder: {
    width: 72,
    height: 108,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  posterPlaceholderText: {
    fontSize: 11,
    textAlign: 'center',
  },
  movieDetails: {
    flex: 1,
    gap: 4,
  },
  movieTitle: {
    fontSize: 16,
  },
  movieMeta: {
    fontSize: 14,
  },
  listSeparator: {
    height: 16,
  },
  removeButton: {
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    gap: 12,
  },
  emptyStateTitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
