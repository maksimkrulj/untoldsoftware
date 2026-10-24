'use strict';
/* Ember, the player: movement on the sphere, the Sunblade combo system, items and power-ups. */

const _p1 = new THREE.Vector3(), _p2 = new THREE.Vector3(), _p3 = new THREE.Vector3();

class Player {
  constructor(level, loadout) {
    this.level = level;
    loadout = loadout || { weapon: 0, maxLight: 100, flask: 0, bomb: 0 };
    this.group = new THREE.Group();
    this.visual = new THREE.Group();
    this.group.add(this.visual);

    this.bodyMat = new THREE.MeshStandardMaterial({ color: 0xffa860, emissive: 0xff5a00, emissiveIntensity: 0.7, roughness: 0.45, metalness: 0 });
    this.body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 28, 20), this.bodyMat);
    this.visual.add(this.body);

    const flameGeo = new THREE.ConeGeometry(0.2, 0.75, 10);
    flameGeo.translate(0, 0.37, 0);
    this.flameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 0.85, 0.18) });
    this.flames = [];
    const fl = [[0, 0.36, -0.08, 0, 1.15], [-0.18, 0.31, 0.0, 0.45, 0.8], [0.18, 0.31, 0.0, -0.45, 0.8]];
    for (const [x, y, z, rz, s] of fl) {
      const f = new THREE.Mesh(flameGeo, this.flameMat);
      f.position.set(x, y, z);
      f.rotation.set(-0.2, 0, rz);
      f.scale.setScalar(s);
      f.userData.base = s;
      f.userData.phase = Math.random() * TAU;
      this.visual.add(f);
      this.flames.push(f);
    }

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2a1205 });
    const eyeGeo = new THREE.SphereGeometry(0.085, 12, 10);
    this.eyes = [];
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(eyeGeo, eyeMat);
      const d = new THREE.Vector3(0.3 * sx, 0.13, 0.95).normalize();
      e.position.copy(d).multiplyScalar(0.52);
      e.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d);
      e.scale.set(0.85, 1.3, 0.55);
      this.visual.add(e);
      this.eyes.push(e);
    }

    this.glow = makeGlow(new THREE.Color(0.75, 0.3, 0.06), 2.0, 0.42);
    this.visual.add(this.glow);

    // Aegis bubble
    this.shieldMat = new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(1.6, 1.2, 0.3) }, opacity: { value: 0 } },
      vertexShader: BUBBLE_VS, fragmentShader: BUBBLE_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    this.shield = new THREE.Mesh(new THREE.SphereGeometry(1.15, 24, 16), this.shieldMat);
    this.shield.visible = false;
    this.group.add(this.shield);

    this.light = new THREE.PointLight(0xff9a50, 1.0, 22, 2);
    this.light.position.set(0, 2.4, 0);
    this.group.add(this.light);

    this.blade = new Sunblade(this);

    this.dir = new THREE.Vector3(0, 1, 0);
    this.fwd = new THREE.Vector3(0, 0, -1);
    this.vel = new THREE.Vector3();
    this.knock = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.alt = 0; this.vAlt = 0; this.grounded = true; this.jumpBuffer = 0;
    this.turnVel = 0; this.speedFwd = 0;
    this.maxLight = loadout.maxLight || 100;
    this.lightLevel = this.maxLight; this.light01 = 1;
    this.invuln = 0; this.hurtT = 0; this.hurtCount = 0;
    this.dashT = 0; this.dashCd = 0; this.dashDir = 1; this.pulseCd = 0;
    this.squash = 0; this.squashV = 0;
    this.blinkT = 2.5; this.blinkDur = 0;
    this.control = false; this.dead = false; this.deathT = 0; this.deathReported = false;
    this.ascending = false; this.ascT = 0;
    this.trailAcc = 0; this.t = 0;

    // combat
    this.weapon = 0;
    this.atk = { active: false, step: 0, t: 0, dur: 0, queued: false, hitDone: false, chainT: 0, from: 0, to: 0 };
    this.slamming = false;
    this.dashStrike = false;
    this.dashHits = new Set();
    this.combo = 0; this.comboT = 0; this.bestCombo = 0;
    this.noWeaponHintT = 0;
    this.items = { flask: loadout.flask || 0, bomb: loadout.bomb || 0 };
    this.buffs = { haste: 0, fury: 0, aegis: 0, radiance: 0, magnet: 0 };
    this.setWeapon(loadout.weapon || 0);

    this.groundR = level.heightAt(this.dir);
    this.updateTransform();
  }

  snapshot() {
    return { weapon: this.weapon, maxLight: this.maxLight, flask: this.items.flask, bomb: this.items.bomb };
  }

  setWeapon(lv) {
    this.weapon = clamp(lv, 0, 3);
    this.blade.setLevel(this.weapon);
  }

  canBeTargeted() {
    return !this.dead && !this.ascending && this.level.playing;
  }

  gainLight(n) {
    if (this.dead) return 0;
    const before = this.lightLevel;
    this.lightLevel = Math.min(this.maxLight, this.lightLevel + n);
    return this.lightLevel - before;
  }

  addBuff(kind) {
    this.buffs[kind] = ITEM_DEFS[kind].dur;
  }

  damageMult() {
    return (this.buffs.fury > 0 ? 2 : 1) * (1 + Math.min(0.5, Math.floor(this.combo / 5) * 0.1));
  }

  addCombo() {
    this.combo++;
    this.comboT = 3;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    if (this.combo % 10 === 0) {
      this.gainLight(6);
      this.level.game.ui.floatText(this.position, this.combo + ' COMBO! +6', 'heal');
      this.level.game.audio.sfx('comboUp');
    }
  }

  update(dt, input) {
    const L = this.level, game = L.game;
    this.t += dt;
    this.pulseCd = Math.max(0, this.pulseCd - dt);
    this.dashCd = Math.max(0, this.dashCd - dt);
    this.invuln = Math.max(0, this.invuln - dt);
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.noWeaponHintT = Math.max(0, this.noWeaponHintT - dt);
    for (const k in this.buffs) if (this.buffs[k] > 0) this.buffs[k] = Math.max(0, this.buffs[k] - dt);
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.combo = 0; }
    this.light01 = clamp(this.lightLevel / this.maxLight, 0, 1);

    if (this.dead) { this.updateDeath(dt); return; }
    if (this.ascending) { this.updateAscend(dt); return; }

    let mv = 0, turn = 0;
    if (this.control && input) {
      if (input.isDown('fwd')) mv += 1;
      if (input.isDown('back')) mv -= 1;
      if (input.isDown('left')) turn += 1;
      if (input.isDown('right')) turn -= 1;
      if (input.axis.active) {
        mv = clamp(mv - input.axis.y, -1, 1);
        turn = clamp(turn - input.axis.x, -1, 1);
      }
      if (input.pressed('jump')) this.jumpBuffer = 0.15;
      if (input.pressed('dash')) this.tryDash(mv);
      if (input.pressed('pulse')) this.tryPulse();
      if (input.pressed('attack')) this.tryAttack();
      if (input.pressed('item1')) this.useFlask();
      if (input.pressed('item2')) this.useBomb();
    }
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);

    // steering
    this.turnVel += (turn * 3.1 - this.turnVel) * damp(16, dt);
    if (Math.abs(this.turnVel) > 1e-4) Sphere.rotateAround(this.fwd, this.dir, this.turnVel * dt);

    // velocity
    const haste = this.buffs.haste > 0 ? 1.45 : 1;
    const swingSlow = this.atk.active ? 0.45 : 1;
    const top = MAX_SPEED * haste * swingSlow;
    const targetSpeed = mv > 0 ? top * mv : (mv < 0 ? top * 0.62 * mv : 0);
    if (this.dashT > 0) {
      this.dashT -= dt;
      this.vel.copy(this.fwd).multiplyScalar(this.dashDir * 25 * (haste > 1 ? 1.15 : 1));
      if (this.dashT <= 0) { this.vel.multiplyScalar(0.45); this.dashStrike = false; }
      if (Math.random() < 0.9) {
        const p = this.position;
        L.fx.spawn(p.x, p.y, p.z, 0, 0, 0, 1.6, 0.8, 0.3, 0.6, 0.35, 0, 0, 0.1);
      }
      if (this.dashStrike) this.dashStrikeHits();
    } else {
      const accel = L.biome.slippery ? (this.grounded ? 2.6 : 1.4) : (this.grounded ? 13 : 6);
      _p1.copy(this.fwd).multiplyScalar(targetSpeed);
      this.vel.lerp(_p1, damp(accel, dt));
    }

    // move across the sphere
    _p2.copy(this.vel).add(this.knock).multiplyScalar(dt);
    Sphere.slide(this.dir, _p2, this.groundR + 0.6, this.fwd, this.vel, this.knock);
    this.fwd.normalize();
    this.knock.multiplyScalar(Math.exp(-6 * dt));
    L.resolveCollisions(this.dir, 0.45);
    this.speedFwd = this.vel.dot(this.fwd);

    // vertical
    this.groundR = L.heightAt(this.dir);
    if (this.jumpBuffer > 0 && this.grounded) {
      this.vAlt = 10.2;
      this.grounded = false;
      this.jumpBuffer = 0;
      this.squashV += 7;
      game.audio.sfx('jump');
      this.puff(8);
    }
    if (!this.grounded) {
      this.vAlt -= (this.slamming ? 70 : 26) * dt;
      this.alt += this.vAlt * dt;
      if (this.alt <= 0) {
        if (this.slamming) this.slamLand();
        else if (this.vAlt < -7) { this.squashV -= 6; game.audio.sfx('land', 0.8); this.puff(10); }
        this.alt = 0; this.vAlt = 0; this.grounded = true;
      }
    }

    this.updateAttack(dt);
    if (this.buffs.radiance > 0) this.gainLight(3 * dt);
    this.updateVisual(dt);
    this.updateTransform();
    this.emitTrail(dt);
  }

  /* ---------- combat ---------- */
  tryAttack() {
    const game = this.level.game;
    if (this.weapon < 1) {
      if (this.noWeaponHintT <= 0) {
        this.noWeaponHintT = 2.5;
        game.ui.toast(this.level.npc ? 'No weapon yet — talk to ' + this.level.npc.def.short + (IS_TOUCH ? '' : ' (F)') : 'You have no weapon', 1.8);
        game.audio.sfx('deny');
      }
      return;
    }
    if (this.slamming) return;
    if (!this.grounded && this.alt > 0.9) { this.startSlam(); return; }
    if (this.dashT > 0) {
      if (!this.dashStrike) {
        this.dashStrike = true;
        this.dashT += 0.08;
        this.dashHits.clear();
        this.blade.showArc(false, false, true);
        game.audio.sfx('swing2');
      }
      return;
    }
    const a = this.atk;
    if (a.active) {
      if (a.t > a.dur * 0.3) a.queued = true;
      return;
    }
    const next = a.chainT > 0 ? (a.step + 1) % 3 : 0;
    this.startSwing(next);
  }

  startSwing(step) {
    const a = this.atk;
    const haste = this.buffs.haste > 0 ? 0.78 : 1;
    a.active = true;
    a.step = step;
    a.t = 0;
    a.dur = (step === 2 ? 0.36 : 0.23) * haste;
    a.queued = false;
    a.hitDone = false;
    if (step === 0) { a.from = -1.75; a.to = 1.75; }
    else if (step === 1) { a.from = 1.75; a.to = -1.75; }
    else { a.from = -1.75; a.to = -1.75 + TAU * 1.05; }
    this.vel.addScaledVector(this.fwd, step === 2 ? 5 : 3.5);
    this.blade.showArc(step === 2, step === 1, step === 2);
    this.level.game.audio.sfx('swing' + step);
  }

  updateAttack(dt) {
    const a = this.atk;
    const b = this.blade;
    if (a.active) {
      a.t += dt;
      const p = clamp(a.t / a.dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      b.setPose(lerp(a.from, a.to, e), Math.PI / 2, 0.9, 0.12, true, dt);
      if (!a.hitDone && p >= 0.3) {
        a.hitDone = true;
        this.swingHits(a.step);
      }
      if (Math.random() < 0.9) {
        const tip = b.tipWorld();
        const c = BLADE_COLORS[this.weapon];
        this.level.fx.spawn(tip.x, tip.y, tip.z, 0, 0, 0, c.r * 0.8, c.g * 0.8, c.b * 0.8, 0.45, 0.25, 0, 0, 0.1);
      }
      if (a.t >= a.dur) {
        a.active = false;
        a.chainT = a.step === 2 ? 0 : 0.5;
        if (a.queued && a.step < 2) this.startSwing(a.step + 1);
        else if (a.queued) { a.queued = false; a.chainT = 0; }
      }
    } else {
      a.chainT = Math.max(0, a.chainT - dt);
      if (this.slamming) b.setPose(0, Math.PI * 0.85, 0.8, 0.4, false, dt);
      else if (this.dashT > 0 && this.dashStrike) b.setPose(0, Math.PI / 2, 1.05, 0.15, false, dt);
      else b.setPose(-1.25, 0.3, 0.8, 0.5 + Math.sin(this.t * 2.4) * 0.08, false, dt);
    }
    b.update(dt, this.buffs.fury > 0);
  }

  swingHits(step) {
    const L = this.level, game = L.game;
    const finisher = step === 2;
    const lv = this.weapon;
    const dmg = BLADE_DAMAGE[lv] * (finisher ? 2 : 1) * this.damageMult();
    const range = (finisher ? 3.5 : 2.7) + (lv >= 3 ? 0.4 : 0);
    const hits = L.meleeHit(this.position, this.fwd, this.dir, range, finisher ? -1 : Math.cos(1.35), dmg,
      { knock: finisher ? 13 : 6, burn: lv >= 3, crit: finisher });
    if (finisher && lv >= 2) L.flameWave(this);
    if (hits > 0) {
      game.hitstop = finisher ? 0.085 : 0.045;
      game.shake(finisher ? 0.25 : 0.1);
      game.audio.sfx(finisher ? 'hitBig' : 'hit');
    }
  }

  startSlam() {
    this.slamming = true;
    this.vAlt = -6;
    this.atk.active = false;
    this.level.game.audio.sfx('swing2');
  }

  slamLand() {
    const L = this.level, game = L.game;
    this.slamming = false;
    this.squashV -= 8;
    const dmg = 24 * (1 + (this.weapon - 1) * 0.3) * this.damageMult();
    const hits = L.aoeHit(this.position, 3.6, dmg, { knock: 14, burn: this.weapon >= 3, crit: true, fromPlayer: true });
    L.slamFx.fire(this.position, this.dir, this.groundR);
    this.puff(16);
    L.fx.burst(this.position, 26, 7, 2.0, 1.2, 0.4, 0.4, 0.6, { drag: 3 });
    game.audio.sfx('slamLand');
    game.shake(0.35);
    if (hits > 0) game.hitstop = 0.08;
  }

  dashStrikeHits() {
    const L = this.level;
    const dmg = 18 * (1 + (this.weapon - 1) * 0.25) * this.damageMult();
    const hits = L.meleeHit(this.position, this.fwd, this.dir, 1.9, -1, dmg,
      { knock: 10, burn: this.weapon >= 3, exclude: this.dashHits, crit: true });
    if (hits > 0) { L.game.audio.sfx('hit'); L.game.hitstop = 0.04; }
  }

  tryPulse() {
    if (this.pulseCd > 0) return;
    const game = this.level.game;
    if (this.lightLevel < PULSE_COST + 2) {
      game.ui.toast('Too dim to Pulse — find more light!', 1.4);
      game.audio.sfx('deny');
      this.pulseCd = 0.4;
      return;
    }
    this.lightLevel -= PULSE_COST;
    this.pulseCd = PULSE_CD;
    this.level.firePulse();
  }

  tryDash(mv) {
    if (this.dashCd > 0) return;
    this.atk.active = false;
    this.atk.queued = false;
    this.dashDir = mv < 0 ? -1 : 1;
    this.dashT = 0.2;
    this.dashCd = 0.9;
    this.dashStrike = false;
    this.invuln = Math.max(this.invuln, 0.32);
    this.level.game.audio.sfx('dash');
    this.level.fx.burst(this.position, 14, 4, 1.6, 0.75, 0.25, 0.35, 0.5, { drag: 3 });
  }

  useFlask() {
    const game = this.level.game;
    if (this.items.flask <= 0) { game.ui.toast('No Ember Flasks', 1.2); game.audio.sfx('deny'); return; }
    if (this.lightLevel >= this.maxLight - 1) { game.ui.toast('Your light is already full', 1.2); return; }
    this.items.flask--;
    const got = this.gainLight(45);
    game.ui.floatText(this.position, '+' + Math.round(got), 'heal');
    game.audio.sfx('flask');
    this.level.fx.burst(this.position, 30, 4, 2.0, 1.2, 0.4, 0.4, 0.8, { drag: 2, up: this.dir, upSpeed: 3 });
  }

  useBomb() {
    const game = this.level.game;
    if (this.items.bomb <= 0) { game.ui.toast('No Nova Bombs', 1.2); game.audio.sfx('deny'); return; }
    this.items.bomb--;
    this.level.novaBlast(this);
  }

  hurt(amount, fromPos, knockStrength) {
    if (!this.canBeTargeted()) return false;
    const L = this.level, game = L.game;
    if (this.buffs.aegis > 0) {
      if (this.invuln <= 0) {
        this.invuln = 0.4;
        game.audio.sfx('shield');
        game.ui.floatText(this.position, 'BLOCKED', 'shield');
      }
      return false;
    }
    if (this.invuln > 0) return false;
    amount *= game.diff.dmg;
    this.lightLevel = Math.max(0, this.lightLevel - amount);
    this.invuln = 1.0;
    this.hurtT = 1.0;
    this.hurtCount++;
    this.combo = 0;
    this.comboT = 0;
    this.slamming = false;
    if (fromPos) {
      _p1.subVectors(this.position, fromPos);
      _p1.addScaledVector(this.dir, -this.dir.dot(_p1));
      if (_p1.lengthSq() < 1e-6) _p1.copy(this.fwd).negate();
      _p1.normalize();
      this.knock.copy(_p1).multiplyScalar(knockStrength || 14);
    }
    if (this.grounded) { this.vAlt = 4; this.grounded = false; this.alt = Math.max(this.alt, 0.01); }
    L.stats.damage += amount;
    game.shake(0.55);
    game.audio.sfx('hurt');
    game.ui.flashHurt();
    game.ui.floatText(this.position, '-' + Math.round(amount), 'player');
    L.fx.burst(this.position, 18, 6, 1.6, 0.6, 0.2, 0.35, 0.6, { drag: 3 });
    L.smoke.burst(this.position, 10, 4, 0.05, 0.02, 0.08, 0.9, 0.8, { drag: 3, grow: 1.6, alpha: 0.6 });
    return true;
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.control = false;
    this.deathT = 0;
    this.level.game.audio.sfx('die');
  }

  updateDeath(dt) {
    this.deathT += dt;
    const k = 1 - smooth01(this.deathT / 1.5);
    this.visual.scale.setScalar(Math.max(0.001, k));
    this.blade.pivot.visible = false;
    this.shield.visible = false;
    this.light.intensity = 0.9 * k * (0.6 + Math.random() * 0.4);
    this.glow.material.opacity = 0.42 * k;
    if (k > 0.05 && Math.random() < 0.6) {
      const p = this.position;
      this.level.smoke.spawn(p.x, p.y, p.z, this.dir.x * 1.2, this.dir.y * 1.2, this.dir.z * 1.2, 0.08, 0.06, 0.07, 0.8, 1.2, 1, 0, 2.2, 0.5);
    }
    if (this.deathT > 1.9 && !this.deathReported) {
      this.deathReported = true;
      this.level.game.onPlayerDied();
    }
  }

  startAscend() {
    this.ascending = true;
    this.control = false;
    this.ascT = 0;
    this.level.game.audio.sfx('ascend');
  }

  updateAscend(dt) {
    this.ascT += dt;
    this.alt += (1.5 + this.ascT * 9) * dt;
    this.visual.rotation.y += dt * (4 + this.ascT * 6);
    const p = this.position;
    for (let i = 0; i < 3; i++) {
      Sphere.anyTangent(this.dir, _p1);
      Sphere.rotateAround(_p1, this.dir, Math.random() * TAU);
      this.level.fx.spawn(p.x + _p1.x * 0.6, p.y + _p1.y * 0.6, p.z + _p1.z * 0.6,
        -this.dir.x * 2, -this.dir.y * 2, -this.dir.z * 2, 1.8, 1.2, 0.5, 0.35, 0.9, 1, 0, 0.1);
    }
    this.updateAttack(dt);
    this.updateVisual(dt);
    this.updateTransform();
  }

  updateVisual(dt) {
    const t = this.t;
    const acc = -90 * this.squash - 9 * this.squashV;
    this.squashV += acc * dt;
    this.squash = clamp(this.squash + this.squashV * dt, -0.4, 0.4);
    const s = this.squash;
    this.body.scale.set(1 - s * 0.5, 1 + s, 1 - s * 0.5);

    this.visual.rotation.x = clamp(this.speedFwd / MAX_SPEED, -1, 1) * 0.25;
    this.visual.rotation.z = -this.turnVel * 0.08;

    const f = this.light01;
    for (const fl of this.flames) {
      const b = fl.userData.base;
      const fy = b * (0.85 + 0.22 * Math.sin(t * 17 + fl.userData.phase) + Math.random() * 0.1) * (0.55 + 0.6 * f);
      fl.scale.set(b * (0.9 + 0.1 * Math.sin(t * 13 + fl.userData.phase)), fy, b);
    }
    const flick = f < 0.25 ? 0.65 + Math.random() * 0.35 : 0.93 + Math.random() * 0.07;
    this.light.intensity = (0.4 + 0.7 * f) * flick * (this.ascending ? 1.8 : 1) * (this.level.biome.playerLight || 1);
    this.light.distance = 12 + 16 * f;
    this.glow.scale.setScalar(1.7 + 1.1 * f + Math.sin(t * 9) * 0.05);
    this.bodyMat.emissiveIntensity = (0.3 + 0.45 * f) * (f < 0.25 ? flick : 1);

    this.blinkT -= dt;
    if (this.blinkT <= 0) { this.blinkDur = 0.13; this.blinkT = rand(2, 5); }
    this.blinkDur = Math.max(0, this.blinkDur - dt);
    const ey = this.blinkDur > 0 ? 0.12 : 1.3;
    for (const e of this.eyes) e.scale.y = ey;

    const aegis = this.buffs.aegis;
    this.shield.visible = aegis > 0;
    if (aegis > 0) {
      const blink = aegis < 1.5 ? (Math.floor(aegis * 8) % 2 === 0 ? 0.25 : 1) : 1;
      this.shieldMat.uniforms.opacity.value = (0.8 + Math.sin(t * 6) * 0.15) * blink;
      this.shield.rotation.y += dt;
    }

    this.visual.visible = !(this.hurtT > 0 && Math.floor(this.hurtT * 16) % 2 === 0);
  }

  updateTransform() {
    let bob = 0;
    if (this.grounded && !this.ascending) {
      bob = Math.abs(this.speedFwd) > 0.6 ? Math.abs(Math.sin(this.t * 11)) * 0.12 : Math.sin(this.t * 2.2) * 0.05;
    }
    this.position.copy(this.dir).multiplyScalar(this.groundR + 0.62 + this.alt + bob);
    this.group.position.copy(this.position);
    Sphere.orient(this.group, this.dir, this.fwd);
  }

  puff(n) {
    const p = _p3.copy(this.dir).multiplyScalar(this.groundR + 0.15);
    const c = this.level.biome.key === 'frost' ? [0.9, 0.95, 1.0] : [0.7, 0.6, 0.55];
    this.level.smoke.burst(p, n, 2.2, c[0] * 0.5, c[1] * 0.5, c[2] * 0.5, 0.7, 0.6, { drag: 4, grow: 1.8, alpha: 0.35, jitter: 0.6 });
  }

  emitTrail(dt) {
    const L = this.level;
    const haste = this.buffs.haste > 0;
    this.trailAcc += dt * (10 + Math.abs(this.speedFwd) * 3.5) * L.game.quality.fx;
    const p = this.position, d = this.dir;
    while (this.trailAcc >= 1) {
      this.trailAcc -= 1;
      const j = 0.35;
      L.fx.spawn(
        p.x + (Math.random() - 0.5) * j, p.y + (Math.random() - 0.5) * j, p.z + (Math.random() - 0.5) * j,
        d.x * rand(0.8, 1.8) + (Math.random() - 0.5) * 0.6, d.y * rand(0.8, 1.8) + (Math.random() - 0.5) * 0.6, d.z * rand(0.8, 1.8) + (Math.random() - 0.5) * 0.6,
        haste ? 0.4 : 1.5, haste ? 1.2 : rand(0.5, 0.9), haste ? 1.8 : 0.18, rand(0.15, 0.3), rand(0.5, 1.0), 1.2, 0, 0.1
      );
    }
  }
}
