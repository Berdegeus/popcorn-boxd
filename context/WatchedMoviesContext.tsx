import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from './AuthContext';

export interface WatchedMovie {
  id: number;
  title: string;
  posterPath?: string | null;
  overview?: string;
  voteAverage?: number;
  releaseDate?: string;
  userRating: number;
  review?: string;
  savedAt: string;
}

interface WatchedMovieInput {
  id: number;
  title: string;
  posterPath?: string | null;
  overview?: string;
  voteAverage?: number;
  releaseDate?: string;
  userRating: number;
  review?: string;
}

interface WatchedMoviesContextValue {
  watchedMovies: WatchedMovie[];
  isLoading: boolean;
  saveWatchedMovie: (movie: WatchedMovieInput) => void;
  removeWatchedMovie: (id: number) => void;
  getWatchedMovie: (id: number) => WatchedMovie | undefined;
}

const STORAGE_KEY_PREFIX = '@storage/watched';

const WatchedMoviesContext = createContext<WatchedMoviesContextValue | undefined>(undefined);

export function WatchedMoviesProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [watchedMovies, setWatchedMovies] = useState<WatchedMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const storageKey = useMemo(() => {
    if (!user) {
      return null;
    }

    return `${STORAGE_KEY_PREFIX}/${user.id}`;
  }, [user]);

  useEffect(() => {
    let isActive = true;

    const loadWatchedMovies = async () => {
      if (!storageKey) {
        setWatchedMovies([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setWatchedMovies([]);

      try {
        const storedValue = await AsyncStorage.getItem(storageKey);

        if (!isActive) {
          return;
        }

        if (!storedValue) {
          setWatchedMovies([]);
          return;
        }

        const parsed = JSON.parse(storedValue) as WatchedMovie[];

        if (Array.isArray(parsed)) {
          setWatchedMovies(parsed);
        } else {
          setWatchedMovies([]);
        }
      } catch (error) {
        console.error('Falha ao carregar filmes assistidos do armazenamento', error);
        if (isActive) {
          setWatchedMovies([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadWatchedMovies();

    return () => {
      isActive = false;
    };
  }, [storageKey]);

  const persistWatchedMovies = useCallback(
    async (movies: WatchedMovie[]) => {
      if (!storageKey) {
        return;
      }

      try {
        if (movies.length === 0) {
          await AsyncStorage.removeItem(storageKey);
          return;
        }

        await AsyncStorage.setItem(storageKey, JSON.stringify(movies));
      } catch (error) {
        console.error('Falha ao salvar filmes assistidos no armazenamento', error);
      }
    },
    [storageKey],
  );

  const saveWatchedMovie = useCallback(
    (movie: WatchedMovieInput) => {
      if (!storageKey) {
        console.warn('Tentativa de salvar filme assistido sem usuário autenticado.');
        return;
      }

      setWatchedMovies((previous) => {
        const existingIndex = previous.findIndex((item) => item.id === movie.id);
        const timestamp = new Date().toISOString();
        let nextList: WatchedMovie[];

        if (existingIndex >= 0) {
          nextList = previous.map((item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  title: movie.title,
                  posterPath: movie.posterPath,
                  overview: movie.overview,
                  voteAverage: movie.voteAverage,
                  releaseDate: movie.releaseDate,
                  userRating: movie.userRating,
                  review: movie.review,
                  savedAt: timestamp,
                }
              : item,
          );
        } else {
          nextList = [
            ...previous,
            {
              ...movie,
              review: movie.review,
              savedAt: timestamp,
            },
          ];
        }

        void persistWatchedMovies(nextList);
        return nextList;
      });
    },
    [persistWatchedMovies, storageKey],
  );

  const removeWatchedMovie = useCallback(
    (id: number) => {
      if (!storageKey) {
        console.warn('Tentativa de remover filme assistido sem usuário autenticado.');
        return;
      }

      setWatchedMovies((previous) => {
        const nextList = previous.filter((item) => item.id !== id);
        void persistWatchedMovies(nextList);
        return nextList;
      });
    },
    [persistWatchedMovies, storageKey],
  );

  const getWatchedMovie = useCallback(
    (id: number) => watchedMovies.find((movie) => movie.id === id),
    [watchedMovies],
  );

  const value = useMemo(
    () => ({
      watchedMovies,
      isLoading,
      saveWatchedMovie,
      removeWatchedMovie,
      getWatchedMovie,
    }),
    [getWatchedMovie, isLoading, removeWatchedMovie, saveWatchedMovie, watchedMovies],
  );

  return <WatchedMoviesContext.Provider value={value}>{children}</WatchedMoviesContext.Provider>;
}

export function useWatchedMovies() {
  const context = useContext(WatchedMoviesContext);

  if (!context) {
    throw new Error('useWatchedMovies deve ser usado dentro de um WatchedMoviesProvider');
  }

  return context;
}
