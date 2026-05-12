// ============================================================
// Asset Manifest — single source of truth for all sprite paths.
// All paths are relative to /public (served at root by Vite).
// ============================================================

// --------------- TRASH SPRITES ---------------

export const TRASH_SPRITES = {
  common: {
    alcohol: [
      '/assets/trash-assets/alcohol 1.png',
      '/assets/trash-assets/alcohol 2.png',
      '/assets/trash-assets/alcohol 3.png',
      '/assets/trash-assets/alcohol 4.png',
    ],
    waterBottle: [
      '/assets/trash-assets/water bottle clean.png',
      '/assets/trash-assets/water bottle crumpled.png',
      '/assets/trash-assets/water bottle dirty.png',
      '/assets/trash-assets/water bottle clean & small.png',
      '/assets/trash-assets/water bottle crumpled & small.png',
      '/assets/trash-assets/water bottle dirty & small.png',
    ],
    crumpledPaper: [
      '/assets/trash-assets/crumpled paper 1.png',
      '/assets/trash-assets/crumpled paper 2.png',
    ],
    rottingFood: [
      '/assets/trash-assets/rotting food.png',
      '/assets/trash-assets/rotting food 2.png',
    ],
    garbageBag: [
      '/assets/trash-assets/garbage bag 1.png',
      '/assets/trash-assets/garbage bag 2.png',
      '/assets/trash-assets/garbage bag small 1.png',
      '/assets/trash-assets/garbage bag small 2.png',
      '/assets/trash-assets/garbage bag small 3.png',
    ],
    box: [
      '/assets/trash-assets/box 1.png',
      '/assets/trash-assets/box 2.png',
      '/assets/trash-assets/box 3.png',
    ],
    recycling: [
      '/assets/trash-assets/recycling 1.png',
      '/assets/trash-assets/recycling 2.png',
    ],
  },
  industrial: {
    computer: [
      '/assets/trash-assets/computer 1.png',
      '/assets/trash-assets/computer 2.png',
    ],
    screen: [
      '/assets/trash-assets/screen 1.png',
      '/assets/trash-assets/screen 2.png',
      '/assets/trash-assets/screen 3.png',
    ],
    satellite: [
      '/assets/trash-assets/satellite dish.png',
    ],
    washer: [
      '/assets/trash-assets/washer.png',
    ],
    dryer: [
      '/assets/trash-assets/dryer.png',
    ],
    rustySheet: [
      '/assets/trash-assets/rusty sheet metal tile 16x16 1.png',
      '/assets/trash-assets/rusty sheet metal tile 16x16 2.png',
      '/assets/trash-assets/rusty sheet metal tile blue 16x16 1.png',
      '/assets/trash-assets/rusty sheet metal tile blue 16x16 2.png',
    ],
    crackedPaint: [
      '/assets/trash-assets/cracked paint tile 16x16 1.png',
      '/assets/trash-assets/cracked paint tile 16x16 2.png',
      '/assets/trash-assets/cracked paint tile 16x16 3.png',
    ],
  },
} as const;

export type TrashCommonCategory = keyof typeof TRASH_SPRITES.common;
export type TrashIndustrialCategory = keyof typeof TRASH_SPRITES.industrial;
export type TrashCategory = TrashCommonCategory | TrashIndustrialCategory;

// --------------- TREASURE SPRITES ---------------

export interface TreasureEntry {
  path: string;
  displayName: string;
  flavor: string;
}

export interface DriftwoodEntry {
  frames: readonly string[];
  displayName: string;
  flavor: string;
}

export const TREASURE_MANIFEST = {
  shells: {
    angelWing:   { path: '/assets/shells/angelWing/angelWing_16x16.png',     displayName: 'Angel Wing',  flavor: 'A delicate shell, easy to overlook in the surf.' },
    auger:       { path: '/assets/shells/auger/auger_16x16.png',             displayName: 'Auger',       flavor: 'Twisted into a perfect spiral by years in the sea.' },
    clam_1:      { path: '/assets/shells/clam/clam_1_16x16.png',             displayName: 'Clam',        flavor: 'Two halves of a once-sheltered life.' },
    clam_2:      { path: '/assets/shells/clam/clam_2_16x16.png',             displayName: 'Open Clam',   flavor: 'Still pristine, as if just opened by the tide.' },
    comrie:      { path: '/assets/shells/comrie/comrie_16x16.png',           displayName: 'Comrie',      flavor: 'A rare find named for the Scottish town.' },
    conch_1:     { path: '/assets/shells/conch/conch_1_16x16.png',           displayName: 'Conch',       flavor: 'Hold it to your ear — the ocean is listening.' },
    conch_2:     { path: '/assets/shells/conch/conch_2_16x16.png',           displayName: 'Queen Conch', flavor: 'Majestic even stranded on the shore.' },
    coquinas:    { path: '/assets/shells/coquinas/coquinas_16x16.png',       displayName: 'Coquinas',    flavor: 'Tiny wedge clams that live in the surf zone.' },
    junonia:     { path: '/assets/shells/junonia/junonia_16x16.png',         displayName: 'Junonia',     flavor: 'One of the most prized shells on any beach.' },
    urchin:      { path: '/assets/shells/kina/urchin_16x16.png',             displayName: 'Sea Urchin',  flavor: 'The kina of New Zealand — a prickly treasure.' },
    murex:       { path: '/assets/shells/murex/murex_16x16.png',             displayName: 'Murex',       flavor: 'Ancient dye-makers prized these above gold.' },
    mussel_1:    { path: '/assets/shells/mussel/mussel_1_16x16.png',         displayName: 'Mussel',      flavor: 'Iridescent blue-black, strung by silk threads.' },
    mussel_2:    { path: '/assets/shells/mussel/mussel_2_16x16.png',         displayName: 'Open Mussel', flavor: 'Hinged wide like a tiny book of the sea.' },
    nautilus:    { path: '/assets/shells/nautilus/nautilus_16x16.png',       displayName: 'Nautilus',    flavor: 'A living fossil that has barely changed in 500 million years.' },
    oyster:      { path: '/assets/shells/oyster/oyster_16x16.png',           displayName: 'Oyster',      flavor: 'Rough outside, pearl-smooth within.' },
    paua_1:      { path: '/assets/shells/paua/paua_1_16x16.png',             displayName: 'Paua',        flavor: 'New Zealand abalone — a rainbow captured in shell.' },
    paua_2:      { path: '/assets/shells/paua/paua_2_16x16.png',             displayName: 'Paua Inside', flavor: 'The iridescent interior glows like an oil slick.' },
    periwinkle:  { path: '/assets/shells/periwinkle/periwinkle_16x16.png',   displayName: 'Periwinkle',  flavor: 'Small, common, and endlessly pleasing to collect.' },
    scallop_1:   { path: '/assets/shells/scallop/scallop_1_16x16.png',       displayName: 'Scallop',     flavor: 'The pilgrim\'s symbol, carried across centuries.' },
    scallop_2:   { path: '/assets/shells/scallop/scallop_2_16x16.png',       displayName: 'Bay Scallop', flavor: 'Smaller but just as perfectly ridged.' },
    sharkEye:    { path: '/assets/shells/sharkEye/sharkEye_16x16.png',       displayName: 'Shark Eye',   flavor: 'A moon snail shell — that spiral is an eye watching you.' },
    slipper:     { path: '/assets/shells/slipper/slipper_16x16.png',         displayName: 'Slipper',     flavor: 'Stacks in chains of up to ten, parasol-flat.' },
    sundial_1:   { path: '/assets/shells/sundial/sundial_1_16x16.png',       displayName: 'Sundial',     flavor: 'Its spiral staircase shape tells no time, just beauty.' },
    sundial_2:   { path: '/assets/shells/sundial/sundial_2_16x16.png',       displayName: 'Sundial Top', flavor: 'Viewed from above, a perfect geometric flower.' },
    triton:      { path: '/assets/shells/triton/triton_16x16.png',           displayName: 'Triton',      flavor: 'The trumpet of the sea god, found on tropical shores.' },
    tulip_1:     { path: '/assets/shells/tulip/tulip_1_16x16.png',           displayName: 'Tulip',       flavor: 'Named for the flower it vaguely resembles.' },
    tulip_2:     { path: '/assets/shells/tulip/tulip_2_16x16.png',           displayName: 'True Tulip',  flavor: 'Smooth, elongated, unmistakably elegant.' },
    tulip_3:     { path: '/assets/shells/tulip/tulip_3_16x16.png',           displayName: 'Banded Tulip', flavor: 'Soft brown spirals wrap this glossy shell.' },
    tulip_4:     { path: '/assets/shells/tulip/tulip_4_16x16.png',           displayName: 'Tulip Variant', flavor: 'A rarer patterning of the classic tulip form.' },
    whelk:       { path: '/assets/shells/whelk/whelk_16x16.png',             displayName: 'Whelk',       flavor: 'Once used as currency along the North Atlantic coast.' },
  } satisfies Record<string, TreasureEntry>,

  starfish: {
    // NOTE: coscinasterias, patiria, pentagonaster, purpleLeather, sunflower, sunstar
    // only have .clip (Aseprite) source files — no exported PNGs available yet.
    astropecten_1: { path: '/assets/starfish/astropecten/astropecten_1_16x16.png', displayName: 'Astropecten',       flavor: 'A sand-dwelling star that hunts by feel in the dark.' },
    astropecten_2: { path: '/assets/starfish/astropecten/astropecten_2_16x16.png', displayName: 'Astropecten (Alt)', flavor: 'Its second pose, arms curled against the current.' },
    blue:          { path: '/assets/starfish/blue/blue_16x16.png',                 displayName: 'Blue Star',         flavor: 'Vivid cobalt against pale sand — hard to miss.' },
    common:        { path: '/assets/starfish/common/common_16x16.png',             displayName: 'Common Star',       flavor: 'The classic five-armed shape children draw from memory.' },
  } satisfies Record<string, TreasureEntry>,

  seaweed: {
    codium:      { path: '/assets/seaweed/codium/codium_16x16.png',           displayName: 'Sea Sponge',  flavor: 'Bright green, branching like a tiny tree.' },
    fukus:       { path: '/assets/seaweed/fukus/fukus_16x16.png',             displayName: 'Fucus',       flavor: 'Known as bladderwrack — pop the bubbles for luck.' },
    hormosira:   { path: '/assets/seaweed/homosira/hormosira_16x16.png',      displayName: 'Hormosira',   flavor: 'Chain-link kelp from Southern Ocean coasts.' },
    kelp_1:      { path: '/assets/seaweed/kelp/kelp_1_16x16.png',             displayName: 'Kelp',        flavor: 'Holds entire ecosystems beneath its waving fronds.' },
    kelp_2:      { path: '/assets/seaweed/kelp/kelp_2_16x16.png',             displayName: 'Kelp Frond',  flavor: 'A single golden ribbon torn from the forest.' },
    kelp_3:      { path: '/assets/seaweed/kelp/kelp_3_16x16.png',             displayName: 'Giant Kelp',  flavor: 'Can grow 30cm a day in the right conditions.' },
    kelp_4:      { path: '/assets/seaweed/kelp/kelp_4_16x16.png',             displayName: 'Bull Kelp',   flavor: 'The whips of it snap in the wind above the waterline.' },
    redAlgae:    { path: '/assets/seaweed/redAlgae/redAlgae_16x16.png',       displayName: 'Red Algae',   flavor: 'Deep crimson seaweed from cold, clear depths.' },
    rhodymenia:  { path: '/assets/seaweed/rhodymenia/rhodymenia_16x16.png',   displayName: 'Dulse',       flavor: 'Salty and chewy — eaten as a snack in Ireland.' },
    ribbonweed_1:{ path: '/assets/seaweed/ribbonweed/ribbonweed_1_16x16.png', displayName: 'Ribbonweed',  flavor: 'Long flat blades ripple like a green flag.' },
    ribbonweed_2:{ path: '/assets/seaweed/ribbonweed/ribbonweed_2_16x16.png', displayName: 'Ribbonweed (Alt)', flavor: 'A narrower strand, almost translucent at the tips.' },
    seagrass:    { path: '/assets/seaweed/seagrass/seagrass_16x16.png',       displayName: 'Seagrass',    flavor: 'Not a seaweed — a flowering plant, rare and vital.' },
    seaLettuce:  { path: '/assets/seaweed/seaLettuce/seaLettuce_16x16.png',   displayName: 'Sea Lettuce', flavor: 'Bright green and almost edible — the lettuce of the sea.' },
    taonia:      { path: '/assets/seaweed/taonia/taonia_16x16.png',           displayName: 'Taonia',      flavor: 'Fan-shaped fronds unfurl in cold Atlantic waters.' },
    umibudo:     { path: '/assets/seaweed/umibudo/umibudo_16x16.png',         displayName: 'Sea Grapes',  flavor: 'Tiny green pearls — a delicacy in Okinawa.' },
  } satisfies Record<string, TreasureEntry>,

  driftwood: {
    driftwood_1: { frames: ['/assets/driftwood/driftwood_1/driftwood1_1_16x16.png', '/assets/driftwood/driftwood_1/driftwood1_2_16x16.png'], displayName: 'Driftwood',        flavor: 'Bleached and smooth, shaped by ten thousand tides.' },
    driftwood_2: { frames: ['/assets/driftwood/driftwood_2/driftwood2_1_16x16.png', '/assets/driftwood/driftwood_2/driftwood2_2_16x16.png'], displayName: 'Sea Log',          flavor: 'A branch that traveled far to reach this shore.' },
    driftwood_3: { frames: ['/assets/driftwood/driftwood_3/driftwood3_1_16x16.png', '/assets/driftwood/driftwood_3/driftwood3_2_16x16.png'], displayName: 'Worn Plank',       flavor: 'Someone\'s boat, or someone\'s dock — hard to say now.' },
    driftwood_4: { frames: ['/assets/driftwood/driftwood_4/driftwood4_1_16x16.png', '/assets/driftwood/driftwood_4/driftwood4_2_16x16.png'], displayName: 'Sea Branch',       flavor: 'Still vaguely tree-shaped despite years at sea.' },
    driftwood_5: { frames: ['/assets/driftwood/driftwood_5/driftwood5_1_16x16.png', '/assets/driftwood/driftwood_5/driftwood5_2_16x16.png'], displayName: 'Knotwood',         flavor: 'A stubborn knot survived when the rest rotted away.' },
    driftwood_6: { frames: ['/assets/driftwood/driftwood_6/driftwood6_1_16x16.png', '/assets/driftwood/driftwood_6/driftwood6_2_16x16.png'], displayName: 'Twisted Timber',   flavor: 'Currents twisted this into a graceful spiral over years.' },
    driftwood_7: { frames: ['/assets/driftwood/driftwood_7/driftwood7_1_16x16.png', '/assets/driftwood/driftwood_7/driftwood7_2_16x16.png'], displayName: 'Root Ball',        flavor: 'An entire root system, compressed by deep-water pressure.' },
    driftwood_8: { frames: ['/assets/driftwood/driftwood_8/driftwood8_1_16x16.png', '/assets/driftwood/driftwood_8/driftwood8_2_16x16.png'], displayName: 'Gnarled Log',      flavor: 'Ancient knots tell the story of a very long life.' },
  } satisfies Record<string, DriftwoodEntry>,
} as const;

export type ShellVariant = keyof typeof TREASURE_MANIFEST.shells;
export type StarfishVariant = keyof typeof TREASURE_MANIFEST.starfish;
export type SeaweedVariant = keyof typeof TREASURE_MANIFEST.seaweed;
export type DriftwoodVariant = keyof typeof TREASURE_MANIFEST.driftwood;
export type TreasureCategory = 'shell' | 'starfish' | 'seaweed' | 'driftwood';

/** Flat list of all paths that need to be preloaded. */
export function getAllAssetPaths(): string[] {
  const paths: string[] = [];

  // Trash
  for (const tier of Object.values(TRASH_SPRITES)) {
    for (const variants of Object.values(tier)) {
      paths.push(...variants);
    }
  }

  // Treasure — shells, starfish, seaweed
  for (const cat of ['shells', 'starfish', 'seaweed'] as const) {
    for (const entry of Object.values(TREASURE_MANIFEST[cat]) as TreasureEntry[]) {
      paths.push(entry.path);
    }
  }

  // Driftwood frames
  for (const entry of Object.values(TREASURE_MANIFEST.driftwood) as DriftwoodEntry[]) {
    paths.push(...entry.frames);
  }

  return paths;
}

/** Display name for a collection key like "shell:angelWing" */
export function getDisplayName(collectionKey: string): string {
  const [cat, variant] = collectionKey.split(':') as [TreasureCategory, string];
  if (cat === 'shell') return TREASURE_MANIFEST.shells[variant as ShellVariant]?.displayName ?? variant;
  if (cat === 'starfish') return TREASURE_MANIFEST.starfish[variant as StarfishVariant]?.displayName ?? variant;
  if (cat === 'seaweed') return TREASURE_MANIFEST.seaweed[variant as SeaweedVariant]?.displayName ?? variant;
  if (cat === 'driftwood') return TREASURE_MANIFEST.driftwood[variant as DriftwoodVariant]?.displayName ?? variant;
  return variant;
}

/** Flavor text for a collection key */
export function getFlavor(collectionKey: string): string {
  const [cat, variant] = collectionKey.split(':') as [TreasureCategory, string];
  if (cat === 'shell') return TREASURE_MANIFEST.shells[variant as ShellVariant]?.flavor ?? '';
  if (cat === 'starfish') return TREASURE_MANIFEST.starfish[variant as StarfishVariant]?.flavor ?? '';
  if (cat === 'seaweed') return TREASURE_MANIFEST.seaweed[variant as SeaweedVariant]?.flavor ?? '';
  if (cat === 'driftwood') return TREASURE_MANIFEST.driftwood[variant as DriftwoodVariant]?.flavor ?? '';
  return '';
}
