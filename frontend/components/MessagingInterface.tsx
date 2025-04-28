'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ChatWindow from '@/app/chat/ChatWindow'

interface Friend {
  id: string
  username: string
  // Make avatarUrl optional since we're not fetching it
  avatarUrl?: string
}

interface MessagingInterfaceProps {
  friends: Friend[]
  userId: string
}

export default function MessagingInterface({ friends, userId }: MessagingInterfaceProps) {
  const searchParams = useSearchParams()
  const friendParam = searchParams.get('friend')
  
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)

  // Set initial friend from URL parameter if available
  useEffect(() => {
    if (friendParam && friends.length > 0) {
      const friend = friends.find(f => f.id === friendParam)
      if (friend) {
        setSelectedFriend(friend)
      }
    }
  }, [friendParam, friends])

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-200 mb-2">No Friends Yet</h2>
          <p className="text-gray-400 mb-6">
            You need to add friends before you can start messaging.
          </p>
          <a 
            href="/friends" 
            className="px-5 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors"
          >
            Go to Friends Page
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex rounded-xl overflow-hidden border border-gray-700 h-[80vh]">
      {/* Friends List Panel */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg">Friends</h2>
        </div>
        <div className="overflow-y-auto h-[calc(80vh-57px)]">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors ${
                selectedFriend?.id === friend.id ? 'bg-gray-700' : ''
              }`}
              onClick={() => setSelectedFriend(friend)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white mr-3">
                  {/* Always use the initial since we're not using avatarUrl */}
                  {friend.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{friend.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-900">
        {selectedFriend ? (
          <ChatWindow 
            currentUser={userId} 
            selectedUser={selectedFriend.id} 
            selectedUserName={selectedFriend.username}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-xl font-medium mb-2">Select a friend to start messaging</p>
              <p>Choose from your friends list on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}