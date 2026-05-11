import { useState, useEffect } from 'react';

const THEME_KEY = 'ai-toolkit-theme';

export type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() =>
    (localStorage.getItem(THEME_KEY) as Theme) ?? 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.classList.add('light');
    else root.classList.remove('light');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggle = () => setThemeState(t => t === 'dark' ? 'light' : 'dark');

  return { theme, toggle };
}
