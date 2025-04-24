'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { RealtimeChannel } from '@supabase/supabase-js';

type SignalPayload = {
  type: 'offer' | 'answer' | 'candidate';
  data: RTCSessionDescriptionInit | RTCIceCandidateInit;
  sender: string;
};

export default function VideoCall() {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // 1) Fetch or join a random chat session
  const fetchSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_random_session');
      if (error) throw error;
      if (!data || typeof data !== 'string') {
        throw new Error(`Invalid session ID: ${JSON.stringify(data)}`);
      }
      setRoomId(data);
    } catch (err: unknown) {
      console.error('fetchSession error:', err);
      setError(err instanceof Error ? err.message : 'Could not join session');
    }
  }, [supabase]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // 2) WebRTC setup
  useEffect(() => {
    if (!roomId) return;

    let pc: RTCPeerConnection;
    let channel: RealtimeChannel | null = null;
    const pendingCandidates: RTCIceCandidateInit[] = [];
    let localUserId: string;
    let isCaller = false;
    let isAnswerer = false;

    const flushCandidates = () => {
      while (pendingCandidates.length) {
        const c = pendingCandidates.shift()!;
        pc.addIceCandidate(c).catch(console.error);
      }
    };

    const initWebRTC = async () => {
      try {
        // Auth
        const {
          data: { session },
          error: sessErr,
        } = await supabase.auth.getSession();
        if (sessErr) throw sessErr;
        if (!session) { setError('Login required'); return; }
        localUserId = session.user.id;

        // Determine caller/answerer
        const { data: row, error: rowErr } = await supabase
          .from('random_sessions')
          .select('user_a, user_b')
          .eq('session_id', roomId)
          .single();
        if (rowErr || !row) throw rowErr || new Error('No session row');
        isCaller   = row.user_b === localUserId;
        isAnswerer = row.user_a === localUserId;

        // Local media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!localRef.current) throw new Error('Missing local video element');
        localRef.current.srcObject = stream;

        // PeerConnection
        pc = new RTCPeerConnection({
          iceServers:[{ urls:'stun:stun.l.google.com:19302' }]
        });
        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        // Remote track
        pc.ontrack = e => {
          if (remoteRef.current) remoteRef.current.srcObject = e.streams[0];
        };

        // ICE candidates
        pc.onicecandidate = ({ candidate }) => {
          if (candidate && channel) {
            channel.send({
              type: 'broadcast',
              event: 'signal',
              payload: {
                type: 'candidate',
                data: candidate.toJSON(),
                sender: localUserId
              }
            });
          }
        };

        // Signaling channel
        channel = supabase
          .channel(`webrtc-${roomId}`)
          .on('broadcast', { event: 'signal' }, async msg => {
            const { type, data, sender } = msg.payload as SignalPayload;
            if (sender === localUserId) return;
            setRemoteUserId(sender);

            if (type === 'offer' && isAnswerer) {
              await pc.setRemoteDescription(data as RTCSessionDescriptionInit);
              flushCandidates();
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              channel!.send({
                type: 'broadcast',
                event: 'signal',
                payload: { type:'answer', data: answer, sender: localUserId }
              });
            }

            if (type === 'answer' && isCaller) {
              await pc.setRemoteDescription(data as RTCSessionDescriptionInit);
              flushCandidates();
            }

            if (type === 'candidate') {
              if (pc.remoteDescription?.type) {
                pc.addIceCandidate(data as RTCIceCandidateInit).catch(console.error);
              } else {
                pendingCandidates.push(data as RTCIceCandidateInit);
              }
            }
          })
          .subscribe();

        // Only caller sends offer
        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({
            type: 'broadcast',
            event: 'signal',
            payload: { type: 'offer', data: offer, sender: localUserId }
          });
        }

      } catch (err: unknown) {
        console.error('WebRTC init error:', err);
        setError(err instanceof Error ? err.message : 'WebRTC init failed');
      }
    };

    initWebRTC();
    return () => { pc?.close(); channel?.unsubscribe(); };
  }, [roomId, supabase]);

  // 3) Send friend request
  const handleAddFriend = async () => {
    if (!remoteUserId) return setError('No remote user to add');
    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession();
    if (sessionErr) return setError(sessionErr.message);
    if (!session) return setError('Login required');
    const { error } = await supabase
      .from('friends')
      .insert([{ user_id: session.user.id, friend_id: remoteUserId, status: 'pending' }]);
    if (error) setError(error.message);
  };

  // 4) Next Person: leave & rejoin
  const handleNextPerson = async () => {
    if (!roomId) return;
    await supabase.rpc('leave_random_session', { in_session_id: roomId });
    fetchSession();
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">
      {error && <div className="absolute top-4 text-red-500 px-4">{error}</div>}
      <div className="flex w-full h-full">
        <div className="flex-1 p-2 flex flex-col items-center justify-center">
          <p className="text-gray-400 mb-2">You</p>
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            className="w-full h-[90vh] rounded-lg object-cover"
          />
        </div>
        <div className="flex-1 p-2 flex flex-col items-center justify-center">
          <p className="text-gray-400 mb-2">Remote</p>
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="w-full h-[90vh] rounded-lg object-cover"
          />
        </div>
      </div>
      <div className="absolute bottom-8 flex gap-4">
        <button
          onClick={handleAddFriend}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg"
        >
          Add Friend
        </button>
        <button
          onClick={handleNextPerson}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg shadow-lg"
        >
          Next Person
        </button>
      </div>
    </div>
  );
}
