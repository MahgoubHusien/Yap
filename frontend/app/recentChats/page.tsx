// app/recent-chats/page.tsx
import React from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Define the shape of the joined session data
type SessionType = 'FREE_TALK' | 'TOPIC'

interface ChatSessions {
  session_type: SessionType
  created_at: string
  topics: { name: string }[] | null
}

interface ParticipantRow {
  session_id: string
  joined_at: string
  chat_sessions: ChatSessions[] | null
}

export default async function RecentChatsPage() {
  // 1. Create server-side Supabase client
  const supabase = createServerComponentClient({ cookies })

  // 2. Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  // 3. Query the last 10 chat sessions this user joined
  const { data: rawData, error } = await supabase
    .from('chat_participants')
    .select(
      `session_id, joined_at, chat_sessions ( session_type, created_at, topics(name) )`
    )
    .eq('user_id', session.user.id)
    .order('joined_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Failed loading recent chats:', error)
  }

  const participants: ParticipantRow[] = rawData ?? []

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="py-6">
        <h1 className="text-center text-4xl font-extrabold text-red-500">
          Recent Chats
        </h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {participants.length === 0 ? (
          <p className="text-center text-gray-400">No recent chats found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {participants.map((p) => {
              // Take the first related chat_sessions record
              const cs = p.chat_sessions?.[0]
              const type = cs?.session_type ?? 'FREE_TALK'
              const startedAt = cs?.created_at ?? p.joined_at
              const topicName = type === 'TOPIC' && cs?.topics?.[0]?.name
                ? cs.topics[0].name
                : null

              const friendlyType = type === 'FREE_TALK' ? 'Free Talk' : 'Topic'

              return (
                <div
                  key={p.session_id}
                  className="p-6 border border-red-500 rounded-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <p className="text-2xl font-bold">
                    Session: {p.session_id}
                  </p>
                  <p className="mt-2 text-sm">
                    Type:{' '}
                    <span className="text-red-500 font-semibold">
                      {friendlyType}
                    </span>
                    {topicName && (
                      <> – <em className="text-gray-300">{topicName}</em></>
                    )}
                  </p>
                  <p className="mt-1 text-sm">
                    Joined At: {new Date(p.joined_at).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Started At: {new Date(startedAt).toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
