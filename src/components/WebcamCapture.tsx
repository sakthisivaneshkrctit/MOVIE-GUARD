import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, Scan, ShieldCheck } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (dataUrl: string) => void;
  capturedPhotoUrl?: string;
  label?: string;
  autoStart?: boolean;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onCapture,
  capturedPhotoUrl,
  label = 'Capture Face Template',
  autoStart = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(capturedPhotoUrl || null);

  useEffect(() => {
    if (autoStart && !photo) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [autoStart]);

  useEffect(() => {
    if (!stream || photo) return;
    let animId: number;

    const drawOverlay = () => {
      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;
      if (video && canvas && video.readyState === 4) {
        canvas.width = video.clientWidth || 320;
        canvas.height = video.clientHeight || 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const w = canvas.width;
          const h = canvas.height;
          const cx = w / 2;
          const cy = h / 2;

          // Pulse oval ring
          const t = Date.now() * 0.003;
          const rX = w * 0.28 + Math.sin(t) * 2;
          const rY = h * 0.36 + Math.cos(t) * 2;

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.ellipse(cx, cy, rX, rY, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Facial landmarks
          ctx.fillStyle = '#10b981';
          ctx.beginPath(); ctx.arc(cx - rX * 0.4, cy - rY * 0.2, 3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + rX * 0.4, cy - rY * 0.2, 3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx, cy + rY * 0.1, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx - rX * 0.25, cy + rY * 0.45, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + rX * 0.25, cy + rY * 0.45, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      animId = requestAnimationFrame(drawOverlay);
    };

    drawOverlay();
    return () => cancelAnimationFrame(animId);
  }, [stream, photo]);

  const startCamera = async () => {
    setError(null);
    setIsCapturing(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Webcam access error:', err);
      setError('Webcam unavailable or permission denied. You can use simulated photo capture.');
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const takeSnap = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhoto(dataUrl);
        onCapture(dataUrl);
        stopCamera();
      }
    } else {
      // Fallback simulated capture
      useDemoSnapshot();
    }
  };

  const useDemoSnapshot = () => {
    // Demo snapshot
    const demoPhotos = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
    ];
    const selected = demoPhotos[Math.floor(Math.random() * demoPhotos.length)];
    setPhoto(selected);
    onCapture(selected);
    stopCamera();
  };

  const retake = () => {
    setPhoto(null);
    startCamera();
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
      <div className="relative w-full aspect-[4/3] bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
        
        {/* Render Captured Photo */}
        {photo ? (
          <div className="relative w-full h-full">
            <img src={photo} alt="Captured Face" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[11px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Template Ready
            </div>
          </div>
        ) : isCapturing && !error ? (
          /* Render Live Camera Video */
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 border-2 border-red-500/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-red-500 rounded-full border-dashed animate-spin-slow opacity-80" />
              <div className="absolute w-44 h-44 rounded-full border border-emerald-400/60 flex items-center justify-center">
                <Scan className="w-8 h-8 text-red-500/80 animate-pulse" />
              </div>
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur text-red-400 font-mono text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-red-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Position face within oval
            </div>
          </div>
        ) : (
          /* Fallback Error / Default State */
          <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
            <Camera className="w-10 h-10 text-zinc-500" />
            <p className="text-xs text-zinc-400 max-w-xs">{error || 'Click start camera to capture your facial biometric profile.'}</p>
            <button
              type="button"
              onClick={useDemoSnapshot}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded-lg border border-zinc-700"
            >
              Use Demo Face Photo
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 w-full">
        {photo ? (
          <button
            type="button"
            onClick={retake}
            className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-take Photo
          </button>
        ) : (
          <>
            {stream ? (
              <button
                type="button"
                onClick={takeSnap}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-red-900/30 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Capture Photo
              </button>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-zinc-700"
              >
                <Camera className="w-4 h-4" />
                Start Camera
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
