'use strict';
/* Game shell: renderer, input, state machine, story, saves and settings. */

const STORY_INTRO = [
  'Before the dark, there was the Sun of Aurel — and around it, little moons drifting like lanterns on a string.',
  'Then came the Hush. A silence with teeth. It drank the light from the sky, and the Sun went cold.',
  'The Sun\'s heart shattered into Lumen shards, scattered across the sleeping moons.',
  'But one small spark refused to go out.',
  'You are Ember — the last light. Tiny, flickering, and very, very stubborn.',
  'Gather the shards. Outrun the Hush. Rekindle the Sun.'
];

const STORY_ENDING = [
  'The fifth Pyre caught. For one long heartbeat, everything held its breath.',
  'Then the Sun remembered how to burn.',
  'Light poured across the moons — the moss, the ice, the ash — and the Hush had nowhere left to hide.',
  'They say every sunrise since has a small flicker in it.',
  'A spark that refused to go out.'
];

const TIPS = [
  'Chain three strikes for a spinning finisher — and keep the combo going for bonus damage.',
  'Jump, then strike in mid-air to come crashing down with a Meteor Slam.',
  'Strike during a dash to cut through everything in your path.',
  'Your blade can knock enemy projectiles out of the air. Swing at them!',
  'Ember Flasks (1) restore light. Nova Bombs (2) clear everything around you.',
  'Smash Star Caches for power-ups. Aegis makes you untouchable for a few seconds.',
  'Help the moon folk — their rewards upgrade your Sunblade and your light.',
  'A Pulse costs 12 light, but it hits everything around you and destroys projectiles.',
  'Dashing makes you briefly untouchable — dash straight through a Shadow.',
  'The radar shows the whole moon: the centre is you, the rim is the far side.',
  'Follow the small golden arrow — it always points at the nearest objective.',
  'Shadows lose interest if you get far enough away. Sometimes running is wisest.',
  'Red-eyed Stalkers flare their eyes right before they lunge. Sidestep or Pulse!',
  'Your light fades over time. Shards restore 20 — don\'t linger.',
  'On the Hollow Sun, jump when the purple shockwave reaches you.'
];

const DEFAULT_SETTINGS = {
  master: 80, music: 60, sfx: 85,
  quality: 'high', bloom: true, difficulty: 'normal', camDist: 'normal',
  shake: true, radar: true, numbers: true, fps: false
};

const SETTINGS_SCHEMA = [
  { key: 'master', label: 'Master volume', type: 'range' },
  { key: 'music', label: 'Music', type: 'range' },
  { key: 'sfx', label: 'Sound effects', type: 'range' },
  { key: 'difficulty', label: 'Difficulty', type: 'choice', options: [['easy', 'Story'], ['normal', 'Normal'], ['hard', 'Hard']] },
  { key: 'quality', label: 'Graphics quality', type: 'choice', options: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High']], note: 'Terrain detail updates when the next moon loads.' },
  { key: 'bloom', label: 'Glow (bloom)', type: 'toggle' },
  { key: 'camDist', label: 'Camera distance', type: 'choice', options: [['near', 'Near'], ['normal', 'Normal'], ['far', 'Far']] },
  { key: 'shake', label: 'Screen shake', type: 'toggle' },
  { key: 'radar', label: 'Show radar', type: 'toggle' },
  { key: 'numbers', label: 'Damage numbers', type: 'toggle' },
  { key: 'fps', label: 'Show FPS', type: 'toggle' }
];

const DIFFICULTY = {
  easy: { drain: 0.65, dmg: 0.6, enemySpeed: 0.88, hp: 0.75, label: 'Story' },
  normal: { drain: 1.0, dmg: 1.0, enemySpeed: 1.0, hp: 1.0, label: 'Normal' },
  hard: { drain: 1.3, dmg: 1.4, enemySpeed: 1.12, hp: 1.35, label: 'Hard' }
};

const START_LOADOUT = { weapon: 0, maxLight: 100, flask: 0, bomb: 0 };

function sanitizeLoadout(l) {
  if (!l || typeof l !== 'object') return null;
  const n = (v, lo, hi, d) => (typeof v === 'number' && isFinite(v) ? clamp(Math.round(v), lo, hi) : d);
  return { weapon: n(l.weapon, 0, 3, 0), maxLight: n(l.maxLight, 100, 200, 100), flask: n(l.flask, 0, 3, 0), bomb: n(l.bomb, 0, 3, 0) };
}

// Gear for a chapter picked from the menu when no saved run reached it.
function chapterLoadout(i) {
  return [START_LOADOUT, { weapon: 1, maxLight: 120, flask: 1, bomb: 0 }, { weapon: 2, maxLight: 120, flask: 1, bomb: 1 }, { weapon: 3, maxLight: 120, flask: 2, bomb: 2 }][i];
}

const SETTINGS_KEY = 'lastEmber.settings.v1';
const EMBEDDED = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
const FROM_SITE = /[?&]from=site/.test(location.search);

function fullscreenSupported() {
  const d = document.documentElement;
  return !!((d.requestFullscreen || d.webkitRequestFullscreen) && (document.fullscreenEnabled || document.webkitFullscreenEnabled));
}

function toggleFullscreen() {
  const doc = document;
  if (doc.fullscreenElement || doc.webkitFullscreenElement) {
    const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
    if (exit) exit.call(doc);
    return;
  }
  const el = doc.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) return;
  const p = req.call(el);
  const lock = () => {
    try {
      if (IS_TOUCH && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
    } catch (e) { /* orientation lock unsupported */ }
  };
  if (p && p.then) p.then(lock).catch(() => {}); else lock();
}
const SAVE_KEY = 'lastEmber.save.v1';

function loadSettings() {
  const s = Object.assign({}, DEFAULT_SETTINGS, IS_TOUCH ? { quality: 'medium' } : {});
  try {
    const raw = JSON.parse(storageGet(SETTINGS_KEY) || '{}');
    for (const def of SETTINGS_SCHEMA) {
      const v = raw[def.key];
      if (def.type === 'range' && typeof v === 'number' && v >= 0 && v <= 100) s[def.key] = v;
      if (def.type === 'toggle' && typeof v === 'boolean') s[def.key] = v;
      if (def.type === 'choice' && def.options.some(o => o[0] === v)) s[def.key] = v;
    }
  } catch (e) { /* corrupt settings: keep defaults */ }
  return s;
}

function loadSave() {
  const d = { unlocked: 0, best: [null, null, null, null], finished: false, loadouts: [null, null, null, null] };
  try {
    const raw = JSON.parse(storageGet(SAVE_KEY) || '{}');
    if (Number.isInteger(raw.unlocked)) d.unlocked = clamp(raw.unlocked, 0, BIOMES.length - 1);
    if (Array.isArray(raw.best)) for (let i = 0; i < 4; i++) if (typeof raw.best[i] === 'number' && raw.best[i] > 0) d.best[i] = raw.best[i];
    d.finished = raw.finished === true;
    if (Array.isArray(raw.loadouts)) for (let i = 0; i < 4; i++) d.loadouts[i] = sanitizeLoadout(raw.loadouts[i]);
  } catch (e) { /* corrupt save: start fresh */ }
  return d;
}

/* ---------------- input ---------------- */
class Input {
  constructor() {
    this.codes = new Set();
    this.just = new Set();
    this.axis = { x: 0, y: 0, active: false };
    this.capture = false;
    this.map = {
      KeyW: 'fwd', ArrowUp: 'fwd', KeyS: 'back', ArrowDown: 'back',
      KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
      Space: 'jump', ShiftLeft: 'dash', ShiftRight: 'dash',
      KeyE: 'pulse', KeyK: 'pulse', KeyJ: 'attack', KeyF: 'interact',
      Digit1: 'item1', Numpad1: 'item1', Digit2: 'item2', Numpad2: 'item2',
      Escape: 'pause', KeyP: 'pause',
      Enter: 'confirm', NumpadEnter: 'confirm'
    };
    window.addEventListener('keydown', e => this.onKey(e, true));
    window.addEventListener('keyup', e => this.onKey(e, false));
    window.addEventListener('blur', () => this.clear());
  }

  onKey(e, down) {
    const a = this.map[e.code];
    if (!a) return;
    if (down) {
      if (!e.repeat) this.just.add(a);
      this.codes.add(e.code);
    } else {
      this.codes.delete(e.code);
    }
    const t = e.target;
    const typing = t && (t.tagName === 'INPUT' && t.type !== 'range');
    if (!typing && (this.capture || e.code.startsWith('Arrow'))) e.preventDefault();
  }

  isDown(a) {
    for (const c of this.codes) if (this.map[c] === a) return true;
    return false;
  }

  pressed(a) { return this.just.has(a); }
  endFrame() { this.just.clear(); }
  clear() {
    this.codes.clear();
    this.just.clear();
    this.axis.x = 0;
    this.axis.y = 0;
    this.axis.active = false;
  }
}

/* ---------------- the game ---------------- */
class Game {
  constructor() {
    this.settings = loadSettings();
    this.saveData = loadSave();
    this.quality = QUALITY[this.settings.quality];
    this.audio = new AudioEngine();
    this.input = new Input();
    this.ui = new UI(this);
    this.touch = new TouchControls(this);
    this.state = 'boot';
    this.busy = false;
    this.trauma = 0;
    this.shakeOffset = new THREE.Vector3();
    this.particleScale = 500;
    this.level = null;
    this.run = { time: 0, shards: 0, kills: 0, full: false };
    this.loadout = Object.assign({}, START_LOADOUT);
    this.checkpoint = null;
    this.hitstop = 0;
    this.fps = { acc: 0, frames: 0 };

    this.initRenderer();
    this.applySettings();
    this.loadLevel(0, true);
    this.state = 'splash';
    this.ui.show('splash');
    this.fade(0, 1400, null, false);

    document.addEventListener('visibilitychange', () => { if (document.hidden) this.autoPause(); else this.audio.resume(); });
    // phones suspend or interrupt audio (calls, app switching); any tap brings it back
    document.addEventListener('pointerdown', () => this.audio.resume(), true);
    window.addEventListener('wheel', e => {
      if (['intro', 'playing', 'dialog', 'dying', 'ascend', 'finale'].includes(this.state)) e.preventDefault();
    }, { passive: false });
    window.addEventListener('blur', () => this.autoPause());

    this.last = performance.now();
    const loop = now => {
      requestAnimationFrame(loop);
      this.frame(now);
    };
    requestAnimationFrame(loop);
  }

  get diff() { return DIFFICULTY[this.settings.difficulty] || DIFFICULTY.normal; }

  initRenderer() {
    const wrap = document.getElementById('canvas-wrap');
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 1);
    wrap.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);

    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousedown', e => {
      if (this.state === 'playing') {
        if (e.button === 0) this.input.just.add('attack');
        else if (e.button === 2) this.input.just.add('pulse');
      } else if (this.state === 'dialog' && e.button === 0) {
        this.ui.advanceDialog();
      }
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    this.composer = null;
    if (THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass && THREE.ShaderPass && THREE.CopyShader) {
      try {
        const caps = this.renderer.capabilities;
        const hdr = caps.isWebGL2 && this.renderer.extensions.has('EXT_color_buffer_float');
        const rt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { type: hdr ? THREE.HalfFloatType : THREE.UnsignedByteType });
        if (caps.isWebGL2) rt.samples = this.quality.samples;
        this.composer = new THREE.EffectComposer(this.renderer, rt);
        this.renderPass = new THREE.RenderPass(new THREE.Scene(), this.camera);
        this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.5, hdr ? 0.9 : 0.75);
        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.bloomPass);
      } catch (e) {
        console.warn('Bloom unavailable, rendering without it.', e);
        this.composer = null;
      }
    }
    window.addEventListener('resize', () => this.onResize());
    this.onResize();
  }

  onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, this.quality.pr);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h);
    if (this.composer) {
      this.composer.setPixelRatio(pr);
      this.composer.setSize(w, h);
    }
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.particleScale = (h * pr) / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)));
  }

  applySettings() {
    const s = this.settings;
    this.quality = QUALITY[s.quality] || QUALITY.high;
    this.audio.setVolumes(s.master / 100, s.music / 100, s.sfx / 100);
    if (this.composer && this.renderer.capabilities.isWebGL2) {
      for (const rt of [this.composer.renderTarget1, this.composer.renderTarget2]) {
        if (rt.samples !== this.quality.samples) { rt.samples = this.quality.samples; rt.dispose(); }
      }
    }
    this.onResize();
    document.getElementById('fps').classList.toggle('hidden', !s.fps);
    this.ui.radar.classList.toggle('hidden', !s.radar);
  }

  setSetting(key, value) {
    this.settings[key] = value;
    storageSet(SETTINGS_KEY, JSON.stringify(this.settings));
    if (key === 'shake' && !value) this.trauma = 0;
    this.applySettings();
  }

  saveProgress() {
    storageSet(SAVE_KEY, JSON.stringify(this.saveData));
  }

  resetProgress() {
    this.saveData = { unlocked: 0, best: [null, null, null, null], finished: false, loadouts: [null, null, null, null] };
    this.saveProgress();
  }

  /* ---------- main loop ---------- */
  frame(now) {
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (!(dt > 0)) dt = 0;
    this.fps.acc += dt;
    this.fps.frames++;
    if (this.fps.acc >= 0.5) {
      if (this.settings.fps) this.ui.setFPS(Math.round(this.fps.frames / this.fps.acc) + ' FPS');
      this.fps.acc = 0;
      this.fps.frames = 0;
    }
    dt = Math.min(dt, 0.05);
    this.input.capture = ['intro', 'playing', 'dying', 'ascend', 'finale', 'story', 'ending', 'dialog'].includes(this.state);
    this.touch.update(dt);
    this.camera.position.sub(this.shakeOffset);
    this.shakeOffset.set(0, 0, 0);
    try {
      this.update(dt);
    } catch (e) {
      console.error(e);
    }
    this.applyShake(dt);
    this.ui.updateFloaters(dt, this.camera);
    this.input.endFrame();
    this.render();
  }

  update(dt) {
    const L = this.level, cam = this.camera, inp = this.input;
    if (!L) return;
    if (this.handleEscape()) return;
    switch (this.state) {
      case 'splash':
      case 'menu':
        L.update(dt, 'menu');
        L.menuCamera(cam);
        break;
      case 'story':
        L.update(dt, 'menu');
        L.menuCamera(cam);
        this.ui.updateStory(dt);
        if (inp.pressed('confirm') || inp.pressed('jump')) this.ui.advanceStory();
        break;
      case 'intro':
        this.introT += dt;
        L.update(dt, 'intro');
        L.introCamera(cam, this.introT, dt);
        this.ui.updateHUD(L, dt);
        if (this.introT >= 2.6) {
          this.state = 'playing';
          L.player.control = true;
          L.onIntroDone();
        }
        break;
      case 'playing':
        if (this.hitstop > 0) {
          this.hitstop -= dt;
          dt *= 0.08;
        }
        L.update(dt, 'play');
        if (this.state === 'playing' || this.state === 'dying') L.followCamera(cam, dt);
        else if (this.state === 'ascend') L.ascendCamera(cam, dt);
        else if (this.state === 'finale') L.finaleCamera(cam, dt);
        else if (this.state === 'dialog') L.followCamera(cam, dt);
        this.ui.updateHUD(L, dt);
        break;
      case 'dialog':
        this.ui.updateDialog(dt);
        L.followCamera(cam, dt);
        if (inp.pressed('interact') || inp.pressed('confirm') || inp.pressed('jump') || inp.pressed('attack')) this.ui.advanceDialog();
        break;
      case 'dying':
        L.update(dt, 'dying');
        L.followCamera(cam, dt);
        this.ui.updateHUD(L, dt);
        break;
      case 'ascend':
        this.ascT += dt;
        L.update(dt, 'ascend');
        L.ascendCamera(cam, dt);
        if (this.ascT > 2.3 && !this.ascDone) { this.ascDone = true; this.finishAscend(); }
        break;
      case 'finale':
        L.update(dt, 'finale');
        L.finaleCamera(cam, dt);
        break;
      case 'ending':
        L.update(dt, 'ending');
        L.endingCamera(cam, dt);
        this.ui.updateStory(dt);
        if (inp.pressed('confirm') || inp.pressed('jump')) this.ui.advanceStory();
        break;
      case 'end':
        L.update(dt, 'ending');
        L.endingCamera(cam, dt);
        break;
      case 'complete':
      case 'gameover':
        L.update(dt, 'ambient');
        break;
      case 'paused':
        break;
    }
  }

  handleEscape() {
    if (!this.input.pressed('pause') || this.busy) return false;
    const cur = this.ui.current;
    if (this.state === 'dialog') { this.ui.finishDialog(); return true; }
    if (cur === 'settings') { this.ui.closeSettings(); return true; }
    if (cur === 'howto' || cur === 'credits' || cur === 'chapters') { this.ui.show('menu'); this.ui.refreshMenu(); return true; }
    if (this.state === 'playing' || this.state === 'intro') { this.pause(); return true; }
    if (this.state === 'paused' && cur === 'pause') { this.resume(); return true; }
    return false;
  }

  render() {
    if (!this.level) return;
    if (this.composer && this.settings.bloom) {
      this.renderPass.scene = this.level.scene;
      this.composer.render();
    } else {
      this.renderer.render(this.level.scene, this.camera);
    }
  }

  shake(amount) {
    if (!this.settings.shake) return;
    this.trauma = Math.min(1, this.trauma + amount);
  }

  applyShake(dt) {
    if (this.trauma <= 0) return;
    const s = this.trauma * this.trauma * 0.7;
    this.shakeOffset.set((Math.random() * 2 - 1) * s, (Math.random() * 2 - 1) * s, (Math.random() * 2 - 1) * s);
    this.camera.position.add(this.shakeOffset);
    this.trauma = Math.max(0, this.trauma - dt * 1.5);
  }

  fade(to, ms, cb, white) {
    const el = document.getElementById('fx-fade');
    if (white !== undefined) el.classList.toggle('white', !!white);
    el.style.transition = 'opacity ' + ms + 'ms ease';
    el.style.opacity = String(to);
    setTimeout(() => { if (cb) cb(); }, ms + 30);
  }

  loadLevel(i, menu, opts) {
    if (this.level) { this.level.dispose(); this.level = null; }
    this.level = new Level(this, i, { menu: !!menu, loadout: opts && opts.loadout, atBoss: opts && opts.atBoss, questDone: opts && opts.questDone });
    if (this.bloomPass) this.bloomPass.strength = 0.8;
    if (this.renderPass) this.renderPass.scene = this.level.scene;
    if (menu) this.level.menuCamera(this.camera);
    else this.level.introCamera(this.camera, 0, 0.016);
    try { this.renderer.compile(this.level.scene, this.camera); } catch (e) { /* compile lazily instead */ }
  }

  /* ---------- flow ---------- */
  onSplashClick() {
    if (this.state !== 'splash') return;
    this.audio.init();
    this.audio.playMusic('menu');
    this.state = 'menu';
    this.ui.refreshMenu();
    this.ui.show('menu');
  }

  onAction(action) {
    if (this.busy) return;
    switch (action) {
      case 'new': this.newGame(); break;
      case 'chapters': this.ui.openChapters(); break;
      case 'settings': this.ui.openSettings('menu'); break;
      case 'pause-settings': this.ui.openSettings('pause'); break;
      case 'settings-back': this.ui.closeSettings(); break;
      case 'howto': this.ui.show('howto'); break;
      case 'credits': this.ui.show('credits'); break;
      case 'back-menu': this.ui.show('menu'); this.ui.refreshMenu(); break;
      case 'story-skip': this.ui.finishStory(); break;
      case 'resume': this.resume(); break;
      case 'restart': this.retry(); break;
      case 'restart-moon': this.checkpoint = null; this.retry(); break;
      case 'quit': this.quitToMenu(); break;
      case 'next': this.nextLevel(); break;
      case 'retry': this.retry(); break;
      case 'fullscreen': toggleFullscreen(); break;
      case 'exit-site': window.location.href = '../'; break;
    }
  }

  newGame() {
    this.run = { time: 0, shards: 0, kills: 0, full: true };
    this.loadout = Object.assign({}, START_LOADOUT);
    this.saveData.loadouts = [Object.assign({}, START_LOADOUT), null, null, null];
    this.checkpoint = null;
    this.state = 'story';
    this.ui.playStory(STORY_INTRO, () => this.startLevel(0));
  }

  startChapter(i) {
    if (this.busy) return;
    this.run = { time: 0, shards: 0, kills: 0, full: i === 0 };
    this.loadout = Object.assign({}, this.saveData.loadouts[i] || chapterLoadout(i));
    this.checkpoint = null;
    this.startLevel(i);
  }

  startLevel(i, opts) {
    if (this.busy) return;
    opts = opts || {};
    this.busy = true;
    this.state = 'transition';
    this.ui.show(null);
    this.ui.showHUD(false);
    this.fade(1, 450, () => {
      this.audio.playMusic(BIOMES[i].music);
      this.loadLevel(i, false, { loadout: opts.loadout || this.loadout, atBoss: !!opts.atBoss, questDone: !!opts.questDone });
      if (!opts.atBoss) this.checkpoint = null;
      this.ui.setHUDLevel(this.level);
      this.ui.updateHUD(this.level, 0);
      this.ui.showHUD(true);
      this.state = 'intro';
      this.introT = 0;
      this.input.clear();
      this.ui.showIntroCard(this.level.biome);
      this.fade(0, 800, () => { this.busy = false; }, false);
    }, false);
  }

  pause() {
    if (this.state !== 'playing' && this.state !== 'intro') return;
    this.prevState = this.state;
    this.state = 'paused';
    this.input.clear();
    this.touch.reset();
    this.ui.show('pause');
  }

  autoPause() {
    if (!this.busy && (this.state === 'playing' || this.state === 'intro')) this.pause();
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = this.prevState || 'playing';
    this.input.clear();
    this.ui.show(null);
    this.last = performance.now();
  }

  retry() {
    if (!this.level || this.busy) return;
    const cp = this.checkpoint;
    if (cp && cp.index === this.level.index) this.startLevel(cp.index, { atBoss: true, loadout: cp.loadout, questDone: cp.questDone });
    else this.startLevel(this.level.index);
  }

  quitToMenu() {
    if (this.busy) return;
    this.busy = true;
    this.state = 'transition';
    this.ui.show(null);
    this.checkpoint = null;
    this.fade(1, 450, () => {
      this.ui.showHUD(false);
      this.loadLevel(0, true);
      this.audio.playMusic('menu');
      this.state = 'menu';
      this.ui.refreshMenu();
      this.ui.show('menu');
      this.fade(0, 700, () => { this.busy = false; }, false);
    }, false);
  }

  onReachBeacon() {
    if (this.state !== 'playing') return;
    this.state = 'ascend';
    this.ascT = 0;
    this.ascDone = false;
    this.level.player.startAscend();
    this.ui.hideHint();
  }

  finishAscend() {
    const L = this.level, i = L.index;
    this.busy = true;
    this.fade(1, 900, () => {
      const time = L.elapsed;
      const prev = this.saveData.best[i];
      const newBest = !prev || time < prev;
      if (newBest) this.saveData.best[i] = time;
      this.saveData.unlocked = Math.max(this.saveData.unlocked, Math.min(i + 1, BIOMES.length - 1));
      this.loadout = L.player.snapshot();
      if (i + 1 < BIOMES.length) this.saveData.loadouts[i + 1] = Object.assign({}, this.loadout);
      this.checkpoint = null;
      this.saveProgress();
      this.run.time += time;
      this.run.shards += L.stats.shards;
      this.run.kills += L.stats.kills;
      this.state = 'complete';
      this.ui.showHUD(false);
      this.ui.showComplete({
        biome: L.biome, time, newBest, shards: L.stats.shards, totalShards: L.shards.length,
        kills: L.stats.kills, light: L.player.lightLevel, nextIsBoss: !!(BIOMES[i + 1] && BIOMES[i + 1].boss),
        combo: L.player.bestCombo, chests: L.stats.chests,
        quest: L.quest && L.quest.def.task ? (L.quest.state === 'done' ? 'Completed' : 'Not finished') : null
      });
      this.audio.sfx('complete');
      this.fade(0, 700, () => { this.busy = false; }, true);
    }, true);
  }

  nextLevel() {
    if (!this.level) return;
    const n = this.level.index + 1;
    if (n < BIOMES.length) this.startLevel(n);
    else this.quitToMenu();
  }

  onPlayerDying() {
    if (this.state !== 'playing') return;
    this.state = 'dying';
    this.ui.hideHint();
    this.audio.stopMusic();
  }

  onPlayerDied() {
    if (this.state !== 'dying') return;
    this.state = 'gameover';
    this.ui.showHUD(false);
    const cp = !!(this.checkpoint && this.checkpoint.index === this.level.index);
    this.ui.showGameOver(touchText(TIPS[Math.floor(Math.random() * TIPS.length)]), this.level.biome, cp);
  }

  openDialog(npc, lines, onDone) {
    if (this.state !== 'playing') return;
    this.state = 'dialog';
    this.input.clear();
    this.touch.reset();
    this.ui.hideHint();
    this.ui.openDialog(npc, lines, onDone);
  }

  onDialogClosed(onDone) {
    if (this.state === 'dialog') this.state = 'playing';
    this.input.clear();
    if (onDone) onDone();
  }

  onBossStart(boss) {
    this.ui.showBoss(boss);
    this.ui.toast(boss.title.toUpperCase(), 2.6);
    this.audio.sfx('bossIntro');
    this.audio.playMusic('boss');
    const L = this.level;
    if (!L.biome.boss && L.player) this.checkpoint = { index: L.index, loadout: L.player.snapshot(), questDone: !!(L.quest && L.quest.state === 'done') };
  }

  onBossDefeated(boss) {
    this.ui.showBoss(null);
    this.ui.toast(boss.name.toUpperCase() + ' HAS FALLEN!', 2.6);
    this.audio.sfx('questDone');
    this.audio.playMusic(this.level.biome.music);
  }

  startFinale() {
    this.state = 'finale';
    this.ui.hideHint();
    this.ui.showHUD(false);
  }

  onFinaleDone() {
    const L = this.level;
    const time = L.elapsed;
    const prev = this.saveData.best[L.index];
    if (!prev || time < prev) this.saveData.best[L.index] = time;
    this.saveData.finished = true;
    this.saveProgress();
    this.run.time += time;
    this.run.shards += L.stats.shards;
    this.run.kills += L.stats.kills;
    this.state = 'ending';
    this.ui.playStory(STORY_ENDING, () => this.showEnd(), true);
  }

  showEnd() {
    this.state = 'end';
    this.ui.showEnd({
      runTime: this.run.full ? this.run.time : 0,
      shards: this.run.shards,
      kills: this.run.kills,
      difficulty: this.diff.label
    });
  }
}

window.addEventListener('load', () => {
  const fail = msg => {
    const el = document.getElementById('scr-error');
    if (msg) document.getElementById('error-msg').textContent = msg;
    el.classList.add('active');
  };
  if (typeof THREE === 'undefined') {
    fail('The 3D engine (three.js) could not be loaded. Please check your internet connection and refresh.');
    return;
  }
  try {
    window.game = new Game();
  } catch (e) {
    console.error(e);
    fail('Your browser could not start WebGL. Try a recent version of Chrome, Edge or Firefox with hardware acceleration enabled.');
  }
});
