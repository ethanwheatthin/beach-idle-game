import React, { useEffect, useRef } from 'react';
import { useGameLoop } from '../game/hooks/useGameLoop';
import { useGameStore } from '../game/store';
import { TrashItem } from '../game/types';
import { renderBeach } from '../render/beach';
import { renderTrash } from '../render/trash';
import { renderParticles, renderTextParticles } from '../render/particles';

const BeachCanvas: React.FC = () => {
  const canvasRef = useGameLoop();
  const { tapTrash } = useGameStore();
  // Use a ref so hover tracking never triggers React re-renders
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

    let animationFrameId: number;

    const render = () => {
      const { trashItems, particles, textParticles } = useGameStore.getState();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderBeach(ctx, canvas.width, canvas.height);
      renderTrash(ctx, trashItems, hoveredIdRef.current);
      renderParticles(ctx, particles);
      renderTextParticles(ctx, textParticles);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef]);

  /** Returns the topmost non-removing trash item under (x, y), or undefined. */
  const getTrashAtPoint = (x: number, y: number): TrashItem | undefined => {
    const { trashItems } = useGameStore.getState();
    return trashItems.find((item) => {
      if (item.isRemoving) return false;
      const dx = item.x - x;
      const dy = item.y - y;
      // Hit radius = full emoji size (24–40px), minimum 22px for mobile HIG
      return Math.sqrt(dx * dx + dy * dy) < Math.max(item.size, 22);
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clicked = getTrashAtPoint(x, y);
    if (clicked) tapTrash(clicked.id, x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hovered = getTrashAtPoint(x, y);
    hoveredIdRef.current = hovered?.id ?? null;
    e.currentTarget.style.cursor = hovered ? 'pointer' : 'default';
  };

  const handleMouseLeave = () => {
    hoveredIdRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full touch-none"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default BeachCanvas;