import { Link } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const steps = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'We start by understanding your business, your users, and your goals. This phase includes a detailed brief, competitor research, and a technical assessment. We ask the hard questions early so there are no surprises later.',
  },
  {
    num: '02',
    title: 'Design',
    desc: "Before writing a single line of code, we design the full experience in Figma. Wireframes first, then high-fidelity screens. You'll be able to click through the prototype and request changes before development begins.",
  },
  {
    num: '03',
    title: 'Build',
    desc: 'Development happens in sprints with regular check-ins. You have access to a staging environment from day one so you can see real progress, not just promises. We write clean, documented, scalable code.',
  },
  {
    num: '04',
    title: 'Review & Refine',
    desc: "We go through a structured review cycle with your team. Feedback is collected, prioritised, and addressed. We don't consider the project done until it meets the agreed specification.",
  },
  {
    num: '05',
    title: 'Launch',
    desc: 'Deployment, domain setup, final QA, performance testing — we handle it all. We stay available in the days after launch to catch anything that surfaces in production.',
  },
  {
    num: '06',
    title: 'Ongoing Support',
    desc: "After launch, we offer optional maintenance and support retainers. We're also available for future feature development as your product grows. Most of our clients work with us on multiple projects.",
  },
];

export default function ProcessPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-3 mb-14">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Company
        </span>
        <h1 className="font-bold tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Our Process
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
          How we take an idea from concept to launch.
        </p>
      </div>

      <p className="mb-14 leading-relaxed text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
        A great product doesn't happen by accident. It's the result of a clear process, honest communication,
        and a team that cares about what they're building. Here's how we work on every engagement.
      </p>

      <div className="flex flex-col gap-4 mb-14">
        {steps.map(s => (
          <div
            key={s.num}
            className="rounded-2xl p-6 flex gap-5 items-start"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span
              className="font-bold text-xl mt-0.5 shrink-0"
              style={{ color: 'rgba(255,255,255,0.12)', fontVariantNumeric: 'tabular-nums', minWidth: '2.5rem' }}
            >
              {s.num}
            </span>
            <div className="flex flex-col gap-2">
              <span className="text-base font-semibold text-white">{s.title}</span>
              <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.desc}</span>
            </div>
          </div>
        ))}
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
