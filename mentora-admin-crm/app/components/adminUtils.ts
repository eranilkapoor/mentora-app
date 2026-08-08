import type { AdminModule, ModuleCoverage, ModuleStatus } from "./adminTypes";

export function statusClass(status?: ModuleStatus) {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("_", " ");
  if (
    ["active", "paid", "ready", "delivered", "opened", "completed"].includes(
      normalized,
    )
  ) {
    return "good";
  }
  if (
    [
      "configured",
      "trial",
      "pending",
      "inactive",
      "open",
      "in progress",
      "under review",
      "review",
    ].includes(normalized)
  ) {
    return "warn";
  }
  if (["suspended", "blocked", "archived", "cancelled"].includes(normalized)) {
    return "danger";
  }
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
  return value
    ? value
        .replaceAll("_", " ")
        .split(" ")
        .filter(Boolean)
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
        )
        .join(" ")
    : "Unknown";
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
    integrationProviders?: unknown[];
    moduleRecords: Record<string, unknown[]>;
    organizations: unknown[];
    securityPolicy?: unknown;
    teams?: unknown[];
  },
) {
  if (module.id === "organizations") {
    return organizationRecordsToRows(workspace.organizations, module);
  }

  if (module.id === "branches") {
    return recordsToRows(workspace.branches, module);
  }

  if (module.id === "billing") {
    return billingSummaryToRows(
      workspace.moduleRecords.billing,
      module,
      workspace.organizations,
    );
  }

  if (module.id === "departments") {
    return recordsToRows(workspace.departments, module, workspace);
  }

  if (module.id === "teams") {
    return recordsToRows(workspace.teams, module, workspace);
  }

  if (module.id === "users") {
    return userRecordsToRows(workspace.moduleRecords.users, module);
  }

  if (module.id === "roles") {
    return roleRecordsToRows(workspace.moduleRecords.roles, module);
  }

  if (module.id === "permissions") {
    return permissionRecordsToRows(workspace.moduleRecords.permissions, module);
  }

  if (module.id === "authentication") {
    return authOverviewToRows(workspace.moduleRecords.authentication, module);
  }

  if (module.id === "integrations") {
    return integrationRecordsToRows(workspace.integrationProviders, module);
  }

  if (module.id === "security") {
    const policy =
      workspace.securityPolicy && typeof workspace.securityPolicy === "object"
        ? (workspace.securityPolicy as Record<string, unknown>)
        : null;
    return securityPolicyToRows(policy, module);
  }

  return recordsToRows(workspace.moduleRecords[module.id], module);
}

export function recordsToRows(
  records: unknown[] | undefined,
  module: AdminModule,
  workspace?: {
    branches?: unknown[];
    departments?: unknown[];
    teams?: unknown[];
  },
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
    const metrics = normalizeResponseObject(object.metrics);
    const roi = normalizeResponseObject(object.roi);
    const customFields = normalizeResponseObject(object.customFields);
    const applicantName = [object.firstName, object.middleName, object.lastName]
      .filter(Boolean)
      .join(" ");

    return module.columns.map((column, index) => {
      const key = toPayloadKey(column);
      const value =
        payload[key] ??
        payload[column] ??
        object[key] ??
        object[column] ??
        customFields[key] ??
        metrics[key] ??
        roi[key] ??
        (key === "campaign" ? (object.name ?? object.title) : undefined) ??
        (key === "program" ? (object.name ?? object.title) : undefined) ??
        (key === "leads" ? metrics.leads : undefined) ??
        (key === "applications" ? metrics.applications : undefined) ??
        (key === "spend" ? metrics.spend : undefined) ??
        (key === "roi" ? (roi.value ?? object.roi) : undefined) ??
        (key === "message" ? (object.subject ?? object.title) : undefined) ??
        (key === "time" ? (object.createdAt ?? object.updatedAt) : undefined) ??
        (key === "task" ? object.title : undefined) ??
        (key === "document" ? (object.name ?? object.title) : undefined) ??
        (key === "report" ? (object.name ?? object.title) : undefined) ??
        (key === "workflow" ? (object.name ?? object.title) : undefined) ??
        (key === "lastRun"
          ? (object.lastRunAt ?? object.updatedAt)
          : undefined) ??
        (key === "leadNumber" ? object.leadNumber : undefined) ??
        (key === "applicantName" ? applicantName || object.title : undefined) ??
        (key === "interestedCourse"
          ? (object.interestedCourse ?? object.interestedPrograms)
          : undefined) ??
        (key === "campus" ? object.campus : undefined) ??
        (key === "leadStage" ? resolveRecordName(object.stageId) : undefined) ??
        (key === "leadStatus" ? object.status : undefined) ??
        (key === "source" ? resolveRecordName(object.sourceId) : undefined) ??
        (key === "assignedCounselor"
          ? resolvePersonName(object.assignedTo)
          : undefined) ??
        (key === "team" ? resolveRecordName(object.teamId) : undefined) ??
        (key === "leadScore" ? object.score : undefined) ??
        (key === "lastContacted" ? object.lastContactedAt : undefined) ??
        (key === "nextFollowUp" ? object.nextFollowUpAt : undefined) ??
        (key === "createdDate" ? object.createdAt : undefined) ??
        (key === "ageOfLead" ? object.ageOfLead : undefined) ??
        (key === "duplicateIndicator"
          ? object.duplicateIndicator
            ? "Duplicate"
            : "Unique"
          : undefined) ??
        (key === "sourceName" ? object.name : undefined) ??
        (key === "activeLeads" ? object.activeLeads : undefined) ??
        (key === "conversionRate"
          ? `${object.conversionRate ?? 0}%`
          : undefined) ??
        (key === "stageName" ? object.name : undefined) ??
        (key === "activeLeadCount" ? object.activeLeadCount : undefined) ??
        (key === "conversionStage"
          ? (object.conversionStage ?? object.isConverted)
          : undefined) ??
        (key === "lostStage"
          ? (object.lostStage ?? object.isLost)
          : undefined) ??
        (key === "sla" ? (object.sla ?? object.slaDurationHours) : undefined) ??
        (key === "lead" ? resolveRecordName(object.leadId) : undefined) ??
        (key === "previousOwner"
          ? resolvePersonName(object.previousOwner)
          : undefined) ??
        (key === "newOwner"
          ? resolvePersonName(object.assignedTo)
          : undefined) ??
        (key === "assignedBy"
          ? resolvePersonName(object.assignedBy)
          : undefined) ??
        (key === "assignedDate"
          ? (object.assignedAt ?? object.createdAt)
          : undefined) ??
        (key === "assignmentReason" ? object.assignmentReason : undefined) ??
        (key === "department"
          ? resolveRecordName(object.departmentId, workspace?.departments)
          : undefined) ??
        (key === "branch"
          ? resolveRecordName(
              object.branchId ??
                findDepartmentBranchId(
                  object.departmentId,
                  workspace?.departments,
                ),
              workspace?.branches,
            )
          : undefined) ??
        (key === "created" ? object.createdAt : undefined) ??
        (key === "updated" ? object.updatedAt : undefined) ??
        (index === 0 ? object.title : undefined) ??
        (index === 0 ? object.name : undefined) ??
        (index === module.columns.length - 1 ? object.status : undefined);

      return stringifyCell(value);
    });
  });
}

function resolvePersonName(value: unknown) {
  if (!value || typeof value !== "object") return stringifyCell(value);
  const object = value as Record<string, unknown>;
  return (
    [object.firstName, object.lastName].filter(Boolean).join(" ") ||
    object.name ||
    object.email ||
    object._id ||
    object.id ||
    "-"
  );
}

function resolveRecordName(value: unknown, records?: unknown[]) {
  if (!value) return undefined;
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    return (
      object.name ?? object.title ?? object.code ?? object._id ?? object.id
    );
  }
  const id = String(value);
  const match = records?.find((record) => {
    if (!record || typeof record !== "object") return false;
    const object = record as Record<string, unknown>;
    return object._id === id || object.id === id;
  });
  if (match && typeof match === "object") {
    const object = match as Record<string, unknown>;
    return object.name ?? object.title ?? object.code ?? id;
  }
  return id.length > 18 ? "-" : id;
}

function findDepartmentBranchId(
  departmentId: unknown,
  departments?: unknown[],
) {
  const department = resolveRecordObject(departmentId, departments);
  return department?.branchId;
}

function resolveRecordObject(value: unknown, records?: unknown[]) {
  if (!value) return undefined;
  if (typeof value === "object") return value as Record<string, unknown>;
  const id = String(value);
  const match = records?.find((record) => {
    if (!record || typeof record !== "object") return false;
    const object = record as Record<string, unknown>;
    return object._id === id || object.id === id;
  });
  return match && typeof match === "object"
    ? (match as Record<string, unknown>)
    : undefined;
}

export function stringifyCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return formatDateTime(value);
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string" && looksLikeIsoDate(value)) {
    return formatDateTime(new Date(value));
  }
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    return stringifyCell(object.name ?? object.title ?? object.code ?? "-");
  }
  return String(value).replaceAll("_", " ");
}

function looksLikeIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}

function formatDateTime(value: Date) {
  if (Number.isNaN(value.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
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
      Domain: object.customDomain ?? object.primaryDomain ?? object.subdomain,
      Email: object.primaryEmail,
      "Last Activity": object.lastActivityAt ?? object.updatedAt,
      "Lead Usage": object.leadUsage,
      "Organization Code": object.code,
      "Organization Name": object.name ?? object.title,
      "Organization Type": object.type,
      Phone: object.primaryPhone,
      Plan:
        normalizeResponseObject(object.subscription).plan ??
        object.plan ??
        object.planCode ??
        object.subscriptionPlan,
      "Primary Contact": object.legalName ?? object.name,
      Status: object.status,
      "Storage Usage": object.storageUsage,
      "Subscription Status":
        object.subscriptionStatus ??
        normalizeResponseObject(object.subscription).status,
      "User Count": object.userCount,
      Organization: object.name ?? object.title,
      Type: object.type,
      "Created Date": object.createdAt,
    };

    return module.columns.map((column) => stringifyCell(values[column]));
  });
}

function billingSummaryToRows(
  records: unknown[] | undefined,
  module: AdminModule,
  organizations: unknown[],
) {
  if (!records?.length) return [];

  return records.map((record) => {
    const object = normalizeResponseObject(record);
    const currentPlan = normalizeResponseObject(object.currentPlan);
    const plan = normalizeResponseObject(currentPlan.planId);
    const billing = normalizeResponseObject(object.billing);
    const limits = normalizeResponseObject(object.limits);
    const organizationName =
      resolveRecordName(
        object.organizationId,
        organizations as Array<Record<string, unknown>>,
      ) || object.organizationName;
    const values: Record<string, unknown> = {
      Organization: organizationName,
      Plan: plan.name ?? plan.slug ?? "No active plan",
      Cycle: plan.billingCycle,
      Amount: plan.price,
      Status: currentPlan.status ?? "inactive",
      Renewal: billing.nextRenewalAt ?? currentPlan.endDate,
      Users: limits.userLimit,
      Branches: limits.branchLimit,
      Leads: limits.leadLimit,
      Storage: limits.storageLimitGb
        ? `${String(limits.storageLimitGb)} GB`
        : undefined,
    };

    return module.columns.map((column) => stringifyCell(values[column]));
  });
}

function userRecordsToRows(
  records: unknown[] | undefined,
  module: AdminModule,
) {
  if (!records?.length) return [];

  return records.map((record) => {
    const object =
      record && typeof record === "object"
        ? (record as Record<string, unknown>)
        : {};
    const memberships = Array.isArray(object.memberships)
      ? object.memberships
      : [];
    const primaryMembership =
      memberships[0] && typeof memberships[0] === "object"
        ? (memberships[0] as Record<string, unknown>)
        : {};
    const organization =
      primaryMembership.organizationId &&
      typeof primaryMembership.organizationId === "object"
        ? (primaryMembership.organizationId as Record<string, unknown>)
        : {};
    const departments = Array.isArray(primaryMembership.departmentIds)
      ? primaryMembership.departmentIds
      : [];
    const departmentNames = departments
      .map((department) =>
        department && typeof department === "object"
          ? (department as Record<string, unknown>).name
          : department,
      )
      .filter(Boolean);
    const branches = Array.isArray(primaryMembership.branchIds)
      ? primaryMembership.branchIds
      : [];
    const branchNames = branches
      .map((branch) =>
        branch && typeof branch === "object"
          ? (branch as Record<string, unknown>).name
          : branch,
      )
      .filter(Boolean);
    const systemRoles = Array.isArray(object.roles) ? object.roles : [];
    const membershipRoles = memberships
      .map((membership) =>
        membership && typeof membership === "object"
          ? (membership as Record<string, unknown>).role
          : undefined,
      )
      .filter(Boolean);
    const userType =
      membershipRoles.includes("student") || systemRoles.includes("student")
        ? "Student"
        : membershipRoles.includes("parent") || systemRoles.includes("parent")
          ? "Parent"
          : "CRM User";
    const values: Record<string, unknown> = {
      "Account Status":
        typeof object.status === "string"
          ? object.status.charAt(0).toUpperCase() +
            object.status.slice(1).toLowerCase()
          : object.status,
      "Created Date": object.createdAt,
      Department: departmentNames.length ? departmentNames : "-",
      Email: object.email,
      "Last Login": object.lastLoginAt,
      "MFA Status": object.mfaRequired ? "Required" : "Not required",
      Name:
        [object.firstName, object.lastName].filter(Boolean).join(" ") ||
        object.email,
      Role: primaryMembership.role ?? membershipRoles[0] ?? "-",
      User: object.email,
      "User Type": userType,
      "System Roles": systemRoles.length ? systemRoles : "-",
      "Access Role": primaryMembership.role ?? membershipRoles[0] ?? "-",
      Organization: organization.name ?? "-",
      Branch: branchNames.length ? branchNames : "All branches",
      Status:
        typeof object.status === "string"
          ? object.status.charAt(0).toUpperCase() +
            object.status.slice(1).toLowerCase()
          : object.status,
      Sessions: object.activeSessions,
    };

    return module.columns.map((column) => stringifyCell(values[column]));
  });
}

function authOverviewToRows(
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
      Control: object.control,
      Provider: object.provider,
      Scope: object.scope ?? "Organization",
      Owner: object.owner ?? "Security",
      Status: object.status,
      Updated: object.updatedAt ?? object.updated ?? "Live",
    };

    return module.columns.map((column) => stringifyCell(values[column]));
  });
}

function integrationRecordsToRows(
  records: unknown[] | undefined,
  module: AdminModule,
) {
  if (!records?.length) return [];

  return records.map((record) => {
    const object =
      record && typeof record === "object"
        ? (record as Record<string, unknown>)
        : {};
    const providerKey =
      typeof object.providerKey === "string" ? object.providerKey : "";
    const label = providerKey.replaceAll("_", " ");
    const values: Record<string, unknown> = {
      Integration: label,
      Category: label.split(" ")[0] ?? "Integration",
      Provider: label,
      Owner: "Organization Admin",
      "Last Sync": object.lastCheckedAt,
      Status: object.status,
    };

    return module.columns.map((column) => stringifyCell(values[column]));
  });
}

function securityPolicyToRows(
  policy: Record<string, unknown> | null | undefined,
  module: AdminModule,
) {
  if (!policy) return [];

  const allowedIpCidrs = Array.isArray(policy.allowedIpCidrs)
    ? policy.allowedIpCidrs
    : [];
  const maskedFields = Array.isArray(policy.maskedFields)
    ? policy.maskedFields
    : [];
  const updated = policy.updatedAt ?? "Live";

  const controls: Array<Record<string, unknown>> = [
    {
      Control: "Multi-factor authentication",
      Scope: "Organization",
      Policy: policy.mfaRequired ? "Required" : "Optional",
      Owner: "Security",
      Status: policy.mfaRequired ? "Enforced" : "Not enforced",
      Updated: updated,
    },
    {
      Control: "Single sign-on",
      Scope: "Organization",
      Policy: policy.ssoRequired ? "Required" : "Optional",
      Owner: "Security",
      Status: policy.ssoRequired ? "Enforced" : "Not enforced",
      Updated: updated,
    },
    {
      Control: "IP allowlist",
      Scope: "Organization",
      Policy: allowedIpCidrs.length
        ? allowedIpCidrs.join(", ")
        : "Unrestricted",
      Owner: "Security",
      Status: allowedIpCidrs.length ? "Restricted" : "Open",
      Updated: updated,
    },
    {
      Control: "Field masking",
      Scope: "Organization",
      Policy: maskedFields.length ? maskedFields.join(", ") : "None",
      Owner: "Security",
      Status: maskedFields.length ? "Enabled" : "Disabled",
      Updated: updated,
    },
  ];

  return controls.map((values) =>
    module.columns.map((column) => stringifyCell(values[column])),
  );
}

function roleRecordsToRows(
  records: unknown[] | undefined,
  module: AdminModule,
) {
  if (!records?.length) return [];

  return records.map((record) => {
    const object =
      record && typeof record === "object"
        ? (record as Record<string, unknown>)
        : {};
    const permissions = Array.isArray(object.permissions)
      ? object.permissions
          .map((permission) =>
            permission && typeof permission === "object"
              ? (permission as Record<string, unknown>).name
              : permission,
          )
          .filter(Boolean)
      : [];
    const permissionPreview =
      permissions.length > 4
        ? `${permissions.slice(0, 4).join(", ")} +${permissions.length - 4} more`
        : permissions.join(", ");
    const values: Record<string, unknown> = {
      Role: object.name,
      Description: object.description,
      Permissions: permissionPreview || "No permissions",
      Status: object.isActive === false ? "Inactive" : "Active",
      Updated: object.updatedAt,
    };

    return module.columns.map((column) => stringifyCell(values[column]));
  });
}

function permissionRecordsToRows(
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
      Permission: object.name,
      Module: object.module,
      Description: object.description,
      Status: object.isActive === false ? "Inactive" : "Active",
      Updated: object.updatedAt,
    };

    return module.columns.map((column) => stringifyCell(values[column]));
  });
}
