import { create } from 'zustand';
import { GameState, UpgradeId, Particle, TextParticle, TreasureItem } from './types';
import { getTapPower, getUpgradeCost } from './economy';
import { upgrades as upgradeDefs } from './upgrades';
import { resetGame, loadGame, saveGame } from './save';
import { TREASURE_MANIFEST } from '../assets/manifest';

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

function playTreasureSound(isNew: boolean) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const freqs = isNew ? [523, 659, 784, 1047] : [440, 392];
    let time = ctx.currentTime;
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      osc.start(time);
      osc.stop(time + 0.2);
      time += 0.12;
    });
  } catch (e) {
    console.warn('Audio playback failed', e);
  }
}

interface GameActions {
  tapTrash: (id: string, x: number, y: number) => void;
  tapTreasure: (id: string, x: number, y: number) => void;
  buyUpgrade: (id: UpgradeId) => void;
  tick: (deltaMs: number) => void;
  toggleMusic: () => void;
  markMusicStarted: () => void;
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

  treasureItems: [],
  treasureSpawnTimer: 30000,
  collection: new Set<string>(),
  beachCleanliness: 1,

  musicEnabled: true,
  musicHasStarted: false,
};

function computeCleanliness(trashItems: GameState['trashItems']): number {
  const active = trashItems.filter((t) => !t.isRemoving).length;
  return Math.max(0, 1 - active / 30);
}

export const useGameStore = create<GameState & GameActions>((set, get) => {
  // Load initial state from save if available
  const savedState = loadGame();
  const startingState = savedState ? { ...initialState, ...savedState } : initialState;

  return {
    ...startingState,

    // ----------------------------------------------------------------
    tapTrash: (id, x, y) => {
      const { trashItems, upgrades, textParticles } = get();
      const trashIndex = trashItems.findIndex((t) => t.id === id && !t.isRemoving);
      if (trashIndex === -1) return;

      const item = trashItems[trashIndex];
      const newHitsRemaining = item.hitsRemaining - 1;
      const isLastHit = newHitsRemaining <= 0;

      // Particles
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

      let updatedTrashItems: GameState['trashItems'];
      let coinsGained = 0;

      if (isLastHit) {
        // Final tap — award coins and begin removal animation
        const binLevel = upgrades['bin_capacity'] ?? 0;
        const multiplier = 1 + 0.1 * binLevel;
        coinsGained = Math.round(item.baseValue * multiplier);

        updatedTrashItems = trashItems.map((t, i) =>
          i === trashIndex ? { ...t, hitsRemaining: 0, isRemoving: true, removeTimer: 80 } : t
        );
      } else {
        // Not final tap — just reduce hit count
        updatedTrashItems = trashItems.map((t, i) =>
          i === trashIndex ? { ...t, hitsRemaining: newHitsRemaining } : t
        );
      }

      const hitText = isLastHit
        ? `+${coinsGained}`
        : `${newHitsRemaining} left`;

      const textParticle: TextParticle = {
        id: Math.random().toString(36).substring(2, 11),
        x,
        y,
        vy: -(40 / 600),
        life: 1,
        maxLife: 600,
        text: hitText,
      };

      const cleanliness = computeCleanliness(updatedTrashItems);

      set((state) => ({
        coins: state.coins + coinsGained,
        totalTrashCleaned: isLastHit ? state.totalTrashCleaned + 1 : state.totalTrashCleaned,
        trashItems: updatedTrashItems,
        particles: [...state.particles, ...newParticles],
        textParticles: [...textParticles, textParticle],
        beachCleanliness: cleanliness,
      }));

      playTapSound();

      // First-interaction music start
      if (!get().musicHasStarted) {
        set({ musicHasStarted: true });
      }
    },

    // ----------------------------------------------------------------
    tapTreasure: (id, x, y) => {
      const { treasureItems, collection, textParticles } = get();
      const tIdx = treasureItems.findIndex((t) => t.id === id);
      if (tIdx === -1) return;

      const treasure = treasureItems[tIdx];
      const isNew = !collection.has(treasure.collectionKey);

      const newCollection = new Set(collection);
      newCollection.add(treasure.collectionKey);

      const label = isNew
        ? `New! ${getDisplayNameFromKey(treasure.collectionKey)}`
        : 'Already collected';

      // Sparkle particles
      const sparkles: Particle[] = Array.from({ length: 8 }).map(() => ({
        id: Math.random().toString(36).substring(2, 11),
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * -4 - 1,
        life: 1,
        maxLife: 600,
        color: isNew ? '#FFD700' : '#87CEEB',
      }));

      const textParticle: TextParticle = {
        id: Math.random().toString(36).substring(2, 11),
        x,
        y: y - 20,
        vy: -(50 / 1200),
        life: 1,
        maxLife: 1200,
        text: label,
      };

      const updatedTreasures = treasureItems.filter((_, i) => i !== tIdx);

      set((state) => ({
        coins: state.coins + 10,
        collection: newCollection,
        treasureItems: updatedTreasures,
        particles: [...state.particles, ...sparkles],
        textParticles: [...textParticles, textParticle],
      }));

      playTreasureSound(isNew);

      if (!get().musicHasStarted) {
        set({ musicHasStarted: true });
      }
    },

    // ----------------------------------------------------------------
    buyUpgrade: (id) => {
      const { upgrades, coins } = get();
      const currentLevel = upgrades[id];
      if (currentLevel >= upgradeDefs[id].maxLevel) return;
      const cost = getUpgradeCost(id, currentLevel);
      if (coins < cost) return;
      set((state) => ({
        coins: state.coins - cost,
        upgrades: { ...state.upgrades, [id]: state.upgrades[id] + 1 },
      }));
    },

    // ----------------------------------------------------------------
    tick: (deltaMs) => {
      const { particles, textParticles, trashItems, treasureItems } = get();

      const updatedParticles = particles
        .map((p) => ({
          ...p,
          life: p.life - deltaMs / p.maxLife,
          x: p.x + p.vx,
          y: p.y + p.vy,
        }))
        .filter((p) => p.life > 0);

      const updatedTextParticles = textParticles
        .map((tp) => ({
          ...tp,
          life: tp.life - deltaMs / tp.maxLife,
          y: tp.y + tp.vy * deltaMs,
        }))
        .filter((tp) => tp.life > 0);

      // Tick removal timers on trash
      const updatedTrashItems = trashItems
        .map((t) =>
          t.isRemoving ? { ...t, removeTimer: (t.removeTimer ?? 0) - deltaMs } : t
        )
        .filter((t) => !t.isRemoving || (t.removeTimer ?? 0) > 0);

      // Tick spawn-in progress on trash (0→1 over 1500ms for wash-in animation)
      const fadedTrashItems = updatedTrashItems.map((t) =>
        t.spawnProgress < 1
          ? { ...t, spawnProgress: Math.min(1, t.spawnProgress + deltaMs / 1500) }
          : t
      );

      // Tick treasures: spawn-in progress + driftwood animation
      const updatedTreasures: TreasureItem[] = treasureItems.map((tr) => {
        let next = tr;
        if (next.spawnProgress < 1) {
          next = { ...next, spawnProgress: Math.min(1, next.spawnProgress + deltaMs / 600) };
        }
        if (next.category === 'driftwood') {
          const driftEntry = TREASURE_MANIFEST.driftwood[next.variant as keyof typeof TREASURE_MANIFEST.driftwood];
          const frameCount = driftEntry ? driftEntry.frames.length : 2;
          const FRAME_DURATION_MS = 1000 / 6; // ~6 fps
          const newTimer = next.animTimer + deltaMs;
          if (newTimer >= FRAME_DURATION_MS) {
            const newFrame = (next.animFrame + 1) % frameCount;
            const frames = driftEntry?.frames;
            next = {
              ...next,
              animFrame: newFrame,
              animTimer: newTimer - FRAME_DURATION_MS,
              spritePath: frames ? frames[newFrame] : next.spritePath,
            };
          } else {
            next = { ...next, animTimer: newTimer };
          }
        }
        return next;
      });

      set((state) => ({
        particles: updatedParticles,
        textParticles: updatedTextParticles,
        trashItems: fadedTrashItems,
        treasureItems: updatedTreasures,
        spawnTimer: Math.max(0, state.spawnTimer - deltaMs),
        autoCollectTimer: Math.max(0, state.autoCollectTimer - deltaMs),
        treasureSpawnTimer: Math.max(0, state.treasureSpawnTimer - deltaMs),
      }));
    },

    // ----------------------------------------------------------------
    toggleMusic: () => {
      set((state) => ({ musicEnabled: !state.musicEnabled }));
    },

    markMusicStarted: () => {
      set({ musicHasStarted: true });
    },

    // ----------------------------------------------------------------
    reset: () => {
      resetGame();
    },
  };
});

// Helper — avoids importing manifest in actions above
function getDisplayNameFromKey(collectionKey: string): string {
  const [cat, variant] = collectionKey.split(':');
  try {
    if (cat === 'shell') return TREASURE_MANIFEST.shells[variant as keyof typeof TREASURE_MANIFEST.shells].displayName;
    if (cat === 'starfish') return TREASURE_MANIFEST.starfish[variant as keyof typeof TREASURE_MANIFEST.starfish].displayName;
    if (cat === 'seaweed') return TREASURE_MANIFEST.seaweed[variant as keyof typeof TREASURE_MANIFEST.seaweed].displayName;
    if (cat === 'driftwood') return TREASURE_MANIFEST.driftwood[variant as keyof typeof TREASURE_MANIFEST.driftwood].displayName;
  } catch { /* unknown key */ }
  return variant;
}

// Auto-save every 5 seconds (called from useAutoSave hook)
export { saveGame };