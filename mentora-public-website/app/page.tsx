const modules = [
  [
    "Lead CRM",
    "Capture, dedupe, assign, score, and nurture student inquiries.",
  ],
  [
    "Admissions",
    "Forms, applications, documents, interviews, offers, and enrollment.",
  ],
  [
    "Learning",
    "Parent-managed profiles, AI tutors, online tutors, schedules, tests, and progress.",
  ],
  [
    "Automation",
    "Email, SMS, WhatsApp, tasks, reminders, drip flows, and escalations.",
  ],
  [
    "Payments",
    "Application fees, subscriptions, invoices, receipts, refunds, and reconciliation.",
  ],
  [
    "Analytics",
    "Counselor productivity, campaign ROI, conversion funnels, and revenue dashboards.",
  ],
];

const plans = [
  [
    "CRM Starter",
    "Lead capture, counselor dashboard, tasks, and admissions basics.",
  ],
  [
    "Enrollment Cloud",
    "CRM, applications, communication automation, payments, and reports.",
  ],
  [
    "Enterprise",
    "Multi-tenant controls, SSO, data masking, API keys, integrations, and audit exports.",
  ],
];

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Mentora home">
          <span className="brand-mark">M</span>
          <span>Mentora</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#modules">Modules</a>
          <a href="#plans">Plans</a>
          <a href="#support">Support</a>
          <a href="#legal">Legal</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Education CRM + AI learning platform</p>
            <h1>Mentora Enrollment Cloud</h1>
            <p>
              A multi-tenant platform for education teams to attract, engage,
              enroll, collect payments, and continue student learning with AI
              tutors, online tutors, assessments, and parent visibility.
            </p>
            <div className="actions">
              <a className="button primary" href="#plans">
                View plans
              </a>
              <a className="button secondary" href="#support">
                Schedule demo
              </a>
            </div>
          </div>
          <div className="hero-panel" aria-label="Mentora CRM snapshot">
            <div className="pipeline-card">
              <span className="status">Pipeline today</span>
              <strong>1,248 active inquiries</strong>
              <p>
                Leads, applications, follow-ups, payments, and learning sessions
                in one operating system.
              </p>
            </div>
            <div className="metrics">
              <span>
                <strong>38%</strong> admission conversion
              </span>
              <span>
                <strong>5x</strong> faster follow-up
              </span>
            </div>
          </div>
        </section>

        <section className="band" id="modules">
          <h2>Built around the complete education funnel</h2>
          <div className="grid">
            {modules.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="band" id="plans">
          <h2>Plans for education teams</h2>
          <div className="plans">
            {plans.map(([label, body]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{label}</strong>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="band two-column" id="support">
          <div>
            <h2>Support</h2>
            <p>
              Reach Mentora for CRM onboarding, parent/student learning flows,
              billing, integrations, safety, and implementation support.
            </p>
          </div>
          <a className="button primary" href="mailto:support@mentora.example">
            support@mentora.example
          </a>
        </section>

        <section className="band" id="legal">
          <h2>Legal and trust</h2>
          <div className="legal-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-conditions">Terms and Conditions</a>
            <a href="/account-deletion">Account Deletion</a>
            <a href="/community-guidelines">Community Guidelines</a>
          </div>
        </section>
      </main>
    </>
  );
}
