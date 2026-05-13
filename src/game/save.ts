import { GameState, UpgradeId } from './types';
import { computeStats } from './economy';

const SAVE_KEY_V2 = 'beach-idle-save-v2';
const SAVE_KEY_V3 = 'beach-idle-save-v3';

interface SaveDataV3 {
  coins: number;
  totalTrashCleaned: number;
  upgrades: Record<UpgradeId, number>;
  collection: string[];
  unlockedMilestones: string[];
  musicEnabled: boolean;
  lastSaveTime: number;
}

function defaultUpgrades(): Record<UpgradeId, number> {
  return { volunteer: 0, binCapacity: 0, cleanupVan: 0, spawnRate: 0, rareFinds: 0 };
}

export function saveGame(state: Partial<GameState>): void {
  const { coins, totalTrashCleaned, upgrades, collection, unlockedMilestones, musicEnabled } =
    state as GameState;
  const saveData: SaveDataV3 = {
    coins,
    totalTrashCleaned,
    upgrades,
    collection: collection ? [...collection] : [],
    unlockedMilestones: unlockedMilestones ? [...unlockedMilestones] : [],
    musicEnabled: musicEnabled ?? true,
    lastSaveTime: Date.now(),
  };
  localStorage.setItem(SAVE_KEY_V3, JSON.stringify(saveData));
}

export function loadGame(): Partial<GameState> | null {
  // Try v3 first
  const savedV3 = localStorage.getItem(SAVE_KEY_V3);
  if (savedV3) {
    try {
      const data: SaveDataV3 = JSON.parse(savedV3);
      const upgrades = { ...defaultUpgrades(), ...(data.upgrades ?? {}) };
      return {
        coins: data.coins ?? 0,
        totalTrashCleaned: data.totalTrashCleaned ?? 0,
        upgrades,
        stats: computeStats(upgrades),
        collection: new Set<string>(data.collection ?? []),
        unlockedMilestones: new Set<string>(data.unlockedMilestones ?? []),
        musicEnabled: data.musicEnabled ?? true,
        lastSaveTime: data.lastSaveTime ?? Date.now(),
      };
    } catch (e) {
      console.error('Failed to parse v3 save', e);
    }
  }

  // Migrate from v2 (snake_case upgrade keys → camelCase)
  const savedV2 = localStorage.getItem(SAVE_KEY_V2);
  if (savedV2) {
    try {
      const data = JSON.parse(savedV2);
      console.info('[Save] Migrating v2 → v3');
      const old = data.upgrades ?? {};
      const upgrades: Record<UpgradeId, number> = {
        volunteer: old.volunteer ?? 0,
        binCapacity: old.bin_capacity ?? 0,
        cleanupVan: old.cleanup_van ?? 0,
        spawnRate: old.spawn_rate ?? 0,
        rareFinds: old.rare_finds ?? 0,
      };
      const migrated: Partial<GameState> = {
        coins: data.coins ?? 0,
        totalTrashCleaned: data.totalTrashCleaned ?? 0,
        upgrades,
        stats: computeStats(upgrades),
        collection: new Set<string>(data.collection ?? []),
        unlockedMilestones: new Set<string>(),
        musicEnabled: data.musicEnabled ?? true,
        lastSaveTime: data.lastSaveTime ?? Date.now(),
      };
      saveGame(migrated as GameState);
      localStorage.removeItem(SAVE_KEY_V2);
      return migrated;
    } catch (e) {
      console.error('Failed to migrate v2 save', e);
    }
  }

  return null;
}

export function resetGame(): void {
  localStorage.removeItem(SAVE_KEY_V2);
  localStorage.removeItem(SAVE_KEY_V3);
  window.location.reload();
}