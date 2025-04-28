// app/friends/page.tsx
import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import FriendsCallbacks, { Friend, Callback } from '@/components/FriendsCallbacks'

export default async function FriendsPage() {
  // Make sure to await the cookies
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  try {
    // 1) Fetch accepted friend relationships for current user
    const { data: acceptedFriendRels, error: acceptedRelError } = await supabase
      .from('friends')
      .select('friend_id, status')
      .eq('user_id', session.user.id)
      .eq('status', 'accepted')

    if (acceptedRelError) throw acceptedRelError
    
    // 2) Fetch pending friend requests for current user (where user is the receiver)
    const { data: pendingFriendRels, error: pendingRelError } = await supabase
      .from('friends')
      .select('user_id, status')
      .eq('friend_id', session.user.id)
      .eq('status', 'pending')

    if (pendingRelError) throw pendingRelError

    const acceptedFriendIds = acceptedFriendRels?.map((r) => r.friend_id) ?? []
    const pendingFriendIds = pendingFriendRels?.map((r) => r.user_id) ?? []

    // Process accepted friends
    let acceptedFriends: Friend[] = []
    if (acceptedFriendIds.length) {
      // Fetch profile usernames for accepted friends
      const { data: acceptedProfiles, error: profError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', acceptedFriendIds)

      if (profError) throw profError

      acceptedFriends = acceptedProfiles?.map((profile) => ({
        id: profile.id,
        username: profile.username,
        status: 'accepted',
      })) ?? []
    }

    // Process pending friend requests
    let pendingFriendRequests: Friend[] = []
    if (pendingFriendIds.length) {
      // Fetch profile usernames for pending friend requests
      const { data: pendingProfiles, error: pendingProfError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', pendingFriendIds)

      if (pendingProfError) throw pendingProfError

      pendingFriendRequests = pendingProfiles?.map((profile) => ({
        id: profile.id,
        username: profile.username,
        status: 'pending',
      })) ?? []
    }

    // 3) Fetch callbacks where current user is callee
    const { data: rawCallbacks, error: callbacksError } = await supabase
      .from('callbacks')
      .select('id, caller_id, status, call_requested_at')
      .eq('callee_id', session.user.id)
      .order('call_requested_at', { ascending: false })

    if (callbacksError) throw callbacksError

    const callbacks: Callback[] = rawCallbacks?.map((c) => ({
      id: c.id,
      callerId: c.caller_id,
      status: c.status,
      callRequestedAt: c.call_requested_at,
    })) ?? []

    return (
      <FriendsCallbacks 
        friends={acceptedFriends} 
        callbacks={callbacks} 
        pendingFriendRequests={pendingFriendRequests} 
      />
    )
  } catch (error) {
    console.error('Error in FriendsPage:', error)
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="py-6">
          <h1 className="text-center text-4xl font-extrabold text-red-500">
            Friends & Requests
          </h1>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="p-6 bg-gray-800 rounded-lg text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Friends</h2>
            <p className="text-gray-300">There was a problem loading your friends list. Please try again later.</p>
            <a href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg">
              Return to Dashboard
            </a>
          </div>
        </main>
      </div>
    )
  }
}