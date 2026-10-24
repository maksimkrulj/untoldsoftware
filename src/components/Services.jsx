import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitText from './ui/SplitText';
import AnimatedContent from './ui/AnimatedContent';
import TiltedCard from './ui/TiltedCard';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IS_MOB = window.innerWidth < 768;

const WebIcon = () => (
  <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="9" width="50" height="36" rx="5" stroke="white" strokeWidth="1.5" opacity="0.9" />
    <line x1="2" y1="19" x2="52" y2="19" stroke="white" strokeWidth="1.5" opacity="0.3" />
    <circle cx="9" cy="14" r="1.8" fill="white" opacity="0.45" />
    <circle cx="15" cy="14" r="1.8" fill="white" opacity="0.45" />
    <circle cx="21" cy="14" r="1.8" fill="white" opacity="0.45" />
    <path d="M18 31l-6 4 6 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M36 31l6 4-6 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="30" y1="27" x2="24" y2="43" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
  </svg>
);

const MobileIcon = () => (
  <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="4" width="24" height="46" rx="5" stroke="white" strokeWidth="1.5" opacity="0.9" />
    <line x1="15" y1="13" x2="39" y2="13" stroke="white" strokeWidth="1.5" opacity="0.3" />
    <line x1="15" y1="41" x2="39" y2="41" stroke="white" strokeWidth="1.5" opacity="0.3" />
    <circle cx="27" cy="46" r="1.8" fill="white" opacity="0.5" />
    <rect x="20" y="19" width="6" height="6" rx="1.5" fill="white" opacity="0.45" />
    <rect x="28" y="19" width="6" height="6" rx="1.5" fill="white" opacity="0.45" />
    <rect x="20" y="27" width="6" height="6" rx="1.5" fill="white" opacity="0.45" />
    <rect x="28" y="27" width="6" height="6" rx="1.5" fill="white" opacity="0.45" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="27" cy="27" r="22" stroke="white" strokeWidth="1.5" opacity="0.9" />
    <ellipse cx="27" cy="27" rx="9" ry="22" stroke="white" strokeWidth="1.5" opacity="0.5" />
    <line x1="5" y1="27" x2="49" y2="27" stroke="white" strokeWidth="1.5" opacity="0.3" />
    <path d="M10 19h34" stroke="white" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
    <path d="M10 35h34" stroke="white" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
  </svg>
);

const services = [
  {
    title: 'Web Applications',
    description:
      'Custom web apps built for scale. From dashboards to SaaS platforms, we engineer fast, reliable, and beautiful products.',
    tags: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
    icon: <WebIcon />,
  },
  {
    title: 'Mobile Apps',
    description:
      'Native and cross-platform mobile experiences. iOS & Android apps that feel premium and perform flawlessly.',
    tags: ['React Native', 'Swift', 'Kotlin', 'Expo'],
    icon: <MobileIcon />,
  },
  {
    title: 'Websites & Landing Pages',
    description:
      'Conversion-focused websites with stunning design. Built to impress, optimised to convert.',
    tags: ['Design', 'Animation', 'SEO', 'Performance'],
    icon: <GlobeIcon />,
  },
];

function ServiceCard({ title, description, tags, icon, index }) {
  const cardRef = useRef(null);
  const iconWrapRef = useRef(null);
  const tagRefs = useRef([]);
  const glowRef = useRef(null);

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card) return;

      // Initial hidden state
      if (IS_MOB) {
        gsap.set(card, { opacity: 0, y: 28 });
      } else {
        gsap.set(card, { opacity: 0, y: 40, scale: 0.97 });
      }

      ScrollTrigger.create({
        trigger: card,
        start: IS_MOB ? 'top 97%' : 'top 88%',
        once: true,
        onEnter: () => {
          if (IS_MOB) {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: index * 0.12,
              ease: 'power3.out',
            });
          } else {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.85,
              delay: index * 0.15,
              ease: 'power3.out',
            });
          }

          // Tags pop in after card reveals
          const validTags = tagRefs.current.filter(Boolean);
          gsap.fromTo(
            validTags,
            { scale: 0, opacity: 0, y: 6 },
            {
              scale: 1,
              opacity: 1,
              y: 0,
              stagger: 0.065,
              duration: 0.42,
              ease: 'back.out(2.2)',
              delay: index * 0.14 + 0.52,
            }
          );
        },
      });

      // Icon: continuous float loop
      gsap.to(iconWrapRef.current, {
        y: -10,
        duration: 2.2 + index * 0.35,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // Glow pulse on card
      gsap.to(glowRef.current, {
        opacity: 0.06,
        duration: 2.5 + index * 0.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      className="relative rounded-2xl p-6 sm:p-8 flex flex-col gap-5 h-full"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        gsap.to(e.currentTarget, {
          background: 'rgba(255,255,255,0.06)',
          borderColor: 'rgba(255,255,255,0.18)',
          y: -5,
          duration: 0.32,
          ease: 'power2.out',
        });
      }}
      onMouseLeave={e => {
        gsap.to(e.currentTarget, {
          background: 'rgba(255,255,255,0.03)',
          borderColor: 'rgba(255,255,255,0.08)',
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
        });
      }}
    >
      {/* Animated glow blob */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)',
          opacity: 0,
        }}
      />

      <div ref={iconWrapRef}>
        <TiltedCard
          iconContent={icon}
          containerHeight="170px"
          imageHeight="140px"
          imageWidth="140px"
          scaleOnHover={1.06}
          rotateAmplitude={10}
        />
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        <h3
          className="text-xl font-semibold text-white tracking-tight"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto relative z-10">
        {tags.map((tag, i) => (
          <span
            key={tag}
            ref={el => (tagRefs.current[i] = el)}
            className="text-xs px-3 py-1 rounded-lg font-medium"
            style={{
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.08)',
              opacity: 0,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section id="services" className="relative w-full py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <AnimatedContent distance={30} duration={0.8} threshold={0.1}>
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              What we do
            </span>
          </AnimatedContent>

          <div style={{ fontSize: 'clamp(1.75rem, 4vw, 3.25rem)', fontFamily: 'Inter, sans-serif' }}>
            <SplitText
              text="Services built for the modern web."
              tag="h2"
              className="font-bold tracking-tight text-white"
              splitType="words"
              from={{ opacity: 0, y: 40, rotationX: -15 }}
              to={{ opacity: 1, y: 0, rotationX: 0 }}
              duration={0.9}
              delay={50}
              threshold={0.1}
            />
          </div>

          <AnimatedContent distance={20} duration={0.8} delay={0.2} threshold={0.1}>
            <p
              className="mt-5 max-w-lg mx-auto text-center leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}
            >
              We partner with startups and established brands to deliver digital products that stand out.
            </p>
          </AnimatedContent>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <ServiceCard key={s.title} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
