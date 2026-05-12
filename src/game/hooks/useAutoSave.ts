import { useEffect } from 'react';
import { useGameStore } from '../store';
import { saveGame } from '../save';

export function useAutoSave(intervalMs: number) {
  useEffect(() => {
    const interval = setInterval(() => {
      // Read current state at save time to avoid stale closure.
      saveGame(useGameStore.getState());
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]); // intervalMs is stable; no store subscription needed
}