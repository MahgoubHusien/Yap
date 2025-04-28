// app/messages/page.tsx
import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import MessagingInterface from '@/components/MessagingInterface'

export default async function MessagingPage() {
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
    // 1) Fetch friend relationships for current user
    const { data: rawFriendRels, error: relError } = await supabase
      .from('friends')
      .select('friend_id, status')
      .eq('user_id', session.user.id)
      .eq('status', 'accepted') // Only get accepted friends

    if (relError) throw relError;

    const friendIds = rawFriendRels?.map((r) => r.friend_id) ?? []

    let friends = []
    if (friendIds.length) {
      // 2) Fetch profile usernames for those IDs - remove avatar_url from select
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, username')  // Removed avatar_url here
        .in('id', friendIds)

      if (profError) throw profError;

      friends = profiles?.map((profile) => ({
        id: profile.id,
        username: profile.username,
        // Don't reference avatar_url at all
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
  } catch (error) {
    console.error('Error in MessagingPage:', error)
    // Return an error state UI instead of failing silently
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="py-6">
          <h1 className="text-center text-4xl font-extrabold text-red-500">
            Messages
          </h1>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="p-6 bg-gray-800 rounded-lg text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Unable to load messages</h2>
            <p className="text-gray-300">There was a problem loading your messages. Please try again later.</p>
            <a href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg">
              Return to Dashboard
            </a>
          </div>
        </main>
      </div>
    )
  }
}