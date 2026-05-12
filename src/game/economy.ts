import { UpgradeId } from './types';
import { upgrades } from './upgrades';

export function getUpgradeCost(id: UpgradeId, level: number): number {
  const upgrade = upgrades[id];
  if (!upgrade) return 0;
  return upgrade.costCurve(level);
}

export function getTapPower(upgradesState: Record<UpgradeId, number>): number {
  const volunteerLevel = upgradesState['volunteer'] || 0;
  return 1 + volunteerLevel;
}

export function getCurrencyPerPiece(upgradesState: Record<UpgradeId, number>): number {
  const binCapacityLevel = upgradesState['bin_capacity'] || 0;
  const multiplier = 1 + (0.1 * binCapacityLevel);
  return 1 * multiplier;
}

export function getSpawnInterval(upgradesState: Record<UpgradeId, number>): number {
  const spawnRateLevel = upgradesState['spawn_rate'] || 0;
  // Base interval 3000ms, reduces by 5% per level
  return 3000 * Math.pow(0.95, spawnRateLevel);
}