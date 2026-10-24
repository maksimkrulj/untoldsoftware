import { Link } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const capabilities = [
  { title: 'UX Research & Strategy', desc: 'User interviews, competitor analysis, and flow mapping before a single pixel is placed.' },
  { title: 'Wireframing & Prototyping', desc: 'Low and high-fidelity prototypes you can click through and test with real users.' },
  { title: 'UI Design Systems', desc: 'Scalable component libraries with tokens, variants, and documentation for your team.' },
  { title: 'Responsive Web Design', desc: 'Pixel-perfect designs that look great on every screen size and device.' },
  { title: 'Mobile App Interfaces', desc: 'Native-feeling iOS and Android UI with platform-specific patterns and gestures.' },
  { title: 'Brand & Visual Identity', desc: 'Logos, colour palettes, typography, and guidelines that define who you are.' },
];

const tools = ['Figma', 'FigJam', 'Framer', 'Adobe Illustrator', 'Principle', 'Lottie'];

export default function DesignPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-3 mb-14">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Services
        </span>
        <h1 className="font-bold tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          UI/UX Design
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Design that works as good as it looks.
        </p>
      </div>

      <p className="mb-14 leading-relaxed text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
        Great design isn't just about aesthetics — it's about clarity, flow, and how it feels to use.
        We take a strategy-first approach to every design engagement, starting with understanding your
        users and working outward to every detail of the interface. The result is a product that looks
        premium and removes every point of friction for the people using it.
      </p>

      <div className="flex flex-col gap-5 mb-14">
        <h2 className="text-lg font-semibold text-white">What we design</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {capabilities.map(c => (
            <div
              key={c.title}
              className="rounded-2xl p-5 flex flex-col gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-sm font-semibold text-white">{c.title}</span>
              <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-14">
        <h2 className="text-lg font-semibold text-white">Tools</h2>
        <div className="flex flex-wrap gap-2">
          {tools.map(t => (
            <span
              key={t}
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <a
        href="/#contact"
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold"
        style={{ background: '#fff', color: '#000' }}
      >
        Start a project →
      </a>
    </PageWrapper>
  );
}
