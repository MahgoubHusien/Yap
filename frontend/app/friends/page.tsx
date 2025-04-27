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

  // 1) Fetch friend relationships for current user
  const { data: rawFriendRels, error: relError } = await supabase
    .from('friends')
    .select('friend_id, status')
    .eq('user_id', session.user.id)

  if (relError) console.error('Error fetching friend relationships:', relError)

  const friendIds = rawFriendRels?.map((r) => r.friend_id) ?? []

  let friends: Friend[] = []
  if (friendIds.length) {
    // 2) Fetch profile usernames for those IDs
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', friendIds)

    if (profError) console.error('Error fetching profiles:', profError)

    friends = rawFriendRels!.map((r) => {
      const profile = profiles?.find((p) => p.id === r.friend_id)
      return {
        id: r.friend_id,
        username: profile?.username ?? r.friend_id,
        status: r.status,
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

  return <FriendsCallbacks friends={friends} callbacks={callbacks} />
}
