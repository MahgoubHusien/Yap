'use client';

import { useState } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (text.trim() && !isSending) {
      setIsSending(true);
      await onSend(text.trim());
      setText('');
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        placeholder="Type your message..."
        className="flex-1 bg-gray-700 border border-gray-600 px-4 py-2 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
        disabled={isSending}
      />
      <button
        onClick={handleSend}
        disabled={isSending}
        className={`bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition ${
          isSending ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSending ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending
          </span>
        ) : (
          'Send'
        )}
      </button>
    </div>
  );
}