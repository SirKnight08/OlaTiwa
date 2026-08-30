import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { loadThemePreference, saveThemePreference } from '../storage/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

type Colors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primaryDark: string;
  accent: string;
  success: string;
  text: string;
  textMuted: string;
  border: string;
  shadow: string;
  danger: string;
};

type LightColors = Colors;
type DarkColors = Colors;

const lightColors: LightColors = {
  background: '#F7F5F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EAD8',
  primary: '#E66A3D',
  primaryDark: '#C94F24',
  accent: '#F4B942',
  success: '#2E9E73',
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  shadow: '#111827',
  danger: '#DC2626',
};

const darkColors: DarkColors = {
  background: '#111827',
  surface: '#1F2937',
  surfaceAlt: '#374151',
  primary: '#F97316',
  primaryDark: '#FB923C',
  accent: '#FBBF24',
  success: '#34D399',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
  border: '#374151',
  shadow: '#000000',
  danger: '#F87171',
};

export type Theme = {
  mode: ThemeMode;
  colors: Colors;
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    heading: number;
    title: number;
    subtitle: number;
    body: number;
    caption: number;
  };
};

const theme: Theme = {
  mode: 'light',
  colors: lightColors,
  radius: {
    sm: 12,
    md: 18,
    lg: 24,
    xl: 32,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  typography: {
    heading: 28,
    title: 22,
    subtitle: 18,
    body: 16,
    caption: 13,
  },
};

type ThemeContextValue = {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [preferredMode, setPreferredMode] = useState<ThemeMode>('system');

  useEffect(() => {
    loadThemePreference().then((saved) => {
      if (saved && typeof saved === 'string') {
        setPreferredMode(saved as 'light' | 'dark' | 'system');
      }
    });
  }, []);

  const effectiveMode = preferredMode === 'system'
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : preferredMode;

  const themeValue = useMemo<Theme>(() => ({
    ...theme,
    mode: preferredMode,
    colors: effectiveMode === 'dark' ? darkColors : lightColors,
  }), [preferredMode, effectiveMode]);

  const setThemeMode = async (mode: ThemeMode) => {
    setPreferredMode(mode);
    await saveThemePreference(mode);
  };

  const value = useMemo<ThemeContextValue>(() => ({
    theme: themeValue,
    themeMode: preferredMode,
    setThemeMode,
    isDark: effectiveMode === 'dark',
  }), [themeValue, preferredMode, effectiveMode, setThemeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: { ...theme, colors: lightColors },
      themeMode: 'light' as ThemeMode,
      setThemeMode: async () => {},
      isDark: false,
    };
  }
  return context;
}
