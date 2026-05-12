import { UpgradeId, UpgradeDefinition } from './types';

export const upgrades: Record<UpgradeId, UpgradeDefinition> = {
  volunteer: {
    name: 'Volunteer',
    description: 'Increases coins gained per tap.',
    baseCost: 10,
    costCurve: (level: number) => Math.round(10 * Math.pow(1.5, level)),
    maxLevel: 50,
    effect: (level: number) => 1 + level,
  },
  bin_capacity: {
    name: 'Bin Capacity',
    description: 'Increases coins gained per piece.',
    baseCost: 25,
    costCurve: (level: number) => Math.round(25 * Math.pow(1.7, level)),
    maxLevel: 30,
    effect: (level: number) => 1 + (0.1 * level),
  },
  cleanup_van: {
    name: 'Cleanup Van',
    description: 'Auto-collects trash periodically.',
    baseCost: 100,
    costCurve: (level: number) => Math.round(100 * Math.pow(2.0, level)),
    maxLevel: 25,
    effect: (level: number) => level,
  },
  spawn_rate: {
    name: 'Spawn Rate',
    description: 'Increases trash spawn frequency.',
    baseCost: 50,
    costCurve: (level: number) => Math.round(50 * Math.pow(1.8, level)),
    maxLevel: 20,
    effect: (level: number) => 0.95 ** level,
  },
  rare_finds: {
    name: 'Rare Finds',
    description: 'Increases chance for high value trash.',
    baseCost: 200,
    costCurve: (level: number) => Math.round(200 * Math.pow(2.2, level)),
    maxLevel: 15,
    effect: (level: number) => 0.01 * level,
  },
};
