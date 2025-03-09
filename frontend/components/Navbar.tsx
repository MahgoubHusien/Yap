"use client";

import React, { useEffect, useState } from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconUserPlus,
  IconVideoPlus,
  IconHash,
  IconMessages,
  IconUsers,
  IconHistory,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";

const Navbar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const defaultTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(defaultTheme);
    document.documentElement.classList.add(defaultTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 768) {
        if (window.scrollY > lastScrollY && window.scrollY > 50) {
          setShowNavbar(false);
        } else {
          setShowNavbar(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const links = [
    { title: "User Profiles & Auth", icon: <IconUserPlus className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "#" },
    { title: "Instant Free Talk", icon: <IconVideoPlus className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "#" },
    { title: "Topic-Based Chat", icon: <IconHash className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "#" },
    { title: "Messaging System", icon: <IconMessages className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "#" },
    { title: "Friends & Callbacks", icon: <IconUsers className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "#" },
    { title: "Recent Live Chats", icon: <IconHistory className="h-full w-full text-neutral-500 dark:text-neutral-300" />, href: "#" },
    {
      title: "Theme Toggle",
      icon: theme === "light" ? <IconMoon className="h-full w-full text-neutral-500 dark:text-neutral-300" /> : <IconSun className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
      onClick: toggleTheme,
    },
  ];

  if (!hasMounted) return null; // Prevents hydration mismatch

  return (
    <div
      className={`hidden md:flex fixed top-4 sm:top-10 md:top-8 left-1/2 -translate-x-1/2 z-50 transition-transform duration-700 ease-in-out ${
        showNavbar ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0"
      }`}
    >
      <FloatingDock items={links} />
    </div>
  );
};

export default Navbar;
