import { TrashItem } from '../game/types';
import { imageCache } from '../hooks/useAssetLoader';

/** Ease-out quad — decelerates as the item settles onto the sand. */
function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

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

    // Wash-in: slide from waterline to final position, with a small lateral bob
    const washFromY = item.washFromY ?? item.y;
    const prog = item.isRemoving ? 1 : item.spawnProgress;
    const renderedY = prog < 1
      ? washFromY + (item.y - washFromY) * easeOut(prog)
      : item.y;
    const bobX = prog < 1
      ? Math.sin(prog * Math.PI * 3) * 5 * (1 - prog)
      : 0;

    const img = imageCache.get(item.spritePath);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(item.x + bobX, renderedY);
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