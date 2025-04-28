// FriendsCallbacks.tsx - Fixed with improved status handling
'use client'

import React, { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export interface Friend {
  id: string
  username: string
  status: 'pending' | 'accepted' | 'rejected'
}

export interface Callback {
  id: string
  callerId: string
  status: string
  callRequestedAt: string
}

interface FriendsCallbacksProps {
  friends: Friend[]
  callbacks: Callback[]
  pendingFriendRequests: Friend[]
}

export default function FriendsCallbacks({ 
  friends, 
  callbacks,
  pendingFriendRequests 
}: FriendsCallbacksProps) {
  const [acceptedFriends, setAcceptedFriends] = useState<Friend[]>(friends)
  const [pendingRequests, setPendingRequests] = useState<Friend[]>(pendingFriendRequests)
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [notifications, setNotifications] = useState<string[]>([])
  const supabase = createClientComponentClient()

  const handleAcceptRequest = async (friend: Friend) => {
    setIsLoading(prev => ({ ...prev, [friend.id]: true }))
    
    try {
      // Update the friend request status to 'accepted'
      const { error: updateError } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('friend_id', friend.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      
      if (updateError) throw updateError

      // Create the reciprocal friendship record if it doesn't exist
      const { data: currentUser } = await supabase.auth.getUser()
      const { error: insertError } = await supabase
        .from('friends')
        .upsert({ 
          user_id: friend.id, 
          friend_id: currentUser.user?.id, 
          status: 'accepted' 
        }, { 
          onConflict: 'user_id,friend_id',
          ignoreDuplicates: false 
        })
      
      if (insertError) throw insertError
      
      // Update local state
      setPendingRequests(prev => prev.filter(f => f.id !== friend.id))
      setAcceptedFriends(prev => [...prev, { ...friend, status: 'accepted' }])
      
      // Add notification
      setNotifications(prev => [...prev, `You are now friends with ${friend.username}`])
      
      // Force reload to reflect changes (temporary solution)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error accepting friend request:', error)
      alert('Failed to accept friend request: ' + (error as any).message)
    } finally {
      setIsLoading(prev => ({ ...prev, [friend.id]: false }))
    }
  }

  const handleRejectRequest = async (friend: Friend) => {
    setIsLoading(prev => ({ ...prev, [friend.id]: true }))
    
    try {
      // Update the friend request status to 'rejected'
      const { error } = await supabase
        .from('friends')
        .update({ status: 'rejected' })
        .eq('friend_id', friend.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      
      if (error) throw error
      
      // Update local state
      setPendingRequests(prev => prev.filter(f => f.id !== friend.id))
      setNotifications(prev => [...prev, `Friend request from ${friend.username} rejected`])
    } catch (error) {
      console.error('Error rejecting friend request:', error)
      alert('Failed to reject friend request: ' + (error as any).message)
    } finally {
      setIsLoading(prev => ({ ...prev, [friend.id]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="py-6">
        <h1 className="text-center text-4xl font-extrabold text-red-500">
          Friends & Requests
        </h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-4">
            {notifications.map((notification, index) => (
              <div key={index} className="bg-green-600 p-3 rounded-lg mb-2 animate-pulse">
                {notification}
              </div>
            ))}
          </div>
        )}
      
        {/* Friend Requests Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-200">Friend Requests</h2>
          
          {pendingRequests.length === 0 ? (
            <p className="text-gray-400">No pending friend requests</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((friend, index) => (
                <div 
                  key={`pending-${friend.id}-${index}`}
                  className="p-4 border border-gray-700 rounded-lg bg-gray-800"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{friend.username}</p>
                      <p className="text-gray-400 text-sm">Wants to be your friend</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(friend)}
                        disabled={isLoading[friend.id]}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium disabled:opacity-50"
                      >
                        {isLoading[friend.id] ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(friend)}
                        disabled={isLoading[friend.id]}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium disabled:opacity-50"
                      >
                        {isLoading[friend.id] ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Friends Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-200">My Friends</h2>
            <Link
              href="/messages"
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-sm font-medium transition-colors"
            >
              Open Messages
            </Link>
          </div>
          
          {acceptedFriends.length === 0 ? (
            <p className="text-gray-400">You haven't added any friends yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {acceptedFriends.map((friend, index) => (
                <div 
                  key={`accepted-${friend.id}-${index}`}
                  className="p-4 border border-red-500 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-semibold">{friend.username}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={`/messages?friend=${friend.id}`}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm font-medium flex-1 text-center"
                    >
                      Message
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Callbacks Section */}
        {callbacks.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-200">Callbacks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {callbacks.map((callback, index) => (
                <div 
                  key={`callback-${callback.id}-${index}`}
                  className="p-4 border border-gray-700 rounded-lg bg-gray-800"
                >
                  <p className="font-semibold">Caller ID: {callback.callerId}</p>
                  <p className="text-gray-400 text-sm">Status: {callback.status}</p>
                  <p className="text-gray-400 text-sm">
                    Requested: {new Date(callback.callRequestedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}