import { Link } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const capabilities = [
  { title: 'Consumer Apps', desc: 'Polished iOS & Android apps that users actually want to open.' },
  { title: 'Enterprise & B2B Tools', desc: 'Field apps, reporting tools, and internal mobile platforms.' },
  { title: 'E-commerce Apps', desc: 'Mobile storefronts with native checkout and push notification flows.' },
  { title: 'Real-time Applications', desc: 'Chat, live tracking, and collaborative features with WebSocket support.' },
  { title: 'Push Notifications', desc: 'Engagement campaigns, transactional alerts, and in-app messaging.' },
  { title: 'App Store Deployment', desc: 'We handle the full submission process for both App Store and Play Store.' },
];

const stack = ['React Native', 'Expo', 'TypeScript', 'Zustand', 'Firebase', 'Supabase', 'Reanimated', 'REST & GraphQL'];

export default function MobileApps() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-3 mb-14">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Services
        </span>
        <h1 className="font-bold tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Mobile Apps
        </h1>
        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Cross-platform apps for iOS & Android. One codebase, zero compromise.
        </p>
      </div>

      <p className="mb-14 leading-relaxed text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
        We build native-quality mobile applications using React Native — shipping to both iOS and Android
        from a single codebase without sacrificing performance or feel. From your first MVP to a scaled
        production app, we cover design, development, testing, and store deployment end to end.
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
