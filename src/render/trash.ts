import { TrashItem } from '../game/types';

export function renderTrash(
  ctx: CanvasRenderingContext2D,
  trashItems: TrashItem[],
  hoveredId: string | null = null,
) {
  trashItems.forEach((item) => {
    const isHovered = item.id === hoveredId && !item.isRemoving;
    // Scale 1.2x during the 80ms removal animation; 1.1x on hover
    const scale = item.isRemoving ? 1.2 : isHovered ? 1.1 : 1.0;

    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.scale(scale, scale);
    ctx.font = `${item.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, 0, 0);
    ctx.restore();
  });
}