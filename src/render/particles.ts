import { Particle, TextParticle } from '../game/types';

export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  });
}

/** Renders floating "+N" coin popups that rise and fade after a tap. */
export function renderTextParticles(ctx: CanvasRenderingContext2D, textParticles: TextParticle[]) {
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  textParticles.forEach((tp) => {
    ctx.globalAlpha = tp.life;
    // Outline for readability over any background
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeText(tp.text, tp.x, tp.y);
    ctx.fillStyle = '#FFD700';
    ctx.fillText(tp.text, tp.x, tp.y);
  });
  ctx.globalAlpha = 1.0;
}