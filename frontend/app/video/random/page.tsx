'use client';

import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { useRouter } from "next/navigation";

const RandomVideoChat = () => {
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<string>("waiting");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [peerConnection, setPeerConnection] = useState<SimplePeer.Instance | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Initialize WebSocket connection and media stream
  useEffect(() => {
    // Connect to random match WebSocket server
    wsRef.current = new WebSocket('ws://localhost:8080/random-match');
    
    wsRef.current.onopen = () => {
      console.log('Connected to signaling server');
      // Start looking for a random match
      findRandomMatch();
    };
    
    wsRef.current.onmessage = (event) => {
      handleSignalingMessage(event.data);
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Please try again.');
    };
    
    // Initialize camera and microphone
    startMedia();
    
    // Cleanup on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      if (peerConnection) {
        peerConnection.destroy();
      }
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Start local media (camera and microphone)
  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Media error:", err);
      setError("Failed to access camera or microphone. Please check permissions.");
    }
  };
  
  // Find a random chat partner
  const findRandomMatch = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to server. Please refresh the page.");
      return;
    }
    
    setStatus("searching");
    
    // Generate a truly unique user ID with timestamp and random component
    // This ensures uniqueness even when multiple browser windows are used on the same device
    const timestamp = new Date().getTime();
    const randomComponent = Math.floor(Math.random() * 1000000);
    const userId = `user_${timestamp}_${randomComponent}`;
    
    // Send a message to join the random matching pool
    const message = {
      type: "findMatch",
      userId: userId
    };
    
    wsRef.current.send(JSON.stringify(message));
  };
  
  // Handle incoming signaling messages
  const handleSignalingMessage = (data: string) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case "matched":
          // We've been matched with another user
          setStatus("connected");
          initializePeerConnection(message.isInitiator, message.roomId, message.userId);
          break;
          
        case "offer":
          if (peerConnection) {
            peerConnection.signal(message.signal);
          }
          break;
          
        case "answer":
          if (peerConnection) {
            peerConnection.signal(message.signal);
          }
          break;
          
        case "candidate":
          if (peerConnection) {
            peerConnection.signal(message.candidate);
          }
          break;
          
        case "peerDisconnected":
          handlePeerDisconnect();
          break;
          
        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (err) {
      console.error("Error parsing signaling message:", err);
    }
  };
  
  // Initialize WebRTC peer connection
  const initializePeerConnection = (isInitiator: boolean, roomId: string, userId: string) => {
    if (!localStream) {
      setError("Local media not available");
      return;
    }
    
    // Create a new peer connection
    const peer = new SimplePeer({
      initiator: isInitiator,
      stream: localStream,
      trickle: true
    });
    
    // Handle peer events
    peer.on('signal', (data) => {
      // Send signaling data to the other peer
      const signalMessage = {
        type: isInitiator ? "offer" : "answer",
        signal: data,
        roomId: roomId,
        userId: userId
      };
      
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify(signalMessage));
      }
    });
    
    peer.on('stream', (stream) => {
      // Got remote stream
      setRemoteStream(stream);
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });
    
    peer.on('error', (err) => {
      console.error('Peer connection error:', err);
      setError("Connection error. Please try again.");
    });
    
    peer.on('close', () => {
      handlePeerDisconnect();
    });
    
    setPeerConnection(peer);
  };
  
  // Handle peer disconnection
  const handlePeerDisconnect = () => {
    setStatus("disconnected");
    
    if (peerConnection) {
      peerConnection.destroy();
      setPeerConnection(null);
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setRemoteStream(null);
  };
  
  // Find a new random match
  const findNewMatch = () => {
    handlePeerDisconnect();
    findRandomMatch();
  };
  
  // Toggle microphone
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };
  
  // Toggle camera
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };
  
  // End the call and go back to home
  const endCall = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    if (peerConnection) {
      peerConnection.destroy();
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Random Video Chat</h1>
      
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
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
              className={`rounded-lg shadow-lg w-full max-w-sm aspect-video object-cover border-2 ${isVideoOff ? 'border-gray-500 opacity-50' : 'border-red-500'}`}
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white bg-black bg-opacity-50 px-2 py-1 rounded">Camera Off</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Remote Video */}
        <div className="flex flex-col items-center">
          <span className="mb-2 text-sm text-gray-400">
            {status === "waiting" && "Waiting..."}
            {status === "searching" && "Searching for someone..."}
            {status === "connected" && "Stranger"}
            {status === "disconnected" && "Disconnected"}
          </span>
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`rounded-lg shadow-lg w-full max-w-sm aspect-video object-cover border-2 ${status !== "connected" ? 'border-gray-500' : 'border-blue-500'}`}
            />
            {status !== "connected" && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 rounded-lg">
                {status === "waiting" && <span>Initializing...</span>}
                {status === "searching" && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                    <span>Looking for someone to chat with...</span>
                  </div>
                )}
                {status === "disconnected" && <span>Stranger disconnected</span>}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <button
          onClick={toggleMute}
          className={`px-4 py-2 rounded-full flex items-center gap-2 ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            {isMuted ? (
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            )}
          </svg>
          {isMuted ? "Unmute" : "Mute"}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`px-4 py-2 rounded-full flex items-center gap-2 ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            {isVideoOff ? (
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-8h1V5h-1v2zm0 4h1V9h-1v2zM9 13h2v2H9v-2zm6 0h1v2h-1v-2zM9 9h2v2H9V9z" />
            ) : (
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            )}
          </svg>
          {isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
        </button>
        
        {status === "connected" && (
          <button
            onClick={findNewMatch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Next Person
          </button>
        )}
        
        {status === "disconnected" && (
          <button
            onClick={findNewMatch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Find Someone New
          </button>
        )}
        
        <button
          onClick={endCall}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          End Call
        </button>
      </div>
    </div>
  );
};

export default RandomVideoChat;