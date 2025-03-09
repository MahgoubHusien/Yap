"use client";

import React, { useEffect, useRef, useState } from "react";

const VideoCall = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false, // Set to true if you also want audio
        });
        setStream(userStream);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }
      } catch (err) {
        setError("Failed to access webcam. Please allow camera permissions.");
        console.error("Webcam error:", err);
      }
    };

    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop()); // Stop the webcam when leaving
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Live Video Call</h1>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="rounded-lg shadow-lg w-full max-w-lg"
        />
      )}

      <button 
        onClick={() => window.location.href = "/topics"}
        className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
      >
        Leave Call
      </button>
    </div>
  );
};

export default VideoCall;
