import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type UserDisplaySettingsValue = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  fontScale: number;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
};

const DARK_MODE_KEY = 'user-display-dark-mode';
const FONT_SCALE_KEY = 'user-display-font-scale';
const DEFAULT_DARK_MODE = true;
const DEFAULT_FONT_SCALE = 1;
const MIN_FONT_SCALE = 0.9;
const MAX_FONT_SCALE = 1.35;
const FONT_STEP = 0.1;

const UserDisplaySettingsContext = createContext<UserDisplaySettingsValue | undefined>(undefined);

const clampFontScale = (value: number) => Math.max(MIN_FONT_SCALE, Math.min(MAX_FONT_SCALE, value));

const getInitialDarkMode = () => {
  const saved = localStorage.getItem(DARK_MODE_KEY);
  if (saved === 'true') return true;
  if (saved === 'false') return false;
  return DEFAULT_DARK_MODE;
};

const getInitialFontScale = () => {
  const saved = localStorage.getItem(FONT_SCALE_KEY);
  if (!saved) return DEFAULT_FONT_SCALE;

  const parsed = Number(saved);
  if (Number.isNaN(parsed)) return DEFAULT_FONT_SCALE;

  return clampFontScale(parsed);
};

export const UserDisplaySettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
  const [fontScale, setFontScale] = useState(getInitialFontScale);

  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(FONT_SCALE_KEY, String(fontScale));
    document.documentElement.style.setProperty('--user-font-scale', String(fontScale));
  }, [fontScale]);

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleDarkMode: () => setIsDarkMode((current) => !current),
      fontScale,
      increaseFontScale: () => {
        setFontScale((current) => clampFontScale(Number((current + FONT_STEP).toFixed(2))));
      },
      decreaseFontScale: () => {
        setFontScale((current) => clampFontScale(Number((current - FONT_STEP).toFixed(2))));
      },
    }),
    [isDarkMode, fontScale]
  );

  return (
    <UserDisplaySettingsContext.Provider value={value}>
      {children}
    </UserDisplaySettingsContext.Provider>
  );
};

export const useUserDisplaySettings = () => {
  const context = useContext(UserDisplaySettingsContext);

  if (!context) {
    throw new Error('useUserDisplaySettings must be used within UserDisplaySettingsProvider');
  }

  return context;
};
