"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleHopIn = () => {
    setLoading(true);
    router.push("/video-call"); // Redirects to the video chat page
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col relative">
<<<<<<< HEAD
      {/* Floating Dock (Navbar) slightly down from the top */}
      <div className="fixed top-4 sm:top-6 md:top-8 left-1/2 -translate-x-1/2 z-50">
        <Navbar />
      </div>

=======
>>>>>>> origin/mobileinterface
      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16">
        {/* Pill Label */}
        <div className="mx-auto inline-flex items-center justify-center gap-2 bg-red-100 text-red-500 px-4 py-1 text-sm font-semibold rounded-full">
          <Sparkles className="w-4 h-4" />
          <span>The next wave in social vibes</span>
        </div>

        {/* Main Heading */}
        <h1 className="hero-text mt-4">
          Connect Instantly with <span className="hero-highlight">Yap</span>
        </h1>

        {/* Subheading */}
        <p className="hero-subtext max-w-xl mx-auto">
          Join free-flowing conversations, meet new people, and explore trending topics in real-time.
        </p>

        {/* Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
          {/* Primary Button */}
          <button
            onClick={handleHopIn}
            className="w-36 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 shadow-lg hover:shadow-xl transition-transform hover:scale-105"
            disabled={loading}
          >
            {loading ? "Connecting..." : "👨‍💻 Hop In"}
          </button>

          {/* Secondary Button */}
          <Link href="/topics">
            <button className="w-38 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-3 px-6 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm hover:shadow transition-colors">
              🫧 Check Topics
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center py-10">
        <div className="text-8xl md:text-9xl flex space-x-4"></div>
      </footer>
    </div>
  );
};

export default HomePage;
