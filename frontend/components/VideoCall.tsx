// components/VideoCall.tsx
'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface VideoCallProps {
  sessionId?: string
  topicName?: string
}

type SignalPayload = {
  type: 'offer' | 'answer' | 'candidate'
  data: RTCSessionDescriptionInit | RTCIceCandidateInit
  sender: string
}

export default function VideoCall({ sessionId, topicName }: VideoCallProps) {
  // Decide room ID: topicName for topics, sessionId otherwise
  const initialRoom = topicName ?? sessionId
  const [roomId, setRoomId] = useState<string | null>(initialRoom ?? null)

  // Refs and state
  const localRef = useRef<HTMLVideoElement>(null)
  const remoteRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // If sessionId changes, update room
  useEffect(() => {
    if (sessionId) setRoomId(sessionId)
  }, [sessionId])

  // Topic header
  const TopicHeader = topicName ? (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-60 text-white px-4 py-2 rounded">
      <h2 className="text-lg font-semibold">{topicName}</h2>
    </div>
  ) : null

  // WebRTC setup
  useEffect(() => {
    if (!roomId) return

    let pc: RTCPeerConnection | null = null
    let channel: RealtimeChannel | null = null
    const pendingCandidates: RTCIceCandidateInit[] = []
    let localUserId: string
    let isCaller = false
    let isAnswerer = false

    const flushCandidates = () => {
      if (!pc) return
      while (pendingCandidates.length) {
        const c = pendingCandidates.shift()!
        pc.addIceCandidate(c).catch(console.error)
      }
    }

    const initWebRTC = async () => {
      try {
        // Auth
        const { data: { session }, error: sessErr } = await supabase.auth.getSession()
        if (sessErr) throw sessErr
        if (!session) { setError('Login required'); return }
        localUserId = session.user.id

        // Determine roles
        const { data: row, error: rowErr } = await supabase
          .from('random_sessions')
          .select('user_a, user_b')
          .eq('session_id', roomId)
          .single()
        if (rowErr || !row) throw rowErr || new Error('Session not found')
        isCaller = row.user_b === localUserId
        isAnswerer = row.user_a === localUserId

        // Local media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (localRef.current) localRef.current.srcObject = stream

        // PeerConnection
        pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
        stream.getTracks().forEach(track => pc!.addTrack(track, stream))

        pc.ontrack = e => {
          if (remoteRef.current) remoteRef.current.srcObject = e.streams[0]
        }

        pc.onicecandidate = ({ candidate }) => {
          if (candidate && channel) {
            channel.send({ type: 'broadcast', event: 'signal', payload: { type: 'candidate', data: candidate.toJSON(), sender: localUserId } })
          }
        }

        // Signaling channel
        channel = supabase
          .channel(`webrtc-${roomId}`)
          .on('broadcast', { event: 'signal' }, async msg => {
            const { type, data, sender } = msg.payload as SignalPayload
            if (sender === localUserId || !pc) return
            setRemoteUserId(sender)

            if (type === 'offer' && isAnswerer) {
              await pc.setRemoteDescription(data as RTCSessionDescriptionInit)
              flushCandidates()
              const answer = await pc.createAnswer()
              await pc.setLocalDescription(answer)
              channel?.send({ type: 'broadcast', event: 'signal', payload: { type: 'answer', data: answer, sender: localUserId } })
            }
            if (type === 'answer' && isCaller) {
              await pc.setRemoteDescription(data as RTCSessionDescriptionInit)
              flushCandidates()
            }
            if (type === 'candidate') {
              if (pc.remoteDescription?.type) pc.addIceCandidate(data as RTCIceCandidateInit).catch(console.error)
              else pendingCandidates.push(data as RTCIceCandidateInit)
            }
          })
          .subscribe()

        if (isCaller) {
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          channel?.send({ type: 'broadcast', event: 'signal', payload: { type: 'offer', data: offer, sender: localUserId } })
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'WebRTC error')
      }
    }

    initWebRTC()
    return () => { pc?.close(); channel?.unsubscribe() }
  }, [roomId, supabase])

  // Add Friend
  const handleAddFriend = useCallback(async () => {
    if (!remoteUserId) return setError('No remote user')
    const { data: { session }, error: sessErr } = await supabase.auth.getSession()
    if (sessErr || !session) return setError('Auth error')
    const { error } = await supabase.from('friends').insert([{ user_id: session.user.id, friend_id: remoteUserId, status: 'pending' }])
    if (error) setError(error.message)
  }, [remoteUserId, supabase])

  // Next Person
  const handleNextPerson = useCallback(async () => {
    if (!roomId) return
    await supabase.rpc('leave_random_session', { in_session_id: roomId })
    setRoomId(null)
  }, [roomId, supabase])

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">
      {TopicHeader}
      {error && <div className="absolute top-4 text-red-500 px-4">{error}</div>}
      <div className="flex w-full h-full">
        <div className="flex-1 p-2 flex flex-col items-center justify-center">
          <p className="text-gray-400 mb-2">You</p>
          <video ref={localRef} autoPlay muted playsInline className="w-full h-[90vh] rounded-lg object-cover" />
        </div>
        <div className="flex-1 p-2 flex flex-col items-center justify-center">
          <p className="text-gray-400 mb-2">Remote</p>
          <video ref={remoteRef} autoPlay playsInline className="w-full h-[90vh] rounded-lg object-cover" />
        </div>
      </div>
      <div className="absolute bottom-8 flex gap-4">
        <button onClick={handleAddFriend} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg">Add Friend</button>
        <button onClick={handleNextPerson} className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg shadow-lg">Next Person</button>
      </div>
    </div>
    )
}
