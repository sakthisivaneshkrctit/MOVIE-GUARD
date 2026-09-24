import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, Camera, Scan, CheckCircle2, 
  AlertTriangle, Loader2, ArrowLeft, RefreshCw, Lock, Sparkles, UserCheck, ShieldAlert,
  Users, CreditCard, Shield, Check, UserX, Upload, Image as ImageIcon
} from 'lucide-react';
import { MediaItem, User, AppRoute, FaceVerificationResult } from '../types';
import { store } from '../services/store';
import { detectCanvasFacialFeatures, FacialFeatureDetection, getImageDataFromUrl, createSyntheticFaceDataUrl } from '../services/faceAnalysis';
import { getAllOfficialCitizens } from '../services/aadhaarUtils';

interface VerifyFaceProps {
  media: MediaItem | null;
  currentUser: User | null;
  onNavigate: (route: AppRoute, params?: any) => void;
  onVerificationComplete: (movieId: string, verified: boolean) => void;
}

export const VerifyFace: React.FC<VerifyFaceProps> = ({
  media,
  currentUser,
  onNavigate,
  onVerificationComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [statusText, setStatusText] = useState('Position your face in front of the camera for biometric verification');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationResult, setVerificationResult] = useState<FaceVerificationResult | null>(null);
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState<string | null>(null);

  const [realtimeFace, setRealtimeFace] = useState<FacialFeatureDetection>({
    hasValidFace: true,
    eyesDetected: true,
    noseDetected: true,
    mouthDetected: true,
    skinToneRatio: 25,
    avgBrightness: 120,
    variance: 25,
    edgeDensity: 8,
    reason: 'Face detected in camera.',
  });

  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(() => {});
      };
    }
  }, [stream]);

  // Real-time canvas overlay drawing for webcam
  useEffect(() => {
    let animId: number;
    let lastAnalyzeTime = 0;

    const drawFaceOverlay = (now: number) => {
      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const vw = video.videoWidth || video.clientWidth || 640;
        const vh = video.videoHeight || video.clientHeight || 480;

        if (canvas.width !== vw || canvas.height !== vh) {
          canvas.width = vw;
          canvas.height = vh;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const w = canvas.width;
          const h = canvas.height;

          const boxW = w * 0.50;
          const boxH = h * 0.62;
          const boxX = (w - boxW) / 2;
          const boxY = (h - boxH) / 2;

          if (now - lastAnalyzeTime > 250 && video.videoWidth > 0) {
            lastAnalyzeTime = now;
            try {
              const offCanvas = document.createElement('canvas');
              offCanvas.width = 128;
              offCanvas.height = 128;
              const offCtx = offCanvas.getContext('2d');
              if (offCtx) {
                offCtx.drawImage(video, 0, 0, 128, 128);
                const imgData = offCtx.getImageData(0, 0, 128, 128);
                const feat = detectCanvasFacialFeatures(imgData);
                setRealtimeFace(feat);
              }
            } catch (e) {
              // Ignore
            }
          }

          const hasFace = realtimeFace.hasValidFace;
          const color = hasFace ? '#10b981' : '#f59e0b';
          const glowColor = hasFace ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)';

          // Outer vignette
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(0, 0, w, h);

          // Clear center oval
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.ellipse(w / 2, h / 2, boxW * 0.48, boxH * 0.52, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Oval Alignment Reticle
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = hasFace ? 3 : 2;
          ctx.setLineDash(hasFace ? [10, 6] : [6, 6]);
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = hasFace ? 12 : 6;
          ctx.beginPath();
          ctx.ellipse(w / 2, h / 2, boxW * 0.48, boxH * 0.52, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          // Corner Precision Brackets
          ctx.save();
          ctx.strokeStyle = color;
          ctx.lineWidth = 3.5;
          const len = 26;

          // Top Left
          ctx.beginPath();
          ctx.moveTo(boxX, boxY + len); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + len, boxY);
          ctx.stroke();

          // Top Right
          ctx.beginPath();
          ctx.moveTo(boxX + boxW - len, boxY); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW, boxY + len);
          ctx.stroke();

          // Bottom Left
          ctx.beginPath();
          ctx.moveTo(boxX, boxY + boxH - len); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX + len, boxY + boxH);
          ctx.stroke();

          // Bottom Right
          ctx.beginPath();
          ctx.moveTo(boxX + boxW - len, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW, boxY + boxH - len);
          ctx.stroke();
          ctx.restore();
        }
      }
      animId = requestAnimationFrame(drawFaceOverlay);
    };

    animId = requestAnimationFrame(drawFaceOverlay);
    return () => cancelAnimationFrame(animId);
  }, [stream, isScanning, realtimeFace]);

  const startWebcam = async () => {
    setCameraError(null);
    setCameraStarting(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let mediaStream: MediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: false,
          });
        } catch (initialErr) {
          // Fallback to generic video constraints for standard laptop cameras
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      } else {
        setCameraError('Webcam access is not supported by your browser environment. Please ensure camera permissions are enabled.');
      }
    } catch (err: any) {
      console.warn('Webcam initialization error:', err);
      const isPermissionDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      if (isPermissionDenied) {
        setCameraError('Camera access was denied. Please click the lock/camera icon in your browser URL bar to grant camera permission, then click "Retry Camera".');
      } else {
        setCameraError('Camera unavailable or in use by another application. Click "Retry Camera" to re-initialize.');
      }
    } finally {
      setCameraStarting(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const captureCurrentWebcamFrame = (): string => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', 0.88);
        }
      }
    }
    return '';
  };

  // Core execution of biometric face recognition against logged-in user's template
  const executeBiometricVerification = (faceImageToVerify: string) => {
    if (!currentUser || !media) return;

    if (!faceImageToVerify) {
      setCameraError('Live webcam feed not ready. Please ensure your camera is turned on and position your face in the reticle.');
      return;
    }

    setCapturedFrame(faceImageToVerify);
    setIsScanning(true);
    setScanProgress(0);
    setStatusText('Step 1/3: Extracting 111-D biometric facial landmarks & Euclidean vectors...');

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      if (current === 40) setStatusText(`Step 2/3: Biometrically cross-matching against logged user (${currentUser.name}) registered face...`);
      if (current === 80) setStatusText(`Step 3/3: Evaluating Aadhaar fixed age against rating (${media.rating} ${media.minAge}+)...`);
      
      setScanProgress(Math.min(100, current));

      if (current >= 100) {
        clearInterval(interval);

        store.verifyFaceAsync(currentUser, faceImageToVerify, media).then((result) => {
          setIsScanning(false);
          setVerificationResult(result);

          if (result.verified) {
            // MATCH SUCCESS (Logged User Face Verified)
            setVerificationSuccess(true);
            setStatusText(`AUTHENTICATED: Logged User "${result.verifiedMemberName || currentUser.name}" (${result.verifiedAge || currentUser.age} Yrs - Adult 18+ Verified) • Match: ${result.matchScore}% — Access Granted!`);
            
            onVerificationComplete(media.id, true);

            setTimeout(() => {
              onNavigate('player', { movieId: media.id });
            }, 1000);
          } else {
            // MISMATCH OR AGE RESTRICTION FAILURE
            onNavigate('access-denied', {
              reason: result.verifiedMemberName && result.verifiedMemberName !== currentUser.name ? 'facemismatch' : (result.verifiedAge && result.verifiedAge < media.minAge ? 'age' : 'facemismatch'),
              customMessage: result.message,
              movieId: media.id,
            });
          }
        });
      }
    }, 200);
  };

  const handleStartWebcamScan = () => {
    const liveFrame = captureCurrentWebcamFrame();
    if (!liveFrame) {
      setCameraError('Webcam is not actively streaming frames. Please ensure your camera is turned on and centered.');
      return;
    }
    executeBiometricVerification(liveFrame);
  };

  const handleEnrollLiveFace = () => {
    const liveFrame = captureCurrentWebcamFrame();
    if (!liveFrame) {
      setCameraError('Unable to capture camera frame. Please ensure your webcam is actively displaying your face.');
      return;
    }
    if (!currentUser) return;
    store.updateUserPhoto(liveFrame);
    setEnrollSuccessMessage(`Biometric face template enrolled! Your live webcam face is now the ONLY authorized facial identity for logged-in user ${currentUser.name}.`);
    setTimeout(() => setEnrollSuccessMessage(null), 5000);
  };

  if (!media || !currentUser) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <p>Session or media not loaded.</p>
        <button onClick={() => onNavigate('movies')} className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer">
          Return to Library
        </button>
      </div>
    );
  }

  const allCandidates = [
    { name: currentUser.name, relation: 'Account Owner', age: currentUser.age, aadhaar: currentUser.aadhaarNumber || '2841 9382 7105', photo: currentUser.webcamPhotoUrl },
    ...(currentUser.familyMembers || []).map(fm => ({
      name: fm.name,
      relation: fm.relationship,
      age: fm.age,
      aadhaar: fm.aadhaarNumber,
      photo: fm.photoUrl,
    }))
  ];

  const officialCitizens = getAllOfficialCitizens();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      
      <button
        onClick={() => onNavigate('movie-details', { movieId: media.id })}
        className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Movie Details
      </button>

      {/* Main Verification Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto shadow-lg shadow-red-950/40">
            <Scan className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
            Aadhaar Facial Biometric Gate
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Target Title: <span className="text-white font-bold">{media.title}</span> • Min Age Required: <span className="text-red-400 font-bold">{media.minAge}+ ({media.rating})</span>
          </p>
        </div>

        {/* Strict Logged-In User Biometric Policy Banner */}
        <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Logged-In Face Lock Policy</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-950 text-red-300 border border-red-500/50 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> LOGGED USER ONLY
                </span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Active Account: <strong className="text-white">{currentUser.name}</strong> (Age: {currentUser.age} Yrs) — <strong className="text-amber-300">ONLY this registered face will unlock.</strong> All other household members & strangers will be strictly blocked.
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-zinc-400 hidden sm:block">
            <span className="text-red-400 font-bold">111-D Vector Strict</span>
          </div>
        </div>

        {/* Live Camera Viewport */}
        <div className="space-y-3">
          <div className="relative aspect-[4/3] bg-zinc-950 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-inner flex items-center justify-center">
            
            {verificationSuccess ? (
              <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center p-6 space-y-4 text-center z-30 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-2xl animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-white">ACCESS GRANTED</h3>
                  <p className="text-xs font-mono text-emerald-300">
                    Aadhaar Verified: {verificationResult?.verifiedMemberName || currentUser.name} ({verificationResult?.verifiedAge || currentUser.age} Yrs - FIXED)
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400">
                    UID: {verificationResult?.verifiedAadhaar || currentUser.aadhaarNumber} • Match Score: {verificationResult?.matchScore}%
                  </p>
                </div>
              </div>
            ) : isScanning ? (
              <div className="relative w-full h-full">
                {capturedFrame && (
                  <img src={capturedFrame} alt="Scanning face" className="w-full h-full object-cover" />
                )}
                {/* Scanning Overlay */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-4 text-center z-20">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-t-red-500 border-r-emerald-500 border-b-zinc-800 border-l-transparent animate-spin" />
                    <Scan className="w-8 h-8 text-emerald-400 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Aadhaar Facial Recognition Active</p>
                    <p className="text-xs text-zinc-300 font-mono animate-pulse">{statusText}</p>
                  </div>

                  <div className="w-full max-w-xs h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 via-amber-400 to-emerald-400 transition-all duration-200"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
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
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Camera Status & Troubleshooting Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${stream ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{stream ? 'Camera Live (Biometric Face Reticle Active)' : 'Camera Inactive'}</span>
            </div>
            <button
              type="button"
              onClick={startWebcam}
              disabled={cameraStarting}
              className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] underline cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${cameraStarting ? 'animate-spin' : ''}`} />
              <span>{stream ? 'Restart Camera' : 'Start Camera'}</span>
            </button>
          </div>
        </div>

        {cameraError && (
          <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-xs font-mono text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Camera Notice:</span>
            </div>
            <p className="text-[11px] leading-relaxed">{cameraError}</p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={startWebcam}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold cursor-pointer"
              >
                Retry Camera
              </button>
            </div>
          </div>
        )}

        {/* Quick Enroll / Update Face from Camera */}
        <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <img 
              src={currentUser.webcamPhotoUrl} 
              alt={currentUser.name} 
              className="w-9 h-9 rounded-xl object-cover border border-cyan-500/40 bg-zinc-900 shrink-0" 
            />
            <div>
              <p className="text-white font-bold">{currentUser.name} (Aadhaar Primary)</p>
              <p className="text-[11px] text-zinc-400">
                {currentUser.webcamPhotoUrl?.startsWith('data:image/jpeg') 
                  ? 'Live Webcam Template Enrolled' 
                  : 'Default Template (Click to save your live camera face)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEnrollLiveFace}
            disabled={!stream}
            className="w-full sm:w-auto px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-cyan-300 hover:text-white rounded-xl border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Enroll Live Face to Memory</span>
          </button>
        </div>

        {enrollSuccessMessage && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 font-mono flex items-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{enrollSuccessMessage}</span>
          </div>
        )}

        {/* Registered Household Aadhaar Biometric Registry Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Household Aadhaar Pool ({allCandidates.length} Registered)
            </span>
            <button
              onClick={() => onNavigate('profile')}
              className="text-red-400 hover:underline cursor-pointer text-[10px]"
            >
              + Manage Family Registry
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allCandidates.map((c, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl bg-zinc-950 border flex items-center gap-2 ${
                  c.age >= media.minAge ? 'border-zinc-800' : 'border-red-950/60 opacity-60'
                }`}
              >
                <img
                  src={c.photo}
                  alt={c.name}
                  className="w-8 h-8 rounded-lg object-cover border border-zinc-700 shrink-0"
                />
                <div className="overflow-hidden text-[10px] font-mono leading-tight">
                  <p className="text-white font-bold truncate">{c.name}</p>
                  <p className="text-zinc-400">{c.age} Yrs ({c.relation})</p>
                  <p className={`text-[9px] font-bold ${c.age >= media.minAge ? 'text-emerald-400' : 'text-red-400'}`}>
                    {c.age >= media.minAge ? '✓ Eligible' : '⛔ Under-Age (<18)'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Face Scan Verification Button */}
        <div className="space-y-3">
          <button
            disabled={isScanning || verificationSuccess}
            onClick={handleStartWebcamScan}
            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-900/40 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] cursor-pointer"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Scanning & Cross-Matching Aadhaar Biometrics...</span>
              </>
            ) : (
              <>
                <Scan className="w-5 h-5" />
                <span>Scan Live Camera Face to Unlock ({media.title})</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Simulation Testing for Official Citizens & Faces */}
        <div className="pt-3 border-t border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Policy Test Matrix (Logged Face Only vs All Other Faces):</span>
            <span className="text-[10px] text-amber-400 font-bold">Only Logged Face Unlocks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            
            {/* Sakthi Sivanesh (Logged User - Age 22, Adult) */}
            <button
              type="button"
              onClick={() => {
                const candidate = allCandidates.find(c => c.name.toLowerCase().includes('sakthi')) || allCandidates[0];
                executeBiometricVerification(candidate.photo);
              }}
              className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border-2 border-emerald-500/60 text-left font-mono text-[10px] transition-all cursor-pointer shadow-lg shadow-emerald-950/30"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white block truncate">Sakthi Sivanesh</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500 text-black">LOGGED USER</span>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold block mt-1">✓ WILL UNLOCK (Authorized Face)</span>
            </button>

            {/* Sangeshwaran (Age 24, Adult - But Not Logged User) */}
            <button
              type="button"
              onClick={() => {
                const candidate = allCandidates.find(c => c.name.toLowerCase().includes('sangesh')) || {
                  photo: createSyntheticFaceDataUrl('sangeshwaran')
                };
                executeBiometricVerification(candidate.photo);
              }}
              className="p-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/40 text-left font-mono text-[10px] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-300 block truncate">Sangeshwaran</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-zinc-800 text-zinc-400">Brother</span>
              </div>
              <span className="text-red-400 text-[9px] block mt-1">⛔ BLOCKED (Not Logged User)</span>
            </button>

            {/* Ratheesahan (Age 23, Adult - But Not Logged User) */}
            <button
              type="button"
              onClick={() => {
                const candidate = allCandidates.find(c => c.name.toLowerCase().includes('ratheesh')) || {
                  photo: createSyntheticFaceDataUrl('ratheesahan')
                };
                executeBiometricVerification(candidate.photo);
              }}
              className="p-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/40 text-left font-mono text-[10px] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-300 block truncate">Ratheesahan</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-zinc-800 text-zinc-400">Brother</span>
              </div>
              <span className="text-red-400 text-[9px] block mt-1">⛔ BLOCKED (Not Logged User)</span>
            </button>

            {/* Rithikraj (Age 15, Minor - Not Logged User & Minor) */}
            <button
              type="button"
              onClick={() => {
                const candidate = allCandidates.find(c => c.name.toLowerCase().includes('rithik')) || {
                  photo: createSyntheticFaceDataUrl('rithikraj')
                };
                executeBiometricVerification(candidate.photo);
              }}
              className="p-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-500/50 text-left font-mono text-[10px] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-300 block truncate">Rithikraj</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-zinc-800 text-red-300">Minor 15</span>
              </div>
              <span className="text-red-400 text-[9px] block mt-1">⛔ BLOCKED (Not Logged & Minor)</span>
            </button>

            {/* Karthik Raja (Age 26, Citizen - Not Logged User) */}
            <button
              type="button"
              onClick={() => {
                const candidate = allCandidates.find(c => c.name.toLowerCase().includes('karthik')) || {
                  photo: createSyntheticFaceDataUrl('karthikraja')
                };
                executeBiometricVerification(candidate.photo);
              }}
              className="p-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/40 text-left font-mono text-[10px] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-300 block truncate">Karthik Raja</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-zinc-800 text-zinc-400">Citizen</span>
              </div>
              <span className="text-red-400 text-[9px] block mt-1">⛔ BLOCKED (Not Logged User)</span>
            </button>

            {/* Test Stranger Face */}
            <button
              type="button"
              onClick={() => {
                const strangerPhoto = createSyntheticFaceDataUrl('unknown_intruder_9999');
                executeBiometricVerification(strangerPhoto);
              }}
              className="p-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/40 text-left font-mono text-[10px] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-300 block truncate">Stranger / Intruder</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-zinc-800 text-red-400">Unknown</span>
              </div>
              <span className="text-red-400 text-[9px] block mt-1">⛔ BLOCKED (Biometric Mismatch)</span>
            </button>

          </div>
        </div>

        {cameraError && (
          <p className="text-xs text-amber-400/90 text-center font-mono">
            {cameraError}
          </p>
        )}

      </div>
    </div>
  );
};
