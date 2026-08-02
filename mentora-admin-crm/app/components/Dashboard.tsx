import type { AdminModule } from "./adminTypes";
import { allModules, moduleMap } from "./adminConfig";
import { AdminIcon as Icon } from "./AdminIcon";
import {
  getDashboardMetric,
  getModuleCardMetric,
  normalizeResponseObject,
} from "./adminUtils";

export function Dashboard({
  canAccessModule,
  openModule,
  workspace,
}: {
  canAccessModule: (id: string) => boolean;
  openModule: (id: string) => void;
  workspace: {
    coverage: unknown[];
    dashboard: unknown;
    moduleRecords: Record<string, unknown[]>;
    organizations: unknown[];
  };
}) {
  const dashboard = normalizeResponseObject(workspace.dashboard);
  const dashboardKpis = [
    {
      helper: "New enquiries",
      icon: "lead" as const,
      id: "leads",
      label: "New leads",
      value: getDashboardMetric(dashboard, "newLeads"),
    },
    {
      helper: "Submitted records",
      icon: "document" as const,
      id: "applications",
      label: "Applications",
      value: getDashboardMetric(dashboard, "applications"),
    },
    {
      helper: "Open or in progress",
      icon: "task" as const,
      id: "tasks",
      label: "Open tasks",
      value: getDashboardMetric(dashboard, "openTasks"),
    },
    {
      helper: "High-intent leads",
      icon: "analytics" as const,
      id: "leads",
      label: "Hot leads",
      value: getDashboardMetric(dashboard, "hotLeads"),
    },
    {
      helper: "Active campaign records",
      icon: "campaign" as const,
      id: "campaigns",
      label: "Campaigns",
      value: getDashboardMetric(dashboard, "campaigns"),
    },
    {
      helper: "Logged channel records",
      icon: "chat" as const,
      id: "communications",
      label: "Communications",
      value: getDashboardMetric(dashboard, "communications"),
    },
  ];
  const pipelineRows = [
    ["New", getDashboardMetric(dashboard, "newLeads"), "leads"],
    ["Hot", getDashboardMetric(dashboard, "hotLeads"), "leads"],
    ["Applications", getDashboardMetric(dashboard, "applications"), "applications"],
    ["Open Tasks", getDashboardMetric(dashboard, "openTasks"), "tasks"],
  ];

  return (
    <section className="workspace">
      <div className="hero-panel">
        <div>
          <span className="eyebrow">Command Center</span>
          <h2>Enrollment operating dashboard</h2>
          <p>
            Live funnel, team workload, campaign ROI, payment collections, and
            learning handoff in one enterprise console.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => openModule("leads")}
          type="button"
        >
          <Icon name="lead" />
          Open Lead Queue
        </button>
      </div>

      <section className="kpi-grid" aria-label="CRM key metrics">
        <button
          className="metric-card"
          onClick={() => openModule("organizations")}
          type="button"
        >
          <Icon name="organization" />
          <span>Organizations</span>
          <strong>{workspace.organizations.length}</strong>
          <p>
            <em>Live</em>
            API workspace
          </p>
        </button>
        {dashboardKpis.map(({ helper, icon, id, label, value }) => (
          <button
            className="metric-card"
            key={label}
            onClick={() => openModule(id)}
            type="button"
          >
            <Icon name={icon} />
            <span>{label}</span>
            <strong>{value}</strong>
            <p>
              <em>Live</em>
              {helper}
            </p>
          </button>
        ))}
      </section>

      <section className="board-grid">
        <div className="listmanager">
          <div className="head">Admissions Pipeline</div>
          <div className="pipeline">
            {pipelineRows.map(([stage, value, moduleId]) => (
              <button
                className="pipeline-step"
                key={stage}
                onClick={() => openModule(moduleId)}
                type="button"
              >
                <span>{stage}</span>
                <strong>{value}</strong>
              </button>
            ))}
          </div>
        </div>
        <div className="listmanager">
          <div className="head">Operations Health</div>
          <div className="health-list">
            {[
              "Duplicate lead check active",
              "Payment reconciliation synced",
              "Parent consent policy enforced",
              "AI class handoff monitored",
            ].map((item) => (
              <div key={item}>
                <span className="status-dot" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="quick-grid">
        {allModules
          .filter((module) => canAccessModule(module.id))
          .map((module) => (
            <button
              className="quick-card"
              key={module.id}
              onClick={() => openModule(module.id)}
              type="button"
            >
              <div className="quick-card-head">
                <Icon name={module.icon ?? "dashboard"} />
                <small>{module.status}</small>
              </div>
              <span>{module.group}</span>
              <strong>{module.title}</strong>
              <em>{getModuleCardMetric(module, workspace)}</em>
            </button>
          ))}
      </section>
    </section>
  );
}

