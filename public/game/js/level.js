'use strict';
/* One moon: builds the world, runs its rules (shards, quests, combat, loot, bosses) and drives the camera. */

const _l1 = new THREE.Vector3(), _l2 = new THREE.Vector3(), _l3 = new THREE.Vector3(), _l4 = new THREE.Vector3();
const _l5 = new THREE.Vector3(), _l6 = new THREE.Vector3();
const CAM_DIST = { near: 0.78, normal: 1, far: 1.3 };

function makeLevelAssets(b) {
  const A = {};
  const sc = b.shardColor;
  A.shardGeo = new THREE.OctahedronGeometry(0.55, 0);
  A.shardGeo.scale(1, 1.6, 1);
  A.shardMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(sc[0], sc[1], sc[2]) });
  A.shardGlowMat = makeGlowMaterial(new THREE.Color(1.2, 0.95, 0.45), 0.9, false);
  A.beamGeo = new THREE.CylinderGeometry(0.14, 0.4, 26, 10, 1, true);
  A.beamGeo.translate(0, 13, 0);
  A.shardBeamMat = makeBeamMaterial(new THREE.Color(1.0, 0.8, 0.35), 0.55);
  A.moteGeo = new THREE.IcosahedronGeometry(0.34, 0);
  A.moteMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.2, 1.6) });
  A.moteGlowMat = makeGlowMaterial(new THREE.Color(1.1, 1.0, 0.7), 0.8, false);
  A.moteBeamMat = makeBeamMaterial(new THREE.Color(0.9, 0.85, 0.6), 0.45);

  A.shadowMat = new THREE.MeshBasicMaterial({ color: 0x07030c });
  A.flashMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.85, 0.8) });
  A.shadowCore = new THREE.SphereGeometry(0.62, 16, 12);
  A.shadowBlob = new THREE.SphereGeometry(0.36, 10, 8);
  A.spikeGeo = new THREE.ConeGeometry(0.14, 0.75, 5);
  A.spikeGeo.translate(0, 0.375, 0);
  A.hornGeo = new THREE.ConeGeometry(0.12, 0.6, 5);
  A.hornGeo.translate(0, 0.3, 0);
  A.spitMouthGeo = new THREE.TorusGeometry(0.16, 0.05, 6, 16);
  A.eyeGeo = new THREE.SphereGeometry(0.1, 10, 8);
  A.eyeViolet = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 0.5, 2.4) });
  A.eyeRed = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.0, 0.35, 0.2) });
  A.eyeTeal = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 2.6, 1.8) });
  A.eyeOrange = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.0, 1.2, 0.2) });
  A.eyeGlowViolet = makeGlowMaterial(new THREE.Color(0.9, 0.2, 0.9), 0.75, false);
  A.eyeGlowRed = makeGlowMaterial(new THREE.Color(1.0, 0.15, 0.1), 0.8, false);
  A.eyeGlowTeal = makeGlowMaterial(new THREE.Color(0.15, 0.9, 0.7), 0.8, false);
  A.eyeGlowOrange = makeGlowMaterial(new THREE.Color(1.0, 0.45, 0.08), 0.8, false);
  A.decalGeo = new THREE.CircleGeometry(1.1, 20);
  A.decalGeo.rotateX(-Math.PI / 2);
  A.decalMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  A.bossDecalGeo = new THREE.CircleGeometry(4.2, 36);
  A.bossDecalGeo.rotateX(-Math.PI / 2);
  A.bossTeleGeo = new THREE.RingGeometry(3.7, 4.5, 48);
  A.bossTeleGeo.rotateX(-Math.PI / 2);

  A.ventGeo = new THREE.CylinderGeometry(1.0, 1.6, 0.7, 9);
  A.ventGeo.translate(0, 0.25, 0);
  A.ventMat = new THREE.MeshStandardMaterial({ color: 0x1a1210, flatShading: true, roughness: 0.9 });
  A.ventCoreGeo = new THREE.CircleGeometry(0.85, 16);
  A.ventCoreGeo.rotateX(-Math.PI / 2);
  A.ventCoreGeo.translate(0, 0.61, 0);
  A.ventRingGeo = new THREE.RingGeometry(2.0, 2.45, 40);
  A.ventRingGeo.rotateX(-Math.PI / 2);
  A.ventRingGeo.translate(0, 0.3, 0);
  A.ventColumnGeo = new THREE.CylinderGeometry(0.9, 1.3, 11, 20, 1, true);
  A.ventColumnGeo.translate(0, 5.5, 0);

  A.stoneMat = new THREE.MeshStandardMaterial({ color: 0x2a2226, flatShading: true, roughness: 0.8 });
  A.pyrePillarGeo = new THREE.CylinderGeometry(0.55, 0.85, 3.4, 6);
  A.pyrePillarGeo.translate(0, 1.7, 0);
  A.pyreBowlGeo = new THREE.CylinderGeometry(1.0, 0.5, 0.55, 8);
  A.pyreBowlGeo.translate(0, 3.6, 0);
  A.pyreCrystalGeo = new THREE.OctahedronGeometry(0.55, 0);
  A.pyreCrystalGeo.scale(1, 1.7, 1);
  A.pyreRingGeo = new THREE.RingGeometry(2.55, 3.1, 64);
  A.pyreRingGeo.rotateX(-Math.PI / 2);
  A.pyreGlowMat = makeGlowMaterial(new THREE.Color(1.5, 0.8, 0.3), 0.9, false);

  A.waveGeo = new THREE.CylinderGeometry(1, 1, 1, 96, 1, true);
  A.bubbleGeo = new THREE.SphereGeometry(1, 32, 20);
  A.arrowGeo = new THREE.ConeGeometry(0.2, 0.62, 8);
  A.arrowGeo.rotateX(Math.PI / 2);
  A.arrowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.4, 0.6), transparent: true, opacity: 0.85 });

  A.markerRingGeo = new THREE.RingGeometry(0.86, 1, 48);
  A.markerRingGeo.rotateX(-Math.PI / 2);
  A.markerDiscGeo = new THREE.CircleGeometry(1, 40);
  A.markerDiscGeo.rotateX(-Math.PI / 2);

  A.projOrbGeo = new THREE.SphereGeometry(0.3, 12, 10);
  A.projShardGeo = new THREE.OctahedronGeometry(0.32, 0);
  A.projShardGeo.scale(0.55, 0.55, 2.0);
  A.projMat = {};
  A.projGlowMat = {};
  for (const k in PROJ_COLORS) {
    const c = PROJ_COLORS[k];
    A.projMat[k] = new THREE.MeshBasicMaterial({ color: new THREE.Color(c[0], c[1], c[2]) });
    A.projGlowMat[k] = makeGlowMaterial(new THREE.Color(c[0] * 0.5, c[1] * 0.5, c[2] * 0.5), 0.85, false);
  }

  A.chestGeo = new THREE.DodecahedronGeometry(0.62, 0);
  A.chestBandGeo = new THREE.TorusGeometry(0.66, 0.06, 6, 24);
  A.chestCrystalGeo = (() => {
    const parts = [];
    const dirs = [[0.5, 0.5, 0.3], [-0.5, 0.4, -0.3], [0.2, 0.7, -0.5], [-0.3, 0.6, 0.5]];
    for (const d of dirs) {
      const g = new THREE.OctahedronGeometry(0.16, 0);
      g.scale(1, 2.2, 1);
      const v = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(AXIS_Y, v);
      g.applyQuaternion(q);
      g.translate(v.x * 0.6, v.y * 0.6, v.z * 0.6);
      parts.push(g);
    }
    return mergeGeos(parts);
  })();
  A.goldMat = new THREE.MeshStandardMaterial({ color: 0xd8a640, metalness: 0.8, roughness: 0.3, emissive: 0x3a2000, flatShading: true });
  A.goldGlowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 1.5, 0.5) });
  A.totemGeo = new THREE.CylinderGeometry(0.5, 0.75, 3.2, 6);
  A.totemGeo.translate(0, 1.6, 0);
  A.totemRuneGeo = new THREE.TorusGeometry(0.66, 0.07, 6, 24);
  A.totemTopGeo = new THREE.OctahedronGeometry(0.45, 0);
  A.totemTopGeo.scale(1, 1.6, 1);
  A.iceGlowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 1.4, 2.2) });
  return A;
}

class Level {
  constructor(game, index, opts) {
    opts = opts || {};
    this.game = game;
    this.index = index;
    this.biome = BIOMES[index];
    this.menu = !!opts.menu;
    const b = this.biome;
    this.R = b.radius;
    this.rng = mulberry32(b.seed);
    this.noise = new Simplex3(mulberry32(b.seed * 31 + 7));
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(b.fog, b.fogDensity);
    this.time = 0;
    this.elapsed = 0;
    this.playing = false;
    this.colliders = [];
    this.reserved = [];
    this.shards = [];
    this.motes = [];
    this.enemies = [];
    this.vents = [];
    this.pyres = [];
    this.waves = [];
    this.respawns = [];
    this.pickups = [];
    this.breakables = [];
    this.projectiles = [];
    this.effects = [];
    this.powerRespawns = [];
    this.matCache = {};
    this.stats = { shards: 0, kills: 0, damage: 0, pyres: 0, chests: 0 };
    this.spawnDir = new THREE.Vector3(0, 1, 0);
    this.sunDir = new THREE.Vector3(-0.55, 0.45, -0.7).normalize();
    this.camFwd = new THREE.Vector3(0, 0, -1);
    this.camUp = new THREE.Vector3(0, 1, 0);
    this.camLook = new THREE.Vector3();
    this.hint = { stage: 0, t: 0 };
    this.heartbeatT = 0;
    this.ambientAcc = 0;
    this.finale = null;
    this.bossWake = 0;
    this.bossTriggerT = 0;
    this.beaconDelay = 0;
    this.bossDefeated = false;
    this.player = null;
    this.boss = null;
    this.beacon = null;
    this.npc = null;
    this.quest = null;
    this.totemsBroken = 0;
    this.coresHeld = 0;
    this.nearNpc = false;

    this.A = makeLevelAssets(b);
    this.kits = makeDecorKits(b);

    const q = game.quality;
    this.fx = new Particles(q.particles, true);
    this.smoke = new Particles(Math.floor(q.particles * 0.6), false);
    this.scene.add(this.fx.points, this.smoke.points);

    this.buildEnvironment();
    this.placeObjectives();
    this.decorate();

    this.pulseFx = new BurstFX(this, new THREE.Color(1.8, 1.0, 0.4), PULSE_RADIUS, 0.45);
    this.novaFx = new BurstFX(this, new THREE.Color(1.2, 1.6, 2.2), 10, 0.6);
    this.waveFx = new BurstFX(this, new THREE.Color(2.2, 0.8, 0.15), 6.5, 0.4);
    this.slamFx = new BurstFX(this, new THREE.Color(2.0, 1.4, 0.5), 3.6, 0.3);
    this.arrow = new THREE.Mesh(this.A.arrowGeo, this.A.arrowMat);
    this.arrow.visible = false;
    this.scene.add(this.arrow);

    if (!this.menu) {
      this.player = new Player(this, opts.loadout);
      this.scene.add(this.player.group);
      const counts = { wisp: b.wisps, stalker: b.stalkers, spitter: b.spitters, brute: b.brutes };
      for (const type in counts) for (let i = 0; i < (counts[type] || 0); i++) this.spawnEnemy(type, null, true, true);
      if (b.boss) {
        const d = this.spawnDir.clone();
        Sphere.slide(d, _l1.set(0, 0, -22), this.R);
        this.boss = new Hush(this, d);
        this.scene.add(this.boss.group);
      }
      this.initQuest();
      if (opts.atBoss && b.bossKey) {
        for (const s of this.shards) { s.collect(); s.group.visible = false; }
        this.stats.shards = this.shards.length;
        this.pendingBoss = true;
        if (opts.questDone && this.quest) {
          this.quest.state = 'done';
          this.npc.free();
          for (const t of this.breakables) if (t.kind === 'totem') { t.broken = true; t.object.visible = false; this.removeCollider(t.collider); }
        }
      }
      this.camLook.copy(this.player.position);
    } else {
      for (let i = 0; i < 3; i++) this.spawnEnemy('wisp', null, true, false);
    }
    this.skyColors = {
      top: this.sky.skyMat.uniforms.top.value.clone(),
      bottom: this.sky.skyMat.uniforms.bottom.value.clone(),
      ambient: this.ambient.color.clone(),
      fog: this.scene.fog.color.clone()
    };
  }

  /* ---------- world building ---------- */
  heightAt(d) {
    const b = this.biome, f = b.freq;
    let n = fbm3(this.noise, d.x * f + 3.1, d.y * f - 1.7, d.z * f + 5.3, 4);
    if (b.shape === 'ridged') {
      const r = fbm3(this.noise, d.x * f * 0.8 - 8.2, d.y * f * 0.8 + 2.6, d.z * f * 0.8 + 1.9, 2);
      n = n * 0.6 + (0.3 - Math.abs(r)) * 1.1;
    }
    return this.R + n * b.amp * 1.5;
  }

  buildEnvironment() {
    const b = this.biome, s = this.scene;
    this.sky = buildSky(this);
    s.add(this.sky.group);
    this.backdrop = buildBackdrop(this, this.sunDir);
    s.add(this.backdrop.group);
    const planet = buildPlanet(this, this.game.quality.detail);
    this.planet = planet.mesh;
    s.add(this.planet);
    this.veins = planet.veins;
    if (this.veins) {
      s.add(this.veins);
      this.veinBase = this.veins.material.color.clone();
    }
    this.ambient = new THREE.AmbientLight(b.ambient[0], b.ambient[1]);
    s.add(this.ambient);
    this.keyLight = new THREE.DirectionalLight(b.keyLight[0], b.keyLight[1]);
    s.add(this.keyLight, this.keyLight.target);
    this.sunLight = new THREE.DirectionalLight(b.sunCol, 0.15 + b.sunGlow * 0.6);
    this.sunLight.position.copy(this.sunDir).multiplyScalar(100);
    s.add(this.sunLight, this.sunLight.target);
    this.beaconLight = new THREE.PointLight(0xbfd8ff, 0, 34, 1.5);
    s.add(this.beaconLight);
    this.flashLight = new THREE.PointLight(0xffc070, 0, 24, 1.5);
    s.add(this.flashLight);
  }

  reserve(dir, rad) { this.reserved.push({ dir: dir.clone(), rad }); }

  addCollider(dir, r) {
    const c = { dir: dir.clone(), r, cosNear: Math.cos(Math.min(Math.PI, (r + 1.5) / this.R)) };
    this.colliders.push(c);
    return c;
  }

  removeCollider(c) {
    const i = this.colliders.indexOf(c);
    if (i >= 0) this.colliders.splice(i, 1);
  }

  arc(a, b) { return Math.acos(clamp(a.dot(b), -1, 1)) * this.R; }

  isClear(dir, radius, againstColliders) {
    for (const r of this.reserved) if (this.arc(dir, r.dir) < r.rad + radius) return false;
    if (againstColliders) for (const c of this.colliders) if (this.arc(dir, c.dir) < c.r + radius + 0.4) return false;
    return true;
  }

  pickDir(accept, clearance) {
    const d = new THREE.Vector3();
    let clr = clearance;
    for (let i = 0; i < 700; i++) {
      if (i > 0 && i % 60 === 0) clr *= 0.85;
      Sphere.randomDir(this.rng, d);
      if (accept && !accept(d)) continue;
      let ok = true;
      for (const r of this.reserved) {
        if (this.arc(d, r.dir) < clr + r.rad) { ok = false; break; }
      }
      if (ok) return d;
    }
    return d;
  }

  // A random free spot (not seeded), away from the player.
  pickFree(minFromPlayer) {
    const P = this.player;
    const d = new THREE.Vector3();
    for (let i = 0; i < 120; i++) {
      Sphere.randomDir(Math.random, d);
      if (P && this.arc(d, P.dir) < minFromPlayer) continue;
      if (this.isClear(d, 1.2, true)) break;
    }
    return d;
  }

  placeObjectives() {
    const b = this.biome, A = this.A;
    this.reserve(this.spawnDir, 6);
    if (!this.menu && QUESTS[b.key]) {
      this.npcDir = this.spawnDir.clone();
      Sphere.slide(this.npcDir, _l1.set(3.2, 0, -7.5), this.R);
      this.reserve(this.npcDir, 2.5);
    }
    if (b.boss) {
      for (let i = 0; i < b.pyres; i++) {
        const d = this.pickDir(dd => Sphere.angle(dd, this.spawnDir) > 0.5, 20);
        this.reserve(d, 5);
        const p = new Pyre(this, d, this.A);
        this.pyres.push(p);
        this.scene.add(p.group);
        this.addCollider(d, 0.85);
      }
      for (let i = 0; i < b.motes; i++) {
        const d = this.pickDir(null, 7);
        this.reserve(d, 1.5);
        this.addMote(d);
      }
    } else {
      this.beaconDir = this.pickDir(d => { const a = Sphere.angle(d, this.spawnDir); return a > 1.7 && a < 2.6; }, 4);
      this.reserve(this.beaconDir, 5);
      this.beacon = new Beacon(this, this.beaconDir);
      this.scene.add(this.beacon.group);
      const spacing = Math.sqrt(4 * Math.PI * this.R * this.R / b.shards) * 0.55;
      for (let i = 0; i < b.shards; i++) {
        let d;
        if (i === 0) {
          d = this.spawnDir.clone();
          Sphere.slide(d, _l1.set(0, 0, -12), this.R);
        } else {
          d = this.pickDir(dd => this.arc(dd, this.spawnDir) > 10, spacing);
        }
        this.reserve(d, 2.5);
        const s = new Shard(this, d, A);
        this.shards.push(s);
        this.scene.add(s.group);
      }
      for (let i = 0; i < (b.vents || 0); i++) {
        const d = this.pickDir(dd => this.arc(dd, this.spawnDir) > 14, 8);
        this.reserve(d, 3.5);
        const v = new Vent(this, d, A);
        this.vents.push(v);
        this.scene.add(v.group);
      }
    }
    if (!this.menu) {
      for (let i = 0; i < (b.totems || 0); i++) {
        const d = this.pickDir(dd => this.arc(dd, this.spawnDir) > 16, 16);
        this.reserve(d, 2.5);
        this.addBreakable('totem', d);
      }
    }
    for (let i = 0; i < (b.chests || 0); i++) {
      const d = this.pickDir(dd => this.arc(dd, this.spawnDir) > 9, 9);
      this.reserve(d, 2);
      this.addBreakable('chest', d);
    }
    for (let i = 0; i < (b.powerups || 0); i++) {
      const d = this.pickDir(dd => this.arc(dd, this.spawnDir) > 8, 9);
      this.reserve(d, 1.5);
      this.addPickup(POWER_KINDS[Math.floor(this.rng() * POWER_KINDS.length)], d, { spot: true });
    }
  }

  decorate() {
    for (const [type, count] of this.biome.decor) {
      const kit = this.kits[type];
      if (!kit) continue;
      for (const m of scatterKit(this, kit, count)) this.scene.add(m);
    }
  }

  /* ---------- object factories ---------- */
  iconMaterial(kind) {
    const key = 'icon:' + kind;
    if (!this.matCache[key]) this.matCache[key] = new THREE.SpriteMaterial({ map: iconTexture(kind), transparent: true, depthWrite: false });
    return this.matCache[key];
  }

  glowMaterial(kind) {
    const key = 'glow:' + kind;
    if (!this.matCache[key]) {
      const g = ITEM_DEFS[kind].glow;
      this.matCache[key] = makeGlowMaterial(new THREE.Color(g[0] * 0.55, g[1] * 0.55, g[2] * 0.55), 0.75, false);
    }
    return this.matCache[key];
  }

  beamMaterial(kind) {
    const key = 'beam:' + kind;
    if (!this.matCache[key]) {
      const g = ITEM_DEFS[kind].glow;
      this.matCache[key] = makeBeamMaterial(new THREE.Color(g[0] * 0.5, g[1] * 0.5, g[2] * 0.5), 0.5);
    }
    return this.matCache[key];
  }

  addMote(dir) {
    const m = new Shard(this, dir, this.A, 'mote');
    m.respawnT = 0;
    this.motes.push(m);
    this.scene.add(m.group);
    return m;
  }

  addPickup(kind, dir, opts) {
    const p = new Pickup(this, kind, dir, opts);
    this.pickups.push(p);
    this.scene.add(p.object);
    return p;
  }

  addBreakable(kind, dir) {
    const b = new Breakable(this, kind, dir);
    this.breakables.push(b);
    this.scene.add(b.object);
    return b;
  }

  addEffect(e) {
    this.effects.push(e);
    this.scene.add(e.object);
    return e;
  }

  addMarker(dir, radius, time, color, onTrigger) {
    return this.addEffect(new GroundMarker(this, dir, radius, time, color, onTrigger));
  }

  spawnProjectile(o) {
    const p = new Projectile(this, o);
    this.projectiles.push(p);
    this.scene.add(p.object);
    return p;
  }

  spawnLob(fromPos, dir, flight, dmg, radius, pool) {
    const p = new Lob(this, fromPos, dir, flight, dmg, radius, pool);
    this.projectiles.push(p);
    this.scene.add(p.object);
    return p;
  }

  spawnShockwave(dir, opts) {
    const w = new Shockwave(this, dir, this.A, opts);
    this.waves.push(w);
    this.scene.add(w.mesh);
  }

  spawnEnemy(type, dir, instant, base) {
    if (!dir) {
      const P = this.player;
      dir = new THREE.Vector3();
      for (let i = 0; i < 120; i++) {
        Sphere.randomDir(Math.random, dir);
        if (P && Sphere.angle(dir, P.dir) < 1.25) continue;
        if (!P && Sphere.angle(dir, this.spawnDir) < 0.3) continue;
        break;
      }
    }
    const e = new Shadow(this, dir, type, this.A, instant);
    e.base = !!base;
    this.enemies.push(e);
    this.scene.add(e.group);
    return e;
  }

  aliveEnemies() {
    let n = 0;
    for (const e of this.enemies) if (e.alive) n++;
    return n;
  }

  /* ---------- combat ---------- */
  damage(target, dmg, fromPos, opts) {
    opts = opts || {};
    const dealt = target.takeHit(dmg, fromPos, opts);
    if (dealt > 0) {
      const cls = opts.source === 'burn' ? 'burn' : (opts.crit ? 'crit' : 'dmg');
      this.game.ui.floatText(target.position, String(Math.max(1, Math.round(dealt))), cls);
      if (opts.source !== 'burn' && this.player) this.player.addCombo();
    }
    return dealt;
  }

  meleeHit(pos, fwd, up, range, arcCos, dmg, opts) {
    let hits = 0;
    const exclude = opts.exclude;
    const test = (tpos, radius) => {
      _l5.subVectors(tpos, pos);
      if (_l5.length() > range + radius) return false;
      if (arcCos <= -1) return true;
      _l5.addScaledVector(up, -up.dot(_l5));
      const l = _l5.length();
      if (l < radius + 0.3) return true;
      return _l5.dot(fwd) / l >= arcCos;
    };
    for (const e of this.enemies) {
      if (!e.alive || e.state === 'spawn' || (exclude && exclude.has(e))) continue;
      if (test(e.position, e.radius)) { if (exclude) exclude.add(e); this.damage(e, dmg, pos, opts); hits++; }
    }
    const B = this.boss;
    if (B && B.targetable() && !(exclude && exclude.has(B)) && test(B.position, B.radius)) {
      if (exclude) exclude.add(B);
      this.damage(B, dmg, pos, opts);
      hits++;
    }
    for (const b of this.breakables) {
      if (b.broken || (exclude && exclude.has(b))) continue;
      if (test(b.worldPos, b.radius)) { if (exclude) exclude.add(b); this.damage(b, dmg, pos, opts); hits++; }
    }
    for (const p of this.projectiles) {
      if (!p.dead && p.parryable && test(p.position, 0.6)) p.destroy(true);
    }
    return hits;
  }

  aoeHit(center, radius, dmg, opts) {
    let hits = 0;
    for (const e of this.enemies) {
      if (e.alive && e.position.distanceTo(center) < radius + e.radius) { this.damage(e, dmg, center, opts); hits++; }
    }
    const B = this.boss;
    if (B && B.targetable() && B.position.distanceTo(center) < radius + B.radius) { this.damage(B, dmg, center, opts); hits++; }
    for (const b of this.breakables) {
      if (!b.broken && b.worldPos.distanceTo(center) < radius + b.radius) { this.damage(b, dmg, center, opts); hits++; }
    }
    return hits;
  }

  killEnemy(e, noRespawn) {
    if (!e.alive) return;
    e.kill();
    this.scene.remove(e.group);
    this.stats.kills++;
    this.game.audio.sfx('kill', 0.9);
    if (noRespawn) return;
    if (this.player) this.player.gainLight(4);
    if (e.base) this.respawns.push({ t: rand(5, 8), type: e.type });
    this.questProgress('kill', 1);
    this.dropFromEnemy(e);
  }

  dropFromEnemy(e) {
    const r = Math.random();
    const needCores = this.biome.key === 'cinder' && this.coresHeld + this.pickups.filter(p => p.kind === 'core' && !p.collected).length < 3 && (!this.quest || this.quest.state !== 'done');
    if (needCores && (e.type === 'brute' || (e.type === 'stalker' && r < 0.3))) {
      this.addPickup('core', e.dir, { hop: true, scatter: true });
      return;
    }
    if (r < 0.05) this.addPickup('flask', e.dir, { hop: true, scatter: true, life: 20 });
    else if (r < 0.08) this.addPickup('bomb', e.dir, { hop: true, scatter: true, life: 20 });
    else if (r < 0.12) this.addPickup(POWER_KINDS[Math.floor(Math.random() * POWER_KINDS.length)], e.dir, { hop: true, scatter: true, life: 20 });
  }

  firePulse() {
    const P = this.player, game = this.game;
    this.pulseFx.fire(P.position, P.dir, P.groundR);
    this.flashLight.position.copy(P.position);
    this.flashLight.intensity = 1.6;
    game.audio.sfx('pulse');
    game.shake(0.18);
    const hits = this.aoeHit(P.position, PULSE_RADIUS, 30 * (P.buffs.fury > 0 ? 2 : 1), { knock: 16 });
    for (const p of this.projectiles) if (!p.dead && p.parryable && p.position.distanceTo(P.position) < PULSE_RADIUS + 1) p.destroy(true);
    if (hits >= 3) game.ui.toast(hits + '× PURGE!', 1.3);
    const n = Math.round(46 * game.quality.fx);
    Sphere.anyTangent(P.dir, _l2);
    for (let i = 0; i < n; i++) {
      _l1.copy(_l2);
      Sphere.rotateAround(_l1, P.dir, (i / n) * TAU);
      const s = rand(13, 17);
      this.fx.spawn(P.position.x, P.position.y, P.position.z, _l1.x * s, _l1.y * s, _l1.z * s, 2.0, 1.1, 0.35, 0.45, 0.5, 3, 0, 0.2);
    }
  }

  novaBlast(P) {
    const game = this.game;
    this.novaFx.fire(P.position, P.dir, P.groundR);
    this.flashLight.position.copy(P.position);
    this.flashLight.intensity = 3;
    game.audio.sfx('nova');
    game.shake(0.7);
    game.ui.flash(0.35);
    this.aoeHit(P.position, 10, 70 * (P.buffs.fury > 0 ? 2 : 1), { knock: 22, crit: true });
    for (const p of this.projectiles) if (!p.dead && p.parryable && p.position.distanceTo(P.position) < 13) p.destroy(true);
    this.fx.burst(P.position, Math.round(120 * game.quality.fx), 16, 1.4, 1.8, 2.4, 0.5, 1.0, { drag: 2 });
  }

  flameWave(P) {
    const game = this.game;
    this.waveFx.fire(P.position, P.dir, P.groundR);
    game.audio.sfx('wave');
    this.aoeHit(P.position, 6.5, 15 * (P.buffs.fury > 0 ? 2 : 1), { knock: 9, burn: P.weapon >= 3 });
  }

  resolveCollisions(dir, radius) {
    for (const c of this.colliders) {
      const d = dir.dot(c.dir);
      if (d < c.cosNear) continue;
      const arc = Math.acos(clamp(d, -1, 1)) * this.R;
      const min = c.r + radius;
      if (arc < min) {
        Sphere.tangentToward(dir, c.dir, _l1);
        if (_l1.lengthSq() === 0) Sphere.anyTangent(dir, _l1);
        _l1.multiplyScalar(-(min - arc));
        Sphere.slide(dir, _l1, this.R);
      }
    }
  }

  /* ---------- quests ---------- */
  initQuest() {
    const def = QUESTS[this.biome.key];
    if (!def || !this.npcDir) return;
    this.quest = { def, state: 'available', progress: 0 };
    this.npc = new NPC(this, def, this.npcDir);
    this.scene.add(this.npc.object);
  }

  questProgress(type, n) {
    const q = this.quest;
    if (!q || q.state !== 'active' || !q.def.task || q.def.task.type !== type) return;
    const goal = q.def.task.goal;
    if (type === 'kill') q.progress = Math.min(goal, q.progress + n);
    else if (type === 'totems') q.progress = Math.min(goal, this.totemsBroken);
    else if (type === 'cores') q.progress = Math.min(goal, this.coresHeld);
    if (q.progress >= goal) {
      q.state = 'ready';
      this.game.ui.toast('Quest complete — return to ' + q.def.npc.short, 2.4);
      this.game.audio.sfx('questReady');
    }
  }

  talk() {
    const q = this.quest, def = q.def;
    let lines, after = null;
    if (q.state === 'available') {
      lines = def.intro.concat(def.taskLines || []);
      after = () => this.acceptQuest();
    } else if (q.state === 'active') {
      lines = [def.progressLine];
    } else if (q.state === 'ready') {
      lines = def.doneLines;
      after = () => this.completeQuest();
    } else {
      lines = [def.idleLine];
    }
    this.game.openDialog(def.npc, lines.map(touchText), after);
  }

  acceptQuest() {
    const q = this.quest, def = q.def, P = this.player, ui = this.game.ui;
    if (def.gives === 'weapon' && P.weapon < 1) {
      P.setWeapon(1);
      ui.toast('You obtained the SUNBLADE!', 2.6);
      this.game.audio.sfx('questDone');
      this.hint.stage = 20;
      this.hint.t = 0;
    }
    if (!def.task) {
      this.giveReward(def.reward);
      q.state = 'done';
      return;
    }
    q.state = 'active';
    q.progress = 0;
    if (def.task.type === 'totems') q.progress = this.totemsBroken;
    if (def.task.type === 'cores') q.progress = this.coresHeld;
    this.questProgress(def.task.type, 0);
    if (q.state === 'active') ui.toast('New quest: ' + def.task.title, 2.2);
  }

  completeQuest() {
    const q = this.quest;
    this.giveReward(q.def.reward);
    q.state = 'done';
    if (this.npc) this.npc.free();
    this.game.ui.toast('Quest complete: ' + q.def.task.title, 2.4);
    this.game.audio.sfx('questDone');
  }

  giveReward(r) {
    const P = this.player, ui = this.game.ui;
    if (!r) return;
    if (r.flask) P.items.flask = Math.min(MAX_ITEMS, P.items.flask + r.flask);
    if (r.bomb) P.items.bomb = Math.min(MAX_ITEMS, P.items.bomb + r.bomb);
    if (r.maxLight) { P.maxLight += r.maxLight; P.gainLight(r.maxLight); ui.floatText(P.position, 'MAX LIGHT +' + r.maxLight, 'heal'); }
    if (r.weapon && r.weapon > P.weapon) { P.setWeapon(r.weapon); ui.floatText(P.position, 'SUNBLADE LV ' + r.weapon, 'crit'); }
    this.fx.burst(P.position, 50, 6, 2.0, 1.6, 0.6, 0.4, 1.0, { drag: 2, up: P.dir, upSpeed: 3 });
  }

  questText() {
    const q = this.quest;
    if (!q || q.state === 'done') return null;
    const def = q.def;
    if (q.state === 'available') return { mark: '!', text: def.npc.short + ' wants to talk' };
    if (q.state === 'ready') return { mark: '?', text: def.task.title + ': return to ' + def.npc.short };
    return { mark: '◇', text: def.task.title + ': ' + q.progress + ' / ' + def.task.goal };
  }

  /* ---------- loot ---------- */
  collectPickup(p) {
    const P = this.player, game = this.game, k = p.kind, def = ITEM_DEFS[k];
    if (def.power) {
      P.addBuff(k);
      game.ui.toast(def.label.toUpperCase() + '!  ' + def.desc, 1.8);
      game.audio.sfx('powerup');
      if (p.respawnSpot) this.powerRespawns.push({ t: 30 });
    } else if (k === 'flask' || k === 'bomb') {
      if (P.items[k] >= MAX_ITEMS) return false;
      P.items[k]++;
      game.ui.floatText(p.position, '+1 ' + def.label, 'item');
      game.audio.sfx('item');
    } else if (k === 'core') {
      this.coresHeld++;
      game.ui.floatText(p.position, 'Magma Core ' + Math.min(3, this.coresHeld) + '/3', 'item');
      game.audio.sfx('item');
      this.questProgress('cores', 1);
    } else if (k === 'orb') {
      P.gainLight(p.amount || 8);
      game.audio.sfx('mote');
    }
    p.collected = true;
    this.scene.remove(p.object);
    const g = def.glow;
    this.fx.burst(p.position, 18, 4, g[0], g[1], g[2], 0.3, 0.6, { drag: 2.5 });
    return true;
  }

  onBreakableBroken(b) {
    if (b.kind === 'totem') {
      this.totemsBroken++;
      this.game.ui.toast('Frost Totem shattered (' + this.totemsBroken + ' / 3)', 1.8);
      this.questProgress('totems', 1);
      return;
    }
    this.stats.chests++;
    const r = Math.random();
    let kind;
    if (r < 0.45) kind = POWER_KINDS[Math.floor(Math.random() * POWER_KINDS.length)];
    else if (r < 0.72) kind = 'flask';
    else if (r < 0.88) kind = 'bomb';
    if (kind) this.addPickup(kind, b.dir, { hop: true, scatter: true });
    const orbs = kind ? 2 : 5;
    for (let i = 0; i < orbs; i++) this.addPickup('orb', b.dir, { hop: true, scatter: true, life: 18, amount: 6 });
  }

  /* ---------- bosses ---------- */
  startBossFight() {
    if (this.boss || this.menu) return;
    const P = this.player;
    const d = P.dir.clone();
    Sphere.slide(d, _l1.copy(P.fwd).multiplyScalar(13), this.R);
    this.boss = makeBoss(this.biome.bossKey, this, d);
    this.scene.add(this.boss.group);
    this.boss.emerge();
    this.game.onBossStart(this.boss);
  }

  onBossDefeated(boss) {
    const P = this.player, game = this.game;
    this.bossDefeated = true;
    game.onBossDefeated(boss);
    if (P) P.gainLight(30);
    for (let i = 0; i < 6; i++) this.addPickup('orb', boss.dir, { hop: true, scatter: true, life: 20, amount: 8 });
    this.addPickup(POWER_KINDS[Math.floor(Math.random() * POWER_KINDS.length)], boss.dir, { hop: true, scatter: true });
    for (const e of this.enemies) if (e.alive && !e.base) this.killEnemy(e, true);
    this.beaconDelay = 1.6;
  }

  onIntroDone() {
    if (this.boss && this.biome.boss) this.bossWake = 1.6;
    if (this.pendingBoss) { this.pendingBoss = false; this.bossTriggerT = 0.8; }
  }

  onPyreLit(pyre) {
    const game = this.game, P = this.player;
    this.stats.pyres++;
    const lit = this.pyres.filter(p => p.lit).length;
    P.gainLight(30);
    game.audio.sfx('pyreLit');
    game.shake(0.5);
    this.fx.burst(pyre.topPos, 60, 9, 2.2, 1.3, 0.4, 0.5, 1.0, { drag: 2 });
    if (this.veins) this.veins.material.color.copy(this.veinBase).multiplyScalar(1 + lit * 0.35);
    game.ui.bumpObjective();
    if (this.boss && !this.boss.dead) this.boss.onPyreLit();
    if (lit < this.pyres.length) game.ui.hint('A Pyre blazes (' + lit + ' / ' + this.pyres.length + ') — <b>strike the Hush while its shield is down!</b>', 4);
  }

  /* ---------- per-frame rules ---------- */
  update(dt, mode) {
    const game = this.game, P = this.player;
    const play = mode === 'play';
    this.time += dt;
    this.playing = play;

    if (P && (play || mode === 'intro' || mode === 'ascend' || mode === 'dying' || mode === 'finale')) {
      P.update(dt, play ? game.input : null);
      P.fwd.addScaledVector(P.dir, -P.dir.dot(P.fwd)).normalize();
    }
    if (P && play) {
      this.elapsed += dt;
      if (P.buffs.radiance <= 0) P.lightLevel -= this.biome.drain * game.diff.drain * dt;
      if (P.lightLevel <= 0) {
        P.lightLevel = 0;
        P.die();
        game.onPlayerDying();
      }
      this.updateHints(dt);
      if (P.light01 < 0.25 && !P.dead) {
        this.heartbeatT -= dt;
        if (this.heartbeatT <= 0) { this.heartbeatT = 0.6 + P.light01 * 2.5; game.audio.sfx('heartbeat', 0.8); }
      }
    }

    // NPC & talking
    if (this.npc) {
      this.npc.update(dt);
      const q = this.quest;
      this.npc.setMark(q.state === 'available' ? '!' : (q.state === 'ready' ? '?' : (q.state === 'active' ? '…' : null)));
      const near = play && P && P.canBeTargeted() && this.npc.near(P);
      if (near !== this.nearNpc) {
        this.nearNpc = near;
        game.ui.prompt(near ? 'Talk to ' + q.def.npc.short : null);
      }
      if (near && game.input.pressed('interact')) {
        game.ui.prompt(null);
        this.nearNpc = false;
        this.talk();
        return;
      }
    }

    // shadows
    for (const e of this.enemies) if (e.alive) e.update(dt);
    this.separateEnemies();
    if (this.enemies.some(e => !e.alive)) this.enemies = this.enemies.filter(e => e.alive);
    if (play) {
      for (const r of this.respawns) r.t -= dt;
      const due = this.respawns.filter(r => r.t <= 0);
      if (due.length) {
        this.respawns = this.respawns.filter(r => r.t > 0);
        for (const r of due) this.spawnEnemy(r.type, null, false, true);
      }
      for (const r of this.powerRespawns) r.t -= dt;
      if (this.powerRespawns.some(r => r.t <= 0)) {
        this.powerRespawns = this.powerRespawns.filter(r => {
          if (r.t > 0) return true;
          this.addPickup(POWER_KINDS[Math.floor(Math.random() * POWER_KINDS.length)], this.pickFree(15), { spot: true });
          return false;
        });
      }
    }

    // shards & motes
    for (const s of this.shards) {
      s.update(dt, this.time);
      if (play && !s.collected && P.canBeTargeted() && P.position.distanceTo(s.worldPos) < 1.9) this.collectShard(s);
    }
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      m.update(dt, this.time);
      if (m.collected) {
        m.respawnT -= dt;
        if (m.respawnT <= 0 && play) {
          this.scene.remove(m.group);
          this.motes[i] = this.addMote(this.pickFree(10));
          this.motes.pop();
        }
      } else if (play && P.canBeTargeted() && P.position.distanceTo(m.worldPos) < 1.7) {
        m.collect();
        m.respawnT = 9;
        P.gainLight(15);
        game.audio.sfx('mote');
        this.fx.burst(m.worldPos, 16, 4, 2.0, 1.9, 1.3, 0.3, 0.6, { drag: 2.5 });
      }
    }

    // pickups
    if (this.pickups.length) {
      let removed = false;
      for (const p of this.pickups) {
        if (p.collected) continue;
        if (p.update(dt)) { p.collected = true; this.scene.remove(p.object); removed = true; continue; }
        if (play && P.canBeTargeted() && P.position.distanceTo(p.position) < 1.8) {
          if (this.collectPickup(p)) removed = true;
        }
      }
      if (removed) this.pickups = this.pickups.filter(p => !p.collected);
    }
    for (const b of this.breakables) b.update(dt);

    // projectiles & effects
    if (this.projectiles.length) {
      for (const p of this.projectiles) if (!p.dead) p.update(dt);
      if (this.projectiles.some(p => p.dead)) {
        this.projectiles = this.projectiles.filter(p => {
          if (!p.dead) return true;
          this.scene.remove(p.object);
          return false;
        });
      }
    }
    if (this.effects.length) {
      this.effects = this.effects.filter(e => {
        if (!e.update(dt)) return true;
        this.scene.remove(e.object);
        if (e.dispose) e.dispose();
        return false;
      });
    }

    if (this.beacon) {
      this.beacon.update(dt);
      if (this.beaconDelay > 0 && play) {
        this.beaconDelay -= dt;
        if (this.beaconDelay <= 0) this.activateBeacon();
      }
      if (this.beacon.active) {
        this.beaconLight.intensity = Math.min(2.2, this.beaconLight.intensity + dt * 2);
        if (play && P.canBeTargeted() && this.arc(this.beacon.dir, P.dir) < 2.3) game.onReachBeacon();
      }
    }
    for (const v of this.vents) v.update(dt);
    for (const p of this.pyres) p.update(dt);
    if (this.bossTriggerT > 0 && play) {
      this.bossTriggerT -= dt;
      if (this.bossTriggerT <= 0) this.startBossFight();
    }
    if (this.boss) {
      if (this.bossWake > 0 && play) {
        this.bossWake -= dt;
        if (this.bossWake <= 0) {
          this.boss.emerge();
          game.onBossStart(this.boss);
        }
      }
      this.boss.update(dt);
    }
    if (this.waves.length) {
      for (const w of this.waves) w.update(dt);
      const done = this.waves.filter(w => w.done);
      if (done.length) {
        for (const w of done) { this.scene.remove(w.mesh); w.mat.dispose(); }
        this.waves = this.waves.filter(w => !w.done);
      }
    }
    this.pulseFx.update(dt);
    this.novaFx.update(dt);
    this.waveFx.update(dt);
    this.slamFx.update(dt);
    this.flashLight.intensity = Math.max(0, this.flashLight.intensity - dt * 4);
    if (this.finale) this.updateFinale(dt);

    this.updateArrow(play);
    this.emitAmbient(dt);
    this.fx.update(dt);
    this.smoke.update(dt);

    const cam = game.camera;
    this.sky.group.position.copy(cam.position);
    this.backdrop.group.position.copy(cam.position);
    this.sky.skyMat.uniforms.time.value = this.time;
    this.sky.starMat.uniforms.time.value = this.time;
    const focus = P ? P.position : _l1.copy(cam.position).normalize().multiplyScalar(this.R);
    this.keyLight.position.copy(cam.position).addScaledVector(cam.up, 25);
    this.keyLight.target.position.copy(focus);
    if (this.backdrop.sunGlow) this.backdrop.sunGlow.material.opacity = (0.25 + this.biome.sunGlow * 0.9) * (0.92 + Math.sin(this.time * 0.7) * 0.08);
    const ps = game.particleScale;
    this.fx.material.uniforms.uScale.value = ps;
    this.smoke.material.uniforms.uScale.value = ps;
  }

  separateEnemies() {
    const E = this.enemies;
    for (let i = 0; i < E.length; i++) {
      const a = E[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < E.length; j++) {
        const b = E[j];
        if (!b.alive) continue;
        const d = a.position.distanceTo(b.position);
        const min = (a.radius + b.radius) * 1.05;
        if (d < min && d > 1e-4) {
          const push = (min - d) * 0.5;
          Sphere.tangentToward(a.dir, b.dir, _l1);
          Sphere.slide(a.dir, _l1.multiplyScalar(-push), this.R, a.fwd);
          Sphere.tangentToward(b.dir, a.dir, _l1);
          Sphere.slide(b.dir, _l1.multiplyScalar(-push), this.R, b.fwd);
          a.fwd.normalize(); b.fwd.normalize();
        }
      }
    }
  }

  collectShard(s) {
    const game = this.game, P = this.player;
    s.collect();
    this.stats.shards++;
    P.gainLight(20);
    game.audio.sfx('shard');
    this.fx.burst(s.worldPos, 34, 6, 2.0, 1.6, 0.7, 0.4, 0.8, { drag: 2.5 });
    game.ui.bumpObjective();
    const left = this.shards.filter(x => !x.collected).length;
    if (left === 0) {
      if (this.biome.bossKey && !this.bossDefeated) {
        this.bossTriggerT = 1.4;
        game.ui.toast('The ground trembles...', 1.8);
        game.shake(0.6);
        game.audio.sfx('roar', 0.6);
      } else this.activateBeacon();
    } else if (left === 1) game.ui.toast('One shard remains', 1.8);
  }

  activateBeacon() {
    if (!this.beacon || this.beacon.active) return;
    this.beacon.activate();
    this.beaconLight.position.copy(this.beacon.dir).multiplyScalar(this.beacon.R + 3);
    this.game.audio.sfx('beacon');
    this.game.ui.toast('The Skyward Beacon has opened — follow the light!', 3);
  }

  objectiveText() {
    const b = this.biome;
    const B = this.boss;
    if (b.boss) {
      const lit = this.pyres.filter(p => p.lit).length;
      if (lit >= this.pyres.length) return 'Destroy the Hush';
      return lit + ' / ' + this.pyres.length + ' Pyres kindled';
    }
    if (B && !this.bossDefeated) return 'Defeat ' + B.name;
    if (this.beacon && this.beacon.active) return 'Reach the Skyward Beacon';
    if (this.bossTriggerT > 0) return 'Something is coming...';
    return this.stats.shards + ' / ' + this.shards.length + ' Lumen Shards';
  }

  // The thing Ember should head toward next.
  currentTarget() {
    const P = this.player;
    if (!P) return null;
    if (this.npc && P.weapon < 1 && this.quest && this.quest.state === 'available') return this.npc.dir;
    if (this.quest && this.quest.state === 'ready') return this.npc.dir;
    if (this.boss && !this.bossDefeated && this.boss.state !== 'dormant' && !this.biome.boss) return this.boss.dir;
    if (this.beacon && this.beacon.active) return this.beacon.dir;
    let best = null, bestA = 1e9;
    let list = this.biome.boss ? this.pyres.filter(p => !p.lit) : this.shards.filter(s => !s.collected);
    if (this.biome.boss && !list.length && this.boss) return this.boss.dir;
    for (const o of list) {
      const a = P.dir.dot(o.dir);
      if (-a < bestA) { bestA = -a; best = o.dir; }
    }
    return best;
  }

  updateArrow(play) {
    const P = this.player;
    const target = play && P && P.canBeTargeted() ? this.currentTarget() : null;
    if (!target || this.arc(P.dir, target) < 6) { this.arrow.visible = false; return; }
    Sphere.tangentToward(P.dir, target, _l1);
    if (_l1.lengthSq() === 0) { this.arrow.visible = false; return; }
    this.arrow.visible = true;
    const bob = Math.sin(this.time * 4) * 0.12;
    this.arrow.position.copy(P.position).addScaledVector(_l1, 1.45 + bob).addScaledVector(P.dir, -0.25);
    Sphere.orient(this.arrow, P.dir, _l1);
  }

  updateHints(dt) {
    const h = this.hint, ui = this.game.ui, P = this.player;
    const T = IS_TOUCH;
    const talk = T ? 'tap <b>Talk</b>' : 'press <kbd>F</kbd>';
    h.t += dt;
    if (this.index === 0) {
      if (h.stage === 0 && h.t > 0.4) {
        ui.hint(T ? 'Drag the <b>left side</b> of the screen to move and turn' : '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or <kbd>Arrows</kbd> to move and turn', 5);
        h.stage = 1; h.t = 0;
      } else if (h.stage === 1 && h.t > 5.2 && P.weapon < 1) { ui.hint('Someone is waving at you! Walk up to <b>Bram</b> and ' + talk, 7); h.stage = 2; h.t = 0; }
      else if (h.stage === 2 && h.t > 12 && P.weapon < 1) { ui.hint('Follow the golden arrow to <b>Bram</b> and ' + talk, 6); h.t = 0; }
      else if (h.stage === 20 && h.t > 0.5) {
        ui.hint(T ? 'Tap the <b>sword</b> to strike — hold it to chain a <b>combo</b>' : '<kbd>Left Click</kbd>/<kbd>J</kbd> strike &nbsp;·&nbsp; 3 strikes in a row = <b>finisher</b>', 6.5);
        h.stage = 21; h.t = 0;
      } else if (h.stage === 21 && h.t > 7) {
        ui.hint(T ? '<b>Jump</b> then strike = <b>Meteor Slam</b> &nbsp;·&nbsp; <b>Dash</b> then strike = <b>Dash Strike</b>' : '<kbd>Space</kbd> + strike = <b>Meteor Slam</b> &nbsp;·&nbsp; <kbd>Shift</kbd> + strike = <b>Dash Strike</b>', 6.5);
        h.stage = 22; h.t = 0;
      } else if (h.stage === 22 && h.t > 7) {
        ui.hint(T ? '<b>Pulse</b> blasts everything around you — it costs light' : '<kbd>E</kbd>/<kbd>Right Click</kbd> <b>Light Pulse</b> — blasts everything around you, costs light', 6);
        h.stage = 23; h.t = 0;
      } else if (h.stage === 23 && h.t > 7) {
        ui.hint(T ? 'Smash glowing <b>Star Caches</b> for items &amp; power-ups · tap the flask or bomb to use them' : 'Smash glowing <b>Star Caches</b> for items &amp; power-ups &nbsp;·&nbsp; <kbd>1</kbd> Flask &nbsp;<kbd>2</kbd> Bomb', 6.5);
        h.stage = 24; h.t = 0;
      } else if (h.stage === 24 && h.t > 7) { ui.hint('Gather the golden <b>Lumen Shards</b> — your light slowly fades', 5.5); h.stage = 25; }
    } else if (h.stage === 0 && h.t > 0.6) {
      const msg = {
        frost: 'The ice is slippery — you keep sliding, so steer early!',
        cinder: 'Vents glow orange before they erupt. Keep your distance!',
        sun: T ? 'Talk to the <b>Echo</b>, then kindle the <b>Pyres</b> &nbsp;·&nbsp; <b>Jump</b> over shockwaves'
          : 'Talk to the <b>Echo</b> (<kbd>F</kbd>), then kindle the <b>Pyres</b> &nbsp;·&nbsp; <kbd>Space</kbd> to jump shockwaves'
      }[this.biome.key];
      if (msg) ui.hint(msg, 6.5);
      h.stage = 1;
      h.t = 0;
    } else if (h.stage === 1 && h.t > 8 && this.quest && this.quest.state === 'available' && this.biome.key !== 'sun') {
      ui.hint('<b>' + this.quest.def.npc.short + '</b> needs your help — find the <b>!</b> and ' + talk, 5.5);
      h.stage = 2;
    }
  }

  emitAmbient(dt) {
    const kind = this.biome.ambientFx;
    const game = this.game;
    const rate = { fireflies: 9, snow: 45, ash: 16, embers: 22 }[kind] || 0;
    this.ambientAcc += dt * rate * game.quality.fx;
    const P = this.player;
    const center = P ? _l3.copy(P.dir) : _l3.copy(game.camera.position).normalize();
    while (this.ambientAcc >= 1) {
      this.ambientAcc -= 1;
      Sphere.anyTangent(center, _l1);
      Sphere.rotateAround(_l1, center, Math.random() * TAU);
      const d = _l2.copy(center);
      Sphere.slide(d, _l1.multiplyScalar(Math.sqrt(Math.random()) * 22), this.R);
      const g = this.heightAt(d);
      if (kind === 'fireflies') {
        const p = _l4.copy(d).multiplyScalar(g + rand(0.4, 3));
        this.fx.spawn(p.x, p.y, p.z, rand(-0.4, 0.4), rand(-0.4, 0.4), rand(-0.4, 0.4), 0.9, 1.6, 0.4, rand(0.12, 0.2), rand(3, 5), 0.2, 0, 0.8);
      } else if (kind === 'snow') {
        const p = _l4.copy(d).multiplyScalar(g + rand(4, 12));
        this.fx.spawn(p.x, p.y, p.z, -d.x * 2 + rand(-0.5, 0.5), -d.y * 2 + rand(-0.5, 0.5), -d.z * 2 + rand(-0.5, 0.5), 0.75, 0.8, 0.9, rand(0.1, 0.18), rand(3, 5), 0, 0, 1, 0.9);
      } else if (kind === 'ash') {
        const p = _l4.copy(d).multiplyScalar(g + rand(0.2, 2));
        this.fx.spawn(p.x, p.y, p.z, d.x * rand(0.6, 1.5), d.y * rand(0.6, 1.5), d.z * rand(0.6, 1.5), 2.0, 0.55, 0.12, rand(0.08, 0.16), rand(2.5, 4), 0.3, 0, 0.5);
      } else if (kind === 'embers') {
        const p = _l4.copy(d).multiplyScalar(g + rand(0.2, 2));
        const warm = this.finale && this.finale.exploded;
        this.fx.spawn(p.x, p.y, p.z, d.x * rand(0.8, 2), d.y * rand(0.8, 2), d.z * rand(0.8, 2), 1.9, warm ? 1.2 : 0.7, 0.2, rand(0.1, 0.2), rand(2.5, 4), 0.3, 0, 0.5);
      }
    }
  }

  /* ---------- finale (The Hollow Sun) ---------- */
  startFinale() {
    const game = this.game, P = this.player;
    this.finale = { t: 0, exploded: false, ignited: false, done: false };
    P.control = false;
    P.invuln = 999;
    this.boss.setState('dying');
    for (const e of this.enemies) if (e.alive) this.killEnemy(e, true);
    this.respawns = [];
    for (const w of this.waves) { this.scene.remove(w.mesh); w.mat.dispose(); }
    this.waves = [];
    for (const p of this.projectiles) { p.dead = true; this.scene.remove(p.object); }
    this.projectiles = [];
    for (const e of this.effects) { this.scene.remove(e.object); if (e.dispose) e.dispose(); }
    this.effects = [];
    game.audio.stopMusic();
    game.audio.sfx('roar', 1);
    this.camLook.copy(this.boss.position);
    game.startFinale();
  }

  updateFinale(dt) {
    const f = this.finale, game = this.game, boss = this.boss;
    f.t += dt;
    if (!f.exploded) {
      if (Math.random() < 0.7) this.fx.burst(boss.position, 3, 9, 1.8, 1.2, 1.9, 0.5, 0.7, { drag: 1, jitter: 3 });
      game.shake(0.12 + f.t * 0.05);
      const near = this.arc(boss.dir, this.player.dir) < 16;
      if (f.t > 2.8 && (near || f.t > 6)) {
        f.exploded = true;
        f.boomT = f.t;
        boss.group.visible = false;
        boss.setState('dormant');
        const n = Math.round(320 * game.quality.fx);
        this.fx.burst(boss.position, n, 18, 2.2, 1.6, 1.2, 0.7, 1.6, { drag: 1.2 });
        this.fx.burst(boss.position, Math.round(n / 2), 12, 1.4, 0.4, 1.8, 0.6, 1.4, { drag: 1.2 });
        this.smoke.burst(boss.position, 60, 8, 0.05, 0.02, 0.08, 2.4, 1.6, { drag: 2, grow: 2.5, alpha: 0.7 });
        game.ui.flash(0.9);
        game.audio.sfx('bossDie');
        game.shake(1.4);
      }
    } else {
      const k = smooth01((f.t - f.boomT - 0.2) / 4.5);
      if (!f.ignited && f.t - f.boomT > 0.5) {
        f.ignited = true;
        game.audio.sfx('ignite');
        game.audio.playMusic('ending');
      }
      this.planet.material.emissive.setRGB(1.05 * k, 0.5 * k, 0.1 * k);
      if (game.bloomPass) game.bloomPass.strength = lerp(0.8, 0.6, k);
      if (this.veins) this.veins.material.color.setRGB(1.5 + k * 1.6, 0.42 + k * 1.1, 0.08 + k * 0.35);
      const u = this.sky.skyMat.uniforms;
      u.top.value.copy(this.skyColors.top).lerp(_c(0.05, 0.02, 0.05), k);
      u.bottom.value.copy(this.skyColors.bottom).lerp(_c(0.3, 0.12, 0.05), k);
      this.ambient.color.copy(this.skyColors.ambient).lerp(_c(1.0, 0.75, 0.5), k);
      this.ambient.intensity = 0.62 + k * 0.45;
      this.scene.fog.color.copy(this.skyColors.fog).lerp(_c(0.3, 0.12, 0.04), k);
      this.scene.fog.density = lerp(this.biome.fogDensity, 0.004, k);
      if (Math.random() < 0.8 * game.quality.fx) {
        Sphere.randomDir(Math.random, _l1);
        const p = _l2.copy(_l1).multiplyScalar(this.heightAt(_l1) + 0.3);
        const s = rand(3, 8) * k;
        this.fx.spawn(p.x, p.y, p.z, _l1.x * s, _l1.y * s, _l1.z * s, 2.4, 1.4, 0.4, rand(0.6, 1.4), rand(1, 2), 0.5, 0, 0.2);
      }
    }
    if (f.exploded && f.t - f.boomT > 7 && !f.done) {
      f.done = true;
      game.onFinaleDone();
    }
  }

  /* ---------- cameras ---------- */
  updateCamRig(dt, snap) {
    const P = this.player;
    this.camFwd.addScaledVector(P.dir, -P.dir.dot(this.camFwd));
    if (this.camFwd.lengthSq() < 1e-6) this.camFwd.copy(P.fwd);
    this.camFwd.normalize();
    const a = Sphere.signedAngle(this.camFwd, P.fwd, P.dir);
    Sphere.rotateAround(this.camFwd, P.dir, snap ? a : a * damp(4.2, dt));
    this.camUp.lerp(P.dir, snap ? 1 : damp(6, dt)).normalize();
  }

  followTarget(outPos, outLook) {
    const P = this.player;
    const k = (CAM_DIST[this.game.settings.camDist] || 1) * (this.boss && !this.bossDefeated && this.boss.state !== 'dormant' ? 1.15 : 1);
    const base = _l1.copy(P.dir).multiplyScalar(P.groundR + 0.6 + P.alt * 0.5);
    outPos.copy(base).addScaledVector(this.camUp, 5.6 * k).addScaledVector(this.camFwd, -9.6 * k);
    const len = outPos.length();
    _l2.copy(outPos).divideScalar(len);
    const gh = this.heightAt(_l2) + 1.6;
    if (len < gh) outPos.copy(_l2).multiplyScalar(gh);
    outLook.copy(base).addScaledVector(this.camUp, 1.5).addScaledVector(this.camFwd, 3.5);
  }

  followCamera(cam, dt) {
    this.updateCamRig(dt, false);
    this.followTarget(_l3, _l4);
    cam.position.lerp(_l3, damp(8, dt));
    this.camLook.lerp(_l4, damp(12, dt));
    cam.up.copy(this.camUp);
    cam.lookAt(this.camLook);
  }

  introCamera(cam, t, dt) {
    const P = this.player;
    this.updateCamRig(dt, true);
    this.followTarget(_l3, _l4);
    const k = easeInOutCubic(t / 2.6);
    _l2.copy(P.dir).multiplyScalar(this.R + 34).addScaledVector(this.camFwd, -26);
    cam.position.lerpVectors(_l2, _l3, k);
    this.camLook.copy(P.position).lerp(_l4, k);
    cam.up.copy(this.camUp);
    cam.lookAt(this.camLook);
  }

  ascendCamera(cam, dt) {
    const P = this.player;
    cam.position.addScaledVector(this.camUp, dt * 1.5);
    this.camLook.lerp(P.position, damp(5, dt));
    cam.up.copy(this.camUp);
    cam.lookAt(this.camLook);
  }

  // Move the camera toward `target` without cutting through the planet.
  moveCamSafe(cam, target, rate) {
    const r0 = cam.position.length(), r1 = target.length();
    _l1.copy(cam.position).divideScalar(r0);
    _l2.copy(target).divideScalar(r1);
    const ang = Sphere.angle(_l1, _l2);
    if (ang > 1e-4) {
      _l4.crossVectors(_l1, _l2);
      if (_l4.lengthSq() < 1e-10) Sphere.anyTangent(_l1, _l4);
      _l4.normalize();
      Sphere.rotateAround(_l1, _l4, ang * rate);
    }
    cam.position.copy(_l1).multiplyScalar(lerp(r0, r1, rate));
  }

  finaleCamera(cam, dt) {
    const f = this.finale, P = this.player, B = this.boss;
    if (!f.exploded) {
      Sphere.tangentToward(P.dir, B.dir, _l5);
      if (_l5.lengthSq() === 0) _l5.copy(this.camFwd);
      _l6.copy(P.position).addScaledVector(P.dir, 7).addScaledVector(_l5, -10);
      this.moveCamSafe(cam, _l6, damp(2.5, dt));
      this.camLook.lerp(B.position, damp(3, dt));
    } else {
      const k = easeInOutCubic((f.t - f.boomT) / 6.5);
      _l6.copy(P.dir).addScaledVector(this.camFwd, -0.8).normalize().multiplyScalar(this.R * 3.0);
      this.moveCamSafe(cam, _l6, damp(0.3 + k * 1.6, dt));
      _l5.copy(B.position).multiplyScalar(1 - k);
      this.camLook.lerp(_l5, damp(2, dt));
    }
    cam.up.copy(this.camUp);
    cam.lookAt(this.camLook);
  }

  endingCamera(cam, dt) {
    Sphere.rotateAround(cam.position, this.camUp, dt * 0.06);
    this.camLook.lerp(_l1.set(0, 0, 0), damp(2, dt));
    cam.up.copy(this.camUp);
    cam.lookAt(this.camLook);
  }

  menuCamera(cam) {
    const a = this.time * 0.035;
    const D = this.R * 2.3;
    cam.position.set(Math.sin(a) * D, this.R * 0.95, Math.cos(a) * D);
    cam.up.set(0, 1, 0);
    cam.lookAt(0, this.R * 0.8, 0);
  }

  dispose() {
    disposeTree(this.scene);
    for (const p of this.projectiles) disposeTree(p.object);
    for (const k in this.A) {
      const v = this.A[k];
      if (v && (v.isBufferGeometry || v.isMaterial)) v.dispose();
    }
    for (const k in this.A.projMat) this.A.projMat[k].dispose();
    for (const k in this.A.projGlowMat) this.A.projGlowMat[k].dispose();
    for (const k in this.matCache) this.matCache[k].dispose();
    for (const key in this.kits) {
      for (const p of this.kits[key].parts) { p.geo.dispose(); p.mat.dispose(); }
    }
  }
}

function _c(r, g, b) { return (_c.v || (_c.v = new THREE.Color())).setRGB(r, g, b); }
