import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center px-6"
      style={{ background: '#000', fontFamily: 'Inter, sans-serif' }}
    >
      <Link to="/" className="flex items-center gap-2.5 no-underline mb-16">
        <img src="/logo.svg" alt="untold logo" className="h-7 w-7" />
        <span className="text-white font-semibold text-xl tracking-tight">untold.</span>
      </Link>

      <p className="text-8xl font-bold mb-4" style={{ color: 'rgba(255,255,255,0.06)' }}>404</p>
      <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
      <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.4)' }}>
        This page doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
        style={{ background: '#fff', color: '#000' }}
      >
        ← Back to home
      </Link>
    </div>
  );
}
