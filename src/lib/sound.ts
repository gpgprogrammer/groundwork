/**
 * Merit's sound effects: small, bright, rounded sounds in the spirit of Apple Pay chimes and Duolingo.
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
    out = ctx.createGain();
    out.gain.value = 0.8;
    out.connect(limiter);
    // A tiny "room": two short filtered echoes give chimes their shimmer without a reverb file.
    room = ctx.createGain();
    room.gain.value = 1;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 4200;
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
  const attack = n.attack ?? 0.004;
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

/** A short burst of filtered noise: the "air" in a page swish. */
function swish(c: AudioContext, t0: number, { at = 0, dur = 0.16, gain = 0.05, from = 500, to = 2600 } = {}) {
  const start = t0 + at;
  const len = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(from, start);
  bp.frequency.exponentialRampToValueAtTime(to, start + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(bp).connect(g).connect(out!);
  src.start(start);
  src.stop(start + dur + 0.02);
}

// Notes (Hz)
const C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880, B5 = 987.77;
const C6 = 1046.5, D6 = 1174.66, E6 = 1318.51, G6 = 1567.98, C7 = 2093;

/** A soft glassy bell: Apple-style chime timbre. */
const BELL: [number, number][] = [
  [2, 0.28],
  [3, 0.08],
  [4.07, 0.05],
];

const SOUNDS: Record<SoundName, (c: AudioContext, t: number) => void> = {
  tap: (c, t) => note(c, t, { f: 620, to: 380, dur: 0.06, gain: 0.07, attack: 0.002 }),
  open: (c, t) => note(c, t, { f: 520, to: 860, dur: 0.07, gain: 0.07, attack: 0.002 }),
  close: (c, t) => note(c, t, { f: 760, to: 440, dur: 0.07, gain: 0.06, attack: 0.002 }),
  nav: (c, t) => {
    swish(c, t, { dur: 0.15, gain: 0.035 });
    note(c, t, { at: 0.03, f: G5, dur: 0.12, gain: 0.04, partials: BELL, wet: 0.4 });
  },
  select: (c, t) => note(c, t, { f: B5, dur: 0.12, gain: 0.06, partials: [[2, 0.2]], wet: 0.3 }),
  on: (c, t) => {
    note(c, t, { f: G5, dur: 0.09, gain: 0.07, partials: [[2, 0.2]] });
    note(c, t, { at: 0.06, f: D6, dur: 0.16, gain: 0.07, partials: [[2, 0.2]], wet: 0.35 });
  },
  off: (c, t) => {
    note(c, t, { f: A5, dur: 0.08, gain: 0.055, type: "triangle" });
    note(c, t, { at: 0.055, f: E5, dur: 0.12, gain: 0.05, type: "triangle" });
  },
  // Two bright bell notes a fifth apart, the second ringing out: the "ding-ding" of a payment going through.
  correct: (c, t) => {
    note(c, t, { f: C6, dur: 0.22, gain: 0.11, partials: BELL, wet: 0.45, pan: -0.08 });
    note(c, t, { at: 0.085, f: G6, dur: 0.65, gain: 0.12, partials: BELL, wet: 0.55, pan: 0.08 });
    note(c, t, { at: 0.085, f: C7, dur: 0.35, gain: 0.025, wet: 0.6 });
  },
  streak: (c, t) => {
    note(c, t, { f: C6, dur: 0.18, gain: 0.1, partials: BELL, wet: 0.45, pan: -0.12 });
    note(c, t, { at: 0.07, f: E6, dur: 0.2, gain: 0.1, partials: BELL, wet: 0.45 });
    note(c, t, { at: 0.14, f: G6, dur: 0.7, gain: 0.115, partials: BELL, wet: 0.55, pan: 0.12 });
    note(c, t, { at: 0.14, f: C7, dur: 0.45, gain: 0.035, wet: 0.6 });
  },
  // A soft, low "bwomp": clearly a miss, never harsh.
  wrong: (c, t) => {
    note(c, t, { f: 330, to: 300, dur: 0.14, gain: 0.11, type: "triangle" });
    note(c, t, { at: 0.11, f: 262, to: 220, dur: 0.24, gain: 0.1, type: "triangle" });
  },
  done: (c, t) => {
    note(c, t, { f: E6, dur: 0.14, gain: 0.09, partials: BELL, wet: 0.4 });
    note(c, t, { at: 0.07, f: A5 * 2, dur: 0.45, gain: 0.1, partials: BELL, wet: 0.5 });
  },
  // A rising arpeggio that lands on a ringing chord.
  complete: (c, t) => {
    [C5, E5, G5, C6].forEach((f, i) => note(c, t, { at: i * 0.085, f, dur: 0.2, gain: 0.085, partials: BELL, wet: 0.4, pan: -0.15 + i * 0.1 }));
    [C6, E6, G6].forEach((f, i) => note(c, t, { at: 0.36, f, dur: 1.1, gain: 0.06 - i * 0.008, partials: BELL, wet: 0.6 }));
    note(c, t, { at: 0.36, f: C7, dur: 0.6, gain: 0.025, wet: 0.7 });
  },
  finish: (c, t) => {
    note(c, t, { f: G5, dur: 0.2, gain: 0.08, partials: BELL, wet: 0.4 });
    note(c, t, { at: 0.11, f: C6, dur: 0.7, gain: 0.08, partials: BELL, wet: 0.5 });
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
