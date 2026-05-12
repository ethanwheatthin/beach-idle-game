import { create } from 'zustand';
import { GameState, UpgradeId, Particle } from './types';
import { getTapPower, getCurrencyPerPiece, getUpgradeCost } from './economy';
import { resetGame, saveGame, loadGame } from './save';

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
      const { trashItems, upgrades, particles, coins, totalTrashCleaned } = get();
      const trashIndex = trashItems.findIndex((t) => t.id === id);
      
      if (trashIndex === -1) return;

      const tapPower = getTapPower(upgrades);
      const currencyPerPiece = getCurrencyPerPiece(upgrades);
      const coinsGained = tapPower * currencyPerPiece;

      const newParticles: Particle[] = Array.from({ length: 6 }).map(() => ({
        id: Math.random().toString(36).substring(2, 11),
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        maxLife: 400,
        color: '#ffffff',
      }));

      const newTrashItems = [...trashItems];
      newTrashItems.splice(trashIndex, 1);

      set((state) => ({
        coins: state.coins + coinsGained,
        totalTrashCleaned: state.totalTrashCleaned + 1,
        trashItems: newTrashItems,
        particles: [...state.particles, ...newParticles],
      }));

      // Audio placeholder
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {
        console.warn('Audio context failed', e);
      }
    },

    buyUpgrade: (id) => {
      const { upgrades, coins } = get();
      const cost = getUpgradeCost(id, upgrades[id]);
      
      if (coins < cost) return;

      set((state) => ({
        coins: state.coins - cost,
        upgrades: {
          ...state.upgrades,
          [id]: state.upgrades[id] + 1
        }
      }));
    },

    tick: (deltaMs) => {
      const { trashItems, particles, spawnTimer, autoCollectTimer, upgrades } = get();
      
      const updatedParticles = particles
        .map(p => ({ 
          ...p, 
          life: p.life - (deltaMs / p.maxLife), 
          x: p.x + p.vx, 
          y: p.y + p.vy 
        }))
        .filter(p => p.life > 0);

      set((state) => ({
        particles: updatedParticles,
        spawnTimer: Math.max(0, state.spawnTimer - deltaMs),
        autoCollectTimer: Math.max(0, state.autoCollectTimer - deltaMs),
      }));
    },

    reset: () => {
      resetGame();
    }
  };
});