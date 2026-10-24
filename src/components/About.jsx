import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AnimatedContent from './ui/AnimatedContent';
import SplitText from './ui/SplitText';
import Cubes from './ui/Cubes';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IS_MOB = window.innerWidth < 768;

const stats = [
  { value: '50+', label: 'Projects delivered', num: 50, suffix: '+' },
  { value: '98%', label: 'Client satisfaction', num: 98, suffix: '%' },
  { value: '5+', label: 'Years of experience', num: 5, suffix: '+' },
  { value: '12', label: 'Expert team members', num: 12, suffix: '' },
];

export default function About() {
  const sectionRef = useRef(null);
  const statValueRefs = useRef([]);
  const statCardRefs = useRef([]);
  const cubesWrapRef = useRef(null);

  useGSAP(
    () => {
      // Stat cards: stagger clip-path reveal + count-up numbers
      statCardRefs.current.forEach((card, i) => {
        if (!card) return;

        gsap.set(card, { clipPath: 'inset(0 0 100% 0 round 1rem)', opacity: 1 });

        ScrollTrigger.create({
          trigger: card,
          start: IS_MOB ? 'top 97%' : 'top 85%',
          once: true,
          onEnter: () => {
            // Card reveal
            gsap.to(card, {
              clipPath: 'inset(0 0 0% 0 round 1rem)',
              duration: 0.75,
              delay: i * 0.1,
              ease: 'power3.out',
            });

            // Number count-up
            const valueEl = statValueRefs.current[i];
            if (!valueEl) return;
            const stat = stats[i];
            const counter = { val: 0 };

            gsap.to(counter, {
              val: stat.num,
              duration: 2.2,
              delay: i * 0.1 + 0.4,
              ease: 'power2.out',
              onUpdate: () => {
                valueEl.textContent = Math.round(counter.val) + stat.suffix;
              },
            });

            // Card glow pulse after reveal
            gsap.fromTo(
              card,
              { boxShadow: '0 0 0px rgba(255,255,255,0)' },
              {
                boxShadow: '0 0 24px rgba(255,255,255,0.06)',
                duration: 0.9,
                delay: i * 0.1 + 0.8,
                yoyo: true,
                repeat: 1,
                ease: 'sine.inOut',
              }
            );
          },
        });
      });

      // Cubes container: parallax slide
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: IS_MOB ? 'top 96%' : 'top 70%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            cubesWrapRef.current,
            { opacity: 0, scale: 0.92, rotationY: 8 },
            { opacity: 1, scale: 1, rotationY: 0, duration: 1.2, ease: 'power3.out', delay: 0.3 }
          );
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full py-20 sm:py-28 px-4 sm:px-6 overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div className="flex flex-col gap-8">
            <AnimatedContent distance={30} duration={0.8} threshold={0.1}>
              <span
                className="inline-block text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                About untold.
              </span>
            </AnimatedContent>

            <div
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.2,
              }}
            >
              <SplitText
                text="We turn ideas into exceptional digital realities."
                tag="h2"
                className="font-bold tracking-tight text-white"
                splitType="chars"
                from={{ opacity: 0, y: 20, rotationX: -30 }}
                to={{ opacity: 1, y: 0, rotationX: 0 }}
                duration={0.7}
                delay={20}
                threshold={0.1}
                textAlign="left"
              />
            </div>

            <AnimatedContent distance={25} duration={0.8} delay={0.2} threshold={0.1}>
              <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
                untold. is a boutique digital studio focused on crafting premium web and mobile products.
                We combine strategic thinking with flawless execution — delivering products that are
                as functional as they are beautiful.
              </p>
            </AnimatedContent>

            <AnimatedContent distance={25} duration={0.8} delay={0.3} threshold={0.1}>
              <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
                Every project is a collaboration. We work closely with our clients to understand
                their vision and translate it into experiences their users love.
              </p>
            </AnimatedContent>

            {/* Stats with count-up */}
            <div className="grid grid-cols-2 gap-5 mt-2">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  ref={el => (statCardRefs.current[i] = el)}
                  className="flex flex-col gap-1 p-5 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(255,255,255,0.08)',
                    opacity: 1,
                  }}
                  onMouseEnter={e => {
                    gsap.to(e.currentTarget, {
                      background: 'rgba(255,255,255,0.06)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      y: -3,
                      duration: 0.3,
                      ease: 'power2.out',
                    });
                  }}
                  onMouseLeave={e => {
                    gsap.to(e.currentTarget, {
                      background: 'rgba(255,255,255,0.03)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      y: 0,
                      duration: 0.4,
                      ease: 'power2.out',
                    });
                  }}
                >
                  <span
                    ref={el => (statValueRefs.current[i] = el)}
                    className="text-3xl font-bold text-white tracking-tight"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    0{stat.suffix}
                  </span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cubes visual */}
          <div ref={cubesWrapRef} style={{ opacity: 0 }}>
            <div className="flex justify-center items-center">
              <div
                className="rounded-3xl overflow-hidden p-6 flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  width: '100%',
                  maxWidth: '480px',
                  aspectRatio: '1',
                }}
              >
                <Cubes
                  gridSize={8}
                  maxAngle={40}
                  radius={3}
                  borderStyle="1px solid rgba(255,255,255,0.85)"
                  faceColor="#0a0a0a"
                  rippleColor="#ffffff"
                  rippleSpeed={0.6}
                  autoAnimate={true}
                  autoAnimateSpeed={0.005}
                  duration={{ enter: 0.9, leave: 1.8 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
