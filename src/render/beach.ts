// Pre-computed sand texture — regenerated only on canvas resize.
let sandTexture: OffscreenCanvas | null = null;
let textureWidth = 0;
let textureHeight = 0;

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

export function renderBeach(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Sky
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.3);
  skyGradient.addColorStop(0, '#87CEEB');
  skyGradient.addColorStop(1, '#E0F6FF');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height * 0.3);

  // Water
  const waterGradient = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.6);
  waterGradient.addColorStop(0, '#1E90FF');
  waterGradient.addColorStop(1, '#00008B');
  ctx.fillStyle = waterGradient;
  ctx.fillRect(0, height * 0.3, width, height * 0.3);

  // Sand base
  const sandY = Math.floor(height * 0.6);
  const sandH = height - sandY;
  ctx.fillStyle = '#F4A460';
  ctx.fillRect(0, sandY, width, sandH);

  // Sand texture (pre-computed offscreen, no random calls per frame)
  ctx.drawImage(getSandTexture(width, sandH), 0, sandY);
}