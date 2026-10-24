import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitText from './ui/SplitText';
import AnimatedContent from './ui/AnimatedContent';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IS_MOB = window.innerWidth < 768;

const SVG_OX = '243.74 242.34';

const C = {
  white:  '#ffffff',
  ice:    '#d6f4ff',
  cyan:   '#00e5ff',
  azure:  '#00b0ff',
  purple: '#ea80fc',
  pink:   '#ff4081',
  gold:   '#ffd740',
  lime:   '#ccff90',
  red:    '#ff5252',
};

const GLOW = {
  off:    'none',
  soft:   `drop-shadow(0 0 10px ${C.cyan}) drop-shadow(0 0 28px rgba(0,229,255,.22))`,
  medium: `drop-shadow(0 0 18px ${C.cyan}) drop-shadow(0 0 45px rgba(0,229,255,.38))`,
  hard:   `drop-shadow(0 0 6px #fff) drop-shadow(0 0 22px ${C.cyan}) drop-shadow(0 0 55px rgba(0,229,255,.6))`,
  purple: `drop-shadow(0 0 18px ${C.purple}) drop-shadow(0 0 48px rgba(234,128,252,.42))`,
  gold:   `drop-shadow(0 0 18px ${C.gold}) drop-shadow(0 0 48px rgba(255,215,64,.42))`,
};

export default function CTA() {
  const ctaRef       = useRef(null);
  const bgGradientRef = useRef(null);
  const btn1Ref      = useRef(null);
  const btn2Ref      = useRef(null);

  // SVG logo refs
  const logoWrapRef = useRef(null);
  const gOuterRef   = useRef(null);
  const gInnerRef   = useRef(null);
  const gCircleRef  = useRef(null);
  const rOuterRef   = useRef(null);
  const rInnerRef   = useRef(null);
  const cMainRef    = useRef(null);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: ctaRef.current,
        start: IS_MOB ? 'top 96%' : 'top 70%',
        once: true,
        onEnter: () => {
          const rOuter  = rOuterRef.current;
          const rInner  = rInnerRef.current;
          const cMain   = cMainRef.current;
          const gOuter  = gOuterRef.current;
          const gInner  = gInnerRef.current;
          const gCircle = gCircleRef.current;
          const wrap    = logoWrapRef.current;
          if (!rOuter || !rInner || !cMain || !wrap) return;

          const PL = {
            outer:  rOuter.getTotalLength(),
            inner:  rInner.getTotalLength(),
            circle: cMain.getTotalLength(),
          };

          // ── Initial state: paths ready to draw ────────────────────────────
          gsap.set(rOuter, { strokeDasharray: `${PL.outer} 99999`,  strokeDashoffset: PL.outer  });
          gsap.set(rInner, { strokeDasharray: `${PL.inner} 99999`,  strokeDashoffset: PL.inner  });
          gsap.set(cMain,  { strokeDasharray: `${PL.circle} 99999`, strokeDashoffset: PL.circle });
          gsap.set(gInner,  { rotation: 42.43, svgOrigin: SVG_OX });
          gsap.set([gOuter, gCircle], { svgOrigin: SVG_OX });

          // ── Main looping timeline ──────────────────────────────────────────
          const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });

          tl
            // Phase 1 · Genesis — paths trace themselves into existence
            .to(rOuter, { opacity: 1, duration: 0.25, ease: 'power2.in' }, 0)
            .to(rOuter, { strokeDashoffset: 0, stroke: C.ice,   duration: 2.6, ease: 'power3.inOut' }, 0)
            .to(cMain,  { opacity: 1, duration: 0.25, ease: 'power2.in' }, 0.7)
            .to(cMain,  { strokeDashoffset: 0, stroke: C.cyan,  duration: 1.5, ease: 'back.out(1.4)' }, 0.7)
            .to(rInner, { opacity: 1, duration: 0.25, ease: 'power2.in' }, 1.1)
            .to(rInner, { strokeDashoffset: 0, stroke: C.azure, duration: 2.0 }, 1.1)

            // Phase 2 · Ignite — glow activates, strokes pulse white then settle
            .to(wrap, { filter: GLOW.soft, duration: 0.7, ease: 'power2.in' }, '+=0.2')
            .to([rOuter, rInner, cMain], { stroke: C.white, strokeWidth: 56, duration: 0.45, ease: 'power3.in',          stagger: 0.06 })
            .to(wrap,                    { filter: GLOW.hard,   duration: 0.35, ease: 'power3.in' })
            .to([rOuter, rInner, cMain], { stroke: C.cyan,  strokeWidth: 48, duration: 0.8,  ease: 'elastic.out(1,0.5)', stagger: 0.06 })
            .to(wrap,                    { filter: GLOW.medium, duration: 0.5 })

            // Phase 3 · Orbit — inner rect completes 360° around the centre
            .to(gInner, { rotation: 42.43 + 360, svgOrigin: SVG_OX, duration: 4.5, ease: 'power1.inOut' }, '+=0.2')
            .to(rInner, { stroke: C.purple, duration: 1.1, ease: 'none' }, '<')
            .to(rInner, { stroke: C.pink,   duration: 1.1, ease: 'none' }, '<1.1')
            .to(rInner, { stroke: C.azure,  duration: 1.1, ease: 'none' }, '<1.1')
            .to(rInner, { stroke: C.cyan,   duration: 1.2, ease: 'none' }, '<1.1')
            .to(cMain,  { strokeWidth: 72, duration: 2.25, ease: 'sine.inOut', yoyo: true, repeat: 1 }, '<')
            .to(gOuter, { rotation: -13, svgOrigin: SVG_OX, duration: 2.25, ease: 'sine.inOut', yoyo: true, repeat: 1 }, '<')
            .to(wrap,   { filter: GLOW.purple, duration: 1.2, ease: 'sine.inOut' }, '<0.8')
            .to(wrap,   { filter: GLOW.medium, duration: 1.2, ease: 'sine.inOut' }, '<2.2')

            // Phase 4 · Chroma Shift — rapid colour cascade, elastic snap to white
            .to(wrap,   { filter: GLOW.gold, duration: 0.28 }, '+=0.2')
            .to(cMain,  { stroke: C.gold, strokeWidth: 30, duration: 0.32, ease: 'power4.out' })
            .to(rInner, { stroke: C.lime, strokeWidth: 30, duration: 0.32, ease: 'power4.out' }, '<0.1')
            .to(rOuter, { stroke: C.red,  strokeWidth: 30, duration: 0.32, ease: 'power4.out' }, '<0.1')
            .to([rOuter, rInner, cMain], { stroke: C.white, strokeWidth: 50, duration: 1.1, ease: 'elastic.out(1.1,0.45)', stagger: 0.07 }, '+=0.22')
            .to(wrap, { filter: GLOW.hard, duration: 0.4 }, '<0.25')
            .to(wrap, { filter: GLOW.soft, duration: 0.65 }, '<0.45')

            // Phase 5 · Scatter — circle implodes, outer explodes, inner spirals out
            .to(gCircle, { scale: 0.02, opacity: 0, svgOrigin: SVG_OX, duration: 0.52, ease: 'power4.in' }, '+=0.4')
            .to(gOuter,  { scale: 2.1,  opacity: 0, svgOrigin: SVG_OX, duration: 0.62, ease: 'power4.in' }, '<0.04')
            .to(gInner,  { scale: 0.12, rotation: 42.43 + 360 + 110, opacity: 0, svgOrigin: SVG_OX, duration: 0.72, ease: 'power4.in' }, '<0.04')
            .to(wrap,    { filter: GLOW.off, duration: 0.38, ease: 'power2.in' }, '<0.18')

            // ── Reset: instant snap back, seamless loop ──────────────────────
            .set(rOuter,  { strokeDasharray: `${PL.outer} 99999`,  strokeDashoffset: PL.outer,  stroke: C.white, strokeWidth: 50, opacity: 0 })
            .set(rInner,  { strokeDasharray: `${PL.inner} 99999`,  strokeDashoffset: PL.inner,  stroke: C.white, strokeWidth: 50, opacity: 0 })
            .set(cMain,   { strokeDasharray: `${PL.circle} 99999`, strokeDashoffset: PL.circle, stroke: C.white, strokeWidth: 50, opacity: 0 })
            .set(gOuter,  { scale: 1, opacity: 1, rotation: 0,     svgOrigin: SVG_OX })
            .set(gInner,  { scale: 1, opacity: 1, rotation: 42.43, svgOrigin: SVG_OX })
            .set(gCircle, { scale: 1, opacity: 1,                  svgOrigin: SVG_OX })
            .set(wrap,    { filter: GLOW.off })
            .to({}, { duration: 0.55 });

          // Subtle background gradient pulse
          gsap.to(bgGradientRef.current, {
            opacity: 0.12, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1,
          });
        },
      });
    },
    { scope: ctaRef }
  );

  const handleMagnetic = (e, el) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
    gsap.to(el, { x, y, duration: 0.28, ease: 'power2.out' });
  };
  const handleUnMagnetic = (el) => {
    gsap.to(el, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.5)' });
  };

  return (
    <section ref={ctaRef} id="contact" className="relative w-full py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        <AnimatedContent distance={40} duration={1} threshold={0.1}>
          <div
            className="relative rounded-3xl px-6 py-14 sm:px-10 sm:py-20 md:px-20 overflow-hidden text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Animated gradient blob */}
            <div
              ref={bgGradientRef}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(255,255,255,0.08) 0%, transparent 70%)',
                opacity: 0.05,
              }}
            />

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)', borderRadius: '1.5rem 0 0 0' }} />
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
              style={{ background: 'linear-gradient(225deg, rgba(255,255,255,0.07) 0%, transparent 60%)', borderRadius: '0 1.5rem 0 0' }} />

            <div className="relative z-10 flex flex-col items-center gap-8">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                Let's work together
              </span>

              <div style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontFamily: 'Inter, sans-serif', lineHeight: 1.15 }}>
                <SplitText
                  text="Ready to build something untold?"
                  tag="h2"
                  className="font-bold tracking-tight text-white max-w-2xl mx-auto"
                  splitType="chars"
                  from={{ opacity: 0, y: 30, rotationX: -20 }}
                  to={{ opacity: 1, y: 0, rotationX: 0 }}
                  duration={0.8}
                  delay={22}
                  threshold={0.1}
                />
              </div>

              {/* Animated SVG logo formation */}
              <div
                ref={logoWrapRef}
                style={{ width: 'clamp(80px, 13vw, 120px)', height: 'clamp(80px, 13vw, 120px)' }}
              >
                <svg
                  viewBox="0 0 487.29 486.6"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: '100%', height: '100%', overflow: 'visible' }}
                >
                  <g ref={gOuterRef}>
                    <rect
                      ref={rOuterRef}
                      x="25" y="25" width="436.6" height="436.6" rx="120" ry="120"
                      fill="none" stroke="#ffffff" strokeWidth="50" strokeMiterlimit="10"
                      opacity="0"
                    />
                  </g>
                  <g ref={gInnerRef}>
                    <rect
                      ref={rInnerRef}
                      x="58.44" y="51.5" width="373.54" height="381.68" rx="120" ry="120"
                      fill="none" stroke="#ffffff" strokeWidth="50" strokeMiterlimit="10"
                      opacity="0"
                    />
                  </g>
                  <g ref={gCircleRef}>
                    <circle
                      ref={cMainRef}
                      cx="243.3" cy="242.34" r="87.03"
                      fill="none" stroke="#ffffff" strokeWidth="50" strokeMiterlimit="10"
                      opacity="0"
                    />
                  </g>
                </svg>
              </div>

              <p className="max-w-md mx-auto leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}>
                Tell us about your project. We'd love to hear your vision and explore how we can bring it to life.
              </p>

              <div className="flex items-center gap-4 flex-wrap justify-center">
                <a
                  ref={btn1Ref}
                  href="mailto:hello@untoldsoftware.com"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#ffffff', color: '#000000', display: 'inline-flex' }}
                  onMouseMove={e => handleMagnetic(e, btn1Ref.current)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.88)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; handleUnMagnetic(btn1Ref.current); }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  hello@untoldsoftware.com
                </a>
                <a
                  ref={btn2Ref}
                  href="#services"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'inline-flex',
                  }}
                  onMouseMove={e => handleMagnetic(e, btn2Ref.current)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; handleUnMagnetic(btn2Ref.current); }}
                >
                  View services
                </a>
              </div>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
