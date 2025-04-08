'use client';

import { useState, useEffect, useRef } from 'react';
import { WebRTCService, getWebRTCService } from '../webrtc';

type WebRTCState = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isInitiator: boolean;
  roomId: string | null;
  error: string | null;
};

type WebRTCControls = {
  joinRoom: (roomId: string, isInitiator?: boolean) => void;
  leaveRoom: () => void;
  toggleAudio: (enabled: boolean) => void;
  toggleVideo: (enabled: boolean) => void;
};

/**
 * React hook for using WebRTC in components
 */
export function useWebRTC(userId: string): [WebRTCState, WebRTCControls] {
  const webRTCRef = useRef<WebRTCService | null>(null);
  const [state, setState] = useState<WebRTCState>({
    localStream: null,
    remoteStream: null,
    isConnected: false,
    isInitiator: false,
    roomId: null,
    error: null,
  });

  // Initialize WebRTC service
  useEffect(() => {
    const webRTC = getWebRTCService(userId);
    webRTCRef.current = webRTC;
    
    // Initialize signaling
    webRTC.initSignaling();
    
    // Set up state change handler
    webRTC.onStateChange((newState) => {
      setState(prevState => ({
        ...prevState,
        localStream: newState.localStream ?? prevState.localStream,
        remoteStream: newState.remoteStream ?? prevState.remoteStream,
        isInitiator: newState.isInitiator ?? prevState.isInitiator,
        roomId: newState.roomId ?? prevState.roomId,
        isConnected: !!newState.remoteStream,
      }));
    });
    
    // Initialize local stream
    initLocalStream();
    
    // Cleanup on unmount
    return () => {
      if (webRTCRef.current) {
        webRTCRef.current.cleanup();
      }
    };
  }, [userId]);

  // Initialize local media stream
  const initLocalStream = async () => {
    if (!webRTCRef.current) return;
    
    try {
      await webRTCRef.current.initLocalStream(true, true);
    } catch (error) {
      console.error('Error initializing local stream:', error);
      setState(prevState => ({
        ...prevState,
        error: 'Failed to access camera or microphone. Please check permissions.',
      }));
    }
  };

  // Join a room
  const joinRoom = (roomId: string, isInitiator: boolean = false) => {
    if (!webRTCRef.current) return;
    
    try {
      webRTCRef.current.joinRoom(roomId, isInitiator);
    } catch (error) {
      console.error('Error joining room:', error);
      setState(prevState => ({
        ...prevState,
        error: 'Failed to join room. Please try again.',
      }));
    }
  };

  // Leave the current room
  const leaveRoom = () => {
    if (!webRTCRef.current) return;
    webRTCRef.current.leaveRoom();
  };

  // Toggle audio
  const toggleAudio = (enabled: boolean) => {
    if (!webRTCRef.current) return;
    webRTCRef.current.toggleAudio(enabled);
  };

  // Toggle video
  const toggleVideo = (enabled: boolean) => {
    if (!webRTCRef.current) return;
    webRTCRef.current.toggleVideo(enabled);
  };

  const controls: WebRTCControls = {
    joinRoom,
    leaveRoom,
    toggleAudio,
    toggleVideo,
  };

  return [state, controls];
}