'use client';

import React, { useEffect, useRef, useState } from "react";

const VideoCall = () => {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        setLocalStream(stream);

        if (localRef.current) localRef.current.srcObject = stream;

        // Simulated remote stream for now
        if (remoteRef.current) remoteRef.current.srcObject = stream;

      } catch (err) {
        console.error("Webcam error:", err);
        setError("Failed to access webcam. Please allow camera permissions.");
      }
    };

    startWebcam();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Live Video Call</h1>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full max-w-5xl">
          {/* Local Video */}
          <div className="flex flex-col items-center">
            <span className="mb-2 text-sm text-gray-400">You</span>
            <video
              ref={localRef}
              autoPlay
              playsInline
              muted
              className="rounded-lg shadow-lg w-full max-w-sm aspect-video object-cover border-2 border-red-500"
            />
          </div>

          {/* Remote Video */}
          <div className="flex flex-col items-center">
            <span className="mb-2 text-sm text-gray-400">Stranger</span>
            <video
              ref={remoteRef}
              autoPlay
              playsInline
              className="rounded-lg shadow-lg w-full max-w-sm aspect-video object-cover border-2 border-blue-500"
            />
          </div>
        </div>
      )}

      <button
        onClick={() => window.location.href = "/topics"}
        className="mt-10 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
      >
        Leave Call
      </button>
    </div>
  );
};

export default VideoCall;
