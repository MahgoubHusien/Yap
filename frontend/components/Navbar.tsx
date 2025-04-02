"use client";

import React, { useEffect, useState } from "react";
import {
  IconHome,
  IconVideoPlus,
  IconHash,
  IconUsers,
  IconHistory,
  IconSun,
  IconMoon,
  IconUser,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";

const Sidebar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const defaultTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(defaultTheme);
    document.documentElement.classList.add(defaultTheme);
  }, []);

  const toggleTheme = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent sidebar from closing when toggling theme
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  const links = [
    { title: "Home", icon: <IconHome className="h-6 w-6" />, href: "/" },
    { title: "Profile", icon: <IconUser className="h-6 w-6" />, href: "/dashboard" }, 
    { title: "Instant Free Talk", icon: <IconVideoPlus className="h-6 w-6" />, href: "#" },
    { title: "Topic-Based Chat", icon: <IconHash className="h-6 w-6" />, href: "/topics" },
    { title: "Friends & Callbacks", icon: <IconUsers className="h-6 w-6" />, href: "#" },
    { title: "Recent Live Chats", icon: <IconHistory className="h-6 w-6" />, href: "#" },
  ];

  if (!hasMounted) return null; // Prevents hydration mismatch

  return (
    <>
      {/* ☰ Hamburger Button (Only Visible When Sidebar is Closed) */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-gray-200 dark:bg-gray-800 rounded-md"
          onClick={() => setIsOpen(true)}
        >
          <IconMenu2 className="h-6 w-6 text-gray-800 dark:text-white" />
        </button>
      )}

      {/* Background Overlay (Closes Sidebar When Clicking Outside) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar (Hidden by Default) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        {/* Sidebar Header - Menu Title & Close Button */}
        <div className="py-5 px-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
          <button onClick={() => setIsOpen(false)}>
            <IconX className="h-6 w-6 text-gray-800 dark:text-white" />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex flex-col space-y-2 px-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              onClick={() => setIsOpen(false)} // Close sidebar when clicking a link
              className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
            >
              {link.icon}
              <span>{link.title}</span>
            </a>
          ))}

          {/* Theme Toggle (Does Not Close Sidebar) */}
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all w-full text-left"
          >
            {theme === "light" ? <IconMoon className="h-6 w-6" /> : <IconSun className="h-6 w-6" />}
            <span>Theme Toggle</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
