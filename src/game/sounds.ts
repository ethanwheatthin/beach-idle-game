/**
 * sounds.ts — Web Audio API synthesized sound effects.
 * Simple sine/triangle/sawtooth oscillators with ADSR-style envelopes.
 * Replace with real .wav files later by swapping out individual functions.
 */

let _audioCtx: AudioContext | null = null;

export function getAudioCtx(): AudioContext | null {
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}

/** Play a single oscillator tone with exponential decay. */
function playTone(
  type: OscillatorType,
  frequency: number,
  gainValue: number,
  durationS: number,
  delayS = 0,
) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    const t = ctx.currentTime + delayS;
    osc.frequency.setValueAtTime(frequency, t);
    gain.gain.setValueAtTime(gainValue, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + durationS);
    osc.start(t);
    osc.stop(t + durationS);
  } catch {
    // Ignore audio errors silently
  }
}

export function playTapSound() {
  playTone('sine', 440, 0.08, 0.10);
}

export function playRareHitSound() {
  const freqs = [880, 1108, 1320, 1760];
  freqs.forEach((f, i) => playTone('sine', f, 0.09, 0.18, i * 0.06));
}

export function playTreasureSound(isNew: boolean) {
  if (isNew) {
    const freqs = [523, 659, 784, 1047];
    freqs.forEach((f, i) => playTone('sine', f, 0.08, 0.20, i * 0.12));
  } else {
    playTone('sine', 440, 0.06, 0.15);
    playTone('sine', 392, 0.05, 0.15, 0.10);
  }
}

export function playUpgradeSound(id: string) {
  switch (id) {
    case 'volunteer':
      playTone('sine', 660, 0.10, 0.10, 0);
      playTone('sine', 880, 0.08, 0.12, 0.08);
      break;
    case 'binCapacity':
      playTone('triangle', 1200, 0.12, 0.06, 0);
      playTone('triangle', 900, 0.10, 0.18, 0.05);
      break;
    case 'cleanupVan':
      playTone('sawtooth', 220, 0.10, 0.20, 0);
      playTone('sawtooth', 196, 0.07, 0.15, 0.14);
      break;
    case 'spawnRate':
      playTone('sine', 400, 0.08, 0.30, 0);
      playTone('sine', 600, 0.05, 0.20, 0.07);
      playTone('sine', 200, 0.06, 0.25, 0.14);
      break;
    case 'rareFinds':
      playTone('sine', 1047, 0.10, 0.14, 0);
      playTone('sine', 1319, 0.08, 0.12, 0.07);
      playTone('sine', 1568, 0.07, 0.10, 0.13);
      break;
    default:
      playTone('sine', 660, 0.10, 0.15, 0);
  }
}

export function playMilestoneSound() {
  const melody = [523, 659, 784, 1047, 1319];
  melody.forEach((f, i) => playTone('sine', f, 0.10, 0.20, i * 0.10));
}

export function playVanCollectSound() {
  playTone('sine', 523, 0.08, 0.10, 0);
  playTone('sine', 659, 0.07, 0.10, 0.09);
  playTone('sine', 784, 0.06, 0.14, 0.17);
}
