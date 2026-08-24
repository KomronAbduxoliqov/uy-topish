'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const DarkModeToggle: React.FC = () => {
  const { language } = useAppStore();
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('uytop_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      document.body?.classList.add('dark');
    } else if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.body?.classList.remove('dark');
    } else {
      const isHtmlDark = document.documentElement.classList.contains('dark');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = isHtmlDark || prefersDark;
      setIsDark(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
        document.body?.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body?.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.body?.classList.add('dark');
      localStorage.setItem('uytop_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body?.classList.remove('dark');
      localStorage.setItem('uytop_theme', 'light');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? (language === 'en' ? 'Light Mode' : language === 'ru' ? 'Светлая тема' : "Yorug' rejim") : (language === 'en' ? 'Dark Mode' : language === 'ru' ? 'Тёмная тема' : "Tungi rejim")}
    >
      {mounted && isDark ? (
        <Sun className="w-5 h-5 text-amber-500" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      )}
    </button>
  );
};

export default DarkModeToggle;
