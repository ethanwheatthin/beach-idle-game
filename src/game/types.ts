@reexport type UpgradeId = 'volunteer' | 'bin_capacity' | 'cleanup_van' | 'spawn_rate' | 'rare_finds';

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

export interface GameState {
  coins: number;
  totalTrashCleaned: number;
  upgrades: Record<UpgradeId, number>;
  trashItems: TrashItem[];
  particles: Particle[];
  spawnTimer: number;
  autoCollectTimer: number;
  lastSaveTime: number;
}