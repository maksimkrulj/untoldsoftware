import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const brandRef = useRef(null);
  const linkRefs = useRef([]);
  const ctaRef = useRef(null);
  const hamburgerRef = useRef(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Entrance animation ────────────────────────────────────────────────────
  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 0.25 });

      tl.fromTo(
        logoRef.current,
        { scale: 0, rotationY: -180, opacity: 0 },
        { scale: 1, rotationY: 0, opacity: 1, duration: 0.75, ease: 'back.out(1.7)' }
      );

      const letters = brandRef.current?.querySelectorAll('span');
      if (letters?.length) {
        tl.fromTo(
          letters,
          { opacity: 0, y: 18, rotationX: -70 },
          { opacity: 1, y: 0, rotationX: 0, stagger: 0.042, duration: 0.5, ease: 'power3.out' },
          '-=0.42'
        );
      }

      const validLinks = linkRefs.current.filter(Boolean);
      tl.fromTo(
        validLinks,
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, stagger: 0.07, duration: 0.5, ease: 'power2.out' },
        '-=0.28'
      );

      tl.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.6)' },
        '-=0.32'
      );

      if (hamburgerRef.current) {
        tl.fromTo(hamburgerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.4');
      }
    },
    { scope: navRef }
  );

  // ── Brand hover: logo jumps+spins, letters do a wave ──────────────────────
  const handleBrandEnter = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const letters = brandRef.current?.querySelectorAll('span');

    // Logo: jump up → spin 360 → elastic fall back
    gsap.timeline({ onComplete: () => { isAnimatingRef.current = false; } })
      .to(logoRef.current, {
        y: -16,
        scale: 1.25,
        rotation: '+=360',
        duration: 0.42,
        ease: 'back.out(2)',
      })
      .to(logoRef.current, {
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: 'elastic.out(1.1, 0.4)',
      });

    // Letters: wave — each jumps up then falls with stagger creating ripple
    if (letters?.length) {
      gsap.timeline()
        .to(letters, {
          y: -12,
          scale: 1.18,
          color: '#ffffff',
          duration: 0.22,
          stagger: 0.055,
          ease: 'back.out(2.5)',
        })
        .to(letters, {
          y: 0,
          scale: 1,
          duration: 0.38,
          stagger: 0.055,
          ease: 'elastic.out(1.2, 0.45)',
        });
    }
  };

  // ── Magnetic effect on nav links ──────────────────────────────────────────
  const handleMagneticMove = (e, el) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.38;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.38;
    gsap.to(el, { x, y, duration: 0.28, ease: 'power2.out' });
  };

  const handleMagneticLeave = (el) => {
    gsap.to(el, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.5)' });
  };

  const links = ['Services', 'Work', 'About', 'Contact'];
  const brand = 'untold.'.split('');

  return (
    <nav
      ref={navRef}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300"
      style={{ width: 'calc(100% - 48px)', maxWidth: '900px' }}
    >
      <div
        className="flex items-center justify-between px-5 py-3 rounded-2xl"
        style={{
          background: scrolled ? 'rgba(10,10,10,0.85)' : 'rgba(10,10,10,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Brand — hover triggers wave + logo spin */}
        <a
          href="#"
          className="flex items-center gap-2.5 no-underline"
          style={{ perspective: '400px' }}
          onMouseEnter={handleBrandEnter}
        >
          <img
            ref={logoRef}
            src="/logo.svg"
            alt="untold logo"
            className="h-6 w-6"
            style={{ opacity: 0, display: 'inline-block' }}
          />
          <span
            ref={brandRef}
            className="font-semibold text-xl tracking-tight"
            style={{ fontFamily: 'Inter, sans-serif', display: 'flex', perspective: '300px' }}
          >
            {brand.map((letter, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  color: '#fff',
                  opacity: 0,
                  transformOrigin: '50% 100%',
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((link, i) => (
            <a
              key={link}
              ref={el => (linkRefs.current[i] = el)}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium"
              style={{ color: 'rgba(255,255,255,0.65)', display: 'inline-block', opacity: 0 }}
              onMouseMove={e => handleMagneticMove(e, linkRefs.current[i])}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                handleMagneticLeave(linkRefs.current[i]);
              }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="hidden md:block" style={{ opacity: 0 }}>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#ffffff', color: '#000000', display: 'inline-block' }}
            onMouseMove={e => {
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
              const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
              gsap.to(el, { x, y, duration: 0.28, ease: 'power2.out' });
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.88)'; }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#ffffff';
              gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
            }}
          >
            Get in touch
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={hamburgerRef}
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          style={{ opacity: 0 }}
        >
          <span className="block h-0.5 w-5 bg-white transition-all duration-200"
            style={{ transform: menuOpen ? 'translateY(6px) rotate(45deg)' : '' }} />
          <span className="block h-0.5 w-5 bg-white transition-all duration-200"
            style={{ opacity: menuOpen ? 0 : 1 }} />
          <span className="block h-0.5 w-5 bg-white transition-all duration-200"
            style={{ transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : '' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden mt-2 rounded-2xl px-5 py-4 flex flex-col gap-4"
          style={{
            background: 'rgba(10,10,10,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {links.map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link}
            </a>
          ))}
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black"
            onClick={() => setMenuOpen(false)}
          >
            Get in touch
          </a>
        </div>
      )}
    </nav>
  );
}
