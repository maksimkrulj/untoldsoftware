'use strict';
/* Procedural audio: a generative music engine and synthesized sound effects. No audio files. */

const MOODS = {
  menu: {
    bpm: 62, chordLen: 16,
    chords: [[50, 53, 57, 60, 64], [46, 50, 53, 57], [53, 57, 60, 64], [48, 55, 62, 64]],
    padWave: 'sawtooth', padCutoff: 850, padVol: 0.032, padAtk: 2.2, padRel: 3.0,
    arpProb: 0.5, arpWave: 'sine', arpVol: 0.055, arpOct: 1, arpDecay: 1.6, arpOrder: [0, 2, 1, 3, 2, 4, 1, 3],
    bassVol: 0.09
  },
  moss: {
    bpm: 76, chordLen: 16,
    chords: [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52, 55], [43, 47, 50, 55]],
    padWave: 'triangle', padCutoff: 1400, padVol: 0.045, padAtk: 1.4, padRel: 2.2,
    arpProb: 0.72, arpWave: 'triangle', arpVol: 0.05, arpOct: 1, arpDecay: 0.9, arpOrder: [0, 1, 2, 3, 2, 1, 3, 2],
    bassVol: 0.1, bassPattern: [1, 0, 0, 0, 0, 0, 1, 0]
  },
  frost: {
    bpm: 66, chordLen: 16,
    chords: [[52, 55, 59, 66], [48, 52, 55, 59], [45, 48, 52, 59], [47, 52, 54, 59]],
    padWave: 'sine', padCutoff: 2000, padVol: 0.05, padAtk: 2.0, padRel: 3.0,
    arpProb: 0.42, arpWave: 'sine', arpVol: 0.06, arpOct: 2, arpDecay: 1.8, arpOrder: [0, 3, 1, 2, 3, 0, 2, 1],
    bassVol: 0.08
  },
  cinder: {
    bpm: 84, chordLen: 16,
    chords: [[48, 51, 55, 58], [49, 53, 56, 60], [48, 51, 55], [46, 49, 53, 56]],
    padWave: 'sawtooth', padCutoff: 650, padVol: 0.04, padAtk: 1.0, padRel: 1.8,
    arpProb: 0.55, arpWave: 'triangle', arpVol: 0.05, arpOct: 1, arpDecay: 0.7, arpOrder: [0, 2, 1, 2, 0, 3, 2, 1],
    bassVol: 0.13, bassPattern: [1, 0, 0, 1, 0, 0, 1, 0]
  },
  boss: {
    bpm: 124, chordLen: 16,
    chords: [[45, 48, 52], [41, 45, 48], [50, 53, 57], [40, 44, 47]],
    padWave: 'sawtooth', padCutoff: 1100, padVol: 0.035, padAtk: 0.4, padRel: 1.0,
    arpProb: 0.92, arpWave: 'triangle', arpVol: 0.045, arpOct: 1, arpDecay: 0.35, arpOrder: [0, 1, 2, 1, 0, 2, 1, 2],
    bassVol: 0.16, bassPattern: [1, 0, 1, 0, 1, 0, 1, 1], drums: true
  },
  ending: {
    bpm: 70, chordLen: 16,
    chords: [[50, 54, 57, 62], [49, 52, 57, 64], [47, 50, 54, 59], [43, 47, 50, 55]],
    padWave: 'triangle', padCutoff: 1800, padVol: 0.05, padAtk: 1.5, padRel: 2.5,
    arpProb: 0.85, arpWave: 'sine', arpVol: 0.06, arpOct: 1, arpDecay: 1.4, arpOrder: [0, 1, 2, 3, 2, 1, 2, 3],
    bassVol: 0.1
  }
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.vol = { master: 0.8, music: 0.6, sfx: 0.85 };
    this.mood = null;
    this.bus = null;
    this.step = 0;
    this.nextT = 0;
  }

  init() {
    if (this.ctx) { this.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { this.ctx = null; return; }
    const ctx = this.ctx;
    // Phone speakers barely reproduce the low pads and bass, so phones get a brighter, louder mix.
    this.mobile = IS_TOUCH;
    this.unlockMobile();

    this.out = ctx.createDynamicsCompressor();
    this.out.threshold.value = -12;
    this.out.knee.value = 18;
    this.out.ratio.value = 3.5;
    this.out.attack.value = 0.004;
    this.out.release.value = 0.25;
    this.out.connect(ctx.destination);

    this.master = ctx.createGain();
    this.master.connect(this.out);
    this.musicGain = ctx.createGain();
    this.musicGain.connect(this.master);
    this.sfxGain = ctx.createGain();
    this.sfxGain.connect(this.master);

    // shared reverb, fed post-fader so muting a channel also mutes its tail
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.makeImpulse(3.2, 2.6);
    this.reverb.connect(this.master);
    const mSend = ctx.createGain(); mSend.gain.value = 0.55;
    this.musicGain.connect(mSend); mSend.connect(this.reverb);
    const sSend = ctx.createGain(); sSend.gain.value = 0.22;
    this.sfxGain.connect(sSend); sSend.connect(this.reverb);

    // music echo
    this.delay = ctx.createDelay(1.5);
    this.delay.delayTime.value = 0.42;
    const fb = ctx.createGain(); fb.gain.value = 0.36;
    const dFilt = ctx.createBiquadFilter(); dFilt.type = 'lowpass'; dFilt.frequency.value = 2200;
    this.delay.connect(dFilt); dFilt.connect(fb); fb.connect(this.delay);
    const dOut = ctx.createGain(); dOut.gain.value = 0.5;
    dFilt.connect(dOut); dOut.connect(this.musicGain);

    this.noiseBuf = this.makeNoise(3);
    this.applyVolumes();
    this.resume();
    setInterval(() => this.tick(), 40);

    if (this.mood) { const m = this.mood; this.mood = null; this.playMusic(m); }
  }

  resume() {
    if (this.ctx && this.ctx.state !== 'running' && this.ctx.state !== 'closed') this.ctx.resume().catch(() => {});
  }

  // iOS mutes Web Audio while the ring/silent switch is on unless the page plays as media.
  unlockMobile() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported */ }
    try {
      const rate = 8000, n = 800;
      const buf = new ArrayBuffer(44 + n * 2);
      const v = new DataView(buf);
      const str = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
      str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
      v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
      str(36, 'data'); v.setUint32(40, n * 2, true);
      const el = document.createElement('audio');
      el.src = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
      el.loop = true;
      el.setAttribute('playsinline', '');
      el.play().catch(() => {});
      this.silentEl = el;
    } catch (e) { /* best effort */ }
  }

  setVolumes(master, music, sfx) {
    this.vol.master = master; this.vol.music = music; this.vol.sfx = sfx;
    this.applyVolumes();
  }

  applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.vol.master, t, 0.05);
    this.musicGain.gain.setTargetAtTime(this.vol.music * (this.mobile ? 1.6 : 0.9), t, 0.05);
    this.sfxGain.gain.setTargetAtTime(this.vol.sfx, t, 0.05);
  }

  makeNoise(seconds) {
    const ctx = this.ctx;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  makeImpulse(seconds, decay) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  /* ---------------- music ---------------- */
  playMusic(mood) {
    if (this.mood === mood) return;
    this.mood = mood;
    if (!this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    if (this.bus) {
      const old = this.bus;
      old.gain.cancelScheduledValues(t);
      old.gain.setValueAtTime(old.gain.value, t);
      old.gain.linearRampToValueAtTime(0, t + 1.6);
      setTimeout(() => { try { old.disconnect(); } catch (e) { /* already gone */ } }, 2600);
      this.bus = null;
    }
    if (!mood || !MOODS[mood]) return;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0, t);
    bus.gain.linearRampToValueAtTime(1, t + 1.8);
    bus.connect(this.musicGain);
    bus.connect(this.delay);
    this.bus = bus;
    this.step = 0;
    this.nextT = t + 0.15;
  }

  stopMusic() { this.playMusic(null); }

  tick() {
    if (!this.ctx || !this.bus || !this.mood) return;
    const M = MOODS[this.mood];
    const ctx = this.ctx;
    const sd = 60 / M.bpm / 2;
    if (this.nextT < ctx.currentTime) this.nextT = ctx.currentTime + 0.03;
    while (this.nextT < ctx.currentTime + 0.3) {
      this.playStep(M, this.step, this.nextT, sd);
      this.nextT += sd;
      this.step++;
    }
  }

  playStep(M, step, t, sd) {
    const bus = this.bus;
    const len = M.chordLen;
    const chord = M.chords[Math.floor(step / len) % M.chords.length];
    const local = step % len;
    if (local === 0) {
      for (const n of chord) this.padNote(n, t, len * sd, M, bus);
      this.bassNote(chord[0] - 12, t, M.bassPattern ? sd * 1.8 : len * sd * 0.9, M, bus);
    } else if (M.bassPattern && M.bassPattern[local % M.bassPattern.length]) {
      this.bassNote(chord[0] - 12, t, sd * 1.8, M, bus);
    }
    if (Math.random() < M.arpProb) {
      const order = M.arpOrder;
      const idx = order[local % order.length] % chord.length;
      this.pluck(chord[idx] + 12 * M.arpOct, t, M.arpWave, M.arpVol, M.arpDecay, bus);
    }
    if (M.drums) {
      if (local % 4 === 0) this.kick(t, bus);
      if (local % 8 === 4) this.snare(t, bus);
      if (local % 2 === 1) this.hat(t, bus, 0.5 + Math.random() * 0.5);
    } else if (local === 8 && Math.random() < 0.35) {
      this.pluck(chord[chord.length - 1] + 24, t, 'sine', M.arpVol * 0.6, 2.4, bus);
    }
  }

  padNote(n, t, dur, M, bus) {
    const ctx = this.ctx;
    const f = mtof(n + (this.mobile ? 12 : 0));
    const g = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = M.padCutoff * (this.mobile ? 2.4 : 1);
    filt.Q.value = 0.5;
    const v = M.padVol;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + M.padAtk);
    g.gain.setValueAtTime(v, t + Math.max(dur, M.padAtk + 0.01));
    g.gain.linearRampToValueAtTime(0, t + dur + M.padRel);
    filt.connect(g);
    g.connect(bus);
    for (const det of [-7, 6]) {
      const o = ctx.createOscillator();
      o.type = M.padWave;
      o.frequency.value = f;
      o.detune.value = det;
      o.connect(filt);
      o.start(t);
      o.stop(t + dur + M.padRel + 0.05);
    }
  }

  bassNote(n, t, dur, M, bus) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = mtof(n + (this.mobile ? 24 : 0));
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = this.mobile ? 1400 : 420;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(M.bassVol, t + 0.02);
    g.gain.setTargetAtTime(0, t + dur * 0.6, dur * 0.25 + 0.02);
    o.connect(filt); filt.connect(g); g.connect(bus);
    o.start(t);
    o.stop(t + dur + 0.6);
  }

  pluck(n, t, wave, vol, decay, bus) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = wave;
    o.frequency.value = mtof(this.mobile && n < 72 ? n + 12 : n);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g); g.connect(bus);
    o.start(t);
    o.stop(t + decay + 0.05);
  }

  kick(t, bus) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.42, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + 0.4);
  }

  snare(t, bus) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    src.connect(f); f.connect(g); g.connect(bus);
    src.start(t, Math.random() * 2); src.stop(t + 0.2);
  }

  hat(t, bus, v) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.045 * v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(f); f.connect(g); g.connect(bus);
    src.start(t, Math.random() * 2); src.stop(t + 0.06);
  }

  /* ---------------- sound effects ---------------- */
  tone(f0, f1, dur, vol, type, delay, attack) {
    const ctx = this.ctx;
    const t = ctx.currentTime + (delay || 0);
    const atk = Math.min(attack || 0.005, dur * 0.5);
    const o = ctx.createOscillator();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.sfxGain);
    o.start(t); o.stop(t + dur + 0.03);
  }

  noise(dur, vol, type, f0, f1, q, delay, attack) {
    const ctx = this.ctx;
    const t = ctx.currentTime + (delay || 0);
    const atk = Math.min(attack || 0.005, dur * 0.5);
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    f.Q.value = q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.sfxGain);
    src.start(t, Math.random() * Math.max(0, 2.8 - dur));
    src.stop(t + dur + 0.03);
  }

  sfx(name, v) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    v = v === undefined ? 1 : v;
    if (v <= 0.01) return;
    switch (name) {
      case 'hover':
        this.tone(1300, 1300, 0.06, 0.025 * v, 'sine');
        break;
      case 'click':
        this.tone(520, 780, 0.12, 0.09 * v, 'triangle');
        this.tone(1040, 1040, 0.18, 0.04 * v, 'sine', 0.04);
        break;
      case 'shard': {
        const base = 74 + [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26][(this._shardN = ((this._shardN || 0) + 1) % 12)];
        [0, 7, 12].forEach((s, i) => {
          this.tone(mtof(base + s), mtof(base + s), 0.9, 0.11 * v, 'sine', i * 0.07);
          this.tone(mtof(base + s + 12), mtof(base + s + 12), 0.5, 0.03 * v, 'triangle', i * 0.07);
        });
        break;
      }
      case 'mote':
        this.tone(mtof(86 + Math.floor(Math.random() * 3) * 2), null, 0.35, 0.06 * v, 'sine');
        break;
      case 'pulse':
        this.noise(0.55, 0.32 * v, 'bandpass', 300, 3600, 0.9);
        this.tone(170, 48, 0.55, 0.38 * v, 'sine');
        this.tone(620, 1500, 0.3, 0.06 * v, 'triangle');
        break;
      case 'deny':
        this.tone(200, 150, 0.18, 0.1 * v, 'square');
        break;
      case 'dash':
        this.noise(0.3, 0.22 * v, 'bandpass', 2400, 500, 1.2);
        this.tone(300, 520, 0.15, 0.05 * v, 'sine');
        break;
      case 'jump':
        this.tone(290, 580, 0.16, 0.08 * v, 'sine');
        break;
      case 'land':
        this.tone(170, 70, 0.12, 0.12 * v, 'sine');
        this.noise(0.1, 0.06 * v, 'lowpass', 900, 300, 1);
        break;
      case 'hurt':
        this.tone(320, 80, 0.38, 0.14 * v, 'sawtooth');
        this.noise(0.28, 0.2 * v, 'lowpass', 900, 180, 1);
        this.tone(90, 50, 0.3, 0.25 * v, 'sine');
        break;
      case 'kill':
        this.tone(760, 90, 0.5, 0.12 * v, 'sine');
        this.noise(0.45, 0.16 * v, 'bandpass', 1400, 260, 1.5);
        this.tone(mtof(91), null, 0.5, 0.04 * v, 'sine', 0.12);
        break;
      case 'beacon':
        [60, 64, 67, 72, 76].forEach((n, i) => this.tone(mtof(n), null, 2.6, 0.06 * v, 'sine', i * 0.12, 0.6));
        this.noise(2.0, 0.05 * v, 'bandpass', 800, 4000, 2, 0, 1.2);
        break;
      case 'ascend':
        this.tone(220, 880, 2.2, 0.08 * v, 'triangle', 0, 0.8);
        this.noise(2.2, 0.08 * v, 'bandpass', 500, 6000, 1.5, 0, 1.5);
        break;
      case 'complete':
        [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => {
          this.tone(mtof(n), null, 1.4, 0.09 * v, 'sine', i * 0.09);
          this.tone(mtof(n), null, 0.8, 0.03 * v, 'triangle', i * 0.09);
        });
        break;
      case 'die':
        [57, 53, 50, 45].forEach((n, i) => this.tone(mtof(n), mtof(n - 1), 1.3, 0.1 * v, 'triangle', i * 0.32));
        this.noise(1.5, 0.08 * v, 'lowpass', 1200, 100, 1);
        break;
      case 'ventWarn':
        this.noise(1.4, 0.2 * v, 'lowpass', 110, 320, 2, 0, 0.6);
        break;
      case 'erupt':
        this.noise(1.3, 0.34 * v, 'lowpass', 2400, 200, 1);
        this.tone(95, 38, 0.9, 0.3 * v, 'sine');
        break;
      case 'slam':
        this.tone(95, 26, 1.3, 0.55 * v, 'sine');
        this.noise(1.1, 0.4 * v, 'lowpass', 1600, 90, 1);
        break;
      case 'roar':
        [110, 116.5, 98].forEach(f => this.tone(f, f * 0.5, 1.7, 0.07 * v, 'sawtooth', 0, 0.25));
        this.noise(1.6, 0.18 * v, 'bandpass', 500, 180, 1.2, 0, 0.3);
        break;
      case 'summon':
        this.tone(190, 760, 1.1, 0.06 * v, 'sine', 0, 0.7);
        this.tone(193, 772, 1.1, 0.06 * v, 'sine', 0, 0.7);
        break;
      case 'pyreTick':
        this.tone(mtof(60 + Math.round(v * 24)), null, 0.14, 0.05, 'sine');
        break;
      case 'pyreLit':
        [62, 66, 69, 74, 78].forEach((n, i) => this.tone(mtof(n), null, 2.4, 0.08 * v, i % 2 ? 'triangle' : 'sine', i * 0.05, 0.02));
        this.noise(1.2, 0.2 * v, 'bandpass', 600, 3000, 1);
        this.tone(80, 40, 1.0, 0.35 * v, 'sine');
        break;
      case 'heartbeat':
        this.tone(70, 45, 0.16, 0.22 * v, 'sine');
        this.tone(66, 42, 0.16, 0.16 * v, 'sine', 0.22);
        break;
      case 'bossDie':
        this.noise(3.5, 0.45 * v, 'lowpass', 3000, 60, 1);
        this.tone(140, 20, 3.0, 0.5 * v, 'sine');
        [55, 59, 62, 67].forEach((n, i) => this.tone(mtof(n), mtof(n - 12), 2.5, 0.05 * v, 'sawtooth', i * 0.1, 0.1));
        break;
      case 'ignite':
        [50, 57, 62, 66, 69, 74].forEach((n, i) => this.tone(mtof(n), null, 5.0, 0.07 * v, i % 2 ? 'triangle' : 'sine', i * 0.25, 1.5));
        this.noise(5, 0.12 * v, 'bandpass', 300, 5000, 0.8, 0, 2.5);
        break;
      case 'toast':
        this.tone(mtof(79), null, 0.4, 0.04 * v, 'sine');
        this.tone(mtof(86), null, 0.5, 0.03 * v, 'sine', 0.08);
        break;
      case 'swing0':
      case 'swing1':
        this.noise(0.16, 0.16 * v, 'bandpass', name === 'swing0' ? 1800 : 2200, 700, 1.4);
        this.tone(name === 'swing0' ? 520 : 600, 900, 0.1, 0.03 * v, 'triangle');
        break;
      case 'swing2':
        this.noise(0.3, 0.22 * v, 'bandpass', 900, 3200, 1.2);
        this.tone(300, 900, 0.25, 0.05 * v, 'sawtooth');
        break;
      case 'hit':
        this.noise(0.09, 0.28 * v, 'lowpass', 3000, 600, 1);
        this.tone(220, 90, 0.12, 0.2 * v, 'square');
        break;
      case 'hitBig':
        this.noise(0.2, 0.38 * v, 'lowpass', 4000, 300, 1);
        this.tone(160, 50, 0.25, 0.32 * v, 'sine');
        this.tone(880, 1320, 0.15, 0.04 * v, 'triangle', 0.02);
        break;
      case 'slamLand':
        this.tone(140, 35, 0.5, 0.45 * v, 'sine');
        this.noise(0.4, 0.3 * v, 'lowpass', 2000, 120, 1);
        break;
      case 'chip':
        this.tone(1400 + Math.random() * 400, 900, 0.08, 0.06 * v, 'triangle');
        this.noise(0.06, 0.1 * v, 'highpass', 3000, 3000, 1);
        break;
      case 'break':
        for (let i = 0; i < 5; i++) this.tone(1200 + Math.random() * 1600, 600, 0.25, 0.05 * v, 'triangle', i * 0.03);
        this.noise(0.35, 0.22 * v, 'highpass', 2500, 1200, 1);
        break;
      case 'powerup':
        [67, 71, 74, 79, 83].forEach((n, i) => this.tone(mtof(n), null, 0.5, 0.07 * v, 'square', i * 0.05));
        this.tone(mtof(91), null, 0.8, 0.05 * v, 'sine', 0.25);
        break;
      case 'item':
        this.tone(mtof(76), null, 0.25, 0.08 * v, 'triangle');
        this.tone(mtof(83), null, 0.35, 0.07 * v, 'triangle', 0.07);
        break;
      case 'flask':
        for (let i = 0; i < 4; i++) this.tone(400 + i * 120, 700 + i * 120, 0.12, 0.06 * v, 'sine', i * 0.06);
        this.tone(mtof(84), null, 0.6, 0.06 * v, 'sine', 0.25);
        break;
      case 'nova':
        this.tone(220, 30, 1.4, 0.55 * v, 'sine');
        this.noise(1.2, 0.45 * v, 'bandpass', 200, 5000, 0.7);
        [72, 79, 84].forEach((n, i) => this.tone(mtof(n), null, 1.2, 0.05 * v, 'sine', 0.05 + i * 0.05));
        break;
      case 'wave':
        this.noise(0.5, 0.25 * v, 'bandpass', 500, 2500, 1);
        this.tone(200, 80, 0.4, 0.15 * v, 'sawtooth');
        break;
      case 'parry':
        this.tone(1800, 2400, 0.12, 0.08 * v, 'square');
        this.tone(2400, 2400, 0.3, 0.04 * v, 'sine', 0.05);
        break;
      case 'shield':
        this.tone(900, 600, 0.2, 0.08 * v, 'square');
        this.tone(1800, 1200, 0.15, 0.04 * v, 'sine');
        break;
      case 'shoot':
        this.tone(500, 150, 0.25, 0.08 * v, 'sawtooth');
        this.noise(0.2, 0.06 * v, 'bandpass', 1200, 400, 2);
        break;
      case 'shardFire':
        for (let i = 0; i < 4; i++) this.tone(2000 - i * 200, 900, 0.18, 0.05 * v, 'triangle', i * 0.03);
        this.noise(0.25, 0.12 * v, 'highpass', 4000, 2000, 1);
        break;
      case 'fireball':
        this.noise(0.6, 0.25 * v, 'lowpass', 600, 2400, 1);
        this.tone(120, 300, 0.5, 0.12 * v, 'sawtooth');
        break;
      case 'explode':
        this.noise(0.6, 0.35 * v, 'lowpass', 2500, 150, 1);
        this.tone(110, 40, 0.5, 0.3 * v, 'sine');
        break;
      case 'spike':
        this.noise(0.3, 0.3 * v, 'bandpass', 3000, 800, 2);
        this.tone(600, 180, 0.25, 0.1 * v, 'square');
        break;
      case 'charge':
        this.tone(80, 260, 0.8, 0.2 * v, 'sawtooth', 0, 0.3);
        this.noise(0.8, 0.12 * v, 'lowpass', 200, 900, 1, 0, 0.5);
        break;
      case 'questReady':
        [72, 76, 79].forEach((n, i) => this.tone(mtof(n), null, 0.5, 0.07 * v, 'triangle', i * 0.1));
        break;
      case 'questDone':
        [67, 72, 76, 79, 84].forEach((n, i) => {
          this.tone(mtof(n), null, 1.0, 0.08 * v, 'sine', i * 0.08);
          this.tone(mtof(n + 12), null, 0.5, 0.025 * v, 'triangle', i * 0.08);
        });
        break;
      case 'talk':
        this.tone(320 + Math.random() * 180, null, 0.05, 0.035 * v, 'triangle');
        break;
      case 'comboUp':
        [79, 83, 86, 91].forEach((n, i) => this.tone(mtof(n), null, 0.25, 0.05 * v, 'square', i * 0.04));
        break;
      case 'bossIntro':
        this.tone(55, 41, 2.5, 0.35 * v, 'sawtooth', 0, 0.4);
        this.tone(82, 61, 2.5, 0.2 * v, 'sawtooth', 0, 0.4);
        this.noise(2.5, 0.2 * v, 'lowpass', 120, 600, 1, 0, 1);
        break;
    }
  }
}
