export type UpgradeId = 'volunteer' | 'bin_capacity' | 'cleanup_van' | 'spawn_rate' | 'rare_finds';

export interface UpgradeDefinition {
  name: string;
  description: string;
  baseCost: number;
  costCurve: (level: number) => number;
  maxLevel: number;
  effect: (level: number) => number;
}

export interface TrashItem {
  id: string;
  type: 'bottle' | 'can' | 'wrapper' | 'net';
  emoji: string;
  x: number;
  y: number;
  size: number;
  /** True when the item has been tapped and is playing its removal animation. */
  isRemoving?: boolean;
  /** Milliseconds remaining in the removal animation. */
  removeTimer?: number;
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

/** Floating "+N" coin text that rises and fades after a tap. */
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
}