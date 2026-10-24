import { Link } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const categories = [
  { label: 'SaaS Platforms', desc: 'Custom software products with dashboards, auth flows, and billing integrations.' },
  { label: 'Mobile Applications', desc: 'React Native apps live on the App Store and Google Play.' },
  { label: 'Marketing Websites', desc: 'High-converting sites for product launches, brands, and campaigns.' },
  { label: 'E-commerce', desc: 'Custom storefronts with seamless checkout and inventory management.' },
  { label: 'Internal Tools', desc: 'Dashboards and admin panels that simplify complex business operations.' },
  { label: 'Brand & Design Systems', desc: 'Visual identities and component libraries that scale with the product.' },
];

export default function WorkPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-3 mb-14">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Company
        </span>
        <h1 className="font-bold tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Our Work
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
          We let the results speak.
        </p>
      </div>

      <p className="mb-8 leading-relaxed text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
        Every project we take on is built with the same level of care — whether it's a single landing page
        or a full SaaS platform. We don't cut corners on any engagement. Our clients come back because
        the work holds up over time.
      </p>

      <p className="mb-14 leading-relaxed text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
        Due to confidentiality agreements with our clients, we don't publicly showcase all of our portfolio.
        If you'd like to see work relevant to your specific project type, reach out and we'll share
        relevant examples directly.
      </p>

      <div className="flex flex-col gap-5 mb-14">
        <h2 className="text-lg font-semibold text-white">Categories we've worked in</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map(c => (
            <div
              key={c.label}
              className="rounded-2xl p-5 flex flex-col gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-sm font-semibold text-white">{c.label}</span>
              <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <p className="text-sm font-semibold text-white mb-1">Want to see specific examples?</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Get in touch and we'll share work relevant to your project.</p>
        </div>
        <a
          href="/#contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap"
          style={{ background: '#fff', color: '#000' }}
        >
          Contact us →
        </a>
      </div>
    </PageWrapper>
  );
}
