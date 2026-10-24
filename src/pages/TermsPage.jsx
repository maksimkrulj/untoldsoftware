import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-col gap-10" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: '0.9375rem' }}>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">1. Agreement to Terms</h2>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("Client") and untold.
              ("we", "us", "our", "Studio") governing your use of our website and all services provided by untold. By
              engaging our services, signing a proposal or contract, or making any payment to us, you confirm that you
              have read, understood, and agree to be bound by these Terms.
            </p>
            <p>
              If you do not agree to these Terms, you must not engage our services.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">2. Services</h2>
            <p>
              untold. provides digital services including, but not limited to: web application development, mobile application
              development, website design and development, UI/UX design, branding, and related consulting services.
            </p>
            <p>
              The specific scope, deliverables, timeline, and fees for each project are defined in a separate written
              proposal or Statement of Work ("SOW") agreed upon by both parties. In the event of any conflict between
              these Terms and an SOW, the SOW shall take precedence for that specific project.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">3. Payment Terms</h2>
            <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }}>
              <li>
                <strong className="text-white">Deposit:</strong> A non-refundable deposit (typically 50% of the total project fee,
                as specified in the SOW) is required before any work commences. Payment of the deposit constitutes acceptance of
                the proposal and these Terms.
              </li>
              <li>
                <strong className="text-white">Remaining balance:</strong> The remaining balance is due upon project completion,
                prior to the delivery of final files or launch of the project, unless otherwise agreed in writing.
              </li>
              <li>
                <strong className="text-white">Invoicing:</strong> All invoices are due within 14 days of issuance unless
                otherwise stated. Late payments accrue interest at 1.5% per month (or the maximum rate permitted by law,
                whichever is lower).
              </li>
              <li>
                <strong className="text-white">Suspension:</strong> We reserve the right to suspend work on any project where
                invoices remain unpaid beyond 14 days. Work will resume only upon receipt of outstanding payments.
              </li>
              <li>
                <strong className="text-white">Expenses:</strong> Any out-of-pocket expenses (third-party licences, stock assets,
                hosting fees, etc.) incurred on your behalf will be invoiced separately and are payable in addition to project fees.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">4. Intellectual Property & Ownership</h2>
            <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }}>
              <li>
                <strong className="text-white">Full ownership transfer:</strong> Upon receipt of full payment, untold. assigns
                to the Client all rights, title, and interest in the final deliverables created specifically for that project,
                including source code, designs, and associated assets.
              </li>
              <li>
                <strong className="text-white">Prior to full payment:</strong> All deliverables remain the exclusive intellectual
                property of untold. until full payment has been received. Client may not use, publish, reproduce, or distribute
                any deliverable prior to full payment.
              </li>
              <li>
                <strong className="text-white">Studio rights:</strong> untold. retains the right to display the work in its
                portfolio, case studies, social media, and marketing materials, unless the Client explicitly requests
                confidentiality in writing prior to project commencement.
              </li>
              <li>
                <strong className="text-white">Third-party components:</strong> Projects may incorporate open-source libraries,
                frameworks, or third-party tools. These remain subject to their respective licences. untold. is not responsible
                for any licence compliance issues arising from Client's use of such components beyond the agreed scope.
              </li>
              <li>
                <strong className="text-white">Client-provided materials:</strong> The Client warrants that any materials,
                content, trademarks, or assets provided to untold. are owned by or properly licenced to the Client.
                The Client indemnifies untold. against any claims arising from use of Client-provided materials.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">5. Project Timelines & Client Responsibilities</h2>
            <p>
              Project timelines are estimates based on the agreed scope and are contingent upon timely provision of
              content, feedback, and approvals from the Client. untold. is not liable for delays caused by:
            </p>
            <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }}>
              <li>Late delivery of content, assets, or required information from the Client.</li>
              <li>Delayed feedback or approvals beyond agreed review periods (typically 5 business days).</li>
              <li>Scope changes requested after project commencement.</li>
              <li>Third-party service outages or delays outside our control.</li>
            </ul>
            <p>
              If the project is delayed for more than 30 days due to Client inaction, untold. reserves the right to
              reschedule the project, invoice for work completed to date, or terminate the engagement with the deposit
              retained as a kill fee.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">6. Revisions & Scope Changes</h2>
            <p>
              Each project includes a defined number of revision rounds as specified in the SOW. Revisions are defined
              as minor adjustments within the agreed scope. Requests that constitute new features, significant redesigns,
              or scope expansions are not considered revisions and will be quoted and billed separately.
            </p>
            <p>
              Any agreed scope changes must be documented in writing (email is acceptable) and may affect the timeline
              and total project cost. untold. is not obligated to implement scope changes without written agreement and
              appropriate additional payment.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">7. Confidentiality</h2>
            <p>
              Both parties agree to keep confidential any proprietary or sensitive information disclosed during the
              engagement. untold. will not disclose Client's business information, project details, or proprietary
              data to third parties without written consent, except as required by law or as necessary to deliver
              the agreed services (e.g., sharing with sub-contractors bound by equivalent confidentiality obligations).
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">8. Warranties & Representations</h2>
            <p>untold. warrants that:</p>
            <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }}>
              <li>Services will be performed with reasonable skill, care, and diligence.</li>
              <li>Deliverables will substantially conform to the agreed specifications.</li>
              <li>We have the right to enter into this agreement and perform the services.</li>
            </ul>
            <p>
              Except as expressly stated, services and deliverables are provided "as is" without any further warranty,
              express or implied, including warranties of merchantability or fitness for a particular purpose.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, untold.'s total liability to the Client for any
              claim arising out of or in connection with these Terms or any project shall not exceed the total fees
              paid by the Client to untold. in the 6 months preceding the claim.
            </p>
            <p>
              untold. shall not be liable for any indirect, incidental, consequential, special, or punitive damages,
              including loss of profits, loss of revenue, loss of data, or loss of business opportunity, even if
              advised of the possibility of such damages.
            </p>
            <p>
              untold. is not responsible for the ongoing maintenance, security patches, or updates of any delivered
              product unless a separate maintenance agreement is in place.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">10. Cancellation & Termination</h2>
            <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }}>
              <li>
                <strong className="text-white">By the Client:</strong> The Client may cancel a project at any time with
                written notice. The non-refundable deposit is forfeited. Any work completed beyond the deposit value
                will be invoiced and is payable within 14 days of cancellation.
              </li>
              <li>
                <strong className="text-white">By untold.:</strong> We reserve the right to terminate an engagement immediately
                and without liability if the Client breaches these Terms (including non-payment), engages in abusive or
                unlawful conduct, or requests deliverables that violate applicable law or third-party rights.
              </li>
              <li>
                <strong className="text-white">Effect of termination:</strong> Upon termination, all outstanding invoices
                become immediately due. Ownership of deliverables remains with untold. until all amounts owed are paid in full.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">11. Acceptable Use</h2>
            <p>
              The Client agrees not to use untold.'s services to create, distribute, or promote any content or
              product that:
            </p>
            <ul className="flex flex-col gap-2 pl-5" style={{ listStyle: 'disc' }}>
              <li>Violates any applicable law or regulation.</li>
              <li>Infringes any third-party intellectual property rights.</li>
              <li>Is defamatory, fraudulent, obscene, or harassing.</li>
              <li>Facilitates illegal activities or promotes harm.</li>
            </ul>
            <p>
              untold. reserves the right to decline or discontinue any project that, in our sole discretion,
              conflicts with our values or exposes us to legal or reputational risk.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">12. Indemnification</h2>
            <p>
              The Client agrees to indemnify, defend, and hold harmless untold. and its contractors, employees, and
              agents from any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees)
              arising from: (a) the Client's use of our deliverables; (b) Client-provided materials; (c) the Client's
              violation of these Terms or any applicable law; or (d) the Client's product or business operations.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">13. Force Majeure</h2>
            <p>
              Neither party shall be liable for any failure or delay in performance caused by circumstances beyond
              their reasonable control, including acts of God, war, government action, pandemic, natural disaster,
              or internet infrastructure failures. Both parties will make reasonable efforts to minimise the impact
              of such events and resume normal operations as soon as practicable.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">14. Governing Law & Disputes</h2>
            <p>
              These Terms are governed by and construed in accordance with applicable law. Any disputes arising from
              these Terms or our services shall first be attempted to be resolved through good-faith negotiation.
              If a resolution cannot be reached within 30 days, disputes may be submitted to binding arbitration
              or the jurisdiction of competent courts, as agreed upon in the applicable SOW or by mutual agreement.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">15. Amendments</h2>
            <p>
              untold. reserves the right to update these Terms at any time. Updated Terms will be posted on our
              website with a revised date. Continued engagement with our services after the updated Terms are posted
              constitutes acceptance of the changes. For ongoing projects, material changes will be communicated
              directly to the Client.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">16. Entire Agreement</h2>
            <p>
              These Terms, together with any applicable SOW or project proposal, constitute the entire agreement
              between the Client and untold. with respect to the subject matter herein, and supersede all prior
              negotiations, representations, or agreements, whether oral or written.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-white">17. Contact</h2>
            <p>For any questions regarding these Terms, please contact:</p>
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
        <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.35)' }}>Privacy Policy</Link>
      </div>
    </div>
  );
}
