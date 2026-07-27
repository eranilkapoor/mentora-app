"use client";

import {
  configureStore,
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

export type DemoContext = {
  tenant: string;
  branch: string;
  role: string;
  label: string;
  modules: string[];
};

export type DemoUser = {
  email: string;
  name: string;
  contexts: DemoContext[];
};

type CrmSessionState = {
  activeContext: DemoContext | null;
  activeId: string;
  loginEmail: string;
  loggedInUser: DemoUser | null;
  themeMode: "system" | "light" | "dark";
  toast: string;
};

type CrmWorkspaceState = {
  activeTenantId: string;
  contexts: unknown[];
  coverage: unknown[];
  dashboard: unknown | null;
  error: string | null;
  integrationProviders: unknown[];
  loading: boolean;
  moduleRecords: Record<string, unknown[]>;
  securityPolicy: unknown | null;
  tenants: unknown[];
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

export type ModuleRecordDraft = {
  id?: string;
  tenantId?: string;
  moduleKey: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueAt?: string;
  payload: Record<string, string>;
};

const dedicatedCrmRoutes: Record<string, string> = {
  admissions: "/admissions",
  call_center: "/call-center",
  event_management: "/events",
  field_force_automation: "/field-force",
  finance: "/finance-ledgers",
  interview: "/interviews",
  scholarship: "/scholarships",
  whatsapp_crm: "/whatsapp",
};

async function getJson(path: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

async function sendJson(path: string, method: "POST" | "PUT", body: unknown) {
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    body: JSON.stringify(body),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    method,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export const loadCrmWorkspace = createAsyncThunk(
  "crmWorkspace/load",
  async () => {
    return getJson("/dashboard/bootstrap");
  },
);

export const loadModuleRecords = createAsyncThunk(
  "crmWorkspace/loadModuleRecords",
  async ({ moduleKey, tenantId }: { moduleKey: string; tenantId: string }) => {
    const records = await getJson(
      `/module-records?tenantId=${encodeURIComponent(tenantId)}&moduleKey=${encodeURIComponent(moduleKey)}`,
    );

    return { moduleKey, records };
  },
);

export const loadDedicatedCrmRecords = createAsyncThunk(
  "crmWorkspace/loadDedicatedCrmRecords",
  async ({ moduleKey, tenantId }: { moduleKey: string; tenantId: string }) => {
    const route = dedicatedCrmRoutes[moduleKey];
    if (!route) throw new Error("Dedicated CRM route is not configured");
    const records = await getJson(
      `${route}?tenantId=${encodeURIComponent(tenantId)}`,
    );
    return { moduleKey, records };
  },
);

export const saveModuleRecord = createAsyncThunk(
  "crmWorkspace/saveModuleRecord",
  async (draft: ModuleRecordDraft) => {
    const body = {
      tenantId: draft.tenantId,
      moduleKey: draft.moduleKey,
      title: draft.title,
      description: draft.description,
      status: draft.status,
      priority: draft.priority,
      dueAt: draft.dueAt,
      payload: draft.payload,
    };
    const response = draft.id
      ? await sendJson(`/module-records/${draft.id}`, "POST", body)
      : await sendJson("/module-records", "POST", body);

    return { draft, response };
  },
);

export const saveDedicatedCrmRecord = createAsyncThunk(
  "crmWorkspace/saveDedicatedCrmRecord",
  async (draft: ModuleRecordDraft) => {
    const route = dedicatedCrmRoutes[draft.moduleKey];
    if (!route) throw new Error("Dedicated CRM route is not configured");
    const body = {
      tenantId: draft.tenantId,
      title: draft.title,
      description: draft.description,
      status: draft.status,
      priority: draft.priority,
      dueAt: draft.dueAt,
      payload: draft.payload,
    };
    const response = draft.id
      ? await sendJson(`${route}/${draft.id}`, "POST", body)
      : await sendJson(route, "POST", body);
    return { draft, response };
  },
);

export const exportLeads = createAsyncThunk(
  "crmWorkspace/exportLeads",
  async ({ tenantId }: { tenantId: string }) => {
    return getJson(
      `/leads/operations/export?tenantId=${encodeURIComponent(tenantId)}`,
    );
  },
);

export const exportModuleRecords = createAsyncThunk(
  "crmWorkspace/exportModuleRecords",
  async ({ moduleKey, tenantId }: { moduleKey?: string; tenantId: string }) => {
    const query = new URLSearchParams({ tenantId });
    if (moduleKey) query.set("moduleKey", moduleKey);
    return getJson(`/module-records/operations/export?${query.toString()}`);
  },
);

export const findLeadDuplicates = createAsyncThunk(
  "crmWorkspace/findLeadDuplicates",
  async ({
    email,
    phone,
    tenantId,
  }: {
    email?: string;
    phone?: string;
    tenantId: string;
  }) => {
    return sendJson("/leads/operations/duplicates", "POST", {
      email,
      phone,
      tenantId,
    });
  },
);

export const updateLeadTags = createAsyncThunk(
  "crmWorkspace/updateLeadTags",
  async ({ leadId, tenantId }: { leadId: string; tenantId: string }) => {
    return sendJson(`/leads/${leadId}/tags`, "POST", {
      tenantId,
      tags: ["exam-ready", "high-intent", "parent-follow-up"],
    });
  },
);

export const scoreLead = createAsyncThunk(
  "crmWorkspace/scoreLead",
  async ({ leadId, tenantId }: { leadId: string; tenantId: string }) => {
    return sendJson(`/leads/${leadId}/score`, "POST", {
      tenantId,
      signals: {
        engagement: 12,
      },
    });
  },
);

export const addLeadAttachment = createAsyncThunk(
  "crmWorkspace/addLeadAttachment",
  async ({ leadId, tenantId }: { leadId: string; tenantId: string }) => {
    return sendJson(`/leads/${leadId}/attachments`, "POST", {
      tenantId,
      fileName: "counseling-note.txt",
      mimeType: "text/plain",
      type: "document",
      url: "https://cdn.mentora.test/crm/counseling-note.txt",
    });
  },
);

export const importSampleLeads = createAsyncThunk(
  "crmWorkspace/importSampleLeads",
  async ({ tenantId }: { tenantId: string }) => {
    return sendJson("/leads/operations/import", "POST", {
      tenantId,
      rows: [
        {
          tenantId,
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
  async ({ moduleKey, tenantId }: { moduleKey: string; tenantId: string }) => {
    return sendJson("/workflows/rules", "POST", {
      tenantId,
      name: `${moduleKey.replaceAll("_", " ")} auto follow-up`,
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
  async ({ moduleKey, tenantId }: { moduleKey: string; tenantId: string }) => {
    return sendJson("/workflows/execute", "POST", {
      tenantId,
      moduleKey,
      trigger: "record.created",
      input: { source: "admin-crm", preview: true },
    });
  },
);

export const createReportDefinition = createAsyncThunk(
  "crmWorkspace/createReportDefinition",
  async ({ moduleKey, tenantId }: { moduleKey: string; tenantId: string }) => {
    return sendJson("/reports/definitions", "POST", {
      tenantId,
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
  async ({ entityId, tenantId }: { entityId: string; tenantId: string }) => {
    return sendJson("/documents", "POST", {
      tenantId,
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
  async ({ tenantId }: { tenantId: string }) => {
    return getJson(`/documents?tenantId=${encodeURIComponent(tenantId)}`);
  },
);

export const updateCampaignMetrics = createAsyncThunk(
  "crmWorkspace/updateCampaignMetrics",
  async ({
    campaignId,
    tenantId,
  }: {
    campaignId: string;
    tenantId: string;
  }) => {
    return sendJson(`/campaigns/${campaignId}/metrics`, "POST", {
      tenantId,
      metrics: { clicks: 420, conversions: 37, leads: 96 },
      roi: { adSpend: 18000, revenueAttributed: 126000, roas: 7 },
      status: "running",
    });
  },
);

export const runCrmRecordAction = createAsyncThunk(
  "crmWorkspace/runCrmRecordAction",
  async ({ body, path }: { body: Record<string, unknown>; path: string }) => {
    return sendJson(path, "POST", body);
  },
);

export const createSampleDepartment = createAsyncThunk(
  "crmWorkspace/createSampleDepartment",
  async ({ tenantId }: { tenantId: string }) => {
    return sendJson("/departments", "POST", {
      tenantId,
      code: "ADM",
      function: "admissions",
      name: "Admissions",
    });
  },
);

export const createSampleTeam = createAsyncThunk(
  "crmWorkspace/createSampleTeam",
  async ({ tenantId }: { tenantId: string }) => {
    return sendJson("/teams", "POST", {
      tenantId,
      capacityRules: {
        maxOpenLeadsPerCounselor: 80,
        roundRobin: true,
      },
      code: "COUNSELING",
      name: "Counseling Team",
    });
  },
);

export const updateSampleBranding = createAsyncThunk(
  "crmWorkspace/updateSampleBranding",
  async ({ tenantId }: { tenantId: string }) => {
    return sendJson("/tenant-branding", "POST", {
      tenantId,
      domains: ["mentora.test"],
      primaryColor: "#2563eb",
      secondaryColor: "#06b6d4",
      senderName: "Mentora Admissions",
    });
  },
);

export const updateSampleChannelSetting = createAsyncThunk(
  "crmWorkspace/updateSampleChannelSetting",
  async ({ tenantId }: { tenantId: string }) => {
    return sendJson("/channel-settings", "POST", {
      tenantId,
      channel: "whatsapp",
      limits: {
        dailyMessages: 5000,
      },
      provider: {
        mode: "sandbox",
        providerKey: "whatsapp_business",
      },
      status: "sandbox",
    });
  },
);

export const loadTenantUsers = createAsyncThunk(
  "crmWorkspace/loadTenantUsers",
  async ({ tenantId }: { tenantId: string }) => {
    return getJson(`/tenant-users?tenantId=${encodeURIComponent(tenantId)}`);
  },
);

export const loadIntegrationProviders = createAsyncThunk(
  "crmWorkspace/loadIntegrationProviders",
  async ({ tenantId }: { tenantId: string }) => {
    return getJson(
      `/integrations/providers?tenantId=${encodeURIComponent(tenantId)}`,
    );
  },
);

export const upsertIntegrationProvider = createAsyncThunk(
  "crmWorkspace/upsertIntegrationProvider",
  async ({
    providerKey,
    tenantId,
  }: {
    providerKey: string;
    tenantId: string;
  }) => {
    return sendJson(`/integrations/providers/${providerKey}`, "PUT", {
      tenantId,
      status: "configured",
      health: {
        checkedBy: "admin-crm",
        dryRun: true,
      },
      settings: {
        environment: "sandbox",
        owner: "operations",
      },
    });
  },
);

export const loadSecurityPolicy = createAsyncThunk(
  "crmWorkspace/loadSecurityPolicy",
  async ({ tenantId }: { tenantId: string }) => {
    return getJson(
      `/security-policies?tenantId=${encodeURIComponent(tenantId)}`,
    );
  },
);

export const updateSecurityPolicy = createAsyncThunk(
  "crmWorkspace/updateSecurityPolicy",
  async ({ tenantId }: { tenantId: string }) => {
    return sendJson("/security-policies", "PUT", {
      tenantId,
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
  loginEmail: "super.admin@mentora.test",
  loggedInUser: null,
  themeMode: "system",
  toast: "Ready",
};

const initialWorkspaceState: CrmWorkspaceState = {
  activeTenantId: "",
  contexts: [],
  coverage: [],
  dashboard: null,
  error: null,
  integrationProviders: [],
  loading: false,
  moduleRecords: {},
  securityPolicy: null,
  tenants: [],
};

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
    },
    clearContext(state) {
      state.activeContext = null;
      state.toast = "Choose CRM context";
    },
    login(state, action: PayloadAction<DemoUser>) {
      state.loggedInUser = action.payload;
      state.activeContext = null;
      state.toast = `Logged in as ${action.payload.name}`;
    },
    logout(state) {
      state.activeContext = null;
      state.activeId = "dashboard";
      state.loggedInUser = null;
      state.toast = "Logged out";
    },
    openModule(state, action: PayloadAction<{ id: string; title: string }>) {
      state.activeId = action.payload.id;
      state.toast = `Opened ${action.payload.title}`;
    },
    setLoginEmail(state, action: PayloadAction<string>) {
      state.loginEmail = action.payload;
    },
    setThemeMode(state, action: PayloadAction<CrmSessionState["themeMode"]>) {
      state.themeMode = action.payload;
    },
    setToast(state, action: PayloadAction<string>) {
      state.toast = action.payload;
    },
  },
});

const crmWorkspaceSlice = createSlice({
  name: "crmWorkspace",
  initialState: initialWorkspaceState,
  reducers: {
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
      state.error = "Using local CRM changes until authenticated API is ready";
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
          activeTenantId?: unknown;
          contexts?: unknown;
          dashboard?: unknown;
          moduleCoverage?: unknown;
          tenants?: unknown;
        };
        state.activeTenantId =
          typeof data.activeTenantId === "string" ? data.activeTenantId : "";
        state.contexts = normalizeApiData(data.contexts);
        state.coverage = normalizeApiData(data.moduleCoverage);
        state.dashboard = data.dashboard ?? null;
        state.tenants = normalizeApiData(data.tenants);
        state.loading = false;
      })
      .addCase(loadCrmWorkspace.rejected, (state, action) => {
        state.error =
          action.error.message ?? "Unable to load CRM workspace data";
        state.loading = false;
      })
      .addCase(loadModuleRecords.fulfilled, (state, action) => {
        state.moduleRecords[action.payload.moduleKey] = normalizeApiData(
          action.payload.records,
        );
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
        state.moduleRecords.document_management = normalizeApiData(
          action.payload,
        );
        state.error = null;
      })
      .addCase(updateCampaignMetrics.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(runCrmRecordAction.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(createSampleDepartment.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(createSampleTeam.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(updateSampleBranding.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(updateSampleChannelSetting.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(loadTenantUsers.fulfilled, (state, action) => {
        state.moduleRecords.user_management = normalizeApiData(action.payload);
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
      .addCase(loadSecurityPolicy.fulfilled, (state, action) => {
        state.securityPolicy = normalizeApiObject(action.payload);
        state.error = null;
      })
      .addCase(updateSecurityPolicy.fulfilled, (state, action) => {
        state.securityPolicy = normalizeApiObject(action.payload);
        state.error = null;
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
    tenantId: draft.tenantId,
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
