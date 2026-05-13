import { Particle, TextParticle } from '../game/types';

export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    const size = p.size ?? 3;
    ctx.globalAlpha = Math.max(0, p.life);

    if (p.type === 'golden') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = Math.max(0, p.life) * 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'confetti') {
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.life * Math.PI * 4);
      ctx.fillRect(-size / 2, -size / 2, size, size * 0.6);
      ctx.restore();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1.0;
}

/** Renders floating "+N" coin popups that rise and fade after a tap. */
export function renderTextParticles(ctx: CanvasRenderingContext2D, textParticles: TextParticle[]) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  textParticles.forEach((tp) => {
    const fontSize = tp.fontSize ?? 18;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.globalAlpha = Math.max(0, tp.life);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeText(tp.text, tp.x, tp.y);
    ctx.fillStyle = tp.color ?? '#FFD700';
    ctx.fillText(tp.text, tp.x, tp.y);
  });
  ctx.globalAlpha = 1.0;
}