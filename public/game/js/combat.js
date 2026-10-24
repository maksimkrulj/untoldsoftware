'use strict';
/* Combat & loot: the Sunblade, hit effects, enemy projectiles, ground telegraphs, pickups and breakables. */

const _c1 = new THREE.Vector3(), _c2 = new THREE.Vector3(), _c3 = new THREE.Vector3();

/* ---------------- item & power-up definitions ---------------- */
const ITEM_DEFS = {
  haste: { color: '#4fd2ff', glow: [0.3, 1.2, 1.8], label: 'Haste', desc: 'Swift as a comet', dur: 10, power: true },
  fury: { color: '#ff4a3a', glow: [1.8, 0.3, 0.2], label: 'Fury', desc: 'Double damage', dur: 10, power: true },
  aegis: { color: '#ffd24a', glow: [1.8, 1.4, 0.3], label: 'Aegis', desc: 'Nothing can touch you', dur: 6, power: true },
  radiance: { color: '#fff3c4', glow: [1.8, 1.7, 1.2], label: 'Radiance', desc: 'Your light refills', dur: 12, power: true },
  magnet: { color: '#c77dff', glow: [1.3, 0.5, 1.8], label: 'Magnet', desc: 'Pickups fly to you', dur: 15, power: true },
  flask: { color: '#ff9b3d', glow: [1.8, 0.8, 0.25], label: 'Ember Flask', desc: 'Press 1 to restore light' },
  bomb: { color: '#9ad7ff', glow: [0.8, 1.3, 1.8], label: 'Nova Bomb', desc: 'Press 2 to blast everything nearby' },
  core: { color: '#ff6a1a', glow: [2.0, 0.6, 0.1], label: 'Magma Core', desc: 'Old Kiln wants these' },
  orb: { color: '#ffe9a8', glow: [1.8, 1.5, 0.8], label: 'Light', desc: '' }
};
const POWER_KINDS = ['haste', 'fury', 'aegis', 'radiance', 'magnet'];
const MAX_ITEMS = 3;

const IconCache = { canvas: {}, tex: {}, url: {} };

function iconCanvas(kind) {
  if (IconCache.canvas[kind]) return IconCache.canvas[kind];
  const def = ITEM_DEFS[kind];
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.translate(64, 64);
  const grd = g.createRadialGradient(0, 0, 8, 0, 0, 58);
  grd.addColorStop(0, 'rgba(40,20,34,0.95)');
  grd.addColorStop(1, 'rgba(14,6,18,0.85)');
  g.beginPath(); g.arc(0, 0, 56, 0, TAU); g.fillStyle = grd; g.fill();
  g.lineWidth = 6; g.strokeStyle = def.color; g.stroke();
  g.fillStyle = def.color; g.strokeStyle = def.color;
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.shadowColor = def.color; g.shadowBlur = 12;
  switch (kind) {
    case 'haste':
      g.beginPath(); g.moveTo(10, -38); g.lineTo(-22, 6); g.lineTo(-2, 6); g.lineTo(-10, 38); g.lineTo(24, -8); g.lineTo(4, -8); g.closePath(); g.fill();
      break;
    case 'fury':
      g.save(); g.rotate(-Math.PI / 4);
      g.beginPath(); g.moveTo(0, -42); g.lineTo(7, -30); g.lineTo(7, 12); g.lineTo(-7, 12); g.lineTo(-7, -30); g.closePath(); g.fill();
      g.fillRect(-17, 12, 34, 7); g.fillRect(-4, 19, 8, 16);
      g.restore();
      break;
    case 'aegis':
      g.beginPath(); g.moveTo(0, -38); g.lineTo(31, -26); g.quadraticCurveTo(29, 18, 0, 40); g.quadraticCurveTo(-29, 18, -31, -26); g.closePath(); g.fill();
      g.fillStyle = 'rgba(30,14,10,0.6)'; g.beginPath(); g.moveTo(0, -24); g.lineTo(18, -16); g.quadraticCurveTo(16, 12, 0, 26); g.closePath(); g.fill();
      break;
    case 'radiance':
      g.beginPath(); g.arc(0, 0, 15, 0, TAU); g.fill();
      g.lineWidth = 7;
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * TAU;
        g.beginPath(); g.moveTo(Math.cos(a) * 24, Math.sin(a) * 24); g.lineTo(Math.cos(a) * 37, Math.sin(a) * 37); g.stroke();
      }
      break;
    case 'magnet':
      g.lineWidth = 15;
      g.beginPath(); g.arc(0, 4, 20, 0, Math.PI); g.stroke();
      g.beginPath(); g.moveTo(-20, 4); g.lineTo(-20, -24); g.moveTo(20, 4); g.lineTo(20, -24); g.stroke();
      g.fillStyle = '#ffffff'; g.fillRect(-28, -36, 16, 12); g.fillRect(12, -36, 16, 12);
      break;
    case 'flask':
      g.beginPath(); g.arc(0, 12, 24, 0, TAU); g.fill();
      g.fillRect(-9, -30, 18, 26);
      g.fillStyle = '#8a5a30'; g.fillRect(-11, -38, 22, 10);
      g.fillStyle = 'rgba(255,255,220,0.8)'; g.beginPath(); g.arc(-8, 6, 6, 0, TAU); g.fill();
      break;
    case 'bomb':
      g.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * TAU - Math.PI / 2, r = i % 2 ? 16 : 38;
        if (i === 0) g.moveTo(Math.cos(a) * r, Math.sin(a) * r); else g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      g.closePath(); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.fill();
      break;
    case 'core':
      g.beginPath(); g.moveTo(0, -38); g.lineTo(28, -6); g.lineTo(14, 34); g.lineTo(-14, 34); g.lineTo(-28, -6); g.closePath(); g.fill();
      g.fillStyle = '#ffe2a0'; g.beginPath(); g.moveTo(0, -20); g.lineTo(12, -4); g.lineTo(0, 18); g.lineTo(-12, -4); g.closePath(); g.fill();
      break;
    case 'orb':
      g.beginPath(); g.arc(0, 0, 24, 0, TAU); g.fill();
      break;
  }
  IconCache.canvas[kind] = c;
  return c;
}

function iconTexture(kind) {
  if (!IconCache.tex[kind]) {
    const t = new THREE.CanvasTexture(iconCanvas(kind));
    t.userData.keep = true;
    IconCache.tex[kind] = t;
  }
  return IconCache.tex[kind];
}

function iconURL(kind) {
  if (!IconCache.url[kind]) IconCache.url[kind] = iconCanvas(kind).toDataURL();
  return IconCache.url[kind];
}

// A floating "!" / "?" / "…" marker texture for NPCs.
const MarkCache = {};
function markTexture(ch) {
  if (MarkCache[ch]) return MarkCache[ch];
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.font = '900 104px Georgia, serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowColor = ch === '…' ? '#999' : '#ffb000';
  g.shadowBlur = 18;
  g.fillStyle = ch === '…' ? '#cfcfcf' : '#ffe27a';
  g.fillText(ch, 64, 68);
  g.lineWidth = 4;
  g.strokeStyle = 'rgba(60,30,0,0.8)';
  g.strokeText(ch, 64, 68);
  const t = new THREE.CanvasTexture(c);
  t.userData.keep = true;
  MarkCache[ch] = t;
  return t;
}

/* ---------------- the Sunblade ---------------- */
const BLADE_COLORS = [
  null,
  new THREE.Color(2.0, 1.55, 0.6),
  new THREE.Color(2.4, 0.95, 0.25),
  new THREE.Color(1.9, 2.1, 2.6)
];
const BLADE_DAMAGE = [0, 10, 13, 16];

class Sunblade {
  constructor(player) {
    this.player = player;
    this.pivot = new THREE.Group();
    this.holder = new THREE.Group();
    this.pivot.add(this.holder);
    player.group.add(this.pivot);

    const bladeGeo = new THREE.OctahedronGeometry(0.5, 0);
    bladeGeo.scale(0.17, 1.9, 0.05);
    bladeGeo.translate(0, 1.05, 0);
    this.bladeMat = new THREE.MeshBasicMaterial({ color: BLADE_COLORS[1].clone() });
    this.blade = new THREE.Mesh(bladeGeo, this.bladeMat);
    const guard = new THREE.BoxGeometry(0.46, 0.07, 0.1); guard.translate(0, 0.1, 0);
    const grip = new THREE.CylinderGeometry(0.045, 0.045, 0.32, 6); grip.translate(0, -0.1, 0);
    const pommel = new THREE.IcosahedronGeometry(0.07, 0); pommel.translate(0, -0.3, 0);
    this.hiltMat = new THREE.MeshStandardMaterial({ color: 0x8a6230, metalness: 0.6, roughness: 0.35, emissive: 0x3a1a00, flatShading: true });
    this.hilt = new THREE.Mesh(mergeGeos([guard, grip, pommel]), this.hiltMat);
    this.holder.add(this.blade, this.hilt);
    this.glow = makeGlow(new THREE.Color(1.0, 0.6, 0.2), 1.5, 0.45);
    this.glow.position.y = 1.0;
    this.holder.add(this.glow);

    this.arcGeo = new THREE.RingGeometry(1.6, 2.9, 40, 1, -Math.PI / 2 - 1.35, 2.7);
    this.arcGeo.rotateX(-Math.PI / 2);
    this.spinGeo = new THREE.RingGeometry(2.2, 3.6, 64);
    this.spinGeo.rotateX(-Math.PI / 2);
    this.arcMat = new THREE.MeshBasicMaterial({ color: BLADE_COLORS[1].clone(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    this.arc = new THREE.Mesh(this.arcGeo, this.arcMat);
    this.arc.position.y = 0.05;
    this.arc.visible = false;
    player.group.add(this.arc);
    this.arcT = 0;
    this.arcDur = 0.2;

    this.angle = -1.25; this.tilt = 0.3; this.radius = 0.8; this.height = 0.5;
    this.tip = new THREE.Vector3();
    this.setLevel(0);
  }

  setLevel(lv) {
    this.level = lv;
    this.pivot.visible = lv > 0;
    if (lv > 0) {
      this.bladeMat.color.copy(BLADE_COLORS[lv]);
      this.arcMat.color.copy(BLADE_COLORS[lv]).multiplyScalar(0.28);
      this.glow.material.color.copy(BLADE_COLORS[lv]).multiplyScalar(0.45);
    }
  }

  showArc(spin, mirror, big) {
    this.arc.geometry = spin ? this.spinGeo : this.arcGeo;
    const s = big ? 1.15 : 1;
    this.arc.scale.set(mirror ? -s : s, 1, s);
    this.arc.visible = true;
    this.arcDur = spin ? 0.3 : 0.18;
    this.arcT = this.arcDur;
  }

  setPose(angle, tilt, radius, height, snap, dt) {
    const k = snap ? 1 : damp(14, dt);
    this.angle += (angle - this.angle) * k;
    this.tilt += (tilt - this.tilt) * k;
    this.radius += (radius - this.radius) * k;
    this.height += (height - this.height) * k;
    this.pivot.rotation.y = this.angle;
    this.holder.position.set(0, this.height, this.radius);
    this.holder.rotation.set(this.tilt, 0, 0);
  }

  update(dt, fury) {
    if (this.arcT > 0) {
      this.arcT -= dt;
      this.arcMat.opacity = 0.75 * Math.pow(Math.max(0, this.arcT / this.arcDur), 1.5);
      if (this.arcT <= 0) this.arc.visible = false;
    }
    if (this.level > 0) {
      const c = fury ? 1.4 + Math.sin(this.player.t * 20) * 0.3 : 1;
      this.bladeMat.color.copy(BLADE_COLORS[this.level]).multiplyScalar(c);
      if (fury) this.bladeMat.color.g *= 0.55;
    }
  }

  tipWorld() {
    this.player.group.updateMatrixWorld(true);
    return this.blade.localToWorld(this.tip.set(0, 1.9, 0));
  }
}

/* ---------------- expanding ring + bubble (pulse, nova, flame wave, slam) ---------------- */
class BurstFX {
  constructor(level, color, radius, dur) {
    this.level = level;
    this.radius = radius;
    this.dur = dur;
    this.t = 1;
    this.ringMat = makeSurfRingMaterial(color.clone());
    this.ring = new THREE.Mesh(level.A.waveGeo, this.ringMat);
    this.ring.frustumCulled = false;
    this.ring.visible = false;
    this.bubbleMat = new THREE.ShaderMaterial({
      uniforms: { color: { value: color.clone() }, opacity: { value: 0 } },
      vertexShader: BUBBLE_VS, fragmentShader: BUBBLE_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    this.bubble = new THREE.Mesh(level.A.bubbleGeo, this.bubbleMat);
    this.bubble.visible = false;
    level.scene.add(this.ring, this.bubble);
  }

  fire(pos, dir, groundR) {
    this.t = 0;
    this.ring.quaternion.setFromUnitVectors(AXIS_Y, dir);
    this.ringMat.uniforms.rad.value = groundR - 0.25;
    this.ringMat.uniforms.height.value = 1.7;
    this.ring.visible = true;
    this.bubble.visible = true;
    this.bubble.position.copy(pos);
  }

  update(dt) {
    if (this.t >= 1) return;
    this.t = Math.min(1, this.t + dt / this.dur);
    const k = easeOutCubic(this.t);
    const R = this.ringMat.uniforms.rad.value + 0.25;
    this.ringMat.uniforms.theta.value = Math.max(0.01, (this.radius * k) / R);
    this.ringMat.uniforms.opacity.value = 1 - this.t;
    this.bubble.scale.setScalar(0.5 + this.radius * k);
    this.bubbleMat.uniforms.opacity.value = (1 - this.t) * 0.7;
    if (this.t >= 1) { this.ring.visible = false; this.bubble.visible = false; }
  }
}

/* ---------------- ground telegraph: a ring that fills before something happens ---------------- */
const MARKER_COLORS = {
  danger: new THREE.Color(1.8, 0.2, 0.25),
  fire: new THREE.Color(2.0, 0.6, 0.1),
  ice: new THREE.Color(0.4, 1.3, 2.0),
  shadow: new THREE.Color(1.5, 0.2, 1.6)
};

class GroundMarker {
  constructor(level, dir, radius, time, color, onTrigger) {
    this.level = level;
    this.dir = dir.clone();
    this.radius = radius;
    this.time = time;
    this.t = 0;
    this.onTrigger = onTrigger;
    const col = MARKER_COLORS[color] || MARKER_COLORS.danger;
    this.object = new THREE.Group();
    Sphere.orient(this.object, this.dir, Sphere.anyTangent(this.dir, _c1));
    this.object.position.copy(this.dir).multiplyScalar(level.heightAt(this.dir) + 0.28);
    this.ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    this.fillMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    this.ring = new THREE.Mesh(level.A.markerRingGeo, this.ringMat);
    this.ring.scale.setScalar(radius);
    this.fill = new THREE.Mesh(level.A.markerDiscGeo, this.fillMat);
    this.fill.scale.setScalar(0.001);
    this.object.add(this.ring, this.fill);
  }

  update(dt) {
    this.t += dt;
    const k = clamp(this.t / this.time, 0, 1);
    this.fill.scale.setScalar(Math.max(0.001, k * this.radius));
    this.ringMat.opacity = 0.55 + 0.45 * Math.sin(this.t * 22);
    if (k >= 1) {
      if (this.onTrigger) this.onTrigger(this.dir);
      return true;
    }
    return false;
  }

  dispose() { this.ringMat.dispose(); this.fillMat.dispose(); }
}

/* ---------------- spikes bursting from the ground (ice / thorns) ---------------- */
class SpikeFX {
  constructor(level, dir, geo, mat, scale) {
    this.level = level;
    this.t = 0;
    this.object = new THREE.Group();
    Sphere.orient(this.object, dir, Sphere.anyTangent(dir, _c1));
    Sphere.rotateAround(_c1, dir, Math.random() * TAU);
    this.object.position.copy(dir).multiplyScalar(level.heightAt(dir) - 0.2);
    this.mesh = new THREE.Mesh(geo, mat);
    this.object.add(this.mesh);
    this.scale = scale || 1;
    this.mesh.scale.set(this.scale, 0.01, this.scale);
  }

  update(dt) {
    this.t += dt;
    let k;
    if (this.t < 0.12) k = this.t / 0.12;
    else if (this.t < 0.75) k = 1;
    else k = 1 - (this.t - 0.75) / 0.35;
    this.mesh.scale.set(this.scale, Math.max(0.01, k) * this.scale, this.scale);
    return this.t >= 1.1;
  }

  dispose() {}
}

/* ---------------- lingering lava pool ---------------- */
class LavaPool {
  constructor(level, dir, radius, life) {
    this.level = level;
    this.dir = dir.clone();
    this.radius = radius;
    this.life = life;
    this.t = 0;
    this.object = new THREE.Group();
    Sphere.orient(this.object, this.dir, Sphere.anyTangent(this.dir, _c1));
    this.object.position.copy(this.dir).multiplyScalar(level.heightAt(this.dir) + 0.18);
    this.mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.6, 0.08), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    const disc = new THREE.Mesh(level.A.markerDiscGeo, this.mat);
    disc.scale.setScalar(radius);
    this.object.add(disc);
  }

  update(dt) {
    this.t += dt;
    const L = this.level, P = L.player;
    const fade = 1 - smooth01((this.t - this.life + 0.8) / 0.8);
    this.mat.opacity = (0.55 + 0.25 * Math.sin(this.t * 8)) * fade;
    if (Math.random() < 0.35 * L.game.quality.fx) {
      Sphere.anyTangent(this.dir, _c2);
      Sphere.rotateAround(_c2, this.dir, Math.random() * TAU);
      _c3.copy(this.object.position).addScaledVector(_c2, Math.random() * this.radius);
      L.fx.spawn(_c3.x, _c3.y, _c3.z, this.dir.x * 2, this.dir.y * 2, this.dir.z * 2, 2.2, 0.7, 0.1, 0.3, 0.6, 1, 0, 0.2);
    }
    if (P && P.canBeTargeted() && P.alt < 0.5 && L.arc(this.dir, P.dir) < this.radius) P.hurt(12, null);
    return this.t >= this.life;
  }

  dispose() { this.mat.dispose(); }
}

/* ---------------- enemy projectiles ---------------- */
const PROJ_COLORS = {
  orb: [1.4, 0.3, 1.8],
  spit: [0.3, 2.0, 1.4],
  shard: [0.5, 1.5, 2.2],
  fire: [2.4, 0.8, 0.15]
};

class Projectile {
  constructor(level, o) {
    this.level = level;
    this.kind = o.kind;
    this.dir = o.dir.clone();
    this.fwd = o.fwd.clone();
    this.speed = o.speed;
    this.alt = o.alt;
    this.dmg = o.dmg;
    this.life = o.life || 4;
    this.radius = o.radius || 0.45;
    this.homing = o.homing || 0;
    this.parryable = true;
    this.dead = false;
    this.position = new THREE.Vector3();
    const A = level.A;
    this.object = new THREE.Group();
    this.mesh = new THREE.Mesh(this.kind === 'shard' ? A.projShardGeo : A.projOrbGeo, A.projMat[this.kind]);
    this.object.add(this.mesh);
    this.glow = new THREE.Sprite(A.projGlowMat[this.kind]);
    this.glow.scale.setScalar(this.kind === 'shard' ? 1.6 : 2.2);
    this.object.add(this.glow);
    this.place();
  }

  place() {
    const R = this.level.heightAt(this.dir);
    this.position.copy(this.dir).multiplyScalar(R + this.alt);
    this.object.position.copy(this.position);
    Sphere.orient(this.object, this.dir, this.fwd);
  }

  update(dt) {
    const L = this.level, P = L.player;
    this.life -= dt;
    if (this.homing && P && P.canBeTargeted()) {
      Sphere.tangentToward(this.dir, P.dir, _c1);
      if (_c1.lengthSq() > 0) this.fwd.lerp(_c1, damp(this.homing, dt)).normalize();
    }
    _c2.copy(this.fwd).multiplyScalar(this.speed * dt);
    Sphere.slide(this.dir, _c2, L.R + this.alt, this.fwd);
    this.fwd.normalize();
    this.place();
    this.mesh.rotation.y += dt * 8;
    if (Math.random() < 0.6 * L.game.quality.fx) {
      const c = PROJ_COLORS[this.kind];
      L.fx.spawn(this.position.x, this.position.y, this.position.z, 0, 0, 0, c[0], c[1], c[2], 0.35, 0.35, 0, 0, 0.1);
    }
    if (P && P.canBeTargeted() && this.position.distanceTo(P.position) < this.radius + 0.5) {
      if (P.hurt(this.dmg, this.position, 9)) this.destroy(false);
      else if (P.buffs.aegis > 0) this.destroy(false);
    }
    if (this.life <= 0) this.destroy(false);
    return this.dead;
  }

  destroy(parried) {
    if (this.dead) return;
    this.dead = true;
    const c = PROJ_COLORS[this.kind], L = this.level;
    L.fx.burst(this.position, parried ? 18 : 10, parried ? 6 : 3, c[0], c[1], c[2], 0.3, 0.45, { drag: 3 });
    if (parried) {
      L.game.audio.sfx('parry');
      L.game.ui.floatText(this.position, 'PARRY', 'parry');
    }
  }
}

/* An arcing fireball that lands on a telegraphed spot. */
class Lob {
  constructor(level, fromPos, targetDir, flight, dmg, radius, pool) {
    this.level = level;
    this.dir = targetDir.clone();
    this.flight = flight;
    this.dmg = dmg;
    this.radius = radius;
    this.pool = pool;
    this.t = 0;
    this.start = fromPos.clone();
    this.target = targetDir.clone().multiplyScalar(level.heightAt(targetDir) + 0.4);
    this.position = this.start.clone();
    this.parryable = false;
    this.dead = false;
    level.addEffect(new GroundMarker(level, targetDir, radius, flight, 'fire'));
    const A = level.A;
    this.object = new THREE.Group();
    this.mesh = new THREE.Mesh(A.projOrbGeo, A.projMat.fire);
    this.mesh.scale.setScalar(1.5);
    this.object.add(this.mesh);
    const glow = new THREE.Sprite(A.projGlowMat.fire);
    glow.scale.setScalar(3.4);
    this.object.add(glow);
    this.object.position.copy(this.start);
  }

  update(dt) {
    const L = this.level;
    this.t += dt;
    const k = Math.min(1, this.t / this.flight);
    this.position.lerpVectors(this.start, this.target, k);
    _c1.copy(this.position).normalize();
    this.position.addScaledVector(_c1, Math.sin(Math.PI * k) * 9);
    this.object.position.copy(this.position);
    if (Math.random() < 0.9 * L.game.quality.fx) {
      L.fx.spawn(this.position.x, this.position.y, this.position.z, 0, 0, 0, 2.4, 0.8, 0.12, 0.6, 0.45, 0, 0, 0.2);
      L.smoke.spawn(this.position.x, this.position.y, this.position.z, 0, 0, 0, 0.08, 0.05, 0.04, 0.8, 0.8, 0, 0, 2, 0.4);
    }
    if (k >= 1) this.explode();
    return this.dead;
  }

  explode() {
    if (this.dead) return;
    this.dead = true;
    const L = this.level, P = L.player, game = L.game;
    L.fx.burst(this.target, 36, 9, 2.4, 0.8, 0.15, 0.5, 0.7, { drag: 2.5 });
    L.smoke.burst(this.target, 14, 4, 0.08, 0.04, 0.03, 1.4, 1.2, { drag: 2, grow: 2, alpha: 0.6 });
    const dist = P ? P.position.distanceTo(this.target) : 50;
    game.audio.sfx('explode', clamp(1 - dist / 40, 0.15, 1));
    if (dist < 14) game.shake(0.25);
    if (P && P.canBeTargeted() && L.arc(this.dir, P.dir) < this.radius && P.alt < 2.2) P.hurt(this.dmg, this.target, 14);
    if (this.pool) L.addEffect(new LavaPool(L, this.dir, this.radius * 0.8, 4));
  }

  destroy() { this.explode(); }
}

/* ---------------- pickups ---------------- */
class Pickup {
  constructor(level, kind, dir, opts) {
    opts = opts || {};
    this.level = level;
    this.kind = kind;
    this.def = ITEM_DEFS[kind];
    this.dir = dir.clone();
    this.collected = false;
    this.t = Math.random() * 10;
    this.life = opts.life || 0;
    this.amount = opts.amount || 0;
    this.respawnSpot = !!opts.spot;
    this.hop = opts.hop ? 6 : 0;
    this.hopAlt = opts.hop ? 0.4 : 0;
    this.slideV = new THREE.Vector3();
    if (opts.scatter) {
      Sphere.anyTangent(this.dir, this.slideV);
      Sphere.rotateAround(this.slideV, this.dir, Math.random() * TAU);
      this.slideV.multiplyScalar(rand(2, 5));
    }
    this.position = new THREE.Vector3();
    this.object = new THREE.Group();
    const small = kind === 'orb';
    this.icon = new THREE.Sprite(level.iconMaterial(kind));
    this.icon.scale.setScalar(small ? 0.7 : (this.def.power ? 1.35 : 1.15));
    this.object.add(this.icon);
    this.glow = new THREE.Sprite(level.glowMaterial(kind));
    this.glow.scale.setScalar(small ? 1.6 : 2.6);
    this.object.add(this.glow);
    if (this.def.power || kind === 'core') {
      this.beam = new THREE.Mesh(level.A.beamGeo, level.beamMaterial(kind));
      this.beam.scale.set(0.5, 0.3, 0.5);
      this.object.add(this.beam);
    }
    this.place();
  }

  place() {
    const R = this.level.heightAt(this.dir);
    const bob = Math.sin(this.t * 2.5) * 0.18;
    this.position.copy(this.dir).multiplyScalar(R + 1.05 + this.hopAlt + bob);
    this.object.position.copy(this.position);
    Sphere.orient(this.object, this.dir, Sphere.anyTangent(this.dir, _c1));
    if (this.beam) this.beam.position.y = -0.9 - bob;
  }

  update(dt) {
    const L = this.level, P = L.player;
    this.t += dt;
    if (this.hop || this.hopAlt > 0) {
      this.hop -= 20 * dt;
      this.hopAlt = Math.max(0, this.hopAlt + this.hop * dt);
      if (this.hopAlt === 0) this.hop = 0;
    }
    if (this.slideV.lengthSq() > 0.01) {
      _c2.copy(this.slideV).multiplyScalar(dt);
      Sphere.slide(this.dir, _c2, L.R, this.slideV);
      this.slideV.multiplyScalar(Math.exp(-3 * dt));
    }
    if (P && P.buffs.magnet > 0 && !P.dead) {
      const arc = L.arc(this.dir, P.dir);
      if (arc < 18 && arc > 0.3) {
        Sphere.tangentToward(this.dir, P.dir, _c2);
        Sphere.slide(this.dir, _c2.multiplyScalar(Math.min(arc, 16 * dt)), L.R);
      }
    }
    if (this.life > 0) {
      this.life -= dt;
      this.object.visible = this.life > 4 || Math.floor(this.life * 8) % 2 === 0;
      if (this.life <= 0) return true;
    }
    this.place();
    return false;
  }
}

/* ---------------- breakables: Star Caches and Frost Totems ---------------- */
class Breakable {
  constructor(level, kind, dir) {
    this.level = level;
    this.kind = kind;
    this.dir = dir.clone();
    this.broken = false;
    this.flashT = 0;
    this.shakeT = 0;
    const A = level.A, diff = level.game.diff;
    this.maxHp = Math.round((kind === 'totem' ? 60 : 30) * diff.hp);
    this.hp = this.maxHp;
    this.radius = 0.85;
    this.object = new THREE.Group();
    Sphere.orient(this.object, this.dir, Sphere.anyTangent(this.dir, _c1));
    const ground = level.heightAt(this.dir);
    this.object.position.copy(this.dir).multiplyScalar(ground - 0.1);
    this.inner = new THREE.Group();
    this.object.add(this.inner);
    this.mats = [];
    if (kind === 'chest') {
      const mat = new THREE.MeshStandardMaterial({ color: 0x3a2050, emissive: 0x1a0830, flatShading: true, roughness: 0.4, metalness: 0.2 });
      const gem = new THREE.Mesh(A.chestGeo, mat);
      gem.position.y = 0.65;
      this.inner.add(gem);
      const band = new THREE.Mesh(A.chestBandGeo, A.goldMat);
      band.position.y = 0.65;
      band.rotation.x = Math.PI / 2;
      this.inner.add(band);
      const crystals = new THREE.Mesh(A.chestCrystalGeo, A.goldGlowMat);
      crystals.position.y = 0.65;
      this.inner.add(crystals);
      this.mats.push(mat);
      this.glow = makeGlow(new THREE.Color(0.9, 0.6, 0.2), 2.6, 0.35);
      this.glow.position.y = 0.9;
      this.object.add(this.glow);
      this.flashMat = mat;
    } else {
      const mat = new THREE.MeshStandardMaterial({ color: 0x8fc8f0, emissive: 0x1a4a70, flatShading: true, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.92 });
      const pillar = new THREE.Mesh(A.totemGeo, mat);
      this.inner.add(pillar);
      const rune = new THREE.Mesh(A.totemRuneGeo, A.iceGlowMat);
      rune.position.y = 1.6;
      rune.rotation.x = Math.PI / 2;
      this.inner.add(rune);
      const top = new THREE.Mesh(A.totemTopGeo, A.iceGlowMat);
      top.position.y = 3.6;
      this.inner.add(top);
      this.top = top;
      this.mats.push(mat);
      this.glow = makeGlow(new THREE.Color(0.3, 0.8, 1.2), 3, 0.4);
      this.glow.position.y = 3.6;
      this.object.add(this.glow);
      this.flashMat = mat;
      this.radius = 0.9;
    }
    this.baseEmissive = this.flashMat.emissive.clone();
    this.worldPos = this.dir.clone().multiplyScalar(ground + 0.8);
    this.position = this.worldPos;
    this.collider = level.addCollider(this.dir, 0.75);
  }

  takeHit(dmg, fromPos, opts) {
    if (this.broken) return 0;
    this.hp -= dmg;
    this.flashT = 0.12;
    this.shakeT = 0.25;
    const L = this.level;
    L.fx.burst(this.worldPos, 8, 4, ...(this.kind === 'chest' ? [1.6, 1.1, 0.4] : [0.6, 1.4, 2.0]), 0.25, 0.4, { drag: 3 });
    L.game.audio.sfx('chip');
    if (this.hp <= 0) this.shatter();
    return dmg;
  }

  shatter() {
    this.broken = true;
    const L = this.level;
    this.object.visible = false;
    L.removeCollider(this.collider);
    const c = this.kind === 'chest' ? [1.8, 1.2, 0.4] : [0.6, 1.5, 2.2];
    L.fx.burst(this.worldPos, 40, 8, c[0], c[1], c[2], 0.45, 0.9, { drag: 2.5 });
    L.game.audio.sfx('break');
    L.onBreakableBroken(this);
  }

  update(dt) {
    if (this.broken) return;
    const t = this.level.time;
    if (this.flashT > 0) {
      this.flashT -= dt;
      this.flashMat.emissive.setRGB(1.2, 1.2, 1.2);
    } else {
      this.flashMat.emissive.copy(this.baseEmissive);
    }
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      this.inner.position.set((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2);
    } else {
      this.inner.position.set(0, 0, 0);
    }
    if (this.kind === 'chest') this.inner.rotation.y += dt * 0.6;
    if (this.top) this.top.rotation.y += dt * 1.2;
    this.glow.material.opacity = 0.3 + Math.sin(t * 3 + this.dir.x * 10) * 0.08;
  }
}

/* Shared enemy/boss "burning" damage over time from a white-hot Sunblade. */
function tickBurn(target, dt) {
  if (!(target.burnT > 0)) return;
  target.burnT -= dt;
  target.burnTick = (target.burnTick || 0) - dt;
  const L = target.level;
  if (Math.random() < 0.6 * L.game.quality.fx) {
    const p = target.position;
    L.fx.spawn(p.x + (Math.random() - 0.5), p.y + (Math.random() - 0.5), p.z + (Math.random() - 0.5), 0, 0, 0, 2.2, 0.8, 0.2, 0.4, 0.5, 0, 0, 0.1);
  }
  if (target.burnTick <= 0) {
    target.burnTick = 0.5;
    L.damage(target, 5, null, { source: 'burn' });
  }
}
