import { Link } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const capabilities = [
  { title: 'SaaS Platforms', desc: 'Multi-tenant software products with auth, billing, and dashboards.' },
  { title: 'Admin Dashboards & CRMs', desc: 'Internal tools that give your team full control over operations.' },
  { title: 'E-commerce Solutions', desc: 'Custom storefronts, cart systems, and payment integrations.' },
  { title: 'Progressive Web Apps', desc: 'Apps that work offline, install on any device, and load instantly.' },
  { title: 'API Development', desc: 'RESTful and GraphQL APIs that power your frontend and mobile clients.' },
  { title: 'Third-party Integrations', desc: 'Stripe, Twilio, SendGrid, Zapier — we connect your tools.' },
];

const stack = ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Supabase', 'Prisma', 'GraphQL'];

export default function WebApps() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-3 mb-14">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Services
        </span>
        <h1 className="font-bold tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Web Applications
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Full-stack web applications built to scale.
        </p>
      </div>

      <p className="mb-14 leading-relaxed text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
        We design and build custom web applications — from complex SaaS platforms to internal business tools.
        Every app is engineered for performance, built to scale, and designed to be intuitive. Whether you need
        an MVP in weeks or a production-ready platform, we handle the full stack from database to deployment.
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
