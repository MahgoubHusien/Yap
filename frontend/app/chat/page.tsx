// app/messages/page.tsx
import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import MessagingInterface from '@/components/MessagingInterface'

export default async function MessagingPage() {
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
    .eq('status', 'accepted') // Only get accepted friends

  if (relError) console.error('Error fetching friend relationships:', relError)

  const friendIds = rawFriendRels?.map((r) => r.friend_id) ?? []

  let friends = []
  if (friendIds.length) {
    // 2) Fetch profile usernames for those IDs
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', friendIds)

    if (profError) console.error('Error fetching profiles:', profError)

    friends = profiles?.map((profile) => ({
      id: profile.id,
      username: profile.username,
      avatarUrl: profile.avatar_url,
    })) ?? []
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="py-6">
        <h1 className="text-center text-4xl font-extrabold text-red-500">
          Messages
        </h1>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <MessagingInterface friends={friends} userId={session.user.id} />
      </main>
    </div>
  )
}