import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const isPointer = useRef(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    dot.style.display = 'block';
    ring.style.display = 'block';
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -500, y: -500 });

    const onMove = (e) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'none' });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.38, ease: 'power3.out' });
    };

    const onDown = () => {
      gsap.to(ring, { scale: 0.65, duration: 0.18, ease: 'power2.out' });
      gsap.to(dot, { scale: 1.8, duration: 0.18, ease: 'power2.out' });
    };

    const onUp = () => {
      gsap.to(ring, { scale: isPointer.current ? 1.7 : 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' });
      gsap.to(dot, { scale: 1, duration: 0.3 });
    };

    const onLinkEnter = () => {
      isPointer.current = true;
      gsap.to(ring, { scale: 1.7, borderColor: 'rgba(255,255,255,0.75)', duration: 0.3, ease: 'power2.out' });
      gsap.to(dot, { scale: 0.4, duration: 0.3 });
    };

    const onLinkLeave = () => {
      isPointer.current = false;
      gsap.to(ring, { scale: 1, borderColor: 'rgba(255,255,255,0.35)', duration: 0.4, ease: 'power2.out' });
      gsap.to(dot, { scale: 1, duration: 0.3 });
    };

    // Embedded content (the game iframe) swallows mouse events, so it asks the cursor to step aside.
    const onHide = () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    const onShow = () => gsap.to([dot, ring], { opacity: 1, duration: 0.2 });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    window.addEventListener('cursor:hide', onHide);
    window.addEventListener('cursor:show', onShow);

    const updateLinks = () => {
      const interactables = document.querySelectorAll('a, button, [data-cursor]');
      interactables.forEach(el => {
        el.addEventListener('mouseenter', onLinkEnter);
        el.addEventListener('mouseleave', onLinkLeave);
      });
      return interactables;
    };

    let links = updateLinks();
    const observer = new MutationObserver(() => {
      links.forEach(el => {
        el.removeEventListener('mouseenter', onLinkEnter);
        el.removeEventListener('mouseleave', onLinkLeave);
      });
      links = updateLinks();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      window.removeEventListener('cursor:hide', onHide);
      window.removeEventListener('cursor:show', onShow);
      links.forEach(el => {
        el.removeEventListener('mouseenter', onLinkEnter);
        el.removeEventListener('mouseleave', onLinkLeave);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          background: '#fff',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'difference',
          display: 'none',
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          display: 'none',
        }}
      />
    </>
  );
}
