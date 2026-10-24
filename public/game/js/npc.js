'use strict';
/* NPCs that live on the moons, their dialogue and the quests they hand out. */

const QUESTS = {
  moss: {
    npc: { name: 'Bram the Lampkeeper', short: 'Bram', kind: 'lampkeeper', color: '#ffb35c' },
    intro: [
      'Oh! A spark! A real, living spark! I thought the Hush had swallowed every last one of you.',
      'My lamps went dark one by one... but you still burn. That changes everything.',
      'Here — take the Sunblade. It was forged from the very first dawn, and it has waited a long time for a hand. Well... for a flame.',
      'Strike with Left Click or J. Strike three times in a row and the third blow becomes a spinning finisher!',
      'Jump and strike to come crashing down. Dash and strike to cut straight through anything in your way.'
    ],
    gives: 'weapon',
    task: { type: 'kill', goal: 8, title: "Bram's Garden" },
    taskLines: ['Now, a favour. Shadows have been trampling my glowcaps. Purge eight of them for me, will you?'],
    progressLine: 'Still more Shadows out there, little spark. Eight, I said! My glowcaps are counting on you.',
    doneLines: [
      'Eight! I can already see the glowcaps brightening. You have my thanks.',
      'Take these Ember Flasks — press 1 to drink one. And this Heartflame. Your light will burn longer now.'
    ],
    reward: { flask: 2, maxLight: 20 },
    idleLine: 'Go on, little spark. The shards will not gather themselves. And mind that big thorny brute — I hear it lurking.'
  },
  frost: {
    npc: { name: 'Pip the Star-Sprite', short: 'Pip', kind: 'sprite', color: '#9ad7ff' },
    intro: [
      'H-h-hello? Down here! Yes, in the ice! I\'m a little stuck.',
      'Three Frost Totems hold this prison together. They glow blue — you can\'t miss them.',
      'Smash all three with that shiny blade of yours and I\'ll be free!'
    ],
    task: { type: 'totems', goal: 3, title: 'Free Pip' },
    taskLines: [],
    progressLine: 'Still c-c-cold in here... The Totems! Find the glowing blue Totems!',
    doneLines: [
      'I\'m free! Brrr, that was the longest nap of my life. Thank you, thank you!',
      'Let me warm that blade of yours... There! Now your finishers unleash a wave of flame!',
      'And take this Nova Bomb — press 2 when you\'re surrounded. Boom!'
    ],
    reward: { weapon: 2, bomb: 1 },
    idleLine: 'Something ancient and frozen guards this moon. Its ice spikes rise where you stand — keep moving!'
  },
  cinder: {
    npc: { name: 'Old Kiln the Smith', short: 'Kiln', kind: 'smith', color: '#ff8a3d' },
    intro: [
      'Hrm. A spark carrying a Sunblade. Haven\'t seen one of those in an age.',
      'That blade could burn hotter. Much hotter. But I\'ll need Magma Cores to temper it.',
      'The Brutes carry them in their bellies. Bring me three.'
    ],
    task: { type: 'cores', goal: 3, title: "Kiln's Forge" },
    taskLines: [],
    progressLine: 'Three cores. The big Shadows carry them. No cores, no forging.',
    doneLines: [
      'Good cores. Hot ones.',
      '*CLANG* ... *CLANG* ... There. Your blade burns white-hot now — every strike sets Shadows ablaze.',
      'Take a couple of Nova Bombs too. You\'ll want them for the Colossus.'
    ],
    reward: { weapon: 3, bomb: 2 },
    idleLine: 'The Colossus throws fire from the sky. Watch the ground for its marks.'
  },
  sun: {
    npc: { name: 'Echo of the Sun', short: 'Echo', kind: 'echo', color: '#ffe9a8' },
    intro: [
      'You came. I am what is left of the Sun\'s voice.',
      'The Hush wears a shield of perfect darkness. Your blade cannot pierce it.',
      'But each Pyre you kindle will crack that shield. When it reels, strike with everything you have!',
      'Take these. Burn bright, little one.'
    ],
    task: null,
    reward: { flask: 2, bomb: 1 },
    idleLine: 'Kindle the Pyres. Crack the shield. Strike while it reels.'
  }
};

class NPC {
  constructor(level, def, dir) {
    this.level = level;
    this.def = def.npc;
    this.quest = def;
    this.dir = dir.clone();
    this.fwd = Sphere.anyTangent(this.dir, new THREE.Vector3());
    this.position = new THREE.Vector3();
    this.t = Math.random() * 10;
    this.R = level.heightAt(this.dir);
    this.object = new THREE.Group();
    this.body = new THREE.Group();
    this.object.add(this.body);
    this.build(def.npc.kind);
    this.marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: markTexture('!'), transparent: true, depthWrite: false }));
    this.marker.scale.setScalar(1.3);
    this.marker.position.y = this.markerY;
    this.object.add(this.marker);
    this.markChar = '!';
    this.collider = level.addCollider(this.dir, 0.8);
    this.place();
  }

  build(kind) {
    const std = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: 0.7 }, o || {}));
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a0d05 });
    const eyes = (y, z, r, sx) => {
      for (const s of [-1, 1]) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), eyeMat);
        e.position.set(sx * s, y, z);
        e.scale.set(1, 1.3, 0.6);
        this.body.add(e);
      }
    };
    if (kind === 'lampkeeper') {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 1.2, 10), std(0xe9dcc0));
      stem.position.y = 0.6;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.95, 16, 10, 0, TAU, 0, Math.PI / 2), std(0xb0432c));
      cap.position.y = 1.15;
      cap.scale.y = 0.75;
      this.body.add(stem, cap);
      const spotMat = std(0xf5ecd8);
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * TAU;
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), spotMat);
        spot.position.set(Math.cos(a) * 0.6, 1.55, Math.sin(a) * 0.6);
        spot.scale.y = 0.4;
        this.body.add(spot);
      }
      eyes(0.85, 0.42, 0.07, 0.15);
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 5), std(0x5a3a22));
      stick.position.set(0.7, 0.85, 0.2);
      stick.rotation.z = -0.3;
      const lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.5, 0.5) }));
      lamp.position.set(0.9, 1.45, 0.2);
      this.lamp = lamp;
      const glow = makeGlow(new THREE.Color(1.2, 0.7, 0.2), 2.2, 0.6);
      glow.position.copy(lamp.position);
      this.body.add(stick, lamp, glow);
      this.markerY = 2.6;
    } else if (kind === 'sprite') {
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.8, 2.4) }));
      star.position.y = 1.0;
      this.star = star;
      const glow = makeGlow(new THREE.Color(0.6, 0.9, 1.4), 2.4, 0.6);
      glow.position.y = 1.0;
      this.body.add(star, glow);
      eyes(1.05, 0.33, 0.06, 0.13);
      this.iceMat = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.45, roughness: 0.1, flatShading: true, depthWrite: false });
      this.ice = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 0), this.iceMat);
      this.ice.position.y = 1.0;
      this.object.add(this.ice);
      this.markerY = 2.7;
    } else if (kind === 'smith') {
      const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), std(0x5a5450));
      body.position.y = 0.9;
      body.scale.set(1, 1.1, 0.9);
      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), std(0x6a6460));
      head.position.y = 1.95;
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 0.9, 0.2) }));
      core.position.set(0, 1.0, 0.72);
      const beard = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 6), std(0xd8d0c8));
      beard.position.set(0, 1.6, 0.35);
      beard.rotation.x = Math.PI;
      this.body.add(body, head, core, beard);
      const eyeGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.6, 0.4) });
      for (const s of [-1, 1]) {
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeGlow);
        e.position.set(0.16 * s, 2.0, 0.4);
        this.body.add(e);
      }
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 5), std(0x5a3a22));
      handle.position.set(0.95, 1.0, 0.2);
      handle.rotation.z = 0.5;
      const headH = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.28), std(0x3a3a40, { metalness: 0.6 }));
      headH.position.set(0.7, 1.5, 0.2);
      headH.rotation.z = 0.5;
      this.hammer = new THREE.Group();
      this.hammer.add(handle, headH);
      this.body.add(this.hammer);
      this.markerY = 3.0;
    } else {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.9, 1.1) }));
      orb.position.y = 1.6;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.05, 6, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.3, 0.5) }));
      ring.position.y = 1.6;
      ring.rotation.x = Math.PI / 2;
      this.ring = ring;
      const glow = makeGlow(new THREE.Color(1.3, 1.0, 0.5), 4.5, 0.7);
      glow.position.y = 1.6;
      this.body.add(orb, ring, glow);
      this.markerY = 3.0;
    }
  }

  setMark(ch) {
    if (ch === this.markChar) return;
    this.markChar = ch;
    this.marker.visible = !!ch;
    if (ch) { this.marker.material.map = markTexture(ch); this.marker.material.needsUpdate = true; }
  }

  free() {
    if (!this.ice) return;
    const L = this.level;
    this.object.remove(this.ice);
    this.ice.geometry.dispose();
    this.iceMat.dispose();
    this.ice = null;
    _c1.copy(this.dir).multiplyScalar(this.R + 1);
    L.fx.burst(_c1, 50, 8, 0.7, 1.4, 2.0, 0.4, 0.9, { drag: 2.5 });
    L.game.audio.sfx('break');
  }

  place() {
    this.position.copy(this.dir).multiplyScalar(this.R);
    this.object.position.copy(this.position);
    Sphere.orient(this.object, this.dir, this.fwd);
  }

  update(dt) {
    const L = this.level, P = L.player;
    this.t += dt;
    if (P && L.arc(this.dir, P.dir) < 12) {
      Sphere.tangentToward(this.dir, P.dir, _c1);
      if (_c1.lengthSq() > 0) this.fwd.lerp(_c1, damp(4, dt)).normalize();
      this.place();
    }
    const bob = Math.sin(this.t * 2.2) * 0.06;
    this.body.position.y = bob;
    this.marker.position.y = this.markerY + Math.sin(this.t * 3) * 0.15;
    if (this.lamp) this.lamp.rotation.y += dt * 2;
    if (this.star) this.star.rotation.y += dt * (this.ice ? 0.4 : 3);
    if (this.ring) this.ring.rotation.z += dt;
    if (this.hammer) this.hammer.rotation.x = Math.sin(this.t * 3) * 0.15;
  }

  near(P) {
    return P && this.level.arc(this.dir, P.dir) < 3.6;
  }
}
