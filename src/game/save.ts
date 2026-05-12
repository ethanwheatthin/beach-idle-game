import { GameState } from './types';

const SAVE_KEY = 'beach-idle-save-v1';

export function saveGame(state: Partial<GameState>): void {
  const saved = localStorage.getItem(SAVE_KEY);
  const currentState: GameState = saved ? JSON.parse(saved) : {
    coins: 0,
    totalTrashCleaned: 0,
    upgrades: {
      volunteer: 0,
      bin_capacity: 0,
      cleanup_van: 0,
      spawn_rate: 0,
      rare_finds: 0,
    },
    trashItems: [],
    particles: [],
    spawnTimer: 3000,
    autoCollectTimer: 10000,
    lastSaveTime: Date.now(),
  };

  const newState = { ...currentState, ...state, lastSaveTime: Date.now() };
  localStorage.setItem(SAVE_KEY, JSON.stringify(newState));
}

export function loadGame(): Partial<GameState> | null {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load game save', e);
    return null;
  }
}

export function resetGame(): void {
  localStorage.removeItem(SAVE_KEY);
  window.location.reload();
}