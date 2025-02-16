'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Home, Video, Users } from 'lucide-react';
import { Dock, DockIcon } from '@/components/magicui/dock';

const HomePage = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Dock at the Top */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-3xl flex justify-center bg-white dark:bg-gray-900 py-3 shadow-lg rounded-b-lg">
        <Dock className="flex space-x-6">
          <DockIcon><Home className="w-8 h-8 nav-icon" /></DockIcon>
          <DockIcon><Video className="w-8 h-8 nav-icon" /></DockIcon>
          <DockIcon><Users className="w-8 h-8 nav-icon" /></DockIcon>
        </Dock>
      </div>

      {/* Theme Toggle Button */}
      <button className="absolute top-16 right-6 theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
      </button>

      {/* Hero Section */}
      <div className="mt-24 text-center">
        <p className="hero-subtext">The next generation of social interaction</p>
        <h1 className="hero-text mt-4">Connect Instantly with <span className="hero-highlight">Yap</span></h1>
        <p className="hero-subtext">Join free-flowing conversations, meet new people, and explore trending topics in real-time.</p>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-center space-x-4">
        <button className="button-primary">⚡ Jump In</button>
        <button className="button-secondary">Explore Topics</button>
      </div>
    </div>
  );
};

export default HomePage;
