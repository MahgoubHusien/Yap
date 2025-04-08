'use client';

import React, { useEffect, useRef, useState } from "react";
import { useWebRTC } from "@/lib/hooks/useWebRTC";
import { v4 as uuidv4 } from 'uuid';
import { IconMicrophone, IconMicrophoneOff, IconVideo, IconVideoOff, IconPhoneOff } from '@tabler/icons-react';

const VideoCallPage = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [userId] = useState<string>(() => uuidv4());
  const [roomId] = useState<string>(() => {
    // Get room ID from URL or generate a new one
    // Use a safe check for window to avoid SSR issues
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('room') || uuidv4();
    }
    return uuidv4(); // Default to new room ID during SSR
  });
  const [isInitiator, setIsInitiator] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  
  // Use our WebRTC hook
  const [webRTCState, webRTCControls] = useWebRTC(userId);
  
  // Update URL with room ID for sharing
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.replaceState({}, '', url.toString());
    
    // Check if we're the first one in the room (initiator)
    const checkInitiator = async () => {
      // In a real app, you would check with the server if the room exists
      // For now, we'll assume we're the initiator if we generated the room ID
      const isNewRoom = !new URLSearchParams(window.location.search).get('room');
      setIsInitiator(isNewRoom);
    };
    
    checkInitiator();
  }, [roomId]);
  
  // Join the room when component mounts
  useEffect(() => {
    if (roomId) {
      webRTCControls.joinRoom(roomId, isInitiator);
    }
    
    return () => {
      webRTCControls.leaveRoom();
    };
  }, [roomId, isInitiator, webRTCControls]);
  
  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && webRTCState.localStream) {
      localVideoRef.current.srcObject = webRTCState.localStream;
    }
    
    if (remoteVideoRef.current && webRTCState.remoteStream) {
      remoteVideoRef.current.srcObject = webRTCState.remoteStream;
    }
  }, [webRTCState.localStream, webRTCState.remoteStream]);
  
  // Handle mute/unmute
  const toggleAudio = () => {
    setIsMuted(!isMuted);
    webRTCControls.toggleAudio(!isMuted);
  };
  
  // Handle video on/off
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    webRTCControls.toggleVideo(!isVideoOff);
  };
  
  // Handle leaving the call
  const leaveCall = () => {
    webRTCControls.leaveRoom();
    window.location.href = "/";
  };
  
  // Copy room link to clipboard
  const copyRoomLink = () => {
    const url = new URL(window.location.href);
    navigator.clipboard.writeText(url.toString());
    alert("Room link copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Live Video Call</h1>
      
      {webRTCState.error ? (
        <p className="text-red-500 mb-4">{webRTCState.error}</p>
      ) : null}
      
      <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full max-w-5xl">
        {/* Local Video */}
        <div className="flex flex-col items-center">
          <span className="mb-2 text-sm text-gray-400">You</span>
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`rounded-lg shadow-lg w-full max-w-sm aspect-video object-cover border-2 border-red-500 ${isVideoOff ? 'bg-gray-800' : ''}`}
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center">
                <IconVideoOff className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Remote Video */}
        <div className="flex flex-col items-center">
          <span className="mb-2 text-sm text-gray-400">
            {webRTCState.isConnected ? 'Connected Peer' : 'Waiting for someone to join...'}
          </span>
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`rounded-lg shadow-lg w-full max-w-sm aspect-video object-cover border-2 border-blue-500 ${!webRTCState.remoteStream ? 'bg-gray-800' : ''}`}
            />
            {!webRTCState.remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400">Waiting for peer to connect...</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700'}`}
        >
          {isMuted ? (
            <IconMicrophoneOff className="h-6 w-6" />
          ) : (
            <IconMicrophone className="h-6 w-6" />
          )}
        </button>
        
        <button
          onClick={leaveCall}
          className="p-4 rounded-full bg-red-600"
        >
          <IconPhoneOff className="h-6 w-6" />
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-700'}`}
        >
          {isVideoOff ? (
            <IconVideoOff className="h-6 w-6" />
          ) : (
            <IconVideo className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Room Info */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 mb-2">Room ID: {roomId}</p>
        <button
          onClick={copyRoomLink}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
        >
          Copy Room Link
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;