'use client';

import React, { useEffect, useState } from 'react';
import { Home, Video, Users, Sun, Moon } from 'lucide-react';

const HomePage = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // On mount, check localStorage for saved theme & apply it
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Function to toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Navbar with Top Icons */}
      <div className="absolute top-6 flex space-x-6">
        <Home className="nav-icon" />
        <Video className="nav-icon" />
        <Users className="nav-icon" />
      </div>

      {/* Theme Toggle Button */}
      <button className="theme-toggle absolute top-6 right-6 flex items-center gap-2" onClick={toggleTheme}>
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
      </button>

      {/* Hero Section */}
      <span className="banner-text">The next generation of social interaction</span>

      <h1 className="hero-text">
        Connect Instantly with <span className="hero-highlight">Yap</span>
      </h1>

      <p className="hero-subtext">
        Join free-flowing conversations, meet new people, and explore trending topics in real-time.
      </p>

      {/* Buttons */}
      <div className="mt-6 flex space-x-4">
        <button className="button-primary">⚡ Jump In</button>
        <button className="button-secondary">Explore Topics</button>
      </div>

      {/* Test Button */}
      <div className="mt-10">
        <button className="test-button" onClick={() => alert(`Current Theme: ${theme}`)}>
          Test Theme
        </button>
      </div>
    </div>
  );
};

export default HomePage;
