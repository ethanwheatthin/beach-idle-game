import { GameState } from './types';

const SAVE_KEY = 'beach-idle-save-v1';

export function saveGame(state: Partial<GameState>): void {
  // Only persist durable fields — never save live canvas/animation state.
  const { coins, totalTrashCleaned, upgrades } = state as GameState;
  const saveData = { coins, totalTrashCleaned, upgrades, lastSaveTime: Date.now() };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
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