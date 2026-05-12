import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { createTrash, createTreasure } from '../spawn';
import { getSpawnInterval } from '../economy';

const MAX_TRASH = 30;
const MAX_TREASURES = 5;
/** Base interval in ms between treasure spawns */
const BASE_TREASURE_INTERVAL = 30000;

function getTreasureInterval(cleanliness: number): number {
  // Treasure spawn rate doubles above 50%, triples above 80%
  if (cleanliness >= 0.8) return BASE_TREASURE_INTERVAL / 3;
  if (cleanliness >= 0.5) return BASE_TREASURE_INTERVAL / 2;
  return BASE_TREASURE_INTERVAL;
}

export function useGameLoop() {
  const { tick } = useGameStore();
  const lastTimeRef = useRef<number>(performance.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const loop = (time: number) => {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Update game state
      tick(deltaTime);

      const state = useGameStore.getState();

      // ---- Trash spawning ----
      if (state.spawnTimer <= 0) {
        const nextInterval = getSpawnInterval(state.upgrades);
        const activeTrash = state.trashItems.filter((t) => !t.isRemoving).length;

        if (activeTrash < MAX_TRASH && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const volunteerLevel = state.upgrades['volunteer'] ?? 0;
          const rareFindsLevel = state.upgrades['rare_finds'] ?? 0;
          const newTrash = createTrash(rect.width, rect.height, rareFindsLevel, volunteerLevel);
          if (newTrash) {
            useGameStore.setState((s) => ({
              trashItems: [...s.trashItems, newTrash],
              spawnTimer: nextInterval,
            }));
          } else {
            // 'rare_find' tier rolled — spawn a treasure instead
            const activeTreasures = state.treasureItems.length;
            if (activeTreasures < MAX_TREASURES && canvasRef.current) {
              const r = canvasRef.current.getBoundingClientRect();
              const newTreasure = createTreasure(r.width, r.height);
              useGameStore.setState((s) => ({
                treasureItems: [...s.treasureItems, newTreasure],
                spawnTimer: nextInterval,
              }));
            } else {
              useGameStore.setState({ spawnTimer: nextInterval });
            }
          }
        } else {
          useGameStore.setState({ spawnTimer: nextInterval });
        }
      }

      // ---- Treasure spawning ----
      if (state.treasureSpawnTimer <= 0) {
        const activeTreasures = state.treasureItems.length;
        if (activeTreasures < MAX_TREASURES && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const newTreasure = createTreasure(rect.width, rect.height);
          const nextInterval = getTreasureInterval(state.beachCleanliness);
          useGameStore.setState((s) => ({
            treasureItems: [...s.treasureItems, newTreasure],
            treasureSpawnTimer: nextInterval,
          }));
        } else {
          // Cap reached or no canvas — reset timer using cleanliness-adjusted interval
          const nextInterval = getTreasureInterval(state.beachCleanliness);
          useGameStore.setState({ treasureSpawnTimer: nextInterval });
        }
      }

      // Auto-collect stub (cleanup van upgrade)
      if (state.autoCollectTimer <= 0) {
        useGameStore.setState({ autoCollectTimer: 10000 });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [tick]);

  return canvasRef;
}