// app/chat/ChatWindow.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Message from './Message';
import MessageInput from './MessageInput';

interface MessageType {
  id?: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

interface ChatWindowProps {
  currentUser: string;
  selectedUser: string;
  selectedUserName: string;
}

export default function ChatWindow({ currentUser, selectedUser, selectedUserName }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  // Fetch messages between the two users
  useEffect(() => {
    let channelA: any = null;
    
    async function fetchMessages() {
      setLoading(true);
      
      try {
        // Get all messages where current user and selected user are involved
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender.eq.${currentUser},receiver.eq.${selectedUser}),and(sender.eq.${selectedUser},receiver.eq.${currentUser})`)
          .order('timestamp', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setMessages(data || []);
        
        // Mark messages as read
        if (data && data.length > 0) {
          const unreadMessages = data.filter(
            msg => msg.sender === selectedUser && msg.receiver === currentUser && !msg.read
          );
          
          if (unreadMessages.length > 0) {
            await supabase
              .from('messages')
              .update({ read: true })
              .in('id', unreadMessages.map(msg => msg.id));
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setConnectionStatus('Error loading messages');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMessages();
    
    // Set up realtime subscription with proper channel name
    const channelName = `messages-${Math.min(parseInt(currentUser), parseInt(selectedUser))}-${Math.max(parseInt(currentUser), parseInt(selectedUser))}`;
    
    try {
      // Subscribe to new messages from the other user
      channelA = supabase
        .channel(channelName)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `sender=eq.${selectedUser} AND receiver=eq.${currentUser}`
          },
          async (payload) => {
            console.log('Received new message:', payload);
            setMessages(prev => [...prev, payload.new as MessageType]);
            
            // Automatically mark as read
            try {
              await supabase
                .from('messages')
                .update({ read: true })
                .eq('id', payload.new.id);
            } catch (err) {
              console.error('Error marking message as read:', err);
            }
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status: ${status}`);
          setConnectionStatus(status === 'SUBSCRIBED' ? 'Connected' : `Status: ${status}`);
        });
        
      // Also subscribe to your own messages for consistency
      supabase
        .channel(`${channelName}-self`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `sender=eq.${currentUser} AND receiver=eq.${selectedUser}`
          },
          (payload) => {
            console.log('Sent message confirmed:', payload);
            // This handles the case where message was sent from another tab/device
            const msgExists = messages.some(m => m.id === payload.new.id);
            if (!msgExists) {
              setMessages(prev => [...prev, payload.new as MessageType]);
            }
          }
        )
        .subscribe();
            
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      setConnectionStatus('Connection error');
    }
    
    return () => {
      if (channelA) {
        supabase.removeChannel(channelA);
      }
    };
  }, [currentUser, selectedUser, supabase]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    const newMsg: MessageType = {
      sender: currentUser,
      receiver: selectedUser,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Optimistically update UI
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {...newMsg, id: tempId}]);

    try {
      // Save to database
      const { data, error } = await supabase
        .from('messages')
        .insert(newMsg)
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      
      // Replace the temp message with the actual one from the database
      if (data && data[0]) {
        setMessages(prev => 
          prev.map(msg => 
            (msg.id === tempId) ? data[0] : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      // Show a user-friendly error message
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-800">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-200">Chat with {selectedUserName}</span>
          {connectionStatus !== 'Connected' && 
            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">
              {connectionStatus}
            </span>
          }
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-800">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-xl font-medium mb-2">No messages yet. Start the conversation!</p>
            <p className="text-sm">Any messages you send will appear here.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <Message 
                key={msg.id || `msg-${index}-${msg.timestamp}`} 
                msg={msg} 
                isOwn={msg.sender === currentUser} 
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
}