const navItems = [
  "Dashboard",
  "Leads",
  "Applications",
  "Admissions",
  "Campaigns",
  "Communications",
  "Tasks",
  "Payments",
  "Reports",
  "Automation",
  "Tenants",
  "Settings",
];

const kpis = [
  ["New leads", "428", "Across website, ads, WhatsApp, imports, and walk-ins"],
  ["Follow-ups due", "86", "Counselor tasks due today"],
  ["Applications", "173", "Submitted or in review"],
  ["Revenue", "INR 18.4L", "Collected from fees and subscriptions"],
];

const modules = [
  {
    title: "Lead CRM",
    body: "Lead capture, source attribution, duplicate blocking, scoring, assignment, tags, notes, and one-view timeline.",
    items: [
      "Lead list and filters",
      "Round-robin assignment",
      "Follow-ups and tasks",
    ],
  },
  {
    title: "Applications",
    body: "Dynamic forms, application status, document upload, stage movement, review, and offer workflow.",
    items: ["Form builder", "Document checks", "Admission pipeline"],
  },
  {
    title: "Communication",
    body: "Email, SMS, WhatsApp, calls, push notifications, templates, campaign logs, and communication history.",
    items: ["Templates", "Bulk campaigns", "Delivery reports"],
  },
  {
    title: "Marketing",
    body: "Campaign tracking, UTM attribution, landing pages, widgets, remarketing audiences, and ROI reporting.",
    items: ["Source performance", "Conversion tags", "Campaign ROI"],
  },
  {
    title: "Finance",
    body: "Application fees, admission fees, installments, scholarships, invoices, receipts, refunds, and reconciliation.",
    items: ["Payment links", "Receipts", "Refund workflow"],
  },
  {
    title: "Automation",
    body: "No-code rules for assignment, communication, reminders, escalations, status updates, and webhooks.",
    items: ["Workflow triggers", "Delayed actions", "Execution logs"],
  },
  {
    title: "Analytics",
    body: "Counselor productivity, funnel conversion, branch performance, campaign ROI, and revenue dashboards.",
    items: ["Custom dashboards", "Report builder", "Forecasting"],
  },
  {
    title: "Tenants and users",
    body: "Organizations, branches, teams, departments, roles, permissions, data masking, and IP restrictions.",
    items: ["Tenant settings", "RBAC", "Hierarchy"],
  },
  {
    title: "Learning operations",
    body: "Student profiles, AI tutor sessions, online tutor schedules, assessments, study plans, and parent progress.",
    items: ["Class board", "Study plans", "Parent reports"],
  },
];

export default function CrmDashboardPage() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">M</span>
          <span>Mentora CRM</span>
        </div>
        <nav className="nav" aria-label="CRM modules">
          {navItems.map((item) => (
            <a href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} key={item}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>Enrollment operating dashboard</h1>
            <p>
              Multi-tenant CRM for admissions, marketing, finance, and learning
              teams.
            </p>
          </div>
          <span className="tenant-pill">Tenant: Webnza Coaching</span>
        </div>

        <section className="kpis" aria-label="Key metrics">
          {kpis.map(([label, value, help]) => (
            <article className="card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{help}</p>
            </article>
          ))}
        </section>

        <section className="module-grid" aria-label="CRM modules">
          {modules.map((module) => (
            <article
              className="card"
              id={module.title.toLowerCase().replace(/\s+/g, "-")}
              key={module.title}
            >
              <h2>{module.title}</h2>
              <p>{module.body}</p>
              <ul>
                {module.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
