import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import AnimatedContent from './ui/AnimatedContent';
import SplitText from './ui/SplitText';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IS_MOB = window.innerWidth < 768;
const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
const GAME_URL = `${import.meta.env.BASE_URL}game/index.html`;
const POSTER_URL = `${import.meta.env.BASE_URL}game/poster.jpg`;

const game = {
  name: 'The Last Ember',
  category: 'Browser Game',
  description:
    'A 3D action-adventure that runs right in your browser. Fight across tiny planets with a living blade, help the moon folk, and take on a boss on every world — built with three.js, with every model, sound and song generated in code.',
  year: '2026',
  tags: ['three.js', 'WebGL', 'Procedural audio', 'Desktop & mobile'],
};

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5 3.5v11l9-5.5-9-5.5z" fill="currentColor" />
    </svg>
  );
}

function GameCard() {
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef(null);
  const wrapRef = useRef(null);

  // Pause the game when it scrolls out of view so it never runs in the background.
  useEffect(() => {
    if (!playing || !wrapRef.current) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.25) {
          try {
            frameRef.current?.contentWindow?.game?.autoPause();
          } catch {
            /* frame not ready yet */
          }
        }
      },
      { threshold: [0, 0.25, 1] }
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [playing]);

  const hideCursor = () => window.dispatchEvent(new Event('cursor:hide'));
  const showCursor = () => window.dispatchEvent(new Event('cursor:show'));

  // Phones: the game opens as its own full-screen page, so the card is a poster with the details below it.
  if (IS_MOB || IS_TOUCH) {
    return (
      <div
        className="w-full overflow-hidden rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <a href={`${GAME_URL}?from=site`} className="relative block w-full" style={{ aspectRatio: '16 / 9' }} aria-label={`Play ${game.name}`}>
          <img src={POSTER_URL} alt={`${game.name} title screen`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.05), rgba(0,0,0,0.45))' }}
          >
            <span
              className="flex items-center justify-center rounded-full"
              style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.92)', color: '#000', boxShadow: '0 0 40px rgba(255,150,60,0.5)' }}
            >
              <PlayIcon />
            </span>
          </span>
        </a>
        <div className="p-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-xs px-3 py-1 rounded-lg font-medium"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {game.category}
            </span>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {game.year}
            </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            {game.name}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {game.description}
          </p>
          <a
            href={`${GAME_URL}?from=site`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold mt-1"
            style={{ background: '#fff', color: '#000' }}
          >
            <PlayIcon />
            Play now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        aspectRatio: '16 / 9',
        background: '#05030a',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
      }}
      onMouseEnter={playing ? hideCursor : undefined}
      onMouseLeave={playing ? showCursor : undefined}
    >
      {playing ? (
        <iframe
          ref={frameRef}
          src={GAME_URL}
          title={game.name}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
          allow="fullscreen; autoplay; gamepad"
          allowFullScreen
        />
      ) : (
        <>
          <img
            src={POSTER_URL}
            alt={`${game.name} title screen`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.1) 100%)' }}
          />
          <div className="absolute left-0 right-0 bottom-0 p-5 sm:p-8 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-xs px-3 py-1 rounded-lg font-medium"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {game.category}
              </span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {game.year}
              </span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              {game.name}
            </h3>
            <p className="text-sm sm:text-base leading-relaxed max-w-2xl" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {game.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer"
                style={{ background: '#fff', color: '#000' }}
              >
                <PlayIcon />
                Play here
              </button>
              <a
                href={`${GAME_URL}?from=site`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium"
                style={{ color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                Open full page
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Work() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: IS_MOB ? 'top 95%' : 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(cardRef.current, {
            clipPath: 'inset(0 0% 0 0 round 16px)',
            duration: 1.0,
            ease: 'power3.out',
          });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="work" className="relative w-full py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <AnimatedContent distance={30} duration={0.8} threshold={0.1}>
              <span
                className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Selected work
              </span>
            </AnimatedContent>
            <div style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', fontFamily: 'Inter, sans-serif' }}>
              <SplitText
                text="Play our latest project."
                tag="h2"
                className="font-bold tracking-tight text-white"
                splitType="words"
                from={{ opacity: 0, y: 35 }}
                to={{ opacity: 1, y: 0 }}
                duration={0.9}
                delay={45}
                threshold={0.1}
                textAlign="left"
              />
            </div>
          </div>
          <AnimatedContent distance={20} duration={0.8} threshold={0.1}>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-sm font-medium shrink-0"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={e => {
                gsap.to(e.currentTarget, { color: '#fff', x: 3, duration: 0.25 });
              }}
              onMouseLeave={e => {
                gsap.to(e.currentTarget, { color: 'rgba(255,255,255,0.5)', x: 0, duration: 0.3 });
              }}
            >
              Start your project
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </AnimatedContent>
        </div>

        {/* The game */}
        <div ref={cardRef} style={{ clipPath: 'inset(0 100% 0 0 round 16px)' }}>
          <GameCard />
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-6">
          {game.tags.map(t => (
            <span
              key={t}
              className="text-xs px-3 py-1 rounded-lg font-medium"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {t}
            </span>
          ))}
          <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {IS_TOUCH ? 'Best played with your phone turned sideways.' : 'Click the game, then use your keyboard and mouse.'}
          </span>
        </div>
      </div>
    </section>
  );
}
