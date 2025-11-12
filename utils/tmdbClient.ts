import { Platform } from 'react-native';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const DEFAULT_LANGUAGE = 'pt-BR';
const CACHE_TTL_IN_MS = 1000 * 60 * 5; // 5 minutes
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 300;

const cache = new Map<string, { timestamp: number; data: unknown }>();

export type TMDBRequestOptions = {
  params?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
  cacheKey?: string;
};

function buildUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;

  if (!apiKey) {
    throw new Error('Chave da API do TMDb não configurada.');
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('language', DEFAULT_LANGUAGE);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function getCacheKey(url: string, cacheKey?: string) {
  return cacheKey ?? url;
}

function getRetryDelay(attempt: number) {
  const jitter = Math.random() * 100;
  return INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1) + jitter;
}

function setCache(url: string, data: unknown, cacheKey?: string) {
  cache.set(getCacheKey(url, cacheKey), { timestamp: Date.now(), data });
}

function getCache(url: string, cacheKey?: string) {
  const key = getCacheKey(url, cacheKey);
  const cached = cache.get(key);
  if (!cached) {
    return undefined;
  }

  const isExpired = Date.now() - cached.timestamp > CACHE_TTL_IN_MS;
  if (isExpired) {
    cache.delete(key);
    return undefined;
  }

  return cached.data;
}

async function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function attachAbortSignal(controller: AbortController, signal?: AbortSignal) {
  if (!signal) {
    return;
  }

  if (signal.aborted) {
    controller.abort();
    return;
  }

  const onAbort = () => {
    controller.abort();
  };

  signal.addEventListener('abort', onAbort);
  controller.signal.addEventListener('abort', () => {
    signal.removeEventListener('abort', onAbort);
  });
}

async function tmdbFetch<T>(path: string, options: TMDBRequestOptions = {}): Promise<T> {
  const { params, signal, cacheKey } = options;
  const url = buildUrl(path, params);
  const cachedResponse = getCache(url, cacheKey);

  if (cachedResponse) {
    return cachedResponse as T;
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    attachAbortSignal(controller, signal);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const clientError = new Error(`TMDb respondeu com status ${response.status}`);
        // Treat client errors (4xx) as non-retriable — surface immediately
        if (response.status >= 400 && response.status < 500) {
          clientError.name = 'ClientError';
          throw clientError;
        }

        throw clientError;
      }

      const data = (await response.json()) as T;
      setCache(url, data, cacheKey);
      return data;
    } catch (error) {
      if (controller.signal.aborted) {
        const abortError = new Error('A requisição foi cancelada.');
        abortError.name = 'AbortError';
        throw abortError;
      }

      // If this is a non-retriable client error, rethrow immediately without noisy retry logs
      if (error instanceof Error && error.name === 'ClientError') {
        lastError = error;
        // log at debug level to avoid alarming repeated errors
        console.debug('[TMDB] Client error (non-retriable)', { path, attempt, platform: Platform.OS, error });
        throw error;
      }

      lastError = error;
      console.error('[TMDB] Falha na requisição', {
        path,
        attempt,
        platform: Platform.OS,
        error,
      });

      if (attempt < MAX_RETRIES) {
        await delay(getRetryDelay(attempt));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Falha ao comunicar com o TMDb.');
}

export async function searchMovies(term: string, options: TMDBRequestOptions = {}) {
  const data = await tmdbFetch<{ results?: MovieResult[] }>('/search/movie', {
    ...options,
    params: {
      ...options.params,
      include_adult: 'false',
      page: '1',
      query: term,
    },
    cacheKey: options.cacheKey ?? `search:${term.trim().toLowerCase()}`,
  });

  return data.results ?? [];
}

export async function getMovieDetails(id: number, options: TMDBRequestOptions = {}) {
  const data = await tmdbFetch<MovieResult>(`/movie/${id}`, {
    ...options,
    cacheKey: options.cacheKey ?? `movie:${id}`,
  });

  return data;
}

export type MovieResult = {
  id: number;
  title: string;
  release_date?: string;
  vote_average?: number;
  poster_path?: string | null;
  overview?: string;
};

export function getPosterUrl(path: string, size: 'w185' | 'w342' | 'original' = 'w185') {
  if (!path) {
    return undefined;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export function clearTmdbCache() {
  cache.clear();
}

export function getTmdbCacheSize() {
  return cache.size;
}

