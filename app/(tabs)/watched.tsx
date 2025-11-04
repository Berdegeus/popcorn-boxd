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
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useWatchedMovies, type WatchedMovie } from '@/context/WatchedMoviesContext';
import { makeStyles, useAppTheme } from '@/hooks/useAppTheme';

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
  const theme = useAppTheme();
  const styles = useStyles();

  const cardBackgroundColor = theme.colors.surface;
  const borderColor = theme.colors.border;
  const captionColor = theme.colors.textMuted;
  const removeButtonColor = theme.mode === 'dark' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(185, 28, 28, 0.12)';
  const removeButtonPressedColor =
    theme.mode === 'dark' ? 'rgba(248, 113, 113, 0.35)' : 'rgba(185, 28, 28, 0.22)';
  const removeButtonTextColor = theme.colors.danger;
  const activityIndicatorColor = theme.colors.tint;

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
      const params: { id: string; [key: string]: string } = {
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
  const renderSeparator = () => <View style={styles.listSeparator} />;

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

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  emptyListContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  itemWrapper: {
    alignItems: 'flex-start',
  },
  listHeader: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.nano,
  },
  headerTitle: {
    marginBottom: theme.spacing.nano,
  },
  headerSubtitle: {
    ...theme.typography.caption,
  },
  itemButton: {
    flexDirection: 'row',
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
    minHeight: 96,
  },
  poster: {
    width: 72,
    height: 108,
    borderRadius: theme.radii.md,
  },
  posterPlaceholder: {
    width: 72,
    height: 108,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.nano,
  },
  posterPlaceholderText: {
    ...theme.typography.caption,
    textAlign: 'center',
  },
  movieDetails: {
    flex: 1,
    gap: theme.spacing.nano,
  },
  movieTitle: {
    ...theme.typography.heading,
  },
  movieMeta: {
    ...theme.typography.caption,
  },
  listSeparator: {
    height: theme.spacing.sm,
  },
  removeButton: {
    borderRadius: theme.radii.full,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.nano,
  },
  removeButtonText: {
    ...theme.typography.button,
  },
  emptyState: {
    gap: theme.spacing.xs,
  },
  emptyStateTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.nano,
  },
  emptyStateText: {
    ...theme.typography.body,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  loadingText: {
    ...theme.typography.body,
    textAlign: 'center',
  },
}));
