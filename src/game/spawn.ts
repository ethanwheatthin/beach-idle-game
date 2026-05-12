import { TrashItem } from './types';
import { randomRange, randomInt, randomElement } from '../utils/rand';

const TRASH_TYPES: { type: TrashItem['type']; emoji: string }[] = [
  { type: 'bottle', emoji: '🍾' },
  { type: 'can', emoji: '🥤' },
  { type: 'wrapper', emoji: '🗑️' },
  { type: 'net', emoji: '🪢' },
];

export function createTrash(canvasWidth: number, canvasHeight: number): TrashItem {
  const typeData = randomElement(TRASH_TYPES);
  // Spawn in the "sand" area (bottom half of canvas)
  const x = randomRange(20, canvasWidth - 20);
  const y = randomRange(canvasHeight * 0.6, canvasHeight - 20);
  const size = randomInt(24, 40);

  return {
    id: Math.random().toString(36).substr(2, 9),
    type: typeData.type,
    emoji: typeData.emoji,
    x,
    y,
    size,
  };
}