interface MessageProps {
  msg: {
    sender: string;
    content: string;
    timestamp: string;
    read?: boolean;
  };
  isOwn: boolean;
}

export default function Message({ msg, isOwn }: MessageProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-xl px-4 py-2 max-w-sm shadow-md text-sm ${
          isOwn ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-200'
        }`}
      >
        <p>{msg.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs opacity-60">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          {isOwn && (
            <span className="text-xs">
              {msg.read ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <path d="M18 6L9.7 16.3 6 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}