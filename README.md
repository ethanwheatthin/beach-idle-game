# Beach Idle Game — Week 1 Starter Prompt

> **How to use this:** Drop this file into your repo at the root as `WEEK_1_PROMPT.md` (or rename to `CLAUDE.md` if you want Claude Code to auto-load it). Then feed it to Claude Code in your terminal: `claude` from the repo root, then paste the "Week 1 Build Task" section below. Or just paste the whole thing.

---

## Project: Beach Idle Game (working title: Tideline)

A relaxing, ambient idle game where the player taps to clean up a polluted beach. The beach visibly transforms from dirty to pristine as you progress. Inspired by Droplet Idle, with a stronger emotional hook (restoration as the core fantasy).

**Long-term vision:** Free mobile app (iOS + Android) + web build, monetized via rewarded ads only (no interstitials, no energy systems, no paywalls on content). Positioned as a "relaxing/mental health" app, not a hardcore idle grind.

**Week 1 goal:** A playable web prototype with the core tap-to-collect loop, one upgrade working end-to-end, currency display, and save/load. Should feel *satisfying to tap* by end of week. Mobile wrapping (Capacitor) and ads come in week 3+.

---

## Tech Stack (locked — don't deviate)

- **React 18 + Vite + TypeScript** — fast dev, familiar
- **Zustand** for state management (game state lives here)
- **HTML Canvas** for the beach rendering (NOT Phaser — overkill for v1)
- **Tailwind CSS** for UI overlays (menus, upgrade buttons, currency display)
- **localStorage** for saves (Capacitor Preferences in mobile build later)
- **Vitest** for any unit tests (mainly the economy math)

**Do not add:**
- Phaser, PixiJS, or any game engine (HTML canvas is enough for v1)
- Redux, Jotai, or other state libs (Zustand only)
- Backend, accounts, cloud sync (localStorage only)
- Big-number libraries (we won't overflow `Number.MAX_SAFE_INTEGER` in MVP — handle formatting manually)
- Routing libraries (single-page app, no routes needed)

---

## Repo Structure (target)

```
beach-idle-game/
├── public/
│   └── assets/
│       ├── sprites/       # trash sprites, beach sprites
│       ├── audio/         # ocean ambient loop, tap sounds
│       └── backgrounds/   # parallax layers
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── BeachCanvas.tsx       # the canvas + tap handling
│   │   ├── CurrencyDisplay.tsx   # top-bar currency readout
│   │   ├── UpgradePanel.tsx      # the upgrade menu
│   │   └── UpgradeButton.tsx     # individual upgrade row
│   ├── game/
│   │   ├── store.ts              # Zustand store (the game state)
│   │   ├── economy.ts            # cost curves, currency math
│   │   ├── spawn.ts              # trash spawn logic + tick loop
│   │   ├── upgrades.ts           # upgrade definitions + effects
│   │   ├── save.ts               # localStorage save/load
│   │   └── types.ts              # shared types
│   ├── render/
│   │   ├── beach.ts              # background + sand rendering
│   │   ├── trash.ts              # trash sprite rendering + animation
│   │   └── particles.ts          # tap juice (poofs, +N popups)
│   ├── hooks/
│   │   ├── useGameLoop.ts        # requestAnimationFrame tick
│   │   └── useAutoSave.ts        # save every N seconds
│   └── utils/
│       ├── format.ts             # 1234 -> "1.2K", 1500000 -> "1.5M"
│       └── rand.ts               # seeded RNG for spawn positions
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## Week 1 Build Task (paste this to Claude Code)

Build a working Vite + React + TypeScript + Tailwind + Zustand prototype of a beach idle game with these exact behaviors. Use the repo structure above. Write clean, commented TypeScript. Prefer small, focused files.

### Core Loop (must work end of week 1)

1. **A beach scene renders on an HTML canvas** that fills most of the viewport. Use a simple gradient or placeholder background for now (sky on top, water in the middle, sand on the bottom — three horizontal bands is fine for week 1, no parallax yet).

2. **Trash sprites spawn on the sand area** at random positions over time. Spawn rate starts at 1 trash piece every 3 seconds. Cap the total visible trash at 30 pieces (don't spawn more until some are cleaned). Each trash piece is one of 4 types (bottle, can, wrapper, net) — for now use 4 different colored rectangles or emoji as placeholders (🥤, 🍾, 🗑️, 🪢). Real sprites get swapped in later.

3. **Tapping/clicking a trash piece removes it and grants currency.** Default value: 1 coin per trash piece. Show a `+1` particle/popup that floats up and fades out at the tap location. Play a subtle tap sound (placeholder beep is fine for now — use Web Audio API to generate a short pop).

4. **Currency displays at the top of the screen.** Show as "🪙 1,234" formatted with commas. Use a `formatNumber(n)` util that handles 1.2K / 1.5M / 1.3B abbreviations for numbers ≥ 10,000.

5. **An upgrade panel is accessible** via a button in the bottom-right. Opens a modal/drawer. Lists the 5 upgrades from the spec below. Each shows: name, description, current level, current effect, next-level effect, cost. Buying an upgrade deducts currency and increases its level.

6. **One upgrade must be fully wired end-to-end:** "Volunteer" (tap power). Each level adds +1 to the currency gained per tap. Costs `10 * 1.5^level` rounded, starting at level 0 cost 10. So level 1 cost = 10, level 2 = 15, level 3 = 22, etc. Cap at level 50.

7. **Save and load to localStorage.** Auto-save every 5 seconds. Load on app boot. Save state includes: currency, all upgrade levels, total trash cleaned. Use a single JSON blob under key `beach-idle-save-v1`.

8. **A reset button in a settings menu** that clears localStorage and reloads.

### Upgrades to Define (only Volunteer fully wired in week 1)

Define all 5 in `upgrades.ts` with their cost curves and effects, but only `Volunteer` needs to actually do something this week. The others should appear in the UI as disabled/coming-soon or just have their effect functions stubbed.

| Upgrade | Effect | Base Cost | Cost Curve | Max Level |
|---|---|---|---|---|
| **Volunteer** | +1 tap power per level | 10 | `base * 1.5^level` | 50 |
| **Bin Capacity** | +10% currency per piece per level | 25 | `base * 1.7^level` | 30 |
| **Cleanup Van** | Auto-collects 1 trash every 10s, scaling | 100 | `base * 2.0^level` | 25 |
| **Spawn Rate** | -5% spawn interval per level (faster trash) | 50 | `base * 1.8^level` | 20 |
| **Rare Finds** | +1% chance of 10x value trash per level | 200 | `base * 2.2^level` | 15 |

### Visual/Feel Requirements (the "juice")

This is what makes idle games feel good. Don't skip:

- **Tap feedback:** When trash is tapped, it briefly scales up (1.2x for 80ms) then disappears. A `+N` text popup floats up 40px over 600ms while fading out.
- **Particles:** 4-6 small "poof" particles spread from the tap point with random velocities, fading out over 400ms.
- **Currency counter animation:** When currency increases, the number briefly pulses (scale 1.1x for 150ms) and the new value tweens up from the old value over 200ms (not an instant jump).
- **Upgrade purchase feedback:** Button pulses green briefly, currency display does a subtle shake.
- **Hover state on desktop:** Trash pieces brighten/scale slightly on hover.
- **Mobile touch:** Make sure tap targets are at least 44x44px (Apple HIG minimum).

### Game Loop Architecture

- Use a single `useGameLoop` hook that runs `requestAnimationFrame` and calls a `tick(deltaMs)` function on the Zustand store.
- The store's `tick` handles: spawn timer countdown, auto-collector timer countdown (stub for now), particle updates.
- Render is separate from tick — render happens every RAF, but game state only updates on tick boundaries.
- Aim for 60fps. If you find yourself doing heavy work per frame, batch it.

### State Shape (Zustand)

```ts
type GameState = {
  // Currency
  coins: number;
  totalTrashCleaned: number;
  
  // Upgrades (level for each)
  upgrades: Record<UpgradeId, number>;
  
  // Live game state
  trashItems: TrashItem[];          // currently on screen
  particles: Particle[];             // currently animating
  spawnTimer: number;                // ms until next spawn
  autoCollectTimer: number;          // ms until next auto-collect (stub)
  
  // Actions
  tick: (deltaMs: number) => void;
  tapTrash: (id: string) => void;
  buyUpgrade: (id: UpgradeId) => void;
  reset: () => void;
};
```

### Don't Build This Week (v2+)

Resist the urge. Add these to a `TODO.md` instead:

- Prestige system
- Day/night cycle
- Multiple beaches
- Photo mode
- Collection journal
- Beachgoers (the third pillar)
- Treasures (the second pillar — shells, sea glass)
- Real ads (Capacitor + AdMob comes week 3)
- Cloud save / accounts
- Settings beyond mute and reset
- Animations more complex than scale/fade
- Real sprite art (placeholder emoji/rects this week)

### Acceptance Criteria for End of Week 1

- [ ] `npm install && npm run dev` boots a working game
- [ ] Trash spawns visibly on the beach over time
- [ ] Tapping trash gives coins, with satisfying feedback (popup, particle, sound, brief scale)
- [ ] Currency display formats nicely and animates on change
- [ ] Volunteer upgrade can be purchased and visibly increases tap power
- [ ] Save persists across page reloads
- [ ] Reset button works
- [ ] Other 4 upgrades visible in the panel (even if stubbed)
- [ ] Runs at 60fps with 30 trash items on screen
- [ ] Works on mobile Safari and Chrome (test by opening dev server on phone via local IP)

### Notes for Claude Code

- **Don't overthink it.** This is week 1 of a prototype. Working > pretty. The art swap and Capacitor wrap come later.
- **Read this whole prompt before starting.** Then make a plan and execute.
- **Commit in logical chunks** — initial scaffold, then state store, then canvas rendering, then upgrades, then save system, then juice.
- **If something in this spec seems wrong or contradictory, flag it before building** — don't silently deviate.
- **Use TypeScript strict mode.** No `any` unless commented why.
- **Keep components small.** If a file is over 200 lines, consider splitting.

---

## Assets to Drop In (do this before running)

Download these from itch.io and place in `public/assets/`:

1. **Shore Things Asset Pack** by Pluto ($1) — `public/assets/sprites/beach/`
2. **Trash and Junk asset pack** by BTL games (free) — `public/assets/sprites/trash/`
3. **Animated Pixel Art Beach** by DiegoTaFazendoUmJoguinho (free) — `public/assets/backgrounds/`
4. Ocean ambient loop from freesound.org (search "ocean waves loop", grab a CC0 one) — `public/assets/audio/ocean.mp3`

For week 1, you can run with placeholders. Asset integration is a week 2 task.

---

## Quick Start After Cloning

```bash
# install
npm install

# run dev server
npm run dev

# build for production
npm run build

# preview production build
npm run preview
```

---

## Future Roadmap (for context, not for week 1)

- **Week 2:** Real sprite art swapped in, parallax background, ocean audio, polish pass on juice
- **Week 3:** Capacitor wrap, AdMob plugin, rewarded ads (2x offline, 2x session boost)
- **Week 4:** App Store + Play Store submission, web launch on tideline.app (or whatever domain)
- **Post-launch:** Add treasures pillar (v1.1), beachgoers pillar (v1.2), second beach (v1.3), photo mode (v1.4)

Ship the MVP. Measure D7 retention. Iterate from there.
