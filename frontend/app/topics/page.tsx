"use client";

import React from "react";

const topics = [
  // NBA Topics
  { category: "NBA", title: "🐐 Who is the GOAT: Jordan, LeBron, or Kobe?" },
  { category: "NBA", title: "🏀 Should the NBA shorten the season?" },
  { category: "NBA", title: "💰 Is player loyalty dead in the NBA?" },
  { category: "NBA", title: "🎯 Should NBA teams rely more on analytics?" },
  { category: "NBA", title: "🏆 Are superteams ruining the NBA?" },
  { category: "NBA", title: "🚀 Should the NBA add a 4-point line?" },
  { category: "NBA", title: "🔥 Does the NBA need more rivalries?" },
  { category: "NBA", title: "⏳ Should older players get load management?" },

  // NFL Topics
  { category: "NFL", title: "🏈 Is Tom Brady the undisputed GOAT?" },
  { category: "NFL", title: "💸 Should college football players get paid more?" },
  { category: "NFL", title: "🤔 Should the NFL expand to more teams?" },
  { category: "NFL", title: "🚑 Should the NFL do more to prevent concussions?" },
  { category: "NFL", title: "🏆 Should the Super Bowl always be in a warm location?" },
  { category: "NFL", title: "📺 Does the NFL need a new overtime rule?" },
  { category: "NFL", title: "🤨 Should roughing-the-passer penalties be reviewable?" },

  // Politics Topics
  { category: "Politics", title: "⚖️ Should voting be mandatory?" },
  { category: "Politics", title: "🌎 Climate change: How urgent is the crisis?" },
  { category: "Politics", title: "💵 Should there be a universal basic income?" },
  { category: "Politics", title: "🏛️ Should there be term limits for Congress?" },
  { category: "Politics", title: "🗳️ Should felons have the right to vote?" },
  { category: "Politics", title: "📉 Should the government regulate cryptocurrencies?" },
  { category: "Politics", title: "🚑 Should healthcare be free for everyone?" },
  { category: "Politics", title: "🌍 Should countries open their borders to migrants?" },

  // Music Topics
  { category: "Music", title: "🎤 Who is the greatest rapper of all time?" },
  { category: "Music", title: "🎸 Is rock music dead?" },
  { category: "Music", title: "🎧 Has auto-tune ruined the music industry?" },
  { category: "Music", title: "🔥 Is music today better or worse than past decades?" },
  { category: "Music", title: "💿 Should albums be shorter?" },
  { category: "Music", title: "🎶 Should artists be allowed to use AI-generated lyrics?" },
  { category: "Music", title: "🎷 Is jazz the most underrated music genre?" },

  // Sports Topics
  { category: "Sports", title: "🏅 Should esports be considered a real sport?" },
  { category: "Sports", title: "⚽ Messi vs. Ronaldo: Who is truly the best?" },
  { category: "Sports", title: "🏆 Should college athletes be paid salaries?" },
  { category: "Sports", title: "🥊 Should combat sports like boxing & MMA be banned?" },
  { category: "Sports", title: "🏁 Should Formula 1 have equal car performance?" },
  { category: "Sports", title: "🥶 Is home-field advantage unfair in playoffs?" },
  { category: "Sports", title: "🏊 Should the Olympics include more extreme sports?" },

  // Movies & TV Topics
  { category: "Movies", title: "🎬 What is the greatest movie franchise ever?" },
  { category: "Movies", title: "🍿 Are superhero movies ruining cinema?" },
  { category: "Movies", title: "🎥 Should AI be used in movie production?" },
  { category: "Movies", title: "🏆 Should streaming services compete for Oscars?" },
  { category: "Movies", title: "📺 Is TV better now than in the past?" },
  { category: "Movies", title: "🎞️ Should actors be replaced by deepfake technology?" },

  // Technology Topics
  { category: "Technology", title: "🤖 Should AI replace human jobs?" },
  { category: "Technology", title: "📱 Is social media ruining society?" },
  { category: "Technology", title: "🚀 Should humans colonize Mars?" },
  { category: "Technology", title: "💻 Is coding the most important skill for the future?" },
  { category: "Technology", title: "🔋 Should all cars be electric by 2030?" },
  { category: "Technology", title: "🕶️ Will virtual reality replace real-life experiences?" },

  // Education Topics
  { category: "Education", title: "📚 Should college be free for everyone?" },
  { category: "Education", title: "🎓 Is a degree still worth it in 2025?" },
  { category: "Education", title: "📝 Should homework be banned?" },
  { category: "Education", title: "📖 Should students learn financial literacy in school?" },
  { category: "Education", title: "🧠 Is memorization more important than critical thinking?" },

  // Gaming Topics
  { category: "Gaming", title: "🎮 Is gaming addiction a real problem?" },
  { category: "Gaming", title: "⚔️ Are microtransactions ruining video games?" },
  { category: "Gaming", title: "🎭 Should video games be considered an art form?" },
  { category: "Gaming", title: "🏆 Should esports be in the Olympics?" },
  { category: "Gaming", title: "🕹️ Are single-player games better than multiplayer?" },

  // Food Topics
  { category: "Food", title: "🍕 Does pineapple belong on pizza?" },
  { category: "Food", title: "🥤 Should soda be taxed like cigarettes?" },
  { category: "Food", title: "🐄 Should the world go vegan?" },
  { category: "Food", title: "🍔 Is fast food responsible for obesity?" },
  { category: "Food", title: "☕ Is coffee overrated?" },

  // Miscellaneous Topics
  { category: "Random", title: "💤 Should naps be mandatory at work?" },
  { category: "Random", title: "🚶 Should humans walk everywhere instead of drive?" },
  { category: "Random", title: "📺 Should reality TV be banned?" },
  { category: "Random", title: "🌙 Should we go back to the Moon before Mars?" },
  { category: "Random", title: "🎭 Should celebrities be involved in politics?" }
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
