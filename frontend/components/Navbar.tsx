"use client";

import React, { useEffect, useState } from "react";
import {
  IconHome,
  IconHash,
  IconUsers,
  IconHistory,
  IconSun,
  IconMoon,
  IconUser,
  IconMenu2,
  IconX,
  IconMessageCircle,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

const Sidebar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const defaultTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(defaultTheme);
    document.documentElement.classList.add(defaultTheme);

    // Check if user is logged in with Supabase
    const checkSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkSession();
    
    // Set up listener for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
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
    {
      title: "Profile",
      icon: <IconUser className="h-6 w-6" />,
      onClick: () => {
        if (isLoggedIn) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      },
    },
    { title: "Messages", icon: <IconMessageCircle className="h-6 w-6" />, href: "/messages" },
    { title: "Topics", icon: <IconHash className="h-6 w-6" />, href: "/topics" },
    { title: "Friends & Callbacks", icon: <IconUsers className="h-6 w-6" />, href: "/friends" },
    { title: "Recent Live Chats", icon: <IconHistory className="h-6 w-6" />, href: "/recentChats" },
  ];

  if (!hasMounted) return null; // Prevents hydration mismatch

  return (
    <>
      {/* ☰ Hamburger Button */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-gray-200 dark:bg-gray-800 rounded-md"
          onClick={() => setIsOpen(true)}
        >
          <IconMenu2 className="h-6 w-6 text-gray-800 dark:text-white" />
        </button>
      )}

      {/* Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        {/* Header */}
        <div className="py-5 px-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
          <button onClick={() => setIsOpen(false)}>
            <IconX className="h-6 w-6 text-gray-800 dark:text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-2 px-4">
          {links.map((link, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                if (link.onClick) {
                  link.onClick();
                } else if (link.href) {
                  router.push(link.href);
                }
              }}
              className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all w-full text-left"
            >
              {link.icon}
              <span>{link.title}</span>
            </button>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all w-full text-left"
          >
            {theme === "light" ? <IconMoon className="h-6 w-6" /> : <IconSun className="h-6 w-6" />}
            <span>Theme Toggle</span>
          </button>

          {/* Conditional Login/Logout Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              if (isLoggedIn) {
                supabaseClient.auth.signOut();
                router.push("/");
              } else {
                router.push("/login");
              }
            }}
            className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all w-full text-left"
          >
            <IconUser className="h-6 w-6" />
            <span>{isLoggedIn ? "Sign Out" : "Sign In"}</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;