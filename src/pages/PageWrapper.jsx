import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PageWrapper({ children }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.style.scrollSnapType = 'none';
    return () => { document.documentElement.style.scrollSnapType = ''; };
  }, []);

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50" style={{ width: 'calc(100% - 48px)', maxWidth: '900px' }}>
        <div
          className="flex items-center justify-between px-5 py-3 rounded-2xl"
          style={{
            background: 'rgba(10,10,10,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <img src="/logo.svg" alt="untold logo" className="h-6 w-6" />
            <span className="text-white font-semibold text-xl tracking-tight">untold.</span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.65)' }}
            onMouseEnter={e => (e.target.style.color = '#fff')}
            onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.65)')}
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-36 pb-24">
        {children}
      </div>

      <div
        className="py-8 text-center text-xs"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)' }}
      >
        © {new Date().getFullYear()} untold. All rights reserved. &nbsp;·&nbsp;{' '}
        <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.35)' }}>Privacy Policy</Link>
        &nbsp;·&nbsp;
        <Link to="/terms" style={{ color: 'rgba(255,255,255,0.35)' }}>Terms of Service</Link>
      </div>
    </div>
  );
}
