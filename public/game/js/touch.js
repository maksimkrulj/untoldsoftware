'use strict';
/* On-screen controls for phones and tablets: a floating stick on the left, action buttons on the right. */

const IS_TOUCH = (() => {
  if (/[?&]touch=1/.test(location.search)) return true;
  if (/[?&]touch=0/.test(location.search)) return false;
  const mm = q => window.matchMedia && window.matchMedia(q).matches;
  return mm('(pointer: coarse)') || (navigator.maxTouchPoints > 0 && !mm('(pointer: fine)'));
})();

// Swap keyboard wording for touch wording in tutorial and dialogue text.
function touchText(s) {
  if (!IS_TOUCH || !s) return s;
  return s
    .replace(/Strike with Left Click or J\./g, 'Strike with the sword button.')
    .replace(/Left Click or J/g, 'the sword button')
    .replace(/press 1 to drink one/g, 'tap the flask to drink one')
    .replace(/press 2 when/g, 'tap the bomb when')
    .replace(/ \(1\)/g, '')
    .replace(/ \(2\)/g, '');
}

class TouchControls {
  constructor(game) {
    this.game = game;
    this.enabled = IS_TOUCH;
    this.stickId = null;
    this.origin = { x: 0, y: 0 };
    this.attackHeld = false;
    this.attackRepeat = 0;
    if (!this.enabled) return;
    document.body.classList.add('touch');
    this.zone = document.getElementById('t-stick-zone');
    this.base = document.getElementById('t-stick');
    this.knob = document.getElementById('t-knob');
    this.radius = 52;

    this.zone.addEventListener('pointerdown', e => this.stickStart(e));
    window.addEventListener('pointermove', e => this.stickMove(e), { passive: false });
    window.addEventListener('pointerup', e => this.stickEnd(e));
    window.addEventListener('pointercancel', e => this.stickEnd(e));

    const bind = (id, action, hold) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.add('pressed');
        if (this.game.state !== 'playing') return;
        this.game.input.just.add(action);
        if (hold) { this.attackHeld = true; this.attackRepeat = 0.22; }
      });
      const up = () => {
        el.classList.remove('pressed');
        if (hold) this.attackHeld = false;
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('pointerleave', up);
      el.addEventListener('contextmenu', e => e.preventDefault());
    };
    bind('ab-attack', 'attack', true);
    bind('ab-jump', 'jump');
    bind('ab-dash', 'dash');
    bind('ab-pulse', 'pulse');
    bind('slot-flask', 'item1');
    bind('slot-bomb', 'item2');

    document.getElementById('t-pause').addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      if (this.game.state === 'playing' || this.game.state === 'intro') this.game.pause();
    });
    document.getElementById('prompt').addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      if (this.game.state === 'playing') this.game.input.just.add('interact');
    });
    document.getElementById('dialog').addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      if (this.game.state === 'dialog') this.game.ui.advanceDialog();
    });
  }

  stickStart(e) {
    if (this.stickId !== null) return;
    e.preventDefault();
    this.stickId = e.pointerId;
    this.origin.x = e.clientX;
    this.origin.y = e.clientY;
    this.base.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    this.base.classList.add('on');
    this.knob.style.transform = 'translate(-50%,-50%)';
    this.setAxis(0, 0);
  }

  stickMove(e) {
    if (e.pointerId !== this.stickId) return;
    e.preventDefault();
    let dx = e.clientX - this.origin.x, dy = e.clientY - this.origin.y;
    const len = Math.hypot(dx, dy);
    const r = this.radius;
    if (len > r) {
      // let the stick follow the thumb so it never feels stuck at the edge
      const over = len - r;
      this.origin.x += dx / len * over;
      this.origin.y += dy / len * over;
      this.base.style.transform = 'translate(' + this.origin.x + 'px,' + this.origin.y + 'px)';
      dx = dx / len * r;
      dy = dy / len * r;
    }
    this.knob.style.transform = 'translate(calc(-50% + ' + dx.toFixed(1) + 'px), calc(-50% + ' + dy.toFixed(1) + 'px))';
    this.setAxis(dx / r, dy / r);
  }

  stickEnd(e) {
    if (e.pointerId !== this.stickId) return;
    this.stickId = null;
    this.base.classList.remove('on');
    this.setAxis(0, 0);
  }

  setAxis(x, y) {
    const a = this.game.input.axis;
    const len = Math.hypot(x, y);
    const dead = 0.18;
    if (len < dead) { a.x = 0; a.y = 0; a.active = this.stickId !== null; return; }
    const k = Math.min(1, (len - dead) / (1 - dead)) / len;
    a.x = x * k;
    a.y = y * k;
    a.active = true;
  }

  reset() {
    this.stickId = null;
    this.attackHeld = false;
    if (this.base) this.base.classList.remove('on');
    const a = this.game.input.axis;
    a.x = 0; a.y = 0; a.active = false;
  }

  update(dt) {
    if (!this.enabled) return;
    if (this.attackHeld && this.game.state === 'playing') {
      this.attackRepeat -= dt;
      if (this.attackRepeat <= 0) {
        this.attackRepeat = 0.2;
        this.game.input.just.add('attack');
      }
    }
  }
}
