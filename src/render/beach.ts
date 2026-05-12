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

  // Sand
  ctx.fillStyle = '#F4A460';
  ctx.fillRect(0, height * 0.6, width, height * 0.4);

  // Add some texture to sand
  ctx.fillStyle = '#DEB887';
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = height * 0.6 + Math.random() * (height * 0.4);
    const size = Math.random() * 2;
    ctx.fillRect(x, y, size, size);
  }
}