"use client";
import React from "react";
import { Home, Video, Users } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex gap-6 bg-white dark:bg-black px-6 py-3 rounded-full shadow-lg">
        <Home className="w-6 h-6 text-gray-800 dark:text-gray-200 cursor-pointer hover:text-red-500 transition" />
        <Video className="w-6 h-6 text-gray-800 dark:text-gray-200 cursor-pointer hover:text-red-500 transition" />
        <Users className="w-6 h-6 text-gray-800 dark:text-gray-200 cursor-pointer hover:text-red-500 transition" />
      </div>
    </nav>
  );
};

export default Navbar;
