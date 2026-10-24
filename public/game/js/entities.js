'use strict';
/* Shared world objects: particles, effect shaders, shards, vents, the beacon, pyres and shockwaves. */

const PULSE_COST = 12;
const PULSE_CD = 1.0;
const PULSE_RADIUS = 7.5;
const MAX_SPEED = 8.6;

const _e1 = new THREE.Vector3(), _e2 = new THREE.Vector3(), _e3 = new THREE.Vector3(), _e4 = new THREE.Vector3();

/* ---------------- particles ---------------- */
const PARTICLE_VS = `
attribute float psize; attribute float palpha; attribute vec3 pcolor;
uniform float uScale;
varying vec3 vColor; varying float vAlpha;
void main() {
  vColor = pcolor; vAlpha = palpha;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = psize * uScale / max(0.5, -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const PARTICLE_FS = `
varying vec3 vColor; varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5 || vAlpha < 0.003) discard;
  float a = smoothstep(0.5, 0.05, d);
  gl_FragColor = vec4(vColor, a * vAlpha);
}`;

class Particles {
  constructor(max, additive) {
    this.max = max;
    this.cursor = 0;
    this.pos = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.size = new Float32Array(max);
    this.alpha = new Float32Array(max);
    this.life = new Float32Array(max);
    this.maxLife = new Float32Array(max);
    this.size0 = new Float32Array(max);
    this.alpha0 = new Float32Array(max);
    this.drag = new Float32Array(max);
    this.buoy = new Float32Array(max);
    this.grow = new Float32Array(max);
    const geo = new THREE.BufferGeometry();
    this.aPos = new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage);
    this.aSize = new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage);
    this.aAlpha = new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', this.aPos);
    geo.setAttribute('pcolor', this.aCol);
    geo.setAttribute('psize', this.aSize);
    geo.setAttribute('palpha', this.aAlpha);
    this.material = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: 500 } },
      vertexShader: PARTICLE_VS, fragmentShader: PARTICLE_FS,
      transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = additive ? 6 : 5;
    this.active = 0;
  }

  spawn(x, y, z, vx, vy, vz, r, g, b, size, life, drag, buoy, grow, alpha) {
    const i = this.cursor;
    this.cursor = (this.cursor + 1) % this.max;
    const i3 = i * 3;
    this.pos[i3] = x; this.pos[i3 + 1] = y; this.pos[i3 + 2] = z;
    this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz;
    this.col[i3] = r; this.col[i3 + 1] = g; this.col[i3 + 2] = b;
    this.size0[i] = size; this.size[i] = size;
    this.life[i] = life; this.maxLife[i] = life;
    this.drag[i] = drag || 0;
    this.buoy[i] = buoy || 0;
    this.grow[i] = grow === undefined ? 0.3 : grow;
    this.alpha0[i] = alpha === undefined ? 1 : alpha;
    this.alpha[i] = 0;
    this.active = this.max;
  }

  // Spawn at a Vector3 with a random spread velocity.
  burst(p, n, speed, r, g, b, size, life, opts) {
    const o = opts || {};
    for (let i = 0; i < n; i++) {
      let vx = Math.random() * 2 - 1, vy = Math.random() * 2 - 1, vz = Math.random() * 2 - 1;
      const l = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
      const s = speed * (0.35 + Math.random() * 0.65) / l;
      vx *= s; vy *= s; vz *= s;
      if (o.up) { vx += o.up.x * o.upSpeed; vy += o.up.y * o.upSpeed; vz += o.up.z * o.upSpeed; }
      const j = o.jitter || 0;
      this.spawn(p.x + (Math.random() - 0.5) * j, p.y + (Math.random() - 0.5) * j, p.z + (Math.random() - 0.5) * j,
        vx, vy, vz, r, g, b, size * (0.6 + Math.random() * 0.8), life * (0.6 + Math.random() * 0.6),
        o.drag === undefined ? 2 : o.drag, o.buoy || 0, o.grow, o.alpha);
    }
  }

  update(dt) {
    if (!this.active) return;
    const P = this.pos, V = this.vel;
    let alive = 0;
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) {
        if (this.alpha[i] !== 0) { this.alpha[i] = 0; this.size[i] = 0; }
        continue;
      }
      alive++;
      this.life[i] -= dt;
      const i3 = i * 3;
      const t = 1 - Math.max(0, this.life[i]) / this.maxLife[i];
      const bu = this.buoy[i];
      if (bu !== 0) {
        const x = P[i3], y = P[i3 + 1], z = P[i3 + 2];
        const l = Math.sqrt(x * x + y * y + z * z) || 1;
        V[i3] += x / l * bu * dt; V[i3 + 1] += y / l * bu * dt; V[i3 + 2] += z / l * bu * dt;
      }
      const dr = this.drag[i];
      if (dr !== 0) {
        const k = Math.exp(-dr * dt);
        V[i3] *= k; V[i3 + 1] *= k; V[i3 + 2] *= k;
      }
      P[i3] += V[i3] * dt; P[i3 + 1] += V[i3 + 1] * dt; P[i3 + 2] += V[i3 + 2] * dt;
      const fade = t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88;
      this.alpha[i] = this.life[i] > 0 ? this.alpha0[i] * fade * fade : 0;
      this.size[i] = this.size0[i] * lerp(1, this.grow[i], t);
    }
    if (!alive) this.active = 0;
    this.aPos.needsUpdate = true;
    this.aCol.needsUpdate = true;
    this.aSize.needsUpdate = true;
    this.aAlpha.needsUpdate = true;
  }
}

/* ---------------- shader helpers shared by several effects ---------------- */
const BEAM_VS = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const BEAM_FS = `
uniform vec3 color; uniform float opacity; uniform float time;
varying vec2 vUv;
void main() {
  float a = 1.0 - vUv.y; a = a * a;
  float shimmer = 0.8 + 0.2 * sin(vUv.y * 40.0 - time * 6.0);
  gl_FragColor = vec4(color * shimmer, a * opacity);
}`;
function makeBeamMaterial(color, opacity) {
  return new THREE.ShaderMaterial({
    uniforms: { color: { value: color }, opacity: { value: opacity }, time: { value: 0 } },
    vertexShader: BEAM_VS, fragmentShader: BEAM_FS,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false
  });
}

// A band that hugs the planet: a ring of angular radius `theta` around the mesh's local +Y axis.
const SURFRING_VS = `
uniform float theta; uniform float rad; uniform float height;
varying float vV;
void main() {
  float v = position.y + 0.5; vV = v;
  float rr = rad + v * height;
  float s = sin(theta), c = cos(theta);
  vec3 p = vec3(position.x * s * rr, c * rr, position.z * s * rr);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const SURFRING_FS = `
uniform vec3 color; uniform float opacity;
varying float vV;
void main() {
  float a = pow(1.0 - vV, 1.6) * opacity;
  float edge = smoothstep(0.0, 0.08, vV);
  gl_FragColor = vec4(color * (1.0 + (1.0 - edge) * 1.5), a);
}`;
function makeSurfRingMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      theta: { value: 0.01 }, rad: { value: 30 }, height: { value: 1.5 },
      color: { value: color }, opacity: { value: 1 }
    },
    vertexShader: SURFRING_VS, fragmentShader: SURFRING_FS,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
  });
}

const BUBBLE_VS = `
varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const BUBBLE_FS = `
uniform vec3 color; uniform float opacity;
varying vec3 vN; varying vec3 vV;
void main() {
  float f = 1.0 - abs(dot(vN, vV));
  f = pow(f, 2.2);
  gl_FragColor = vec4(color, f * opacity);
}`;

const RINGPROG_VS = `
varying vec2 vP;
void main() { vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const RINGPROG_FS = `
uniform float progress; uniform vec3 color; uniform float time;
varying vec2 vP;
void main() {
  float a = atan(vP.y, vP.x) / 6.2831853 + 0.5;
  float on = step(a, progress);
  float pulse = 0.75 + 0.25 * sin(time * 6.0);
  vec3 c = color * mix(0.22, 1.5 * pulse, on);
  gl_FragColor = vec4(c, mix(0.45, 1.0, on));
}`;

/* ---------------- Lumen shards & light motes ---------------- */
class Shard {
  constructor(level, dir, A, kind) {
    this.level = level;
    this.kind = kind || 'shard';
    this.dir = dir.clone();
    this.collected = false;
    this.popT = 0;
    this.phase = Math.random() * TAU;
    this.group = new THREE.Group();
    const small = this.kind === 'mote';
    this.crystal = new THREE.Mesh(small ? A.moteGeo : A.shardGeo, small ? A.moteMat : A.shardMat);
    this.group.add(this.crystal);
    this.glow = new THREE.Sprite(small ? A.moteGlowMat : A.shardGlowMat);
    this.glow.scale.setScalar(small ? 2.2 : 3.4);
    this.group.add(this.glow);
    this.beam = new THREE.Mesh(A.beamGeo, small ? A.moteBeamMat : A.shardBeamMat);
    if (small) this.beam.scale.set(0.6, 0.35, 0.6);
    this.group.add(this.beam);
    Sphere.orient(this.group, this.dir, Sphere.anyTangent(this.dir, _e1));
    this.base = level.heightAt(this.dir) + (small ? 1.0 : 1.3);
    this.group.position.copy(this.dir).multiplyScalar(this.base);
    this.worldPos = this.group.position.clone();
  }

  update(dt, t) {
    if (this.collected) {
      this.popT += dt;
      const k = this.popT / 0.35;
      this.crystal.scale.setScalar(1 + k * 1.5);
      this.glow.scale.setScalar((this.kind === 'mote' ? 2.2 : 3.4) * (1 + k * 2));
      if (k >= 1) this.group.visible = false;
      return;
    }
    this.crystal.position.y = Math.sin(t * 2 + this.phase) * 0.25;
    this.crystal.rotation.y += dt * 1.6;
    this.glow.position.y = this.crystal.position.y;
  }

  collect() {
    this.collected = true;
    this.popT = 0;
    this.beam.visible = false;
  }
}

/* ---------------- lava vents (Cinderreach) ---------------- */
class Vent {
  constructor(level, dir, A) {
    this.level = level;
    this.dir = dir.clone();
    this.R = level.heightAt(dir);
    this.group = new THREE.Group();
    Sphere.orient(this.group, this.dir, Sphere.anyTangent(this.dir, _e1));
    this.group.position.copy(this.dir).multiplyScalar(this.R - 0.1);
    this.group.add(new THREE.Mesh(A.ventGeo, A.ventMat));
    this.coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.3, 0.05) });
    const core = new THREE.Mesh(A.ventCoreGeo, this.coreMat);
    this.group.add(core);
    this.ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.6, 0.1), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    this.ring = new THREE.Mesh(A.ventRingGeo, this.ringMat);
    this.group.add(this.ring);
    this.colMat = makeBeamMaterial(new THREE.Color(2.4, 0.8, 0.15), 0);
    this.column = new THREE.Mesh(A.ventColumnGeo, this.colMat);
    this.column.visible = false;
    this.group.add(this.column);
    this.period = rand(5.5, 7.5);
    this.cycle = rand(0, this.period);
    this.phase = 'idle';
    this.worldPos = this.group.position.clone();
  }

  update(dt) {
    const L = this.level, P = L.player, game = L.game;
    this.cycle += dt;
    const p = this.cycle % this.period;
    const eruptStart = this.period - 1.4, warnStart = eruptStart - 1.5;
    const phase = p >= eruptStart ? 'erupt' : (p >= warnStart ? 'warn' : 'idle');
    const dist = P ? P.position.distanceTo(this.worldPos) : 50;
    const vol = clamp(1 - dist / 38, 0, 1);
    if (phase !== this.phase) {
      if (phase === 'warn') game.audio.sfx('ventWarn', vol);
      if (phase === 'erupt') { game.audio.sfx('erupt', vol); if (dist < 16) game.shake(0.35 * (1 - dist / 16)); }
      this.phase = phase;
    }
    this.colMat.uniforms.time.value = L.time;
    if (phase === 'warn') {
      const k = (p - warnStart) / 1.5;
      this.ringMat.opacity = 0.25 + 0.45 * k + 0.25 * Math.sin(p * 18);
      this.coreMat.color.setRGB(1.2 + k * 1.4, 0.35 + k * 0.4, 0.06);
      if (Math.random() < 0.5 * game.quality.fx) this.spark(2, 2);
      this.column.visible = false;
    } else if (phase === 'erupt') {
      const k = (p - eruptStart) / 1.4;
      this.ringMat.opacity = 0.7 * (1 - k);
      this.coreMat.color.setRGB(2.6, 0.9, 0.15);
      this.column.visible = true;
      this.column.scale.set(1, Math.min(1, (p - eruptStart) / 0.15), 1);
      this.colMat.uniforms.opacity.value = 0.9 * (1 - smooth01((k - 0.7) / 0.3));
      this.spark(Math.ceil(5 * game.quality.fx), 11);
      if (P && P.canBeTargeted() && k < 0.9) {
        const arc = Sphere.angle(this.dir, P.dir) * this.R;
        if (arc < 2.3 && P.alt < 8) P.hurt(20, this.worldPos, 16);
      }
    } else {
      this.ringMat.opacity = 0;
      this.coreMat.color.setRGB(0.9 + Math.sin(L.time * 2 + this.period) * 0.2, 0.25, 0.05);
      this.column.visible = false;
    }
  }

  spark(n, speed) {
    const L = this.level, d = this.dir;
    _e4.copy(d).multiplyScalar(this.R + 0.3);
    for (let i = 0; i < n; i++) {
      const s = speed * rand(0.6, 1.2);
      L.fx.spawn(_e4.x + (Math.random() - 0.5) * 1.2, _e4.y + (Math.random() - 0.5) * 1.2, _e4.z + (Math.random() - 0.5) * 1.2,
        d.x * s + (Math.random() - 0.5) * 2, d.y * s + (Math.random() - 0.5) * 2, d.z * s + (Math.random() - 0.5) * 2,
        2.2, rand(0.5, 1.0), 0.12, rand(0.25, 0.55), rand(0.6, 1.1), 0.8, -4, 0.2);
    }
  }
}

/* ---------------- the Skyward Beacon (level exit) ---------------- */
class Beacon {
  constructor(level, dir) {
    this.level = level;
    this.dir = dir.clone();
    this.active = false;
    this.t = 0;
    this.group = new THREE.Group();
    Sphere.orient(this.group, this.dir, Sphere.anyTangent(this.dir, _e1));
    this.R = level.heightAt(dir);
    this.group.position.copy(this.dir).multiplyScalar(this.R);
    const col = new THREE.Color(1.6, 1.8, 2.2);
    const ringMat = new THREE.MeshBasicMaterial({ color: col });
    this.rings = [];
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(2.0 - i * 0.45, 0.07, 8, 64), ringMat);
      r.rotation.x = Math.PI / 2;
      r.position.y = 0.3 + i * 1.3;
      this.group.add(r);
      this.rings.push(r);
    }
    this.beamMat = makeBeamMaterial(new THREE.Color(1.2, 1.4, 1.9), 0.85);
    const beamGeo = new THREE.CylinderGeometry(1.1, 1.5, 70, 32, 1, true);
    beamGeo.translate(0, 35, 0);
    this.beam = new THREE.Mesh(beamGeo, this.beamMat);
    this.group.add(this.beam);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(2.2, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 0.8, 1.2), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.15;
    this.group.add(pad);
    this.group.visible = false;
    this.worldPos = this.group.position.clone();
  }

  activate() {
    this.active = true;
    this.group.visible = true;
    this.t = 0;
  }

  update(dt) {
    if (!this.active) return;
    this.t += dt;
    const s = easeOutCubic(this.t / 1.4);
    this.group.scale.set(s, s, s);
    this.beamMat.uniforms.time.value = this.t;
    this.rings.forEach((r, i) => {
      r.rotation.z += dt * (0.8 + i * 0.6) * (i % 2 ? -1 : 1);
      r.position.y = 0.3 + i * 1.3 + Math.sin(this.t * 2 + i) * 0.2;
    });
    const L = this.level;
    if (Math.random() < 0.8 * L.game.quality.fx) {
      const a = this.t * 3 + Math.random() * 0.4;
      Sphere.anyTangent(this.dir, _e1);
      Sphere.rotateAround(_e1, this.dir, a);
      _e2.copy(this.dir).multiplyScalar(this.R + 0.3).addScaledVector(_e1, 1.8);
      L.fx.spawn(_e2.x, _e2.y, _e2.z, this.dir.x * 3, this.dir.y * 3, this.dir.z * 3, 1.2, 1.5, 2.0, 0.35, 1.6, 0.3, 0, 0.2);
    }
  }
}

/* ---------------- Pyres (The Hollow Sun) ---------------- */
class Pyre {
  constructor(level, dir, A) {
    this.level = level;
    this.dir = dir.clone();
    this.R = level.heightAt(dir);
    this.charge = 0;
    this.lit = false;
    this.tickT = 0;
    this.seenHurt = 0;
    this.group = new THREE.Group();
    Sphere.orient(this.group, this.dir, Sphere.anyTangent(this.dir, _e1));
    this.group.position.copy(this.dir).multiplyScalar(this.R - 0.1);
    this.group.add(new THREE.Mesh(A.pyrePillarGeo, A.stoneMat));
    this.group.add(new THREE.Mesh(A.pyreBowlGeo, A.stoneMat));
    this.crystalMat = new THREE.MeshStandardMaterial({ color: 0x3a3030, emissive: new THREE.Color(1.0, 0.55, 0.15), emissiveIntensity: 0, flatShading: true, roughness: 0.3 });
    this.crystal = new THREE.Mesh(A.pyreCrystalGeo, this.crystalMat);
    this.crystal.position.y = 4.4;
    this.group.add(this.crystal);
    this.ringMat = new THREE.ShaderMaterial({
      uniforms: { progress: { value: 0 }, color: { value: new THREE.Color(1.6, 0.95, 0.35) }, time: { value: 0 } },
      vertexShader: RINGPROG_VS, fragmentShader: RINGPROG_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
    });
    this.ring = new THREE.Mesh(A.pyreRingGeo, this.ringMat);
    this.ring.position.y = 0.2;
    this.group.add(this.ring);
    this.beamMat = makeBeamMaterial(new THREE.Color(2.0, 1.2, 0.45), 0.9);
    this.beam = new THREE.Mesh(A.beamGeo, this.beamMat);
    this.beam.scale.set(2.2, 1.6, 2.2);
    this.beam.position.y = 4.4;
    this.beam.visible = false;
    this.group.add(this.beam);
    this.glow = new THREE.Sprite(A.pyreGlowMat);
    this.glow.position.y = 4.4;
    this.glow.scale.setScalar(0.001);
    this.group.add(this.glow);
    this.worldPos = this.group.position.clone();
    this.topPos = this.dir.clone().multiplyScalar(this.R + 4.4);
  }

  update(dt) {
    const L = this.level, P = L.player, game = L.game;
    this.ringMat.uniforms.time.value = L.time;
    this.beamMat.uniforms.time.value = L.time;
    this.crystal.rotation.y += dt * (this.lit ? 2.5 : 0.6);
    if (!this.lit) {
      const inside = P && P.canBeTargeted() && Sphere.angle(this.dir, P.dir) * this.R < 3.0;
      if (inside) {
        this.charge += dt / 3.6;
        this.tickT -= dt;
        if (this.tickT <= 0) { this.tickT = 0.22; game.audio.sfx('pyreTick', this.charge); }
        if (Math.random() < 0.7) {
          const p = P.position;
          _e1.subVectors(this.topPos, p).multiplyScalar(2);
          L.fx.spawn(p.x, p.y, p.z, _e1.x, _e1.y, _e1.z, 1.8, 1.0, 0.3, 0.3, 0.5, 0.5, 0, 0.2);
        }
      } else {
        this.charge = Math.max(0, this.charge - dt * 0.25);
      }
      if (P && P.hurtCount !== this.seenHurt) {
        this.seenHurt = P.hurtCount;
        if (Sphere.angle(this.dir, P.dir) * this.R < 3.0) this.charge = Math.max(0, this.charge - 0.3);
      }
      if (this.charge >= 1) {
        this.charge = 1;
        this.lit = true;
        this.beam.visible = true;
        L.onPyreLit(this);
      }
      this.crystalMat.emissiveIntensity = this.charge * 1.4;
      this.glow.scale.setScalar(0.001 + this.charge * 3);
    } else {
      this.crystalMat.emissiveIntensity = 2.6 + Math.sin(L.time * 5) * 0.3;
      this.glow.scale.setScalar(7 + Math.sin(L.time * 4) * 0.5);
      if (Math.random() < 0.9 * game.quality.fx) {
        const p = this.topPos, d = this.dir;
        L.fx.spawn(p.x + (Math.random() - 0.5) * 0.8, p.y + (Math.random() - 0.5) * 0.8, p.z + (Math.random() - 0.5) * 0.8,
          d.x * rand(2, 4), d.y * rand(2, 4), d.z * rand(2, 4), 2.2, 1.1, 0.3, rand(0.3, 0.6), rand(0.6, 1.0), 1, 0, 0.1);
      }
    }
    this.ringMat.uniforms.progress.value = this.charge;
  }
}

/* ---------------- shockwave from the Hush's slam ---------------- */
class Shockwave {
  constructor(level, centerDir, A, opts) {
    opts = opts || {};
    this.level = level;
    this.c = centerDir.clone();
    this.rad = level.heightAt(centerDir) + 0.1;
    this.theta = 0.03;
    this.maxTheta = (opts.reach || 46) / level.R;
    this.speed = (opts.speed || 14) / level.R;
    this.dmg = opts.dmg || 18;
    this.hit = false;
    this.done = false;
    this.mat = makeSurfRingMaterial(opts.color || new THREE.Color(1.5, 0.35, 1.7));
    this.mat.uniforms.rad.value = this.rad - 0.4;
    this.mat.uniforms.height.value = 1.9;
    this.mesh = new THREE.Mesh(A.waveGeo, this.mat);
    this.mesh.quaternion.setFromUnitVectors(AXIS_Y, this.c);
    this.mesh.frustumCulled = false;
  }

  update(dt) {
    this.theta += this.speed * dt;
    const k = this.theta / this.maxTheta;
    this.mat.uniforms.theta.value = this.theta;
    this.mat.uniforms.opacity.value = 1 - smooth01((k - 0.7) / 0.3);
    const P = this.level.player;
    if (!this.hit && P && P.canBeTargeted()) {
      const pa = Sphere.angle(this.c, P.dir);
      if (Math.abs(pa - this.theta) * this.rad < 0.85 && P.alt < 0.7) {
        _e3.copy(this.c).multiplyScalar(this.rad);
        if (P.hurt(this.dmg, _e3, 15)) this.hit = true;
      }
    }
    if (k >= 1) this.done = true;
  }
}

