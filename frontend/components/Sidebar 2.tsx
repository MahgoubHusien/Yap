"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* DESKTOP NAV (Always Visible on Top) */}
      <nav className="hidden md:flex fixed top-0 left-0 w-full bg-white dark:bg-black shadow-md py-3 px-6 z-50">
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-red-500">
            Yap
          </Link>

          {/* Nav Links */}
          <div className="flex gap-6">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/topics" className="nav-link">Topics</Link>
            <Link href="/about" className="nav-link">About</Link>
          </div>
        </div>
      </nav>

      {/* MOBILE NAVBAR (Sidebar) */}
      <div className="md:hidden">
        {/* Menu Button */}
        <button
          className="fixed top-4 left-4 z-50 bg-red-500 text-white p-3 rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Sidebar Menu */}
        <div
          className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-black 
                      shadow-lg p-6 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                      transition-transform duration-300 z-40`}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-gray-600 dark:text-gray-300"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Sidebar Links */}
          <nav className="flex flex-col mt-10 space-y-4">
            <Link href="/" className="nav-link" onClick={() => setIsOpen(false)}>🏠 Home</Link>
            <Link href="/topics" className="nav-link" onClick={() => setIsOpen(false)}>🔥 Topics</Link>
            <Link href="/about" className="nav-link" onClick={() => setIsOpen(false)}>ℹ️ About</Link>
          </nav>
        </div>

        {/* Backdrop Overlay when sidebar is open */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsOpen(false)}
          ></div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
