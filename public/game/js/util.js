'use strict';
/* Shared helpers: math, seeded noise, movement on a sphere's surface, shared textures. */

const TAU = Math.PI * 2;
const AXIS_Y = new THREE.Vector3(0, 1, 0);

function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function damp(rate, dt) { return 1 - Math.exp(-rate * dt); }
function smooth01(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
function easeOutCubic(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t) { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function rand(a, b) { return a + Math.random() * (b - a); }
function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function formatTime(s) {
  s = Math.max(0, s || 0);
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

/* ---------- seeded random ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 3D simplex noise (Gustavson) ---------- */
const GRAD3 = new Float32Array([
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
  1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
  0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
]);

class Simplex3 {
  constructor(rng) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  noise(xin, yin, zin) {
    const perm = this.perm, pm = this.permMod12;
    const F3 = 1 / 3, G3 = 1 / 6;
    let n0 = 0, n1 = 0, n2 = 0, n3 = 0;
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }
    const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
    const ii = i & 255, jj = j & 255, kk = k & 255;
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 > 0) {
      const gi = pm[ii + perm[jj + perm[kk]]] * 3;
      t0 *= t0; n0 = t0 * t0 * (GRAD3[gi] * x0 + GRAD3[gi + 1] * y0 + GRAD3[gi + 2] * z0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 > 0) {
      const gi = pm[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
      t1 *= t1; n1 = t1 * t1 * (GRAD3[gi] * x1 + GRAD3[gi + 1] * y1 + GRAD3[gi + 2] * z1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 > 0) {
      const gi = pm[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
      t2 *= t2; n2 = t2 * t2 * (GRAD3[gi] * x2 + GRAD3[gi + 1] * y2 + GRAD3[gi + 2] * z2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 > 0) {
      const gi = pm[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
      t3 *= t3; n3 = t3 * t3 * (GRAD3[gi] * x3 + GRAD3[gi + 1] * y3 + GRAD3[gi + 2] * z3);
    }
    return 32 * (n0 + n1 + n2 + n3);
  }
}

function fbm3(sx, x, y, z, octaves) {
  let sum = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * sx.noise(x * f, y * f, z * f);
    norm += amp;
    amp *= 0.5;
    f *= 2.03;
  }
  return sum / norm;
}

/* ---------- movement on the surface of a sphere centred at the origin ---------- */
const Sphere = (() => {
  const axis = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const tmp = new THREE.Vector3();
  const xv = new THREE.Vector3();
  const zv = new THREE.Vector3();
  const m = new THREE.Matrix4();

  // Unit tangent at `dir` pointing toward `target` (zero vector if they coincide).
  function tangentToward(dir, target, out) {
    const d = dir.dot(target);
    out.copy(target).addScaledVector(dir, -d);
    const l = out.length();
    if (l < 1e-6) return out.set(0, 0, 0);
    return out.multiplyScalar(1 / l);
  }

  // Slide unit vector `dir` along tangent displacement `disp` (world units) on a sphere of `radius`.
  // Up to three tangent vectors are carried along (parallel transport) and re-projected.
  function slide(dir, disp, radius, c1, c2, c3) {
    tmp.copy(disp).addScaledVector(dir, -dir.dot(disp));
    const len = tmp.length();
    if (len < 1e-7) return;
    axis.crossVectors(dir, tmp).normalize();
    q.setFromAxisAngle(axis, len / Math.max(1, radius));
    dir.applyQuaternion(q).normalize();
    if (c1) { c1.applyQuaternion(q); c1.addScaledVector(dir, -dir.dot(c1)); }
    if (c2) { c2.applyQuaternion(q); c2.addScaledVector(dir, -dir.dot(c2)); }
    if (c3) { c3.applyQuaternion(q); c3.addScaledVector(dir, -dir.dot(c3)); }
  }

  function angle(a, b) { return Math.acos(clamp(a.dot(b), -1, 1)); }

  function randomDir(rng, out) {
    const u = rng() * 2 - 1, th = rng() * TAU, s = Math.sqrt(1 - u * u);
    return out.set(s * Math.cos(th), u, s * Math.sin(th));
  }

  function anyTangent(dir, out) {
    if (Math.abs(dir.y) < 0.9) out.set(0, 1, 0); else out.set(1, 0, 0);
    out.addScaledVector(dir, -dir.dot(out)).normalize();
    return out;
  }

  // Object's local +Y -> up, local +Z -> forward.
  function orient(obj, up, fwd) {
    xv.crossVectors(up, fwd);
    if (xv.lengthSq() < 1e-10) { anyTangent(up, zv); xv.crossVectors(up, zv); }
    xv.normalize();
    zv.crossVectors(xv, up);
    m.makeBasis(xv, up, zv);
    obj.quaternion.setFromRotationMatrix(m);
  }

  function rotateAround(v, ax, ang) {
    q.setFromAxisAngle(ax, ang);
    return v.applyQuaternion(q);
  }

  // Signed angle from a to b around axis n (all tangent/unit).
  function signedAngle(a, b, n) {
    tmp.crossVectors(a, b);
    return Math.atan2(tmp.dot(n), a.dot(b));
  }

  return { tangentToward, slide, angle, randomDir, anyTangent, orient, rotateAround, signedAngle };
})();

/* ---------- shared textures ---------- */
const Tex = {
  _glow: null,
  glow() {
    if (!this._glow) {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d');
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(0.18, 'rgba(255,255,255,0.7)');
      grd.addColorStop(0.45, 'rgba(255,255,255,0.2)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
      this._glow = new THREE.CanvasTexture(c);
      this._glow.userData.keep = true;
    }
    return this._glow;
  }
};

function makeGlowMaterial(color, opacity, fog) {
  return new THREE.SpriteMaterial({
    map: Tex.glow(), color, transparent: true, opacity: opacity === undefined ? 1 : opacity,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: !!fog
  });
}

function makeGlow(color, scale, opacity, fog) {
  const s = new THREE.Sprite(makeGlowMaterial(color, opacity, fog));
  s.scale.setScalar(scale);
  return s;
}

// Merge simple geometries (position + normal only) into one non-indexed geometry.
function mergeGeos(list) {
  const parts = list.map(g => (g.index ? g.toNonIndexed() : g));
  let count = 0;
  for (const g of parts) count += g.attributes.position.count;
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  let o = 0;
  for (const g of parts) {
    if (!g.attributes.normal) g.computeVertexNormals();
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}

// Release GPU resources for everything under `root` (shared textures are kept).
function disposeTree(root) {
  const seen = new Set();
  root.traverse(o => {
    if (o.geometry && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); }
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (seen.has(m)) continue;
        seen.add(m);
        for (const k in m) {
          const v = m[k];
          if (v && v.isTexture && !(v.userData && v.userData.keep)) v.dispose();
        }
        m.dispose();
      }
    }
  });
}

function storageGet(key) {
  try { return window.localStorage.getItem(key); } catch (e) { return null; }
}
function storageSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
}
