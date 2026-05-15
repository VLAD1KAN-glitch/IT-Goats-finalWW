import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store';
import { useI18nStore } from '../store/i18nStore';
import { LogOut, User, Trophy, LayoutDashboard, Sun, Moon, Laptop, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Translate } from './Translate';
import { Confetti } from './Confetti';

function LangSwitcher() {
  const { lang, setLang } = useI18nStore();
  return (
    <div className="flex bg-[var(--color-m3-surface-variant)] rounded-full p-1 border border-[var(--color-m3-outline-variant)]">
      {(['en', 'uk'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`relative px-2 py-1 rounded-full text-xs font-bold uppercase transition-colors ${lang === l ? 'text-[var(--color-m3-on-primary-container)]' : 'text-[var(--color-m3-on-surface-variant)] hover:text-[var(--color-m3-on-surface)]'}`}
        >
          {lang === l && (
            <motion.div
              layoutId="lang-active"
              className="absolute inset-0 bg-[var(--color-m3-primary-container)] rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 block">{l}</span>
        </button>
      ))}
    </div>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();
  
  return (
    <div className="flex bg-[var(--color-m3-surface-variant)] rounded-full p-1 border border-[var(--color-m3-outline-variant)]">
      {(['light', 'system', 'dark'] as const).map(t => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`relative p-1.5 rounded-full transition-colors ${theme === t ? 'text-[var(--color-m3-on-primary-container)]' : 'text-[var(--color-m3-on-surface-variant)] hover:text-[var(--color-m3-on-surface)]'}`}
        >
          {theme === t && (
            <motion.div
              layoutId="theme-active"
              className="absolute inset-0 bg-[var(--color-m3-primary-container)] rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 block">
            {t === 'light' && <Sun className="w-4 h-4" />}
            {t === 'system' && <Laptop className="w-4 h-4" />}
            {t === 'dark' && <Moon className="w-4 h-4" />}
          </span>
        </button>
      ))}
    </div>
  );
}

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[var(--color-m3-bg)]">
      <Confetti />
      <header className={`h-16 flex items-center justify-between px-6 text-[var(--color-m3-on-surface)] z-40 sticky top-0 transition-all duration-300 ${scrolled ? 'bg-[var(--color-m3-surface)]/70 backdrop-blur-xl m3-elevation-2' : 'bg-[var(--color-m3-surface)] border-b border-transparent'}`}>
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2 text-[var(--color-m3-primary)] font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
            <Trophy className="w-6 h-6" />
            <Translate i18nKey="app_name" />
          </Link>
        </div>
        
        <nav className="flex items-center space-x-4">
          <LangSwitcher />
          <ThemeSwitcher />
          
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center space-x-2 text-sm font-medium hover:text-[var(--color-m3-primary)] transition-colors px-3 py-2 rounded-full hover:bg-[var(--color-m3-surface-variant)]">
                <LayoutDashboard className="w-4 h-4" />
                <Translate i18nKey="nav_dashboard" />
              </Link>
              <div className="h-6 w-px bg-[var(--color-m3-outline-variant)]"></div>
              <Link to="/profile" className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-surface)] hover:opacity-90 transition-opacity hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                <User className="w-4 h-4 text-[var(--color-m3-secondary)]" />
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-[var(--color-m3-surface)] text-[var(--color-m3-secondary)] opacity-80">{user.role}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-full hover:bg-[var(--color-m3-error-container)] hover:text-[var(--color-m3-error)] transition-colors text-[var(--color-m3-outline)]" title="Log out">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <div className="h-6 w-px bg-[var(--color-m3-outline-variant)] hidden sm:block"></div>
              <Link to="/login" className="text-sm font-medium hover:text-[var(--color-m3-primary)] transition-colors px-4 py-2">
                <Translate i18nKey="nav_login" />
              </Link>
              <Link to="/register" className="text-sm font-medium bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity m3-elevation-1 hover:shadow-md hover:-translate-y-0.5">
                <Translate i18nKey="nav_register" />
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative">
        <Outlet />
      </main>
    </div>
  );
}
