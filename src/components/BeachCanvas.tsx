import React, { useEffect, useRef } from 'react';
import { useGameLoop } from '../game/hooks/useGameLoop';
import { useGameStore } from '../game/store';
import { renderBeach } from '../render/beach';
import { renderTrash } from '../render/trash';
import { renderParticles } from '../render/particles';

const BeachCanvas: React.FC = () => {
  const canvasRef = useGameLoop();
  const { trashItems, particles, tapTrash } = useGameStore();

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
      // Access the latest state directly from the store to avoid re-running the effect
      const { trashItems: currentTrash, particles: currentParticles } = useGameStore.getState();
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderBeach(ctx, canvas.width, canvas.height);
      renderTrash(ctx, currentTrash);
      renderParticles(ctx, currentParticles);
      
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };

  }, [canvasRef]); // Only depend on canvasRef

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if a trash item was clicked
    const clickedTrash = trashItems.find((item) => {
      const dx = item.x - x;
      const dy = item.y - y;
      return Math.sqrt(dx * dx + dy * dy) < item.size / 2;
    });

    if (clickedTrash) {
      tapTrash(clickedTrash.id, x, y);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full touch-none"
      onClick={handleCanvasClick}
    />
  );
};

export default BeachCanvas;