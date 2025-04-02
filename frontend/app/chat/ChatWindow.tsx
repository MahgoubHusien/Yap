'use client';

import { useEffect, useState } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';

interface MessageType {
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  currentUser: string;
  selectedUser: string;
}

export default function ChatWindow({ currentUser, selectedUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    // Mock fetch
    fetch(`/api/messages?user1=${currentUser}&user2=${selectedUser}`)
      .then(res => res.json())
      .then(data => setMessages(data));
  }, [currentUser, selectedUser]);

  const sendMessage = (content: string) => {
    const newMsg: MessageType = {
      sender: currentUser,
      receiver: selectedUser,
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);

    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    });
  };

  return (
    <div className="flex flex-col h-[75vh] rounded-2xl border border-gray-200 shadow bg-white overflow-hidden">
      <div className="px-4 py-2 border-b bg-gray-50 font-semibold text-gray-700">
        Chat with {selectedUser}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, index) => (
          <Message key={index} msg={msg} isOwn={msg.sender === currentUser} />
        ))}
      </div>
      <div className="border-t p-3 bg-white">
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
}
