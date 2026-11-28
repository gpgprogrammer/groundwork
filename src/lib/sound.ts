/**
 * Merit's sound effects: soft, warm, low sounds in the spirit of Apple Pay chimes and Duolingo, never shrill.
 * Every sound is synthesized with Web Audio at play time, so there are no audio files to download and
 * nothing plays until the visitor has tapped something (browsers require a gesture first).
 * Visitors can turn sounds off; the choice is kept in localStorage.
 */

export type SoundName =
  | "tap" // any button
  | "open" // a menu, drawer or disclosure opens
  | "close"
  | "nav" // moving to another page
  | "select" // tabs, segmented controls, radio choices
  | "on" // a toggle or checkbox switches on
  | "off"
  | "correct" // a right answer
  | "streak" // a right answer on a streak of 3+
  | "wrong" // a miss: soft, never punishing
  | "done" // a task checked off
  | "complete" // a round finished with a good score
  | "finish"; // a round finished (lower score): warm, not celebratory

const KEY = "merit-sound";
const listeners = new Set<() => void>();

export function soundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
  listeners.forEach((l) => l());
}

export function subscribeSound(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/* ------------------------------------------------------------------ engine */

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let room: GainNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC({ latencyHint: "interactive" });
    // A gentle limiter keeps stacked sounds from clipping.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 12;
    limiter.ratio.value = 6;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.15;
    limiter.connect(ctx.destination);
    // A gentle low-pass on the whole mix takes the edge off every sound.
    const soften = ctx.createBiquadFilter();
    soften.type = "lowpass";
    soften.frequency.value = 1600;
    soften.Q.value = 0.5;
    soften.connect(limiter);
    out = ctx.createGain();
    out.gain.value = 0.8;
    out.connect(soften);
    // A tiny "room": two short filtered echoes give chimes their shimmer without a reverb file.
    room = ctx.createGain();
    room.gain.value = 1;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 1400;
    room.connect(tone);
    for (const [t, g] of [
      [0.067, 0.22],
      [0.131, 0.12],
    ] as const) {
      const d = ctx.createDelay(0.5);
      d.delayTime.value = t;
      const dg = ctx.createGain();
      dg.gain.value = g;
      tone.connect(d).connect(dg).connect(out);
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Call from a user gesture so the first real sound plays without delay (iOS Safari needs this). */
export function unlockSound() {
  if (!soundEnabled()) return;
  const c = audio();
  if (!c) return;
  // A silent one-sample buffer fully unlocks audio on older iOS.
  const b = c.createBuffer(1, 1, 22050);
  const s = c.createBufferSource();
  s.buffer = b;
  s.connect(c.destination);
  s.start(0);
}

type Note = {
  f: number; // frequency in Hz
  at?: number; // start offset in seconds
  dur?: number; // decay time in seconds
  gain?: number;
  type?: OscillatorType;
  to?: number; // glide target frequency
  attack?: number;
  /** Extra partials as [frequency ratio, relative gain]; higher partials decay faster, like a bell. */
  partials?: [number, number][];
  wet?: number; // how much goes to the room
  pan?: number;
};

function note(c: AudioContext, t0: number, n: Note) {
  const start = t0 + (n.at ?? 0);
  const dur = n.dur ?? 0.2;
  const peak = n.gain ?? 0.1;
  const attack = n.attack ?? 0.01;
  const voices: [number, number][] = [[1, 1], ...(n.partials ?? [])];
  const pan = c.createStereoPanner ? c.createStereoPanner() : null;
  if (pan) pan.pan.value = n.pan ?? 0;
  const bus = c.createGain();
  bus.gain.value = 1;
  if (pan) bus.connect(pan).connect(out!);
  else bus.connect(out!);
  if (n.wet) {
    const send = c.createGain();
    send.gain.value = n.wet;
    bus.connect(send).connect(room!);
  }
  for (const [ratio, rel] of voices) {
    const o = c.createOscillator();
    o.type = ratio === 1 ? (n.type ?? "sine") : "sine";
    o.frequency.setValueAtTime(n.f * ratio, start);
    if (n.to) o.frequency.exponentialRampToValueAtTime(n.to * ratio, start + Math.min(dur, 0.12));
    const g = c.createGain();
    const d = ratio === 1 ? dur : dur / Math.sqrt(ratio);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak * rel, start + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, start + attack + d);
    o.connect(g).connect(bus);
    o.start(start);
    o.stop(start + attack + d + 0.05);
  }
}

// Notes (Hz). Everything stays in the warm middle register, below about 700 Hz: nothing bright or piercing.
const F3 = 174.61, A3 = 220, C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392, A4 = 440, C5 = 523.25;

/** A soft mallet: a pure tone with a faint octave that fades almost at once. Round, like a marimba. */
const MALLET: [number, number][] = [[2, 0.08]];

const SOUNDS: Record<SoundName, (c: AudioContext, t: number) => void> = {
  // Frequent actions (taps, tabs, page switches) get a soft low "thock": more felt than heard, like a haptic.
  // No pitch to notice and no ring, so it never gets tiring however often it plays.
  tap: (c, t) => note(c, t, { f: 190, to: 150, dur: 0.045, gain: 0.03, attack: 0.004 }),
  open: (c, t) => note(c, t, { f: 300, to: 360, dur: 0.09, gain: 0.032, attack: 0.008 }),
  close: (c, t) => note(c, t, { f: 360, to: 300, dur: 0.09, gain: 0.03, attack: 0.008 }),
  nav: (c, t) => note(c, t, { f: 210, to: 160, dur: 0.06, gain: 0.04, attack: 0.005 }),
  select: (c, t) => note(c, t, { f: 230, to: 180, dur: 0.05, gain: 0.036, attack: 0.004 }),
  on: (c, t) => {
    note(c, t, { f: C4, dur: 0.12, gain: 0.045, attack: 0.01, partials: MALLET });
    note(c, t, { at: 0.07, f: G4, dur: 0.2, gain: 0.045, attack: 0.01, partials: MALLET, wet: 0.25 });
  },
  off: (c, t) => {
    note(c, t, { f: G4, dur: 0.1, gain: 0.038, attack: 0.01 });
    note(c, t, { at: 0.07, f: C4, dur: 0.16, gain: 0.038, attack: 0.01 });
  },
  // Two warm notes rising a fourth, the second ringing softly over a low octave.
  correct: (c, t) => {
    note(c, t, { f: G4, dur: 0.25, gain: 0.065, attack: 0.012, partials: MALLET, wet: 0.35, pan: -0.06 });
    note(c, t, { at: 0.1, f: C5, dur: 0.75, gain: 0.07, attack: 0.014, partials: MALLET, wet: 0.45, pan: 0.06 });
    note(c, t, { at: 0.1, f: C4, dur: 0.7, gain: 0.03, attack: 0.03, wet: 0.4 });
  },
  streak: (c, t) => {
    note(c, t, { f: E4, dur: 0.22, gain: 0.06, attack: 0.012, partials: MALLET, wet: 0.35, pan: -0.08 });
    note(c, t, { at: 0.09, f: G4, dur: 0.25, gain: 0.062, attack: 0.012, partials: MALLET, wet: 0.35 });
    note(c, t, { at: 0.18, f: C5, dur: 0.8, gain: 0.068, attack: 0.014, partials: MALLET, wet: 0.45, pan: 0.08 });
    note(c, t, { at: 0.18, f: C4, dur: 0.75, gain: 0.03, attack: 0.03, wet: 0.4 });
  },
  // A gentle low "hmm": clearly a miss, never harsh.
  wrong: (c, t) => {
    note(c, t, { f: A3, dur: 0.18, gain: 0.06, attack: 0.018 });
    note(c, t, { at: 0.12, f: F3, dur: 0.3, gain: 0.055, attack: 0.02 });
  },
  done: (c, t) => {
    note(c, t, { f: D4, dur: 0.18, gain: 0.05, attack: 0.012, partials: MALLET, wet: 0.3 });
    note(c, t, { at: 0.08, f: A4, dur: 0.5, gain: 0.055, attack: 0.012, partials: MALLET, wet: 0.4 });
  },
  // A slow rising arpeggio that settles on a soft, warm chord.
  complete: (c, t) => {
    [C4, E4, G4, C5].forEach((f, i) => note(c, t, { at: i * 0.11, f, dur: 0.3, gain: 0.05, attack: 0.014, partials: MALLET, wet: 0.35, pan: -0.12 + i * 0.08 }));
    [C4, E4, G4].forEach((f, i) => note(c, t, { at: 0.46, f, dur: 1.3, gain: 0.032 - i * 0.004, attack: 0.06, wet: 0.5 }));
  },
  finish: (c, t) => {
    note(c, t, { f: E4, dur: 0.25, gain: 0.05, attack: 0.014, partials: MALLET, wet: 0.35 });
    note(c, t, { at: 0.13, f: G4, dur: 0.7, gain: 0.05, attack: 0.016, partials: MALLET, wet: 0.45 });
  },
};

let last = { name: "", at: 0 };

export function playSound(name: SoundName) {
  if (typeof window === "undefined" || !soundEnabled() || document.hidden) return;
  const c = audio();
  if (!c || !out) return;
  const now = performance.now();
  // Collapse accidental doubles (a click that also triggers a route change, double taps).
  if (last.name === name && now - last.at < 60) return;
  last = { name, at: now };
  try {
    SOUNDS[name](c, c.currentTime + 0.005);
  } catch {}
}
