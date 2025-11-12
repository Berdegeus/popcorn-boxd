import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  FlatList,
  Pressable,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextField } from '@/components/ui/text-field';
import { makeStyles, useAppTheme } from '@/hooks/useAppTheme';
import { MovieResult, getMovieDetails, getPosterUrl, searchMovies } from '@/utils/tmdbClient';
const DEBOUNCE_IN_MS = 500;

const TRENDING_MOVIE_IDS: number[] = [76341, 40096, 496243, 129, 120467];

export default function MovieSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieResult[]>([]);
  const [suggestions, setSuggestions] = useState<MovieResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [failedPosterIds, setFailedPosterIds] = useState<Record<number, boolean>>({});
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;
  const theme = useAppTheme();
  const styles = useStyles();

  const inputBorderColor = theme.colors.inputBorder;
  const cardBackgroundColor = theme.colors.surfaceAlt;
  const buttonBackgroundColor = theme.colors.primary;
  const errorColor = theme.colors.danger;

  const announceForAccessibility = useCallback(async (message: string) => {
    try {
      await AccessibilityInfo.announceForAccessibility(message);
    } catch (announceError) {
      console.debug('Falha ao anunciar para acessibilidade', announceError);
    }
  }, []);

  const handlePosterError = useCallback((movieId: number) => {
    setFailedPosterIds((prev) => ({ ...prev, [movieId]: true }));
  }, []);

  const handleMovieDetails = useCallback(
    (movie: MovieResult) => {
      router.push({
        pathname: '/movie/[id]',
        params: {
          id: movie.id.toString(),
          title: movie.title,
          releaseDate: movie.release_date ?? '',
          voteAverage:
            typeof movie.vote_average === 'number' && Number.isFinite(movie.vote_average)
              ? movie.vote_average.toString()
              : '',
          posterPath: movie.poster_path ?? '',
          overview: movie.overview ?? '',
        },
      });
    },
    [router],
  );

  const handleSearch = useCallback(
    async (term: string) => {
      const trimmedQuery = term.trim();

      if (!trimmedQuery) {
        abortControllerRef.current?.abort();
        setResults([]);
        setError(null);
        setIsLoading(false);
        void announceForAccessibility('Exibindo filmes em destaque.');
        return;
      }

      if (!apiKey) {
        const missingKeyMessage =
          'Chave da API do TMDb não configurada. Adicione EXPO_PUBLIC_TMDB_API_KEY no arquivo .env.';
        setError(missingKeyMessage);
        setResults([]);
        setIsLoading(false);
        void announceForAccessibility(`Erro: ${missingKeyMessage}`);
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setError(null);
      void announceForAccessibility('Buscando filmes...');

      try {
        const nextResults = await searchMovies(trimmedQuery, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setResults(nextResults);
        setFailedPosterIds({});

        if (nextResults.length === 0) {
          void announceForAccessibility('Nenhum filme encontrado.');
        } else {
          void announceForAccessibility(`Encontrados ${nextResults.length} filmes.`);
        }
      } catch (searchError) {
        if ((searchError as Error).name === 'AbortError') {
          return;
        }

        const errorMessage =
          searchError instanceof Error
            ? searchError.message
            : 'Ocorreu um erro inesperado ao buscar filmes.';
        setError(errorMessage);
        setResults([]);
        void announceForAccessibility(`Erro: ${errorMessage}`);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [announceForAccessibility, apiKey],
  );

  useEffect(() => {
    let active = true;

    const loadTrending = async () => {
      try {
        const details = await Promise.all(
          TRENDING_MOVIE_IDS.map(async (id) => {
            try {
              const movie = await getMovieDetails(id);
              return movie as MovieResult;
            } catch (e) {
              console.warn('Failed to load trending movie', id, e);
              return undefined;
            }
          }),
        );

        if (!active) return;

        const filtered = details.filter((m): m is MovieResult => Boolean(m));
        setSuggestions(filtered);
        if (filtered.length > 0) {
          void announceForAccessibility('Filmes em destaque carregados. Explore as sugestões disponíveis.');
        }
      } catch (e) {
        console.error('Failed to load trending movies', e);
      }
    };

    void loadTrending();

    return () => {
      active = false;
    };
  }, [announceForAccessibility]);

  useEffect(() => {
    const handler = setTimeout(() => {
      void handleSearch(query);
    }, DEBOUNCE_IN_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [handleSearch, query]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const renderMovieItem = useCallback(
    ({ item }: { item: MovieResult }) => {
      const releaseYear = getReleaseYear(item.release_date);
      const rating = typeof item.vote_average === 'number' ? item.vote_average.toFixed(1) : '—';
      const posterUri = item.poster_path ? getPosterUrl(item.poster_path) : undefined;
      const shouldShowPlaceholder = !posterUri || failedPosterIds[item.id];

      return (
        <ThemedView
          style={[styles.card, { backgroundColor: cardBackgroundColor }]}
          accessible
          accessibilityLabel={`${item.title}. Ano: ${releaseYear ?? 'indisponível'}. Avaliação média: ${rating}`}
        >
          {!shouldShowPlaceholder ? (
            <Image
              source={{ uri: posterUri }}
              style={styles.poster}
              accessibilityIgnoresInvertColors
              accessibilityLabel={`Poster do filme ${item.title}`}
              onError={() => handlePosterError(item.id)}
            />
          ) : (
            <View
              style={[styles.posterPlaceholder, { borderColor: inputBorderColor }]}
              accessibilityRole="image"
              accessibilityLabel={`Poster não disponível para ${item.title}. Exibindo ilustração genérica.`}
            >
              <ThemedText style={styles.posterPlaceholderText}>Sem poster</ThemedText>
            </View>
          )}
          <View style={styles.cardContent}>
            <ThemedText type="defaultSemiBold" style={styles.movieTitle} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <ThemedText style={styles.movieMeta}>
              {releaseYear ? `Ano: ${releaseYear}` : 'Ano indisponível'}
            </ThemedText>
            <ThemedText style={styles.movieMeta}>Avaliação: {rating}</ThemedText>
            <Pressable
              onPress={() => handleMovieDetails(item)}
              style={[styles.cardButton, { backgroundColor: buttonBackgroundColor }]}
              accessibilityRole="button"
              accessibilityLabel={`Ver detalhes de ${item.title}`}
            >
              <ThemedText style={styles.cardButtonText}>Ver detalhes</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      );
    },
    [
      buttonBackgroundColor,
      cardBackgroundColor,
      failedPosterIds,
      handleMovieDetails,
      handlePosterError,
      inputBorderColor,
      styles,
    ],
  );

  const keyExtractor = useCallback((item: MovieResult) => item.id.toString(), []);

  const trimmedQuery = query.trim();
  const isShowingSuggestions = trimmedQuery.length === 0;

  const listHeader = useMemo(
    () => (
      <View style={styles.headerContainer}>
        <ThemedText type="title" style={styles.headerTitle}>
          Buscar filmes
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Pesquise por títulos, visualize detalhes e salve suas avaliações pessoais.
        </ThemedText>
        {isShowingSuggestions ? (
          <ThemedText style={styles.highlightSubtitle} accessibilityRole="text">
            Destaques do momento selecionados para você explorar.
          </ThemedText>
        ) : null}
      </View>
    ),
    [isShowingSuggestions, styles],
  );

  const emptyState = useMemo(() => {
    if (isShowingSuggestions) {
      if (suggestions.length === 0) {
        return (
          <ThemedText style={styles.emptyStateText} accessibilityRole="text">
            Não há sugestões disponíveis no momento. Tente buscar por um título específico.
          </ThemedText>
        );
      }

      return null;
    }

    if (isLoading || error) {
      return null;
    }

    return (
      <ThemedText style={styles.emptyStateText} accessibilityRole="text">
        Não encontramos filmes com esse nome. Tente outra busca.
      </ThemedText>
    );
  }, [error, isLoading, isShowingSuggestions, styles.emptyStateText, suggestions.length]);

  const listData = useMemo(
    () => (isShowingSuggestions ? suggestions : results),
    [isShowingSuggestions, results, suggestions],
  );

  useEffect(() => {
    const posterUrls = listData
      .map((movie) => (movie.poster_path ? getPosterUrl(movie.poster_path) : undefined))
      .filter((url): url is string => Boolean(url));

    if (posterUrls.length === 0) {
      return;
    }

    const prefetch = async () => {
      await Promise.allSettled(posterUrls.map((url) => Image.prefetch(url)));
    };

    void prefetch();
  }, [listData]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextField
          label="Buscar por título"
          value={query}
          onChangeText={setQuery}
          placeholder="Digite o nome do filme"
          returnKeyType="search"
          accessibilityHint="Digite pelo menos três letras para iniciar a busca"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {isLoading ? (
        <View style={styles.statusContainer}>
          <ActivityIndicator
            size="large"
            color={buttonBackgroundColor}
            accessibilityLabel="Carregando resultados de filmes"
          />
          <ThemedText style={styles.statusText}>Buscando filmes...</ThemedText>
        </View>
      ) : null}

      {error ? (
        <View style={styles.statusContainer} accessibilityRole="alert">
          <ThemedText style={[styles.statusText, { color: errorColor, textAlign: 'center' }]}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderMovieItem}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyState}
        keyboardShouldPersistTaps="handled"
        accessibilityRole="list"
        accessibilityLabel={
          isShowingSuggestions ? 'Sugestões de filmes em destaque' : 'Resultados da busca de filmes'
        }
      />
    </ThemedView>
  );
}

const Separator = () => {
  const styles = useStyles();
  return <View style={styles.separator} />;
};

function getReleaseYear(releaseDate?: string) {
  if (!releaseDate) {
    return undefined;
  }

  const [year] = releaseDate.split('-');
  return year && year !== '0' ? year : undefined;
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  searchContainer: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusText: {
    ...theme.typography.body,
    marginTop: theme.spacing.xxs,
  },
  listContent: {
    paddingBottom: theme.spacing.xxl + theme.spacing.md,
  },
  headerContainer: {
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.quark,
  },
  headerTitle: {
    marginBottom: theme.spacing.nano,
  },
  headerSubtitle: {
    ...theme.typography.body,
  },
  highlightSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xxs,
  },
  emptyStateText: {
    ...theme.typography.body,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    color: theme.colors.textSecondary,
  },
  card: {
    flexDirection: 'row',
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    padding: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
    marginLeft: theme.spacing.xs,
    gap: theme.spacing.nano,
  },
  cardButton: {
    marginTop: theme.spacing.xs,
    borderRadius: theme.radii.full,
    paddingVertical: theme.spacing.xxs,
    alignItems: 'center',
  },
  cardButtonText: {
    ...theme.typography.button,
    color: theme.colors.primaryOn,
  },
  movieTitle: {
    ...theme.typography.heading,
  },
  movieMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  poster: {
    width: 96,
    height: 144,
    borderRadius: theme.radii.md,
  },
  posterPlaceholder: {
    width: 96,
    height: 144,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.nano,
  },
  posterPlaceholderText: {
    ...theme.typography.caption,
    textAlign: 'center',
  },
  separator: {
    height: theme.spacing.sm,
  },
}));
