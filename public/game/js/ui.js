'use strict';
/* DOM side of the game: screens, HUD, radar, story typewriter and the settings panel. */

const RADAR_ENEMY = { wisp: '#d76bff', stalker: '#ff5a4a', spitter: '#4dffc3', brute: '#ff9a3a' };

class UI {
  constructor(game) {
    this.game = game;
    this.screens = {};
    document.querySelectorAll('.screen').forEach(s => { this.screens[s.id.slice(4)] = s; });
    this.current = null;
    this.hud = this.$('hud');
    this.radar = this.$('radar');
    this.radarCtx = this.radar.getContext('2d');
    this.cache = {};
    this.ghost = 100;
    this.story = null;
    this.settingsReturn = 'menu';
    this.timers = {};
    this.storyA = document.createElement('span');
    this.storyB = document.createElement('span');
    this.storyB.className = 'unrevealed';
    this.$('story-text').append(this.storyA, this.storyB);
    this.dlgA = document.createElement('span');
    this.dlgB = document.createElement('span');
    this.dlgB.className = 'unrevealed';
    this.$('dlg-text').append(this.dlgA, this.dlgB);
    this.dialog = null;
    this.floaters = [];
    const layer = this.$('floaters');
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'floater';
      layer.append(el);
      this.floaters.push({ el, pos: new THREE.Vector3(), t: 0, life: 0, active: false, ox: 0 });
    }
    this.floatIdx = 0;
    this._proj = new THREE.Vector3();
    this.buffEls = {};
    const buffs = this.$('buffs');
    for (const k of POWER_KINDS) {
      const el = document.createElement('div');
      el.className = 'buff hidden';
      el.innerHTML = '<img alt=""><div class="buff-bar"><div></div></div>';
      el.querySelector('img').src = iconURL(k);
      el.title = ITEM_DEFS[k].label;
      buffs.append(el);
      this.buffEls[k] = { el, bar: el.querySelector('.buff-bar div'), on: false };
    }
    this.$('slot-flask-img').src = iconURL('flask');
    this.$('slot-bomb-img').src = iconURL('bomb');
    if (IS_TOUCH) {
      document.querySelector('.splash-prompt').textContent = 'tap anywhere to begin';
      document.querySelector('.story-hint').textContent = 'tap to continue';
      document.querySelector('.dlg-next').textContent = 'Tap ▸';
    }
    this.$('menu-foot').textContent = IS_TOUCH ? 'best with sound on · turn your phone sideways'
      : (EMBEDDED ? 'best with sound on' : 'best with sound on · press F11 for fullscreen');
    const fs = fullscreenSupported();
    this.$('btn-fullscreen').classList.toggle('hidden', !fs);
    this.$('btn-fullscreen-pause').classList.toggle('hidden', !fs);
    this.$('btn-site').classList.toggle('hidden', !(FROM_SITE && !EMBEDDED));
    this.$('btn-site-pause').classList.toggle('hidden', !(FROM_SITE && !EMBEDDED));
    this.bind();
    this.buildSettings();
  }

  $(id) { return document.getElementById(id); }

  bind() {
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        this.game.audio.sfx('click');
        this.game.onAction(btn.dataset.action);
      });
      btn.addEventListener('mouseenter', () => this.game.audio.sfx('hover'));
    });
    this.screens.splash.addEventListener('click', () => this.game.onSplashClick());
    this.screens.story.addEventListener('click', () => this.advanceStory());
    const reset = this.$('btn-reset-progress');
    reset.addEventListener('click', e => {
      e.stopPropagation();
      if (reset.dataset.armed === '1') {
        this.game.resetProgress();
        reset.textContent = 'Progress cleared';
        reset.dataset.armed = '0';
        this.game.audio.sfx('click');
      } else {
        reset.dataset.armed = '1';
        reset.textContent = 'Click again to confirm';
        this.game.audio.sfx('deny');
      }
    });
    reset.addEventListener('mouseenter', () => this.game.audio.sfx('hover'));
  }

  show(name) {
    for (const k in this.screens) this.screens[k].classList.toggle('active', k === name);
    this.current = name;
    const a = document.activeElement;
    if (a && a !== document.body && a.blur) a.blur();
  }

  /* ---------- menus ---------- */
  refreshMenu() {
    const save = this.game.saveData;
    this.$('btn-chapters').disabled = !(save.unlocked > 0 || save.finished);
  }

  openChapters() {
    const list = this.$('chapter-list');
    list.innerHTML = '';
    const save = this.game.saveData;
    BIOMES.forEach((b, i) => {
      const locked = i > save.unlocked;
      const card = document.createElement('button');
      card.className = 'chapter' + (locked ? ' locked' : '') + ' ch-' + b.key;
      card.disabled = locked;
      const best = save.best[i];
      card.innerHTML =
        '<div class="ch-num">MOON ' + b.numeral + '</div>' +
        '<div class="ch-name">' + (locked ? '???' : b.name) + '</div>' +
        '<div class="ch-best">' + (locked ? 'Locked' : (best ? 'Best ' + formatTime(best) : 'Not yet cleared')) + '</div>';
      if (!locked) {
        card.addEventListener('click', () => { this.game.audio.sfx('click'); this.game.startChapter(i); });
        card.addEventListener('mouseenter', () => this.game.audio.sfx('hover'));
      }
      list.append(card);
    });
    this.show('chapters');
  }

  openSettings(from) {
    this.settingsReturn = from;
    const reset = this.$('btn-reset-progress');
    reset.dataset.armed = '0';
    reset.textContent = 'Reset Progress';
    reset.classList.toggle('hidden', from !== 'menu');
    this.buildSettings();
    this.show('settings');
  }

  closeSettings() {
    this.show(this.settingsReturn);
    if (this.settingsReturn === 'menu') this.refreshMenu();
  }

  buildSettings() {
    const list = this.$('settings-list');
    list.innerHTML = '';
    const s = this.game.settings;
    for (const def of SETTINGS_SCHEMA) {
      const row = document.createElement('div');
      row.className = 'set-row';
      const label = document.createElement('div');
      label.className = 'set-label';
      label.textContent = def.label;
      const ctl = document.createElement('div');
      ctl.className = 'set-ctl';
      if (def.type === 'range') {
        const input = document.createElement('input');
        input.type = 'range'; input.min = 0; input.max = 100; input.step = 1;
        input.value = s[def.key];
        const val = document.createElement('span');
        val.className = 'set-val';
        val.textContent = s[def.key];
        input.addEventListener('input', () => {
          val.textContent = input.value;
          this.game.setSetting(def.key, Number(input.value));
        });
        input.addEventListener('change', () => this.game.audio.sfx('click'));
        ctl.append(input, val);
      } else if (def.type === 'choice') {
        const seg = document.createElement('div');
        seg.className = 'seg';
        for (const [value, text] of def.options) {
          const b = document.createElement('button');
          b.textContent = text;
          b.className = s[def.key] === value ? 'on' : '';
          b.addEventListener('click', e => {
            e.stopPropagation();
            this.game.audio.sfx('click');
            this.game.setSetting(def.key, value);
            seg.querySelectorAll('button').forEach(x => x.classList.remove('on'));
            b.classList.add('on');
          });
          b.addEventListener('mouseenter', () => this.game.audio.sfx('hover'));
          seg.append(b);
        }
        ctl.append(seg);
      } else if (def.type === 'toggle') {
        const b = document.createElement('button');
        b.className = 'toggle' + (s[def.key] ? ' on' : '');
        b.innerHTML = '<span class="knob"></span>';
        b.addEventListener('click', e => {
          e.stopPropagation();
          this.game.audio.sfx('click');
          const v = !this.game.settings[def.key];
          this.game.setSetting(def.key, v);
          b.classList.toggle('on', v);
        });
        b.addEventListener('mouseenter', () => this.game.audio.sfx('hover'));
        ctl.append(b);
      }
      row.append(label, ctl);
      if (def.note) {
        const note = document.createElement('div');
        note.className = 'set-note';
        note.textContent = def.note;
        row.append(note);
      }
      list.append(row);
    }
  }

  /* ---------- story ---------- */
  playStory(pages, onDone, soft) {
    this.story = { pages, i: 0, chars: 0, onDone };
    this.screens.story.classList.toggle('soft', !!soft);
    this.show('story');
    this.renderStory();
  }

  renderStory() {
    const s = this.story;
    if (!s) return;
    const page = s.pages[s.i];
    const n = Math.floor(s.chars);
    this.storyA.textContent = page.slice(0, n);
    this.storyB.textContent = page.slice(n);
    const dots = this.$('story-dots');
    let html = '';
    for (let i = 0; i < s.pages.length; i++) html += '<i class="' + (i === s.i ? 'on' : (i < s.i ? 'done' : '')) + '"></i>';
    dots.innerHTML = html;
    this.screens.story.classList.toggle('typing', n < page.length);
  }

  updateStory(dt) {
    const s = this.story;
    if (!s) return;
    const page = s.pages[s.i];
    if (s.chars < page.length) {
      s.chars = Math.min(page.length, s.chars + dt * 42);
      this.renderStory();
    }
  }

  advanceStory() {
    const s = this.story;
    if (!s || this.game.busy) return;
    const page = s.pages[s.i];
    if (s.chars < page.length) {
      s.chars = page.length;
      this.renderStory();
      return;
    }
    this.game.audio.sfx('hover');
    s.i++;
    s.chars = 0;
    if (s.i >= s.pages.length) { this.finishStory(); return; }
    this.renderStory();
  }

  finishStory() {
    const s = this.story;
    if (!s) return;
    this.story = null;
    if (s.onDone) s.onDone();
  }

  /* ---------- level cards & result screens ---------- */
  showIntroCard(b) {
    this.$('intro-num').textContent = 'MOON ' + b.numeral;
    this.$('intro-name').textContent = b.name;
    this.$('intro-line').textContent = b.intro;
    const card = this.screens.intro;
    card.classList.remove('play');
    void card.offsetWidth;
    card.classList.add('play');
    this.show('intro');
    clearTimeout(this.timers.intro);
    this.timers.intro = setTimeout(() => { if (this.current === 'intro') this.show(null); }, 4600);
  }

  showComplete(d) {
    this.$('complete-moon').textContent = 'Moon ' + d.biome.numeral + ' · ' + d.biome.name;
    const rows = [
      ['Time', formatTime(d.time) + (d.newBest ? '  ★ New best' : '')],
      ['Lumen shards', d.shards + ' / ' + d.totalShards],
      ['Shadows purged', String(d.kills)],
      ['Best combo', d.combo + ' hits'],
      ['Star Caches opened', String(d.chests)],
      ['Light remaining', String(Math.ceil(d.light))]
    ];
    if (d.quest) rows.splice(2, 0, ['Side quest', d.quest]);
    this.$('complete-stats').innerHTML = rows.map(r => '<div class="st-k">' + r[0] + '</div><div class="st-v">' + r[1] + '</div>').join('');
    this.$('complete-line').textContent = d.biome.outro;
    this.$('btn-next').textContent = d.nextIsBoss ? 'Face the Hush' : 'Continue';
    this.show('complete');
  }

  showGameOver(tip, biome, checkpoint) {
    this.$('gameover-moon').textContent = 'Moon ' + biome.numeral + ' · ' + biome.name;
    this.$('gameover-tip').textContent = tip;
    this.$('btn-retry').textContent = checkpoint ? 'Retry Boss' : 'Rekindle';
    this.$('btn-restart-moon').classList.toggle('hidden', !checkpoint);
    this.show('gameover');
  }

  showEnd(d) {
    const rows = [];
    if (d.runTime) rows.push(['Journey time', formatTime(d.runTime)]);
    if (d.shards) rows.push(['Lumen shards gathered', String(d.shards)]);
    rows.push(['Pyres kindled', '5 / 5']);
    rows.push(['Shadows purged', String(d.kills)]);
    rows.push(['Difficulty', d.difficulty]);
    this.$('end-stats').innerHTML = rows.map(r => '<div class="st-k">' + r[0] + '</div><div class="st-v">' + r[1] + '</div>').join('');
    this.show('end');
  }

  /* ---------- NPC dialogue ---------- */
  openDialog(npc, lines, onDone) {
    this.dialog = { lines, i: 0, chars: 0, onDone, talkT: 0 };
    this.$('dlg-name').textContent = npc.name;
    const portrait = this.$('dlg-portrait');
    portrait.style.setProperty('--npc', npc.color);
    portrait.textContent = npc.name.charAt(0);
    this.$('dialog').classList.remove('hidden');
    this.prompt(null);
    this.renderDialog();
  }

  renderDialog() {
    const d = this.dialog;
    if (!d) return;
    const line = d.lines[d.i];
    const n = Math.floor(d.chars);
    this.dlgA.textContent = line.slice(0, n);
    this.dlgB.textContent = line.slice(n);
    this.$('dialog').classList.toggle('typing', n < line.length);
    this.$('dlg-page').textContent = (d.i + 1) + ' / ' + d.lines.length;
  }

  updateDialog(dt) {
    const d = this.dialog;
    if (!d) return;
    const line = d.lines[d.i];
    if (d.chars < line.length) {
      d.chars = Math.min(line.length, d.chars + dt * 48);
      d.talkT -= dt;
      if (d.talkT <= 0) { d.talkT = 0.075; this.game.audio.sfx('talk'); }
      this.renderDialog();
    }
  }

  advanceDialog() {
    const d = this.dialog;
    if (!d) return;
    const line = d.lines[d.i];
    if (d.chars < line.length) { d.chars = line.length; this.renderDialog(); return; }
    d.i++;
    d.chars = 0;
    if (d.i >= d.lines.length) { this.finishDialog(); return; }
    this.game.audio.sfx('hover');
    this.renderDialog();
  }

  finishDialog() {
    const d = this.dialog;
    if (!d) return;
    this.dialog = null;
    this.$('dialog').classList.add('hidden');
    this.game.onDialogClosed(d.onDone);
  }

  prompt(text) {
    const el = this.$('prompt');
    if (text) { el.innerHTML = (IS_TOUCH ? '' : '<kbd>F</kbd> ') + text; el.classList.add('show'); }
    else el.classList.remove('show');
  }

  /* ---------- floating combat text ---------- */
  floatText(pos, text, cls) {
    if (!this.game.settings.numbers && (cls === 'dmg' || cls === 'crit' || cls === 'burn')) return;
    const f = this.floaters[this.floatIdx];
    this.floatIdx = (this.floatIdx + 1) % this.floaters.length;
    f.pos.copy(pos);
    f.t = 0;
    f.life = cls === 'dmg' || cls === 'burn' ? 0.7 : 1.1;
    f.active = true;
    f.ox = (Math.random() - 0.5) * 30;
    f.el.className = 'floater show ' + cls;
    f.el.textContent = text;
    f.el.style.opacity = '0';
  }

  updateFloaters(dt, camera) {
    const W = window.innerWidth, H = window.innerHeight;
    for (const f of this.floaters) {
      if (!f.active) continue;
      f.t += dt;
      if (f.t >= f.life) { f.active = false; f.el.className = 'floater'; continue; }
      const v = this._proj.copy(f.pos).project(camera);
      if (v.z > 1) { f.el.style.opacity = '0'; continue; }
      const k = f.t / f.life;
      const x = (v.x * 0.5 + 0.5) * W + f.ox;
      const y = (-v.y * 0.5 + 0.5) * H - 30 - k * 46;
      const sc = k < 0.15 ? 0.6 + k / 0.15 * 0.6 : 1.2 - Math.min(0.2, k - 0.15);
      f.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-50%) scale(' + sc.toFixed(2) + ')';
      f.el.style.opacity = String(k > 0.7 ? (1 - k) / 0.3 : 1);
    }
  }

  clearFloaters() {
    for (const f of this.floaters) { f.active = false; f.el.className = 'floater'; }
  }

  /* ---------- HUD ---------- */
  showHUD(on) { this.hud.classList.toggle('hidden', !on); }

  setHUDLevel(level) {
    const b = level.biome;
    this.$('hud-moon').textContent = 'Moon ' + b.numeral + ' · ' + b.name;
    this.cache = {};
    this.ghost = 100;
    this.showBoss(null);
    this.hideHint();
    this.prompt(null);
    this.clearFloaters();
    this.$('combo').classList.remove('show');
    this.$('dialog').classList.add('hidden');
    this.dialog = null;
    this.$('toast').classList.remove('show');
    this.radar.classList.toggle('hidden', !this.game.settings.radar);
  }

  showBoss(boss) {
    this.boss = boss || null;
    this.$('hud-boss').classList.toggle('hidden', !boss);
    if (boss) this.$('boss-name').textContent = boss.title || boss.name;
  }

  setText(id, text) {
    if (this.cache[id] === text) return;
    this.cache[id] = text;
    this.$(id).textContent = text;
  }

  updateHUD(level, dt) {
    const P = level.player;
    if (!P) return;
    const L = clamp(P.lightLevel, 0, 100);
    this.ghost = L >= this.ghost ? L : Math.max(L, this.ghost - dt * 28);
    this.$('lm-fill').style.width = L.toFixed(2) + '%';
    this.$('lm-ghost').style.width = this.ghost.toFixed(2) + '%';
    this.setText('lm-value', String(Math.ceil(L)));
    const low = L < 25;
    if (this.cache.low !== low) { this.cache.low = low; this.$('light-meter').classList.toggle('low', low); document.body.classList.toggle('lowlight', low); }

    this.$('ab-pulse').style.setProperty('--cd', (P.pulseCd / PULSE_CD).toFixed(3));
    this.$('ab-dash').style.setProperty('--cd', (P.dashCd / 1.0).toFixed(3));
    const pulseOff = P.lightLevel < PULSE_COST + 2;
    if (this.cache.pulseOff !== pulseOff) { this.cache.pulseOff = pulseOff; this.$('ab-pulse').classList.toggle('off', pulseOff); }

    this.setText('hud-obj', level.objectiveText());
    this.setText('hud-time', formatTime(level.elapsed));
    this.setText('hud-kills', level.stats.kills + ' purged');
    const B = this.boss;
    if (B) {
      this.$('boss-fill').style.width = (clamp(B.hp / B.maxHp, 0, 1) * 100).toFixed(1) + '%';
      const shielded = !!(B.shielded && B.shielded());
      if (this.cache.shielded !== shielded) { this.cache.shielded = shielded; this.$('hud-boss').classList.toggle('shielded', shielded); }
      const floor = B.hpFloor ? B.hpFloor() / B.maxHp : 0;
      this.$('boss-floor').style.width = (floor * 100).toFixed(1) + '%';
    }

    // weapon & items
    if (this.cache.weapon !== P.weapon) {
      this.cache.weapon = P.weapon;
      this.$('ab-attack').classList.toggle('off', P.weapon < 1);
      this.$('ab-attack-lv').textContent = P.weapon ? 'Lv ' + P.weapon : 'none';
    }
    for (const k of ['flask', 'bomb']) {
      const n = P.items[k];
      if (this.cache['item' + k] !== n) {
        this.cache['item' + k] = n;
        this.$('slot-' + k + '-n').textContent = 'x' + n;
        this.$('slot-' + k).classList.toggle('empty', n <= 0);
      }
    }

    // combo
    const showCombo = P.combo >= 2;
    if (this.cache.showCombo !== showCombo) { this.cache.showCombo = showCombo; this.$('combo').classList.toggle('show', showCombo); }
    if (showCombo) {
      if (this.cache.combo !== P.combo) {
        this.cache.combo = P.combo;
        this.$('combo-num').textContent = P.combo;
        const el = this.$('combo');
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
      }
      this.$('combo-fill').style.width = (clamp(P.comboT / 3, 0, 1) * 100).toFixed(1) + '%';
      const mult = 1 + Math.min(0.5, Math.floor(P.combo / 5) * 0.1);
      this.setText('combo-mult', 'DMG x' + mult.toFixed(1));
    }

    // power-ups
    for (const k of POWER_KINDS) {
      const b = this.buffEls[k], left = P.buffs[k];
      const on = left > 0;
      if (b.on !== on) { b.on = on; b.el.classList.toggle('hidden', !on); }
      if (on) {
        b.bar.style.width = (left / ITEM_DEFS[k].dur * 100).toFixed(1) + '%';
        b.el.classList.toggle('ending', left < 2);
      }
    }

    // quest tracker
    const q = level.questText();
    const qs = q ? q.mark + '|' + q.text : '';
    if (this.cache.quest !== qs) {
      this.cache.quest = qs;
      this.$('hud-quest').classList.toggle('hidden', !q);
      if (q) {
        this.$('hud-quest-mark').textContent = q.mark;
        this.$('hud-quest-text').textContent = q.text;
        const el = this.$('hud-quest');
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
      }
    }

    const v = 0.3 + Math.pow(1 - L / 100, 2) * 0.7;
    this.$('fx-vignette').style.opacity = v.toFixed(3);
    if (this.game.settings.radar) this.drawRadar(level);
  }

  bumpObjective() {
    const el = this.$('hud-objective');
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  drawRadar(level) {
    const ctx = this.radarCtx, W = this.radar.width, c = W / 2, r = c - 8;
    const P = level.player;
    ctx.clearRect(0, 0, W, W);
    const g = ctx.createRadialGradient(c, c, 4, c, c, r);
    g.addColorStop(0, 'rgba(40,24,30,0.75)');
    g.addColorStop(1, 'rgba(10,6,16,0.82)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(c, c, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,190,120,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(255,190,120,0.18)';
    ctx.beginPath(); ctx.arc(c, c, r * 0.5, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);

    const up = P.dir, fwd = P.fwd;
    const right = this._right || (this._right = new THREE.Vector3());
    const t = this._t || (this._t = new THREE.Vector3());
    right.crossVectors(fwd, up);
    const plot = (dir) => {
      const th = Sphere.angle(up, dir);
      Sphere.tangentToward(up, dir, t);
      const rr = th / Math.PI * r;
      return [c + t.dot(right) * rr, c - t.dot(fwd) * rr];
    };
    const dot = (x, y, rad, color, glow) => {
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, TAU);
      ctx.fillStyle = color;
      if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    const time = level.time;

    for (const v of level.vents) {
      if (v.phase === 'idle') continue;
      const [x, y] = plot(v.dir);
      dot(x, y, 4, v.phase === 'erupt' ? 'rgba(255,110,30,0.95)' : 'rgba(255,150,60,' + (0.4 + 0.4 * Math.sin(time * 14)).toFixed(2) + ')');
    }
    for (const e of level.enemies) {
      if (!e.alive) continue;
      if (Sphere.angle(up, e.dir) > 1.3) continue;
      const [x, y] = plot(e.dir);
      dot(x, y, e.type === 'brute' ? 4.2 : 3, RADAR_ENEMY[e.type] || '#d76bff');
    }
    for (const b of level.breakables) {
      if (b.broken) continue;
      const [x, y] = plot(b.dir);
      ctx.fillStyle = b.kind === 'totem' ? '#7fd6ff' : '#c78dff';
      if (b.kind === 'totem') {
        ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 5); ctx.lineTo(x - 4, y); ctx.closePath(); ctx.fill();
      } else ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
    }
    for (const p of level.pickups) {
      if (p.collected || p.kind === 'orb') continue;
      const [x, y] = plot(p.dir);
      dot(x, y, 2.6, ITEM_DEFS[p.kind].color, 6);
    }
    if (level.npc && level.quest && level.quest.state !== 'done') {
      const [x, y] = plot(level.npc.dir);
      dot(x, y, 5.5, '#7dff9a', 10);
      ctx.fillStyle = '#0b2a12';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const st = level.quest.state;
      ctx.fillText(st === 'ready' ? '?' : (st === 'available' ? '!' : '.'), x, y + 0.5);
    }
    for (const s of level.shards) {
      if (s.collected) continue;
      const [x, y] = plot(s.dir);
      dot(x, y, 4, '#ffd36b', 8);
    }
    for (const m of level.motes) {
      if (m.collected) continue;
      const [x, y] = plot(m.dir);
      dot(x, y, 2.6, '#fff2c8', 5);
    }
    for (const p of level.pyres) {
      const [x, y] = plot(p.dir);
      ctx.beginPath();
      ctx.arc(x, y, 5.5, 0, TAU);
      ctx.lineWidth = 2;
      ctx.strokeStyle = p.lit ? '#ffcf70' : 'rgba(255,207,112,0.7)';
      ctx.stroke();
      if (p.lit || p.charge > 0) dot(x, y, 2 + 3 * p.charge, '#ffb347', p.lit ? 10 : 0);
    }
    if (level.beacon && level.beacon.active) {
      const [x, y] = plot(level.beacon.dir);
      dot(x, y, 5 + Math.sin(time * 6), '#e8f4ff', 14);
    }
    if (level.boss && level.boss.group.visible && !level.boss.dead) {
      const [x, y] = plot(level.boss.dir);
      dot(x, y, 7 + Math.sin(time * 5), 'rgba(255,60,90,0.95)', 14);
    }
    // Ember at the centre, facing up
    ctx.save();
    ctx.translate(c, c);
    ctx.fillStyle = '#ffb35c';
    ctx.shadowColor = '#ff8a2a';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(6, 6); ctx.lineTo(0, 3); ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /* ---------- transient messages ---------- */
  toast(msg, dur) {
    const el = this.$('toast');
    el.textContent = msg;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    this.game.audio.sfx('toast');
    clearTimeout(this.timers.toast);
    this.timers.toast = setTimeout(() => el.classList.remove('show'), (dur || 2) * 1000);
  }

  hint(html, dur) {
    const el = this.$('hint');
    el.innerHTML = html;
    el.classList.add('show');
    clearTimeout(this.timers.hint);
    this.timers.hint = setTimeout(() => el.classList.remove('show'), (dur || 4) * 1000);
  }

  hideHint() {
    clearTimeout(this.timers.hint);
    this.$('hint').classList.remove('show');
  }

  flashHurt() {
    const el = this.$('fx-hurt');
    el.classList.remove('on');
    void el.offsetWidth;
    el.classList.add('on');
  }

  flash(strength) {
    const el = this.$('fx-flash');
    el.style.transition = 'none';
    el.style.opacity = String(strength);
    void el.offsetWidth;
    el.style.transition = 'opacity 1.6s ease-out';
    el.style.opacity = '0';
  }

  setFPS(text) {
    this.$('fps').textContent = text;
  }
}
