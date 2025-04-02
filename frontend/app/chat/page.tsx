'use client';

import ChatWindow from './ChatWindow';

export default function ChatPage() {
  const currentUser = 'zain';
  const selectedUser = 'mahgoub';

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-2xl">
        <ChatWindow currentUser={currentUser} selectedUser={selectedUser} />
      </div>
    </main>
  );
}
