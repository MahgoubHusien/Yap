// ProfilePhotoInput.tsx
import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface ProfilePhotoInputProps {
  previewUrl: string | null;
  onPhotoSelect: (file: File) => void;
  onClear: () => void;
}

const ProfilePhotoInput = ({ previewUrl, onPhotoSelect, onClear }: ProfilePhotoInputProps) => {
  const [showCameraModal, setShowCameraModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Handle file selection from device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoSelect(file);
    }
  };

  // Open file browser dialog
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // Open camera modal
  const handleOpenCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setShowCameraModal(true);
      
      // Wait for modal to appear before setting video source
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please make sure you have granted camera permissions.');
    }
  };

  // Close camera modal and clean up
  const handleCloseCamera = () => {
    setShowCameraModal(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Take photo from camera
  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to file
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            onPhotoSelect(file);
            handleCloseCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {/* Photo preview or placeholder */}
      <div className="relative mb-4">
        {previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Profile preview" 
              className="w-32 h-32 rounded-full object-cover"
            />
            <button
              type="button"
              onClick={onClear}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
              aria-label="Remove photo"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-5xl">?</span>
          </div>
        )}
      </div>
      
      {/* Photo upload options */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleOpenCamera}
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
        >
          <Camera size={18} />
          <span>Camera</span>
        </button>
        
        <button
          type="button"
          onClick={handleSelectFile}
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
        >
          <Upload size={18} />
          <span>Upload</span>
        </button>
      </div>
      
      {/* Camera modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white p-4 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-2">Take a Photo</h3>
            
            <div className="relative bg-black rounded overflow-hidden mb-4">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                className="w-full"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleCloseCamera}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleTakePhoto}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Take Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoInput;