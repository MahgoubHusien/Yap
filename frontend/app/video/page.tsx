'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { RealtimeChannel } from '@supabase/supabase-js';

type SignalPayload = {
  type: 'offer' | 'answer' | 'candidate';
  data: RTCSessionDescriptionInit | RTCIceCandidateInit;
};

export default function VideoCall() {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    let pc: RTCPeerConnection;
    let channel: RealtimeChannel | null = null;
    const pendingCandidates: RTCIceCandidateInit[] = [];

    const flushCandidates = () => {
      while (pendingCandidates.length) {
        const candidate = pendingCandidates.shift()!;
        pc.addIceCandidate(candidate).catch(console.error);
      }
    };

    const initWebRTC = async () => {
      try {
        // 1️⃣ Get local media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!localRef.current) throw new Error('Local video element not found');
        localRef.current.srcObject = stream;

        // 2️⃣ Create RTCPeerConnection
        pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // 3️⃣ Handle remote stream
        pc.ontrack = event => {
          if (remoteRef.current) remoteRef.current.srcObject = event.streams[0];
        };

        // 4️⃣ Exchange ICE candidates
        pc.onicecandidate = ({ candidate }) => {
          if (candidate && channel) {
            channel.send({
              type: 'broadcast',
              event: 'signal',
              payload: { type: 'candidate', data: candidate.toJSON() }
            });
          }
        };

        // 5️⃣ Setup Supabase channel
        channel = supabase
          .channel('webrtc-room')
          .on('broadcast', { event: 'signal' }, async message => {
            const { type, data } = message.payload as SignalPayload;

            if (type === 'offer') {
              await pc.setRemoteDescription(data as RTCSessionDescriptionInit);
              flushCandidates();
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              channel!.send({
                type: 'broadcast',
                event: 'signal',
                payload: { type: 'answer', data: answer }
              });
            }

            if (type === 'answer') {
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

        // 6️⃣ Create & send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        channel.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'offer', data: offer }
        });

      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) setError(`WebRTC init failed: ${err.message}`);
        else setError('WebRTC init failed: unknown error');
      }
    };

    initWebRTC();

    return () => {
      pc?.close();
      channel?.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">
      {error && <div className="absolute top-4 text-red-500">{error}</div>}

      <div className="flex w-full h-full">
        {/* Local Video */}
        <div className="flex-1 flex flex-col items-center justify-center p-2">
          <p className="text-gray-400 mb-2">You</p>
          <video
            ref={localRef}
            autoPlay muted playsInline
            className="w-full h-[90vh] object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Remote Video */}
        <div className="flex-1 flex flex-col items-center justify-center p-2">
          <p className="text-gray-400 mb-2">Remote</p>
          <video
            ref={remoteRef}
            autoPlay playsInline
            className="w-full h-[90vh] object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 flex gap-4">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg">
          Add Friend
        </button>
        <button className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg shadow-lg">
          Next Person
        </button>
      </div>
    </div>
  );
}
