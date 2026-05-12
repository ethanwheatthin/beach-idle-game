import { useEffect, useRef } from 'react';
import { useGameStore } from '../game/store';

/**
 * Invisible component that manages the background music <audio> element.
 * Music starts on first user interaction (musicHasStarted = true),
 * respecting Web Audio autoplay policies.
 */
const MusicPlayer: React.FC = () => {
  const musicEnabled = useGameStore((s) => s.musicEnabled);
  const musicHasStarted = useGameStore((s) => s.musicHasStarted);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.volume = 0.4;
      // Prefer OGG (smaller), fallback to MP3
      const src = '/assets/A Smoothie At The Beach Bar/loop only/A Smoothie At The Beach Bar.ogg';
      audio.src = src;
      audioRef.current = audio;
    }
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // Start playback on first interaction
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !musicHasStarted) return;
    if (musicEnabled) {
      audio.play().catch((err) => {
        // Autoplay blocked — retry silently on next interaction
        console.warn('[Music] Playback blocked:', err);
      });
    } else {
      audio.pause();
    }
  }, [musicHasStarted, musicEnabled]);

  // Mute/unmute without stopping
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!musicEnabled) {
      audio.pause();
    } else if (musicHasStarted) {
      audio.play().catch(() => undefined);
    }
  }, [musicEnabled, musicHasStarted]);

  return null;
};

export default MusicPlayer;
