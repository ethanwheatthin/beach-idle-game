import { TrashCategory, TreasureCategory } from '../assets/manifest';

export type UpgradeId = 'volunteer' | 'bin_capacity' | 'cleanup_van' | 'spawn_rate' | 'rare_finds';

export interface UpgradeDefinition {
  name: string;
  description: string;
  baseCost: number;
  costCurve: (level: number) => number;
  maxLevel: number;
  effect: (level: number) => number;
}

export type TrashTier = 'common' | 'industrial';

export interface TrashItem {
  id: string;
  tier: TrashTier;
  category: TrashCategory;
  spritePath: string;
  x: number;
  y: number;
  displaySize: number;
  /** Slight random rotation in radians (-5° to +5°) */
  rotation: number;
  /** Remaining tap hits before collected. Industrial starts at 3, common at 1. */
  hitsRemaining: number;
  maxHits: number;
  /** Coin value awarded on final tap */
  baseValue: number;
  /** Wash-in progress 0→1 over 1500ms */
  spawnProgress: number;
  /** Y coordinate at the waterline when this item was spawned (start of wash-in) */
  washFromY: number;
  isRemoving?: boolean;
  removeTimer?: number;
}

export interface TreasureItem {
  id: string;
  category: TreasureCategory;
  /** Variant key matching TREASURE_MANIFEST — e.g. 'angelWing', 'blue', 'driftwood_1' */
  variant: string;
  /** Collection key: "shell:angelWing", "starfish:blue", etc. */
  collectionKey: string;
  /** Primary sprite path (frame 0 for driftwood) */
  spritePath: string;
  x: number;
  y: number;
  /** Wash-in progress 0→1 over 600ms */
  spawnProgress: number;
  /** Current animation frame index (driftwood only) */
  animFrame: number;
  /** Time accumulated since last frame change in ms */
  animTimer: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

/** Floating "+N" coin text or status text that rises and fades after a tap. */
export interface TextParticle {
  id: string;
  x: number;
  y: number;
  /** px/ms — negative = upward */
  vy: number;
  /** 1 → 0 over maxLife ms */
  life: number;
  maxLife: number;
  text: string;
}

export interface GameState {
  coins: number;
  totalTrashCleaned: number;
  upgrades: Record<UpgradeId, number>;

  trashItems: TrashItem[];
  particles: Particle[];
  textParticles: TextParticle[];
  spawnTimer: number;
  autoCollectTimer: number;
  lastSaveTime: number;

  // Treasures pillar
  treasureItems: TreasureItem[];
  treasureSpawnTimer: number;
  /** Collection keys of found treasures: "shell:angelWing", etc. */
  collection: Set<string>;
  /** 0–1; derived from trash count vs max (30). Recomputed on trash change. */
  beachCleanliness: number;

  // Audio
  musicEnabled: boolean;
  musicHasStarted: boolean;
}

export type { TrashCategory, TreasureCategory };