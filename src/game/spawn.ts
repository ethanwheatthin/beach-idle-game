import { TrashItem, TrashTier, TreasureItem } from './types';
import { randomRange, randomElement } from '../utils/rand';
import {
  TRASH_SPRITES,
  TREASURE_MANIFEST,
  TrashCategory,
  ShellVariant,
  StarfishVariant,
  SeaweedVariant,
  DriftwoodVariant,
  TreasureCategory,
} from '../assets/manifest';

// --------------- TRASH SPAWNING ---------------

const COMMON_CATEGORIES = Object.keys(TRASH_SPRITES.common) as Array<keyof typeof TRASH_SPRITES.common>;
const INDUSTRIAL_CATEGORIES = Object.keys(TRASH_SPRITES.industrial) as Array<keyof typeof TRASH_SPRITES.industrial>;

function pickTrashTier(rareFindsBonusChance: number): TrashTier | 'rare_find' {
  const roll = Math.random();
  if (roll < 0.01 + rareFindsBonusChance * 0.001) return 'rare_find';
  const industrialChance = 0.14 + rareFindsBonusChance * 0.01;
  if (roll < 0.01 + industrialChance) return 'industrial';
  return 'common';
}

export function createTrash(
  canvasWidth: number,
  canvasHeight: number,
  rareFindsLevel: number,
  volunteerLevel: number,
  waterlineY?: number,
): TrashItem | null {
  const tier = pickTrashTier(rareFindsLevel);
  // 'rare_find' tier spawns a treasure, not trash — caller handles this separately
  if (tier === 'rare_find') return null;

  let category: TrashCategory;
  let spritePaths: readonly string[];
  let baseValue: number;
  let maxHits: number;
  let displaySize: number;

  if (tier === 'common') {
    const cat = randomElement(COMMON_CATEGORIES);
    category = cat as TrashCategory;
    spritePaths = TRASH_SPRITES.common[cat];
    baseValue = 1;
    maxHits = 1;
    displaySize = 48;
  } else {
    const cat = randomElement(INDUSTRIAL_CATEGORIES);
    category = cat as TrashCategory;
    spritePaths = TRASH_SPRITES.industrial[cat as keyof typeof TRASH_SPRITES.industrial];
    baseValue = 25;
    // Industrial takes 3 hits; volunteer 10+ reduces by 1, volunteer 20+ by 2 (min 1)
    const hitReduction = volunteerLevel >= 20 ? 2 : volunteerLevel >= 10 ? 1 : 0;
    maxHits = Math.max(1, 3 - hitReduction);
    displaySize = 96;
  }

  const spritePath = randomElement(spritePaths as string[]);
  const x = randomRange(30, canvasWidth - 30);
  // Rest position safely below the waterline so items always land on visible sand
  const minSandY = Math.max((waterlineY ?? canvasHeight * 0.60) + 30, canvasHeight * 0.67);
  const y = randomRange(minSandY, canvasHeight - 20);
  // Random rotation -5° to +5°
  const rotation = (Math.random() - 0.5) * (Math.PI / 18);

  return {
    id: Math.random().toString(36).substring(2, 11),
    tier: tier as TrashTier,
    category,
    spritePath,
    x,
    y,
    displaySize,
    rotation,
    hitsRemaining: maxHits,
    maxHits,
    baseValue,
    spawnProgress: 0,
    washFromY: (waterlineY ?? canvasHeight * 0.60) - 5,
  };
}

// --------------- TREASURE SPAWNING ---------------

const SHELL_VARIANTS = Object.keys(TREASURE_MANIFEST.shells) as ShellVariant[];
const STARFISH_VARIANTS = Object.keys(TREASURE_MANIFEST.starfish) as StarfishVariant[];
const SEAWEED_VARIANTS = Object.keys(TREASURE_MANIFEST.seaweed) as SeaweedVariant[];
const DRIFTWOOD_VARIANTS = Object.keys(TREASURE_MANIFEST.driftwood) as DriftwoodVariant[];

const TREASURE_CATEGORIES: TreasureCategory[] = ['shell', 'starfish', 'seaweed', 'driftwood'];

export function createTreasure(canvasWidth: number, canvasHeight: number): TreasureItem {
  const category = randomElement(TREASURE_CATEGORIES);

  let variant: string;
  let spritePath: string;

  switch (category) {
    case 'shell': {
      const v = randomElement(SHELL_VARIANTS);
      variant = v;
      spritePath = TREASURE_MANIFEST.shells[v].path;
      break;
    }
    case 'starfish': {
      const v = randomElement(STARFISH_VARIANTS);
      variant = v;
      spritePath = TREASURE_MANIFEST.starfish[v].path;
      break;
    }
    case 'seaweed': {
      const v = randomElement(SEAWEED_VARIANTS);
      variant = v;
      spritePath = TREASURE_MANIFEST.seaweed[v].path;
      break;
    }
    case 'driftwood': {
      const v = randomElement(DRIFTWOOD_VARIANTS);
      variant = v;
      spritePath = TREASURE_MANIFEST.driftwood[v].frames[0];
      break;
    }
  }

  // Spawn on wet sand — the band between 58% and 64% of canvas height
  const x = randomRange(30, canvasWidth - 30);
  const y = randomRange(canvasHeight * 0.58, canvasHeight * 0.64);

  return {
    id: Math.random().toString(36).substring(2, 11),
    category,
    variant,
    collectionKey: `${category}:${variant}`,
    spritePath,
    x,
    y,
    spawnProgress: 0,
    animFrame: 0,
    animTimer: 0,
  };
}