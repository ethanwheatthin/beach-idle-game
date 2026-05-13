// Pre-computed sand texture — regenerated only on canvas resize.
let sandTexture: OffscreenCanvas | null = null;
let textureWidth = 0;
let textureHeight = 0;

// Sand texture always covers from SAND_FIXED_TOP fraction to bottom, so tide changes
// don't trigger a regeneration every frame.
const SAND_FIXED_TOP = 0.54;

function getSandTexture(width: number, sandHeight: number): OffscreenCanvas {
  if (sandTexture && textureWidth === width && textureHeight === sandHeight) {
    return sandTexture;
  }
  textureWidth = width;
  textureHeight = sandHeight;
  sandTexture = new OffscreenCanvas(width, sandHeight);
  const tCtx = sandTexture.getContext('2d')!;
  tCtx.fillStyle = '#DEB887';
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * width;
    const y = Math.random() * sandHeight;
    const s = Math.random() * 2 + 0.5;
    tCtx.fillRect(x, y, s, s);
  }
  return sandTexture;
}

// Pre-computed sparkle positions — regenerated only on canvas resize.
interface Sparkle { x: number; y: number; phase: number; speed: number }
let sparkles: Sparkle[] = [];
let sparkleW = 0;
let sparkleH = 0;

function getSparkles(width: number, sandHeight: number): Sparkle[] {
  if (sparkles.length > 0 && sparkleW === width && sparkleH === sandHeight) return sparkles;
  sparkleW = width;
  sparkleH = sandHeight;
  sparkles = Array.from({ length: 35 }, () => ({
    x: Math.random() * width,
    y: Math.random() * sandHeight * 0.65 + sandHeight * 0.12,
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 1.8,
  }));
  return sparkles;
}

// ── Tide ─────────────────────────────────────────────────────────────────────

const TIDE_PERIOD_S = 25;   // seconds per full tide cycle
const TIDE_CENTER   = 0.60; // fraction of canvas height at mean tide
const TIDE_AMP      = 0.04; // ±fraction that the tide rises/falls

/**
 * Returns the current waterline Y in canvas pixels.
 * Exported so the game loop can place spawned items at the live waterline.
 */
export function getWaterlineY(height: number, timeMs: number): number {
  const t = timeMs / 1000;
  return height * (TIDE_CENTER + TIDE_AMP * Math.sin((2 * Math.PI / TIDE_PERIOD_S) * t));
}

// ── Animation helpers ────────────────────────────────────────────────────────

function drawWaveHighlights(
  ctx: CanvasRenderingContext2D,
  width: number,
  waterTop: number,
  waterBottom: number,
  t: number,
  tideMultiplier: number,
) {
  const waterH = waterBottom - waterTop;
  const bands = [
    { relY: 0.14, amp: 4, freq: 0.015, speed:  0.70, alpha: 0.20 },
    { relY: 0.31, amp: 3, freq: 0.012, speed: -0.50, alpha: 0.14 },
    { relY: 0.52, amp: 5, freq: 0.018, speed:  0.90, alpha: 0.22 },
    { relY: 0.73, amp: 3, freq: 0.010, speed: -0.60, alpha: 0.14 },
  ];
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  for (const b of bands) {
    const baseY = waterTop + waterH * b.relY;
    ctx.globalAlpha = b.alpha;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 3) {
      const y = baseY + Math.sin(x * b.freq + t * b.speed * tideMultiplier) * b.amp;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawShoreline(
  ctx: CanvasRenderingContext2D,
  width: number,
  waterlineY: number,
  t: number,
  tideMultiplier: number,
) {
  const maxLap = 14 + (tideMultiplier - 1) * 6; // more foam at high tide
  const fronts = [
    { lapPhase: 0,       lapSpeed: 0.55, waveFreq: 0.020, waveSpeed:  1.1, xOff:  0 },
    { lapPhase: Math.PI, lapSpeed: 0.45, waveFreq: 0.016, waveSpeed: -0.8, xOff: 80 },
  ];
  ctx.save();
  for (const f of fronts) {
    const lap = ((Math.sin(t * f.lapSpeed * tideMultiplier + f.lapPhase) + 1) / 2) * maxLap;
    const foamAlpha = 0.5 + Math.sin(t * f.lapSpeed * tideMultiplier + f.lapPhase) * 0.18;

    ctx.beginPath();
    for (let x = 0; x <= width; x += 3) {
      const y = waterlineY - lap + Math.sin((x + f.xOff) * f.waveFreq + t * f.waveSpeed * tideMultiplier) * 5;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineTo(width, waterlineY + 8);
    ctx.lineTo(0, waterlineY + 8);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, waterlineY - maxLap, 0, waterlineY + 8);
    grad.addColorStop(0, 'rgba(80,170,255,0.22)');
    grad.addColorStop(1, 'rgba(80,170,255,0.06)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    for (let x = 0; x <= width; x += 3) {
      const y = waterlineY - lap + Math.sin((x + f.xOff) * f.waveFreq + t * f.waveSpeed * tideMultiplier) * 5;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255,255,255,${foamAlpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawSandSparkles(
  ctx: CanvasRenderingContext2D,
  width: number,
  sandTop: number,
  sandH: number,
  t: number,
) {
  const sp = getSparkles(width, sandH);
  ctx.save();
  ctx.fillStyle = '#FFFDE7';
  for (const s of sp) {
    const brightness = (Math.sin(t * s.speed + s.phase) + 1) / 2;
    if (brightness < 0.72) continue;
    ctx.globalAlpha = ((brightness - 0.72) / 0.28) * 0.65;
    const size = brightness * 2.5;
    ctx.fillRect(s.x, sandTop + s.y, size, size);
  }
  ctx.restore();
}

// ── Public render function ───────────────────────────────────────────────────

export function renderBeach(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time = 0,
  tideMultiplier = 1,
) {
  const t = time / 1000;
  const waterlineY = getWaterlineY(height, time);

  // Sky
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.3);
  skyGradient.addColorStop(0, '#87CEEB');
  skyGradient.addColorStop(1, '#E0F6FF');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height * 0.3);

  const sandTop = Math.floor(height * SAND_FIXED_TOP);
  const sandH = height - sandTop;
  ctx.fillStyle = '#F4A460';
  ctx.fillRect(0, sandTop, width, sandH);
  ctx.drawImage(getSandTexture(width, sandH), 0, sandTop);

  const waterGradient = ctx.createLinearGradient(0, height * 0.3, 0, waterlineY);
  waterGradient.addColorStop(0, '#1E90FF');
  waterGradient.addColorStop(1, '#00008B');
  ctx.fillStyle = waterGradient;
  ctx.fillRect(0, height * 0.3, width, waterlineY - height * 0.3);

  drawWaveHighlights(ctx, width, height * 0.3, waterlineY, t, tideMultiplier);
  drawShoreline(ctx, width, waterlineY, t, tideMultiplier);
  drawSandSparkles(ctx, width, waterlineY, height - waterlineY, t);
}