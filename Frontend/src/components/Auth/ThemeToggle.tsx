import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className }: { className?: string } = {}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or html class
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (initialDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }

    const handleStorage = () => {
      const cur = localStorage.getItem('theme');
      setIsDark(cur === 'dark');
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('theme-change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('theme-change', handleStorage);
    };
  }, []);

  function toggleTheme() {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
    window.dispatchEvent(new Event('theme-change'));
  }

  const defaultClasses = "absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/90 hover:bg-indigo-50 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border border-slate-200/80 hover:border-indigo-200 dark:border-slate-700/80 text-slate-600 hover:text-indigo-600 dark:text-amber-400 dark:hover:text-amber-300 transition-all z-50 shadow-2xs cursor-pointer group";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={className || defaultClasses}
      title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
      aria-label={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
    >
      {isDark ? (
        <Sun className="w-[17px] h-[17px] text-amber-400 fill-amber-400/20 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-[17px] h-[17px] text-indigo-600/90 fill-indigo-500/15 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
