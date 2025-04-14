// pages/recent-chats.tsx
import React from "react";

interface Chat {
  sessionId: string;
  sessionType: string;
  createdAt: string;
}

const dummyChats: Chat[] = [
  { sessionId: "1", sessionType: "FREE_TALK", createdAt: "2025-04-01T10:00:00Z" },
  { sessionId: "2", sessionType: "TOPIC", createdAt: "2025-04-02T11:30:00Z" },
  { sessionId: "3", sessionType: "FREE_TALK", createdAt: "2025-04-03T09:15:00Z" },
];

const RecentChatsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="py-6">
        <h1 className="text-center text-4xl font-extrabold text-red-500">Recent Chats</h1>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          {dummyChats.map((chat) => (
            <div
              key={chat.sessionId}
              className="p-6 border border-red-500 rounded-lg hover:shadow-xl transition-shadow duration-300"
            >
              <p className="text-2xl font-bold">Session: {chat.sessionId}</p>
              <p className="mt-2 text-sm">
                Type: <span className="text-red-500 font-semibold">{chat.sessionType}</span>
              </p>
              <p className="mt-1 text-sm">
                Started: {new Date(chat.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RecentChatsPage;
