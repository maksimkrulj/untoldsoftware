import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.style.scrollSnapType = 'none';
    return () => { document.documentElement.style.scrollSnapType = ''; };
  }, []);

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {/* Navbar */}
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

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-24">
        <div className="flex flex-col gap-3 mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Legal
          </span>
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-col gap-10" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '0.9375rem' }}>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">1. Who We Are</h2>
            <p>
              untold. ("we", "our", "us") is a digital studio operating under the brand name untold., providing web development,
              mobile application development, UI/UX design, and related digital services to clients worldwide. Our contact email
              is <a href="mailto:hello@untoldsoftware.com" style={{ color: '#fff' }}>hello@untoldsoftware.com</a>.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">2. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }}>
              <li><strong className="text-white">Contact information</strong> — name, email address, phone number, company name when you reach out via our contact form or email.</li>
              <li><strong className="text-white">Project information</strong> — details about your project, requirements, and business needs that you share during our engagements.</li>
              <li><strong className="text-white">Communication records</strong> — emails, messages, and other correspondence between you and untold.</li>
              <li><strong className="text-white">Payment information</strong> — billing details processed securely through third-party payment processors. We do not store full card numbers.</li>
              <li><strong className="text-white">Usage data</strong> — standard server logs including IP address, browser type, pages visited, and referral source when you visit our website.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }}>
              <li>Respond to inquiries and provide the services you request.</li>
              <li>Manage our business relationship, including contracts, invoicing, and project delivery.</li>
              <li>Send service-related communications such as project updates and invoices.</li>
              <li>Improve our website and services.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">4. Legal Basis for Processing</h2>
            <p>We process your personal data on the following legal grounds:</p>
            <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }}>
              <li><strong className="text-white">Contractual necessity</strong> — processing is required to enter into or perform a contract with you.</li>
              <li><strong className="text-white">Legitimate interests</strong> — we have a legitimate interest in operating our business and communicating with prospective clients.</li>
              <li><strong className="text-white">Legal obligation</strong> — where processing is required by applicable law.</li>
              <li><strong className="text-white">Consent</strong> — where you have given explicit consent (e.g., marketing communications).</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">5. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to fulfil the purposes for which it was collected, including
              satisfying legal, accounting, or reporting requirements. Client project records are typically retained for 7 years
              after project completion for tax and legal purposes. You may request deletion of your data at any time (subject to
              our legal retention obligations) by contacting us at <a href="mailto:hello@untoldsoftware.com" style={{ color: '#fff' }}>hello@untoldsoftware.com</a>.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">6. Third-Party Services</h2>
            <p>We may use trusted third-party service providers to operate our business, including:</p>
            <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }}>
              <li>Payment processors (e.g., Stripe, PayPal) for billing.</li>
              <li>Email and communication platforms for correspondence.</li>
              <li>Project management tools for internal workflow.</li>
              <li>Hosting and cloud providers for our website.</li>
            </ul>
            <p>These providers only access your data to the extent necessary to provide their services and are bound by confidentiality obligations.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">7. Cookies</h2>
            <p>
              Our website may use cookies and similar technologies to improve user experience and analyse site traffic.
              Essential cookies are required for the website to function. You can disable non-essential cookies through your
              browser settings. We do not currently use advertising or tracking cookies.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">8. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }}>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data ("right to be forgotten").</li>
              <li>Object to or restrict certain processing.</li>
              <li>Data portability — receive your data in a structured, machine-readable format.</li>
              <li>Withdraw consent at any time where processing is based on consent.</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="mailto:hello@untoldsoftware.com" style={{ color: '#fff' }}>hello@untoldsoftware.com</a>.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">9. Data Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised
              access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">10. International Transfers</h2>
            <p>
              Your data may be processed or stored in countries outside your home country, including countries that may
              have different data protection standards. Where we transfer data internationally, we ensure appropriate
              safeguards are in place in accordance with applicable data protection laws.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">11. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal
              data from minors. If you believe we have inadvertently collected such information, please contact us immediately.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the
              new policy on this page with an updated date. Your continued use of our services after any changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">13. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
              please contact us at:
            </p>
            <div
              className="rounded-2xl px-6 py-5 mt-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-white font-semibold">untold.</p>
              <a href="mailto:hello@untoldsoftware.com" style={{ color: 'rgba(255,255,255,0.6)' }}>hello@untoldsoftware.com</a>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <div
        className="py-8 text-center text-xs"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)' }}
      >
        © {new Date().getFullYear()} untold. All rights reserved. &nbsp;·&nbsp;{' '}
        <Link to="/terms" style={{ color: 'rgba(255,255,255,0.35)' }}>Terms of Service</Link>
      </div>
    </div>
  );
}
