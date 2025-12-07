
import React, { useState, useRef, useEffect } from 'react';
import { Experience } from './components/Experience';
import { AppMode } from './types';
import { Sparkles, Volume2, VolumeX, Hand, AlertCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TREE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Warm, peaceful Christmas instrumental (Silent Night by Kevin MacLeod)
  // Source: Wikimedia Commons (Creative Commons)
  const MUSIC_URL = "https://upload.wikimedia.org/wikipedia/commons/2/22/Silent_Night_Kevin_MacLeod.ogg";

  const toggleMode = () => {
    setMode((prev) => (prev === AppMode.TREE ? AppMode.SCATTERED : AppMode.TREE));
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      setIsPlaying(true);
    }
  };

  // Optional: Try to play gently on mount if allowed (usually blocked, but we try)
  // or just wait for user interaction.
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = 0.4; // Soft background volume
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Music */}
      <audio ref={audioRef} src={MUSIC_URL} loop crossOrigin="anonymous" />

      {/* 3D Scene Layer */}
      <Experience 
        mode={mode} 
        setMode={setMode} 
        onStatusChange={setCameraStatus}
      />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8">
        
        {/* Header - Moved to Top Left */}
        <header className="flex flex-col items-start mt-4 space-y-2 pointer-events-auto max-w-[50%]">
          <div className="text-2xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#B8860B] tracking-wider drop-shadow-lg text-left">
            <span className="block">Merry Christmas</span>
            <span className="block text-xl md:text-3xl mt-2">-MOZ EVERGREEN</span>
          </div>
          <p className="text-[#DAA520] tracking-[0.3em] text-[10px] md:text-xs font-light uppercase text-left pl-1">
            2025.12.25 Ruby
          </p>
          <p className="text-white/50 text-[10px] mt-2 font-sans max-w-xs pl-1 hidden md:block">
            Control with your hand: Open palm to Scatter, Fist to Gather. Move hand to Rotate.
          </p>
        </header>

        {/* Footer Controls */}
        <footer className="mb-8 w-full flex items-center justify-center relative pointer-events-auto">
          
          {/* Center Main Button */}
          <button
            onClick={toggleMode}
            className={`
              group relative px-8 py-4 rounded-full 
              bg-gradient-to-r from-[#004225] to-[#002211] 
              border border-[#FFD700]/30 hover:border-[#FFD700] 
              transition-all duration-500 ease-out 
              shadow-[0_0_20px_rgba(0,0,0,0.5)]
              hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]
            `}
          >
            <div className="flex items-center space-x-3">
              <Sparkles 
                className={`w-5 h-5 text-[#FFD700] transition-transform duration-700 ${mode === AppMode.SCATTERED ? 'rotate-180 scale-125' : ''}`} 
              />
              <span className="font-serif text-[#F0E68C] tracking-widest uppercase text-sm">
                {mode === AppMode.TREE ? 'Disperse Magic' : 'Summon Tree'}
              </span>
            </div>
            {/* Inner Glow Helper */}
            <div className="absolute inset-0 rounded-full bg-[#FFD700] opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-md"></div>
          </button>

          {/* Right Side Controls Group */}
          <div className="absolute right-0 flex items-center space-x-3">
             {/* Camera Status Indicator */}
             <div 
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border bg-black/40 backdrop-blur-sm transition-colors
                  ${cameraStatus === 'active' ? 'border-green-500/50 text-green-400' : 
                    cameraStatus === 'error' ? 'border-red-500/50 text-red-400' : 
                    'border-yellow-500/30 text-yellow-200/70'}
                `}
             >
                {cameraStatus === 'loading' && <Loader2 className="w-3 h-3 animate-spin" />}
                {cameraStatus === 'active' && <Hand className="w-3 h-3" />}
                {cameraStatus === 'error' && <AlertCircle className="w-3 h-3" />}
                
                <span className="text-[10px] uppercase tracking-wider font-medium hidden md:inline-block">
                  {cameraStatus === 'loading' && "Initializing..."}
                  {cameraStatus === 'active' && "Tracking Active"}
                  {cameraStatus === 'error' && "Camera Denied"}
                </span>
             </div>

            {/* Music Toggle */}
            <button 
                onClick={toggleMusic}
                className="p-3 rounded-full bg-black/20 border border-white/10 hover:bg-black/40 hover:border-[#FFD700]/50 transition-all text-[#FFD700]"
                title={isPlaying ? "Mute Music" : "Play Music"}
            >
                {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-70" />}
            </button>
          </div>

        </footer>
      </div>
    </div>
  );
};

export default App;
