import { Link } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const capabilities = [
  { title: 'Marketing & Landing Pages', desc: 'High-converting pages built for campaigns, launches, and lead gen.' },
  { title: 'Corporate Websites', desc: 'Professional multi-page sites that build trust and communicate brand.' },
  { title: 'Portfolio & Personal Brands', desc: 'Standout personal sites for creatives, founders, and professionals.' },
  { title: 'CMS-powered Sites', desc: 'Headless CMS integration so your team can update content without code.' },
  { title: 'SEO-optimised Pages', desc: 'Fast load times, semantic markup, and metadata done right from day one.' },
  { title: 'Interactive Experiences', desc: 'Scroll animations, 3D elements, and micro-interactions that wow visitors.' },
];

const stack = ['React', 'Next.js', 'Astro', 'Tailwind CSS', 'Framer Motion', 'Sanity', 'Contentful', 'Vercel'];

export default function WebsitesPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-3 mb-14">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Services
        </span>
        <h1 className="font-bold tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Websites
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
          High-performance websites that make a lasting impression.
        </p>
      </div>

      <p className="mb-14 leading-relaxed text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
        We craft fast, beautiful, and conversion-focused websites for brands that want to stand out online.
        Every pixel is intentional — from the layout and typography to the animations and loading speed.
        Whether you need a simple landing page or a full multi-page corporate site, we deliver quality
        that's immediately visible.
      </p>

      <div className="flex flex-col gap-5 mb-14">
        <h2 className="text-lg font-semibold text-white">What we build</h2>
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
        <h2 className="text-lg font-semibold text-white">Tech stack</h2>
        <div className="flex flex-wrap gap-2">
          {stack.map(t => (
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
