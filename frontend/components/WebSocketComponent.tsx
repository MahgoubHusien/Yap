import React, { useEffect, useRef } from 'react';

export default function WebSocketComponent() {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to backend WebSocket endpoint
    // Adjust "ws://localhost:8080" if your backend is deployed elsewhere
    wsRef.current = new WebSocket('ws://localhost:8080/ws');

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
