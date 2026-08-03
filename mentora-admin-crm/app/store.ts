"use client";

import {
  configureStore,
  createAsyncThunk,
  createSlice,
  isRejected,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

export type DemoContext = {
  organization: string;
  organizationId?: string;
  branch: string;
  branchIds?: string[];
  role: string;
  label: string;
  modules: string[];
};

export type CrmProfilePreferences = {
  defaultBranchId: string;
  defaultLandingPage: string;
  defaultOrganizationId: string;
  restoreLastContext: boolean;
};

export type DemoUser = {
  email: string;
  name: string;
  contexts: DemoContext[];
};

type AuthenticatedCrmUser = DemoUser & {
  accessToken: string;
};

type CrmSessionState = {
  activeContext: DemoContext | null;
  activeId: string;
  accessToken: string;
  loginEmail: string;
  loginError: string | null;
  loginPassword: string;
  loggedInUser: DemoUser | null;
  preferences: CrmProfilePreferences;
  themeMode: "system" | "light" | "dark";
  toast: string;
};

type CrmWorkspaceState = {
  activeBranchId: string;
  activeOrganizationId: string;
  branches: unknown[];
  contexts: unknown[];
  coverage: unknown[];
  dashboard: unknown | null;
  departments: unknown[];
  error: string | null;
  integrationProviders: unknown[];
  loading: boolean;
  moduleRecords: Record<string, unknown[]>;
  authOverview: unknown | null;
  securityPolicy: unknown | null;
  teams: unknown[];
  organizations: unknown[];
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type ChangePasswordDraft = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type OrganizationDraft = {
  academicYear?: string;
  address?: Record<string, string>;
  branchCity?: string;
  branchCode?: string;
  branchName?: string;
  branchState?: string;
  code?: string;
  currency?: string;
  customDomain?: string;
  dateFormat?: string;
  enabledModules?: string[];
  financialYear?: string;
  id?: string;
  legalName?: string;
  locale?: string;
  logoUrl?: string;
  name: string;
  primaryEmail?: string;
  primaryDomain?: string;
  primaryPhone?: string;
  registrationNumber?: string;
  status?: string;
  subdomain?: string;
  subscription?: Record<string, unknown>;
  taxNumber?: string;
  timezone?: string;
  type: string;
  website?: string;
};

export type OrganizationUserDraft = {
  branchIds?: string[];
  departmentIds?: string[];
  teamIds?: string[];
  email: string;
  firstName?: string;
  id?: string;
  ipRestrictions?: string[];
  lastName?: string;
  mfaRequired?: boolean;
  password: string;
  permissionOverrides?: string[];
  phone?: string;
  role: string;
  organizationId: string;
  status?: string;
};

export type OrganizationSetupDraft = {
  address?: string;
  branchId?: string;
  channel?: string;
  city?: string;
  code?: string;
  departmentId?: string;
  domains?: string;
  function?: string;
  limits?: Record<string, unknown>;
  logoUrl?: string;
  name?: string;
  organizationId: string;
  primaryColor?: string;
  providerKey?: string;
  secondaryColor?: string;
  senderName?: string;
  state?: string;
  status?: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

let crmAccessToken = "";
const crmSessionStorageKey = "mentora.crm.session.v1";
const crmWorkspaceContextStorageKey = "mentora.crm.workspace-context.v1";
const defaultCrmProfilePreferences: CrmProfilePreferences = {
  defaultBranchId: "",
  defaultLandingPage: "dashboard",
  defaultOrganizationId: "",
  restoreLastContext: true,
};

function setCrmAccessToken(token: string) {
  crmAccessToken = token;
}

export type PersistedCrmSession = Pick<
  CrmSessionState,
  | "accessToken"
  | "activeContext"
  | "activeId"
  | "loggedInUser"
  | "preferences"
  | "themeMode"
>;

export function readPersistedCrmSession(): Partial<PersistedCrmSession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(crmSessionStorageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedCrmSession>;
    if (typeof parsed.accessToken === "string") {
      setCrmAccessToken(parsed.accessToken);
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(crmSessionStorageKey);
    return {};
  }
}

function writePersistedCrmSession(session: PersistedCrmSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(crmSessionStorageKey, JSON.stringify(session));
}

function clearPersistedCrmSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(crmSessionStorageKey);
  window.localStorage.removeItem(crmWorkspaceContextStorageKey);
}

type PersistedWorkspaceContext = {
  activeBranchId: string;
  activeOrganizationId: string;
};

function readPersistedWorkspaceContext(): Partial<PersistedWorkspaceContext> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(crmWorkspaceContextStorageKey);
    return raw ? (JSON.parse(raw) as Partial<PersistedWorkspaceContext>) : {};
  } catch {
    window.localStorage.removeItem(crmWorkspaceContextStorageKey);
    return {};
  }
}

function writePersistedWorkspaceContext(context: PersistedWorkspaceContext) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    crmWorkspaceContextStorageKey,
    JSON.stringify(context),
  );
}

function isUnauthorizedError(message?: string) {
  return /\b(401|unauthorized|token expired|jwt expired)\b/i.test(
    message ?? "",
  );
}

function resolvePrimaryCrmRole(roles: string[]) {
  const priority = [
    "super_admin",
    "organization_admin",
    "branch_admin",
    "admission_manager",
    "sales_executive",
    "finance",
    "marketing_executive",
    "call-center",
    "field_agent",
    "support",
  ];
  return priority.find((role) => roles.includes(role)) ?? roles[0] ?? "user";
}

function getObjectValue(record: unknown, keys: string[]) {
  if (!record || typeof record !== "object") return undefined;
  const object = record as Record<string, unknown>;
  return keys.map((key) => object[key]).find((value) => value != null);
}

function getRecordIdValue(record: unknown) {
  const value = getObjectValue(record, ["_id", "id"]);
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "toHexString" in value &&
    typeof (value as { toHexString?: unknown }).toHexString === "function"
  ) {
    return (value as { toHexString: () => string }).toHexString();
  }
  return "";
}

function getRecordDisplayName(record: unknown, fallback: string) {
  const value = getObjectValue(record, ["name", "title", "label", "code"]);
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeContextArray(value: unknown) {
  if (Array.isArray(value)) return value;
  return [];
}

export function normalizeBackendCrmContexts(value: unknown): DemoContext[] {
  return normalizeContextArray(value)
    .map((context) => {
      if (!context || typeof context !== "object") return null;
      const object = context as Record<string, unknown>;
      const role =
        typeof object.role === "string" && object.role.trim()
          ? object.role
          : "user";
      const organizationRecord =
        object.organization ?? object.organizationId ?? null;
      const branchRecords = normalizeContextArray(
        object.branches ?? object.branchIds,
      );
      const organizationId = getRecordIdValue(organizationRecord);
      const branchIds = branchRecords
        .map((branch) => getRecordIdValue(branch))
        .filter(Boolean);
      const isGlobalSuperAdmin = role === "super_admin" && !organizationId;
      const organization = isGlobalSuperAdmin
        ? "All Organizations"
        : getRecordDisplayName(organizationRecord, "Assigned Organization");
      const branch =
        isGlobalSuperAdmin || branchRecords.length === 0
          ? role === "super_admin" || role === "organization_admin"
            ? "All Branches"
            : "Assigned Branches"
          : branchRecords.length === 1
            ? getRecordDisplayName(branchRecords[0], "Assigned Branch")
            : `${branchRecords.length} Branches`;

      const normalizedContext: DemoContext = {
        branch,
        branchIds,
        label: `${role.replaceAll("_", " ")} / ${organization} / ${branch}`,
        modules: allAdminModuleIds,
        organization,
        organizationId,
        role,
      };

      return normalizedContext;
    })
    .filter((context): context is DemoContext => context !== null);
}

function clearExpiredSession(state: CrmSessionState) {
  state.activeContext = null;
  state.activeId = "dashboard";
  state.accessToken = "";
  state.loggedInUser = null;
  state.loginPassword = "";
  state.loginError = "Your session expired. Please sign in again.";
  state.toast = state.loginError;
  setCrmAccessToken("");
  clearPersistedCrmSession();
}

export type ModuleRecordDraft = {
  id?: string;
  organizationId?: string;
  moduleKey: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueAt?: string;
  payload: Record<string, string>;
};

export type ModuleRecordListParams = {
  limit?: number;
  moduleKey: string;
  page?: number;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  organizationId: string;
};

function adminPath(path: string) {
  return path.startsWith("/admin/") ? path : `/admin${path}`;
}

const dedicatedCrmRoutes: Record<string, string> = {
  admissions: adminPath("/admissions"),
  applications: adminPath("/applications"),
  assignments: adminPath("/leads/operations/assignments"),
  branches: adminPath("/branches"),
  "call-center": adminPath("/call-center"),
  campaigns: adminPath("/campaigns"),
  communications: adminPath("/communications"),
  departments: adminPath("/departments"),
  documents: adminPath("/documents"),
  emails: adminPath("/communications"),
  events: adminPath("/events"),
  "field-force": adminPath("/field-force"),
  finance: adminPath("/finance-ledgers"),
  interview: adminPath("/interviews"),
  leads: adminPath("/leads"),
  "lead-sources": adminPath("/lead-sources"),
  "lead-stages": adminPath("/lead-stages"),
  automation: adminPath("/workflows/rules"),
  reports: adminPath("/reports/definitions"),
  scholarship: adminPath("/scholarships"),
  support: "/admin/support/tickets",
  sms: adminPath("/communications"),
  tasks: adminPath("/tasks"),
  teams: adminPath("/teams"),
  whatsapp: adminPath("/whatsapp"),
};

const allAdminModuleIds = [
  "dashboard",
  "platform-foundation",
  "authentication",
  "users",
  "roles",
  "permissions",
  "organizations",
  "branches",
  "departments",
  "teams",
  "security",
  "billing",
  "branding",
  "global-settings",
  "audit-logs",
  "leads",
  "contacts",
  "lead-sources",
  "lead-stages",
  "activities",
  "notes",
  "tasks",
  "follow-ups",
  "meetings",
  "assignments",
  "tags",
  "custom-fields",
  "imports-exports",
  "students",
  "academic-sessions",
  "programs",
  "courses",
  "specializations",
  "applications",
  "admissions",
  "enrollment",
  "fees",
  "scholarship",
  "interview",
  "campaigns",
  "marketing-automation",
  "landing-pages",
  "lead-scoring",
  "marketing-attribution",
  "communications",
  "emails",
  "sms",
  "notifications",
  "call-center",
  "whatsapp",
  "telephony",
  "chatbots",
  "automation",
  "mobile-app",
  "calendar",
  "finance",
  "events",
  "field-force",
  "reports",
  "analytics",
  "ai-features",
  "integrations",
  "support",
];

const dedicatedCrmUpdateMethods: Record<string, "PATCH" | "POST" | "PUT"> = {
  admissions: "POST",
  applications: "PUT",
  "call-center": "POST",
  campaigns: "PUT",
  communications: "PUT",
  documents: "PUT",
  events: "POST",
  "field-force": "POST",
  finance: "POST",
  interview: "POST",
  "lead-sources": "POST",
  "lead-stages": "POST",
  scholarship: "POST",
  support: "PATCH",
  tasks: "PUT",
  whatsapp: "POST",
};
const upsertOnlyDedicatedModules = new Set(["lead-sources", "lead-stages"]);

function toDedicatedCrmPayload(draft: ModuleRecordDraft) {
  const body = {
    organizationId: draft.organizationId,
    title: draft.title,
    description: draft.description,
    status: draft.status,
    priority: draft.priority,
    dueAt: draft.dueAt,
    payload: draft.payload,
  };

  if (draft.moduleKey === "leads") {
    const payload = draft.payload ?? {};
    const [fallbackFirstName, ...fallbackLastNameParts] = draft.title
      .trim()
      .split(/\s+/);
    return {
      organizationId: draft.organizationId,
      academicLevel: payload.academicLevel || undefined,
      academicSession: payload.academicSession || undefined,
      alternatePhone: payload.alternatePhone || undefined,
      budgetRange: payload.budgetRange || undefined,
      campaign: payload.campaign || undefined,
      campus: payload.preferredCampus || payload.campus || undefined,
      city: payload.city || undefined,
      consentStatus: payload.consentStatus || undefined,
      country: payload.country || undefined,
      currentQualification: payload.currentQualification || undefined,
      dateOfBirth: payload.dateOfBirth || undefined,
      disqualificationReason: payload.disqualificationReason || undefined,
      email: payload.email || undefined,
      entranceExam: payload.entranceExam || undefined,
      examScore: payload.examScore || undefined,
      firstName: payload.firstName || fallbackFirstName || "New",
      followUpNote: payload.followUpNote || undefined,
      followUpType: payload.followUpType || undefined,
      formSource: payload.formSource || undefined,
      fullAddress: payload.fullAddress || undefined,
      gender: payload.gender || undefined,
      graduationYear: payload.graduationYear
        ? Number(payload.graduationYear)
        : undefined,
      intake: payload.intake || undefined,
      interestedCourse: payload.course || payload.interestedCourse || undefined,
      interestedPrograms: payload.interestedProgram
        ? [payload.interestedProgram]
        : undefined,
      landingPage: payload.landingPage || undefined,
      lastName: payload.lastName || fallbackLastNameParts.join(" ") || "Lead",
      lostReason: payload.lostReason || undefined,
      middleName: payload.middleName || undefined,
      partner: payload.partner || undefined,
      percentageOrCgpa: payload.percentageCgpa || undefined,
      phone: payload.phone || undefined,
      postalCode: payload.postalCode || undefined,
      preferredLanguage: payload.preferredLanguage || undefined,
      preferredLocation: payload.preferredLocation || undefined,
      preferredMode: payload.preferredMode || undefined,
      priority: draft.priority,
      referral: payload.referral || undefined,
      specialization: payload.specialization || undefined,
      state: payload.state || undefined,
      subSource: payload.subSource || undefined,
      tags: payload.tags
        ? payload.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined,
      temperature: payload.temperature || undefined,
      customFields: {
        description: draft.description,
        notes: payload.notes,
        source: payload.leadSource || "admin-crm",
        ...payload,
      },
      nextFollowUpAt: draft.dueAt || undefined,
      score: payload.leadScore ? Number(payload.leadScore) : undefined,
      status:
        draft.status === "archived"
          ? "archived"
          : draft.status === "closed"
            ? "lost"
            : draft.status === "completed"
              ? "won"
              : draft.status === "in_progress"
                ? "open"
                : "new",
    };
  }

  if (draft.moduleKey === "applications") {
    return {
      organizationId: draft.organizationId,
      courseOffering: draft.title || "Mentora Program Application",
      applicantProfile: {
        source: "admin-crm",
        summary: draft.description,
        priority: draft.priority,
        ...(draft.payload ?? {}),
      },
      formResponses: {
        dueAt: draft.dueAt,
      },
      status:
        draft.status === "archived"
          ? "withdrawn"
          : draft.status === "completed"
            ? "admission_confirmed"
            : draft.status === "in_progress"
              ? "under_review"
              : "draft",
    };
  }

  if (draft.moduleKey === "campaigns") {
    return {
      organizationId: draft.organizationId,
      audience: draft.payload.audience
        ? { segment: draft.payload.audience }
        : undefined,
      channel: draft.payload.channel || "email",
      dripSteps: draft.payload.dripSteps
        ? [{ name: draft.payload.dripSteps }]
        : undefined,
      metrics: {
        applications: draft.payload.applications
          ? Number(draft.payload.applications)
          : undefined,
        leads: draft.payload.leads ? Number(draft.payload.leads) : undefined,
        spend: draft.payload.spend || undefined,
      },
      name: draft.title,
      roi: draft.payload.roi ? { value: draft.payload.roi } : undefined,
      scheduledAt: draft.dueAt || undefined,
      status:
        draft.status === "archived"
          ? "archived"
          : draft.status === "completed"
            ? "completed"
            : draft.status === "in_progress"
              ? "running"
              : draft.status === "blocked"
                ? "paused"
                : "draft",
      utm: {
        campaign: draft.payload.utmCampaign || draft.title,
        content: draft.payload.utmContent || undefined,
        medium: draft.payload.utmMedium || draft.payload.channel || undefined,
        source: draft.payload.utmSource || undefined,
        term: draft.payload.utmTerm || undefined,
      },
    };
  }

  if (draft.moduleKey === "lead-sources") {
    return {
      organizationId: draft.organizationId,
      category: draft.payload.category || "website",
      code:
        draft.payload.code || draft.title.toUpperCase().replace(/\W+/g, "_"),
      cost: draft.payload.cost ? Number(draft.payload.cost) : undefined,
      defaultAssignmentRule: draft.payload.defaultAssignmentRule
        ? { rule: draft.payload.defaultAssignmentRule }
        : undefined,
      defaultCampaign: draft.payload.defaultCampaign || undefined,
      description: draft.description || draft.payload.description || undefined,
      name: draft.payload.name || draft.title,
      parentSourceId: draft.payload.parentSource || undefined,
      status:
        draft.status === "archived" || draft.payload.activeStatus === "inactive"
          ? "inactive"
          : "active",
    };
  }

  if (draft.moduleKey === "lead-stages") {
    return {
      organizationId: draft.organizationId,
      allowedNextStageIds: draft.payload.allowedNextStages
        ? draft.payload.allowedNextStages
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : undefined,
      category: draft.payload.category || "new",
      code:
        draft.payload.code || draft.title.toUpperCase().replace(/\W+/g, "_"),
      color: draft.payload.color || undefined,
      escalationRule: draft.payload.escalationRule
        ? { rule: draft.payload.escalationRule }
        : undefined,
      isConverted: draft.payload.isConvertedStage === "true",
      isInitial: draft.payload.isInitialStage === "true",
      isLost: draft.payload.isLostStage === "true",
      mandatoryFieldsBeforeEntry: draft.payload.mandatoryFieldsBeforeEntry
        ? draft.payload.mandatoryFieldsBeforeEntry
            .split(",")
            .map((field) => field.trim())
            .filter(Boolean)
        : undefined,
      name: draft.payload.name || draft.title,
      order: draft.payload.displayOrder
        ? Number(draft.payload.displayOrder)
        : undefined,
      requiresRemarks: draft.payload.requiresRemarks === "true",
      slaDurationHours: draft.payload.slaDuration
        ? Number(draft.payload.slaDuration)
        : undefined,
      status:
        draft.status === "archived" || draft.payload.status === "inactive"
          ? "inactive"
          : "active",
    };
  }

  if (draft.moduleKey === "documents") {
    return {
      organizationId: draft.organizationId,
      category: draft.payload.category || "other",
      entityId: draft.payload.entityId || "000000000000000000000000",
      entityType: draft.payload.entityType || "application",
      mimeType: draft.payload.mimeType || "application/pdf",
      name: draft.title || "CRM document",
      status:
        draft.status === "completed"
          ? "verified"
          : draft.status === "archived"
            ? "archived"
            : "submitted",
      url:
        draft.payload.url ||
        "https://cdn.mentora.test/documents/admin-upload-placeholder.pdf",
      verification: {
        note: draft.description,
        source: "admin-crm",
      },
    };
  }

  if (["communications", "emails", "sms"].includes(draft.moduleKey)) {
    return {
      organizationId: draft.organizationId,
      channel:
        draft.moduleKey === "emails"
          ? "email"
          : draft.moduleKey === "sms"
            ? "sms"
            : draft.payload.channel || "in_app",
      content: draft.description || draft.payload.content || draft.title,
      direction: draft.payload.direction || "outbound",
      entityId: draft.payload.entityId || "000000000000000000000000",
      entityType: draft.payload.entityType || "general",
      status:
        draft.status === "archived"
          ? "archived"
          : draft.status === "completed"
            ? "delivered"
            : draft.status === "failed"
              ? "failed"
              : "queued",
      subject: draft.title,
    };
  }

  if (draft.moduleKey === "tasks") {
    return {
      organizationId: draft.organizationId,
      assignedTo: draft.payload.assignedTo || "000000000000000000000000",
      description: draft.description,
      dueAt: draft.dueAt || undefined,
      entityId: draft.payload.entityId || "000000000000000000000000",
      entityType: draft.payload.entityType || "general",
      priority: draft.priority,
      recurringRule: draft.payload.recurringRule || undefined,
      reminderAt: draft.payload.reminderAt || undefined,
      status:
        draft.status === "archived"
          ? "cancelled"
          : draft.status === "completed"
            ? "completed"
            : draft.status === "in_progress"
              ? "in_progress"
              : "open",
      title: draft.title,
    };
  }

  if (draft.moduleKey === "reports") {
    return {
      organizationId: draft.organizationId,
      columns: draft.payload.columns
        ? draft.payload.columns
            .split(",")
            .map((column) => column.trim())
            .filter(Boolean)
        : ["name", "status", "createdAt"],
      filters: draft.payload.filters ? { value: draft.payload.filters } : {},
      moduleKey: draft.payload.moduleKey || "leads",
      name: draft.title,
      reportType: draft.payload.reportType || "table",
      schedule: draft.payload.schedule ? { value: draft.payload.schedule } : {},
      status:
        draft.status === "archived"
          ? "archived"
          : draft.status === "completed"
            ? "active"
            : "draft",
    };
  }

  if (draft.moduleKey === "automation") {
    return {
      organizationId: draft.organizationId,
      actions: draft.payload.actions
        ? [{ name: draft.payload.actions }]
        : [{ name: "notify", channel: "in_app" }],
      conditions: draft.payload.conditions
        ? { value: draft.payload.conditions }
        : {},
      moduleKey: draft.payload.moduleKey || "leads",
      name: draft.title,
      priority: draft.payload.priority
        ? Number(draft.payload.priority)
        : draft.priority === "urgent"
          ? 90
          : draft.priority === "high"
            ? 70
            : 50,
      retryPolicy: draft.payload.retryPolicy
        ? { value: draft.payload.retryPolicy }
        : undefined,
      slaPolicy: draft.payload.slaPolicy
        ? { value: draft.payload.slaPolicy }
        : undefined,
      status:
        draft.status === "archived"
          ? "archived"
          : draft.status === "blocked"
            ? "paused"
            : draft.status === "completed"
              ? "active"
              : "draft",
      trigger: draft.payload.trigger || "record_created",
    };
  }

  return body;
}

async function getJson(path: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    credentials: "include",
    headers: crmAccessToken
      ? {
          Authorization: `Bearer ${crmAccessToken}`,
        }
      : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

async function sendJson(
  path: string,
  method: "PATCH" | "POST" | "PUT",
  body: unknown,
) {
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    body: JSON.stringify(body),
    credentials: "include",
    headers: {
      ...(crmAccessToken ? { Authorization: `Bearer ${crmAccessToken}` } : {}),
      "Content-Type": "application/json",
    },
    method,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

async function deleteJson(path: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    credentials: "include",
    headers: crmAccessToken
      ? {
          Authorization: `Bearer ${crmAccessToken}`,
        }
      : undefined,
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export const loginWithCredentials = createAsyncThunk(
  "crmSession/loginWithCredentials",
  async (credentials: LoginCredentials) => {
    const response = await sendJson(
      adminPath("/auth/login"),
      "POST",
      credentials,
    );
    const data = normalizeApiObject(response) as Record<string, unknown>;
    const user =
      data.user && typeof data.user === "object"
        ? (data.user as Record<string, unknown>)
        : data;
    const email =
      typeof user.email === "string" ? user.email : credentials.email;
    const name =
      typeof user.name === "string"
        ? user.name
        : email
            .split("@")[0]
            .replace(/[._-]+/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

    const accessToken =
      typeof data.accessToken === "string" ? data.accessToken : "";
    const roles = Array.isArray(user.roles) ? user.roles.map(String) : [];
    const role = resolvePrimaryCrmRole(roles);
    return {
      accessToken,
      email,
      name,
      contexts: [
        {
          branch: role === "super_admin" ? "All Branches" : "Assigned Branches",
          label: "Authenticated CRM Workspace",
          modules: allAdminModuleIds,
          role,
          organization:
            role === "super_admin"
              ? "All Organizations"
              : "Assigned Organization",
        },
      ],
    } satisfies AuthenticatedCrmUser;
  },
);

export const changeCrmPassword = createAsyncThunk(
  "crmSession/changeCrmPassword",
  async (draft: ChangePasswordDraft) => {
    return sendJson("/auth/change-password", "POST", {
      oldPassword: draft.currentPassword,
      newPassword: draft.newPassword,
      confirmPassword: draft.confirmPassword,
    });
  },
);

export const loadCrmWorkspace = createAsyncThunk(
  "crmWorkspace/load",
  async (params?: { organizationId?: string }) => {
    const query = new URLSearchParams();
    if (params?.organizationId)
      query.set("organizationId", params.organizationId);
    return getJson(
      `${adminPath("/dashboard/bootstrap")}${query.size ? `?${query.toString()}` : ""}`,
    );
  },
);

export const loadOrganizations = createAsyncThunk(
  "crmWorkspace/loadOrganizations",
  async () => {
    return getJson(adminPath("/organizations?limit=100&status=active"));
  },
);

export const loadBranches = createAsyncThunk(
  "crmWorkspace/loadBranches",
  async ({ organizationId }: { organizationId: string }) => {
    return getJson(
      adminPath(
        `/branches?organizationId=${encodeURIComponent(organizationId)}`,
      ),
    );
  },
);

export const loadIdentityHierarchy = createAsyncThunk(
  "crmWorkspace/loadIdentityHierarchy",
  async ({ organizationId }: { organizationId: string }) => {
    return getJson(
      adminPath(
        `/identity/hierarchy?organizationId=${encodeURIComponent(organizationId)}`,
      ),
    );
  },
);

export const createOrganization = createAsyncThunk(
  "crmWorkspace/createOrganization",
  async (draft: OrganizationDraft) => {
    return sendJson(adminPath("/organizations"), "POST", draft);
  },
);

export const updateOrganization = createAsyncThunk(
  "crmWorkspace/updateOrganization",
  async (draft: OrganizationDraft & { id: string }) => {
    return sendJson(adminPath(`/organizations/${draft.id}`), "PUT", draft);
  },
);

export const createOrganizationUser = createAsyncThunk(
  "crmWorkspace/createOrganizationUser",
  async (draft: OrganizationUserDraft) => {
    return sendJson(adminPath("/users"), "POST", draft);
  },
);

export type RbacRecordDraft = {
  description?: string;
  id?: string;
  isActive?: boolean;
  module?: string;
  name: string;
  permissions?: string[];
  type: "permission" | "role";
};

export const loadRbacRecords = createAsyncThunk(
  "crmWorkspace/loadRbacRecords",
  async ({ type }: { type: "permission" | "role" }) => {
    const path =
      type === "role"
        ? adminPath("/rbac/roles?status=all")
        : adminPath("/rbac/permissions?status=all");
    return {
      moduleKey: type === "role" ? "roles" : "permissions",
      records: await getJson(path),
    };
  },
);

export const saveRbacRecord = createAsyncThunk(
  "crmWorkspace/saveRbacRecord",
  async (draft: RbacRecordDraft) => {
    const collection = draft.type === "role" ? "roles" : "permissions";
    const body =
      draft.type === "role"
        ? {
            description: draft.description,
            isActive: draft.isActive,
            name: draft.name,
            permissions: draft.permissions ?? [],
          }
        : {
            description: draft.description,
            isActive: draft.isActive,
            module: draft.module || draft.name.split(":")[0] || "general",
            name: draft.name,
          };
    const response = draft.id
      ? await sendJson(
          adminPath(`/rbac/${collection}/${draft.id}`),
          "PATCH",
          body,
        )
      : await sendJson(adminPath(`/rbac/${collection}`), "POST", body);
    return {
      moduleKey: draft.type === "role" ? "roles" : "permissions",
      response,
    };
  },
);

export const updateAdminUser = createAsyncThunk(
  "crmWorkspace/updateAdminUser",
  async (
    draft: Partial<OrganizationUserDraft> & { id: string; status?: string },
  ) => {
    return sendJson(adminPath(`/users/${draft.id}`), "PATCH", draft);
  },
);

export const revokeAdminUserSessions = createAsyncThunk(
  "crmWorkspace/revokeAdminUserSessions",
  async ({ id }: { id: string }) => {
    return sendJson(adminPath(`/users/${id}/revoke-sessions`), "POST", {});
  },
);

export const loadModuleRecords = createAsyncThunk(
  "crmWorkspace/loadModuleRecords",
  async (params: ModuleRecordListParams) => {
    const query = new URLSearchParams({
      limit: String(params.limit ?? 10),
      moduleKey: params.moduleKey,
      page: String(params.page ?? 1),
      organizationId: params.organizationId,
    });
    if (params.priority) query.set("priority", params.priority);
    if (params.search) query.set("search", params.search);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.status) query.set("status", params.status);
    const records = await getJson(
      adminPath(`/module-records?${query.toString()}`),
    );

    return { moduleKey: params.moduleKey, records };
  },
);

export const loadDedicatedCrmRecords = createAsyncThunk(
  "crmWorkspace/loadDedicatedCrmRecords",
  async (params: ModuleRecordListParams) => {
    const { moduleKey, organizationId } = params;
    const route = dedicatedCrmRoutes[moduleKey];
    if (!route) throw new Error("Dedicated CRM route is not configured");
    const query = new URLSearchParams({
      limit: String(params.limit ?? 10),
      page: String(params.page ?? 1),
      organizationId,
    });
    if (params.search) query.set("search", params.search);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.status) query.set("status", params.status);
    if (params.priority) query.set("priority", params.priority);
    if (moduleKey === "emails") query.set("channel", "email");
    if (moduleKey === "sms") query.set("channel", "sms");
    const records = await getJson(`${route}?${query.toString()}`);
    return { moduleKey, records };
  },
);

export const saveModuleRecord = createAsyncThunk(
  "crmWorkspace/saveModuleRecord",
  async (draft: ModuleRecordDraft) => {
    const body = {
      organizationId: draft.organizationId,
      moduleKey: draft.moduleKey,
      title: draft.title,
      description: draft.description,
      status: draft.status,
      priority: draft.priority,
      dueAt: draft.dueAt,
      payload: draft.payload,
    };
    const response = draft.id
      ? await sendJson(adminPath(`/module-records/${draft.id}`), "POST", body)
      : await sendJson(adminPath("/module-records"), "POST", body);

    return { draft, response };
  },
);

export const deleteModuleRecord = createAsyncThunk(
  "crmWorkspace/deleteModuleRecord",
  async ({
    moduleKey,
    recordId,
    organizationId,
  }: {
    moduleKey: string;
    recordId: string;
    organizationId: string;
  }) => {
    const response = await deleteJson(
      adminPath(
        `/module-records/${recordId}?organizationId=${encodeURIComponent(organizationId)}`,
      ),
    );
    return { moduleKey, recordId, response };
  },
);

export const deleteDedicatedCrmRecord = createAsyncThunk(
  "crmWorkspace/deleteDedicatedCrmRecord",
  async ({
    moduleKey,
    recordId,
    organizationId,
  }: {
    moduleKey: string;
    recordId: string;
    organizationId: string;
  }) => {
    const route = dedicatedCrmRoutes[moduleKey];
    if (!route) throw new Error("Dedicated CRM route is not configured");
    const response = await deleteJson(
      `${route}/${recordId}?organizationId=${encodeURIComponent(organizationId)}`,
    );
    return { moduleKey, recordId, response };
  },
);

export const restoreModuleRecord = createAsyncThunk(
  "crmWorkspace/restoreModuleRecord",
  async ({
    moduleKey,
    recordId,
    organizationId,
  }: {
    moduleKey: string;
    recordId: string;
    organizationId: string;
  }) => {
    const response = await sendJson(
      adminPath(
        `/module-records/${recordId}/restore?organizationId=${encodeURIComponent(
          organizationId,
        )}`,
      ),
      "POST",
      {},
    );
    return { moduleKey, recordId, response };
  },
);

export const restoreDedicatedCrmRecord = createAsyncThunk(
  "crmWorkspace/restoreDedicatedCrmRecord",
  async ({
    moduleKey,
    recordId,
    organizationId,
  }: {
    moduleKey: string;
    recordId: string;
    organizationId: string;
  }) => {
    const route = dedicatedCrmRoutes[moduleKey];
    if (!route) throw new Error("Dedicated CRM route is not configured");
    const response = await sendJson(
      `${route}/${recordId}/restore?organizationId=${encodeURIComponent(organizationId)}`,
      "POST",
      {},
    );
    return { moduleKey, recordId, response };
  },
);

export const bulkUpdateModuleRecordStatus = createAsyncThunk(
  "crmWorkspace/bulkUpdateModuleRecordStatus",
  async ({
    moduleKey,
    recordIds,
    status,
    organizationId,
  }: {
    moduleKey: string;
    recordIds: string[];
    status: string;
    organizationId: string;
  }) => {
    const response = await sendJson(
      adminPath("/module-records/operations/bulk-status"),
      "POST",
      {
        recordIds,
        status,
        organizationId,
      },
    );
    return { moduleKey, recordIds, response, status };
  },
);

export const bulkUpdateDedicatedCrmRecordStatus = createAsyncThunk(
  "crmWorkspace/bulkUpdateDedicatedCrmRecordStatus",
  async ({
    moduleKey,
    recordIds,
    status,
    organizationId,
  }: {
    moduleKey: string;
    recordIds: string[];
    status: string;
    organizationId: string;
  }) => {
    const route = dedicatedCrmRoutes[moduleKey];
    if (!route) throw new Error("Dedicated CRM route is not configured");
    const response = await sendJson(`${route}/operations/bulk-status`, "POST", {
      recordIds,
      status,
      organizationId,
    });
    return { moduleKey, recordIds, response, status };
  },
);

export const saveDedicatedCrmRecord = createAsyncThunk(
  "crmWorkspace/saveDedicatedCrmRecord",
  async (draft: ModuleRecordDraft) => {
    const route = dedicatedCrmRoutes[draft.moduleKey];
    if (!route) throw new Error("Dedicated CRM route is not configured");
    const body = toDedicatedCrmPayload(draft);
    const response = draft.id
      ? upsertOnlyDedicatedModules.has(draft.moduleKey)
        ? await sendJson(route, "POST", body)
        : await sendJson(
            draft.moduleKey === "support"
              ? `${route}/${draft.id}/status`
              : `${route}/${draft.id}`,
            dedicatedCrmUpdateMethods[draft.moduleKey] ?? "PUT",
            draft.moduleKey === "support" ? { status: draft.status } : body,
          )
      : await sendJson(route, "POST", body);
    return { draft, response };
  },
);

export const exportLeads = createAsyncThunk(
  "crmWorkspace/exportLeads",
  async ({ organizationId }: { organizationId: string }) => {
    return getJson(
      adminPath(
        `/leads/operations/export?organizationId=${encodeURIComponent(organizationId)}`,
      ),
    );
  },
);

export const exportModuleRecords = createAsyncThunk(
  "crmWorkspace/exportModuleRecords",
  async ({
    moduleKey,
    organizationId,
  }: {
    moduleKey?: string;
    organizationId: string;
  }) => {
    const query = new URLSearchParams({ organizationId });
    if (moduleKey) query.set("moduleKey", moduleKey);
    return getJson(
      adminPath(`/module-records/operations/export?${query.toString()}`),
    );
  },
);

export const findLeadDuplicates = createAsyncThunk(
  "crmWorkspace/findLeadDuplicates",
  async ({
    email,
    phone,
    organizationId,
  }: {
    email?: string;
    phone?: string;
    organizationId: string;
  }) => {
    return sendJson(adminPath("/leads/operations/duplicates"), "POST", {
      email,
      phone,
      organizationId,
    });
  },
);

export const updateLeadTags = createAsyncThunk(
  "crmWorkspace/updateLeadTags",
  async ({
    leadId,
    organizationId,
  }: {
    leadId: string;
    organizationId: string;
  }) => {
    return sendJson(adminPath(`/leads/${leadId}/tags`), "POST", {
      organizationId,
      tags: ["exam-ready", "high-intent", "parent-follow-up"],
    });
  },
);

export const scoreLead = createAsyncThunk(
  "crmWorkspace/scoreLead",
  async ({
    leadId,
    organizationId,
  }: {
    leadId: string;
    organizationId: string;
  }) => {
    return sendJson(adminPath(`/leads/${leadId}/score`), "POST", {
      organizationId,
      signals: {
        engagement: 12,
      },
    });
  },
);

export const addLeadAttachment = createAsyncThunk(
  "crmWorkspace/addLeadAttachment",
  async ({
    leadId,
    organizationId,
  }: {
    leadId: string;
    organizationId: string;
  }) => {
    return sendJson(adminPath(`/leads/${leadId}/attachments`), "POST", {
      organizationId,
      fileName: "counseling-note.txt",
      mimeType: "text/plain",
      type: "document",
      url: "https://cdn.mentora.test/crm/counseling-note.txt",
    });
  },
);

export const importSampleLeads = createAsyncThunk(
  "crmWorkspace/importSampleLeads",
  async ({ organizationId }: { organizationId: string }) => {
    return sendJson(adminPath("/leads/operations/import"), "POST", {
      organizationId,
      rows: [
        {
          organizationId,
          firstName: "Imported",
          lastName: "Student Lead",
          email: `imported.${Date.now()}@mentora.test`,
          phone: `90000${String(Date.now()).slice(-5)}`,
          city: "Delhi",
          state: "Delhi",
          interestedPrograms: ["JEE Foundation"],
          score: 68,
          temperature: "warm",
        },
      ],
    });
  },
);

export const createWorkflowRule = createAsyncThunk(
  "crmWorkspace/createWorkflowRule",
  async ({
    moduleKey,
    organizationId,
  }: {
    moduleKey: string;
    organizationId: string;
  }) => {
    return sendJson(adminPath("/workflows/rules"), "POST", {
      organizationId,
      name: `${moduleKey.replaceAll("_", " ").replaceAll("-", " ")} auto follow-up`,
      moduleKey,
      trigger: "record.created",
      conditions: { priority: ["high", "urgent"] },
      actions: [
        { type: "assign_owner", strategy: "round_robin" },
        { type: "create_task", dueInHours: 24 },
      ],
      status: "active",
      priority: 10,
    });
  },
);

export const executeWorkflow = createAsyncThunk(
  "crmWorkspace/executeWorkflow",
  async ({
    moduleKey,
    organizationId,
  }: {
    moduleKey: string;
    organizationId: string;
  }) => {
    return sendJson(adminPath("/workflows/execute"), "POST", {
      organizationId,
      moduleKey,
      trigger: "record.created",
      input: { source: "admin-crm", preview: true },
    });
  },
);

export const createReportDefinition = createAsyncThunk(
  "crmWorkspace/createReportDefinition",
  async ({
    moduleKey,
    organizationId,
  }: {
    moduleKey: string;
    organizationId: string;
  }) => {
    return sendJson(adminPath("/reports/definitions"), "POST", {
      organizationId,
      name: `${moduleKey.replaceAll("_", " ")} operations report`,
      moduleKey,
      reportType: "table",
      columns: ["title", "status", "priority", "owner", "dueAt"],
      filters: { status: ["open", "in_progress"] },
      status: "active",
    });
  },
);

export const createSampleDocument = createAsyncThunk(
  "crmWorkspace/createSampleDocument",
  async ({
    entityId,
    organizationId,
  }: {
    entityId: string;
    organizationId: string;
  }) => {
    return sendJson(adminPath("/documents"), "POST", {
      organizationId,
      category: "academic",
      entityId,
      entityType: "application",
      mimeType: "application/pdf",
      name: "Class 12 marksheet",
      url: "https://cdn.mentora.test/documents/class-12-marksheet.pdf",
    });
  },
);

export const loadDocuments = createAsyncThunk(
  "crmWorkspace/loadDocuments",
  async ({ organizationId }: { organizationId: string }) => {
    return getJson(
      adminPath(
        `/documents?organizationId=${encodeURIComponent(organizationId)}`,
      ),
    );
  },
);

export const updateCampaignMetrics = createAsyncThunk(
  "crmWorkspace/updateCampaignMetrics",
  async ({
    campaignId,
    organizationId,
  }: {
    campaignId: string;
    organizationId: string;
  }) => {
    return sendJson(adminPath(`/campaigns/${campaignId}/metrics`), "POST", {
      organizationId,
      metrics: { clicks: 420, conversions: 37, leads: 96 },
      roi: { adSpend: 18000, revenueAttributed: 126000, roas: 7 },
      status: "running",
    });
  },
);

export const runCrmRecordAction = createAsyncThunk(
  "crmWorkspace/runCrmRecordAction",
  async ({ body, path }: { body: Record<string, unknown>; path: string }) => {
    return sendJson(adminPath(path), "POST", body);
  },
);

export const createBranch = createAsyncThunk(
  "crmWorkspace/createBranch",
  async (draft: OrganizationSetupDraft) => {
    return sendJson(adminPath("/branches"), "POST", {
      organizationId: draft.organizationId,
      city: draft.city || undefined,
      code: draft.code,
      name: draft.name,
      state: draft.state || undefined,
    });
  },
);

export const createDepartment = createAsyncThunk(
  "crmWorkspace/createDepartment",
  async (draft: OrganizationSetupDraft) => {
    return sendJson(adminPath("/departments"), "POST", {
      organizationId: draft.organizationId,
      branchId: draft.branchId || undefined,
      code: draft.code,
      function: draft.function || undefined,
      name: draft.name,
    });
  },
);

export const createTeam = createAsyncThunk(
  "crmWorkspace/createTeam",
  async (draft: OrganizationSetupDraft) => {
    return sendJson(adminPath("/teams"), "POST", {
      organizationId: draft.organizationId,
      code: draft.code,
      departmentId: draft.departmentId || undefined,
      name: draft.name,
    });
  },
);

export const updateOrganizationBranding = createAsyncThunk(
  "crmWorkspace/updateOrganizationBranding",
  async (draft: OrganizationSetupDraft) => {
    return sendJson(adminPath("/organization-branding"), "POST", {
      organizationId: draft.organizationId,
      domains: draft.domains
        ?.split(",")
        .map((domain) => domain.trim())
        .filter(Boolean),
      logoUrl: draft.logoUrl || undefined,
      primaryColor: draft.primaryColor || undefined,
      secondaryColor: draft.secondaryColor || undefined,
      senderName: draft.senderName || undefined,
    });
  },
);

export const updateChannelSetting = createAsyncThunk(
  "crmWorkspace/updateChannelSetting",
  async (draft: OrganizationSetupDraft) => {
    return sendJson(adminPath("/channel-settings"), "POST", {
      organizationId: draft.organizationId,
      channel: draft.channel,
      limits: draft.limits,
      provider: draft.providerKey
        ? {
            providerKey: draft.providerKey,
          }
        : undefined,
      status: draft.status || "sandbox",
    });
  },
);

export const loadOrganizationUsers = createAsyncThunk(
  "crmWorkspace/loadOrganizationUsers",
  async (params: {
    branchId?: string;
    limit?: number;
    organizationId?: string;
    page?: number;
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    status?: string;
  }) => {
    const query = new URLSearchParams({
      limit: String(params.limit ?? 10),
      page: String(params.page ?? 1),
    });
    if (params.organizationId)
      query.set("organizationId", params.organizationId);
    if (params.branchId) query.set("branchId", params.branchId);
    if (params.role) query.set("role", params.role);
    if (params.search) query.set("search", params.search);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.status) query.set("status", params.status);
    return getJson(adminPath(`/users?${query.toString()}`));
  },
);

export const loadAuthOverview = createAsyncThunk(
  "crmWorkspace/loadAuthOverview",
  async ({ organizationId }: { organizationId?: string }) => {
    const query = new URLSearchParams();
    if (organizationId) query.set("organizationId", organizationId);
    return getJson(
      adminPath(`/auth/overview${query.size ? `?${query.toString()}` : ""}`),
    );
  },
);

export const loadIntegrationProviders = createAsyncThunk(
  "crmWorkspace/loadIntegrationProviders",
  async ({ organizationId }: { organizationId: string }) => {
    return getJson(
      adminPath(
        `/integrations/providers?organizationId=${encodeURIComponent(organizationId)}`,
      ),
    );
  },
);

export const upsertIntegrationProvider = createAsyncThunk(
  "crmWorkspace/upsertIntegrationProvider",
  async ({
    providerKey,
    organizationId,
  }: {
    providerKey: string;
    organizationId: string;
  }) => {
    return sendJson(
      adminPath(`/integrations/providers/${providerKey}`),
      "PUT",
      {
        organizationId,
        status: "configured",
        health: {
          checkedBy: "admin-crm",
          dryRun: true,
        },
        settings: {
          environment: "sandbox",
          owner: "operations",
        },
      },
    );
  },
);

export const testIntegrationProvider = createAsyncThunk(
  "crmWorkspace/testIntegrationProvider",
  async ({
    providerKey,
    organizationId,
  }: {
    providerKey: string;
    organizationId: string;
  }) => {
    return getJson(
      adminPath(
        `/integrations/providers/${providerKey}/test?organizationId=${encodeURIComponent(
          organizationId,
        )}`,
      ),
    );
  },
);

export const loadSecurityPolicy = createAsyncThunk(
  "crmWorkspace/loadSecurityPolicy",
  async ({ organizationId }: { organizationId: string }) => {
    return getJson(
      adminPath(
        `/security-policies?organizationId=${encodeURIComponent(organizationId)}`,
      ),
    );
  },
);

export const updateSecurityPolicy = createAsyncThunk(
  "crmWorkspace/updateSecurityPolicy",
  async ({ organizationId }: { organizationId: string }) => {
    return sendJson(adminPath("/security-policies"), "PUT", {
      organizationId,
      allowedIpCidrs: [],
      dataRetentionPolicy: {
        auditDays: 365,
        communicationDays: 730,
      },
      maskedFields: ["email", "phone", "dateOfBirth"],
      mfaRequired: true,
      sessionPolicy: {
        maxAgeHours: 12,
        maxConcurrentSessions: 2,
      },
      ssoRequired: false,
    });
  },
);

const initialSessionState: CrmSessionState = {
  activeContext: null,
  activeId: "dashboard",
  accessToken: "",
  loginEmail: "",
  loginError: null,
  loginPassword: "",
  loggedInUser: null,
  preferences: defaultCrmProfilePreferences,
  themeMode: "system",
  toast: "Ready",
};

const initialWorkspaceState: CrmWorkspaceState = {
  activeBranchId: "",
  activeOrganizationId: "",
  branches: [],
  contexts: [],
  coverage: [],
  dashboard: null,
  departments: [],
  error: null,
  integrationProviders: [],
  loading: false,
  moduleRecords: {},
  authOverview: null,
  securityPolicy: null,
  teams: [],
  organizations: [],
};

function persistCurrentSession(state: CrmSessionState) {
  if (!state.accessToken || !state.loggedInUser) {
    clearPersistedCrmSession();
    return;
  }

  writePersistedCrmSession({
    accessToken: state.accessToken,
    activeContext: state.activeContext,
    activeId: state.activeId,
    loggedInUser: state.loggedInUser,
    preferences: state.preferences,
    themeMode: state.themeMode,
  });
}

const crmSessionSlice = createSlice({
  name: "crmSession",
  initialState: initialSessionState,
  reducers: {
    chooseContext(state, action: PayloadAction<DemoContext>) {
      state.activeContext = action.payload;
      state.activeId = action.payload.modules.includes("dashboard")
        ? "dashboard"
        : action.payload.modules[0];
      state.toast = `Context selected: ${action.payload.label}`;
      persistCurrentSession(state);
    },
    clearContext(state) {
      state.activeContext = state.loggedInUser?.contexts[0] ?? null;
      state.activeId = "dashboard";
      state.toast = state.activeContext
        ? `Context selected: ${state.activeContext.label}`
        : "No CRM context available";
      persistCurrentSession(state);
    },
    switchToNextContext(state) {
      const contexts = state.loggedInUser?.contexts ?? [];
      if (contexts.length === 0) {
        state.activeContext = null;
        state.toast = "No CRM context available";
        return;
      }

      const currentIndex = contexts.findIndex(
        (context) =>
          context.role === state.activeContext?.role &&
          context.organization === state.activeContext?.organization &&
          context.branch === state.activeContext?.branch,
      );
      const nextContext = contexts[(currentIndex + 1) % contexts.length];
      state.activeContext = nextContext;
      state.activeId = nextContext.modules.includes(state.activeId)
        ? state.activeId
        : "dashboard";
      state.toast = `Context selected: ${nextContext.label}`;
      persistCurrentSession(state);
    },
    login(state, action: PayloadAction<DemoUser>) {
      state.loggedInUser = action.payload;
      state.activeContext = action.payload.contexts[0] ?? null;
      state.toast = `Logged in as ${action.payload.name}`;
      persistCurrentSession(state);
    },
    applyBackendContexts(state, action: PayloadAction<DemoContext[]>) {
      if (!state.loggedInUser || action.payload.length === 0) return;
      const contexts = action.payload;
      state.loggedInUser = {
        ...state.loggedInUser,
        contexts,
      };
      const currentContextStillAllowed = contexts.some(
        (context) =>
          context.role === state.activeContext?.role &&
          context.organizationId === state.activeContext?.organizationId &&
          context.branchIds?.join("|") ===
            state.activeContext?.branchIds?.join("|"),
      );
      if (!currentContextStillAllowed) {
        state.activeContext =
          contexts.find(
            (context) =>
              context.role === "super_admin" && !context.organizationId,
          ) ??
          contexts.find(
            (context) =>
              context.organizationId ===
              state.preferences.defaultOrganizationId,
          ) ??
          contexts[0] ??
          null;
      }
      state.activeId = state.activeContext?.modules.includes(state.activeId)
        ? state.activeId
        : state.preferences.defaultLandingPage || "dashboard";
      persistCurrentSession(state);
    },
    logout(state) {
      state.activeContext = null;
      state.activeId = "dashboard";
      state.accessToken = "";
      state.loggedInUser = null;
      state.toast = "Logged out";
      setCrmAccessToken("");
      clearPersistedCrmSession();
    },
    openModule(state, action: PayloadAction<{ id: string; title: string }>) {
      state.activeId = action.payload.id;
      state.toast = `Opened ${action.payload.title}`;
      persistCurrentSession(state);
    },
    setLoginEmail(state, action: PayloadAction<string>) {
      state.loginEmail = action.payload;
    },
    setLoginPassword(state, action: PayloadAction<string>) {
      state.loginPassword = action.payload;
    },
    setThemeMode(state, action: PayloadAction<CrmSessionState["themeMode"]>) {
      state.themeMode = action.payload;
      persistCurrentSession(state);
    },
    setPreferences(state, action: PayloadAction<CrmProfilePreferences>) {
      state.preferences = {
        ...defaultCrmProfilePreferences,
        ...action.payload,
      };
      if (!state.preferences.defaultLandingPage) {
        state.preferences.defaultLandingPage = "dashboard";
      }
      persistCurrentSession(state);
    },
    setToast(state, action: PayloadAction<string>) {
      state.toast = action.payload;
    },
    restorePersistedSession(
      state,
      action: PayloadAction<Partial<PersistedCrmSession>>,
    ) {
      const session = action.payload;
      if (!session.accessToken || !session.loggedInUser) {
        return;
      }

      state.activeContext = session.activeContext ?? null;
      state.activeId = session.activeId ?? "dashboard";
      state.accessToken = session.accessToken;
      state.loggedInUser = session.loggedInUser;
      state.preferences = {
        ...defaultCrmProfilePreferences,
        ...(session.preferences ?? {}),
      };
      state.themeMode = session.themeMode ?? "system";
      state.toast = "Session restored";
      setCrmAccessToken(session.accessToken);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithCredentials.pending, (state) => {
        state.loginError = null;
        state.toast = "Signing in";
      })
      .addCase(loginWithCredentials.fulfilled, (state, action) => {
        state.activeContext = action.payload.contexts[0] ?? null;
        state.activeId = state.preferences.defaultLandingPage || "dashboard";
        state.accessToken = action.payload.accessToken;
        state.loggedInUser = action.payload;
        state.loginPassword = "";
        state.loginError = null;
        state.toast = `Logged in as ${action.payload.email}`;
        setCrmAccessToken(action.payload.accessToken);
        persistCurrentSession(state);
      })
      .addCase(loginWithCredentials.rejected, (state, action) => {
        state.loginError =
          action.error.message ??
          "Login failed. Use seeded credentials or create a CRM user.";
        state.toast = state.loginError;
      })
      .addCase(changeCrmPassword.fulfilled, (state) => {
        state.toast = "Password changed";
      })
      .addCase(changeCrmPassword.rejected, (state, action) => {
        state.toast = action.error.message ?? "Password change failed";
      })
      .addMatcher(isRejected, (state, action) => {
        if (
          action.type !== loginWithCredentials.rejected.type &&
          isUnauthorizedError(action.error.message)
        ) {
          clearExpiredSession(state);
        }
      });
  },
});

const crmWorkspaceSlice = createSlice({
  name: "crmWorkspace",
  initialState: initialWorkspaceState,
  reducers: {
    restorePersistedContext(state) {
      const context = readPersistedWorkspaceContext();
      if (typeof context.activeOrganizationId === "string") {
        state.activeOrganizationId = context.activeOrganizationId;
      }
      if (typeof context.activeBranchId === "string") {
        state.activeBranchId = context.activeBranchId;
      }
    },
    setActiveBranchId(state, action: PayloadAction<string>) {
      state.activeBranchId = action.payload;
      writePersistedWorkspaceContext({
        activeBranchId: state.activeBranchId,
        activeOrganizationId: state.activeOrganizationId,
      });
    },
    setActiveOrganizationId(state, action: PayloadAction<string>) {
      state.activeOrganizationId = action.payload;
      state.activeBranchId = "";
      state.branches = [];
      writePersistedWorkspaceContext({
        activeBranchId: state.activeBranchId,
        activeOrganizationId: state.activeOrganizationId,
      });
    },
    upsertLocalModuleRecord(state, action: PayloadAction<ModuleRecordDraft>) {
      const draft = action.payload;
      const records = state.moduleRecords[draft.moduleKey] ?? [];
      const record = toModuleRecordLike(draft);
      const index = records.findIndex(
        (item) =>
          getRecordId(item) === draft.id ||
          getRecordTitle(item) === draft.title,
      );

      if (index >= 0) {
        records[index] = { ...(records[index] as object), ...record };
      } else {
        records.unshift(record);
      }

      state.moduleRecords[draft.moduleKey] = records;
      state.error = "API save failed. Local unsynced CRM state was updated.";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCrmWorkspace.pending, (state) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(loadCrmWorkspace.fulfilled, (state, action) => {
        const data = normalizeApiObject(action.payload) as {
          activeOrganizationId?: unknown;
          contexts?: unknown;
          dashboard?: unknown;
          moduleCoverage?: unknown;
          organizations?: unknown;
        };
        const organizations = normalizeApiData(data.organizations);
        state.activeOrganizationId =
          typeof data.activeOrganizationId === "string"
            ? data.activeOrganizationId
            : state.activeOrganizationId;
        state.activeBranchId = "";
        state.branches = [];
        state.departments = [];
        state.teams = [];
        state.contexts = normalizeApiData(data.contexts);
        state.coverage = normalizeApiData(data.moduleCoverage);
        state.dashboard = data.dashboard ?? null;
        state.organizations = organizations;
        state.loading = false;
      })
      .addCase(loadOrganizations.fulfilled, (state, action) => {
        const organizations = normalizeApiData(action.payload);
        state.organizations = organizations;
        state.error = null;
      })
      .addCase(loadCrmWorkspace.rejected, (state, action) => {
        state.error =
          action.error.message ?? "Unable to load CRM workspace data";
        state.loading = false;
      })
      .addCase(loadBranches.fulfilled, (state, action) => {
        state.branches = normalizeApiData(action.payload);
        state.error = null;
      })
      .addCase(loadIdentityHierarchy.fulfilled, (state, action) => {
        const data = normalizeApiObject(action.payload) as {
          branches?: unknown;
          departments?: unknown;
          teams?: unknown;
          users?: unknown;
        };
        state.branches = normalizeApiData(data.branches);
        state.departments = normalizeApiData(data.departments);
        state.teams = normalizeApiData(data.teams);
        state.moduleRecords.users = normalizeApiData(data.users);
        state.error = null;
      })
      .addCase(loadModuleRecords.fulfilled, (state, action) => {
        state.moduleRecords[action.payload.moduleKey] = normalizeApiData(
          action.payload.records,
        );
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        const created = normalizeApiObject(action.payload) as {
          branch?: unknown;
          organization?: unknown;
        };
        const organization = created.organization ?? created;
        const branch = created.branch;
        const organizationId = getRecordId(organization);
        const index = state.organizations.findIndex(
          (item) => getRecordId(item) === organizationId,
        );
        if (index >= 0) {
          state.organizations[index] = organization;
        } else {
          state.organizations.unshift(organization);
        }
        if (organizationId) state.activeOrganizationId = organizationId;
        if (branch) {
          state.branches = [branch];
          state.activeBranchId = getRecordId(branch);
        }
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        const organization = normalizeApiObject(action.payload);
        const organizationId = getRecordId(organization);
        const index = state.organizations.findIndex(
          (item) => getRecordId(item) === organizationId,
        );
        if (index >= 0) {
          state.organizations[index] = organization;
        }
        state.error = null;
      })
      .addCase(createOrganizationUser.fulfilled, (state, action) => {
        const data = normalizeApiObject(action.payload) as {
          user?: unknown;
          membership?: unknown;
        };
        const membership = data.user ?? data.membership ?? data;
        const records = state.moduleRecords.users ?? [];
        records.unshift(membership);
        state.moduleRecords.users = records;
        state.error = null;
      })
      .addCase(loadDedicatedCrmRecords.fulfilled, (state, action) => {
        state.moduleRecords[action.payload.moduleKey] = normalizeApiData(
          action.payload.records,
        );
      })
      .addCase(saveModuleRecord.fulfilled, (state, action) => {
        const record = normalizeApiObject(action.payload.response);
        const moduleKey = action.payload.draft.moduleKey;
        const records = state.moduleRecords[moduleKey] ?? [];
        const recordId = getRecordId(record);
        const index = records.findIndex(
          (item) => getRecordId(item) === recordId,
        );

        if (index >= 0) {
          records[index] = record;
        } else {
          records.unshift(record);
        }

        state.moduleRecords[moduleKey] = records;
      })
      .addCase(deleteModuleRecord.fulfilled, (state, action) => {
        const records = state.moduleRecords[action.payload.moduleKey] ?? [];
        state.moduleRecords[action.payload.moduleKey] = records.filter(
          (item) => getRecordId(item) !== action.payload.recordId,
        );
        state.error = null;
      })
      .addCase(deleteDedicatedCrmRecord.fulfilled, (state, action) => {
        const records = state.moduleRecords[action.payload.moduleKey] ?? [];
        state.moduleRecords[action.payload.moduleKey] = records.filter(
          (item) => getRecordId(item) !== action.payload.recordId,
        );
        state.error = null;
      })
      .addCase(restoreModuleRecord.fulfilled, (state, action) => {
        const record = normalizeApiObject(action.payload.response);
        const moduleKey = action.payload.moduleKey;
        const records = state.moduleRecords[moduleKey] ?? [];
        const index = records.findIndex(
          (item) => getRecordId(item) === action.payload.recordId,
        );
        if (index >= 0) {
          records[index] = record;
        } else {
          records.unshift(record);
        }
        state.moduleRecords[moduleKey] = records;
        state.error = null;
      })
      .addCase(restoreDedicatedCrmRecord.fulfilled, (state, action) => {
        const record = normalizeApiObject(action.payload.response);
        const moduleKey = action.payload.moduleKey;
        const records = state.moduleRecords[moduleKey] ?? [];
        const index = records.findIndex(
          (item) => getRecordId(item) === action.payload.recordId,
        );
        if (index >= 0) {
          records[index] = record;
        } else {
          records.unshift(record);
        }
        state.moduleRecords[moduleKey] = records;
        state.error = null;
      })
      .addCase(bulkUpdateModuleRecordStatus.fulfilled, (state, action) => {
        const records = state.moduleRecords[action.payload.moduleKey] ?? [];
        const recordIds = new Set(action.payload.recordIds);
        state.moduleRecords[action.payload.moduleKey] = records.map((record) =>
          recordIds.has(getRecordId(record))
            ? {
                ...(record as Record<string, unknown>),
                status: action.payload.status,
              }
            : record,
        );
        state.error = null;
      })
      .addCase(
        bulkUpdateDedicatedCrmRecordStatus.fulfilled,
        (state, action) => {
          const records = state.moduleRecords[action.payload.moduleKey] ?? [];
          const recordIds = new Set(action.payload.recordIds);
          state.moduleRecords[action.payload.moduleKey] = records.map(
            (record) =>
              recordIds.has(getRecordId(record))
                ? {
                    ...(record as Record<string, unknown>),
                    status: action.payload.status,
                  }
                : record,
          );
          state.error = null;
        },
      )
      .addCase(saveDedicatedCrmRecord.fulfilled, (state, action) => {
        const record = normalizeApiObject(action.payload.response);
        const moduleKey = action.payload.draft.moduleKey;
        const records = state.moduleRecords[moduleKey] ?? [];
        const recordId = getRecordId(record);
        const index = records.findIndex(
          (item) => getRecordId(item) === recordId,
        );

        if (index >= 0) {
          records[index] = record;
        } else {
          records.unshift(record);
        }

        state.moduleRecords[moduleKey] = records;
      })
      .addCase(importSampleLeads.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(exportLeads.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(exportModuleRecords.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(findLeadDuplicates.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(updateLeadTags.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(scoreLead.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(addLeadAttachment.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(createWorkflowRule.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(executeWorkflow.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(createReportDefinition.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(createSampleDocument.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(loadDocuments.fulfilled, (state, action) => {
        state.moduleRecords.documents = normalizeApiData(action.payload);
        state.error = null;
      })
      .addCase(updateCampaignMetrics.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(runCrmRecordAction.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(updateOrganizationBranding.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(updateChannelSetting.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(loadOrganizationUsers.fulfilled, (state, action) => {
        state.moduleRecords.users = normalizeApiData(action.payload);
        state.error = null;
      })
      .addCase(loadOrganizationUsers.rejected, (state, action) => {
        state.moduleRecords.users = [];
        state.error =
          action.error.message ??
          "Unable to load users. Check CRM permissions and API status.";
      })
      .addCase(loadRbacRecords.fulfilled, (state, action) => {
        state.moduleRecords[action.payload.moduleKey] = normalizeApiData(
          action.payload.records,
        );
        state.error = null;
      })
      .addCase(saveRbacRecord.fulfilled, (state, action) => {
        const record = normalizeApiObject(action.payload.response);
        const id = getRecordId(record);
        const records = state.moduleRecords[action.payload.moduleKey] ?? [];
        const index = records.findIndex((item) => getRecordId(item) === id);
        if (index >= 0) {
          records[index] = record;
        } else {
          records.unshift(record);
        }
        state.moduleRecords[action.payload.moduleKey] = records;
        state.error = null;
      })
      .addCase(updateAdminUser.fulfilled, (state, action) => {
        const user = normalizeApiObject(action.payload);
        const id = getRecordId(user);
        state.moduleRecords.users = (state.moduleRecords.users ?? []).map(
          (record) => (getRecordId(record) === id ? user : record),
        );
        state.error = null;
      })
      .addCase(revokeAdminUserSessions.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(loadAuthOverview.fulfilled, (state, action) => {
        const overview = normalizeApiObject(action.payload) as {
          controls?: unknown;
        };
        state.authOverview = overview;
        state.moduleRecords.authentication = normalizeApiData(
          overview.controls,
        );
        state.error = null;
      })
      .addCase(loadIntegrationProviders.fulfilled, (state, action) => {
        state.integrationProviders = normalizeApiData(action.payload);
        state.error = null;
      })
      .addCase(upsertIntegrationProvider.fulfilled, (state, action) => {
        const provider = normalizeApiObject(action.payload);
        const providerKey = getRecordProviderKey(provider);
        const index = state.integrationProviders.findIndex(
          (item) => getRecordProviderKey(item) === providerKey,
        );

        if (index >= 0) {
          state.integrationProviders[index] = provider;
        } else {
          state.integrationProviders.unshift(provider);
        }

        state.error = null;
      })
      .addCase(testIntegrationProvider.fulfilled, (state, action) => {
        const provider = normalizeApiObject(action.payload);
        const providerKey = getRecordProviderKey(provider);
        const index = state.integrationProviders.findIndex(
          (item) => getRecordProviderKey(item) === providerKey,
        );

        if (index >= 0) {
          state.integrationProviders[index] = {
            ...(state.integrationProviders[index] as Record<string, unknown>),
            health: provider,
          };
        }

        state.error = null;
      })
      .addCase(loadSecurityPolicy.fulfilled, (state, action) => {
        state.securityPolicy = normalizeApiObject(action.payload);
        state.error = null;
      })
      .addCase(updateSecurityPolicy.fulfilled, (state, action) => {
        state.securityPolicy = normalizeApiObject(action.payload);
        state.error = null;
      })
      .addMatcher(isRejected, (state, action) => {
        if (isUnauthorizedError(action.error.message)) {
          state.activeOrganizationId = "";
          state.contexts = [];
          state.coverage = [];
          state.dashboard = null;
          state.error = "Your session expired. Please sign in again.";
          state.integrationProviders = [];
          state.loading = false;
          state.moduleRecords = {};
          state.securityPolicy = null;
          state.organizations = [];
        }
      });
  },
});

function normalizeApiData(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: unknown[] }).data;
  }
  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    (value as { data?: unknown }).data &&
    typeof (value as { data?: unknown }).data === "object" &&
    "items" in (value as { data: Record<string, unknown> }).data &&
    Array.isArray(
      ((value as { data: Record<string, unknown> }).data as { items?: unknown })
        .items,
    )
  ) {
    return (value as { data: { items: unknown[] } }).data.items;
  }
  if (
    value &&
    typeof value === "object" &&
    "items" in value &&
    Array.isArray((value as { items?: unknown }).items)
  ) {
    return (value as { items: unknown[] }).items;
  }
  return [];
}

function normalizeApiObject(value: unknown): unknown {
  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    (value as { data?: unknown }).data
  ) {
    return (value as { data: unknown }).data;
  }
  return value;
}

function toModuleRecordLike(draft: ModuleRecordDraft) {
  return {
    _id: draft.id ?? `local-${draft.moduleKey}-${Date.now()}`,
    description: draft.description,
    dueAt: draft.dueAt,
    moduleKey: draft.moduleKey,
    payload: draft.payload,
    priority: draft.priority,
    status: draft.status,
    organizationId: draft.organizationId,
    title: draft.title,
    updatedAt: new Date().toISOString(),
  };
}

function getRecordId(record: unknown) {
  if (!record || typeof record !== "object") return "";
  const value =
    (record as { _id?: unknown; id?: unknown })._id ??
    (record as { id?: unknown }).id;
  return typeof value === "string" ? value : "";
}

function getRecordTitle(record: unknown) {
  if (!record || typeof record !== "object") return "";
  const value = (record as { title?: unknown }).title;
  return typeof value === "string" ? value : "";
}

function getRecordProviderKey(record: unknown) {
  if (!record || typeof record !== "object") return "";
  const value = (record as { providerKey?: unknown; key?: unknown })
    .providerKey;
  if (typeof value === "string") return value;
  const fallback = (record as { key?: unknown }).key;
  return typeof fallback === "string" ? fallback : "";
}

export const crmSessionActions = crmSessionSlice.actions;
export const crmWorkspaceActions = crmWorkspaceSlice.actions;

export const store = configureStore({
  reducer: {
    crmSession: crmSessionSlice.reducer,
    crmWorkspace: crmWorkspaceSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
