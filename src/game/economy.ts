import { UpgradeId, GameStats } from './types';
import { UPGRADES } from './upgrades';

export function getUpgradeCost(id: UpgradeId, level: number): number {
  const def = UPGRADES[id];
  if (!def) return 0;
  return Math.round(def.baseCost * Math.pow(def.costMultiplier, level));
}

export function computeStats(upgradesState: Record<UpgradeId, number>): GameStats {
  const vLevel = upgradesState.volunteer ?? 0;
  const binLevel = upgradesState.binCapacity ?? 0;
  const vanLevel = upgradesState.cleanupVan ?? 0;
  const srLevel = upgradesState.spawnRate ?? 0;
  const rfLevel = upgradesState.rareFinds ?? 0;

  const vanEffect = UPGRADES.cleanupVan.effect(vanLevel) as { vanCount: number; vanIntervalMs: number };

  return {
    tapPower: 1 + vLevel,
    coinMultiplier: Math.pow(1.15, binLevel),
    vanCount: vanEffect.vanCount,
    vanIntervalMs: vanEffect.vanIntervalMs,
    spawnIntervalMs: Math.max(500, 3000 * Math.pow(0.92, srLevel)),
    rareChance: rfLevel * 0.015,
    rareMultiplier: 10 + rfLevel,
    maxTrash: 30 + srLevel * 5,
  };
}

/**
 * Compute coins earned when a trash item is fully collected by a player tap.
 * Applies tapPower, coinMultiplier, and optional Rare Finds roll (common only).
 */
export function computeCoinsForTap(
  baseValue: number,
  tier: 'common' | 'industrial',
  stats: GameStats,
): { coins: number; isRareHit: boolean } {
  const isRareHit = tier === 'common' && stats.rareChance > 0 && Math.random() < stats.rareChance;
  const rareMultiplier = isRareHit ? stats.rareMultiplier : 1;
  const coins = Math.floor(stats.tapPower * baseValue * stats.coinMultiplier * rareMultiplier);
  return { coins, isRareHit };
}

/** Legacy helper — use computeStats instead */
export function getTapPower(upgradesState: Record<UpgradeId, number>): number {
  return 1 + (upgradesState.volunteer ?? 0);
}

/** Legacy helper — use computeStats instead */
export function getSpawnInterval(upgradesState: Record<UpgradeId, number>): number {
  return Math.max(500, 3000 * Math.pow(0.92, upgradesState.spawnRate ?? 0));
}