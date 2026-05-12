import { GameState } from './types';

const SAVE_KEY_V1 = 'beach-idle-save-v1';
const SAVE_KEY_V2 = 'beach-idle-save-v2';

interface SaveDataV2 {
  coins: number;
  totalTrashCleaned: number;
  upgrades: GameState['upgrades'];
  collection: string[];   // serialized from Set<string>
  musicEnabled: boolean;
  lastSaveTime: number;
}

export function saveGame(state: Partial<GameState>): void {
  // Only persist durable fields — never save live canvas/animation state.
  const { coins, totalTrashCleaned, upgrades, collection, musicEnabled } = state as GameState;
  const saveData: SaveDataV2 = {
    coins,
    totalTrashCleaned,
    upgrades,
    collection: collection ? [...collection] : [],
    musicEnabled: musicEnabled ?? true,
    lastSaveTime: Date.now(),
  };
  localStorage.setItem(SAVE_KEY_V2, JSON.stringify(saveData));
}

export function loadGame(): Partial<GameState> | null {
  // Try v2 first
  const savedV2 = localStorage.getItem(SAVE_KEY_V2);
  if (savedV2) {
    try {
      const data: SaveDataV2 = JSON.parse(savedV2);
      return {
        coins: data.coins ?? 0,
        totalTrashCleaned: data.totalTrashCleaned ?? 0,
        upgrades: data.upgrades ?? {
          volunteer: 0, bin_capacity: 0, cleanup_van: 0, spawn_rate: 0, rare_finds: 0,
        },
        collection: new Set<string>(data.collection ?? []),
        musicEnabled: data.musicEnabled ?? true,
        lastSaveTime: data.lastSaveTime ?? Date.now(),
      };
    } catch (e) {
      console.error('Failed to parse v2 save', e);
    }
  }

  // Migrate from v1
  const savedV1 = localStorage.getItem(SAVE_KEY_V1);
  if (savedV1) {
    try {
      const v1 = JSON.parse(savedV1);
      console.info('[Save] Migrating v1 save to v2');
      const migrated: Partial<GameState> = {
        coins: v1.coins ?? 0,
        totalTrashCleaned: v1.totalTrashCleaned ?? 0,
        upgrades: v1.upgrades ?? {
          volunteer: 0, bin_capacity: 0, cleanup_van: 0, spawn_rate: 0, rare_finds: 0,
        },
        collection: new Set<string>(),
        musicEnabled: true,
        lastSaveTime: v1.lastSaveTime ?? Date.now(),
      };
      // Persist as v2 and remove v1
      saveGame(migrated as GameState);
      localStorage.removeItem(SAVE_KEY_V1);
      return migrated;
    } catch (e) {
      console.error('Failed to migrate v1 save', e);
    }
  }

  return null;
}

export function resetGame(): void {
  localStorage.removeItem(SAVE_KEY_V1);
  localStorage.removeItem(SAVE_KEY_V2);
  window.location.reload();
}