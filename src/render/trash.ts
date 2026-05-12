import { TrashItem } from '../game/types';

export function renderTrash(ctx: CanvasRenderingContext2D, trashItems: TrashItem[]) {
  trashItems.forEach((item) => {
    ctx.font = `${item.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, item.x, item.y);
  });
}