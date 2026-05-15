import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEAM' | 'JURY' | 'ORGANIZER';
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
  initialize: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token });
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }
}));

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initialize: () => void;
}

const applyThemeValue = (val: 'light' | 'dark') => {
  if (val === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyThemeValue(isDark ? 'dark' : 'light');
    } else {
      applyThemeValue(theme);
    }
  },
  initialize: () => {
    const saved = localStorage.getItem('theme') as Theme | null;
    const initialTheme = saved || 'system';
    set({ theme: initialTheme });
    
    // Initial apply
    if (initialTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyThemeValue(isDark ? 'dark' : 'light');
    } else {
      applyThemeValue(initialTheme);
    }

    // Listen to system changes if we are on 'system' mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const currentTheme = useThemeStore.getState().theme;
      if (currentTheme === 'system') {
        applyThemeValue(e.matches ? 'dark' : 'light');
      }
    });
  }
}));
