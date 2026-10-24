import { Link } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const values = [
  { title: 'Quality over quantity', desc: 'We take on a limited number of projects at a time so every client gets our full attention.' },
  { title: 'Honest communication', desc: 'No fluff, no overselling. We tell you what we can build, by when, and for how much.' },
  { title: 'Long-term thinking', desc: 'We build products that can grow. Scalable architecture and clean code are non-negotiable.' },
  { title: 'Design-first mindset', desc: 'Every project starts with design. How something looks and feels is just as important as how it works.' },
];

export default function AboutPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-3 mb-14">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Company
        </span>
        <h1 className="font-bold tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          About untold.
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
          A boutique studio built for ambitious brands.
        </p>
      </div>

      <p className="mb-8 leading-relaxed text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
        untold. is a boutique digital studio focused on crafting premium web and mobile products.
        We combine strategic thinking with flawless execution — delivering work that is as functional
        as it is beautiful. We work with startups, scale-ups, and established brands who care deeply
        about quality and want a team that does too.
      </p>

      <p className="mb-14 leading-relaxed text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
        Every project is a collaboration. We work closely with our clients to understand their vision,
        their users, and their goals — then translate all of that into a digital product people love to use.
      </p>

      <div className="flex flex-col gap-5 mb-14">
        <h2 className="text-lg font-semibold text-white">What we stand for</h2>
        <div className="flex flex-col gap-4">
          {values.map((v, i) => (
            <div
              key={v.title}
              className="rounded-2xl p-5 flex gap-5 items-start"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-2xl font-bold mt-0.5" style={{ color: 'rgba(255,255,255,0.12)', fontVariantNumeric: 'tabular-nums', minWidth: '2rem' }}>
                0{i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-white">{v.title}</span>
                <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{v.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-0"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <p className="text-sm font-semibold text-white mb-1">Ready to work together?</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Tell us about your project.</p>
        </div>
        <a
          href="/#contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap"
          style={{ background: '#fff', color: '#000' }}
        >
          Get in touch →
        </a>
      </div>
    </PageWrapper>
  );
}
