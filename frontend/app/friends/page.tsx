// app/friends/page.tsx
import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import FriendsCallbacks, { Friend, Callback } from '@/components/FriendsCallbacks'

export default async function FriendsPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  // 1) Fetch accepted friend relationships for current user
  const { data: acceptedFriendRels, error: acceptedRelError } = await supabase
    .from('friends')
    .select('friend_id, status')
    .eq('user_id', session.user.id)
    .eq('status', 'accepted')

  if (acceptedRelError) console.error('Error fetching accepted friend relationships:', acceptedRelError)
  
  // 2) Fetch pending friend requests for current user
  const { data: pendingFriendRels, error: pendingRelError } = await supabase
    .from('friends')
    .select('user_id, status')
    .eq('friend_id', session.user.id)
    .eq('status', 'pending')

  if (pendingRelError) console.error('Error fetching pending friend requests:', pendingRelError)

  const acceptedFriendIds = acceptedFriendRels?.map((r) => r.friend_id) ?? []
  const pendingFriendIds = pendingFriendRels?.map((r) => r.user_id) ?? []

  let acceptedFriends: Friend[] = []
  if (acceptedFriendIds.length) {
    // Fetch profile usernames for accepted friends
    const { data: acceptedProfiles, error: profError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', acceptedFriendIds)

    if (profError) console.error('Error fetching accepted profiles:', profError)

    acceptedFriends = acceptedFriendRels!.map((r) => {
      const profile = acceptedProfiles?.find((p) => p.id === r.friend_id)
      return {
        id: r.friend_id,
        username: profile?.username ?? r.friend_id,
        status: r.status,
      }
    })
  }

  let pendingFriendRequests: Friend[] = []
  if (pendingFriendIds.length) {
    // Fetch profile usernames for pending friend requests
    const { data: pendingProfiles, error: pendingProfError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', pendingFriendIds)

    if (pendingProfError) console.error('Error fetching pending profiles:', pendingProfError)

    pendingFriendRequests = pendingFriendRels!.map((r) => {
      const profile = pendingProfiles?.find((p) => p.id === r.user_id)
      return {
        id: r.user_id,
        username: profile?.username ?? r.user_id,
        status: 'pending',
      }
    })
  }

  // 3) Fetch callbacks where current user is callee
  const { data: rawCallbacks, error: callbacksError } = await supabase
    .from('callbacks')
    .select('id, caller_id, status, call_requested_at')
    .eq('callee_id', session.user.id)
    .order('call_requested_at', { ascending: false })

  if (callbacksError) console.error('Error fetching callbacks:', callbacksError)

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
}