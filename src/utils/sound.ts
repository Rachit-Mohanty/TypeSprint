// Synthesized mechanical keyboard sounds using Web Audio API
import { SoundType } from '../types';

export interface SoundProfileMeta {
  id: SoundType;
  name: string;
  description: string;
  switchType: string;
  icon: string;
}

export const SOUND_PROFILES: SoundProfileMeta[] = [
  {
    id: 'thock',
    name: 'Deep Thock',
    description: 'Lubed Holy Panda / Gateron Oil King with deep solid acoustic thud',
    switchType: 'Tactile / Deep',
    icon: '🔊',
  },
  {
    id: 'click',
    name: 'Clicky Blue',
    description: 'Cherry MX Blue / Kailh Box Jade with crisp tactile snap & spring ping',
    switchType: 'Clicky / Crisp',
    icon: '⚡',
  },
  {
    id: 'creamy',
    name: 'Creamy Linear',
    description: 'NovelKeys Cream / Alpaca V2 with buttery smooth travel & warm pop',
    switchType: 'Linear / Smooth',
    icon: '🧈',
  },
  {
    id: 'marbly',
    name: 'Marbly Jelly',
    description: 'PE Foam modded custom board with distinctive popping marble acoustic',
    switchType: 'Poppy / PE Foam',
    icon: '🔮',
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Vintage mechanical Underwood striker hammer hitting metal carriage',
    switchType: 'Vintage / Heavy',
    icon: '📜',
  },
  {
    id: 'silent',
    name: 'Silent Dampened',
    description: 'Cherry Silent Red / Boba U4 with soft rubberized stealth impact',
    switchType: 'Silent / Muted',
    icon: '🤫',
  },
  {
    id: 'off',
    name: 'Muted (Off)',
    description: 'Audio disabled for quiet environments',
    switchType: 'Silent',
    icon: '🔇',
  },
];

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Generates short white noise buffer for realistic switch friction / tactile click.
 */
function createNoiseBuffer(ctx: AudioContext, durationSeconds: number): AudioBufferSourceNode {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSeconds));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = buffer;
  return whiteNoise;
}

/**
 * Play a synthesized mechanical keyboard keystroke sound.
 */
export function playKeySound(
  type: SoundType,
  volume: number = 0.6,
  isSpace: boolean = false,
  isError: boolean = false
) {
  if (type === 'off' || volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  const baseVol = Math.max(0, Math.min(1, volume));
  masterGain.gain.setValueAtTime(baseVol * (isSpace ? 1.25 : 1.0), now);
  masterGain.connect(ctx.destination);

  if (isError) {
    // Subtle low abrasive buzz for error feedback
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.08);

    gain.gain.setValueAtTime(0.35 * baseVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.085);
    return;
  }

  // Subtle randomized pitch offset per keystroke for natural acoustic realism
  const pitchJitter = (Math.random() * 0.12 - 0.06);

  switch (type) {
    case 'thock': {
      // Deep lubricated mechanical switch (Holy Panda / Gateron Oil King)
      // 1. Deep sine fundamental bottom-out
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      const baseFreq = (isSpace ? 170 : 250) * (1 + pitchJitter);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.065);

      oscGain.gain.setValueAtTime(0.85, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isSpace ? 900 : 1250, now);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.07);

      // 2. Tactile actuation pop (subtle bandpass noise)
      const noise = createNoiseBuffer(ctx, 0.018);
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1800, now);
      noiseFilter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noise.start(now);
      break;
    }

    case 'click': {
      // Crisp Blue mechanical switch click (dual click: downstroke & metallic leaf ping)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      const baseFreq = (isSpace ? 1800 : 2400) * (1 + pitchJitter);
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(450, now + 0.028);

      gain1.gain.setValueAtTime(0.55, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 0.035);

      // High crisp click noise snap
      const whiteNoise = createNoiseBuffer(ctx, 0.02);
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(3600, now);
      noiseFilter.Q.setValueAtTime(4, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      whiteNoise.start(now);
      break;
    }

    case 'creamy': {
      // Ultra smooth creamy linear switch (Alpaca / NovelKeys Cream)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const baseFreq = (isSpace ? 310 : 420) * (1 + pitchJitter);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.045);

      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1700, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.05);

      // Creamy slide noise
      const slide = createNoiseBuffer(ctx, 0.015);
      const slideFilter = ctx.createBiquadFilter();
      slideFilter.type = 'lowpass';
      slideFilter.frequency.setValueAtTime(1200, now);
      const slideGain = ctx.createGain();
      slideGain.gain.setValueAtTime(0.18, now);
      slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      slide.connect(slideFilter);
      slideFilter.connect(slideGain);
      slideGain.connect(masterGain);
      slide.start(now);
      break;
    }

    case 'marbly': {
      // Custom PE foam mod popping marble keystroke
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      const popFreq = (isSpace ? 480 : 720) * (1 + pitchJitter);
      osc.frequency.setValueAtTime(popFreq, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

      oscGain.gain.setValueAtTime(0.8, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.setValueAtTime(1.8, now);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.045);

      // Poppy acoustic marble noise
      const popNoise = createNoiseBuffer(ctx, 0.012);
      const pFilter = ctx.createBiquadFilter();
      pFilter.type = 'highpass';
      pFilter.frequency.setValueAtTime(2800, now);
      const pGain = ctx.createGain();
      pGain.gain.setValueAtTime(0.35, now);
      pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      popNoise.connect(pFilter);
      pFilter.connect(pGain);
      pGain.connect(masterGain);
      popNoise.start(now);
      break;
    }

    case 'typewriter': {
      // Heavy vintage mechanical typewriter strike
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(isSpace ? 750 : 1150 * (1 + pitchJitter), now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.045);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.05);

      // Metallic striker hammer click
      const hammer = createNoiseBuffer(ctx, 0.03);
      const hFilter = ctx.createBiquadFilter();
      hFilter.type = 'bandpass';
      hFilter.frequency.setValueAtTime(2900, now);
      hFilter.Q.setValueAtTime(3.5, now);
      const hGain = ctx.createGain();
      hGain.gain.setValueAtTime(0.4, now);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      hammer.connect(hFilter);
      hFilter.connect(hGain);
      hGain.connect(masterGain);
      hammer.start(now);
      break;
    }

    case 'silent': {
      // Dampened silent linear (Cherry Silent Red)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isSpace ? 140 : 190 * (1 + pitchJitter), now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.035);
      break;
    }
  }
}

/**
 * Play celebration arpeggio when test completes.
 */
export function playCompletionChime(volume: number = 0.5) {
  if (volume <= 0) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.08;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.25 * volume, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.26);
  });
}

