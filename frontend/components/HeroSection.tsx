"use client";
import React from "react";

const HeroSection = () => {
  return (
    <div className="text-center mt-28 flex flex-col items-center">
      {/* Subtitle with Background */}
      <p className="text-sm font-medium text-red-500 bg-red-100 px-4 py-1 rounded-full">
        The next generation of social interaction
      </p>

      {/* Main Heading */}
      <h1 className="text-6xl font-extrabold mt-4 leading-tight text-gray-900 dark:text-white">
        Connect Instantly with{" "}
        <span className="text-red-500">Yap</span>
      </h1>

      {/* Subtext */}
      <p className="text-xl text-gray-600 dark:text-gray-400 mt-4 max-w-2xl">
        Join free-flowing conversations, meet new people, and explore trending topics in real-time.
      </p>

      {/* Buttons - Now Centered */}
      <div className="flex gap-4 mt-6 justify-center">
        <button className="px-6 py-3 bg-red-500 text-white text-lg font-semibold rounded-full hover:bg-red-600 transition">
          ⚡ Jump In
        </button>
        <button className="px-6 py-3 border border-gray-800 dark:border-gray-300 text-lg font-semibold rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          Explore Topics
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
