'use strict';
/* Boss fights: Thornmaw (Mossgrove), the Rime Warden (Rimefall), the Cinder Colossus (Cinderreach) and the Hush. */

const _b1 = new THREE.Vector3(), _b2 = new THREE.Vector3(), _b3 = new THREE.Vector3();

class BossBase {
  constructor(level, dir, cfg) {
    this.level = level;
    this.name = cfg.name;
    this.title = cfg.title;
    this.dir = dir.clone();
    this.fwd = Sphere.anyTangent(this.dir, new THREE.Vector3());
    this.position = new THREE.Vector3();
    this.maxHp = Math.round(cfg.hp * level.game.diff.hp);
    this.hp = this.maxHp;
    this.radius = cfg.radius;
    this.contactDmg = cfg.contact;
    this.baseAlt = cfg.alt;
    this.emergeDepth = cfg.depth || 6;
    this.alt = -this.emergeDepth;
    this.state = 'dormant';
    this.stateT = 0;
    this.t = 0;
    this.dead = false;
    this.enraged = false;
    this.flashT = 0;
    this.flashing = false;
    this.burnT = 0;
    this.patternIdx = 0;
    this.smokeAcc = 0;
    this.R = level.heightAt(this.dir);
    this.group = new THREE.Group();
    this.inner = new THREE.Group();
    this.group.add(this.inner);
    this.group.visible = false;
    this.flashTargets = [];
    this.decal = new THREE.Mesh(level.A.bossDecalGeo, level.A.decalMat);
    this.decal.scale.setScalar(cfg.decal || 0.8);
    this.group.add(this.decal);
  }

  addFlash(mesh) { this.flashTargets.push({ mesh, base: mesh.material }); return mesh; }

  setState(s) { this.state = s; this.stateT = 0; this.onEnter && this.onEnter(s); }

  targetable() {
    return !this.dead && this.state !== 'dormant' && this.state !== 'emerge' && this.alt > -1;
  }

  damageTakenMult() { return 1; }

  takeHit(dmg, fromPos, opts) {
    if (!this.targetable()) return 0;
    opts = opts || {};
    const m = this.damageTakenMult();
    if (m <= 0) { this.onShieldHit(); return 0; }
    dmg *= m;
    const floor = this.hpFloor ? this.hpFloor() : 0;
    if (this.hp <= floor) { this.onShieldHit(); return 0; }
    const dealt = Math.min(dmg, this.hp - floor);
    this.hp -= dealt;
    this.flashT = 0.1;
    if (opts.burn) this.burnT = 3;
    if (!this.enraged && this.hp < this.maxHp * 0.5) {
      this.enraged = true;
      this.level.game.ui.toast(this.name + ' is enraged!', 1.8);
      this.level.game.audio.sfx('roar', 0.8);
      if (this.onEnrage) this.onEnrage();
    }
    if (this.hp <= 0) this.die();
    return dealt;
  }

  onShieldHit() {
    const L = this.level;
    L.game.audio.sfx('shield');
    L.game.ui.floatText(this.position, 'SHIELDED', 'shield');
  }

  emerge() {
    this.group.visible = true;
    this.setState('emerge');
    this.level.game.audio.sfx('roar');
    this.level.game.shake(0.8);
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.setState('dying');
    this.level.game.audio.sfx('roar', 1);
  }

  steerTo(targetDir, rate, dt) {
    Sphere.tangentToward(this.dir, targetDir, _b1);
    if (_b1.lengthSq() > 0) this.fwd.lerp(_b1, damp(rate, dt)).normalize();
    if (this.fwd.lengthSq() < 0.5) Sphere.anyTangent(this.dir, this.fwd);
  }

  move(speed, dt) {
    if (!speed) return;
    _b2.copy(this.fwd).multiplyScalar(speed * this.level.game.diff.enemySpeed * dt);
    Sphere.slide(this.dir, _b2, this.R + Math.max(0, this.alt), this.fwd);
    this.fwd.normalize();
  }

  arcToPlayer() {
    const P = this.level.player;
    return P ? Sphere.angle(this.dir, P.dir) * this.R : 999;
  }

  nextFrom(pattern) {
    const s = pattern[this.patternIdx++ % pattern.length];
    this.setState(s);
  }

  groundSmoke(n) {
    const L = this.level;
    _b3.copy(this.dir).multiplyScalar(this.R + 0.2);
    for (let i = 0; i < n; i++) {
      Sphere.anyTangent(this.dir, _b1);
      Sphere.rotateAround(_b1, this.dir, Math.random() * TAU);
      const s = rand(2, 7);
      L.smoke.spawn(_b3.x, _b3.y, _b3.z, _b1.x * s + this.dir.x, _b1.y * s + this.dir.y, _b1.z * s + this.dir.z,
        0.05, 0.03, 0.06, rand(1.2, 2.2), rand(0.8, 1.4), 2, 0, 2, 0.6);
    }
  }

  update(dt) {
    if (this.state === 'dormant' || this.state === 'gone') return;
    const L = this.level, P = L.player;
    this.t += dt;
    this.stateT += dt;
    this.R = L.heightAt(this.dir);
    tickBurn(this, dt);
    if (this.state === 'emerge') {
      this.alt = lerp(-this.emergeDepth, this.baseAlt, easeOutCubic(this.stateT / 2.2));
      if (Math.random() < 0.9) this.groundSmoke(3);
      if (P) this.steerTo(P.dir, 3, dt);
      if (this.stateT >= 2.2) { this.alt = this.baseAlt; this.nextFrom(this.pattern()); }
    } else if (this.state === 'dying') {
      this.updateDying(dt);
    } else {
      this.think(dt);
      if (P && P.canBeTargeted() && this.alt > 0 && this.position.distanceTo(P.position) < this.radius + 0.55) {
        P.hurt(this.contactDmg, this.position, 18);
      }
    }
    this.updateTransform();
    this.animate(dt);
    if (this.flashT > 0) this.flashT -= dt;
    const f = this.flashT > 0;
    if (f !== this.flashing) {
      this.flashing = f;
      for (const ft of this.flashTargets) ft.mesh.material = f ? L.A.flashMat : ft.base;
    }
  }

  updateDying(dt) {
    const L = this.level;
    const s = 0.15 + this.stateT * 0.3;
    this.inner.position.set((Math.random() - 0.5) * s, (Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    this.flashT = Math.floor(this.stateT * 10) % 2 ? 0.05 : 0;
    if (Math.random() < 0.6) L.fx.burst(this.position, 3, 7, 2.0, 1.6, 1.0, 0.5, 0.6, { drag: 1, jitter: 2.5 });
    L.game.shake(0.1);
    if (this.stateT > 1.8) {
      this.group.visible = false;
      this.state = 'gone';
      L.fx.burst(this.position, Math.round(160 * L.game.quality.fx), 14, 2.2, 1.6, 1.0, 0.6, 1.4, { drag: 1.4 });
      L.smoke.burst(this.position, 40, 7, 0.05, 0.02, 0.08, 2.0, 1.4, { drag: 2, grow: 2.5, alpha: 0.7 });
      L.game.ui.flash(0.5);
      L.game.audio.sfx('bossDie', 0.7);
      L.game.shake(1.0);
      L.onBossDefeated(this);
    }
  }

  updateTransform() {
    this.position.copy(this.dir).multiplyScalar(this.R + this.alt);
    this.group.position.copy(this.position);
    Sphere.orient(this.group, this.dir, this.fwd);
    this.decal.position.y = -this.alt + 0.08;
    this.decal.visible = this.alt > -0.5;
  }

  emitSmoke(dt, rate, size) {
    const L = this.level;
    this.smokeAcc += dt * rate * L.game.quality.fx;
    while (this.smokeAcc >= 1) {
      this.smokeAcc -= 1;
      _b1.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(size);
      const p = this.position;
      L.smoke.spawn(p.x + _b1.x, p.y + _b1.y, p.z + _b1.z, _b1.x * 0.3, _b1.y * 0.3, _b1.z * 0.3,
        0.05, 0.02, 0.07, rand(0.8, 1.5), rand(0.7, 1.2), 1.5, 0, 2, 0.5);
    }
  }

  // Dotted danger line along the boss's facing, used to telegraph charges.
  telegraphLine(length, time) {
    const L = this.level;
    const d = this.dir.clone(), f = this.fwd.clone();
    for (let s = 2.5; s <= length; s += 2) {
      Sphere.slide(d, _b1.copy(f).multiplyScalar(2), L.R, f);
      f.normalize();
      L.addMarker(d, 0.9, time, 'danger', null);
    }
  }
}

/* ======================= Thornmaw — Mossgrove ======================= */
class Thornmaw extends BossBase {
  constructor(level, dir) {
    super(level, dir, { name: 'Thornmaw', title: 'Thornmaw, the Root-Eater', hp: 520, radius: 2.0, contact: 22, alt: 1.55, decal: 0.75 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1c1224, roughness: 0.85, flatShading: true });
    const glowThorn = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 1.6, 0.25) });
    const body = this.addFlash(new THREE.Mesh(new THREE.SphereGeometry(1.5, 20, 14), dark));
    body.scale.set(1.2, 0.85, 1.45);
    this.inner.add(body);
    const head = this.addFlash(new THREE.Mesh(new THREE.SphereGeometry(0.95, 16, 12), dark));
    head.position.set(0, 0.35, 1.75);
    this.inner.add(head);
    this.head = head;
    const maw = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.7, 0.25) }));
    maw.scale.set(1, 0.32, 0.5);
    maw.position.set(0, 0.05, 2.5);
    this.inner.add(maw);
    this.maw = maw;
    const toothGeo = new THREE.ConeGeometry(0.07, 0.28, 5);
    const toothMat = new THREE.MeshBasicMaterial({ color: 0xf2ead8 });
    for (let i = 0; i < 6; i++) {
      const tth = new THREE.Mesh(toothGeo, toothMat);
      tth.position.set(-0.4 + i * 0.16, 0.2, 2.62);
      tth.rotation.x = Math.PI;
      this.inner.add(tth);
    }
    const eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.4, 0.4) });
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), eyeMat);
      e.position.set(0.45 * sx, 0.68, 2.45);
      e.scale.set(1.3, 0.6, 0.6);
      e.rotation.z = sx * 0.4;
      this.inner.add(e);
    }
    const thornGeo = new THREE.ConeGeometry(0.2, 1.2, 6);
    thornGeo.translate(0, 0.6, 0);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      const v = new THREE.Vector3(Math.cos(a) * 0.7, 1, Math.sin(a) * 0.9 - 0.2).normalize();
      const th = new THREE.Mesh(thornGeo, i % 3 === 0 ? glowThorn : dark);
      th.position.set(v.x * 1.3, v.y * 1.05, v.z * 1.6);
      th.quaternion.setFromUnitVectors(AXIS_Y, v);
      th.scale.setScalar(rand(0.7, 1.2));
      this.inner.add(th);
    }
    this.legs = [];
    const legGeo = new THREE.CylinderGeometry(0.3, 0.2, 1.4, 7);
    legGeo.translate(0, -0.7, 0);
    for (const [x, z] of [[-0.95, 0.9], [0.95, 0.9], [-0.95, -0.9], [0.95, -0.9]]) {
      const l = this.addFlash(new THREE.Mesh(legGeo, dark));
      l.position.set(x, -0.5, z);
      this.inner.add(l);
      this.legs.push(l);
    }
    this.tail = [];
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.45 - i * 0.07, 10, 8), dark);
      this.inner.add(s);
      this.tail.push(s);
    }
    this.aura = makeGlow(new THREE.Color(0.35, 0.7, 0.1), 9, 0.35);
    this.inner.add(this.aura);
    this.thornGeo = new THREE.ConeGeometry(0.35, 2.2, 6);
    this.thornGeo.translate(0, 1.1, 0);
    this.thornMat = dark;
    this.charged = false;
  }

  pattern() {
    return this.enraged ? ['stalk', 'chargeWind', 'stalk', 'chargeWind', 'burstWind', 'howl'] : ['stalk', 'chargeWind', 'stalk', 'burstWind', 'stalk', 'chargeWind', 'howl'];
  }

  damageTakenMult() { return this.state === 'dizzy' ? 1.5 : 1; }

  onEnter(s) {
    const L = this.level;
    if (s === 'chargeWind') {
      if (L.player) {
        Sphere.tangentToward(this.dir, L.player.dir, _b1);
        if (_b1.lengthSq() > 0) this.fwd.copy(_b1);
      }
      this.telegraphLine(19, 0.85);
      L.game.audio.sfx('charge');
    } else if (s === 'charge') {
      this.charged = false;
    } else if (s === 'burstWind') {
      L.addMarker(this.dir, 5.6, 0.9, 'danger', null);
    } else if (s === 'howl') {
      L.game.audio.sfx('roar', 0.8);
    }
  }

  think(dt) {
    const L = this.level, P = L.player;
    const canTarget = P && P.canBeTargeted();
    const arc = this.arcToPlayer();
    switch (this.state) {
      case 'stalk':
        if (canTarget) this.steerTo(P.dir, 3, dt);
        this.move(arc > 3.2 ? (this.enraged ? 4.6 : 3.6) : 0, dt);
        if (this.stateT > (this.enraged ? 1.3 : 2.1) && canTarget) this.nextFrom(this.pattern());
        break;
      case 'chargeWind':
        if (this.stateT > 0.85) this.setState('charge');
        break;
      case 'charge':
        this.move(20, dt);
        if (Math.random() < 0.8) this.groundSmoke(2);
        if (!this.charged && canTarget && this.position.distanceTo(P.position) < this.radius + 0.9) {
          if (P.hurt(26, this.position, 24)) this.charged = true;
        }
        if (this.stateT > 0.95) { L.game.shake(0.3); this.setState('dizzy'); }
        break;
      case 'dizzy':
        if (Math.random() < 0.5) {
          _b1.copy(this.head.position);
          this.inner.localToWorld(_b1);
          L.fx.spawn(_b1.x, _b1.y + 0.8, _b1.z, (Math.random() - 0.5) * 2, 1.5, (Math.random() - 0.5) * 2, 1.8, 1.8, 0.6, 0.3, 0.5, 2, 0, 0.3);
        }
        if (this.stateT > 1.4) this.nextFrom(this.pattern());
        break;
      case 'burstWind':
        if (this.stateT > 0.9) this.thornBurst();
        break;
      case 'burstRecover':
        if (this.stateT > 0.8) this.nextFrom(this.pattern());
        break;
      case 'howl':
        if (this.stateT > 0.5 && !this.howled) {
          this.howled = true;
          for (let i = 0; i < 2; i++) {
            _b1.copy(this.fwd);
            Sphere.rotateAround(_b1, this.dir, i ? 1.2 : -1.2);
            _b2.copy(this.dir);
            Sphere.slide(_b2, _b1.multiplyScalar(4), this.R);
            L.spawnEnemy(this.enraged && i ? 'stalker' : 'wisp', _b2.clone());
          }
        }
        if (this.stateT > 1.3) { this.howled = false; this.nextFrom(this.pattern()); }
        break;
    }
  }

  thornBurst() {
    const L = this.level, P = L.player;
    this.setState('burstRecover');
    for (let i = 0; i < 12; i++) {
      _b1.copy(this.fwd);
      Sphere.rotateAround(_b1, this.dir, (i / 12) * TAU);
      for (const r of [2.6, 4.6]) {
        _b2.copy(this.dir);
        Sphere.slide(_b2, _b3.copy(_b1).multiplyScalar(r), this.R);
        L.addEffect(new SpikeFX(L, _b2, this.thornGeo, this.thornMat, rand(0.8, 1.2)));
      }
    }
    L.game.audio.sfx('spike');
    L.game.shake(0.4);
    if (P && P.canBeTargeted() && this.arcToPlayer() < 5.6 && P.alt < 1.6) P.hurt(24, this.position, 20);
  }

  animate(dt) {
    const t = this.t;
    const moving = this.state === 'stalk' || this.state === 'charge';
    const sp = this.state === 'charge' ? 22 : 9;
    this.legs.forEach((l, i) => { l.rotation.x = moving ? Math.sin(t * sp + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.6 : 0; });
    this.tail.forEach((s, i) => {
      s.position.set(Math.sin(t * 3 + i * 0.7) * 0.25 * i, 0.2 - i * 0.12, -1.8 - i * 0.5);
    });
    let sq = 1;
    if (this.state === 'chargeWind' || this.state === 'burstWind') sq = 1 + Math.sin(this.stateT * 40) * 0.05;
    if (this.state === 'dizzy') this.inner.rotation.z = Math.sin(t * 6) * 0.15;
    else this.inner.rotation.z = 0;
    this.inner.scale.setScalar(sq);
    if (this.state !== 'dying') this.inner.position.set(0, 0, 0);
    this.maw.scale.set(1, 0.32 + (this.state === 'howl' || this.state === 'burstWind' ? 0.35 : Math.sin(t * 4) * 0.05), 0.5);
    this.aura.material.opacity = 0.3 + (this.enraged ? 0.2 : 0) + Math.sin(t * 3) * 0.08;
    this.emitSmoke(dt, 8, 1.6);
  }
}

/* ======================= The Rime Warden — Rimefall ======================= */
class RimeWarden extends BossBase {
  constructor(level, dir) {
    super(level, dir, { name: 'Rime Warden', title: 'The Rime Warden', hp: 720, radius: 1.9, contact: 20, alt: 3.4, decal: 0.6, depth: 7 });
    const ice = new THREE.MeshStandardMaterial({ color: 0x9fd8ff, emissive: 0x2a7fd0, emissiveIntensity: 0.55, roughness: 0.15, metalness: 0.1, flatShading: true, transparent: true, opacity: 0.93 });
    this.iceMat = ice;
    const core = this.addFlash(new THREE.Mesh(new THREE.OctahedronGeometry(1.35, 0), ice));
    core.scale.set(1, 1.55, 1);
    this.inner.add(core);
    this.core = core;
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 1.6, 2.6) }));
    this.inner.add(heart);
    this.eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.6, 3.0) });
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), this.eyeMat);
    eye.position.set(0, 0.35, 1.0);
    eye.scale.set(1.5, 0.55, 0.5);
    this.inner.add(eye);
    this.orbiters = [];
    const shardGeo = new THREE.OctahedronGeometry(0.42, 0);
    shardGeo.scale(0.6, 1.9, 0.6);
    for (let i = 0; i < 6; i++) {
      const s = this.addFlash(new THREE.Mesh(shardGeo, ice));
      this.inner.add(s);
      this.orbiters.push(s);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.06, 6, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 1.5, 2.2) }));
    ring.rotation.x = Math.PI / 2;
    this.inner.add(ring);
    this.ring = ring;
    this.aura = makeGlow(new THREE.Color(0.25, 0.65, 1.0), 11, 0.4);
    this.inner.add(this.aura);
    this.spikeGeo = (() => {
      const parts = [];
      for (let i = 0; i < 5; i++) {
        const c = new THREE.ConeGeometry(0.28, 2.2 + Math.random() * 0.8, 5);
        c.translate(0, 1.1, 0);
        c.rotateZ((Math.random() - 0.5) * 0.6);
        c.rotateX((Math.random() - 0.5) * 0.6);
        c.translate((Math.random() - 0.5) * 1.3, 0, (Math.random() - 0.5) * 1.3);
        parts.push(c);
      }
      return mergeGeos(parts);
    })();
    this.spikeMat = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, emissive: 0x3a90d0, emissiveIntensity: 0.6, flatShading: true, roughness: 0.2 });
    this.volleys = 0;
  }

  pattern() {
    return this.enraged ? ['drift', 'volley', 'spikes', 'drift', 'nova', 'spikes'] : ['drift', 'volley', 'drift', 'spikes', 'drift', 'nova'];
  }

  onEnter(s) {
    if (s === 'volley') this.volleys = this.enraged ? 2 : 1;
    if (s === 'nova') this.level.game.audio.sfx('summon', 0.6);
  }

  think(dt) {
    const L = this.level, P = L.player;
    const canTarget = P && P.canBeTargeted();
    const arc = this.arcToPlayer();
    const hover = this.baseAlt + Math.sin(this.t * 1.6) * 0.3;
    switch (this.state) {
      case 'drift':
        if (canTarget) this.steerTo(P.dir, 3, dt);
        this.move(arc > 12 ? 5 : (arc < 7 ? -3.5 : 1.2), dt);
        this.alt += (hover - this.alt) * damp(3, dt);
        if (this.stateT > (this.enraged ? 1.4 : 2.0) && canTarget) this.nextFrom(this.pattern());
        break;
      case 'volley':
        if (canTarget) this.steerTo(P.dir, 6, dt);
        this.alt += (hover - this.alt) * damp(3, dt);
        if (this.stateT > 0.6) {
          this.fireFan(this.enraged ? 7 : 5);
          this.volleys--;
          if (this.volleys > 0) this.stateT = 0.1;
          else this.setState('drift');
        }
        break;
      case 'spikes':
        this.alt += (hover - this.alt) * damp(3, dt);
        if (this.stateT > 0.4 && !this.spiked) {
          this.spiked = true;
          if (canTarget) this.iceSpikes(this.enraged ? 6 : 4);
        }
        if (this.stateT > 1.6) { this.spiked = false; this.nextFrom(this.pattern()); }
        break;
      case 'nova':
        if (this.stateT < 0.7) this.alt += (1.3 - this.alt) * damp(6, dt);
        else if (!this.novaDone) {
          this.novaDone = true;
          L.spawnShockwave(this.dir, { color: new THREE.Color(0.4, 1.4, 2.2), dmg: 18 });
          L.game.audio.sfx('slam', 0.8);
          L.game.shake(0.5);
          this.groundSmoke(16);
        } else this.alt += (hover - this.alt) * damp(1.5, dt);
        if (this.stateT > 2.0) { this.novaDone = false; this.nextFrom(this.pattern()); }
        break;
    }
  }

  fireFan(n) {
    const L = this.level;
    const spread = this.enraged ? 1.0 : 0.75;
    for (let i = 0; i < n; i++) {
      const a = n === 1 ? 0 : -spread + (2 * spread * i) / (n - 1);
      _b1.copy(this.fwd);
      Sphere.rotateAround(_b1, this.dir, a);
      L.spawnProjectile({ kind: 'shard', dir: this.dir, fwd: _b1, speed: 13, alt: 0.9, dmg: 16, life: 3.2 });
    }
    L.game.audio.sfx('shardFire');
  }

  iceSpikes(n) {
    const L = this.level, P = L.player;
    const spots = [P.dir.clone()];
    for (let i = 1; i < n; i++) {
      const d = P.dir.clone();
      Sphere.anyTangent(d, _b1);
      Sphere.rotateAround(_b1, d, Math.random() * TAU);
      Sphere.slide(d, _b1.multiplyScalar(rand(2.5, 6.5)), L.R);
      spots.push(d);
    }
    for (const d of spots) {
      L.addMarker(d, 1.9, 1.1, 'ice', dd => {
        L.addEffect(new SpikeFX(L, dd, this.spikeGeo, this.spikeMat, 1));
        L.game.audio.sfx('spike', 0.7);
        const PP = L.player;
        if (PP && PP.canBeTargeted() && L.arc(dd, PP.dir) < 1.9 && PP.alt < 1.6) PP.hurt(22, dd.clone().multiplyScalar(L.heightAt(dd)), 14);
      });
    }
  }

  animate(dt) {
    const t = this.t;
    this.orbiters.forEach((s, i) => {
      const a = t * (this.enraged ? 2.2 : 1.4) + (i / 6) * TAU;
      s.position.set(Math.cos(a) * 2.5, Math.sin(t * 2 + i) * 0.5, Math.sin(a) * 2.5);
      s.rotation.y = -a;
    });
    this.core.rotation.y += dt * 0.6;
    this.ring.rotation.z += dt * 0.9;
    const k = this.state === 'volley' || this.state === 'spikes' ? 1.5 + Math.sin(t * 30) * 0.3 : 1;
    this.eyeMat.color.setRGB(2.2 * k, 2.6 * k, 3.0 * k);
    this.aura.material.opacity = 0.35 + Math.sin(t * 2.5) * 0.08;
    if (this.state !== 'dying') this.inner.position.set(0, 0, 0);
    if (Math.random() < 0.4 * this.level.game.quality.fx) {
      const p = this.position;
      this.level.fx.spawn(p.x + (Math.random() - 0.5) * 3, p.y + (Math.random() - 0.5) * 3, p.z + (Math.random() - 0.5) * 3, 0, -1, 0, 0.7, 0.9, 1.1, 0.2, 1.2, 0.5, 0, 0.5);
    }
  }
}

/* ======================= The Cinder Colossus — Cinderreach ======================= */
class CinderColossus extends BossBase {
  constructor(level, dir) {
    super(level, dir, { name: 'Cinder Colossus', title: 'The Cinder Colossus', hp: 800, radius: 2.4, contact: 26, alt: 2.7, decal: 0.9, depth: 7 });
    const rock = new THREE.MeshStandardMaterial({ color: 0x2b1a15, emissive: 0xff3a00, emissiveIntensity: 0.22, flatShading: true, roughness: 0.9 });
    this.rockMat = rock;
    const parts = [];
    const a = new THREE.DodecahedronGeometry(1.5, 0); a.scale(1.15, 1, 0.9); a.translate(0, 0.3, 0); parts.push(a);
    const b = new THREE.DodecahedronGeometry(0.9, 0); b.translate(-0.8, 1.2, 0.1); parts.push(b);
    const c = new THREE.DodecahedronGeometry(0.9, 0); c.translate(0.8, 1.2, 0.1); parts.push(c);
    const torso = this.addFlash(new THREE.Mesh(mergeGeos(parts), rock));
    this.inner.add(torso);
    const head = this.addFlash(new THREE.Mesh(new THREE.DodecahedronGeometry(0.62, 0), rock));
    head.position.set(0, 2.0, 0.35);
    this.inner.add(head);
    this.coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.0, 0.2) });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), this.coreMat);
    core.position.set(0, 0.5, 1.1);
    this.inner.add(core);
    const eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.8, 0.3) });
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), eyeMat);
      e.position.set(0.24 * sx, 2.05, 0.9);
      this.inner.add(e);
    }
    this.arms = [];
    for (const sx of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(1.9 * sx, 1.0, 0);
      const upper = this.addFlash(new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 0), rock));
      const fist = this.addFlash(new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), rock));
      fist.position.y = -1.4;
      arm.add(upper, fist);
      this.inner.add(arm);
      this.arms.push(arm);
    }
    this.legs = [];
    const legGeo = new THREE.CylinderGeometry(0.55, 0.45, 1.5, 7);
    legGeo.translate(0, -0.75, 0);
    for (const sx of [-1, 1]) {
      const l = this.addFlash(new THREE.Mesh(legGeo, rock));
      l.position.set(0.75 * sx, -0.9, 0);
      this.inner.add(l);
      this.legs.push(l);
    }
    this.aura = makeGlow(new THREE.Color(1.0, 0.35, 0.05), 12, 0.35);
    this.inner.add(this.aura);
    this.slams = 0;
  }

  pattern() {
    return this.enraged ? ['walk', 'barrage', 'slam', 'walk', 'meteor', 'barrage'] : ['walk', 'barrage', 'walk', 'slam'];
  }

  onEnter(s) {
    if (s === 'slam') this.slams = this.enraged ? 2 : 1;
    if (s === 'barrage' || s === 'meteor') this.level.game.audio.sfx('charge', 0.8);
  }

  think(dt) {
    const L = this.level, P = L.player;
    const canTarget = P && P.canBeTargeted();
    const arc = this.arcToPlayer();
    switch (this.state) {
      case 'walk':
        if (canTarget) this.steerTo(P.dir, 2.5, dt);
        this.move(arc > 4.5 ? (this.enraged ? 3.8 : 3.0) : 0, dt);
        if (this.stateT > (this.enraged ? 1.6 : 2.2) && canTarget) this.nextFrom(this.pattern());
        break;
      case 'barrage':
        if (this.stateT > 0.8 && !this.fired) {
          this.fired = true;
          if (canTarget) this.lobBarrage(this.enraged ? 7 : 5);
        }
        if (this.stateT > 1.6) { this.fired = false; this.nextFrom(this.pattern()); }
        break;
      case 'slam':
        if (this.stateT > 0.8) {
          L.spawnShockwave(this.dir, { color: new THREE.Color(2.2, 0.7, 0.12), dmg: 20 });
          L.game.audio.sfx('slam', 0.9);
          L.game.shake(0.6);
          this.groundSmoke(20);
          _b1.copy(this.dir).multiplyScalar(this.R + 0.4);
          L.fx.burst(_b1, 40, 9, 2.4, 0.8, 0.15, 0.5, 0.8, { drag: 2.5 });
          if (canTarget && arc < 4.2 && P.alt < 1.5) P.hurt(26, this.position, 22);
          this.slams--;
          if (this.slams > 0) this.stateT = -0.2;
          else this.setState('slamRecover');
        }
        break;
      case 'slamRecover':
        if (this.stateT > 0.9) this.nextFrom(this.pattern());
        break;
      case 'meteor':
        if (canTarget) {
          const n = 8;
          const due = Math.min(n, Math.floor(this.stateT / 0.22));
          while ((this.meteors || 0) < due) {
            this.meteors = (this.meteors || 0) + 1;
            const d = P.dir.clone();
            if (this.meteors > 1) {
              Sphere.anyTangent(d, _b1);
              Sphere.rotateAround(_b1, d, Math.random() * TAU);
              Sphere.slide(d, _b1.multiplyScalar(rand(1.5, 6)), L.R);
            }
            _b2.copy(this.position).addScaledVector(this.dir, 4);
            L.spawnLob(_b2, d, 1.0, 20, 2.1, false);
          }
        }
        if (this.stateT > 2.6) { this.meteors = 0; this.nextFrom(this.pattern()); }
        break;
    }
  }

  lobBarrage(n) {
    const L = this.level, P = L.player;
    for (let i = 0; i < n; i++) {
      const d = P.dir.clone();
      if (i > 0) {
        Sphere.anyTangent(d, _b1);
        Sphere.rotateAround(_b1, d, Math.random() * TAU);
        Sphere.slide(d, _b1.multiplyScalar(rand(2.5, 7)), L.R);
      }
      _b2.copy(this.position).addScaledVector(this.dir, 3);
      L.spawnLob(_b2, d, rand(1.15, 1.6), 20, 2.4, true);
    }
    L.game.audio.sfx('fireball');
  }

  animate(dt) {
    const t = this.t;
    const walking = this.state === 'walk';
    this.legs.forEach((l, i) => { l.rotation.x = walking ? Math.sin(t * 5 + i * Math.PI) * 0.4 : 0; });
    let armLift = 0;
    if (this.state === 'barrage' || this.state === 'slam' || this.state === 'meteor') armLift = clamp(this.stateT / 0.6, 0, 1) * 2.4;
    if (this.state === 'slamRecover') armLift = Math.max(0, 1 - this.stateT * 3) * -0.4;
    this.arms.forEach((a, i) => {
      a.rotation.x = -armLift + (walking ? Math.sin(t * 5 + i * Math.PI) * 0.5 : 0);
    });
    const glow = this.enraged ? 1.5 + Math.sin(t * 8) * 0.3 : 1;
    this.coreMat.color.setRGB(2.6 * glow, 1.0 * glow, 0.2 * glow);
    this.rockMat.emissiveIntensity = this.enraged ? 0.45 + Math.sin(t * 6) * 0.15 : 0.22;
    this.aura.material.opacity = 0.3 + Math.sin(t * 3) * 0.08;
    if (this.state !== 'dying') this.inner.position.set(0, 0, 0);
    if (Math.random() < 0.6 * this.level.game.quality.fx) {
      const p = this.position;
      this.level.fx.spawn(p.x + (Math.random() - 0.5) * 3, p.y + (Math.random() - 0.5) * 3, p.z + (Math.random() - 0.5) * 3,
        this.dir.x * 1.5, this.dir.y * 1.5, this.dir.z * 1.5, 2.2, 0.6, 0.1, 0.25, 1.0, 0.5, 0, 0.3);
    }
  }
}

/* ======================= The Hush — The Hollow Sun ======================= */
class Hush extends BossBase {
  constructor(level, dir) {
    super(level, dir, { name: 'The Hush', title: 'The Hush', hp: 1100, radius: 2.7, contact: 25, alt: 7, depth: 7, decal: 1 });
    const A = level.A;
    this.core = this.addFlash(new THREE.Mesh(new THREE.SphereGeometry(2.4, 28, 20), A.shadowMat));
    this.inner.add(this.core);

    this.spikes = new THREE.Group();
    this.inner.add(this.spikes);
    const spikeGeo = new THREE.ConeGeometry(0.42, 2.6, 6);
    spikeGeo.translate(0, 1.3 + 1.8, 0);
    const N = 28;
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996;
      const d = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
      const s = new THREE.Mesh(spikeGeo, A.shadowMat);
      s.quaternion.setFromUnitVectors(AXIS_Y, d);
      const sc = rand(0.55, 1.15);
      s.scale.set(sc, sc * rand(0.8, 1.3), sc);
      this.spikes.add(s);
    }

    this.eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.0, 0.45, 2.5) });
    const eyeGeo = new THREE.SphereGeometry(0.3, 14, 10);
    const eyeDefs = [[0, 0.35, 1, 1.5], [-0.75, 0.85, 0.8, 0.8], [0.75, 0.85, 0.8, 0.8], [-0.9, -0.15, 0.8, 0.7], [0.9, -0.15, 0.8, 0.7], [0, 1.25, 0.7, 0.6]];
    for (const [x, y, z, s] of eyeDefs) {
      const e = new THREE.Mesh(eyeGeo, this.eyeMat);
      const d = new THREE.Vector3(x, y, 2.2 * z).normalize();
      e.position.copy(d).multiplyScalar(2.3);
      e.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d);
      e.scale.set(s * 1.3, s * 0.55, 0.5);
      this.inner.add(e);
    }

    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.3, 1.8) });
    this.ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.7, 0.07, 6, 72), ringMat);
    this.ring1.rotation.x = Math.PI / 2;
    this.inner.add(this.ring1);
    this.ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.3, 0.05, 6, 72), ringMat);
    this.ring2.rotation.x = Math.PI / 2 + 0.5;
    this.inner.add(this.ring2);

    this.aura = makeGlow(new THREE.Color(0.75, 0.12, 0.85), 17, 0.6);
    this.inner.add(this.aura);

    this.shieldMat = new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(1.2, 0.3, 1.6) }, opacity: { value: 0.8 } },
      vertexShader: BUBBLE_VS, fragmentShader: BUBBLE_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    this.shield = new THREE.Mesh(new THREE.SphereGeometry(4.4, 32, 20), this.shieldMat);
    this.group.add(this.shield);
    this.shieldHitT = 0;

    this.tendrils = [];
    for (let i = 0; i < 6; i++) {
      const segs = [];
      const a = (i / 6) * TAU;
      for (let j = 0; j < 7; j++) {
        const m = new THREE.Mesh(A.shadowBlob, A.shadowMat);
        m.scale.setScalar(0.75 - j * 0.08);
        this.inner.add(m);
        segs.push(m);
      }
      this.tendrils.push({ a, segs });
    }

    this.teleMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 0.25, 1.4), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    this.tele = new THREE.Mesh(A.bossTeleGeo, this.teleMat);
    this.group.add(this.tele);

    this.stage = 0;
    this.attackIdx = 0;
    this.slamsLeft = 0;
    this.driftTime = 4.5;
    this.exposedT = 0;
  }

  litCount() { return this.level.pyres.filter(p => p.lit).length; }

  shielded() { return this.exposedT <= 0 && this.litCount() < 5; }

  damageTakenMult() {
    if (this.shielded()) return 0;
    return this.state === 'stagger' ? 1.5 : 1;
  }

  hpFloor() {
    return this.maxHp * (1 - this.litCount() / 5);
  }

  onShieldHit() {
    this.shieldHitT = 0.25;
    const L = this.level;
    L.game.audio.sfx('shield');
    L.game.ui.floatText(this.position, this.shielded() ? 'SHIELDED' : 'KINDLE A PYRE', 'shield');
  }

  emerge() {
    this.group.visible = true;
    this.alt = -7;
    this.setState('emerge');
    this.level.game.audio.sfx('roar');
    this.level.game.shake(0.8);
  }

  onPyreLit() {
    this.stage++;
    this.slamsLeft = 0;
    this.exposedT = this.stage >= 5 ? Infinity : 8;
    this.setState('stagger');
    const L = this.level;
    L.game.audio.sfx('roar', 0.9);
    L.fx.burst(this.position, 70, 12, 1.6, 0.5, 1.8, 0.6, 1.0, { drag: 2 });
    L.game.ui.toast(this.stage >= 5 ? 'The shield is shattered — finish it!' : 'The shield cracks — strike now!', 2.2);
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.level.startFinale();
  }

  update(dt) {
    if (this.state === 'dormant') return;
    const L = this.level, P = L.player, game = L.game;
    this.t += dt;
    this.stateT += dt;
    this.R = L.heightAt(this.dir);
    tickBurn(this, dt);
    if (this.exposedT !== Infinity && this.exposedT > 0) this.exposedT = Math.max(0, this.exposedT - dt);
    const canTarget = P && P.canBeTargeted();
    const arc = P ? Sphere.angle(this.dir, P.dir) * this.R : 99;
    let speed = 0;
    const final = this.stage >= 5;
    const hover = (final ? 3.4 : 7) + Math.sin(this.t * 1.3) * 0.5;
    let tele = 0;

    switch (this.state) {
      case 'emerge':
        this.alt = lerp(-7, hover, easeOutCubic(this.stateT / 3));
        if (Math.random() < 0.9) this.groundSmoke(3);
        if (this.stateT >= 3) { this.setState('drift'); this.driftTime = 2.5; }
        break;
      case 'drift':
        if (canTarget) this.steerTo(P.dir, 2.5, dt);
        speed = arc > 9 ? 5.0 + this.stage * 0.5 : (arc < 6 ? -3 : 0);
        this.alt += (hover - this.alt) * damp(2, dt);
        if (canTarget && arc > 24 && this.stateT > 0.8) { this.setState('sink'); game.audio.sfx('summon', 0.7); break; }
        if (this.stateT > this.driftTime && canTarget) this.nextAttack();
        break;
      case 'sink':
        this.alt -= 15 * dt;
        if (Math.random() < 0.8) this.groundSmoke(2);
        if (this.alt <= -7) {
          if (P) {
            this.dir.copy(P.dir);
            _b1.copy(P.fwd);
            Sphere.rotateAround(_b1, P.dir, rand(-1.0, 1.0));
            Sphere.slide(this.dir, _b1.multiplyScalar(rand(9, 12)), this.R);
            Sphere.anyTangent(this.dir, this.fwd);
          }
          this.setState('resurface');
        }
        break;
      case 'resurface':
        this.alt = lerp(-7, hover, easeOutCubic(this.stateT / 1.3));
        if (Math.random() < 0.9) this.groundSmoke(3);
        if (canTarget) this.steerTo(P.dir, 6, dt);
        if (this.stateT >= 1.3) {
          game.audio.sfx('roar', 0.7);
          this.slamsLeft = this.stage >= 3 ? 2 : 1;
          this.setState('windup');
        }
        break;
      case 'windup':
        if (canTarget) this.steerTo(P.dir, 4, dt);
        speed = arc > 1.0 ? 6.0 + this.stage * 0.6 : 0;
        this.alt += (12.5 - this.alt) * damp(4, dt);
        tele = 0.45 + 0.4 * Math.sin(this.stateT * 22);
        if (this.stateT > Math.max(0.75, 1.05 - this.stage * 0.06)) this.setState('drop');
        break;
      case 'drop':
        this.alt -= 60 * dt;
        tele = 1;
        if (this.alt <= 2.0) { this.alt = 2.0; this.impact(); this.setState('recover'); }
        break;
      case 'recover':
        this.alt += (hover - this.alt) * damp(1.6, dt);
        if (this.stateT > 1.1) {
          if (this.slamsLeft > 0) this.setState('windup');
          else { this.setState('drift'); this.driftTime = Math.max(1.6, 3.4 - this.stage * 0.4); }
        }
        break;
      case 'summon':
        this.alt += (hover - this.alt) * damp(2, dt);
        if (this.stateT > 0.7 && !this.summoned) { this.summoned = true; this.summon(); }
        if (this.stateT > 1.6) { this.setState('drift'); this.driftTime = Math.max(1.8, 3.4 - this.stage * 0.4); }
        break;
      case 'orbs':
        this.alt += (hover - this.alt) * damp(2, dt);
        tele = 0.3;
        if (this.stateT > 0.7 && !this.orbsFired) { this.orbsFired = true; this.orbBurst(); }
        if (this.stateT > 1.4) { this.orbsFired = false; this.setState('drift'); this.driftTime = 2.2; }
        break;
      case 'stagger':
        this.alt += (2.4 - this.alt) * damp(3, dt);
        if (canTarget && arc < 5) { this.steerTo(P.dir, 3, dt); speed = -2.5; }
        if (this.stateT > 2.2) this.setState(final ? 'drift' : 'exposed');
        break;
      case 'exposed':
        this.alt += (2.4 + Math.sin(this.t * 2) * 0.2 - this.alt) * damp(3, dt);
        if (canTarget) { this.steerTo(P.dir, 2, dt); speed = arc > 4 ? 2.2 : 0; }
        if (this.exposedT <= 0) { this.setState('drift'); this.driftTime = 1.5; game.audio.sfx('summon', 0.8); }
        break;
      case 'dying':
        this.alt += (9 - this.alt) * damp(1.5, dt);
        if (P) { this.steerTo(P.dir, 4, dt); speed = arc > 12 ? 22 : 0; }
        break;
    }

    _b2.copy(this.fwd).multiplyScalar(speed * game.diff.enemySpeed * dt);
    Sphere.slide(this.dir, _b2, this.R + Math.max(0, this.alt), this.fwd);
    this.fwd.normalize();

    if (canTarget && this.alt > 0 && this.state !== 'emerge' && this.state !== 'resurface' && this.state !== 'dying') {
      if (this.position.distanceTo(P.position) < 3.3) P.hurt(25, this.position, 20);
    }

    this.teleMat.opacity = tele;
    this.updateTransform();
    this.animate(dt);
    if (this.flashT > 0) this.flashT -= dt;
    const f = this.flashT > 0;
    if (f !== this.flashing) {
      this.flashing = f;
      for (const ft of this.flashTargets) ft.mesh.material = f ? L.A.flashMat : ft.base;
    }
  }

  nextAttack() {
    let pattern;
    if (this.stage < 1) pattern = ['slam', 'slam', 'summon'];
    else if (this.stage < 3) pattern = ['slam', 'orbs', 'summon', 'double'];
    else pattern = ['double', 'orbs', 'summon', 'double', 'orbs'];
    let a = pattern[this.attackIdx++ % pattern.length];
    if (a === 'summon' && this.level.aliveEnemies() >= 6) a = 'orbs';
    if (a === 'summon') {
      this.summoned = false;
      this.setState('summon');
      this.level.game.audio.sfx('summon');
    } else if (a === 'orbs') {
      this.setState('orbs');
      this.level.game.audio.sfx('charge', 0.8);
    } else {
      this.slamsLeft = a === 'double' ? 2 : 1;
      this.setState('windup');
    }
  }

  impact() {
    const L = this.level, P = L.player, game = L.game;
    this.slamsLeft = Math.max(0, this.slamsLeft - 1);
    L.spawnShockwave(this.dir, { dmg: 18 });
    const dist = P ? P.position.distanceTo(this.position) : 40;
    game.audio.sfx('slam', clamp(1.2 - dist / 50, 0.3, 1));
    game.shake(clamp(1.1 - dist / 40, 0.25, 1));
    this.groundSmoke(30);
    _b3.copy(this.dir).multiplyScalar(this.R + 0.5);
    L.fx.burst(_b3, 40, 9, 1.4, 0.3, 1.6, 0.5, 0.8, { drag: 2.5 });
    if (P && P.canBeTargeted() && Sphere.angle(this.dir, P.dir) * this.R < 4.4 && P.alt < 3) P.hurt(28, this.position, 22);
  }

  orbBurst() {
    const L = this.level;
    const n = this.stage >= 3 ? 12 : 9;
    for (let i = 0; i < n; i++) {
      _b1.copy(this.fwd);
      Sphere.rotateAround(_b1, this.dir, (i / n) * TAU);
      L.spawnProjectile({ kind: 'orb', dir: this.dir, fwd: _b1, speed: 8.5, alt: 1.0, dmg: 15, life: 5 });
    }
    L.game.audio.sfx('shoot', 1);
  }

  summon() {
    const L = this.level;
    const n = 2 + Math.min(2, Math.floor(this.stage / 2));
    const types = ['wisp', 'spitter', 'stalker'];
    for (let i = 0; i < n; i++) {
      _b1.copy(this.fwd);
      Sphere.rotateAround(_b1, this.dir, (i / n) * TAU + 0.5);
      _b2.copy(this.dir);
      Sphere.slide(_b2, _b1.multiplyScalar(4.5), this.R);
      L.spawnEnemy(this.stage >= 2 ? types[i % 3] : 'wisp', _b2.clone());
    }
  }

  animate(dt) {
    const t = this.t;
    this.spikes.rotation.y += dt * 0.35;
    this.spikes.rotation.x = Math.sin(t * 0.4) * 0.2;
    this.ring1.rotation.z += dt * 0.8;
    this.ring2.rotation.z -= dt * 0.55;
    let shake = 0;
    if (this.state === 'stagger') shake = 0.35 * (1 - this.stateT / 2.2);
    if (this.state === 'dying') shake = 0.2 + this.stateT * 0.25;
    this.inner.position.set((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    const breathe = 1 + Math.sin(t * 2.2) * 0.04 + (this.state === 'dying' ? this.stateT * 0.08 : 0);
    this.inner.scale.setScalar(breathe);
    let eyeK = 1;
    if (this.state === 'windup' || this.state === 'summon' || this.state === 'orbs') eyeK = 1.6 + Math.sin(t * 30) * 0.3;
    if (this.state === 'stagger' || this.state === 'exposed') eyeK = Math.random() < 0.5 ? 0.3 : 1.6;
    if (this.state === 'dying') eyeK = 2.5;
    this.eyeMat.color.setRGB(3.0 * eyeK, 0.45 * eyeK, 2.5 * eyeK);
    this.aura.material.opacity = 0.5 + Math.sin(t * 3) * 0.1 + (eyeK > 1.2 ? 0.2 : 0);
    const sh = this.shielded() && this.state !== 'dying';
    this.shield.visible = sh;
    if (sh) {
      this.shieldHitT = Math.max(0, this.shieldHitT - dt);
      this.shieldMat.uniforms.opacity.value = 0.55 + Math.sin(t * 4) * 0.1 + this.shieldHitT * 3;
      this.shield.rotation.y += dt * 0.3;
    }
    for (const td of this.tendrils) {
      td.segs.forEach((m, j) => {
        const sway = Math.sin(t * 2 + td.a * 3 + j * 0.6) * 0.25 * j;
        const r = 1.6 + j * 0.15;
        m.position.set(Math.cos(td.a) * r + sway, -1.6 - j * 0.75, Math.sin(td.a) * r + Math.cos(t * 1.7 + j) * 0.2 * j);
      });
    }
    this.emitSmoke(dt, 22, 2.6);
  }

  updateTransform() {
    super.updateTransform();
    this.tele.position.y = -this.alt + 0.13;
    this.tele.visible = this.alt > 0;
    const k = clamp((this.alt - 2) / 12, 0, 1);
    this.decal.scale.setScalar(1.15 - k * 0.45);
  }
}

function makeBoss(key, level, dir) {
  switch (key) {
    case 'thornmaw': return new Thornmaw(level, dir);
    case 'warden': return new RimeWarden(level, dir);
    case 'colossus': return new CinderColossus(level, dir);
    default: return new Hush(level, dir);
  }
}
