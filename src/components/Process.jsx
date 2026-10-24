import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AnimatedContent from './ui/AnimatedContent';
import SplitText from './ui/SplitText';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IS_MOB = window.innerWidth < 768;

const steps = [
  {
    number: '01',
    title: 'Discovery',
    description:
      'We start by understanding your business, goals, and users. A thorough discovery phase shapes everything that follows.',
  },
  {
    number: '02',
    title: 'Design',
    description:
      'We craft pixel-perfect designs with attention to detail, ensuring every interaction feels natural and premium.',
  },
  {
    number: '03',
    title: 'Development',
    description:
      'Our engineers build with modern tech stacks, writing clean and maintainable code that scales with your business.',
  },
  {
    number: '04',
    title: 'Launch & Beyond',
    description:
      'We handle deployment, testing, and optimisation. After launch, we remain available for support and iterations.',
  },
];

export default function Process() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const numRefs = useRef([]);
  const connectorRef = useRef(null);

  useGSAP(
    () => {
      // SVG connector path draw (stroke-dashoffset animation)
      const path = connectorRef.current?.querySelector('path');
      if (path) {
        const len = path.getTotalLength?.() || 400;
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: IS_MOB ? 'top 96%' : 'top 65%',
          once: true,
          onEnter: () => {
            gsap.to(path, {
              strokeDashoffset: 0,
              duration: 2.2,
              ease: 'power2.inOut',
              delay: 0.3,
            });
          },
        });
      }

      // Each card: alternating clip-path reveal (left for even, right for odd)
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const fromLeft = i % 2 === 0;

        gsap.set(card, {
          clipPath: fromLeft ? 'inset(0 100% 0 0 round 1rem)' : 'inset(0 0 0 100% round 1rem)',
          opacity: 1,
        });

        ScrollTrigger.create({
          trigger: card,
          start: IS_MOB ? 'top 97%' : 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(card, {
              clipPath: 'inset(0 0% 0 0% round 1rem)',
              duration: 0.92,
              delay: (i % 2) * 0.1,
              ease: 'power3.out',
            });

            // Step number: ghost → visible
            const numEl = numRefs.current[i];
            if (numEl) {
              gsap.fromTo(
                numEl,
                { opacity: 0.04, scale: 1.3 },
                { opacity: 0.08, scale: 1, duration: 1, delay: (i % 2) * 0.1 + 0.4, ease: 'power2.out' }
              );
            }
          },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="process" className="relative w-full py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <AnimatedContent distance={30} duration={0.8} threshold={0.1}>
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              How we work
            </span>
          </AnimatedContent>
          <div style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', fontFamily: 'Inter, sans-serif' }}>
            <SplitText
              text="A process designed for excellence."
              tag="h2"
              className="font-bold tracking-tight text-white"
              splitType="words"
              from={{ opacity: 0, y: 35 }}
              to={{ opacity: 1, y: 0 }}
              duration={0.9}
              delay={45}
              threshold={0.1}
            />
          </div>
        </div>

        {/* Connector SVG (desktop only, positioned over the grid) */}
        <div
          ref={connectorRef}
          className="hidden md:block absolute pointer-events-none"
          style={{ left: '50%', top: 0, width: '2px', height: '100%' }}
          aria-hidden
        >
          <svg
            viewBox="0 0 2 100"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%' }}
          >
            <path
              d="M1 0 L1 100"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={el => (cardRefs.current[i] = el)}
              className="relative p-8 rounded-2xl flex flex-col gap-5 h-full"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(255,255,255,0.07)',
                opacity: 1,
              }}
              onMouseEnter={e => {
                const card = e.currentTarget;
                gsap.to(card, {
                  background: 'rgba(255,255,255,0.055)',
                  borderColor: 'rgba(255,255,255,0.14)',
                  y: -4,
                  duration: 0.3,
                  ease: 'power2.out',
                });
                const num = numRefs.current[i];
                if (num) {
                  gsap.to(num, { opacity: 0.18, scale: 1.05, duration: 0.35 });
                }
              }}
              onMouseLeave={e => {
                const card = e.currentTarget;
                gsap.to(card, {
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.07)',
                  y: 0,
                  duration: 0.4,
                  ease: 'power2.out',
                });
                const num = numRefs.current[i];
                if (num) {
                  gsap.to(num, { opacity: 0.08, scale: 1, duration: 0.35 });
                }
              }}
            >
              {/* Step dot indicator */}
              <div
                className="absolute top-6 right-6 w-2 h-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.25)', boxShadow: '0 0 8px rgba(255,255,255,0.2)' }}
              />

              <span
                ref={el => (numRefs.current[i] = el)}
                className="text-5xl font-black tracking-tighter"
                style={{
                  color: 'rgba(255,255,255,1)',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: 1,
                  opacity: 0.04,
                }}
              >
                {step.number}
              </span>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
