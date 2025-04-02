interface MessageProps {
    msg: {
      sender: string;
      content: string;
      timestamp: string;
    };
    isOwn: boolean;
  }
  
  export default function Message({ msg, isOwn }: MessageProps) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`rounded-xl px-4 py-2 max-w-sm shadow-sm text-sm ${
            isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          <p>{msg.content}</p>
          <span className="text-[10px] block text-right opacity-60 mt-1">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  }
  