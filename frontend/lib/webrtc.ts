'use client';

/**
 * WebRTC Service for handling peer-to-peer video connections
 * This service manages WebRTC connections, ICE candidates, and signaling
 */

type PeerConnectionState = {
  connection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isInitiator: boolean;
  roomId: string | null;
  userId: string;
};

type SignalingMessage = {
  type: 'offer' | 'answer' | 'candidate' | 'leave' | 'join';
  roomId?: string;
  userId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

export class WebRTCService {
  private socket: WebSocket | null = null;
  private state: PeerConnectionState;
  private onStateChangeCallback: ((state: Partial<PeerConnectionState>) => void) | null = null;
  
  // STUN servers for NAT traversal
  private readonly rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  };

  constructor(userId: string) {
    this.state = {
      connection: null,
      localStream: null,
      remoteStream: null,
      isInitiator: false,
      roomId: null,
      userId,
    };
  }

  /**
   * Initialize WebSocket connection for signaling
   */
  public initSignaling(): void {
    // Determine if we're using HTTPS by checking the protocol
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    
    // Use secure WebSocket (wss://) if we're on HTTPS, otherwise use ws://
    const protocol = isSecure ? 'wss://' : 'ws://';
    const host = process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost:8080';
    const backendUrl = host.startsWith('ws://') || host.startsWith('wss://') ? host : `${protocol}${host.replace(/^https?:\/\//, '')}`;
    
    this.socket = new WebSocket(`${backendUrl}/rtc`);
    
    this.socket.onopen = () => {
      console.log('WebRTC signaling connection established');
    };
    
    this.socket.onmessage = (event) => {
      try {
        const message: SignalingMessage = JSON.parse(event.data);
        this.handleSignalingMessage(message);
      } catch (error) {
        console.error('Error parsing signaling message:', error);
      }
    };
    
    this.socket.onerror = (error) => {
      console.error('WebRTC signaling error:', error);
    };
    
    this.socket.onclose = () => {
      console.log('WebRTC signaling connection closed');
    };
  }

  /**
   * Handle incoming signaling messages
   */
  private handleSignalingMessage(message: SignalingMessage): void {
    if (!this.state.connection) return;
    
    switch (message.type) {
      case 'offer':
        if (!this.state.isInitiator && message.sdp) {
          this.handleRemoteOffer(message.sdp);
        }
        break;
        
      case 'answer':
        if (this.state.isInitiator && message.sdp) {
          this.handleRemoteAnswer(message.sdp);
        }
        break;
        
      case 'candidate':
        if (message.candidate) {
          this.handleRemoteIceCandidate(message.candidate);
        }
        break;
        
      case 'join':
        if (message.roomId === this.state.roomId && this.state.isInitiator) {
          // Someone joined our room, initiate the connection
          this.createOffer();
        }
        break;
        
      case 'leave':
        if (message.roomId === this.state.roomId) {
          this.handlePeerDisconnection();
        }
        break;
    }
  }

  /**
   * Initialize local media stream
   */
  public async initLocalStream(videoEnabled: boolean = true, audioEnabled: boolean = true): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled,
      });
      
      this.state.localStream = stream;
      this.updateState({ localStream: stream });
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  /**
   * Create or join a room
   */
  public joinRoom(roomId: string, isInitiator: boolean = false): void {
    this.state.roomId = roomId;
    this.state.isInitiator = isInitiator;
    this.updateState({ roomId, isInitiator });
    
    // Create RTCPeerConnection
    this.createPeerConnection();
    
    // Send join message to signaling server
    this.sendSignalingMessage({
      type: 'join',
      roomId,
      userId: this.state.userId,
    });
  }

  /**
   * Create RTCPeerConnection and set up event handlers
   */
  private createPeerConnection(): void {
    if (this.state.connection) {
      this.state.connection.close();
    }
    
    const peerConnection = new RTCPeerConnection(this.rtcConfig);
    this.state.connection = peerConnection;
    
    // Add local stream tracks to the connection
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => {
        if (this.state.localStream && this.state.connection) {
          this.state.connection.addTrack(track, this.state.localStream);
        }
      });
    }
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'candidate',
          roomId: this.state.roomId || undefined,
          userId: this.state.userId,
          candidate: event.candidate.toJSON(),
        });
      }
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
    };
    
    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
      
      if (peerConnection.iceConnectionState === 'disconnected' || 
          peerConnection.iceConnectionState === 'failed' || 
          peerConnection.iceConnectionState === 'closed') {
        this.handlePeerDisconnection();
      }
    };
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const remoteStream = new MediaStream();
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
      
      this.state.remoteStream = remoteStream;
      this.updateState({ remoteStream });
    };
  }

  /**
   * Create and send an offer to the peer
   */
  private async createOffer(): Promise<void> {
    if (!this.state.connection) return;
    
    try {
      const offer = await this.state.connection.createOffer();
      await this.state.connection.setLocalDescription(offer);
      
      this.sendSignalingMessage({
        type: 'offer',
        roomId: this.state.roomId || undefined,
        userId: this.state.userId,
        sdp: this.state.connection.localDescription?.toJSON() || undefined,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  /**
   * Handle a remote offer and create an answer
   */
  private async handleRemoteOffer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.state.connection) return;
    
    try {
      await this.state.connection.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await this.state.connection.createAnswer();
      await this.state.connection.setLocalDescription(answer);
      
      this.sendSignalingMessage({
        type: 'answer',
        roomId: this.state.roomId || undefined,
        userId: this.state.userId,
        sdp: this.state.connection.localDescription?.toJSON() || undefined,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  /**
   * Handle a remote answer
   */
  private async handleRemoteAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.state.connection) return;
    
    try {
      await this.state.connection.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  /**
   * Handle a remote ICE candidate
   */
  private async handleRemoteIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.state.connection) return;
    
    try {
      await this.state.connection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  /**
   * Handle peer disconnection
   */
  private handlePeerDisconnection(): void {
    this.state.remoteStream = null;
    this.updateState({ remoteStream: null });
    
    // Recreate peer connection if we're still in the room
    if (this.state.roomId) {
      this.createPeerConnection();
    }
  }

  /**
   * Send a signaling message through the WebSocket
   */
  private sendSignalingMessage(message: SignalingMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Leave the current room
   */
  public leaveRoom(): void {
    if (this.state.roomId) {
      this.sendSignalingMessage({
        type: 'leave',
        roomId: this.state.roomId,
        userId: this.state.userId,
      });
    }
    
    if (this.state.connection) {
      this.state.connection.close();
      this.state.connection = null;
    }
    
    this.state.remoteStream = null;
    this.state.roomId = null;
    this.state.isInitiator = false;
    
    this.updateState({
      connection: null,
      remoteStream: null,
      roomId: null,
      isInitiator: false,
    });
  }

  /**
   * Stop local media stream
   */
  public stopLocalStream(): void {
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => track.stop());
      this.state.localStream = null;
      this.updateState({ localStream: null });
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.leaveRoom();
    this.stopLocalStream();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Set callback for state changes
   */
  public onStateChange(callback: (state: Partial<PeerConnectionState>) => void): void {
    this.onStateChangeCallback = callback;
  }

  /**
   * Update state and trigger callback
   */
  private updateState(newState: Partial<PeerConnectionState>): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(newState);
    }
  }

  /**
   * Toggle local audio
   */
  public toggleAudio(enabled: boolean): void {
    if (this.state.localStream) {
      this.state.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle local video
   */
  public toggleVideo(enabled: boolean): void {
    if (this.state.localStream) {
      this.state.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }
}

// Singleton instance for easy access
let webRTCInstance: WebRTCService | null = null;

export const getWebRTCService = (userId: string): WebRTCService => {
  if (!webRTCInstance) {
    webRTCInstance = new WebRTCService(userId);
  }
  return webRTCInstance;
};