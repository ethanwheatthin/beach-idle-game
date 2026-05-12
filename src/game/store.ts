import { create } from 'zustand';
import { GameState, UpgradeId, Particle, TextParticle } from './types';
import { getTapPower, getCurrencyPerPiece, getUpgradeCost } from './economy';
import { upgrades as upgradeDefs } from './upgrades';
import { resetGame, loadGame } from './save';

// Single shared AudioContext — browsers cap concurrent contexts (~6).
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return _audioCtx;
}

function playTapSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
}

interface GameActions {
  tapTrash: (id: string, x: number, y: number) => void;
  buyUpgrade: (id: UpgradeId) => void;
  tick: (deltaMs: number) => void;
  reset: () => void;
}

const initialState: GameState = {
  coins: 0,
  totalTrashCleaned: 0,
  upgrades: {
    volunteer: 0,
    bin_capacity: 0,
    cleanup_van: 0,
    spawn_rate: 0,
    rare_finds: 0,
  },
  trashItems: [],
  particles: [],
  textParticles: [],
  spawnTimer: 3000,
  autoCollectTimer: 10000,
  lastSaveTime: Date.now(),
};

export const useGameStore = create<GameState & GameActions>((set, get) => {
  // Load initial state from save if available
  const savedState = loadGame();
  const startingState = savedState ? { ...initialState, ...savedState } : initialState;

  return {
    ...startingState,

    // Actions
    tapTrash: (id, x, y) => {
      const { trashItems, upgrades, textParticles } = get();
      // Ignore taps on items already in their removal animation
      const trashIndex = trashItems.findIndex((t) => t.id === id && !t.isRemoving);
      if (trashIndex === -1) return;

      const tapPower = getTapPower(upgrades);
      const currencyPerPiece = getCurrencyPerPiece(upgrades);
      const coinsGained = Math.round(tapPower * currencyPerPiece);

      const newParticles: Particle[] = Array.from({ length: 5 }).map(() => ({
        id: Math.random().toString(36).substring(2, 11),
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1,
        life: 1,
        maxLife: 400,
        color: '#ffffff',
      }));

      // +N floating text popup
      const textParticle: TextParticle = {
        id: Math.random().toString(36).substring(2, 11),
        x,
        y,
        vy: -(40 / 600), // 40px upward over 600ms
        life: 1,
        maxLife: 600,
        text: `+${coinsGained}`,
      };

      // Mark as removing — the tick loop deletes it after 80ms (scale animation)
      const updatedTrashItems = trashItems.map((t, i) =>
        i === trashIndex ? { ...t, isRemoving: true, removeTimer: 80 } : t
      );

      set((state) => ({
        coins: state.coins + coinsGained,
        totalTrashCleaned: state.totalTrashCleaned + 1,
        trashItems: updatedTrashItems,
        particles: [...state.particles, ...newParticles],
        textParticles: [...textParticles, textParticle],
      }));

      playTapSound();
    },

    buyUpgrade: (id) => {
      const { upgrades, coins } = get();
      const currentLevel = upgrades[id];
      if (currentLevel >= upgradeDefs[id].maxLevel) return;

      const cost = getUpgradeCost(id, currentLevel);
      if (coins < cost) return;

      set((state) => ({
        coins: state.coins - cost,
        upgrades: {
          ...state.upgrades,
          [id]: state.upgrades[id] + 1,
        },
      }));
    },

    tick: (deltaMs) => {
      const { particles, textParticles, trashItems } = get();

      const updatedParticles = particles
        .map(p => ({
          ...p,
          life: p.life - (deltaMs / p.maxLife),
          x: p.x + p.vx,
          y: p.y + p.vy,
        }))
        .filter(p => p.life > 0);

      // Text popups float upward and fade over 600ms
      const updatedTextParticles = textParticles
        .map(tp => ({
          ...tp,
          life: tp.life - (deltaMs / tp.maxLife),
          y: tp.y + tp.vy * deltaMs,
        }))
        .filter(tp => tp.life > 0);

      // Tick removal timers; delete items whose animation has finished
      const updatedTrashItems = trashItems
        .map(t => t.isRemoving ? { ...t, removeTimer: (t.removeTimer ?? 0) - deltaMs } : t)
        .filter(t => !t.isRemoving || (t.removeTimer ?? 0) > 0);

      set((state) => ({
        particles: updatedParticles,
        textParticles: updatedTextParticles,
        trashItems: updatedTrashItems,
        spawnTimer: Math.max(0, state.spawnTimer - deltaMs),
        autoCollectTimer: Math.max(0, state.autoCollectTimer - deltaMs),
      }));
    },

    reset: () => {
      resetGame();
    }
  };
});