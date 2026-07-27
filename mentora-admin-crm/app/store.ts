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
  coverage: unknown[];
  error: string | null;
  loading: boolean;
  moduleRecords: Record<string, unknown[]>;
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

async function getJson(path: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

async function sendJson(path: string, method: "POST", body: unknown) {
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
    const [tenants, coverage] = await Promise.all([
      getJson("/tenants"),
      getJson("/module-records/coverage"),
    ]);

    return { coverage, tenants };
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

const initialSessionState: CrmSessionState = {
  activeContext: null,
  activeId: "dashboard",
  loginEmail: "super.admin@mentora.test",
  loggedInUser: null,
  themeMode: "system",
  toast: "Ready",
};

const initialWorkspaceState: CrmWorkspaceState = {
  coverage: [],
  error: null,
  loading: false,
  moduleRecords: {},
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
        state.coverage = normalizeApiData(action.payload.coverage);
        state.tenants = normalizeApiData(action.payload.tenants);
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
