import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Hyperspeed from './ui/HyperSpeed';
import SplitText from './ui/SplitText';
import AnimatedContent from './ui/AnimatedContent';

gsap.registerPlugin(useGSAP);

const heroOptions = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x444444,
    brokenLines: 0x444444,
    leftCars: [0xffffff, 0xdddddd, 0xaaaaaa],
    rightCars: [0xffffff, 0xdddddd, 0xaaaaaa],
    sticks: 0x555555,
  },
};

export default function Hero() {
  const heroRef = useRef(null);
  const btn1Ref = useRef(null);
  const btn2Ref = useRef(null);
  const scrollDotRef = useRef(null);
  const scrollLineRef = useRef(null);

  // Magnetic button helpers
  const handleMagnetic = (e, el) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.45;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.45;
    gsap.to(el, { x, y, duration: 0.3, ease: 'power2.out' });
  };
  const handleUnMagnetic = (el) => {
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
  };

  useGSAP(
    () => {
      // Pulse animation for scroll dot
      gsap.to(scrollDotRef.current, {
        scale: 1.8,
        opacity: 0.3,
        duration: 1.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // Scroll line: loop fade-wipe from top to bottom
      gsap.fromTo(
        scrollLineRef.current,
        { scaleY: 0, transformOrigin: 'top center', opacity: 0.8 },
        {
          scaleY: 1,
          opacity: 0,
          duration: 1.1,
          ease: 'power2.in',
          repeat: -1,
          repeatDelay: 0.4,
        }
      );

      // Floating particle dots
      const particles = heroRef.current?.querySelectorAll('.hero-particle');
      particles?.forEach((p, i) => {
        gsap.to(p, {
          y: -30 - i * 8,
          x: (i % 2 === 0 ? 1 : -1) * (10 + i * 5),
          opacity: 0,
          duration: 2 + i * 0.4,
          ease: 'power1.out',
          repeat: -1,
          repeatDelay: i * 0.3,
          delay: i * 0.25,
        });
      });
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ height: '100dvh', minHeight: '600px' }}
    >
      {/* Hyperspeed background */}
      <div className="absolute inset-0 z-0">
        <Hyperspeed effectOptions={heroOptions} />
      </div>

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.92) 85%, rgba(0,0,0,1) 100%)',
        }}
      />

      {/* Extra bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: '180px', background: 'linear-gradient(to bottom, transparent, #000000)' }}
      />

      {/* Floating ambient particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="hero-particle absolute rounded-full pointer-events-none z-10"
          style={{
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            background: 'rgba(255,255,255,0.6)',
            left: `${15 + i * 13}%`,
            bottom: `${25 + (i % 3) * 10}%`,
            opacity: 0.4 + i * 0.05,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center">
        <div
          className="max-w-4xl mx-auto"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontFamily: 'Inter, sans-serif' }}
        >
          <SplitText
            text="We build digital products that matter."
            tag="h1"
            className="text-white font-bold leading-tight tracking-tight"
            splitType="words"
            from={{ opacity: 0, y: 60, rotationX: -20 }}
            to={{ opacity: 1, y: 0, rotationX: 0 }}
            duration={1.1}
            delay={60}
            threshold={0}
          />
        </div>

        <AnimatedContent distance={30} duration={0.9} delay={0.6} threshold={0}>
          <p
            className="mt-6 max-w-xl mx-auto text-center leading-relaxed"
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 'clamp(1rem, 2vw, 1.125rem)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            From sleek websites to powerful mobile apps — we craft premium digital experiences for ambitious brands.
          </p>
        </AnimatedContent>

        <AnimatedContent distance={20} duration={0.8} delay={0.8} threshold={0}>
          <div className="mt-10 flex items-center gap-4 flex-wrap justify-center">
            <a
              ref={btn1Ref}
              href="#contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: '#ffffff', color: '#000000', display: 'inline-flex' }}
              onMouseMove={e => handleMagnetic(e, btn1Ref.current)}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.88)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ffffff';
                handleUnMagnetic(btn1Ref.current);
              }}
            >
              Start a project
            </a>
            <a
              ref={btn2Ref}
              href="#work"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold"
              style={{
                background: 'rgba(255,255,255,0.07)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'inline-flex',
              }}
              onMouseMove={e => handleMagnetic(e, btn2Ref.current)}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                handleUnMagnetic(btn2Ref.current);
              }}
            >
              See our work
            </a>
          </div>
        </AnimatedContent>

        {/* Scroll hint */}
        <AnimatedContent distance={15} duration={0.8} delay={1.2} threshold={0}>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
              scroll
            </span>
            <div className="relative flex flex-col items-center">
              <div
                ref={scrollDotRef}
                className="w-1.5 h-1.5 rounded-full bg-white mb-1"
                style={{ opacity: 0.6 }}
              />
              <div
                ref={scrollLineRef}
                className="w-px h-10"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
                  transformOrigin: 'top center',
                }}
              />
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
