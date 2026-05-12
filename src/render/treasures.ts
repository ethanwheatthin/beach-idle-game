import { TreasureItem } from '../game/types';
import { imageCache } from '../hooks/useAssetLoader';

const TREASURE_SIZE = 48;

export function renderTreasures(
  ctx: CanvasRenderingContext2D,
  treasures: TreasureItem[],
  hoveredId: string | null = null,
  canvasHeight: number,
) {
  ctx.imageSmoothingEnabled = false;

  treasures.forEach((item) => {
    const isHovered = item.id === hoveredId;

    // Wash-in: slide up from below the wet-sand line over 600ms
    const slideOffset = (1 - item.spawnProgress) * 20;
    const alpha = item.spawnProgress;

    const img = imageCache.get(item.spritePath);
    const scale = isHovered ? 1.15 : 1.0;
    const half = TREASURE_SIZE / 2;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(item.x, item.y + slideOffset);
    ctx.scale(scale, scale);

    // Subtle glow for treasures
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(255,220,100,0.5)';
    ctx.shadowOffsetY = 0;

    if (img) {
      ctx.drawImage(img, -half, -half, TREASURE_SIZE, TREASURE_SIZE);
    } else {
      // Fallback star
      ctx.fillStyle = '#FFD700';
      ctx.font = `${TREASURE_SIZE}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', 0, 0);
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  });
}

/** Returns the hit radius for treasure hit-testing */
export const TREASURE_HIT_RADIUS = TREASURE_SIZE / 2 + 8;
