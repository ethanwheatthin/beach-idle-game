import React, { useState } from 'react';
import BeachCanvas from './BeachCanvas';
import CurrencyDisplay from './CurrencyDisplay';
import UpgradePanel from './UpgradePanel';
import JournalModal from './JournalModal';
import MusicPlayer from './MusicPlayer';
import { useAssetLoader } from '../hooks/useAssetLoader';
import { useGameStore } from '../game/store';

function App() {
  const { loaded, progress } = useAssetLoader();
  const [journalOpen, setJournalOpen] = useState(false);
  const musicEnabled = useGameStore((s) => s.musicEnabled);
  const toggleMusic = useGameStore((s) => s.toggleMusic);

  if (!loaded) {
    return (
      <div className="fixed inset-0 bg-[#0d2233] flex flex-col items-center justify-center gap-6">
        <div className="text-5xl animate-bounce">🏖️</div>
        <div className="text-white font-semibold text-lg">Loading beach…</div>
        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 transition-all duration-100"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="text-white/40 text-sm">{Math.round(progress * 100)}%</div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      <MusicPlayer />

      {/* Game canvas */}
      <BeachCanvas />

      {/* Top bar: coins + music toggle */}
      <div className="absolute top-0 left-0 w-full p-4 flex items-start justify-between pointer-events-none select-none">
        <CurrencyDisplay />
        <button
          onClick={toggleMusic}
          className="pointer-events-auto bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20 text-xl shadow-lg active:scale-95 transition-transform"
          aria-label={musicEnabled ? 'Mute music' : 'Unmute music'}
        >
          {musicEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Bottom bar: upgrades + journal */}
      <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-none select-none flex items-end justify-between">
        <UpgradePanel />
        <button
          onClick={() => setJournalOpen(true)}
          className="pointer-events-auto bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30 text-2xl shadow-lg active:scale-95 transition-transform"
          aria-label="Open journal"
        >
          📖
        </button>
      </div>

      {/* Journal modal */}
      {journalOpen && <JournalModal onClose={() => setJournalOpen(false)} />}
    </div>
  );
}

export default App;