import { TrashCategory, TreasureCategory } from '../assets/manifest';

export type UpgradeId = 'volunteer' | 'binCapacity' | 'cleanupVan' | 'spawnRate' | 'rareFinds';

export interface UpgradeDefinition {
  id: UpgradeId;
  displayName: string;
  description: string;
  icon: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  effect: (level: number) => Record<string, number>;
  milestones: number[];
  milestoneTexts: Record<number, string>;
}

export interface GameStats {
  tapPower: number;
  coinMultiplier: number;
  vanCount: number;
  vanIntervalMs: number;
  spawnIntervalMs: number;
  rareChance: number;
  rareMultiplier: number;
  maxTrash: number;
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
  /** Marked true when this item is a cleanup van target */
  isVanTarget?: boolean;
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

export type ParticleType = 'normal' | 'golden' | 'confetti';

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  type?: ParticleType;
  size?: number;
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
  color?: string;
  fontSize?: number;
}

export interface VanState {
  x: number;
  startX: number;
  endX: number;
  y: number;
  direction: 'left' | 'right';
  progress: number;
  pendingCoins: number;
  targets: string[];
  caughtIds: string[];
}

export interface MilestoneNotification {
  upgradeId: UpgradeId;
  level: number;
  text: string;
}

export interface GameState {
  coins: number;
  totalTrashCleaned: number;
  upgrades: Record<UpgradeId, number>;
  stats: GameStats;

  trashItems: TrashItem[];
  particles: Particle[];
  textParticles: TextParticle[];
  spawnTimer: number;
  lastSaveTime: number;

  // Van
  van: VanState | null;
  vanTimer: number;

  // Treasures pillar
  treasureItems: TreasureItem[];
  treasureSpawnTimer: number;
  /** Collection keys of found treasures: "shell:angelWing", etc. */
  collection: Set<string>;
  /** 0–1; derived from trash count vs max (dynamic). Recomputed on trash change. */
  beachCleanliness: number;

  // Milestones
  unlockedMilestones: Set<string>;
  pendingMilestone: MilestoneNotification | null;

  // Audio
  musicEnabled: boolean;
  musicHasStarted: boolean;
}

export type { TrashCategory, TreasureCategory };