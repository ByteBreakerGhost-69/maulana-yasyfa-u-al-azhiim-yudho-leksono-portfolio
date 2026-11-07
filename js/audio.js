/* 8-bit sound with the Web Audio API. Nothing is played until the visitor turns sound on. */

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (n) => { const m = /^([A-G])(#?)(\d)$/.exec(n); return 12 * (Number(m[3]) + 1) + NOTE[m[1]] + (m[2] ? 1 : 0); };
const freq = (n) => 440 * Math.pow(2, (midi(n) - 69) / 12);

/* 8 bars of 16 steps, original melody in C major (C - Am - F - G) */
const _ = null;
const LEAD = [
  ['E5', _, 'G5', _, 'C6', _, 'G5', _, 'E5', _, 'G5', 'E5', 'D5', _, 'C5', _],
  ['A4', _, 'C5', _, 'E5', _, 'C5', _, 'A4', _, 'C5', 'E5', 'D5', _, 'C5', _],
  ['F5', _, 'A5', _, 'C6', _, 'A5', _, 'F5', _, 'A5', 'G5', 'F5', _, 'E5', _],
  ['D5', _, 'G5', _, 'B5', _, 'G5', _, 'D5', _, 'G5', 'A5', 'G5', _, _, _],
  ['C6', _, 'B5', _, 'G5', _, 'E5', _, 'G5', _, 'A5', _, 'G5', _, 'E5', _],
  ['A5', _, 'G5', _, 'E5', _, 'C5', _, 'E5', _, 'G5', _, 'A5', _, _, _],
  ['A5', _, 'C6', _, 'A5', _, 'F5', _, 'G5', _, 'A5', _, 'C6', _, 'A5', _],
  ['B5', _, 'A5', _, 'G5', _, 'D5', _, 'G5', _, 'B5', _, 'D6', _, _, _]
];
const CHORDS = [['C', 'E', 'G'], ['A', 'C', 'E'], ['F', 'A', 'C'], ['G', 'B', 'D']];
const BASS_ROOT = ['C2', 'A1', 'F2', 'G2'];
const BASS_FIFTH = ['G2', 'E2', 'C3', 'D3'];
const BPM = 128;

let ctx = null, master = null, musicGain = null, sfxGain = null, noiseBuf = null;
let timer = null, step = 0, nextTime = 0, playing = false;
const waves = {};

function pulse(duty) {
  if (waves[duty]) return waves[duty];
  const n = 32, real = new Float32Array(n), imag = new Float32Array(n);
  for (let i = 1; i < n; i++) imag[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty);
  return (waves[duty] = ctx.createPeriodicWave(real, imag));
}

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
  musicGain = ctx.createGain(); musicGain.gain.value = 0.5; musicGain.connect(master);
  sfxGain = ctx.createGain(); sfxGain.gain.value = 0.9; sfxGain.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

function tone({ f, t0, dur, type = 'square', duty, vol = 0.1, to, bus }) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  if (duty) o.setPeriodicWave(pulse(duty)); else o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.006);
  g.gain.setValueAtTime(vol, t0 + Math.max(0.01, dur * 0.6));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(bus || musicGain);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function hat(t0, vol = 0.03) {
  const s = ctx.createBufferSource(), g = ctx.createGain(), hp = ctx.createBiquadFilter();
  s.buffer = noiseBuf; hp.type = 'highpass'; hp.frequency.value = 6000;
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
  s.connect(hp); hp.connect(g); g.connect(musicGain);
  s.start(t0); s.stop(t0 + 0.06);
}

function scheduleStep(s, t0) {
  const stepDur = 60 / BPM / 4;
  const bar = Math.floor(s / 16) % 8, i = s % 16, chord = bar % 4;
  const lead = LEAD[bar][i];
  if (lead) tone({ f: freq(lead), t0, dur: stepDur * 1.7, duty: 0.25, vol: 0.075 });
  if (i % 2 === 0) {
    const ch = CHORDS[chord], note = ch[(i / 2) % 3];
    tone({ f: freq(note + (bar >= 4 ? '4' : '3')), t0, dur: stepDur * 1.2, duty: 0.125, vol: 0.022 });
  }
  if (i % 4 === 0) tone({ f: freq(BASS_ROOT[chord]), t0, dur: stepDur * 3.2, type: 'triangle', vol: 0.16 });
  if (i % 8 === 6) tone({ f: freq(BASS_FIFTH[chord]), t0, dur: stepDur * 1.6, type: 'triangle', vol: 0.12 });
  if (i % 2 === 1) hat(t0, i % 4 === 3 ? 0.035 : 0.02);
}
function scheduler() {
  const stepDur = 60 / BPM / 4;
  while (nextTime < ctx.currentTime + 0.18) { scheduleStep(step, nextTime); nextTime += stepDur; step = (step + 1) % (16 * 8); }
}

export const audio = {
  enabled: false,
  supported: !!(window.AudioContext || window.webkitAudioContext),
  async enable() {
    if (!ensure()) return false;
    if (ctx.state === 'suspended') await ctx.resume();
    this.enabled = true;
    if (!playing) { playing = true; nextTime = ctx.currentTime + 0.08; timer = setInterval(scheduler, 30); }
    return true;
  },
  disable() {
    this.enabled = false;
    playing = false;
    if (timer) { clearInterval(timer); timer = null; }
    if (ctx && ctx.state === 'running') ctx.suspend();
  },
  /* one-shot effects */
  sfx(name) {
    if (!this.enabled || !ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.005;
    const o = (f, d, off = 0, extra = {}) => tone({ f, t0: t + off, dur: d, duty: 0.5, vol: 0.09, bus: sfxGain, ...extra });
    switch (name) {
      case 'click': o(660, 0.05); o(990, 0.06, 0.05); break;
      case 'hover': o(880, 0.025, 0, { vol: 0.035 }); break;
      case 'tick': o(1250 + Math.random() * 300, 0.018, 0, { vol: 0.035 }); break;
      case 'open': [523, 659, 784, 1047].forEach((f, i) => o(f, 0.07, i * 0.055)); break;
      case 'close': [784, 659, 523].forEach((f, i) => o(f, 0.06, i * 0.05)); break;
      case 'toggle': o(520, 0.06); o(780, 0.09, 0.06); break;
      case 'start': [392, 523, 659, 784, 1047, 1319].forEach((f, i) => o(f, 0.09, i * 0.07)); break;
      case 'error': o(180, 0.14, 0, { duty: 0.25, to: 90 }); break;
      case 'secret': [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => o(f, 0.11, i * 0.085)); break;
      default: o(700, 0.05);
    }
  }
};

document.addEventListener('visibilitychange', () => {
  if (!ctx || !audio.enabled) return;
  if (document.hidden) ctx.suspend(); else ctx.resume();
});
