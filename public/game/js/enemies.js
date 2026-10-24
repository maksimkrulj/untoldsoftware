'use strict';
/* Shadows, the Hush's servants: wisps, stalkers (lunge), spitters (ranged) and brutes (ground slam). */

const _n1 = new THREE.Vector3(), _n2 = new THREE.Vector3();

const ENEMY_TYPES = {
  wisp: { hp: 22, dmg: 16, speed: 4.6, detect: 13, radius: 0.8, scale: 1, eye: 'eyeViolet', glow: 'eyeGlowViolet', fx: [1.4, 0.45, 1.6] },
  stalker: { hp: 40, dmg: 22, speed: 5.4, detect: 18, radius: 0.7, scale: 0.9, eye: 'eyeRed', glow: 'eyeGlowRed', fx: [1.8, 0.35, 0.25] },
  spitter: { hp: 30, dmg: 14, speed: 3.8, detect: 17, radius: 0.75, scale: 0.85, eye: 'eyeTeal', glow: 'eyeGlowTeal', fx: [0.3, 1.8, 1.3] },
  brute: { hp: 110, dmg: 28, speed: 3.0, detect: 15, radius: 1.3, scale: 1.65, eye: 'eyeOrange', glow: 'eyeGlowOrange', fx: [2.0, 0.8, 0.2] }
};

class Shadow {
  constructor(level, dir, type, A, instant) {
    this.level = level;
    this.type = type;
    this.def = ENEMY_TYPES[type] || ENEMY_TYPES.wisp;
    this.stalker = type === 'stalker';
    this.dir = dir.clone();
    this.fwd = Sphere.anyTangent(this.dir, new THREE.Vector3());
    Sphere.rotateAround(this.fwd, this.dir, Math.random() * TAU);
    this.knock = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.group = new THREE.Group();
    this.inner = new THREE.Group();
    this.group.add(this.inner);
    const d = this.def;
    this.bodyMeshes = [];

    this.core = new THREE.Mesh(A.shadowCore, A.shadowMat);
    this.inner.add(this.core);
    this.bodyMeshes.push(this.core);
    this.blobs = [];
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(A.shadowBlob, A.shadowMat);
      b.userData = { a: Math.random() * TAU, s: rand(1.2, 2.4) * (Math.random() < 0.5 ? -1 : 1), r: rand(0.42, 0.62), y: rand(-0.3, 0.35), k: rand(0.6, 1.1) };
      b.scale.setScalar(b.userData.k);
      this.inner.add(b);
      this.blobs.push(b);
      this.bodyMeshes.push(b);
    }
    if (type === 'stalker' || type === 'brute') {
      const n = type === 'brute' ? 5 : 7;
      for (let i = 0; i < n; i++) {
        const s = new THREE.Mesh(A.spikeGeo, A.shadowMat);
        const a = (i / n) * TAU;
        const v = type === 'brute'
          ? new THREE.Vector3(Math.cos(a) * 0.6, 0.9, Math.sin(a) * 0.5 - 0.35).normalize()
          : new THREE.Vector3(Math.cos(a), 0.35 + (i % 2) * 0.4, Math.sin(a) * 0.8 - 0.3).normalize();
        s.quaternion.setFromUnitVectors(AXIS_Y, v);
        s.position.copy(v).multiplyScalar(0.45);
        this.inner.add(s);
        this.bodyMeshes.push(s);
      }
    }
    if (type === 'brute') {
      for (const sx of [-1, 1]) {
        const h = new THREE.Mesh(A.hornGeo, A.shadowMat);
        h.position.set(0.32 * sx, 0.45, 0.25);
        h.rotation.set(0.5, 0, -sx * 0.6);
        this.inner.add(h);
        this.bodyMeshes.push(h);
      }
    }
    if (type === 'spitter') {
      const mouth = new THREE.Mesh(A.spitMouthGeo, A[d.eye]);
      mouth.position.set(0, -0.12, 0.6);
      this.inner.add(mouth);
      this.mouth = mouth;
    }
    this.eyes = [];
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(A.eyeGeo, A[d.eye]);
      e.position.set(0.24 * sx, 0.14, type === 'stalker' ? 0.55 : 0.64);
      e.rotation.z = sx * 0.4;
      e.scale.set(1.25, 0.6, 0.6);
      this.inner.add(e);
      this.eyes.push(e);
    }
    this.eyeGlow = new THREE.Sprite(A[d.glow]);
    this.eyeGlow.position.set(0, 0.14, 0.7);
    this.eyeGlow.scale.setScalar(1.1);
    this.inner.add(this.eyeGlow);

    this.decal = new THREE.Mesh(A.decalGeo, A.decalMat);
    this.group.add(this.decal);

    this.radius = d.radius;
    this.maxHp = Math.round(d.hp * level.game.diff.hp);
    this.hp = this.maxHp;
    this.state = instant ? 'wander' : 'spawn';
    this.spawnT = instant ? 1 : 0;
    this.t = Math.random() * 10;
    this.stateT = 0;
    this.alt = 1.0;
    this.baseAlt = type === 'spitter' ? 1.6 : (type === 'brute' ? 1.5 : 0.95);
    this.phase = Math.random() * TAU;
    this.wanderTurn = 0;
    this.lungeCd = rand(1.5, 3);
    this.shootT = rand(1.5, 3);
    this.alive = true;
    this.smokeAcc = 0;
    this.flashT = 0;
    this.flashing = false;
    this.burnT = 0;
    this.A = A;
    this.updateTransform(level.heightAt(this.dir));
  }

  setState(s) {
    this.state = s;
    this.stateT = 0;
    if (s === 'windup') this.marker = false;
  }

  takeHit(dmg, fromPos, opts) {
    if (!this.alive) return 0;
    opts = opts || {};
    this.hp -= dmg;
    this.flashT = 0.12;
    if (opts.burn) this.burnT = 3;
    if (fromPos && opts.knock) {
      _n1.subVectors(this.position, fromPos);
      _n1.addScaledVector(this.dir, -this.dir.dot(_n1));
      if (_n1.lengthSq() > 1e-6) this.knock.copy(_n1.normalize()).multiplyScalar(opts.knock * (this.type === 'brute' ? 0.35 : 1));
    }
    if (this.type !== 'brute' || opts.crit) {
      if (this.state !== 'spawn') this.setState('stunned');
      this.stunTime = this.type === 'brute' ? 0.35 : 0.45;
    }
    const c = this.def.fx;
    this.level.fx.burst(this.position, 8, 5, c[0], c[1], c[2], 0.3, 0.4, { drag: 3 });
    if (this.hp <= 0) this.level.killEnemy(this);
    return dmg;
  }

  update(dt) {
    const L = this.level, P = L.player, d = this.def;
    this.t += dt;
    this.stateT += dt;
    tickBurn(this, dt);
    if (!this.alive) return;
    const R = L.heightAt(this.dir);
    const canTarget = P && P.canBeTargeted();
    const arc = P ? Sphere.angle(this.dir, P.dir) * R : 999;
    const detect = d.detect * (P && P.light01 < 0.3 ? 0.85 : 1);
    let speed = 0;

    switch (this.state) {
      case 'spawn':
        this.spawnT = Math.min(1, this.spawnT + dt / 1.2);
        if (this.spawnT >= 1) this.setState('wander');
        break;
      case 'wander':
        this.wanderTurn = clamp(this.wanderTurn + (Math.random() - 0.5) * dt * 6, -1.2, 1.2);
        Sphere.rotateAround(this.fwd, this.dir, this.wanderTurn * dt);
        speed = 2.2;
        if (canTarget && arc < detect) this.setState('chase');
        break;
      case 'chase':
        if (!canTarget || arc > detect * 1.8) { this.setState('wander'); break; }
        this.steerTo(P.dir, this.type === 'stalker' ? 4 : 3, dt);
        speed = d.speed;
        if (this.type === 'stalker') {
          this.lungeCd -= dt;
          if (this.lungeCd <= 0 && arc < 8 && arc > 2.5) this.setState('windup');
        } else if (this.type === 'spitter') {
          if (arc < 7) speed = -d.speed * 0.8;
          else if (arc < 11) speed = 0;
          this.shootT -= dt;
          if (this.shootT <= 0 && arc < 18) this.setState('aim');
        } else if (this.type === 'brute') {
          if (arc < 3.2) this.setState('windup');
        }
        break;
      case 'windup':
        if (canTarget) this.steerTo(P.dir, 8, dt);
        speed = 0.4;
        if (this.type === 'brute') {
          if (!this.marker) {
            this.marker = true;
            L.addMarker(this.dir, 3.3, 0.8, 'danger', null);
          }
          if (this.stateT > 0.8) this.bruteSlam();
        } else if (this.stateT > 0.5) this.setState('lunge');
        break;
      case 'lunge':
        speed = 16;
        if (this.stateT > 0.3) { this.lungeCd = rand(2.2, 3.6); this.setState('chase'); }
        break;
      case 'aim':
        if (canTarget) this.steerTo(P.dir, 6, dt);
        if (this.stateT > 0.45) {
          if (canTarget) this.spit();
          this.shootT = rand(2.2, 3.0);
          this.setState('chase');
        }
        break;
      case 'recover':
        if (this.stateT > 1.0) this.setState('chase');
        break;
      case 'stunned':
        if (this.stateT > (this.stunTime || 0.45)) this.setState(canTarget ? 'chase' : 'wander');
        break;
    }
    speed *= L.game.diff.enemySpeed;

    _n2.copy(this.fwd).multiplyScalar(speed * dt).addScaledVector(this.knock, dt);
    Sphere.slide(this.dir, _n2, R + this.alt, this.fwd, this.knock);
    this.fwd.normalize();
    this.knock.multiplyScalar(Math.exp(-5 * dt));

    if (canTarget && this.state !== 'spawn' && this.state !== 'stunned') {
      if (this.position.distanceTo(P.position) < this.radius + 0.55) {
        if (P.hurt(d.dmg, this.position)) {
          this.setState('stunned');
          this.stunTime = 0.8;
          _n1.subVectors(this.position, P.position);
          _n1.addScaledVector(this.dir, -this.dir.dot(_n1));
          if (_n1.lengthSq() > 1e-6) this.knock.copy(_n1.normalize()).multiplyScalar(9);
        }
      }
    }

    const lift = this.state === 'windup' && this.type === 'brute' ? this.stateT * 2.2 : 0;
    this.alt = this.baseAlt + Math.sin(this.t * 2.3 + this.phase) * 0.18 + lift;
    this.updateTransform(R);
    this.animate(dt);
  }

  bruteSlam() {
    const L = this.level, P = L.player;
    this.setState('recover');
    _n1.copy(this.dir).multiplyScalar(L.heightAt(this.dir) + 0.3);
    L.fx.burst(_n1, 26, 7, 2.0, 0.8, 0.2, 0.45, 0.6, { drag: 3 });
    L.smoke.burst(_n1, 14, 5, 0.05, 0.03, 0.06, 1.2, 0.9, { drag: 3, grow: 2, alpha: 0.6 });
    const dist = P ? P.position.distanceTo(this.position) : 40;
    L.game.audio.sfx('slam', clamp(0.7 - dist / 50, 0.1, 0.7));
    if (dist < 12) L.game.shake(0.3);
    if (P && P.canBeTargeted() && L.arc(this.dir, P.dir) < 3.3 && P.alt < 1.2) P.hurt(this.def.dmg, this.position, 18);
  }

  spit() {
    const L = this.level;
    _n1.copy(this.fwd);
    L.spawnProjectile({ kind: 'spit', dir: this.dir, fwd: _n1, speed: 11, alt: 0.9, dmg: this.def.dmg, life: 2.6, homing: 0.6 });
    L.game.audio.sfx('shoot', clamp(1 - L.arc(this.dir, L.player.dir) / 30, 0.2, 0.8));
  }

  steerTo(targetDir, rate, dt) {
    Sphere.tangentToward(this.dir, targetDir, _n1);
    if (_n1.lengthSq() > 0) this.fwd.lerp(_n1, damp(rate, dt)).normalize();
    if (this.fwd.lengthSq() < 0.5) Sphere.anyTangent(this.dir, this.fwd);
  }

  updateTransform(R) {
    this.position.copy(this.dir).multiplyScalar(R + this.alt);
    this.group.position.copy(this.position);
    Sphere.orient(this.group, this.dir, this.fwd);
    this.decal.position.y = -this.alt + 0.06;
  }

  animate(dt) {
    const t = this.t;
    let s = easeOutCubic(this.spawnT) * this.def.scale;
    if (this.state === 'windup' || this.state === 'aim') s *= 1 + Math.sin(this.stateT * 40) * 0.08;
    this.inner.scale.setScalar(Math.max(0.001, s));
    this.inner.position.y = (1 - this.spawnT) * -1.2;
    this.decal.scale.setScalar(Math.max(0.001, s));
    for (const b of this.blobs) {
      const u = b.userData;
      const a = u.a + t * u.s;
      b.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * 2.1 + u.a) * 0.1, Math.sin(a) * u.r);
    }
    const stunned = this.state === 'stunned';
    const eyeOn = !stunned || Math.floor(this.stateT * 10) % 2 === 0;
    for (const e of this.eyes) e.visible = eyeOn;
    this.eyeGlow.visible = eyeOn;
    this.eyeGlow.scale.setScalar(this.state === 'windup' || this.state === 'aim' ? 2.4 : 1.1);

    // white flash when struck
    if (this.flashT > 0) this.flashT -= dt;
    const flash = this.flashT > 0;
    if (flash !== this.flashing) {
      this.flashing = flash;
      const m = flash ? this.A.flashMat : this.A.shadowMat;
      for (const b of this.bodyMeshes) b.material = m;
    }

    const L = this.level;
    this.smokeAcc += dt * 9 * L.game.quality.fx;
    while (this.smokeAcc >= 1) {
      this.smokeAcc -= 1;
      const p = this.position;
      L.smoke.spawn(p.x + (Math.random() - 0.5) * 0.8, p.y + (Math.random() - 0.5) * 0.8, p.z + (Math.random() - 0.5) * 0.8,
        this.dir.x * 0.5, this.dir.y * 0.5, this.dir.z * 0.5, 0.04, 0.015, 0.07, rand(0.6, 1.0) * this.def.scale, rand(0.7, 1.1), 1.5, 0, 1.9, 0.55);
    }
  }

  kill() {
    this.alive = false;
    const L = this.level, p = this.position;
    const c = this.def.fx;
    L.fx.burst(p, 26, 7, c[0], c[1], c[2], 0.4, 0.7, { drag: 2.5 });
    L.fx.burst(p, 10, 3, 1.8, 1.6, 1.4, 0.3, 0.5, { drag: 2 });
    L.smoke.burst(p, 16, 4, 0.04, 0.02, 0.06, 1.0, 0.9, { drag: 3, grow: 2, alpha: 0.6 });
    const P = L.player;
    if (P) {
      for (let i = 0; i < 6; i++) {
        _n1.subVectors(P.position, p).multiplyScalar(1.8);
        L.fx.spawn(p.x, p.y, p.z, _n1.x + (Math.random() - 0.5) * 3, _n1.y + (Math.random() - 0.5) * 3, _n1.z + (Math.random() - 0.5) * 3,
          1.8, 1.5, 0.7, 0.25, 0.55, 0.5, 0, 0.3);
      }
    }
  }
}
