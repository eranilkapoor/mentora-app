import type { AdminModule, ModuleCoverage, ModuleStatus } from "./adminTypes";

export function statusClass(status?: ModuleStatus) {
  if (status === "Active") return "good";
  if (status === "Configured") return "warn";
  return "neutral";
}

export function findModuleCoverage(
  coverage: unknown[],
  moduleKey: string,
): ModuleCoverage | null {
  const match = coverage.find((item) => {
    if (!item || typeof item !== "object") return false;
    return (item as { moduleKey?: unknown }).moduleKey === moduleKey;
  });
  return match && typeof match === "object" ? (match as ModuleCoverage) : null;
}

export function formatReadiness(coverage: ModuleCoverage): ModuleStatus {
  if (coverage.productionReady) return "Active";
  if (
    coverage.backendStatus === "workflow_ready" ||
    coverage.frontendStatus === "workflow_ready" ||
    (coverage.backendStatus === "product_ready" &&
      coverage.frontendStatus === "product_ready")
  ) {
    return "Configured";
  }
  return "Setup";
}

export function formatStatus(value?: string) {
  return value ? value.replaceAll("_", " ") : "unknown";
}

export function extractFirstId(records: unknown[]) {
  const first = records[0];
  if (!first || typeof first !== "object") return "";
  const object = first as Record<string, unknown>;
  const directId = object._id ?? object.id;
  if (typeof directId === "string") return directId;
  if (
    object.data &&
    typeof object.data === "object" &&
    "_id" in object.data &&
    typeof (object.data as { _id?: unknown })._id === "string"
  ) {
    return (object.data as { _id: string })._id;
  }
  return "";
}

export function findOrganizationIdByName(records: unknown[], name: string) {
  const normalizedName = name.trim().toLowerCase();
  const organization = records.find((record) => {
    if (!record || typeof record !== "object") return false;
    const object = record as Record<string, unknown>;
    return (
      typeof object.name === "string" &&
      object.name.trim().toLowerCase() === normalizedName
    );
  });
  return getUnknownRecordId(organization);
}

export function getUnknownRecordId(record: unknown) {
  if (!record || typeof record !== "object") return "";
  const value = (record as { _id?: unknown; id?: unknown })._id;
  if (typeof value === "string") return value;
  const fallback = (record as { id?: unknown }).id;
  return typeof fallback === "string" ? fallback : "";
}

export function getDashboardMetric(
  dashboard: Record<string, unknown>,
  key: string,
) {
  const value = dashboard[key];
  return typeof value === "number" ? value.toLocaleString() : "0";
}

export function getModuleCardMetric(
  module: AdminModule,
  workspace: {
    dashboard: unknown;
    moduleRecords: Record<string, unknown[]>;
    organizations: unknown[];
  },
) {
  if (module.id === "organizations") {
    return `${workspace.organizations.length.toLocaleString()} loaded`;
  }

  const dashboard = normalizeResponseObject(workspace.dashboard);
  const dashboardKeyByModule: Record<string, string> = {
    applications: "applications",
    campaigns: "campaigns",
    communications: "communications",
    leads: "newLeads",
    tasks: "openTasks",
  };
  const dashboardKey = dashboardKeyByModule[module.id];
  if (dashboardKey) {
    return `${getDashboardMetric(dashboard, dashboardKey)} live`;
  }

  const loadedRecords = workspace.moduleRecords[module.id];
  if (loadedRecords) {
    return `${loadedRecords.length.toLocaleString()} loaded`;
  }

  return "API backed";
}

export function normalizeResponseObject(
  value: unknown,
): Record<string, unknown> {
  if (!value || typeof value !== "object") return {};
  if ("data" in value) {
    const data = (value as { data?: unknown }).data;
    return data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : {};
  }
  return value as Record<string, unknown>;
}

export function normalizeResponseArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: unknown[] }).data;
  }
  return [];
}

export function getServerRowsForModule(
  module: AdminModule,
  workspace: {
    branches?: unknown[];
    departments?: unknown[];
    moduleRecords: Record<string, unknown[]>;
    organizations: unknown[];
    teams?: unknown[];
  },
) {
  if (module.id === "organizations") {
    return organizationRecordsToRows(workspace.organizations, module);
  }

  if (module.id === "branches") {
    return recordsToRows(workspace.branches, module);
  }

  if (module.id === "departments") {
    return recordsToRows(workspace.departments, module);
  }

  if (module.id === "teams") {
    return recordsToRows(workspace.teams, module);
  }

  return recordsToRows(workspace.moduleRecords[module.id], module);
}

export function recordsToRows(
  records: unknown[] | undefined,
  module: AdminModule,
) {
  if (!records?.length) return [];

  return records.map((record) => {
    const object =
      record && typeof record === "object"
        ? (record as Record<string, unknown>)
        : {};
    const payload =
      object.payload && typeof object.payload === "object"
        ? (object.payload as Record<string, unknown>)
        : {};

    return module.columns.map((column, index) => {
      const key = toPayloadKey(column);
      const value =
        payload[key] ??
        payload[column] ??
        object[key] ??
        object[column] ??
        (key === "department" ? object.departmentId : undefined) ??
        (key === "branch" ? object.branchId : undefined) ??
        (key === "created" ? object.createdAt : undefined) ??
        (key === "updated" ? object.updatedAt : undefined) ??
        (index === 0 ? object.title : undefined) ??
        (index === 0 ? object.name : undefined) ??
        (index === module.columns.length - 1 ? object.status : undefined);

      return stringifyCell(value);
    });
  });
}

export function stringifyCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return value.toLocaleDateString();
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replaceAll("_", " ");
}

export function toPayloadKey(label: string) {
  return label
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character: string) =>
      character.toUpperCase(),
    )
    .replace(/^[A-Z]/, (character) => character.toLowerCase());
}

export function toServerSortKey(column?: string) {
  const key = column ? toPayloadKey(column) : "";
  if (key === "due" || key === "dueDate" || key === "followUp") return "dueAt";
  if (key === "status") return "status";
  if (key === "priority") return "priority";
  if (key === "updated") return "updatedAt";
  return "title";
}

export function getServerFilterValue(
  filterValues: Record<string, string>,
  allowed: string[],
) {
  const normalized = new Set(allowed);
  return Object.values(filterValues)
    .map((value) => value.trim().toLowerCase().replaceAll(" ", "_"))
    .find((value) => normalized.has(value));
}

function organizationRecordsToRows(
  records: unknown[] | undefined,
  module: AdminModule,
) {
  if (!records?.length) return [];

  return records.map((record) => {
    const object =
      record && typeof record === "object"
        ? (record as Record<string, unknown>)
        : {};
    const values: Record<string, unknown> = {
      Plan: object.plan ?? object.planCode ?? object.subscriptionPlan,
      Status: object.status,
      Organization: object.name ?? object.title,
      Type: object.type,
    };

    return module.columns.map((column) => stringifyCell(values[column]));
  });
}
