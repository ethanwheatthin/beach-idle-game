import { TrashItem } from '../game/types';
import { imageCache } from '../hooks/useAssetLoader';

export function renderTrash(
  ctx: CanvasRenderingContext2D,
  trashItems: TrashItem[],
  hoveredId: string | null = null,
) {
  ctx.imageSmoothingEnabled = false;

  trashItems.forEach((item) => {
    const isHovered = item.id === hoveredId && !item.isRemoving;
    const scale = item.isRemoving ? 1.2 : isHovered ? 1.1 : 1.0;
    const alpha = item.isRemoving
      ? Math.max(0, (item.removeTimer ?? 0) / 80)
      : item.spawnProgress;

    const img = imageCache.get(item.spritePath);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rotation);
    ctx.scale(scale, scale);

    // Drop shadow
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';

    const half = item.displaySize / 2;

    if (img) {
      ctx.drawImage(img, -half, -half, item.displaySize, item.displaySize);
    } else {
      // Fallback: coloured rectangle while sprite loads
      ctx.fillStyle = item.tier === 'industrial' ? '#8B4513' : '#888';
      ctx.fillRect(-half, -half, item.displaySize, item.displaySize);
    }

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Progress bar for industrial trash that has multiple hits remaining
    if (!item.isRemoving && item.maxHits > 1 && item.hitsRemaining > 0) {
      const barW = item.displaySize;
      const barH = 4;
      const barX = -half;
      const barY = -half - 8;
      const progress = item.hitsRemaining / item.maxHits;

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = progress > 0.5 ? '#4ade80' : progress > 0.25 ? '#fbbf24' : '#f87171';
      ctx.fillRect(barX, barY, barW * progress, barH);
    }

    ctx.restore();
  });
}