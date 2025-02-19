"use client";

import React, { useEffect, useState } from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconUserPlus,      // for "User Profiles & Auth"
  IconVideoPlus,     // for "Instant Free Talk"
  IconHash,          // for "Topic-Based Chat Rooms" (or use IconMessageCircle)
  IconMessages,      // for "Messaging System"
  IconUsers,         // for "Friends List and Callbacks"
  IconHistory,       // for "Recent Live Chats"
  IconSun,
  IconMoon,
} from "@tabler/icons-react";

export const Navbar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load initial theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Replace the links array with your functional requirements
  const links = [
    {
      title: "User Profiles & Auth",
      icon: <IconUserPlus className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Instant Free Talk",
      icon: <IconVideoPlus className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Topic-Based Chat",
      icon: <IconHash className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Messaging System",
      icon: <IconMessages className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Friends & Callbacks",
      icon: <IconUsers className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Recent Live Chats",
      icon: <IconHistory className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    // Keep the theme toggle in the dock
    {
      title: "Theme Toggle",
      icon: theme === "light" ? (
        <IconMoon className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ) : (
        <IconSun className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: toggleTheme,
    },
  ];

  return (
    <FloatingDock
      // Remove mobileClassName if you don't want the "translate-y-20" behavior on small screens
      mobileClassName="translate-y-20"
      items={links}
    />
  );
};
