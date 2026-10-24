import PageWrapper from './PageWrapper';

const faqs = [
  { q: 'How long does a typical project take?', a: "A marketing website usually takes 2–4 weeks. A web application or mobile app typically ranges from 6–16 weeks depending on scope. We'll give you a detailed timeline in the proposal." },
  { q: 'What does it cost?', a: "Projects are priced based on scope, complexity, and timeline. We work with fixed-price proposals so you always know what you're paying before we start. Get in touch for a quote." },
  { q: 'Do you work with startups?', a: "Yes — we work with early-stage startups through to established companies. If you have a clear idea and the budget to execute it properly, we'd love to hear from you." },
  { q: 'Can you work with an existing codebase?', a: "Absolutely. We do code audits, feature additions, and full-scale refactors on existing projects. We'll assess the codebase first and give you an honest assessment." },
  { q: 'Do you offer ongoing maintenance?', a: 'Yes. After launch we offer optional monthly retainers covering bug fixes, updates, and small feature additions. Ask about this in your initial inquiry.' },
];

export default function ContactPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-3 mb-14">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Company
        </span>
        <h1 className="font-bold tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Contact
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Let's talk about your project.
        </p>
      </div>

      <p className="mb-10 leading-relaxed text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
        The best way to reach us is by email. Tell us about your project — what you're building, roughly
        when you want to launch, and what your budget looks like. We'll get back to you within one business day.
      </p>

      <a
        href="mailto:hello@untoldsoftware.com"
        className="inline-flex items-center gap-3 rounded-2xl px-6 py-5 mb-14 w-full"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5.5l7 6 7-6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="1.5" y="3.5" width="17" height="13" rx="2.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
        </svg>
        <div>
          <p className="text-sm font-semibold text-white">hello@untoldsoftware.com</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>We reply within 1 business day</p>
        </div>
      </a>

      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-white">Frequently asked questions</h2>
        <div className="flex flex-col gap-4">
          {faqs.map(f => (
            <div
              key={f.q}
              className="rounded-2xl p-5 flex flex-col gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-sm font-semibold text-white">{f.q}</span>
              <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{f.a}</span>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
