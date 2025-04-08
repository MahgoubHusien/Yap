import React, { useEffect, useRef } from 'react';

export default function WebSocketComponent() {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Determine if we're using HTTPS by checking the protocol
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    
    // Use secure WebSocket (wss://) if we're on HTTPS, otherwise use ws://
    const protocol = isSecure ? 'wss://' : 'ws://';
    const host = process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost:8080';
    const backendUrl = host.startsWith('ws://') || host.startsWith('wss://') ? host : `${protocol}${host.replace(/^https?:\/\//, '')}`;
    
    wsRef.current = new WebSocket(`${backendUrl}/ws`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected!');
    };

    wsRef.current.onmessage = (event) => {
      console.log('Message from server:', event.data);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div style={{ marginTop: '1rem' }}>
      <h2>WebSocket Connection</h2>
    </div>
  );
}
