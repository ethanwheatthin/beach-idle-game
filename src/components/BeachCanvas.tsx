import React, { useEffect, useRef } from 'react';
import { useGameLoop } from '../game/hooks/useGameLoop';
import { useGameStore } from '../game/store';
import { TrashItem, TreasureItem } from '../game/types';
import { renderBeach } from '../render/beach';
import { renderTrash } from '../render/trash';
import { renderTreasures, TREASURE_HIT_RADIUS } from '../render/treasures';
import { renderParticles, renderTextParticles } from '../render/particles';

// ── Pure hit-test helpers (use getState(), always current) ──────────────────

function getTreasureAt(x: number, y: number): TreasureItem | undefined {
  return useGameStore.getState().treasureItems.find((item) => {
    const dx = item.x - x;
    const dy = item.y - y;
    return Math.sqrt(dx * dx + dy * dy) < TREASURE_HIT_RADIUS;
  });
}

function getTrashAt(x: number, y: number): TrashItem | undefined {
  return useGameStore.getState().trashItems.find((item) => {
    if (item.isRemoving) return false;
    const dx = item.x - x;
    const dy = item.y - y;
    return Math.sqrt(dx * dx + dy * dy) < Math.max(item.displaySize / 2, 22);
  });
}

function handleTap(x: number, y: number) {
  const { tapTreasure, tapTrash } = useGameStore.getState();
  const treasure = getTreasureAt(x, y);
  if (treasure) { tapTreasure(treasure.id, x, y); return; }
  const trash = getTrashAt(x, y);
  if (trash) tapTrash(trash.id, x, y);
}

// ── Component ───────────────────────────────────────────────────────────────

const BeachCanvas: React.FC = () => {
  const canvasRef = useGameLoop();
  const hoveredIdRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Touch handler registered with passive:false so e.preventDefault() works
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.changedTouches[0];
      handleTap(touch.clientX - rect.left, touch.clientY - rect.top);
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });

    let animationFrameId: number;
    const render = (time: number) => {
      const { trashItems, treasureItems, particles, textParticles } = useGameStore.getState();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      renderBeach(ctx, canvas.width, canvas.height, time);
      renderTreasures(ctx, treasureItems, hoveredIdRef.current, canvas.height);
      renderTrash(ctx, trashItems, hoveredIdRef.current);
      renderParticles(ctx, particles);
      renderTextParticles(ctx, textParticles);
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('touchstart', onTouchStart);
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef]);

  // ── Mouse events ──────────────────────────────────────────────────────────

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleTap(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hovered = getTreasureAt(x, y) ?? getTrashAt(x, y);
    hoveredIdRef.current = hovered?.id ?? null;
    e.currentTarget.style.cursor = hovered ? 'pointer' : 'default';
  };

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full touch-none"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { hoveredIdRef.current = null; }}
    />
  );
};

export default BeachCanvas;
