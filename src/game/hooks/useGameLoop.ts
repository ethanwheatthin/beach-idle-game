import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { createTrash, createTreasure } from '../spawn';
import { getWaterlineY } from '../../render/beach';

const MAX_TREASURES = 5;
const BASE_TREASURE_INTERVAL = 30000;

function getTreasureInterval(cleanliness: number): number {
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

      tick(deltaTime);

      const state = useGameStore.getState();
      const { stats } = state;

      // ---- Trash spawning ----
      if (state.spawnTimer <= 0) {
        const activeTrash = state.trashItems.filter((t) => !t.isRemoving).length;

        if (activeTrash < stats.maxTrash && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const volunteerLevel = state.upgrades.volunteer ?? 0;
          const rareFindsLevel = state.upgrades.rareFinds ?? 0;
          const wY = getWaterlineY(rect.height, performance.now());
          const newTrash = createTrash(rect.width, rect.height, rareFindsLevel, volunteerLevel, wY);
          if (newTrash) {
            useGameStore.setState((s) => ({
              trashItems: [...s.trashItems, newTrash],
              spawnTimer: stats.spawnIntervalMs,
            }));
          } else {
            // 'rare_find' tier rolled — spawn a treasure instead
            const activeTreasures = state.treasureItems.length;
            if (activeTreasures < MAX_TREASURES && canvasRef.current) {
              const r = canvasRef.current.getBoundingClientRect();
              const newTreasure = createTreasure(r.width, r.height);
              useGameStore.setState((s) => ({
                treasureItems: [...s.treasureItems, newTreasure],
                spawnTimer: stats.spawnIntervalMs,
              }));
            } else {
              useGameStore.setState({ spawnTimer: stats.spawnIntervalMs });
            }
          }
        } else {
          useGameStore.setState({ spawnTimer: stats.spawnIntervalMs });
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
          const nextInterval = getTreasureInterval(state.beachCleanliness);
          useGameStore.setState({ treasureSpawnTimer: nextInterval });
        }
      }

      // ---- Van start ----
      if (stats.vanCount > 0 && state.vanTimer <= 0 && !state.van && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const wY = getWaterlineY(rect.height, performance.now());
        useGameStore.getState().startVan(rect.width, rect.height, wY);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [tick]);

  return canvasRef;
}