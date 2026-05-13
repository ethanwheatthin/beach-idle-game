import { create } from 'zustand';
import {
  GameState,
  UpgradeId,
  Particle,
  TextParticle,
  TreasureItem,
  VanState,
  MilestoneNotification,
} from './types';
import { getUpgradeCost, computeStats, computeCoinsForTap } from './economy';
import { UPGRADES } from './upgrades';
import { resetGame, loadGame, saveGame } from './save';
import { TREASURE_MANIFEST } from '../assets/manifest';
import {
  playTapSound,
  playRareHitSound,
  playTreasureSound,
  playUpgradeSound,
  playMilestoneSound,
  playVanCollectSound,
} from './sounds';

export const VAN_DRIVE_DURATION_MS = 2000;


interface GameActions {
  tapTrash: (id: string, x: number, y: number) => void;
  tapTreasure: (id: string, x: number, y: number) => void;
  buyUpgrade: (id: UpgradeId) => void;
  startVan: (canvasWidth: number, canvasHeight: number, waterlineY: number) => void;
  dismissMilestone: () => void;
  tick: (deltaMs: number) => void;
  toggleMusic: () => void;
  markMusicStarted: () => void;
  reset: () => void;
}

const DEFAULT_UPGRADES: Record<UpgradeId, number> = {
  volunteer: 0,
  binCapacity: 0,
  cleanupVan: 0,
  spawnRate: 0,
  rareFinds: 0,
};

const DEFAULT_STATS = computeStats(DEFAULT_UPGRADES);

const initialState: GameState = {
  coins: 0,
  totalTrashCleaned: 0,
  upgrades: { ...DEFAULT_UPGRADES },
  stats: DEFAULT_STATS,
  trashItems: [],
  particles: [],
  textParticles: [],
  spawnTimer: 3000,
  lastSaveTime: Date.now(),
  van: null,
  vanTimer: 0,
  treasureItems: [],
  treasureSpawnTimer: 30000,
  collection: new Set<string>(),
  beachCleanliness: 1,
  unlockedMilestones: new Set<string>(),
  pendingMilestone: null,
  musicEnabled: true,
  musicHasStarted: false,
};

function computeCleanliness(trashItems: GameState['trashItems'], maxTrash: number): number {
  const active = trashItems.filter((t) => !t.isRemoving).length;
  return Math.max(0, 1 - active / maxTrash);
}

function makeGoldenBurst(x: number, y: number): Particle[] {
  return Array.from({ length: 12 }).map(() => ({
    id: Math.random().toString(36).substring(2, 11),
    x, y,
    vx: (Math.random() - 0.5) * 8,
    vy: Math.random() * -6 - 2,
    life: 1,
    maxLife: 700,
    color: Math.random() < 0.5 ? '#FFD700' : '#FFA500',
    type: 'golden' as const,
    size: 3 + Math.random() * 3,
  }));
}

function makeConfetti(x: number, y: number): Particle[] {
  const COLORS = ['#FF6B6B', '#FFD700', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  return Array.from({ length: 14 }).map(() => ({
    id: Math.random().toString(36).substring(2, 11),
    x, y,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -8 - 2,
    life: 1,
    maxLife: 900,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    type: 'confetti' as const,
    size: 4 + Math.random() * 4,
  }));
}

export const useGameStore = create<GameState & GameActions>((set, get) => {
  const savedState = loadGame();
  const startingState = savedState ? { ...initialState, ...savedState } : initialState;

  return {
    ...startingState,

    // ----------------------------------------------------------------
    tapTrash: (id, x, y) => {
      const { trashItems, stats, textParticles } = get();
      const trashIndex = trashItems.findIndex((t) => t.id === id && !t.isRemoving);
      if (trashIndex === -1) return;

      const item = trashItems[trashIndex];
      const newHitsRemaining = item.hitsRemaining - 1;
      const isLastHit = newHitsRemaining <= 0;

      const newParticles: Particle[] = Array.from({ length: 5 }).map(() => ({
        id: Math.random().toString(36).substring(2, 11),
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1,
        life: 1,
        maxLife: 400,
        color: '#ffffff',
        type: 'normal' as const,
      }));

      let updatedTrashItems: GameState['trashItems'];
      let coinsGained = 0;
      let isRareHit = false;
      let extraParticles: Particle[] = [];

      if (isLastHit) {
        const result = computeCoinsForTap(item.baseValue, item.tier, stats);
        coinsGained = result.coins;
        isRareHit = result.isRareHit;
        if (isRareHit) extraParticles = makeGoldenBurst(x, y);
        updatedTrashItems = trashItems.map((t, i) =>
          i === trashIndex ? { ...t, hitsRemaining: 0, isRemoving: true, removeTimer: 80 } : t,
        );
      } else {
        updatedTrashItems = trashItems.map((t, i) =>
          i === trashIndex ? { ...t, hitsRemaining: newHitsRemaining } : t,
        );
      }

      const hitText = isLastHit
        ? isRareHit ? `✨ +${coinsGained}` : `+${coinsGained}`
        : `${newHitsRemaining} left`;

      const textParticle: TextParticle = {
        id: Math.random().toString(36).substring(2, 11),
        x, y,
        vy: -(40 / 600),
        life: 1,
        maxLife: isRareHit ? 900 : 600,
        text: hitText,
        color: isRareHit ? '#FFD700' : undefined,
        fontSize: isRareHit ? 22 : undefined,
      };

      const cleanliness = computeCleanliness(updatedTrashItems, get().stats.maxTrash);

      set((state) => ({
        coins: state.coins + coinsGained,
        totalTrashCleaned: isLastHit ? state.totalTrashCleaned + 1 : state.totalTrashCleaned,
        trashItems: updatedTrashItems,
        particles: [...state.particles, ...newParticles, ...extraParticles],
        textParticles: [...textParticles, textParticle],
        beachCleanliness: cleanliness,
      }));

      if (isRareHit) playRareHitSound(); else playTapSound();
      if (!get().musicHasStarted) set({ musicHasStarted: true });
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

      const sparkles: Particle[] = Array.from({ length: 8 }).map(() => ({
        id: Math.random().toString(36).substring(2, 11),
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * -4 - 1,
        life: 1,
        maxLife: 600,
        color: isNew ? '#FFD700' : '#87CEEB',
        type: 'normal' as const,
      }));

      const textParticle: TextParticle = {
        id: Math.random().toString(36).substring(2, 11),
        x, y: y - 20,
        vy: -(50 / 1200),
        life: 1,
        maxLife: 1200,
        text: isNew ? `New! ${getDisplayNameFromKey(treasure.collectionKey)}` : 'Already collected',
      };

      set((state) => ({
        coins: state.coins + 10,
        collection: newCollection,
        treasureItems: treasureItems.filter((_, i) => i !== tIdx),
        particles: [...state.particles, ...sparkles],
        textParticles: [...textParticles, textParticle],
      }));

      playTreasureSound(isNew);
      if (!get().musicHasStarted) set({ musicHasStarted: true });
    },

    // ----------------------------------------------------------------
    buyUpgrade: (id) => {
      const { upgrades, coins, unlockedMilestones } = get();
      const def = UPGRADES[id];
      const currentLevel = upgrades[id];
      if (currentLevel >= def.maxLevel) return;
      const cost = getUpgradeCost(id, currentLevel);
      if (coins < cost) return;

      const newLevel = currentLevel + 1;
      const newUpgrades = { ...upgrades, [id]: newLevel };
      const newStats = computeStats(newUpgrades);

      const milestoneKey = `${id}:${newLevel}`;
      let pendingMilestone: MilestoneNotification | null = null;
      let newUnlockedMilestones = unlockedMilestones;
      let milestoneParticles: Particle[] = [];

      if (def.milestones.includes(newLevel) && !unlockedMilestones.has(milestoneKey)) {
        newUnlockedMilestones = new Set(unlockedMilestones);
        newUnlockedMilestones.add(milestoneKey);
        pendingMilestone = {
          upgradeId: id,
          level: newLevel,
          text: (def.milestoneTexts as Record<number, string>)[newLevel] ?? `Level ${newLevel}`,
        };
        milestoneParticles = makeConfetti(window.innerWidth / 2, window.innerHeight / 2);
        playMilestoneSound();
      } else {
        playUpgradeSound(id);
      }

      const vanTimerUpdate =
        id === 'cleanupVan' && currentLevel === 0 ? { vanTimer: 5000 } : {};

      set((state) => ({
        coins: state.coins - cost,
        upgrades: newUpgrades,
        stats: newStats,
        unlockedMilestones: newUnlockedMilestones,
        pendingMilestone: pendingMilestone ?? state.pendingMilestone,
        particles: [...state.particles, ...milestoneParticles],
        ...vanTimerUpdate,
      }));
    },

    // ----------------------------------------------------------------
    startVan: (canvasWidth, canvasHeight, waterlineY) => {
      const { trashItems, stats } = get();
      if (stats.vanCount === 0) return;

      const direction: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right';
      const startX = direction === 'right' ? -70 : canvasWidth + 70;
      const endX = direction === 'right' ? canvasWidth + 70 : -70;
      const minY = waterlineY + 35;
      const maxY = canvasHeight - 35;
      const y = minY + Math.random() * Math.max(0, maxY - minY);

      const available = trashItems.filter((t) => !t.isRemoving && !t.isVanTarget);
      const sorted = [...available].sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y));
      const targets = sorted.slice(0, stats.vanCount).map((t) => t.id);

      const newTrashItems = trashItems.map((t) =>
        targets.includes(t.id) ? { ...t, isVanTarget: true } : t,
      );

      const vanState: VanState = {
        x: startX, startX, endX, y, direction,
        progress: 0, pendingCoins: 0, targets, caughtIds: [],
      };

      set({ van: vanState, vanTimer: stats.vanIntervalMs, trashItems: newTrashItems });
    },

    // ----------------------------------------------------------------
    dismissMilestone: () => set({ pendingMilestone: null }),

    // ----------------------------------------------------------------
    tick: (deltaMs) => {
      const state = get();
      const { particles, textParticles, treasureItems, stats } = state;
      let { trashItems, van, vanTimer } = state;

      // ---- Van movement ----
      let coinsFromVan = 0;
      let vanTextParticles: TextParticle[] = [];
      let totalVanCaught = 0;

      if (van) {
        const newProgress = Math.min(1, van.progress + deltaMs / VAN_DRIVE_DURATION_MS);
        const newX = van.startX + (van.endX - van.startX) * newProgress;
        const PICKUP_RADIUS = 55;
        const newCaughtIds = [...van.caughtIds];
        let pendingDelta = 0;

        trashItems = trashItems.map((t) => {
          if (!van!.targets.includes(t.id) || newCaughtIds.includes(t.id) || t.isRemoving) return t;
          const passed =
            van!.direction === 'right' ? newX > t.x - PICKUP_RADIUS : newX < t.x + PICKUP_RADIUS;
          if (passed) {
            newCaughtIds.push(t.id);
            pendingDelta += Math.floor(t.baseValue * stats.coinMultiplier);
            return { ...t, isRemoving: true, removeTimer: 350, isVanTarget: false };
          }
          return t;
        });

        totalVanCaught = newCaughtIds.length - van.caughtIds.length;

        if (newProgress >= 1) {
          coinsFromVan = van.pendingCoins + pendingDelta;
          if (coinsFromVan > 0) {
            const exitX = van.direction === 'right'
              ? Math.min(van.endX - 60, window.innerWidth - 80)
              : 80;
            vanTextParticles = [{
              id: Math.random().toString(36).substring(2, 11),
              x: exitX, y: van.y - 20,
              vy: -(50 / 1000),
              life: 1, maxLife: 1000,
              text: `🚐 +${coinsFromVan}`,
              color: '#4ADE80', fontSize: 20,
            }];
            playVanCollectSound();
          }
          van = null;
        } else {
          van = { ...van, x: newX, progress: newProgress, pendingCoins: van.pendingCoins + pendingDelta, caughtIds: newCaughtIds };
        }
      }

      // ---- Particles ----
      const updatedParticles = particles
        .map((p) => ({ ...p, life: p.life - deltaMs / p.maxLife, x: p.x + p.vx, y: p.y + p.vy }))
        .filter((p) => p.life > 0);

      const updatedTextParticles = [...textParticles, ...vanTextParticles]
        .map((tp) => ({ ...tp, life: tp.life - deltaMs / tp.maxLife, y: tp.y + tp.vy * deltaMs }))
        .filter((tp) => tp.life > 0);

      // ---- Trash removal + spawn-in ----
      const updatedTrash = trashItems
        .map((t) => (t.isRemoving ? { ...t, removeTimer: (t.removeTimer ?? 0) - deltaMs } : t))
        .filter((t) => !t.isRemoving || (t.removeTimer ?? 0) > 0);

      const fadedTrash = updatedTrash.map((t) =>
        t.spawnProgress < 1 ? { ...t, spawnProgress: Math.min(1, t.spawnProgress + deltaMs / 1500) } : t,
      );

      // ---- Treasures ----
      const updatedTreasures: TreasureItem[] = treasureItems.map((tr) => {
        let next = tr;
        if (next.spawnProgress < 1)
          next = { ...next, spawnProgress: Math.min(1, next.spawnProgress + deltaMs / 600) };
        if (next.category === 'driftwood') {
          const driftEntry =
            TREASURE_MANIFEST.driftwood[next.variant as keyof typeof TREASURE_MANIFEST.driftwood];
          const frameCount = driftEntry ? driftEntry.frames.length : 2;
          const FRAME_MS = 1000 / 6;
          const newTimer = next.animTimer + deltaMs;
          if (newTimer >= FRAME_MS) {
            const newFrame = (next.animFrame + 1) % frameCount;
            next = {
              ...next,
              animFrame: newFrame,
              animTimer: newTimer - FRAME_MS,
              spritePath: driftEntry?.frames[newFrame] ?? next.spritePath,
            };
          } else {
            next = { ...next, animTimer: newTimer };
          }
        }
        return next;
      });

      const cleanliness = computeCleanliness(fadedTrash, stats.maxTrash);

      set((s) => ({
        particles: updatedParticles,
        textParticles: updatedTextParticles,
        trashItems: fadedTrash,
        treasureItems: updatedTreasures,
        beachCleanliness: cleanliness,
        van,
        vanTimer: Math.max(0, vanTimer - deltaMs),
        spawnTimer: Math.max(0, s.spawnTimer - deltaMs),
        treasureSpawnTimer: Math.max(0, s.treasureSpawnTimer - deltaMs),
        coins: s.coins + coinsFromVan,
        totalTrashCleaned: s.totalTrashCleaned + totalVanCaught,
      }));
    },

    // ----------------------------------------------------------------
    toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
    markMusicStarted: () => set({ musicHasStarted: true }),
    reset: () => resetGame(),
  };
});

function getDisplayNameFromKey(collectionKey: string): string {
  const [cat, variant] = collectionKey.split(':');
  try {
    if (cat === 'shell')
      return TREASURE_MANIFEST.shells[variant as keyof typeof TREASURE_MANIFEST.shells].displayName;
    if (cat === 'starfish')
      return TREASURE_MANIFEST.starfish[variant as keyof typeof TREASURE_MANIFEST.starfish].displayName;
    if (cat === 'seaweed')
      return TREASURE_MANIFEST.seaweed[variant as keyof typeof TREASURE_MANIFEST.seaweed].displayName;
    if (cat === 'driftwood')
      return TREASURE_MANIFEST.driftwood[variant as keyof typeof TREASURE_MANIFEST.driftwood].displayName;
  } catch {
    /* unknown key */
  }
  return variant;
}

export { saveGame };
