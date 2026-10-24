import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

function ShapeEl({ type, size }) {
  const h = size / 2;

  switch (type) {
    case 'ring':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <circle cx={h} cy={h} r={h - 1} stroke="white" strokeWidth="1.5" />
        </svg>
      );
    case 'ring-double':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <circle cx={h} cy={h} r={h - 1} stroke="white" strokeWidth="1" />
          <circle cx={h} cy={h} r={h * 0.58} stroke="white" strokeWidth="1" />
        </svg>
      );
    case 'plus':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <line x1={h} y1={0} x2={h} y2={size} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={0} y1={h} x2={size} y2={h} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'cross':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <line x1="2" y1="2" x2={size - 2} y2={size - 2} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={size - 2} y1="2" x2="2" y2={size - 2} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'dot':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={h} cy={h} r={h} fill="white" />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <polygon points={`${h},1 ${size - 1},${h} ${h},${size - 1} 1,${h}`} stroke="white" strokeWidth="1.5" />
        </svg>
      );
    case 'arc':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <path d={`M 1 ${h} A ${h - 1} ${h - 1} 0 0 1 ${h} 1`} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'arc-half':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <path d={`M 1 ${size - 1} A ${h - 1} ${h - 1} 0 0 1 ${size - 1} ${size - 1}`} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'triangle':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <polygon points={`${h},1 ${size - 1},${size - 1} 1,${size - 1}`} stroke="white" strokeWidth="1.5" />
        </svg>
      );
    case 'bracket':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <path
            d={`M ${size * 0.72} 1 L 1 ${h} L ${size * 0.72} ${size - 1}`}
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'bracket-right':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <path
            d={`M ${size * 0.28} 1 L ${size - 1} ${h} L ${size * 0.28} ${size - 1}`}
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'dots-grid': {
      const sp = (size - 4) / 2;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {[0, 1, 2].flatMap(r =>
            [0, 1, 2].map(c => (
              <circle key={`${r}${c}`} cx={2 + c * sp} cy={2 + r * sp} r="2" fill="white" />
            ))
          )}
        </svg>
      );
    }
    case 'hex': {
      const pts = [0, 1, 2, 3, 4, 5]
        .map(i => {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          return `${h + (h - 1) * Math.cos(a)},${h + (h - 1) * Math.sin(a)}`;
        })
        .join(' ');
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <polygon points={pts} stroke="white" strokeWidth="1.5" />
        </svg>
      );
    }
    case 'line-h':
      return (
        <svg width={size} height={6} viewBox={`0 0 ${size} 6`} fill="none">
          <line x1={0} y1={3} x2={size} y2={3} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'asterisk':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <line x1={h} y1={0} x2={h} y2={size} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={0} y1={h} x2={size} y2={h} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="2" y1="2" x2={size - 2} y2={size - 2} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={size - 2} y1="2" x2="2" y2={size - 2} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

// ── Presets — opacity range 0.12–0.40 so shapes are actually visible ────────

export const PRESET_SERVICES = [
  { id: 1,  type: 'ring',          x: 4,  y: 6,  size: 74,  opacity: 0.18, dur: 11, dx: 14,  dy: -18, dr: 25  },
  { id: 2,  type: 'bracket',       x: 90, y: 8,  size: 24,  opacity: 0.30, dur: 8,  dx: -10, dy: 16,  dr: -30 },
  { id: 3,  type: 'dots-grid',     x: 84, y: 72, size: 32,  opacity: 0.25, dur: 9,  dx: 8,   dy: -10, dr: 18  },
  { id: 4,  type: 'plus',          x: 16, y: 78, size: 22,  opacity: 0.28, dur: 7,  dx: -8,  dy: 12,  dr: 45  },
  { id: 5,  type: 'dot',           x: 52, y: 4,  size: 7,   opacity: 0.38, dur: 6,  dx: 6,   dy: 8,   dr: 0   },
  { id: 6,  type: 'ring-double',   x: 68, y: 88, size: 54,  opacity: 0.16, dur: 12, dx: -12, dy: -10, dr: 28  },
  { id: 7,  type: 'cross',         x: 36, y: 52, size: 20,  opacity: 0.25, dur: 8,  dx: 10,  dy: 8,   dr: -40 },
  { id: 8,  type: 'dot',           x: 8,  y: 50, size: 6,   opacity: 0.35, dur: 5,  dx: 8,   dy: -6,  dr: 0   },
  { id: 9,  type: 'hex',           x: 55, y: 82, size: 34,  opacity: 0.18, dur: 13, dx: -10, dy: 10,  dr: 22  },
  { id: 10, type: 'arc',           x: 90, y: 48, size: 50,  opacity: 0.16, dur: 10, dx: -8,  dy: -14, dr: -35 },
  { id: 11, type: 'bracket-right', x: 2,  y: 85, size: 24,  opacity: 0.26, dur: 9,  dx: 12,  dy: -8,  dr: 20  },
  { id: 12, type: 'asterisk',      x: 45, y: 92, size: 18,  opacity: 0.20, dur: 7,  dx: -6,  dy: -10, dr: 60  },
];

export const PRESET_WORK = [
  { id: 1,  type: 'ring',        x: 2,  y: 18, size: 90,  opacity: 0.15, dur: 14, dx: 16,  dy: -12, dr: 20  },
  { id: 2,  type: 'diamond',     x: 88, y: 10, size: 28,  opacity: 0.26, dur: 9,  dx: -14, dy: 16,  dr: -30 },
  { id: 3,  type: 'dot',         x: 24, y: 90, size: 7,   opacity: 0.38, dur: 6,  dx: 8,   dy: -12, dr: 0   },
  { id: 4,  type: 'triangle',    x: 76, y: 76, size: 30,  opacity: 0.20, dur: 11, dx: 10,  dy: 8,   dr: -25 },
  { id: 5,  type: 'plus',        x: 60, y: 4,  size: 22,  opacity: 0.28, dur: 8,  dx: -8,  dy: 14,  dr: 35  },
  { id: 6,  type: 'arc-half',    x: 14, y: 42, size: 64,  opacity: 0.15, dur: 13, dx: 12,  dy: -16, dr: 40  },
  { id: 7,  type: 'dot',         x: 92, y: 62, size: 6,   opacity: 0.35, dur: 5,  dx: -6,  dy: 8,   dr: 0   },
  { id: 8,  type: 'ring-double', x: 44, y: 82, size: 48,  opacity: 0.18, dur: 10, dx: 10,  dy: 12,  dr: -20 },
  { id: 9,  type: 'cross',       x: 4,  y: 82, size: 20,  opacity: 0.28, dur: 7,  dx: 12,  dy: -8,  dr: 50  },
  { id: 10, type: 'dots-grid',   x: 70, y: 32, size: 32,  opacity: 0.24, dur: 9,  dx: -10, dy: 12,  dr: 15  },
  { id: 11, type: 'line-h',      x: 30, y: 12, size: 54,  opacity: 0.20, dur: 11, dx: 8,   dy: 14,  dr: 10  },
  { id: 12, type: 'hex',         x: 55, y: 55, size: 30,  opacity: 0.18, dur: 12, dx: -12, dy: -8,  dr: 30  },
];

export const PRESET_ABOUT = [
  { id: 1,  type: 'dots-grid',   x: 7,  y: 8,  size: 46,  opacity: 0.24, dur: 11, dx: 12,  dy: 14,  dr: 15  },
  { id: 2,  type: 'ring',        x: 86, y: 4,  size: 104, opacity: 0.12, dur: 17, dx: -18, dy: 20,  dr: -12 },
  { id: 3,  type: 'plus',        x: 18, y: 55, size: 24,  opacity: 0.28, dur: 8,  dx: -10, dy: -12, dr: 40  },
  { id: 4,  type: 'dot',         x: 62, y: 90, size: 8,   opacity: 0.38, dur: 6,  dx: 8,   dy: -10, dr: 0   },
  { id: 5,  type: 'hex',         x: 90, y: 76, size: 36,  opacity: 0.18, dur: 12, dx: -12, dy: -10, dr: 25  },
  { id: 6,  type: 'arc',         x: 38, y: 4,  size: 68,  opacity: 0.15, dur: 13, dx: 10,  dy: 16,  dr: -40 },
  { id: 7,  type: 'diamond',     x: 4,  y: 80, size: 24,  opacity: 0.24, dur: 9,  dx: 14,  dy: -8,  dr: 30  },
  { id: 8,  type: 'dot',         x: 78, y: 28, size: 7,   opacity: 0.35, dur: 5,  dx: -8,  dy: 10,  dr: 0   },
  { id: 9,  type: 'cross',       x: 50, y: 65, size: 18,  opacity: 0.26, dur: 7,  dx: 10,  dy: 8,   dr: -45 },
  { id: 10, type: 'ring-double', x: 14, y: 28, size: 50,  opacity: 0.16, dur: 11, dx: 14,  dy: -12, dr: 20  },
  { id: 11, type: 'asterisk',    x: 52, y: 15, size: 18,  opacity: 0.22, dur: 8,  dx: -8,  dy: 12,  dr: 55  },
  { id: 12, type: 'triangle',    x: 72, y: 50, size: 26,  opacity: 0.20, dur: 10, dx: 10,  dy: -10, dr: -20 },
];

export const PRESET_PROCESS = [
  { id: 1,  type: 'arc',         x: 4,  y: 6,  size: 72,  opacity: 0.16, dur: 12, dx: 12,  dy: 16,  dr: 35  },
  { id: 2,  type: 'dots-grid',   x: 84, y: 4,  size: 40,  opacity: 0.24, dur: 9,  dx: -10, dy: 14,  dr: 20  },
  { id: 3,  type: 'ring',        x: 90, y: 80, size: 88,  opacity: 0.13, dur: 15, dx: -16, dy: -14, dr: -18 },
  { id: 4,  type: 'plus',        x: 10, y: 88, size: 26,  opacity: 0.30, dur: 8,  dx: 10,  dy: -16, dr: -40 },
  { id: 5,  type: 'dot',         x: 40, y: 4,  size: 7,   opacity: 0.38, dur: 6,  dx: 8,   dy: 10,  dr: 0   },
  { id: 6,  type: 'triangle',    x: 70, y: 56, size: 28,  opacity: 0.20, dur: 10, dx: -10, dy: 12,  dr: 25  },
  { id: 7,  type: 'diamond',     x: 24, y: 44, size: 22,  opacity: 0.25, dur: 8,  dx: 12,  dy: -10, dr: -30 },
  { id: 8,  type: 'dot',         x: 92, y: 40, size: 6,   opacity: 0.38, dur: 5,  dx: -6,  dy: 8,   dr: 0   },
  { id: 9,  type: 'hex',         x: 55, y: 84, size: 34,  opacity: 0.18, dur: 11, dx: 8,   dy: -12, dr: 20  },
  { id: 10, type: 'bracket',     x: 2,  y: 30, size: 28,  opacity: 0.26, dur: 9,  dx: 14,  dy: 8,   dr: 35  },
  { id: 11, type: 'ring-double', x: 46, y: 46, size: 58,  opacity: 0.14, dur: 14, dx: -10, dy: -14, dr: 15  },
  { id: 12, type: 'line-h',      x: 60, y: 20, size: 48,  opacity: 0.20, dur: 10, dx: 10,  dy: 8,   dr: -12 },
];

export const PRESET_CTA = [
  { id: 1,  type: 'ring',        x: 2,  y: 4,  size: 86,  opacity: 0.14, dur: 12, dx: 14,  dy: 16,  dr: 22  },
  { id: 2,  type: 'ring',        x: 88, y: 86, size: 104, opacity: 0.12, dur: 16, dx: -16, dy: -14, dr: -18 },
  { id: 3,  type: 'dot',         x: 16, y: 90, size: 7,   opacity: 0.35, dur: 6,  dx: 8,   dy: -12, dr: 0   },
  { id: 4,  type: 'plus',        x: 84, y: 18, size: 22,  opacity: 0.28, dur: 8,  dx: -10, dy: 14,  dr: 40  },
  { id: 5,  type: 'cross',       x: 92, y: 50, size: 18,  opacity: 0.26, dur: 7,  dx: -8,  dy: -10, dr: -45 },
  { id: 6,  type: 'dot',         x: 46, y: 6,  size: 6,   opacity: 0.38, dur: 5,  dx: 6,   dy: 8,   dr: 0   },
  { id: 7,  type: 'ring-double', x: 6,  y: 52, size: 56,  opacity: 0.15, dur: 14, dx: 12,  dy: -16, dr: 25  },
  { id: 8,  type: 'dots-grid',   x: 60, y: 86, size: 36,  opacity: 0.24, dur: 10, dx: -8,  dy: 12,  dr: 15  },
  { id: 9,  type: 'arc-half',    x: 32, y: 72, size: 54,  opacity: 0.16, dur: 13, dx: 10,  dy: -14, dr: 35  },
  { id: 10, type: 'asterisk',    x: 72, y: 8,  size: 20,  opacity: 0.24, dur: 9,  dx: -8,  dy: 14,  dr: -55 },
];

export const PRESET_FOOTER = [
  { id: 1, type: 'ring',        x: 2,  y: 10, size: 70,  opacity: 0.13, dur: 14, dx: 10,  dy: 14,  dr: 18  },
  { id: 2, type: 'dots-grid',   x: 88, y: 20, size: 32,  opacity: 0.22, dur: 10, dx: -8,  dy: 10,  dr: 12  },
  { id: 3, type: 'dot',         x: 30, y: 85, size: 6,   opacity: 0.30, dur: 6,  dx: 6,   dy: -8,  dr: 0   },
  { id: 4, type: 'plus',        x: 70, y: 60, size: 18,  opacity: 0.24, dur: 8,  dx: -8,  dy: 10,  dr: 30  },
  { id: 5, type: 'ring-double', x: 50, y: 5,  size: 46,  opacity: 0.13, dur: 13, dx: 10,  dy: -10, dr: -20 },
  { id: 6, type: 'cross',       x: 92, y: 80, size: 16,  opacity: 0.24, dur: 7,  dx: -6,  dy: -8,  dr: 40  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function FloatingGraphics({ shapes = PRESET_SERVICES }) {
  const containerRef = useRef(null);
  const tweensRef = useRef([]);

  useEffect(() => {
    const els = containerRef.current?.querySelectorAll('.fg-shape');
    if (!els?.length) return;

    tweensRef.current.forEach(t => t.kill());
    tweensRef.current = [];

    els.forEach((el, i) => {
      const cfg = shapes[i];
      if (!cfg) return;

      // Drift + rotate — primary movement
      const t1 = gsap.to(el, {
        x: cfg.dx,
        y: cfg.dy,
        rotation: cfg.dr,
        duration: cfg.dur,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.35,
      });

      // Breathe — subtle opacity oscillation only (no big drop, keep visible)
      const t2 = gsap.to(el, {
        opacity: cfg.opacity * 0.55,
        duration: cfg.dur * 0.85,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.2 + cfg.dur * 0.5,
      });

      tweensRef.current.push(t1, t2);
    });

    return () => {
      tweensRef.current.forEach(t => t.kill());
      tweensRef.current = [];
    };
  }, [shapes]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {shapes.map(shape => (
        <div
          key={shape.id}
          className="fg-shape absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            opacity: shape.opacity,
            willChange: 'transform, opacity',
          }}
        >
          <ShapeEl type={shape.type} size={shape.size} />
        </div>
      ))}
    </div>
  );
}
