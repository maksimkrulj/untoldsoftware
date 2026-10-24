'use strict';
/* Moons: biome definitions, planet terrain, sky, and scattered scenery. */

const BIOMES = [
  {
    key: 'moss', numeral: 'I', name: 'Mossgrove',
    intro: 'Soft moss still remembers the warmth of the Sun. Someone here still keeps a lamp lit — find them.',
    outro: 'Thornmaw is gone, and the shards hum softly in your glow. Far away, inside the cold Sun, something stirs.',
    seed: 4242, radius: 28, amp: 1.5, freq: 1.25, shape: 'smooth',
    ground: [0x23462f, 0x3f7a3a, 0x93b65c], rock: 0x5a544c, roughness: 0.92,
    sky: { top: 0x060a1f, bottom: 0x22164a, neb1: 0x5b2c86, neb2: 0x1b5f6e },
    fog: 0x120e26, fogDensity: 0.011,
    ambient: [0x8c84c4, 0.62], keyLight: [0xb8b0ff, 0.55], sunCol: 0xffb070,
    sunGlow: 0.12,
    shards: 8, wisps: 5, stalkers: 0, spitters: 1, drain: 1.2, bossKey: 'thornmaw', chests: 5, powerups: 3,
    decor: [['pine', 46], ['tree', 26], ['rock', 30], ['mushroom', 60], ['flower', 80]],
    ambientFx: 'fireflies', music: 'moss',
    shardColor: [2.2, 1.75, 0.8]
  },
  {
    key: 'frost', numeral: 'II', name: 'Rimefall',
    intro: 'The cold here is older than the dark. The ice is slick — your momentum will carry you, so steer early.',
    outro: 'The Warden\'s ice cracks and melts away. Your flame burns brighter now — and the Hush has begun to notice you.',
    seed: 9001, radius: 33, amp: 1.8, freq: 1.1, shape: 'ridged',
    ground: [0x2f4a72, 0x6f8db3, 0xaec4dc], rock: 0x3e4b60, roughness: 0.7,
    sky: { top: 0x030818, bottom: 0x0e2c52, neb1: 0x1d6b8f, neb2: 0x4b3a8a },
    fog: 0x0b1830, fogDensity: 0.010,
    ambient: [0x8aa6d6, 0.42], keyLight: [0xc4dcff, 0.38], sunCol: 0xffc890,
    sunGlow: 0.32,
    shards: 10, wisps: 5, stalkers: 3, spitters: 2, drain: 1.35, slippery: true, playerLight: 0.5, bossKey: 'warden', chests: 5, powerups: 3, totems: 3,
    decor: [['snowpine', 52], ['crystal', 36], ['rock', 28], ['snowmound', 34]],
    ambientFx: 'snow', music: 'frost',
    shardColor: [2.2, 1.75, 0.8]
  },
  {
    key: 'cinder', numeral: 'III', name: 'Cinderreach',
    intro: 'Fire without light still burns. The vents glow before they erupt — read the warning and keep clear.',
    outro: 'The Colossus crumbles to ash. Every shard is gathered. Only the heart of the Sun remains — and the Hush coiled inside it.',
    seed: 777, radius: 37, amp: 2.2, freq: 1.35, shape: 'ridged',
    ground: [0x1a1311, 0x36251f, 0x5c3c2d], rock: 0x241c1c, roughness: 0.9,
    veins: { color: [1.7, 0.36, 0.05], width: 0.034, freq: 1.7 },
    sky: { top: 0x0b0306, bottom: 0x3a0f0c, neb1: 0x8a2a12, neb2: 0x4a1640 },
    fog: 0x1c0a08, fogDensity: 0.011,
    ambient: [0xc08a7a, 0.6], keyLight: [0xffc0a0, 0.5], sunCol: 0xff9a50,
    sunGlow: 0.55,
    shards: 12, wisps: 4, stalkers: 3, spitters: 2, brutes: 3, drain: 1.45, vents: 8, bossKey: 'colossus', chests: 5, powerups: 3,
    decor: [['basalt', 46], ['deadtree', 28], ['rock', 32], ['emberrock', 26]],
    ambientFx: 'ash', music: 'cinder',
    shardColor: [2.2, 1.75, 0.8]
  },
  {
    key: 'sun', numeral: 'IV', name: 'The Hollow Sun', boss: true,
    intro: 'The heart of it all. The Hush is coiled around what is left of the Sun. Kindle the five Pyres.',
    outro: '',
    seed: 31337, radius: 32, amp: 0.6, freq: 1.8, shape: 'smooth',
    ground: [0x140d0b, 0x201511, 0x2e1e17], rock: 0x120c0a, roughness: 0.75,
    veins: { color: [1.5, 0.42, 0.08], width: 0.07, freq: 1.4 },
    sky: { top: 0x05020a, bottom: 0x24081a, neb1: 0x6a1a3a, neb2: 0x3a1a6a },
    fog: 0x12060a, fogDensity: 0.009,
    ambient: [0xb08aa0, 0.62], keyLight: [0xffc8b0, 0.5], sunCol: 0xff7040,
    sunGlow: 0,
    pyres: 5, motes: 6, wisps: 2, stalkers: 0, spitters: 1, drain: 0.85, chests: 4, powerups: 3,
    decor: [['obsidian', 44], ['rock', 26]],
    ambientFx: 'embers', music: 'boss',
    shardColor: [2.4, 2.1, 1.4]
  }
];

const QUALITY = {
  low: { pr: 0.75, detail: 22, particles: 900, fx: 0.5, samples: 0 },
  medium: { pr: 1.0, detail: 32, particles: 1600, fx: 0.8, samples: 2 },
  high: { pr: 2.0, detail: 42, particles: 2400, fx: 1.0, samples: 4 }
};

/* ---------------- planet ---------------- */
function buildPlanet(level, detail) {
  const b = level.biome;
  const geo = new THREE.IcosahedronGeometry(1, detail);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const cache = new Map();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const key = Math.round(v.x * 1e5) + ',' + Math.round(v.y * 1e5) + ',' + Math.round(v.z * 1e5);
    let r = cache.get(key);
    if (r === undefined) { r = level.heightAt(v); cache.set(key, r); }
    pos.setXYZ(i, v.x * r, v.y * r, v.z * r);
  }

  const colors = new Float32Array(pos.count * 3);
  const cLow = new THREE.Color(b.ground[0]), cMid = new THREE.Color(b.ground[1]), cHigh = new THREE.Color(b.ground[2]);
  const cRock = new THREE.Color(b.rock);
  const a = new THREE.Vector3(), bb = new THREE.Vector3(), c = new THREE.Vector3();
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), n = new THREE.Vector3();
  const cen = new THREE.Vector3(), cdir = new THREE.Vector3();
  const col = new THREE.Color();
  const veinPos = [];
  const rng = level.rng;
  for (let f = 0; f < pos.count; f += 3) {
    a.fromBufferAttribute(pos, f);
    bb.fromBufferAttribute(pos, f + 1);
    c.fromBufferAttribute(pos, f + 2);
    cen.copy(a).add(bb).add(c).multiplyScalar(1 / 3);
    const rC = cen.length();
    cdir.copy(cen).divideScalar(rC);
    e1.subVectors(bb, a); e2.subVectors(c, a);
    n.crossVectors(e1, e2).normalize();
    if (n.dot(cdir) < 0) n.negate();
    const slope = 1 - n.dot(cdir);
    const h = clamp((rC - level.R) / (b.amp * 1.1), -1, 1);
    if (h < 0) col.copy(cLow).lerp(cMid, smooth01(h + 1));
    else col.copy(cMid).lerp(cHigh, smooth01(h * 1.15));
    if (slope > 0.06) col.lerp(cRock, clamp((slope - 0.06) * 7, 0, 0.85));
    col.multiplyScalar(0.9 + rng() * 0.2);
    for (let k = 0; k < 3; k++) {
      colors[(f + k) * 3] = col.r;
      colors[(f + k) * 3 + 1] = col.g;
      colors[(f + k) * 3 + 2] = col.b;
    }
    if (b.veins) {
      const vf = b.veins.freq;
      const vn = fbm3(level.noise, cdir.x * vf + 11.3, cdir.y * vf - 4.1, cdir.z * vf + 7.7, 2);
      if (Math.abs(vn) < b.veins.width) {
        const s = 1.0015;
        veinPos.push(a.x * s, a.y * s, a.z * s, bb.x * s, bb.y * s, bb.z * s, c.x * s, c.y * s, c.z * s);
      }
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true, flatShading: true, roughness: b.roughness, metalness: 0.02,
    emissive: new THREE.Color(0, 0, 0)
  });
  const mesh = new THREE.Mesh(geo, mat);

  let veins = null;
  if (veinPos.length) {
    const vg = new THREE.BufferGeometry();
    vg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(veinPos), 3));
    const vm = new THREE.MeshBasicMaterial({
      color: new THREE.Color(b.veins.color[0], b.veins.color[1], b.veins.color[2]),
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
    });
    veins = new THREE.Mesh(vg, vm);
  }
  return { mesh, veins };
}

/* ---------------- sky ---------------- */
const SKY_VS = `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;
const SKY_FS = `
uniform vec3 top; uniform vec3 bottom; uniform vec3 neb1; uniform vec3 neb2;
uniform float time;
varying vec3 vDir;
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; } return v; }
void main() {
  vec3 d = normalize(vDir);
  float h = d.y * 0.5 + 0.5;
  vec3 col = mix(bottom, top, smoothstep(0.0, 1.0, h));
  float n = fbm(d * 2.2 + vec3(0.0, 0.0, time * 0.004));
  float n2 = fbm(d * 4.5 + vec3(10.0, 3.0, -time * 0.003));
  col += neb1 * smoothstep(0.42, 0.82, n) * 0.75;
  col += neb2 * smoothstep(0.5, 0.9, n2) * 0.55;
  gl_FragColor = vec4(col, 1.0);
}`;

const STAR_VS = `
attribute float ssize; attribute float sphase;
uniform float time;
varying float vTw;
void main() {
  vTw = 0.55 + 0.45 * sin(time * (1.0 + sphase) + sphase * 20.0);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
  gl_PointSize = ssize;
}`;
const STAR_FS = `
varying float vTw;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(1.0, 0.95, 0.9) * vTw * 1.4, a);
}`;

function buildSky(level) {
  const b = level.biome;
  const group = new THREE.Group();
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      top: { value: new THREE.Color(b.sky.top) },
      bottom: { value: new THREE.Color(b.sky.bottom) },
      neb1: { value: new THREE.Color(b.sky.neb1) },
      neb2: { value: new THREE.Color(b.sky.neb2) },
      time: { value: 0 }
    },
    vertexShader: SKY_VS, fragmentShader: SKY_FS,
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), skyMat);
  sky.renderOrder = -100;
  sky.frustumCulled = false;
  group.add(sky);

  const N = 2600;
  const sp = new Float32Array(N * 3), ss = new Float32Array(N), sph = new Float32Array(N);
  const v = new THREE.Vector3();
  const srng = mulberry32(b.seed + 99);
  for (let i = 0; i < N; i++) {
    Sphere.randomDir(srng, v).multiplyScalar(480);
    sp[i * 3] = v.x; sp[i * 3 + 1] = v.y; sp[i * 3 + 2] = v.z;
    const r = srng();
    ss[i] = r < 0.92 ? 1.0 + srng() * 1.6 : 2.6 + srng() * 2.2;
    sph[i] = srng();
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  sg.setAttribute('ssize', new THREE.BufferAttribute(ss, 1));
  sg.setAttribute('sphase', new THREE.BufferAttribute(sph, 1));
  const starMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } }, vertexShader: STAR_VS, fragmentShader: STAR_FS,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, fog: false
  });
  const stars = new THREE.Points(sg, starMat);
  stars.renderOrder = -99;
  stars.frustumCulled = false;
  group.add(stars);

  return { group, skyMat, starMat };
}

/* The distant dead Sun (and sister moons) hanging in the sky. */
function buildBackdrop(level, sunDir) {
  const b = level.biome;
  const group = new THREE.Group();
  const out = { group, sun: null, sunGlow: null, corona: null };
  if (!b.boss) {
    const g = b.sunGlow;
    const sunCol = new THREE.Color(0.16, 0.05, 0.03).lerp(new THREE.Color(1.6, 0.85, 0.35), g);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(34, 32, 20), new THREE.MeshBasicMaterial({ color: sunCol, fog: false }));
    sun.position.copy(sunDir).multiplyScalar(420);
    group.add(sun);
    const glow = makeGlow(new THREE.Color(1.0, 0.45, 0.15), 260, 0.25 + g * 0.9, false);
    glow.position.copy(sun.position);
    group.add(glow);
    const corona = makeGlow(new THREE.Color(1.0, 0.7, 0.35), 120, 0.15 + g * 0.8, false);
    corona.position.copy(sun.position);
    group.add(corona);
    out.sun = sun; out.sunGlow = glow; out.corona = corona;
  }
  // sister moons
  const moons = [
    { col: 0x3f7a3a, dir: [0.7, 0.45, 0.55], r: 16, i: 0 },
    { col: 0x9cbcdc, dir: [-0.8, -0.2, 0.5], r: 20, i: 1 },
    { col: 0x5c3c2d, dir: [0.3, -0.75, -0.6], r: 18, i: 2 }
  ];
  for (const m of moons) {
    if (m.i === level.index) continue;
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(m.r, 2),
      new THREE.MeshStandardMaterial({ color: m.col, flatShading: true, roughness: 0.9, fog: false })
    );
    mesh.position.set(m.dir[0], m.dir[1], m.dir[2]).normalize().multiplyScalar(400);
    group.add(mesh);
  }
  return out;
}

/* ---------------- scenery kits ---------------- */
function makeDecorKits(biome) {
  const std = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: 0.85, metalness: 0 }, o || {}));
  const basic = () => new THREE.MeshBasicMaterial({ color: 0xffffff });
  const C = (r, g, b) => new THREE.Color(r, g, b);
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

  const pineFoliage = () => {
    const c1 = new THREE.ConeGeometry(0.95, 1.5, 7); c1.translate(0, 1.35, 0);
    const c2 = new THREE.ConeGeometry(0.72, 1.25, 7); c2.translate(0, 2.0, 0);
    const c3 = new THREE.ConeGeometry(0.45, 1.0, 7); c3.translate(0, 2.6, 0);
    return mergeGeos([c1, c2, c3]);
  };
  const trunk = (r0, r1, h) => { const g = new THREE.CylinderGeometry(r0, r1, h, 6); g.translate(0, h / 2, 0); return g; };

  return {
    pine: {
      scale: [0.8, 1.5], collider: 0.5, sink: 0.1, tilt: 0.08,
      parts: [
        { geo: trunk(0.12, 0.18, 0.9), mat: std(0xffffff), color: rng => C(0.32, 0.2, 0.14).multiplyScalar(0.8 + rng() * 0.3) },
        { geo: pineFoliage(), mat: std(0xffffff), color: rng => pick(rng, [C(0.12, 0.32, 0.2), C(0.1, 0.27, 0.22), C(0.16, 0.36, 0.18)]).clone().multiplyScalar(0.85 + rng() * 0.3) }
      ]
    },
    snowpine: {
      scale: [0.8, 1.6], collider: 0.5, sink: 0.1, tilt: 0.08,
      parts: [
        { geo: trunk(0.12, 0.18, 0.9), mat: std(0xffffff), color: () => C(0.25, 0.2, 0.2) },
        { geo: pineFoliage(), mat: std(0xffffff, { roughness: 0.6 }), color: rng => (rng() < 0.6 ? C(0.66, 0.74, 0.86) : C(0.17, 0.3, 0.36)).multiplyScalar(0.85 + rng() * 0.2) }
      ]
    },
    tree: {
      scale: [0.8, 1.4], collider: 0.45, sink: 0.1, tilt: 0.1,
      parts: [
        { geo: trunk(0.13, 0.2, 1.3), mat: std(0xffffff), color: () => C(0.3, 0.2, 0.15) },
        {
          geo: (() => {
            const a = new THREE.IcosahedronGeometry(0.95, 0); a.translate(0, 1.8, 0);
            const b = new THREE.IcosahedronGeometry(0.6, 0); b.translate(0.5, 1.5, 0.2);
            const c = new THREE.IcosahedronGeometry(0.55, 0); c.translate(-0.45, 1.55, -0.25);
            return mergeGeos([a, b, c]);
          })(),
          mat: std(0xffffff),
          color: rng => pick(rng, [C(0.2, 0.45, 0.25), C(0.25, 0.5, 0.3), C(0.75, 0.38, 0.55), C(0.35, 0.5, 0.2)]).clone()
        }
      ]
    },
    rock: {
      scale: [0.5, 1.6], collider: 0.62, colliderMin: 0.9, sink: 0.25, tilt: 0.4,
      parts: [
        {
          geo: (() => { const g = new THREE.DodecahedronGeometry(0.7, 0); g.scale(1, 0.65, 0.9); g.translate(0, 0.2, 0); return g; })(),
          mat: std(0xffffff), color: (rng, b) => new THREE.Color(b.rock).lerp(C(0.45, 0.43, 0.42), 0.4).multiplyScalar(0.75 + rng() * 0.5)
        }
      ]
    },
    mushroom: {
      scale: [0.6, 1.5], collider: 0, sink: 0.05, tilt: 0.3,
      parts: [
        { geo: trunk(0.07, 0.1, 0.55), mat: std(0xffffff), color: () => C(0.85, 0.82, 0.75) },
        {
          geo: (() => { const g = new THREE.SphereGeometry(0.3, 10, 6, 0, TAU, 0, Math.PI / 2); g.translate(0, 0.5, 0); return g; })(),
          mat: basic(), color: rng => pick(rng, [C(0.25, 1.5, 1.4), C(1.3, 0.45, 1.5), C(0.45, 0.9, 1.6)]).clone().multiplyScalar(0.8 + rng() * 0.4)
        }
      ]
    },
    flower: {
      scale: [0.7, 1.3], collider: 0, sink: 0.02, tilt: 0.25,
      parts: [
        { geo: trunk(0.025, 0.03, 0.5), mat: std(0xffffff), color: () => C(0.2, 0.45, 0.2) },
        {
          geo: (() => { const g = new THREE.IcosahedronGeometry(0.1, 0); g.translate(0, 0.52, 0); return g; })(),
          mat: basic(), color: rng => pick(rng, [C(1.6, 1.3, 0.4), C(1.5, 0.5, 0.9), C(0.6, 0.8, 1.7)]).clone()
        }
      ]
    },
    crystal: {
      scale: [0.7, 1.6], collider: 0.45, sink: 0.2, tilt: 0.2,
      parts: [
        {
          geo: (() => {
            const a = new THREE.OctahedronGeometry(0.35, 0); a.scale(1, 3.2, 1); a.translate(0, 0.9, 0);
            const b = new THREE.OctahedronGeometry(0.25, 0); b.scale(1, 3, 1); b.rotateZ(0.5); b.translate(0.35, 0.6, 0.05);
            const c = new THREE.OctahedronGeometry(0.22, 0); c.scale(1, 3, 1); c.rotateX(-0.5); c.translate(-0.1, 0.55, 0.35);
            return mergeGeos([a, b, c]);
          })(),
          mat: basic(), color: rng => C(0.35, 0.85, 1.35).multiplyScalar(0.75 + rng() * 0.35)
        }
      ]
    },
    snowmound: {
      scale: [0.8, 1.8], collider: 0, sink: 0.25, tilt: 0.2,
      parts: [
        {
          geo: (() => { const g = new THREE.IcosahedronGeometry(1, 1); g.scale(1.4, 0.45, 1.2); return g; })(),
          mat: std(0xffffff, { roughness: 0.7 }), color: rng => C(0.62, 0.7, 0.82).multiplyScalar(0.85 + rng() * 0.15)
        }
      ]
    },
    basalt: {
      scale: [0.7, 1.3], scaleY: [0.6, 2.6], collider: 0.6, sink: 0.2, tilt: 0.12,
      parts: [
        { geo: trunk(0.5, 0.58, 1.0), mat: std(0xffffff), color: rng => C(0.13, 0.11, 0.11).multiplyScalar(0.8 + rng() * 0.5) }
      ]
    },
    deadtree: {
      scale: [0.8, 1.4], collider: 0.35, sink: 0.1, tilt: 0.15,
      parts: [
        {
          geo: (() => {
            const t = trunk(0.08, 0.16, 1.8);
            const b1 = new THREE.CylinderGeometry(0.04, 0.07, 0.9, 5); b1.rotateZ(0.9); b1.translate(-0.32, 1.45, 0);
            const b2 = new THREE.CylinderGeometry(0.035, 0.06, 0.75, 5); b2.rotateZ(-1.0); b2.translate(0.28, 1.1, 0.05);
            const b3 = new THREE.CylinderGeometry(0.03, 0.05, 0.6, 5); b3.rotateX(0.9); b3.translate(0, 1.6, 0.22);
            return mergeGeos([t, b1, b2, b3]);
          })(),
          mat: std(0xffffff), color: rng => C(0.12, 0.09, 0.08).multiplyScalar(0.8 + rng() * 0.4)
        }
      ]
    },
    emberrock: {
      scale: [0.6, 1.3], collider: 0.55, colliderMin: 0.9, sink: 0.2, tilt: 0.3,
      parts: [
        {
          geo: (() => { const g = new THREE.DodecahedronGeometry(0.7, 0); g.scale(1, 0.7, 0.9); g.translate(0, 0.2, 0); return g; })(),
          mat: std(0xffffff), color: rng => C(0.1, 0.08, 0.08).multiplyScalar(0.8 + rng() * 0.4)
        },
        {
          geo: (() => { const g = new THREE.OctahedronGeometry(0.28, 0); g.scale(1, 1.6, 1); g.translate(0.15, 0.62, 0.1); return g; })(),
          mat: basic(), color: rng => C(2.2, 0.6, 0.12).multiplyScalar(0.7 + rng() * 0.4)
        }
      ]
    },
    obsidian: {
      scale: [0.7, 1.5], collider: 0.45, sink: 0.25, tilt: 0.35,
      parts: [
        {
          geo: (() => {
            const a = new THREE.ConeGeometry(0.35, 2.4, 4); a.translate(0, 1.1, 0);
            const b = new THREE.ConeGeometry(0.25, 1.6, 4); b.rotateZ(0.45); b.translate(0.35, 0.65, 0);
            const c = new THREE.ConeGeometry(0.22, 1.3, 4); c.rotateX(-0.5); c.translate(-0.1, 0.55, 0.3);
            return mergeGeos([a, b, c]);
          })(),
          mat: std(0xffffff, { roughness: 0.25, metalness: 0.4 }), color: rng => C(0.09, 0.06, 0.08).multiplyScalar(0.8 + rng() * 0.5)
        }
      ]
    }
  };
}

/* Place `count` copies of a kit on the surface using instancing. Returns the created meshes. */
function scatterKit(level, kit, count) {
  const rng = level.rng;
  const meshes = kit.parts.map(p => {
    const m = new THREE.InstancedMesh(p.geo, p.mat, count);
    m.frustumCulled = false;
    return m;
  });
  const dummy = new THREE.Object3D();
  const dir = new THREE.Vector3(), up = new THREE.Vector3(), fwd = new THREE.Vector3(), t = new THREE.Vector3();
  const mtx = new THREE.Matrix4();
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < count * 12) {
    attempts++;
    Sphere.randomDir(rng, dir);
    const s = lerp(kit.scale[0], kit.scale[1], rng());
    const colR = kit.collider && (!kit.colliderMin || s >= kit.colliderMin) ? kit.collider * s : 0;
    if (!level.isClear(dir, Math.max(colR, 0.5), !!colR)) continue;
    const sy = kit.scaleY ? lerp(kit.scaleY[0], kit.scaleY[1], rng()) : 1;
    Sphere.anyTangent(dir, t);
    Sphere.rotateAround(t, dir, rng() * TAU);
    up.copy(dir).addScaledVector(t, (rng() - 0.5) * kit.tilt).normalize();
    fwd.copy(t).addScaledVector(up, -up.dot(t)).normalize();
    Sphere.orient(dummy, up, fwd);
    const r = level.heightAt(dir) - kit.sink * s;
    dummy.position.copy(dir).multiplyScalar(r);
    dummy.scale.set(s, s * sy, s);
    dummy.updateMatrix();
    mtx.copy(dummy.matrix);
    for (let i = 0; i < meshes.length; i++) {
      meshes[i].setMatrixAt(placed, mtx);
      meshes[i].setColorAt(placed, kit.parts[i].color(rng, level.biome));
    }
    if (colR) level.addCollider(dir, colR);
    placed++;
  }
  for (const m of meshes) {
    m.count = placed;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }
  return meshes;
}
