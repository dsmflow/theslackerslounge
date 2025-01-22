import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaForward, FaBackward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

// Radio stations playlist
const initialPlaylist = [
  {
    id: 1,
    title: "Soma FM - Groove Salad",
    artist: "Electronic/Ambient",
    url: "https://ice1.somafm.com/groovesalad-128-mp3",
    isStream: true
  },
  {
    id: 2,
    title: "Soma FM - Space Station",
    artist: "Space Music",
    url: "https://ice1.somafm.com/spacestation-128-mp3",
    isStream: true
  },
  {
    id: 3,
    title: "Soma FM - Drone Zone",
    artist: "Atmospheric Ambient",
    url: "https://ice1.somafm.com/dronezone-128-mp3",
    isStream: true
  },
  {
    id: 4,
    title: "Soma FM - DEF CON",
    artist: "Dark Electronica",
    url: "https://ice1.somafm.com/defcon-128-mp3",
    isStream: true
  }
];

const Jukebox: React.FC = () => {
  const [playlist] = useState(initialPlaylist);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        setIsLoading(true);
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Error playing stream:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const playNext = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  const playPrevious = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [currentTrack]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isMinimized ? 'w-12 h-12' : 'w-80'}`}>
      <div className="neon-border bg-dark/90 backdrop-blur-sm rounded-lg p-4 relative">
        {/* Minimize/Maximize button */}
        <button
          onClick={toggleMinimize}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent neon-border-gold flex items-center justify-center text-xs"
        >
          {isMinimized ? '+' : '-'}
        </button>

        {/* Main player content */}
        {!isMinimized && (
          <>
            <div className="text-center mb-3">
              <h3 className="text-gold neon-text-gold text-lg truncate">
                {playlist[currentTrack].title}
              </h3>
              <p className="text-cream text-sm truncate">
                {playlist[currentTrack].artist}
              </p>
              {isLoading && (
                <p className="text-xs text-accent animate-pulse mt-1">
                  Connecting to stream...
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-4 mb-3">
              <button
                onClick={playPrevious}
                className="text-gold hover:text-accent transition-colors"
                disabled={isLoading}
              >
                <FaBackward />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full neon-border-gold flex items-center justify-center text-gold hover:text-accent transition-colors"
                disabled={isLoading}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button
                onClick={playNext}
                className="text-gold hover:text-accent transition-colors"
                disabled={isLoading}
              >
                <FaForward />
              </button>
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-gold hover:text-accent transition-colors"
              >
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-gold"
              />
            </div>
          </>
        )}

        {/* Audio element */}
        <audio
          ref={audioRef}
          src={playlist[currentTrack].url}
          onEnded={playlist[currentTrack].isStream ? undefined : playNext}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default Jukebox;
