import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export type MovieResult = {
  id: number;
  title: string;
  release_date?: string;
  vote_average?: number;
  poster_path?: string | null;
  overview?: string;
};

type SearchResponse = {
  results?: MovieResult[];
};

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const DEBOUNCE_IN_MS = 500;

const TRENDING_MOVIES: MovieResult[] = [
  {
    id: 718821,
    title: 'Rivais',
    release_date: '2024-04-18',
    vote_average: 7.3,
    poster_path: '/nMQ0C7mUyfm2z9TiSKmCM4vSFnu.jpg',
    overview:
      'Um triângulo amoroso entre um casal e um antigo amigo muda o rumo de suas vidas dentro e fora das quadras de tênis.',
  },
  {
    id: 653346,
    title: 'O Homem do Norte',
    release_date: '2022-04-07',
    vote_average: 7.1,
    poster_path: '/zhLKlUaF1SEpO58ppHIAyENkwgw.jpg',
    overview:
      'Um príncipe nórdico busca vingança pela morte do pai em uma jornada repleta de visões, batalhas e confrontos sangrentos.',
  },
  {
    id: 914460,
    title: 'Rebel Moon - Parte 2: A Marcadora de Cicatrizes',
    release_date: '2024-04-19',
    vote_average: 6,
    poster_path: '/oj5E7WDN3B9qbeQLfkc1C01N4Po.jpg',
    overview:
      'Os heróis de Veldt se preparam para enfrentar o Império quando forças sombrias ameaçam destruir a nova esperança do universo.',
  },
  {
    id: 1072790,
    title: 'Imaculada',
    release_date: '2024-03-20',
    vote_average: 6.5,
    poster_path: '/4FkFGDLkzs0tVK0g0eGfzbw05af.jpg',
    overview:
      'Uma jovem freira se muda para um remoto convento italiano e descobre que milagres podem esconder um terror inimaginável.',
  },
  {
    id: 787699,
    title: 'Wonka',
    release_date: '2023-12-06',
    vote_average: 7.2,
    poster_path: '/edY0LnkYZf1tu1pGIQR2g00grIE.jpg',
    overview:
      'A origem do excêntrico chocolatier Willy Wonka, um sonhador que planeja abrir a fábrica mais extraordinária do mundo.',
  },
  {
    id: 804717,
    title: 'A Queda de Lenora',
    release_date: '2024-04-11',
    vote_average: 6.4,
    poster_path: '/7Ixhb6rhdT7nprbHXM9KW0n8Y5m.jpg',
    overview:
      'Uma detetive obstinada investiga uma série de crimes em uma cidade costeira onde nada é o que parece.',
  },
];

export default function MovieSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieResult[]>([]);
  const [suggestions, setSuggestions] = useState<MovieResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchInputId = useMemo(() => 'movie-search-input', []);
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  const inputBorderColor = useThemeColor({ light: '#D1D5DB', dark: '#3F3F46' }, 'icon');
  const placeholderColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'icon');
  const cardBackgroundColor = useThemeColor({ light: '#F9FAFB', dark: '#1F2937' }, 'background');
  const buttonBackgroundColor = useThemeColor({ light: '#0A7EA4', dark: '#1D9BF0' }, 'tint');

  const announceForAccessibility = useCallback(async (message: string) => {
    try {
      await AccessibilityInfo.announceForAccessibility(message);
    } catch (announceError) {
      console.debug('Falha ao anunciar para acessibilidade', announceError);
    }
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
        const url = `https://api.themoviedb.org/3/search/movie?include_adult=false&language=pt-BR&page=1&query=${encodeURIComponent(
          trimmedQuery,
        )}&api_key=${apiKey}`;
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Não foi possível obter resultados no momento.');
        }

        const data = (await response.json()) as SearchResponse;
        const nextResults = data.results ?? [];

        if (controller.signal.aborted) {
          return;
        }

        setResults(nextResults);

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
    setSuggestions(TRENDING_MOVIES);
    if (TRENDING_MOVIES.length > 0) {
      void announceForAccessibility('Filmes em destaque carregados. Explore as sugestões disponíveis.');
    }
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
      const posterSource = item.poster_path
        ? { uri: `${TMDB_IMAGE_BASE_URL}${item.poster_path}` }
        : null;

      return (
        <ThemedView
          style={[styles.card, { backgroundColor: cardBackgroundColor }]}
          accessible
          accessibilityLabel={`${item.title}. Ano: ${releaseYear ?? 'indisponível'}. Avaliação média: ${rating}`}
        >
          {posterSource ? (
            <Image
              source={posterSource}
              style={styles.poster}
              accessibilityIgnoresInvertColors
              accessibilityLabel={`Poster do filme ${item.title}`}
            />
          ) : (
            <View
              style={[styles.posterPlaceholder, { borderColor: inputBorderColor }]}
              accessibilityRole="image"
              accessibilityLabel={`Poster não disponível para ${item.title}`}
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
    [buttonBackgroundColor, cardBackgroundColor, handleMovieDetails, inputBorderColor],
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
    [isShowingSuggestions],
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
  }, [error, isLoading, isShowingSuggestions, suggestions.length]);

  const listData = isShowingSuggestions ? suggestions : results;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchContainer}>
        <ThemedText nativeID={searchInputId} style={styles.label}>
          Buscar por título
        </ThemedText>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Digite o nome do filme"
          returnKeyType="search"
          accessibilityLabel="Campo de busca de filmes"
          accessibilityHint="Digite pelo menos três letras para iniciar a busca"
          accessibilityLabelledBy={searchInputId}
          style={[styles.input, { borderColor: inputBorderColor }]}
          placeholderTextColor={placeholderColor}
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
          <ThemedText style={styles.errorText}>{error}</ThemedText>
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

const Separator = () => <View style={styles.separator} />;

function getReleaseYear(releaseDate?: string) {
  if (!releaseDate) {
    return undefined;
  }

  const [year] = releaseDate.split('-');
  return year && year !== '0' ? year : undefined;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    marginTop: 8,
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 48,
  },
  headerContainer: {
    marginBottom: 12,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  highlightSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 24,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 12,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardButton: {
    marginTop: 12,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  movieTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  movieMeta: {
    fontSize: 14,
    marginBottom: 2,
  },
  poster: {
    width: 96,
    height: 144,
    borderRadius: 12,
  },
  posterPlaceholder: {
    width: 96,
    height: 144,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholderText: {
    fontSize: 12,
    textAlign: 'center',
  },
  separator: {
    height: 16,
  },
});
