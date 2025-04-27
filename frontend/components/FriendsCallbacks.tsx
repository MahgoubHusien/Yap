// components/FriendsCallbacks.tsx
'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export type Friend = { id: string; username: string; status: string }
export type Callback = { id: string; callerId: string; status: string; callRequestedAt: string }

interface FriendsCallbacksProps {
  friends: Friend[]
  callbacks: Callback[]
}

export default function FriendsCallbacks({ friends, callbacks }: FriendsCallbacksProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [loadingCallId, setLoadingCallId] = useState<string | null>(null)

  // Deduplicate friends by ID to avoid duplicate React keys
  const uniqueFriends = useMemo(() => {
    const seen = new Set<string>()
    return friends.filter((f) => {
      if (seen.has(f.id)) return false
      seen.add(f.id)
      return true
    })
  }, [friends])

  const handleCall = useCallback(async (friendId: string) => {
    setLoadingCallId(friendId)
    const { data: sessionData, error: sessErr } = await supabase.auth.getSession()
    const session = sessionData.session
    if (sessErr || !session) {
      console.error('Auth error:', sessErr)
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('random_sessions')
      .insert({ user_a: session.user.id, user_b: friendId })
      .select('session_id')
      .single()

    setLoadingCallId(null)
    if (error || !data) {
      console.error('Create session error:', error)
      return
    }

    router.push(`/video/${data.session_id}`)
  }, [supabase, router])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="py-6">
        <h1 className="text-center text-4xl font-extrabold text-red-500">
          Friends & Callbacks
        </h1>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-12">
        <section>
          <h2 className="text-3xl font-bold border-b border-red-500 pb-2 mb-4">
            Friends
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {uniqueFriends.map((friend) => (
              <div
                key={`friend-${friend.id}`}
                className="p-6 border border-red-500 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="text-2xl font-bold">{friend.username}</p>
                  <p className="mt-2 text-sm">
                    Status:{' '}
                    <span className="text-red-500 font-semibold">
                      {friend.status}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleCall(friend.id)}
                  disabled={loadingCallId === friend.id}
                  className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                >
                  {loadingCallId === friend.id ? 'Calling...' : 'Call'}
                </button>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-bold border-b border-red-500 pb-2 mb-4">
            Callbacks
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {callbacks.map((cb) => (
              <div
                key={`callback-${cb.id}`}
                className="p-6 border border-red-500 rounded-lg"
              >
                <p>
                  <span className="font-bold text-red-500">Caller:</span>{' '}
                  {cb.callerId}
                </p>
                <p>
                  <span className="font-bold text-red-500">Status:</span>{' '}
                  {cb.status}
                </p>
                <p>
                  <span className="font-bold text-red-500">Requested:</span>{' '}
                  {new Date(cb.callRequestedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
