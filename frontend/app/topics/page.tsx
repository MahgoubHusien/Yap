"use client";

import React from "react";

const topics = [
  { category: "NBA", title: "🐐 Who is the GOAT: Jordan, LeBron, or Kobe?" },
  { category: "NBA", title: "🏀 Should the NBA shorten the season?" },
  { category: "NBA", title: "💰 Is player loyalty dead in the NBA?" },

  { category: "NFL", title: "🏈 Is Tom Brady the undisputed GOAT?" },
  { category: "NFL", title: "💸 Should college football players get paid more?" },
  { category: "NFL", title: "🤔 Should the NFL expand to more teams?" },

  { category: "Politics", title: "⚖️ Should voting be mandatory?" },
  { category: "Politics", title: "🌎 Climate change: How urgent is the crisis?" },
  { category: "Politics", title: "💵 Should there be a universal basic income?" },

  { category: "Music", title: "🎤 Who is the greatest rapper of all time?" },
  { category: "Music", title: "🎸 Is rock music dead?" },
  { category: "Music", title: "🎧 Has auto-tune ruined the music industry?" },

  { category: "Sports", title: "🏅 Should esports be considered a real sport?" },
  { category: "Sports", title: "⚽ Messi vs. Ronaldo: Who is truly the best?" },
  { category: "Sports", title: "🏆 Should college athletes be paid salaries?" },

  { category: "Movies", title: "🎬 What is the greatest movie franchise ever?" },
  { category: "Movies", title: "🍿 Are superhero movies ruining cinema?" },
  { category: "Movies", title: "🎥 Should AI be used in movie production?" },
];

const TopicsPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white py-10 px-6">
      <h1 className="text-4xl font-bold text-center mb-8">🔥 Trending Debate Topics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {topics.map((topic, index) => (
          <div
            key={index}
            className="p-6 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md 
                       bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">{topic.category}</h3>
            <p className="text-md mt-2">{topic.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicsPage;
