import { useEffect } from 'react';
import { useGameStore } from '../store';
import { saveGame } from '../save';

export function useAutoSave(intervalMs: number) {
  const state = useGameStore();

  useEffect(() => {
    const interval = setInterval(() => {
      // Use the current state from the store
      saveGame(state);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [state, intervalMs]);
}