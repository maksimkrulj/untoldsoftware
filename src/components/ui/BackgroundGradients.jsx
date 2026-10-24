import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

// Each preset: array of blob configs
// x/y = % position, w/h = % size, color = rgba, blur = px, dur = seconds, dx/dy = drift pixels, scaleTo = end scale
const PRESETS = {
  services: [
    { x: -18, y: -20, w: 65, h: 80, color: 'rgba(255,255,255,0.10)', blur: 90,  dur: 14, dx: 22,  dy: 18,  scaleTo: 1.10 },
    { x: 55,  y: 50,  w: 60, h: 75, color: 'rgba(255,255,255,0.07)', blur: 80,  dur: 19, dx: -18, dy: -14, scaleTo: 1.08 },
    { x: 30,  y: 78,  w: 42, h: 52, color: 'rgba(255,255,255,0.05)', blur: 70,  dur: 12, dx: 12,  dy: -20, scaleTo: 1.12 },
  ],
  work: [
    { x: -10, y: 10,  w: 55, h: 70, color: 'rgba(255,255,255,0.09)', blur: 90,  dur: 16, dx: 18,  dy: 14,  scaleTo: 1.09 },
    { x: 60,  y: 25,  w: 50, h: 65, color: 'rgba(255,255,255,0.06)', blur: 80,  dur: 20, dx: -14, dy: -18, scaleTo: 1.07 },
    { x: 20,  y: 65,  w: 38, h: 50, color: 'rgba(255,255,255,0.05)', blur: 65,  dur: 13, dx: 10,  dy: -12, scaleTo: 1.11 },
  ],
  about: [
    { x: 45,  y: -15, w: 60, h: 75, color: 'rgba(255,255,255,0.08)', blur: 85,  dur: 18, dx: -20, dy: 20,  scaleTo: 1.10 },
    { x: -15, y: 45,  w: 52, h: 68, color: 'rgba(255,255,255,0.07)', blur: 80,  dur: 15, dx: 16,  dy: -14, scaleTo: 1.08 },
    { x: 55,  y: 70,  w: 40, h: 55, color: 'rgba(255,255,255,0.05)', blur: 70,  dur: 11, dx: -10, dy: -16, scaleTo: 1.13 },
  ],
  process: [
    { x: -12, y: -10, w: 58, h: 72, color: 'rgba(255,255,255,0.09)', blur: 90,  dur: 15, dx: 20,  dy: 16,  scaleTo: 1.09 },
    { x: 58,  y: 55,  w: 55, h: 70, color: 'rgba(255,255,255,0.07)', blur: 80,  dur: 20, dx: -16, dy: -12, scaleTo: 1.08 },
    { x: 25,  y: 80,  w: 44, h: 55, color: 'rgba(255,255,255,0.05)', blur: 65,  dur: 13, dx: 8,   dy: -18, scaleTo: 1.11 },
  ],
  cta: [
    { x: 15,  y: -10, w: 70, h: 80, color: 'rgba(255,255,255,0.10)', blur: 100, dur: 17, dx: 10,  dy: 18,  scaleTo: 1.08 },
    { x: -10, y: 50,  w: 50, h: 65, color: 'rgba(255,255,255,0.07)', blur: 80,  dur: 14, dx: 18,  dy: -10, scaleTo: 1.10 },
    { x: 60,  y: 60,  w: 48, h: 60, color: 'rgba(255,255,255,0.06)', blur: 75,  dur: 21, dx: -14, dy: -16, scaleTo: 1.07 },
  ],
  footer: [
    { x: -10, y: -15, w: 55, h: 70, color: 'rgba(255,255,255,0.07)', blur: 80,  dur: 18, dx: 14,  dy: 12,  scaleTo: 1.09 },
    { x: 55,  y: 30,  w: 50, h: 65, color: 'rgba(255,255,255,0.05)', blur: 75,  dur: 22, dx: -12, dy: -10, scaleTo: 1.07 },
  ],
};

export default function BackgroundGradients({ preset = 'services' }) {
  const blobRefs = useRef([]);
  const blobs = PRESETS[preset] ?? PRESETS.services;

  useEffect(() => {
    const tweens = [];

    blobRefs.current.forEach((el, i) => {
      if (!el || !blobs[i]) return;
      const b = blobs[i];

      tweens.push(
        gsap.to(el, {
          x: b.dx,
          y: b.dy,
          scale: b.scaleTo,
          duration: b.dur,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 2.5,
        })
      );
    });

    return () => tweens.forEach(t => t.kill());
  }, [blobs]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {blobs.map((b, i) => (
        <div
          key={i}
          ref={el => (blobRefs.current[i] = el)}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.w}%`,
            height: `${b.h}%`,
            background: `radial-gradient(ellipse at center, ${b.color} 0%, transparent 70%)`,
            filter: `blur(${b.blur}px)`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
