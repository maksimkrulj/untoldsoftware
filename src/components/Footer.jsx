import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const IS_MOB = window.innerWidth < 768;

const footerLinks = {
  Services: [
    { label: 'Web Applications', href: '/web-applications', internal: true },
    { label: 'Mobile Apps', href: '/mobile-apps', internal: true },
    { label: 'Websites', href: '/websites', internal: true },
    { label: 'UI/UX Design', href: '/ui-ux-design', internal: true },
  ],
  Company: [
    { label: 'About', href: '/about', internal: true },
    { label: 'Work', href: '/work', internal: true },
    { label: 'Process', href: '/process', internal: true },
    { label: 'Contact', href: '/contact', internal: true },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy', internal: true },
    { label: 'Terms of Service', href: '/terms', internal: true },
  ],
};

export default function Footer() {
  const footerRef = useRef(null);
  const brandColRef = useRef(null);
  const columnRefs = useRef([]);
  const borderLineRef = useRef(null);
  const logoRef = useRef(null);
  const bottomBarRef = useRef(null);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: footerRef.current,
        start: IS_MOB ? 'top 97%' : 'top 85%',
        once: true,
        onEnter: () => {
          // Logo bounce in
          gsap.fromTo(
            logoRef.current,
            { scale: 0, rotation: -180, opacity: 0 },
            { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.7)' }
          );

          // Brand column fade up
          gsap.fromTo(
            brandColRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, delay: 0.15, ease: 'power3.out' }
          );

          // Link columns stagger in
          const validCols = columnRefs.current.filter(Boolean);
          gsap.fromTo(
            validCols,
            { opacity: 0, y: 35, clipPath: 'inset(0 0 100% 0)' },
            {
              opacity: 1,
              y: 0,
              clipPath: 'inset(0 0 0% 0)',
              stagger: 0.1,
              duration: 0.75,
              delay: 0.25,
              ease: 'power3.out',
            }
          );

          // Border line draw left to right
          gsap.fromTo(
            borderLineRef.current,
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 1.4, delay: 0.6, ease: 'power3.out' }
          );

          // Bottom bar fade
          gsap.fromTo(
            bottomBarRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.6, delay: 1.0, ease: 'power2.out' }
          );
        },
      });
    },
    { scope: footerRef }
  );

  return (
    <footer
      ref={footerRef}
      className="relative w-full px-4 sm:px-6 py-16 overflow-hidden"
      style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 mb-16">
          {/* Brand column */}
          <div ref={brandColRef} className="col-span-2 md:col-span-2 flex flex-col gap-5" style={{ opacity: 0 }}>
            <div className="flex items-center gap-2.5">
              <img
                ref={logoRef}
                src="/logo.svg"
                alt="untold logo"
                className="h-6 w-6"
                style={{ opacity: 0 }}
              />
              <span
                className="text-white font-semibold text-base tracking-tight"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                untold.
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              A boutique digital studio crafting premium web and mobile products for ambitious brands.
            </p>
            <a
              href="mailto:hello@untoldsoftware.com"
              className="text-sm transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => {
                gsap.to(e.target, { color: '#fff', x: 3, duration: 0.25 });
              }}
              onMouseLeave={e => {
                gsap.to(e.target, { color: 'rgba(255,255,255,0.4)', x: 0, duration: 0.3 });
              }}
            >
              hello@untoldsoftware.com
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links], gi) => (
            <div
              key={group}
              ref={el => (columnRefs.current[gi] = el)}
              className="flex flex-col gap-4"
              style={{ opacity: 0 }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {group}
              </span>
              <div className="flex flex-col gap-3">
                {links.map(link =>
                  link.internal ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="text-sm"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                      onMouseEnter={e => gsap.to(e.target, { color: '#fff', x: 4, duration: 0.22 })}
                      onMouseLeave={e => gsap.to(e.target, { color: 'rgba(255,255,255,0.45)', x: 0, duration: 0.28 })}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm"
                      style={{ color: 'rgba(255,255,255,0.45)' }}
                      onMouseEnter={e => gsap.to(e.target, { color: '#fff', x: 4, duration: 0.22 })}
                      onMouseLeave={e => gsap.to(e.target, { color: 'rgba(255,255,255,0.45)', x: 0, duration: 0.28 })}
                    >
                      {link.label}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Animated border line */}
        <div
          ref={borderLineRef}
          style={{
            height: '1px',
            background: 'rgba(255,255,255,0.06)',
            marginBottom: '2rem',
            transform: 'scaleX(0)',
            transformOrigin: 'left center',
          }}
        />

        {/* Bottom bar */}
        <div
          ref={bottomBarRef}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ opacity: 0 }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} untold. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Built with precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
