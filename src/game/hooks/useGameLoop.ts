import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { createTrash } from '../spawn';
import { getSpawnInterval } from '../economy';

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

      // Access the latest state without triggering re-runs of this effect
      const state = useGameStore.getState();

      // Handle spawning if timer reached zero
      if (state.spawnTimer <= 0) {
        const nextInterval = getSpawnInterval(state.upgrades);
        if (state.trashItems.filter(t => !t.isRemoving).length < 30) {
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const newTrash = createTrash(rect.width, rect.height);
            useGameStore.setState((s) => ({
              trashItems: [...s.trashItems, newTrash],
              spawnTimer: nextInterval,
            }));
          }
        } else {
          useGameStore.setState({ spawnTimer: nextInterval });
        }
      }

      // Auto-collect stub
      if (state.autoCollectTimer <= 0) {
        useGameStore.setState((s) => ({
          autoCollectTimer: 10000,
        }));
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [tick]); // Only depend on tick

  return canvasRef;
}