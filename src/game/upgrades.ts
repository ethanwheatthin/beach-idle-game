import { UpgradeId, UpgradeDefinition } from './types';

export const UPGRADES: Record<UpgradeId, UpgradeDefinition> = {
  volunteer: {
    id: 'volunteer',
    displayName: 'Volunteer',
    description: 'Increases coins earned per tap.',
    icon: '\u270b',
    baseCost: 10,
    costMultiplier: 1.4,
    maxLevel: 50,
    effect: (level: number) => ({ tapPower: 1 + level }),
    milestones: [5, 10, 25, 50],
    milestoneTexts: {
      5: 'Helping Hand',
      10: 'Dedicated Volunteer',
      25: 'Beach Hero',
      50: 'Cleanup Legend',
    },
  },

  binCapacity: {
    id: 'binCapacity',
    displayName: 'Bin Capacity',
    description: 'Each piece of trash is worth +15% more.',
    icon: '\uD83D\uDDD1\uFE0F',
    baseCost: 50,
    costMultiplier: 1.6,
    maxLevel: 25,
    effect: (level: number) => ({ coinMultiplier: Math.pow(1.15, level) }),
    milestones: [5, 10, 15, 25],
    milestoneTexts: {
      5: 'Bigger Bin',
      10: 'Industrial Bin',
      15: 'Mega Bin',
      25: 'Recycling Master',
    },
  },

  cleanupVan: {
    id: 'cleanupVan',
    displayName: 'Cleanup Van',
    description: 'Automatically collects trash from the beach.',
    icon: '\uD83D\uDE90',
    baseCost: 75,
    costMultiplier: 1.8,
    maxLevel: 30,
    effect: (level: number) => {
      if (level === 0) return { vanCount: 0, vanIntervalMs: 0 };
      if (level <= 5) return { vanCount: 1, vanIntervalMs: 16000 - level * 1500 };
      if (level <= 10) return { vanCount: 2, vanIntervalMs: 12000 - (level - 5) * 800 };
      if (level <= 15) return { vanCount: 2, vanIntervalMs: 8000 - (level - 10) * 600 };
      if (level <= 20) return { vanCount: 3, vanIntervalMs: 6000 - (level - 15) * 200 };
      if (level <= 25) return { vanCount: 4, vanIntervalMs: 5000 - (level - 20) * 200 };
      return { vanCount: 5, vanIntervalMs: 4000 - (level - 25) * 200 };
    },
    milestones: [1, 5, 10, 20, 30],
    milestoneTexts: {
      1: 'Van Acquired!',
      5: 'Bigger Van',
      10: 'Van Fleet',
      20: 'Cleanup Squad',
      30: 'Beach Patrol',
    },
  },

  spawnRate: {
    id: 'spawnRate',
    displayName: 'Tide Strength',
    description: 'The tide brings in trash faster.',
    icon: '\uD83C\uDF0A',
    baseCost: 100,
    costMultiplier: 1.7,
    maxLevel: 12,
    effect: (level: number) => ({ spawnIntervalMultiplier: Math.pow(0.92, level) }),
    milestones: [3, 6, 9, 12],
    milestoneTexts: {
      3: 'Rising Tide',
      6: 'Strong Current',
      9: 'Powerful Surge',
      12: 'Tidal Force',
    },
  },

  rareFinds: {
    id: 'rareFinds',
    displayName: 'Rare Finds',
    description: 'Higher chance of valuable trash, worth much more.',
    icon: '\u2728',
    baseCost: 250,
    costMultiplier: 2.0,
    maxLevel: 15,
    effect: (level: number) => ({
      rareChanceBonus: level * 0.015,
      rareValueMultiplier: 10 + level,
    }),
    milestones: [3, 7, 12, 15],
    milestoneTexts: {
      3: 'Lucky Eye',
      7: 'Treasure Hunter',
      12: 'Master Beachcomber',
      15: 'Legend of the Shore',
    },
  },
};

/** @deprecated Use UPGRADES */
export const upgrades = UPGRADES;
