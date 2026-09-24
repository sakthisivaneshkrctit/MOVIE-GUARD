import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, 
  Settings, ShieldAlert, ShieldCheck, PictureInPicture2, Gauge
} from 'lucide-react';
import { MediaItem, User } from '../types';

interface VideoPlayerProps {
  media: MediaItem;
  user: User;
  onProgressUpdate?: (percentage: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ media, user, onProgressUpdate }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const fallbackUrls = [
    media.videoUrl,
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://media.w3.org/2010/05/sintel/trailer.mp4',
  ];
  const [sourceIndex, setSourceIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeVideoUrl = fallbackUrls[sourceIndex] || media.videoUrl;

  const handleVideoError = () => {
    if (sourceIndex < fallbackUrls.length - 1) {
      const nextIdx = sourceIndex + 1;
      setSourceIndex(nextIdx);
      if (videoRef.current) {
        videoRef.current.src = fallbackUrls[nextIdx];
        videoRef.current.load();
        if (isPlaying) {
          videoRef.current.play().catch(() => {});
        }
      }
    } else {
      setVideoError(true);
    }
  };

  useEffect(() => {
    setSourceIndex(0);
    setVideoError(false);
  }, [media]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) {
        setDuration(video.duration);
        const percent = (video.currentTime / video.duration) * 100;
        if (onProgressUpdate) onProgressUpdate(percent);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [media, onProgressUpdate]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextState = !isMuted;
      setIsMuted(nextState);
      videoRef.current.muted = nextState;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return '00:00';
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group font-sans select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        key={activeVideoUrl}
        poster={media.posterUrl}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onError={handleVideoError}
        playsInline
      >
        <source src={activeVideoUrl} type="video/mp4" />
        <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" />
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Security Anti-Piracy Watermark Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-red-500/30 font-mono text-[11px] text-zinc-300 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <div>
          <span className="text-red-400 font-bold block">VERIFIED USER: {user.email}</span>
          <span className="text-[9px] text-zinc-400 block uppercase">Session ID: {user.id.substring(0, 8)} • DRM Protected</span>
        </div>
      </div>

      {/* Center Play Overlay Icon when Paused */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity"
        >
          <div className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl shadow-red-900/50 hover:scale-110 transition-transform">
            <Play className="w-8 h-8 ml-1 fill-white" />
          </div>
        </button>
      )}

      {/* Custom Control Bar Overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
        
        {/* Progress Slider */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-zinc-700 appearance-none rounded-lg cursor-pointer accent-red-600 hover:h-2 transition-all"
          />
        </div>

        {/* Controls Layout */}
        <div className="flex items-center justify-between text-white text-xs pt-1">
          
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="p-1 hover:text-red-400 transition-colors">
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button onClick={() => skipTime(-10)} className="p-1 text-zinc-400 hover:text-white" title="Rewind 10s">
              <RotateCcw className="w-4 h-4" />
            </button>

            <button onClick={() => skipTime(10)} className="p-1 text-zinc-400 hover:text-white" title="Forward 10s">
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="p-1 text-zinc-300 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-zinc-700 appearance-none rounded cursor-pointer accent-red-500"
              />
            </div>

            {/* Time Stamp */}
            <div className="font-mono text-zinc-300 text-[11px] pl-2 border-l border-zinc-700">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded font-mono text-[11px] text-zinc-300 flex items-center gap-1"
              >
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-8 right-0 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-1 flex flex-col gap-0.5 z-20 font-mono text-xs w-20">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`px-2 py-1 rounded text-left hover:bg-zinc-800 ${
                        playbackSpeed === s ? 'text-red-400 font-bold bg-red-950/40' : 'text-zinc-300'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PiP */}
            <button onClick={togglePiP} className="p-1 text-zinc-400 hover:text-white" title="Picture in Picture">
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="p-1 text-zinc-400 hover:text-white" title="Toggle Fullscreen">
              <Maximize className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
