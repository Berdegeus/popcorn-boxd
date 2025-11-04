import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Theme, ThemeMode } from '@/constants/theme';
import { themes } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type DesignSystemContextValue = {
  colorScheme: ThemeMode;
  theme: Theme;
  setColorScheme: (mode: ThemeMode) => void;
  toggleColorScheme: () => void;
};

const DesignSystemContext = createContext<DesignSystemContextValue | undefined>(undefined);

type DesignSystemProviderProps = {
  children: ReactNode;
  initialMode?: ThemeMode;
};

export function DesignSystemProvider({ children, initialMode }: DesignSystemProviderProps) {
  const systemScheme = useColorScheme();
  const systemMode = systemScheme === 'dark' ? 'dark' : 'light';

  const [mode, setMode] = useState<ThemeMode>(initialMode ?? systemMode);

  useEffect(() => {
    if (initialMode) {
      return;
    }

    setMode(systemMode);
  }, [initialMode, systemMode]);

  const toggleColorScheme = useCallback(() => {
    setMode((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<DesignSystemContextValue>(
    () => ({
      colorScheme: mode,
      theme: themes[mode],
      setColorScheme: setMode,
      toggleColorScheme,
    }),
    [mode, toggleColorScheme],
  );

  return <DesignSystemContext.Provider value={value}>{children}</DesignSystemContext.Provider>;
}

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);

  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }

  return context;
}
