import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_PREFERENCE_KEY = 'olatiwa-theme-preference';

export async function loadThemePreference(): Promise<'light' | 'dark' | 'system'> {
  try {
    const value = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export async function saveThemePreference(mode: 'light' | 'dark' | 'system'): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, mode);
  } catch {
    // ignore
  }
}
