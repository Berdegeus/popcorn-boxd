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

interface WatchedMovie {
  id: number;
  title: string;
  posterPath?: string | null;
  overview?: string;
  voteAverage?: number;
  releaseDate?: string;
  userRating: number;
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
}

interface WatchedMoviesContextValue {
  watchedMovies: WatchedMovie[];
  saveWatchedMovie: (movie: WatchedMovieInput) => void;
  getWatchedMovie: (id: number) => WatchedMovie | undefined;
}

const STORAGE_KEY = '@popcorn-boxd/watched-movies';

const WatchedMoviesContext = createContext<WatchedMoviesContextValue | undefined>(undefined);

export function WatchedMoviesProvider({ children }: PropsWithChildren) {
  const [watchedMovies, setWatchedMovies] = useState<WatchedMovie[]>([]);

  useEffect(() => {
    const loadWatchedMovies = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (!storedValue) {
          return;
        }

        const parsed = JSON.parse(storedValue) as WatchedMovie[];
        if (Array.isArray(parsed)) {
          setWatchedMovies(parsed);
        }
      } catch (error) {
        console.error('Falha ao carregar filmes assistidos do armazenamento', error);
      }
    };

    void loadWatchedMovies();
  }, []);

  const persistWatchedMovies = useCallback(async (movies: WatchedMovie[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
    } catch (error) {
      console.error('Falha ao salvar filmes assistidos no armazenamento', error);
    }
  }, []);

  const saveWatchedMovie = useCallback(
    (movie: WatchedMovieInput) => {
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
                  savedAt: timestamp,
                }
              : item,
          );
        } else {
          nextList = [
            ...previous,
            {
              ...movie,
              savedAt: timestamp,
            },
          ];
        }
        void persistWatchedMovies(nextList);
        return nextList;
      });
    },
    [persistWatchedMovies],
  );

  const getWatchedMovie = useCallback(
    (id: number) => watchedMovies.find((movie) => movie.id === id),
    [watchedMovies],
  );

  const value = useMemo(
    () => ({
      watchedMovies,
      saveWatchedMovie,
      getWatchedMovie,
    }),
    [getWatchedMovie, saveWatchedMovie, watchedMovies],
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
