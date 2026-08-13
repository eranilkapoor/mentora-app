"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAnglesRight,
  faArrowRightFromBracket,
  faBarsProgress,
  faBell,
  faBuilding,
  faChevronLeft,
  faChevronRight,
  faGrip,
  faHouse,
  faKey,
  faMoon,
  faSort,
  faSortDown,
  faSortUp,
  faSun,
  faTableList,
  faUser,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  crmSessionActions,
  crmWorkspaceActions,
  addLeadAttachment,
  bulkUpdateDedicatedCrmRecordStatus,
  bulkUpdateModuleRecordStatus,
  changeCrmPassword,
  createBranch,
  createDepartment,
  createOrganization,
  createOrganizationUser,
  createTeam,
  deleteDedicatedCrmRecord,
  deleteModuleRecord,
  createReportDefinition,
  createSampleDocument,
  createWorkflowRule,
  executeWorkflow,
  exportDedicatedCrmRecords,
  exportLeads,
  exportModuleRecords,
  findLeadDuplicates,
  importSampleLeads,
  loadBranches,
  loadAuthOverview,
  loadDocuments,
  loadIdentityHierarchy,
  loadIntegrationProviders,
  loadRbacRecords,
  loadOrganizations,
  loadSecurityPolicy,
  loadAnalyticsOverview,
  loadAuditLogs,
  loadNotificationAnalytics,
  loadNotificationDlq,
  loadOrganizationUsers,
  loadPaymentReconciliation,
  loadDedicatedCrmRecords,
  loadModuleRecords,
  loadCrmWorkspace,
  loginWithCredentials,
  normalizeBackendCrmContexts,
  readPersistedCrmSession,
  replayAllNotificationDlq,
  restoreDedicatedCrmRecord,
  restoreModuleRecord,
  saveModuleRecord,
  saveRbacRecord,
  saveDedicatedCrmRecord,
  runCrmRecordAction,
  scoreLead,
  updateChannelSetting,
  updateLeadTags,
  updateCampaignMetrics,
  updateOrganizationBranding,
  updateSecurityPolicy,
  updateOrganization,
  updateAdminUser,
  updateBranch,
  updateDepartment,
  updateTeam,
  revokeAdminUserSessions,
  upsertIntegrationProvider,
  testIntegrationProvider,
  type DemoContext,
  type DemoUser,
  type CrmProfilePreferences,
  type ModuleRecordDraft,
  type OrganizationDraft,
  type OrganizationSetupDraft,
  type OrganizationUserDraft,
  useAppDispatch,
  useAppSelector,
} from "../store";
import type {
  AdminModule,
  IconName,
  ModuleCoverage,
  ModuleStatus,
} from "./adminTypes";
import {
  allModules,
  dedicatedAdminModuleIds,
  getEditableModuleColumns,
  getModuleHref,
  globalModuleIds,
  moduleActions,
  moduleMap,
  navGroups,
  organizationStructureModuleIds,
  readonlyFormColumns,
  resolveRouteModuleId,
  securityControlGroups,
  type OrganizationSetupKind,
  type ThemeMode,
} from "./adminConfig";
import {
  findModuleCoverage,
  findOrganizationIdByName,
  formatReadiness,
  formatStatus,
  getDashboardMetric,
  getModuleCardMetric,
  getServerFilterValue,
  getServerRowsForModule,
  getUnknownRecordId,
  normalizeResponseArray,
  normalizeResponseObject,
  statusClass,
  toPayloadKey,
  toServerSortKey,
} from "./adminUtils";
import { AdminIcon as Icon } from "./AdminIcon";
import { Dashboard } from "./Dashboard";
import { SecurityControlCenter } from "./SecurityControlCenter";
import { LoginScreen } from "./shellAuth";
import MyProfilePage from "./pages/MyProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import {
  getBranchOptions,
  getOrganizationOptions,
  getRecordOptions,
  WorkspaceSwitcher,
} from "./shellWorkspace";

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeContext,
    activeId: sessionActiveId,
    accessToken,
    loggedInUser,
    loginEmail,
    loginError,
    loginPassword,
    preferences,
    themeMode,
    toast,
  } = useAppSelector((state) => state.crmSession);
  const workspace = useAppSelector((state) => state.crmWorkspace);
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState({
    column: 0,
    direction: "asc" as "asc" | "desc",
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [detail, setDetail] = useState<string[] | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const [moduleView, setModuleView] = useState<"list" | "grid">("list");
  const [recordForm, setRecordForm] = useState<{
    mode: "create" | "edit";
    row?: string[];
  } | null>(null);
  const [archiveConfirmRow, setArchiveConfirmRow] = useState<string[] | null>(
    null,
  );
  const [restoreConfirmRow, setRestoreConfirmRow] = useState<string[] | null>(
    null,
  );
  const [organizationFormOpen, setOrganizationFormOpen] = useState(false);
  const [organizationEditRow, setOrganizationEditRow] = useState<
    string[] | null
  >(null);
  const [organizationSetupForm, setOrganizationSetupForm] = useState<{
    kind: OrganizationSetupKind;
    title: string;
  } | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [organizationUserForm, setOrganizationUserForm] = useState<{
    mode: "create" | "edit";
    row?: string[];
  } | null>(null);
  const [apiSyncEnabled, setApiSyncEnabled] = useState(false);
  const mainMenuRef = useRef<HTMLElement | null>(null);
  const workspaceSyncKeyRef = useRef("");
  const didRestoreSessionRef = useRef(false);
  const activeId = useMemo(
    () => resolveRouteModuleId(pathname, sessionActiveId),
    [pathname, sessionActiveId],
  );

  useEffect(() => {
    if (didRestoreSessionRef.current) return;
    didRestoreSessionRef.current = true;
    dispatch(
      crmSessionActions.restorePersistedSession(readPersistedCrmSession()),
    );
    dispatch(crmWorkspaceActions.restorePersistedContext());
  }, [dispatch]);

  useEffect(() => {
    if (!accessToken) {
      setApiSyncEnabled(false);
      workspaceSyncKeyRef.current = "";
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !loggedInUser || !activeContext) {
      return;
    }
    const syncKey = accessToken;
    if (workspaceSyncKeyRef.current === syncKey) return;
    workspaceSyncKeyRef.current = syncKey;
    setApiSyncEnabled(true);
    void dispatch(loadCrmWorkspace());
    void dispatch(loadOrganizations());
  }, [accessToken, activeContext, dispatch, loggedInUser]);

  useEffect(() => {
    const backendContexts = normalizeBackendCrmContexts(workspace.contexts);
    if (backendContexts.length === 0) return;
    dispatch(crmSessionActions.applyBackendContexts(backendContexts));
  }, [dispatch, workspace.contexts]);

  useEffect(() => {
    if (!loggedInUser || preferences.restoreLastContext) return;
    dispatch(
      crmWorkspaceActions.setActiveOrganizationId(
        preferences.defaultOrganizationId,
      ),
    );
    if (preferences.defaultBranchId) {
      dispatch(
        crmWorkspaceActions.setActiveBranchId(preferences.defaultBranchId),
      );
    }
  }, [
    dispatch,
    loggedInUser,
    preferences.defaultBranchId,
    preferences.defaultOrganizationId,
    preferences.restoreLastContext,
  ]);

  const activeOrganizationId = workspace.activeOrganizationId;
  const activeSessionRole =
    activeContext?.role ?? loggedInUser?.contexts[0]?.role ?? "";
  const userListOrganizationId =
    activeSessionRole === "super_admin"
      ? workspace.activeOrganizationId
      : activeOrganizationId;
  const organizationDetailStats = useMemo(
    () => [
      { label: "Branches", value: workspace.branches.length },
      { label: "Departments", value: workspace.departments.length },
      { label: "Teams", value: workspace.teams.length },
    ],
    [
      workspace.branches.length,
      workspace.departments.length,
      workspace.teams.length,
    ],
  );

  function getActiveModuleApiRecords() {
    if (activeModule?.id === "branches") return workspace.branches;
    if (activeModule?.id === "departments") return workspace.departments;
    if (activeModule?.id === "teams") return workspace.teams;
    return workspace.moduleRecords[activeModule?.id ?? ""];
  }

  useEffect(() => {
    if (!apiSyncEnabled || !activeOrganizationId) return;
    void dispatch(loadBranches({ organizationId: activeOrganizationId }));
    void dispatch(
      loadIdentityHierarchy({ organizationId: activeOrganizationId }),
    );
  }, [activeOrganizationId, apiSyncEnabled, dispatch]);

  useEffect(() => {
    if (
      !loggedInUser ||
      !activeContext ||
      !apiSyncEnabled ||
      activeId === "dashboard"
    ) {
      return;
    }
    if (activeId === "users") {
      void dispatch(
        loadOrganizationUsers({
          branchId: workspace.activeBranchId || undefined,
          limit: pageSize,
          organizationId: userListOrganizationId || undefined,
          page: currentPage,
          search: query.trim() || undefined,
          sortBy: toServerSortKey(moduleMap[activeId]?.columns[sort.column]),
          sortOrder: sort.direction,
          status: getServerFilterValue(filterValues, [
            "active",
            "pending",
            "suspended",
            "blocked",
          ]),
        }),
      );
      return;
    }
    if (activeId === "authentication") {
      void dispatch(
        loadAuthOverview({
          organizationId: userListOrganizationId || undefined,
        }),
      );
      return;
    }
    if (activeId === "roles" || activeId === "permissions") {
      void dispatch(
        loadRbacRecords({
          type: activeId === "roles" ? "role" : "permission",
        }),
      );
      if (activeId === "roles") {
        void dispatch(loadRbacRecords({ type: "permission" }));
      }
      return;
    }
    if (!activeOrganizationId) {
      return;
    }
    if (activeId === "integrations") {
      void dispatch(
        loadIntegrationProviders({ organizationId: activeOrganizationId }),
      );
      return;
    }
    if (activeId === "security") {
      void dispatch(
        loadSecurityPolicy({ organizationId: activeOrganizationId }),
      );
      return;
    }
    if (dedicatedAdminModuleIds.has(activeId)) {
      void dispatch(
        loadDedicatedCrmRecords({
          limit: pageSize,
          moduleKey: activeId,
          page: currentPage,
          search: query.trim() || undefined,
          sortBy: toServerSortKey(moduleMap[activeId]?.columns[sort.column]),
          sortOrder: sort.direction,
          status: getServerFilterValue(filterValues, [
            "draft",
            "open",
            "in_progress",
            "blocked",
            "completed",
            "archived",
            "submitted",
            "under_review",
            "withdrawn",
            "cancelled",
          ]),
          priority: getServerFilterValue(filterValues, [
            "low",
            "medium",
            "high",
            "urgent",
          ]),
          organizationId: activeOrganizationId,
        }),
      );
      return;
    }

    const module = moduleMap[activeId];
    void dispatch(
      loadModuleRecords({
        limit: pageSize,
        moduleKey: activeId,
        page: currentPage,
        search: query.trim() || undefined,
        sortBy: toServerSortKey(module?.columns[sort.column]),
        sortOrder: sort.direction,
        status: getServerFilterValue(filterValues, [
          "draft",
          "open",
          "in_progress",
          "blocked",
          "completed",
          "archived",
        ]),
        priority: getServerFilterValue(filterValues, [
          "low",
          "medium",
          "high",
          "urgent",
        ]),
        organizationId: activeOrganizationId,
      }),
    );
  }, [
    activeContext,
    activeId,
    activeOrganizationId,
    apiSyncEnabled,
    currentPage,
    dispatch,
    filterValues,
    loggedInUser,
    pageSize,
    query,
    sort,
    workspace.activeBranchId,
    userListOrganizationId,
  ]);

  const activeModule = moduleMap[activeId];
  const activeCoverage = useMemo(
    () => findModuleCoverage(workspace.coverage, activeId),
    [activeId, workspace.coverage],
  );
  const serverRows = useMemo(
    () => (activeModule ? getServerRowsForModule(activeModule, workspace) : []),
    [activeModule, workspace],
  );
  const firstServerRecordId = useMemo(
    () => getUnknownRecordId(workspace.moduleRecords[activeId]?.[0]),
    [activeId, workspace.moduleRecords],
  );
  const activeRows = apiSyncEnabled ? serverRows : (activeModule?.rows ?? []);
  const filteredRows = useMemo(() => {
    if (!activeModule) return [];
    const text = query.trim().toLowerCase();
    const filters = Object.values(filterValues)
      .filter(Boolean)
      .map((value) => value.toLowerCase());
    return activeRows
      .filter((row) => {
        const haystack = row.join(" ").toLowerCase();
        return (
          (!text || haystack.includes(text)) &&
          filters.every((filter) => haystack.includes(filter))
        );
      })
      .sort((a, b) => {
        const left = a[sort.column] ?? "";
        const right = b[sort.column] ?? "";
        return sort.direction === "asc"
          ? left.localeCompare(right)
          : right.localeCompare(left);
      });
  }, [activeModule, activeRows, filterValues, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleRows = filteredRows.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const selectedCount = selected.length;
  const selectedRows = visibleRows.filter((row, index) =>
    selected.includes(
      `${(safeCurrentPage - 1) * pageSize + index + 1}:${row.join("|")}`,
    ),
  );
  const currentRole = activeSessionRole;
  const contextOrganizationCount = new Set(
    loggedInUser?.contexts.map((context) => context.organization) ?? [],
  ).size;
  const contextBranchCount = new Set(
    loggedInUser?.contexts.map((context) => context.branch) ?? [],
  ).size;
  const canSwitchOrganization =
    currentRole === "super_admin" ||
    (contextOrganizationCount > 1 &&
      ["organization_admin", "branch_admin"].includes(currentRole));
  const canSwitchBranch =
    currentRole === "super_admin" ||
    ["organization_admin", "finance", "admission_manager"].includes(
      currentRole,
    ) ||
    contextBranchCount > 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeId, filterValues, pageSize, query, sort]);

  useEffect(() => {
    const activeGroup = navGroups.find((group) =>
      group.items.includes(activeId),
    );
    if (activeGroup && collapsedGroups[activeGroup.title]) {
      setCollapsedGroups((current) => ({
        ...current,
        [activeGroup.title]: false,
      }));
    }

    window.requestAnimationFrame(() => {
      const activeItem = mainMenuRef.current?.querySelector(
        `[data-module-id="${activeId}"]`,
      );
      activeItem?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    });
  }, [activeId, collapsedGroups]);

  function openModule(id: string) {
    dispatch(
      crmSessionActions.openModule({
        id,
        title: id === "dashboard" ? "Dashboard" : moduleMap[id].title,
      }),
    );
    router.push(getModuleHref(id));
    setSelected([]);
    setQuery("");
    setFilterValues({});
    setDetail(null);
  }

  async function login() {
    await dispatch(
      loginWithCredentials({
        email: loginEmail,
        password: loginPassword,
      }),
    ).unwrap();
    setApiSyncEnabled(true);
  }

  function requestApiContext(message: string) {
    if (!accessToken) {
      dispatch(
        crmSessionActions.setToast(
          "Sign in with valid CRM credentials before running this operation",
        ),
      );
      return false;
    }

    setApiSyncEnabled(true);
    if (!workspace.loading && workspace.organizations.length === 0) {
      void dispatch(loadCrmWorkspace());
    }
    dispatch(crmSessionActions.setToast(message));
    return false;
  }

  function canAccessModule(id: string) {
    const context = activeContext ?? loggedInUser?.contexts[0];
    const roleAllows =
      context?.role === "super_admin" ||
      context?.modules.includes(id) ||
      id === "dashboard";
    if (!roleAllows) return false;
    // These modules operate platform-wide (RBAC catalogs, the org directory
    // itself, and the dashboard) so they stay visible with no organization
    // selected. Everything else needs an active organization to do anything,
    // so keep it out of the sidebar until one is picked.
    if (globalModuleIds.has(id)) return true;
    if (
      context?.role === "super_admin" &&
      organizationStructureModuleIds.has(id)
    ) {
      return true;
    }
    return Boolean(activeOrganizationId);
  }

  if (!loggedInUser) {
    return (
      <LoginScreen
        loginEmail={loginEmail}
        loginError={loginError}
        loginPassword={loginPassword}
        setLoginEmail={(value) =>
          dispatch(crmSessionActions.setLoginEmail(value))
        }
        setLoginPassword={(value) =>
          dispatch(crmSessionActions.setLoginPassword(value))
        }
        login={login}
        themeMode={themeMode}
      />
    );
  }

  const currentContext = activeContext ?? loggedInUser.contexts[0];

  if (!currentContext) {
    return (
      <main className={`auth-screen theme-${themeMode}`}>
        <section className="auth-card card shadow-lg">
          <span className="brand-mark">M</span>
          <h1>No CRM Access</h1>
          <p>
            This user does not have an active organization or branch context.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => dispatch(crmSessionActions.logout())}
            type="button"
          >
            Change User
          </button>
        </section>
      </main>
    );
  }

  const visibleNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(canAccessModule),
    }))
    .filter((group) => group.items.length > 0);

  async function refreshActiveDedicatedModule() {
    if (!activeOrganizationId || !dedicatedAdminModuleIds.has(activeId)) return;
    await dispatch(
      loadDedicatedCrmRecords({
        limit: pageSize,
        moduleKey: activeId,
        page: currentPage,
        search: query.trim() || undefined,
        sortBy: toServerSortKey(moduleMap[activeId]?.columns[sort.column]),
        sortOrder: sort.direction,
        organizationId: activeOrganizationId,
      }),
    ).unwrap();
  }

  async function runAction(label: string) {
    const normalized = label.toLowerCase();

    if (
      normalized.startsWith("create ") &&
      activeId !== "leads" &&
      activeId !== "organizations" &&
      activeId !== "users" &&
      !organizationStructureModuleIds.has(activeId)
    ) {
      setRecordForm({ mode: "create" });
      return;
    }

    if (activeId === "leads") {
      if (!apiSyncEnabled || !activeOrganizationId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and organization context before running lead operations",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("export")) {
          const result = await dispatch(
            exportLeads({ organizationId: activeOrganizationId }),
          ).unwrap();
          const data = normalizeResponseObject(result);
          const rowCount = Array.isArray(data.rows) ? data.rows.length : 0;
          dispatch(
            crmSessionActions.setToast(
              `Lead export prepared with ${rowCount} rows`,
            ),
          );
          return;
        }

        if (normalized.includes("duplicate")) {
          const firstLeadRow = filteredRows[0];
          await dispatch(
            findLeadDuplicates({
              email: firstLeadRow?.[3]?.includes("@")
                ? firstLeadRow[3]
                : "imported.student@mentora.test",
              phone: firstLeadRow?.[4]?.match(/^\d{7,}$/)
                ? firstLeadRow[4]
                : undefined,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Duplicate check completed"));
          return;
        }

        if (normalized.includes("create")) {
          setRecordForm({ mode: "create" });
          return;
        }

        if (normalized.includes("import")) {
          await dispatch(
            importSampleLeads({ organizationId: activeOrganizationId }),
          ).unwrap();
          await dispatch(
            loadModuleRecords({
              moduleKey: activeId,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Sample lead imported to API"));
          return;
        }

        if (
          normalized.includes("score") ||
          normalized.includes("tag") ||
          normalized.includes("attachment")
        ) {
          if (!firstServerRecordId) {
            dispatch(
              crmSessionActions.setToast(
                "Load or import API leads before running lead enrichment actions",
              ),
            );
            return;
          }

          if (normalized.includes("score")) {
            await dispatch(
              scoreLead({
                leadId: firstServerRecordId,
                organizationId: activeOrganizationId,
              }),
            ).unwrap();
            dispatch(crmSessionActions.setToast("Lead score recalculated"));
            return;
          }

          if (normalized.includes("tag")) {
            await dispatch(
              updateLeadTags({
                leadId: firstServerRecordId,
                organizationId: activeOrganizationId,
              }),
            ).unwrap();
            dispatch(crmSessionActions.setToast("Lead tags updated"));
            return;
          }

          await dispatch(
            addLeadAttachment({
              leadId: firstServerRecordId,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Lead attachment added"));
          return;
        }
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Lead operation failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (
      [
        "attendance-students",
        "attendance-staff",
        "timetable",
        "exams",
        "report-cards",
        "transcripts",
      ].includes(activeId)
    ) {
      if (!apiSyncEnabled || !activeOrganizationId) {
        dispatch(
          crmSessionActions.setToast(
            "Select an organization and enable API sync before running education operations",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("export")) {
          const result = await dispatch(
            exportDedicatedCrmRecords({
              moduleKey: activeId,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          const data = normalizeResponseObject(result);
          const rowCount = Array.isArray(data.rows) ? data.rows.length : 0;
          dispatch(
            crmSessionActions.setToast(
              `${activeModule.title} export prepared with ${rowCount} rows`,
            ),
          );
          return;
        }

        if (activeId === "attendance-students" && normalized.includes("bulk")) {
          const studentIds = selectedRows
            .map((row) => row[0])
            .filter(isMongoObjectId);
          if (studentIds.length === 0) {
            dispatch(
              crmSessionActions.setToast(
                "Select student attendance rows with valid student ids before bulk marking",
              ),
            );
            return;
          }
          await dispatch(
            runCrmRecordAction({
              path: "/attendance/students/bulk",
              body: {
                organizationId: activeOrganizationId,
                branchId: workspace.activeBranchId || undefined,
                date: new Date().toISOString(),
                method: "manual",
                entries: studentIds.map((studentId) => ({
                  studentId,
                  status: "present",
                  remarks: "Bulk marked from Mentora CRM",
                })),
              },
            }),
          ).unwrap();
          await refreshActiveDedicatedModule();
          dispatch(
            crmSessionActions.setToast(
              `${studentIds.length} student attendance entries marked present`,
            ),
          );
          return;
        }

        if (activeId === "timetable" && normalized.includes("conflict")) {
          if (!firstServerRecordId) {
            dispatch(
              crmSessionActions.setToast(
                "Create or load timetable slots before checking conflicts",
              ),
            );
            return;
          }
          dispatch(
            crmSessionActions.setToast(
              "Timetable conflict validation runs during create/edit and no blocking conflict was returned for the loaded slots",
            ),
          );
          return;
        }

        if (activeId === "exams" && normalized.includes("publish")) {
          if (!firstServerRecordId) {
            dispatch(
              crmSessionActions.setToast(
                "Create or load an exam before publishing results",
              ),
            );
            return;
          }
          await dispatch(
            runCrmRecordAction({
              path: `/exams/${firstServerRecordId}/publish?organizationId=${encodeURIComponent(activeOrganizationId)}`,
              body: {},
            }),
          ).unwrap();
          await refreshActiveDedicatedModule();
          dispatch(crmSessionActions.setToast("Exam results published"));
          return;
        }

        if (activeId === "report-cards" && normalized.includes("generate")) {
          const sourceRow = selectedRows[0] ?? visibleRows[0];
          const studentId = sourceRow?.find(isMongoObjectId);
          if (!studentId) {
            dispatch(
              crmSessionActions.setToast(
                "Select a row containing a valid student id before generating a report card",
              ),
            );
            return;
          }
          await dispatch(
            runCrmRecordAction({
              path: "/report-cards/generate",
              body: {
                organizationId: activeOrganizationId,
                studentId,
                branchId: workspace.activeBranchId || undefined,
                term: "Current Term",
                teacherRemarks: "Generated from Mentora CRM",
              },
            }),
          ).unwrap();
          await refreshActiveDedicatedModule();
          dispatch(crmSessionActions.setToast("Report card generated"));
          return;
        }

        if (activeId === "transcripts" && normalized.includes("issue")) {
          if (!firstServerRecordId) {
            dispatch(
              crmSessionActions.setToast(
                "Create or load a transcript before issuing it",
              ),
            );
            return;
          }
          await dispatch(
            runCrmRecordAction({
              path: `/transcripts/${firstServerRecordId}/issue?organizationId=${encodeURIComponent(activeOrganizationId)}`,
              body: {},
            }),
          ).unwrap();
          await refreshActiveDedicatedModule();
          dispatch(crmSessionActions.setToast("Transcript issued"));
          return;
        }
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Education operation failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (activeId === "integrations") {
      if (!apiSyncEnabled || !activeOrganizationId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and organization context before managing integrations",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("configure")) {
          await dispatch(
            upsertIntegrationProvider({
              providerKey: "whatsapp_business",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey: "whatsapp_business",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          await dispatch(
            loadIntegrationProviders({ organizationId: activeOrganizationId }),
          ).unwrap();
          dispatch(
            crmSessionActions.setToast(
              "WhatsApp provider configured in sandbox mode",
            ),
          );
          return;
        }

        const result = await dispatch(
          loadIntegrationProviders({ organizationId: activeOrganizationId }),
        ).unwrap();
        const providers = normalizeResponseArray(result);
        dispatch(
          crmSessionActions.setToast(
            `${providers.length} integration providers checked`,
          ),
        );
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Integration action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (
      activeId === "organizations" ||
      organizationStructureModuleIds.has(activeId)
    ) {
      if (normalized === "create organization") {
        if (!accessToken) {
          dispatch(
            crmSessionActions.setToast(
              "Sign in with valid credentials before creating an organization",
            ),
          );
          return;
        }
        setOrganizationFormOpen(true);
        dispatch(crmSessionActions.setToast("Create a new organization"));
        return;
      }

      if (!accessToken || !activeOrganizationId) {
        dispatch(
          crmSessionActions.setToast(
            "Sign in and select an organization before managing organization setup",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("export") || normalized.includes("setup")) {
          const result = await dispatch(
            exportDedicatedCrmRecords({
              moduleKey: activeId,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          const data = normalizeResponseObject(result);
          const rowCount = Array.isArray(data.rows) ? data.rows.length : 0;
          dispatch(
            crmSessionActions.setToast(
              `Organization setup export prepared with ${rowCount} rows`,
            ),
          );
          return;
        }

        if (activeId === "branches" && normalized.includes("branch")) {
          setOrganizationSetupForm({ kind: "branch", title: "Create Branch" });
          return;
        }

        if (activeId === "departments" && normalized.includes("department")) {
          setOrganizationSetupForm({
            kind: "department",
            title: "Create Department",
          });
          return;
        }

        if (activeId === "teams" && normalized.includes("team")) {
          setOrganizationSetupForm({ kind: "team", title: "Create Team" });
          return;
        }

        if (normalized.includes("branding")) {
          setOrganizationSetupForm({
            kind: "branding",
            title: "Update Branding",
          });
          return;
        }

        if (normalized.includes("channel")) {
          setOrganizationSetupForm({
            kind: "channel",
            title: "Configure Channel",
          });
          return;
        }
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Organization action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (activeId === "users") {
      if (!apiSyncEnabled) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync before managing CRM users",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("create")) {
          setOrganizationUserForm({ mode: "create" });
          dispatch(crmSessionActions.setToast("Create a CRM user"));
          return;
        }

        if (
          normalized.includes("export") ||
          normalized.includes("audit") ||
          normalized.includes("access")
        ) {
          const result = await dispatch(
            loadOrganizationUsers({
              branchId: workspace.activeBranchId || undefined,
              limit: pageSize,
              organizationId: userListOrganizationId || undefined,
              page: currentPage,
              search: query.trim() || undefined,
            }),
          ).unwrap();
          const users = normalizeResponseArray(result);
          dispatch(
            crmSessionActions.setToast(
              `${users.length} live users loaded for access review`,
            ),
          );
          return;
        }

        if (normalized.includes("revoke") && firstServerRecordId) {
          await dispatch(
            revokeAdminUserSessions({ id: firstServerRecordId }),
          ).unwrap();
          await dispatch(
            loadOrganizationUsers({
              limit: pageSize,
              organizationId: userListOrganizationId || undefined,
              page: currentPage,
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Active sessions revoked"));
          return;
        }

        const result = await dispatch(
          loadOrganizationUsers({
            branchId: workspace.activeBranchId || undefined,
            limit: pageSize,
            organizationId: userListOrganizationId || undefined,
            page: currentPage,
            search: query.trim() || undefined,
          }),
        ).unwrap();
        const users = normalizeResponseArray(result);
        dispatch(
          crmSessionActions.setToast(
            `${users.length} organization users loaded`,
          ),
        );
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "User management action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (activeId === "authentication") {
      if (!apiSyncEnabled) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync before managing authentication",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("policy")) {
          await dispatch(
            updateSecurityPolicy({ organizationId: activeOrganizationId }),
          ).unwrap();
          dispatch(
            crmSessionActions.setToast(
              "Authentication policy updated for MFA-ready sessions",
            ),
          );
          return;
        }

        if (normalized.includes("sso")) {
          const providerKey = normalized.includes("microsoft")
            ? "microsoft_sso"
            : "google_sso";
          await dispatch(
            upsertIntegrationProvider({
              providerKey,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          dispatch(
            crmSessionActions.setToast(
              "SSO provider saved in sandbox mode; live credentials are external",
            ),
          );
          return;
        }

        if (normalized.includes("audit")) {
          const result = await dispatch(loadAuditLogs()).unwrap();
          const data = normalizeResponseObject(result);
          const items = normalizeResponseArray(data.items ?? data);
          dispatch(
            crmSessionActions.setToast(
              `${items.length} audit log entr${items.length === 1 ? "y" : "ies"} loaded`,
            ),
          );
          return;
        }

        if (normalized.includes("session") || normalized.includes("device")) {
          const result = await dispatch(
            loadAuthOverview({
              organizationId: userListOrganizationId || undefined,
            }),
          ).unwrap();
          const data = normalizeResponseObject(result);
          const rowCount =
            typeof data.activeSessions === "number" ? data.activeSessions : 0;
          dispatch(
            crmSessionActions.setToast(
              `${rowCount} active sessions visible for review`,
            ),
          );
          return;
        }

        await dispatch(
          loadAuthOverview({
            organizationId: userListOrganizationId || undefined,
          }),
        ).unwrap();
        dispatch(crmSessionActions.setToast("Authentication overview loaded"));
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Authentication action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (activeId === "roles" || activeId === "permissions") {
      if (!apiSyncEnabled) {
        dispatch(
          crmSessionActions.setToast("Enable API sync before managing RBAC"),
        );
        return;
      }

      try {
        const type = activeId === "roles" ? "role" : "permission";
        if (normalized.includes("create")) {
          setRecordForm({ mode: "create" });
          return;
        }
        if (
          normalized.includes("activate") ||
          normalized.includes("inactive")
        ) {
          const currentRow = visibleRows[0];
          const recordId = currentRow
            ? findModuleRecordIdForRow(getActiveModuleApiRecords(), currentRow)
            : "";
          if (!recordId) {
            dispatch(
              crmSessionActions.setToast(
                "Select or load a RBAC record before changing status",
              ),
            );
            return;
          }
          await dispatch(
            saveRbacRecord({
              id: recordId,
              isActive: !normalized.includes("inactive"),
              name: currentRow[0],
              type,
            }),
          ).unwrap();
        }
        await dispatch(loadRbacRecords({ type })).unwrap();
        if (type === "role") {
          await dispatch(loadRbacRecords({ type: "permission" })).unwrap();
        }
        dispatch(crmSessionActions.setToast(`${activeModule.title} refreshed`));
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "RBAC action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (activeId === "campaigns") {
      if (!apiSyncEnabled || !activeOrganizationId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and organization context before managing campaigns",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("roi") && firstServerRecordId) {
          await dispatch(
            updateCampaignMetrics({
              campaignId: firstServerRecordId,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Campaign ROI metrics updated"));
          return;
        }

        await dispatch(
          runCrmRecordAction({
            path: "/campaigns",
            body: {
              organizationId: activeOrganizationId,
              name: `${label} campaign`,
              channel: normalized.includes("sms")
                ? "sms"
                : normalized.includes("whatsapp")
                  ? "whatsapp"
                  : normalized.includes("landing")
                    ? "landing_page"
                    : normalized.includes("lead ad") ||
                        normalized.includes("remarketing")
                      ? "ads"
                      : "email",
              status: normalized.includes("pause") ? "paused" : "scheduled",
              audience: {
                segment: normalized.includes("remarketing")
                  ? "remarketing"
                  : "new_enquiries",
                source: normalized.includes("lead ad") ? "lead_ads" : "crm",
              },
              dripSteps: normalized.includes("drip")
                ? [
                    { delayHours: 0, channel: "email" },
                    { delayHours: 24, channel: "whatsapp" },
                    { delayHours: 72, channel: "sms" },
                  ]
                : [],
              metrics: {
                conversionTag: normalized.includes("conversion"),
                inventoryTracked: normalized.includes("inventory"),
              },
              roi: { adSpend: 0, revenueAttributed: 0 },
              utm: {
                campaign: "mentora_crm",
                medium: normalized.includes("utm") ? "paid" : "crm",
                source: "admin_crm",
              },
              variants: normalized.includes("landing")
                ? [{ name: "A", type: "landing_page" }]
                : [],
            },
          }),
        ).unwrap();
        dispatch(crmSessionActions.setToast(`${label} campaign saved`));
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Campaign action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (["communications", "emails", "sms"].includes(activeId)) {
      if (!apiSyncEnabled || !activeOrganizationId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and organization context before managing communications",
          ),
        );
        return;
      }

      const channel =
        activeId === "sms"
          ? "sms"
          : activeId === "emails"
            ? "email"
            : normalized.includes("whatsapp")
              ? "whatsapp"
              : normalized.includes("call")
                ? "call"
                : normalized.includes("push")
                  ? "push"
                  : normalized.includes("sms")
                    ? "sms"
                    : normalized.includes("in-app")
                      ? "in_app"
                      : "email";

      try {
        if (
          normalized.includes("provider") ||
          normalized.includes("callback") ||
          normalized.includes("delivery") ||
          normalized.includes("compliance")
        ) {
          await dispatch(
            upsertIntegrationProvider({
              providerKey:
                channel === "sms"
                  ? "sms_gateway"
                  : channel === "email"
                    ? "email_delivery"
                    : "whatsapp_business",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey:
                channel === "sms"
                  ? "sms_gateway"
                  : channel === "email"
                    ? "email_delivery"
                    : "whatsapp_business",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
        }

        await dispatch(
          runCrmRecordAction({
            path: "/communications",
            body: {
              organizationId: activeOrganizationId,
              entityType: "general",
              entityId: firstServerRecordId || "000000000000000000000000",
              channel,
              direction: normalized.includes("incoming")
                ? "inbound"
                : "outbound",
              subject: label,
              content: JSON.stringify({
                approval: normalized.includes("approval"),
                bounceTracking: normalized.includes("bounce"),
                bulk: normalized.includes("bulk"),
                clickTracking: normalized.includes("click"),
                deliveryStatus: normalized.includes("delivery"),
                drip: normalized.includes("drip"),
                openTracking: normalized.includes("open"),
                optInControl: normalized.includes("opt-in"),
                template: normalized.includes("template"),
                unsubscribe: normalized.includes("unsubscribe"),
              }),
            },
          }),
        ).unwrap();
        dispatch(crmSessionActions.setToast(`${label} communication saved`));
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Communication action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (activeId === "notifications") {
      if (!apiSyncEnabled || !activeOrganizationId) {
        requestApiContext("Syncing CRM workspace before opening notifications");
        return;
      }

      try {
        if (normalized.includes("failed queue")) {
          const result = await dispatch(loadNotificationDlq()).unwrap();
          const data = normalizeResponseObject(result);
          const items = normalizeResponseArray(data.items ?? data);
          dispatch(
            crmSessionActions.setToast(
              `${items.length} failed notification job(s) in the dead-letter queue`,
            ),
          );
          return;
        }

        if (normalized.includes("replay")) {
          const result = await dispatch(replayAllNotificationDlq()).unwrap();
          const data = normalizeResponseObject(result);
          dispatch(
            crmSessionActions.setToast(
              `Replayed ${data.replayed ?? data.count ?? 0} failed notification job(s)`,
            ),
          );
          return;
        }

        if (normalized.includes("analytics")) {
          const result = await dispatch(loadNotificationAnalytics()).unwrap();
          const data = normalizeResponseObject(result);
          dispatch(
            crmSessionActions.setToast(
              `Notification analytics: ${data.totalSent ?? 0} sent, ${data.totalFailed ?? 0} failed`,
            ),
          );
          return;
        }

        if (
          normalized.includes("provider") ||
          normalized.includes("delivery")
        ) {
          await dispatch(
            upsertIntegrationProvider({
              providerKey: "email_delivery",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
        }

        await dispatch(
          saveModuleRecord({
            description: `${label} notification operation`,
            moduleKey: activeId,
            payload: {
              action: label,
              analytics: String(normalized.includes("analytics")),
              deliveryLogs: String(normalized.includes("delivery")),
              failedQueue: String(normalized.includes("failed")),
              preferences: String(normalized.includes("preferences")),
              providerCheck: String(normalized.includes("provider")),
              replay: String(normalized.includes("replay")),
              templates: String(normalized.includes("template")),
            },
            priority: normalized.includes("failed") ? "high" : "medium",
            status: "open",
            organizationId: activeOrganizationId,
            title: label,
          }),
        ).unwrap();
        dispatch(crmSessionActions.setToast(`${label} notification saved`));
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Notification action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (activeId === "call-center" || activeId === "whatsapp") {
      if (!apiSyncEnabled || !activeOrganizationId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and organization context before managing this channel",
          ),
        );
        return;
      }

      try {
        if (
          normalized.includes("dialer") ||
          normalized.includes("recording") ||
          normalized.includes("analytics") ||
          normalized.includes("delivery")
        ) {
          await dispatch(
            upsertIntegrationProvider({
              providerKey:
                activeId === "call-center"
                  ? "dialer_recording"
                  : "whatsapp_business",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey:
                activeId === "call-center"
                  ? "dialer_recording"
                  : "whatsapp_business",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
        }

        if (firstServerRecordId && !normalized.includes("incoming")) {
          await dispatch(
            runCrmRecordAction({
              path: normalized.includes("complete")
                ? `/${activeId === "call-center" ? "call-center" : "whatsapp"}/${firstServerRecordId}/complete`
                : `/${activeId === "call-center" ? "call-center" : "whatsapp"}/${firstServerRecordId}`,
              body: normalized.includes("complete")
                ? {
                    organizationId: activeOrganizationId,
                    outcome: "completed",
                    result: { action: label },
                  }
                : {
                    organizationId: activeOrganizationId,
                    payload: {
                      automation: normalized.includes("automation"),
                      buttons: normalized.includes("button"),
                      disposition: normalized.includes("disposition")
                        ? "interested"
                        : undefined,
                      flow: normalized.includes("flow"),
                      followUp: normalized.includes("follow"),
                      media: normalized.includes("media"),
                      notes: label,
                      recordingRef: normalized.includes("recording")
                        ? "sandbox-recording-ref"
                        : undefined,
                      template: normalized.includes("template"),
                    },
                    status: normalized.includes("queue")
                      ? "open"
                      : "in_progress",
                  },
            }),
          ).unwrap();
        } else {
          await dispatch(
            runCrmRecordAction({
              path: activeId === "call-center" ? "/call-center" : "/whatsapp",
              body: {
                organizationId: activeOrganizationId,
                title:
                  activeId === "call-center"
                    ? `${label} record`
                    : `${label} conversation`,
                description: label,
                priority: normalized.includes("incoming") ? "high" : "medium",
                status: "open",
                payload: {
                  bulkSend: normalized.includes("bulk"),
                  channel: activeId === "call-center" ? "call" : "whatsapp",
                  direction: normalized.includes("incoming")
                    ? "inbound"
                    : "outbound",
                  disposition: normalized.includes("disposition")
                    ? "interested"
                    : undefined,
                  notes: label,
                },
              },
            }),
          ).unwrap();
        }
        dispatch(crmSessionActions.setToast(`${label} saved`));
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Channel action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (
      [
        "admissions",
        "applications",
        "campaigns",
        "documents",
        "events",
        "field-force",
        "finance",
        "interview",
        "scholarship",
        "tasks",
      ].includes(activeId)
    ) {
      if (!apiSyncEnabled || !activeOrganizationId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and organization context before running this module action",
          ),
        );
        return;
      }

      try {
        if (activeId === "documents") {
          if (normalized.includes("load")) {
            const result = await dispatch(
              loadDocuments({ organizationId: activeOrganizationId }),
            ).unwrap();
            dispatch(
              crmSessionActions.setToast(
                `${normalizeResponseArray(result).length} documents loaded`,
              ),
            );
            return;
          }

          await dispatch(
            createSampleDocument({
              entityId: firstServerRecordId || "000000000000000000000000",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Sample document requested"));
          return;
        }

        if (!firstServerRecordId) {
          dispatch(
            crmSessionActions.setToast(
              "Load API records for this module before running lifecycle actions",
            ),
          );
          return;
        }

        if (activeId === "applications") {
          await dispatch(
            runCrmRecordAction({
              path: normalized.includes("offer")
                ? `/applications/${firstServerRecordId}/decision`
                : `/applications/${firstServerRecordId}/review`,
              body: normalized.includes("offer")
                ? {
                    organizationId: activeOrganizationId,
                    decision: "offer_issued",
                    offer: { expiresInDays: 7, seatType: "regular" },
                    reason: "MVP CRM offer action",
                  }
                : {
                    organizationId: activeOrganizationId,
                    documentRequirements: [
                      { category: "academic", name: "Class 12 marksheet" },
                    ],
                    isLocked: normalized.includes("docs"),
                    note: label,
                    status: "under_review",
                  },
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Application lifecycle updated"));
          return;
        }

        if (activeId === "campaigns") {
          await dispatch(
            updateCampaignMetrics({
              campaignId: firstServerRecordId,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Campaign ROI metrics updated"));
          return;
        }

        if (activeId === "admissions") {
          await dispatch(
            runCrmRecordAction({
              path: normalized.includes("handoff")
                ? `/admissions/${firstServerRecordId}/handoff`
                : `/admissions/${firstServerRecordId}/allocate`,
              body: normalized.includes("handoff")
                ? {
                    organizationId: activeOrganizationId,
                    targetSystem: "mentora-lms",
                    payload: { syncMode: "queued" },
                  }
                : {
                    organizationId: activeOrganizationId,
                    allocation: {
                      feeCollection:
                        normalized.includes("fee") ||
                        normalized.includes("provision")
                          ? { status: "verified", amount: 25000 }
                          : undefined,
                      learningPlan: normalized.includes("provision")
                        ? { planCode: "JEE-FOUNDATION", status: "queued" }
                        : undefined,
                    },
                    batchId: "BATCH-JEE-2027-A",
                    cohortName: "JEE 2027 Alpha",
                  },
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Admission action completed"));
          return;
        }

        if (activeId === "interview") {
          const shouldComplete =
            normalized.includes("complete") ||
            normalized.includes("handoff") ||
            normalized.includes("recommend");
          await dispatch(
            runCrmRecordAction({
              path: shouldComplete
                ? `/interviews/${firstServerRecordId}/complete`
                : `/interviews/${firstServerRecordId}`,
              body: shouldComplete
                ? {
                    organizationId: activeOrganizationId,
                    outcome: "recommended",
                    result: {
                      admissionHandoff:
                        normalized.includes("handoff") ||
                        normalized.includes("recommend"),
                      offerRecommendation: normalized.includes("recommend")
                        ? "recommended"
                        : "pending",
                    },
                    score: normalized.includes("score") ? 86 : undefined,
                  }
                : {
                    organizationId: activeOrganizationId,
                    payload: {
                      interviewer: "Senior counselor",
                      panel: ["Academic mentor", "Admissions manager"],
                      remarks: label,
                      score: normalized.includes("score") ? 86 : undefined,
                      scheduledAt: new Date().toISOString(),
                    },
                    status: normalized.includes("schedule")
                      ? "scheduled"
                      : "in_progress",
                  },
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Interview workflow updated"));
          return;
        }

        if (activeId === "finance") {
          await dispatch(
            runCrmRecordAction({
              path: `/finance-ledgers/${firstServerRecordId}/reconcile`,
              body: {
                organizationId: activeOrganizationId,
                externalReference: "SANDBOX-SETTLEMENT",
                reconciliation: { matched: true },
              },
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Finance ledger reconciled"));
          return;
        }

        if (activeId === "events") {
          await dispatch(
            runCrmRecordAction({
              path: normalized.includes("complete")
                ? `/events/${firstServerRecordId}/complete`
                : `/events/${firstServerRecordId}`,
              body: normalized.includes("complete")
                ? {
                    organizationId: activeOrganizationId,
                    outcome: "completed",
                    result: { action: label },
                  }
                : {
                    organizationId: activeOrganizationId,
                    payload: {
                      attendance: normalized.includes("attendance"),
                      branchVisit: normalized.includes("branch"),
                      eventLeadCapture: normalized.includes("lead"),
                      qrCheckIn: normalized.includes("qr"),
                      registrationForm: normalized.includes("registration"),
                      webinar: normalized.includes("webinar"),
                    },
                    status: "in_progress",
                  },
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Event workflow updated"));
          return;
        }

        if (activeId === "field-force") {
          if (
            normalized.includes("geo") ||
            normalized.includes("route") ||
            normalized.includes("mileage")
          ) {
            await dispatch(
              upsertIntegrationProvider({
                providerKey: "geo_telemetry",
                organizationId: activeOrganizationId,
              }),
            ).unwrap();
            await dispatch(
              testIntegrationProvider({
                providerKey: "geo_telemetry",
                organizationId: activeOrganizationId,
              }),
            ).unwrap();
          }

          await dispatch(
            runCrmRecordAction({
              path: normalized.includes("complete")
                ? `/field-force/${firstServerRecordId}/complete`
                : `/field-force/${firstServerRecordId}`,
              body: normalized.includes("complete")
                ? {
                    organizationId: activeOrganizationId,
                    outcome: "completed",
                    result: { action: label },
                  }
                : {
                    organizationId: activeOrganizationId,
                    payload: {
                      attendance: normalized.includes("attendance"),
                      checkIn: normalized.includes("check-in"),
                      checkOut: normalized.includes("check-out"),
                      geoTracking: normalized.includes("geo"),
                      mileage: normalized.includes("mileage"),
                      routePlan: normalized.includes("route"),
                      visitHistory: normalized.includes("history"),
                    },
                    status: "in_progress",
                  },
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Field force workflow updated"));
          return;
        }

        if (activeId === "scholarship") {
          await dispatch(
            runCrmRecordAction({
              path: normalized.includes("decision")
                ? `/scholarships/${firstServerRecordId}/decision`
                : `/scholarships/${firstServerRecordId}/evaluate`,
              body: normalized.includes("decision")
                ? {
                    organizationId: activeOrganizationId,
                    decision: "approved",
                    reason: normalized.includes("award")
                      ? "Award amount approved"
                      : "Eligible for merit award",
                    award: {
                      discountPercent: 25,
                      paymentPlanImpact: normalized.includes("payment")
                        ? {
                            installmentAdjustment: "recalculated",
                            waiverAmount: 15000,
                          }
                        : undefined,
                    },
                  }
                : {
                    organizationId: activeOrganizationId,
                    criteria: {
                      academicScore: 82,
                      entranceScore: 78,
                      needScore: 64,
                      verification: normalized.includes("verify")
                        ? { documentsVerified: true, verifiedBy: "admin-crm" }
                        : undefined,
                    },
                  },
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Scholarship action completed"));
          return;
        }

        if (activeId === "tasks") {
          await dispatch(
            runCrmRecordAction({
              path: `/tasks/${firstServerRecordId}/workflow`,
              body: {
                organizationId: activeOrganizationId,
                boardColumn: normalized.includes("complete")
                  ? "done"
                  : "blocked",
                comment: label,
                escalation: normalized.includes("escalate")
                  ? { reason: "SLA risk", level: "manager" }
                  : undefined,
                slaStatus: normalized.includes("escalate")
                  ? "at_risk"
                  : "healthy",
                status: normalized.includes("complete")
                  ? "completed"
                  : "in_progress",
              },
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Task workflow updated"));
          return;
        }
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Module action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (
      [
        "mobile-app",
        "calendar",
        "payments",
        "dashboard",
        "analytics",
        "ai-features",
      ].includes(activeId)
    ) {
      if (!apiSyncEnabled || !activeOrganizationId) {
        requestApiContext(
          "Syncing CRM workspace before running this operation",
        );
        return;
      }

      try {
        if (activeId === "calendar" && normalized.includes("sync")) {
          await dispatch(
            upsertIntegrationProvider({
              providerKey: "calendar_sync",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey: "calendar_sync",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
        }

        if (
          activeId === "calendar" &&
          (normalized.includes("interview") || normalized.includes("event"))
        ) {
          const moduleKey = normalized.includes("interview")
            ? "interview"
            : "events";
          const result = await dispatch(
            loadDedicatedCrmRecords({
              limit: 5,
              moduleKey,
              organizationId: activeOrganizationId,
              page: 1,
            }),
          ).unwrap();
          const data = normalizeResponseObject(result.records);
          const pagination = normalizeResponseObject(data.pagination);
          dispatch(
            crmSessionActions.setToast(
              `${pagination.total ?? 0} ${moduleKey === "interview" ? "interview slot(s)" : "calendar event(s)"} on record`,
            ),
          );
          return;
        }

        if (activeId === "payments" && normalized.includes("reconciliation")) {
          const result = await dispatch(loadPaymentReconciliation()).unwrap();
          const data = normalizeResponseObject(result);
          const totals = normalizeResponseObject(data.totals);
          dispatch(
            crmSessionActions.setToast(
              `Reconciliation: ${totals.totalTransactions ?? 0} transactions, ` +
                `${data.successRate ?? 0}% success, ${data.stalePendingCount ?? 0} stale pending`,
            ),
          );
          return;
        }

        if (
          activeId === "payments" &&
          (normalized.includes("link") || normalized.includes("refund"))
        ) {
          await dispatch(
            upsertIntegrationProvider({
              providerKey: "accounting_export",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey: "accounting_export",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
        }

        if (activeId === "ai-features") {
          await dispatch(
            upsertIntegrationProvider({
              providerKey: "ai_provider_metering",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey: "ai_provider_metering",
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
        }

        if (
          activeId === "mobile-app" &&
          (normalized.includes("lead") || normalized.includes("geo"))
        ) {
          const moduleKey = normalized.includes("lead")
            ? "leads"
            : "field-force";
          const result = await dispatch(
            loadDedicatedCrmRecords({
              limit: 5,
              moduleKey,
              organizationId: activeOrganizationId,
              page: 1,
            }),
          ).unwrap();
          const data = normalizeResponseObject(result.records);
          const pagination = normalizeResponseObject(data.pagination);
          dispatch(
            crmSessionActions.setToast(
              `${pagination.total ?? 0} ${moduleKey === "leads" ? "lead(s)" : "field visit check-in(s)"} on record`,
            ),
          );
          return;
        }

        if (activeId === "analytics") {
          const result = await dispatch(loadAnalyticsOverview()).unwrap();
          const data = normalizeResponseObject(result);
          dispatch(
            crmSessionActions.setToast(
              `Analytics: ${data.totalEvents ?? 0} tracked events, ${data.uniqueUsers ?? 0} unique users`,
            ),
          );
          return;
        }

        await dispatch(
          saveModuleRecord({
            description: `${label} operation from Mentora CRM`,
            moduleKey: activeId,
            payload: {
              action: label,
              analytics: String(activeId === "analytics"),
              calendarSync: String(normalized.includes("sync")),
              dashboardRole: normalized.includes("ceo")
                ? "ceo"
                : normalized.includes("finance")
                  ? "finance"
                  : normalized.includes("marketing")
                    ? "marketing"
                    : normalized.includes("counselor")
                      ? "counselor"
                      : "none",
              forecasting: String(normalized.includes("forecast")),
              offlineSync: String(normalized.includes("offline")),
              paymentOperation: String(activeId === "payments"),
              prediction: String(normalized.includes("prediction")),
              report: String(normalized.includes("report")),
            },
            priority:
              normalized.includes("refund") || normalized.includes("geo")
                ? "high"
                : "medium",
            status: normalized.includes("complete") ? "completed" : "open",
            organizationId: activeOrganizationId,
            title: label,
          }),
        ).unwrap();
        dispatch(
          crmSessionActions.setToast(
            `${activeModule?.title ?? "Module"} ${label} saved`,
          ),
        );
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Operation failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (activeId === "security") {
      if (!apiSyncEnabled || !activeOrganizationId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and organization context before managing security policy",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("mfa") || normalized.includes("sso")) {
          const providerKey = normalized.includes("microsoft")
            ? "microsoft_sso"
            : "google_sso";
          await dispatch(
            upsertIntegrationProvider({
              providerKey,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          dispatch(
            crmSessionActions.setToast(
              `${normalized.includes("mfa") ? "MFA" : "SSO"} provider saved in sandbox mode`,
            ),
          );
          return;
        }

        if (normalized.includes("report")) {
          await dispatch(
            createReportDefinition({
              moduleKey: activeId,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          dispatch(
            crmSessionActions.setToast("Security report definition saved"),
          );
          return;
        }

        if (normalized.includes("export") || normalized.includes("audit")) {
          const result = await dispatch(loadAuditLogs()).unwrap();
          const data = normalizeResponseObject(result);
          const items = normalizeResponseArray(data.items ?? data);
          dispatch(
            crmSessionActions.setToast(
              `${items.length} audit log entr${items.length === 1 ? "y" : "ies"} loaded`,
            ),
          );
          return;
        }

        if (normalized.includes("update")) {
          await dispatch(
            updateSecurityPolicy({ organizationId: activeOrganizationId }),
          ).unwrap();
          dispatch(
            crmSessionActions.setToast(
              "Organization security policy updated with MFA and masking controls",
            ),
          );
          return;
        }

        await dispatch(
          loadSecurityPolicy({ organizationId: activeOrganizationId }),
        ).unwrap();
        dispatch(
          crmSessionActions.setToast("Organization security policy loaded"),
        );
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Security policy action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (normalized.includes("export") || normalized.includes("report")) {
      if (!apiSyncEnabled || !activeOrganizationId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and organization context before exporting records",
          ),
        );
        return;
      }

      try {
        if (activeId === "reports") {
          await dispatch(
            createReportDefinition({
              moduleKey: activeId,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
        }
        const result = await dispatch(
          dedicatedAdminModuleIds.has(activeId)
            ? exportDedicatedCrmRecords({
                moduleKey: activeId,
                organizationId: activeOrganizationId,
              })
            : exportModuleRecords({
                moduleKey: activeId,
                organizationId: activeOrganizationId,
              }),
        ).unwrap();
        const data = normalizeResponseObject(result);
        const rowCount = Array.isArray(data.rows) ? data.rows.length : 0;
        dispatch(
          crmSessionActions.setToast(
            `${activeModule?.title ?? "Module"} export prepared with ${rowCount} rows`,
          ),
        );
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Export failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    if (activeId === "automation" || normalized.includes("workflow")) {
      if (!apiSyncEnabled || !activeOrganizationId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and organization context before running workflow actions",
          ),
        );
        return;
      }

      try {
        if (
          normalized.includes("create") ||
          normalized.includes("rule") ||
          normalized.includes("assignment") ||
          normalized.includes("reminder") ||
          normalized.includes("drip") ||
          normalized.includes("escalation") ||
          normalized.includes("score") ||
          normalized.includes("recycle") ||
          normalized.includes("webhook")
        ) {
          await dispatch(
            createWorkflowRule({
              moduleKey: activeId,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Workflow rule created"));
          return;
        }

        await dispatch(
          executeWorkflow({
            moduleKey: activeId,
            organizationId: activeOrganizationId,
          }),
        ).unwrap();
        dispatch(crmSessionActions.setToast("Workflow execution completed"));
        return;
      } catch (error) {
        dispatch(
          crmSessionActions.setToast(
            error instanceof Error
              ? error.message
              : "Workflow action failed. Check API auth and permissions.",
          ),
        );
        return;
      }
    }

    dispatch(
      crmSessionActions.setToast(
        `${label} queued for ${selectedCount || "current"} record${selectedCount === 1 ? "" : "s"}`,
      ),
    );
  }

  async function archiveRow(row: string[]) {
    if (!activeModule) return;
    const recordId = findModuleRecordIdForRow(getActiveModuleApiRecords(), row);
    if (!recordId) {
      dispatch(crmSessionActions.setToast("API record was not found"));
      return;
    }
    if (activeModule.id === "users") {
      await dispatch(
        updateAdminUser({
          id: recordId,
          status: "suspended",
        }),
      ).unwrap();
      await dispatch(
        loadOrganizationUsers({
          limit: pageSize,
          organizationId: userListOrganizationId || undefined,
          page: currentPage,
          search: query.trim() || undefined,
        }),
      ).unwrap();
      dispatch(crmSessionActions.setToast("User access suspended"));
      return;
    }
    if (!activeOrganizationId) {
      dispatch(crmSessionActions.setToast("Organization context is required"));
      return;
    }
    if (activeModule.id === "roles" || activeModule.id === "permissions") {
      await dispatch(
        saveRbacRecord({
          id: recordId,
          isActive: false,
          name: row[0],
          type: activeModule.id === "roles" ? "role" : "permission",
        }),
      ).unwrap();
      await dispatch(
        loadRbacRecords({
          type: activeModule.id === "roles" ? "role" : "permission",
        }),
      ).unwrap();
      dispatch(crmSessionActions.setToast(`${activeModule.title} inactivated`));
      return;
    }
    if (
      dedicatedAdminModuleIds.has(activeModule.id) ||
      organizationStructureModuleIds.has(activeModule.id)
    ) {
      await dispatch(
        deleteDedicatedCrmRecord({
          moduleKey: activeModule.id,
          recordId,
          organizationId: activeOrganizationId,
        }),
      ).unwrap();
    } else {
      await dispatch(
        deleteModuleRecord({
          moduleKey: activeModule.id,
          recordId,
          organizationId: activeOrganizationId,
        }),
      ).unwrap();
    }
    if (organizationStructureModuleIds.has(activeModule.id)) {
      await dispatch(
        loadIdentityHierarchy({ organizationId: activeOrganizationId }),
      ).unwrap();
    }
    dispatch(
      crmSessionActions.setToast(`${activeModule.title} record archived`),
    );
  }

  async function restoreRow(row: string[]) {
    if (!activeModule) return;
    const recordId = findModuleRecordIdForRow(getActiveModuleApiRecords(), row);
    if (!recordId) {
      dispatch(crmSessionActions.setToast("API record was not found"));
      return;
    }
    if (activeModule.id === "users") {
      await dispatch(
        updateAdminUser({
          id: recordId,
          status: "active",
        }),
      ).unwrap();
      await dispatch(
        loadOrganizationUsers({
          limit: pageSize,
          organizationId: userListOrganizationId || undefined,
          page: currentPage,
          search: query.trim() || undefined,
        }),
      ).unwrap();
      dispatch(crmSessionActions.setToast("User access activated"));
      return;
    }
    if (!activeOrganizationId) {
      dispatch(crmSessionActions.setToast("Organization context is required"));
      return;
    }
    if (activeModule.id === "roles" || activeModule.id === "permissions") {
      await dispatch(
        saveRbacRecord({
          id: recordId,
          isActive: true,
          name: row[0],
          type: activeModule.id === "roles" ? "role" : "permission",
        }),
      ).unwrap();
      await dispatch(
        loadRbacRecords({
          type: activeModule.id === "roles" ? "role" : "permission",
        }),
      ).unwrap();
      dispatch(crmSessionActions.setToast(`${activeModule.title} activated`));
      return;
    }
    if (
      dedicatedAdminModuleIds.has(activeModule.id) ||
      organizationStructureModuleIds.has(activeModule.id)
    ) {
      await dispatch(
        restoreDedicatedCrmRecord({
          moduleKey: activeModule.id,
          recordId,
          organizationId: activeOrganizationId,
        }),
      ).unwrap();
    } else {
      await dispatch(
        restoreModuleRecord({
          moduleKey: activeModule.id,
          recordId,
          organizationId: activeOrganizationId,
        }),
      ).unwrap();
    }
    if (organizationStructureModuleIds.has(activeModule.id)) {
      await dispatch(
        loadIdentityHierarchy({ organizationId: activeOrganizationId }),
      ).unwrap();
    }
    dispatch(
      crmSessionActions.setToast(`${activeModule.title} record restored`),
    );
  }

  async function bulkUpdateSelectedStatus(status: string) {
    if (!activeModule) return;
    if (!activeOrganizationId) {
      dispatch(crmSessionActions.setToast("Organization context is required"));
      return;
    }
    const selectedRows = visibleRows.filter((row) =>
      selected.includes(row.join("|")),
    );
    const recordIds = selectedRows
      .map((row) => findModuleRecordIdForRow(getActiveModuleApiRecords(), row))
      .filter(Boolean);
    if (recordIds.length === 0) {
      dispatch(crmSessionActions.setToast("Select API-backed records first"));
      return;
    }
    if (dedicatedAdminModuleIds.has(activeModule.id)) {
      await dispatch(
        bulkUpdateDedicatedCrmRecordStatus({
          moduleKey: activeModule.id,
          recordIds,
          status,
          organizationId: activeOrganizationId,
        }),
      ).unwrap();
    } else {
      await dispatch(
        bulkUpdateModuleRecordStatus({
          moduleKey: activeModule.id,
          recordIds,
          status,
          organizationId: activeOrganizationId,
        }),
      ).unwrap();
    }
    setSelected([]);
    dispatch(
      crmSessionActions.setToast(
        `${recordIds.length} ${activeModule.title} record${
          recordIds.length === 1 ? "" : "s"
        } moved to ${status.replaceAll("_", " ")}`,
      ),
    );
  }

  return (
    <div
      className={`admin-shell theme-${themeMode} ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <aside className="left-sec">
        <div className="header-left">
          <button
            className="brand"
            onClick={() => openModule("dashboard")}
            type="button"
          >
            <span className="brand-mark">M</span>
            <span>
              Mentora CRM
              <small>Education SaaS</small>
            </span>
          </button>
          <button
            aria-label={
              isSidebarCollapsed
                ? "Expand left navigation"
                : "Collapse left navigation"
            }
            className="sidebar-toggle"
            onClick={() => setIsSidebarCollapsed((value) => !value)}
            type="button"
          >
            <FontAwesomeIcon icon={faBarsProgress} />
          </button>
        </div>
        <nav
          className="main-menu"
          aria-label="Admin CRM modules"
          ref={mainMenuRef}
        >
          {visibleNavGroups.map((group) => (
            <section
              className={`menu-group ${
                collapsedGroups[group.title] ? "group-collapsed" : ""
              }`}
              key={group.title}
            >
              <button
                aria-expanded={!collapsedGroups[group.title]}
                className="menu-heading"
                onClick={() =>
                  setCollapsedGroups((current) => ({
                    ...current,
                    [group.title]: !current[group.title],
                  }))
                }
                type="button"
              >
                <span className="menu-heading-title">{group.title}</span>
              </button>
              <ul>
                {group.items.map((id) => (
                  <li key={id}>
                    <button
                      className={activeId === id ? "selected" : ""}
                      data-module-id={id}
                      onClick={() => openModule(id)}
                      type="button"
                    >
                      <Icon name={moduleMap[id]?.icon ?? "dashboard"} />
                      <span>
                        {id === "learning"
                          ? "Learning Ops"
                          : (moduleMap[id]?.title ?? "Dashboard")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </aside>

      <main className="right-sec">
        <header className="header-right">
          <div className="login-info" role="toolbar" aria-label="CRM actions">
            <div className="utility-cluster">
              <WorkspaceSwitcher
                activeContext={currentContext}
                activeBranchId={workspace.activeBranchId}
                activeOrganizationId={workspace.activeOrganizationId}
                branches={workspace.branches}
                canSwitchBranch={canSwitchBranch}
                canSwitchOrganization={canSwitchOrganization}
                contexts={loggedInUser.contexts}
                onChange={(context) =>
                  dispatch(crmSessionActions.chooseContext(context))
                }
                onBranchChange={(branchId) =>
                  dispatch(crmWorkspaceActions.setActiveBranchId(branchId))
                }
                onOrganizationChange={(organizationId) => {
                  dispatch(
                    crmWorkspaceActions.setActiveOrganizationId(organizationId),
                  );
                  setApiSyncEnabled(true);
                  void (async () => {
                    if (!organizationId) {
                      await dispatch(loadCrmWorkspace());
                      await dispatch(loadOrganizations());
                      return;
                    }
                    await dispatch(loadCrmWorkspace({ organizationId }));
                    await dispatch(loadBranches({ organizationId }));
                    await dispatch(loadIdentityHierarchy({ organizationId }));
                  })();
                }}
                organizations={workspace.organizations}
              />
              <ThemeSwitch
                onToggle={() =>
                  dispatch(
                    crmSessionActions.setThemeMode(
                      themeMode === "dark" ? "light" : "dark",
                    ),
                  )
                }
                themeMode={themeMode === "light" ? "light" : themeMode}
              />
              <button
                aria-label="Open notifications"
                className="topbar-icon-button"
                onClick={() => {
                  openModule("notifications");
                }}
                type="button"
              >
                <FontAwesomeIcon icon={faBell} />
                <em>3</em>
              </button>
              <ProfileDropdown
                isOpen={isProfileMenuOpen}
                onChangePassword={() => {
                  router.push(getModuleHref("change-password"));
                  setIsProfileMenuOpen(false);
                }}
                onLogout={() => dispatch(crmSessionActions.logout())}
                onMyProfile={() => {
                  router.push(getModuleHref("my-profile"));
                  setIsProfileMenuOpen(false);
                }}
                onToggle={() => setIsProfileMenuOpen((current) => !current)}
                user={loggedInUser}
              />
            </div>
          </div>
        </header>

        {activeId === "my-profile" ? (
          <MyProfilePage
            activeContext={currentContext}
            branches={workspace.branches}
            modules={allModules.filter((module) => canAccessModule(module.id))}
            onDefaultOrganizationChange={(organizationId) => {
              if (!organizationId) return;
              void dispatch(loadBranches({ organizationId }));
            }}
            onSavePreferences={(nextPreferences) => {
              dispatch(crmSessionActions.setPreferences(nextPreferences));
              dispatch(crmSessionActions.setToast("Profile preferences saved"));
            }}
            organizations={workspace.organizations}
            preferences={preferences}
            user={loggedInUser}
          />
        ) : activeId === "change-password" ? (
          <ChangePasswordPage
            onSubmit={async (draft) => {
              await dispatch(changeCrmPassword(draft)).unwrap();
              dispatch(crmSessionActions.setToast("Password changed"));
            }}
          />
        ) : activeId === "dashboard" ? (
          <Dashboard
            canAccessModule={canAccessModule}
            openModule={openModule}
            workspace={workspace}
          />
        ) : (
          <ModulePanel
            activeContext={currentContext}
            coverage={activeCoverage}
            detail={detail}
            filterValues={filterValues}
            module={activeModule}
            pageSize={pageSize}
            currentPage={safeCurrentPage}
            pageStart={(safeCurrentPage - 1) * pageSize}
            query={query}
            rows={visibleRows}
            selected={selected}
            selectedCount={selectedCount}
            setDetail={setDetail}
            setFilterValues={setFilterValues}
            setCurrentPage={setCurrentPage}
            setPageSize={setPageSize}
            setQuery={setQuery}
            setSelected={setSelected}
            setSort={setSort}
            sort={sort}
            total={filteredRows.length}
            totalPages={totalPages}
            usingServerRows={apiSyncEnabled}
            view={moduleView}
            setView={setModuleView}
            openRecordForm={(form) => {
              if (activeModule.id === "organizations" && form.mode === "edit") {
                setOrganizationEditRow(form.row ?? null);
                return;
              }
              if (activeModule.id === "users") {
                setOrganizationUserForm(form);
                return;
              }
              setRecordForm(form);
            }}
            archiveRow={async (row) => {
              setArchiveConfirmRow(row);
            }}
            bulkStatusEnabled={
              activeModule.id !== "organizations" &&
              !["roles", "permissions"].includes(activeModule.id) &&
              !organizationStructureModuleIds.has(activeModule.id)
            }
            bulkUpdateSelectedStatus={bulkUpdateSelectedStatus}
            runAction={runAction}
            restoreRow={restoreRow}
            requestRestoreRow={(row) => setRestoreConfirmRow(row)}
          />
        )}

        {recordForm && activeModule ? (
          <RecordFormModal
            availablePermissions={workspace.moduleRecords.permissions ?? []}
            module={activeModule}
            onClose={() => setRecordForm(null)}
            onSubmit={async (draft) => {
              const finalDraft = {
                ...draft,
                moduleKey: activeModule.id,
                organizationId: activeOrganizationId,
              };
              if (
                !apiSyncEnabled ||
                (!activeOrganizationId &&
                  !["roles", "permissions"].includes(activeModule.id)) ||
                workspace.error
              ) {
                dispatch(
                  crmSessionActions.setToast(
                    "API sync and organization context are required before saving",
                  ),
                );
                return;
              }
              try {
                if (activeModule.id === "organizations") {
                  const organizationId = findOrganizationIdByName(
                    workspace.organizations,
                    finalDraft.title,
                  );
                  if (!organizationId) {
                    dispatch(
                      crmSessionActions.setToast(
                        "Organization record was not found in the API response",
                      ),
                    );
                    return;
                  }
                  await dispatch(
                    updateOrganization({
                      id: organizationId,
                      name: finalDraft.title,
                      primaryDomain:
                        finalDraft.payload.primaryDomain ||
                        finalDraft.payload.domain ||
                        undefined,
                      type: finalDraft.payload.type || "coaching",
                    }),
                  ).unwrap();
                  await dispatch(loadCrmWorkspace()).unwrap();
                  dispatch(crmSessionActions.setToast("Organization updated"));
                  setRecordForm(null);
                  return;
                }
                if (
                  activeModule.id === "roles" ||
                  activeModule.id === "permissions"
                ) {
                  const recordId = recordForm.row
                    ? findModuleRecordIdForRow(
                        getActiveModuleApiRecords(),
                        recordForm.row,
                      )
                    : undefined;
                  const permissionIds =
                    activeModule.id === "roles"
                      ? String(finalDraft.payload.permissions ?? "")
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .map((nameOrId) => {
                            const permission = (
                              workspace.moduleRecords.permissions ?? []
                            ).find((item) => {
                              const object =
                                item && typeof item === "object"
                                  ? (item as Record<string, unknown>)
                                  : {};
                              return (
                                object._id === nameOrId ||
                                object.id === nameOrId ||
                                object.name === nameOrId
                              );
                            });
                            return getUnknownRecordId(permission) || nameOrId;
                          })
                      : undefined;
                  await dispatch(
                    saveRbacRecord({
                      description:
                        finalDraft.description ||
                        finalDraft.payload.description ||
                        undefined,
                      id: recordId,
                      isActive: finalDraft.status !== "inactive",
                      module:
                        finalDraft.payload.module ||
                        finalDraft.title.split(":")[0] ||
                        "general",
                      name: finalDraft.title,
                      permissions: permissionIds,
                      type: activeModule.id === "roles" ? "role" : "permission",
                    }),
                  ).unwrap();
                  await dispatch(
                    loadRbacRecords({
                      type: activeModule.id === "roles" ? "role" : "permission",
                    }),
                  ).unwrap();
                  if (activeModule.id === "roles") {
                    await dispatch(
                      loadRbacRecords({ type: "permission" }),
                    ).unwrap();
                  }
                  dispatch(crmSessionActions.setToast("RBAC record saved"));
                  setRecordForm(null);
                  return;
                }
                if (organizationStructureModuleIds.has(activeModule.id)) {
                  const existing = normalizeResponseObject(
                    recordForm.row
                      ? findModuleRecordForRow(
                          getActiveModuleApiRecords(),
                          recordForm.row,
                        )
                      : undefined,
                  );
                  const existingRecordId = getUnknownRecordId(existing);
                  const existingCode =
                    typeof existing.code === "string"
                      ? existing.code
                      : undefined;
                  const submittedCode =
                    finalDraft.payload.code ||
                    finalDraft.payload.organizationCode ||
                    existingCode ||
                    finalDraft.title
                      .trim()
                      .replace(/[^a-z0-9]+/gi, "-")
                      .replace(/^-|-$/g, "")
                      .toUpperCase();
                  if (!submittedCode) {
                    dispatch(
                      crmSessionActions.setToast(
                        "Code is required before saving this hierarchy record",
                      ),
                    );
                    return;
                  }
                  const existingRelationId = (value: unknown) =>
                    typeof value === "string"
                      ? value
                      : getUnknownRecordId(value) || undefined;
                  const submittedBranchId =
                    finalDraft.payload.branchId ||
                    findOrganizationIdByName(
                      workspace.branches,
                      finalDraft.payload.branch,
                    ) ||
                    existingRelationId(existing.branchId);
                  const submittedDepartmentId =
                    finalDraft.payload.departmentId ||
                    findOrganizationIdByName(
                      workspace.departments,
                      finalDraft.payload.department,
                    ) ||
                    existingRelationId(existing.departmentId);
                  if (activeModule.id === "branches") {
                    const branchDraft = {
                      id: existingRecordId || undefined,
                      organizationId: activeOrganizationId,
                      name: finalDraft.title,
                      code: submittedCode,
                      city: finalDraft.payload.city || undefined,
                      state: finalDraft.payload.state || undefined,
                      country: finalDraft.payload.country || undefined,
                      postalCode: finalDraft.payload.postalCode || undefined,
                      addressLine1:
                        finalDraft.payload.addressLine1 || undefined,
                      addressLine2:
                        finalDraft.payload.addressLine2 || undefined,
                      email: finalDraft.payload.email || undefined,
                      phone: finalDraft.payload.phone || undefined,
                      managerId: finalDraft.payload.managerId || undefined,
                      status: finalDraft.status || undefined,
                      timezone: finalDraft.payload.timezone || undefined,
                    };
                    if (branchDraft.id) {
                      await dispatch(
                        updateBranch(
                          branchDraft as OrganizationSetupDraft & {
                            id: string;
                          },
                        ),
                      ).unwrap();
                    } else {
                      await dispatch(createBranch(branchDraft)).unwrap();
                    }
                  } else if (activeModule.id === "departments") {
                    const departmentDraft = {
                      id: existingRecordId || undefined,
                      organizationId: activeOrganizationId,
                      name: finalDraft.title,
                      code: submittedCode,
                      branchId: submittedBranchId,
                      description: finalDraft.payload.description || undefined,
                      email: finalDraft.payload.email || undefined,
                      function: finalDraft.payload.function || undefined,
                      headId: finalDraft.payload.headId || undefined,
                      phone: finalDraft.payload.phone || undefined,
                      status: finalDraft.status || undefined,
                    };
                    if (departmentDraft.id) {
                      await dispatch(
                        updateDepartment(
                          departmentDraft as OrganizationSetupDraft & {
                            id: string;
                          },
                        ),
                      ).unwrap();
                    } else {
                      await dispatch(
                        createDepartment(departmentDraft),
                      ).unwrap();
                    }
                  } else {
                    const teamDraft = {
                      id: existingRecordId || undefined,
                      organizationId: activeOrganizationId,
                      name: finalDraft.title,
                      code: submittedCode,
                      branchId: submittedBranchId,
                      departmentId: submittedDepartmentId,
                      description: finalDraft.payload.description || undefined,
                      managerId: finalDraft.payload.managerId || undefined,
                      status: finalDraft.status || undefined,
                    };
                    if (teamDraft.id) {
                      await dispatch(
                        updateTeam(
                          teamDraft as OrganizationSetupDraft & {
                            id: string;
                          },
                        ),
                      ).unwrap();
                    } else {
                      await dispatch(createTeam(teamDraft)).unwrap();
                    }
                  }
                  await dispatch(
                    loadIdentityHierarchy({
                      organizationId: activeOrganizationId,
                    }),
                  ).unwrap();
                  dispatch(crmSessionActions.setToast("Record saved to API"));
                  setRecordForm(null);
                  return;
                }
                if (dedicatedAdminModuleIds.has(activeModule.id)) {
                  await dispatch(saveDedicatedCrmRecord(finalDraft)).unwrap();
                } else {
                  await dispatch(saveModuleRecord(finalDraft)).unwrap();
                }
                dispatch(crmSessionActions.setToast("Record saved to API"));
              } catch {
                dispatch(
                  crmSessionActions.setToast(
                    "API save failed. No local fallback record was created.",
                  ),
                );
                return;
              }
              setRecordForm(null);
            }}
            row={recordForm.row}
            sourceRecord={
              recordForm.row
                ? findModuleRecordForRow(
                    getActiveModuleApiRecords(),
                    recordForm.row,
                  )
                : undefined
            }
          />
        ) : null}

        {organizationFormOpen ? (
          <OrganizationFormModal
            onClose={() => setOrganizationFormOpen(false)}
            onSubmit={async (draft) => {
              const response = await dispatch(
                createOrganization(draft),
              ).unwrap();
              const created = normalizeResponseObject(response) as {
                organization?: unknown;
              };
              const organizationId = getUnknownRecordId(
                created.organization ?? created,
              );
              await dispatch(
                loadCrmWorkspace(
                  organizationId ? { organizationId } : undefined,
                ),
              ).unwrap();
              if (organizationId) {
                await dispatch(loadBranches({ organizationId })).unwrap();
              }
              dispatch(crmSessionActions.setToast("Organization created"));
              setOrganizationFormOpen(false);
            }}
          />
        ) : null}

        {organizationEditRow ? (
          <OrganizationEditModal
            organizations={workspace.organizations}
            onClose={() => setOrganizationEditRow(null)}
            onSubmit={async (draft) => {
              await dispatch(updateOrganization(draft)).unwrap();
              await dispatch(loadOrganizations()).unwrap();
              await dispatch(loadCrmWorkspace()).unwrap();
              dispatch(crmSessionActions.setToast("Organization updated"));
              setOrganizationEditRow(null);
            }}
            row={organizationEditRow}
          />
        ) : null}

        {organizationSetupForm ? (
          <OrganizationSetupModal
            activeOrganizationId={activeOrganizationId}
            branches={workspace.branches}
            departments={workspace.departments}
            kind={organizationSetupForm.kind}
            onClose={() => setOrganizationSetupForm(null)}
            onSubmit={async (draft) => {
              const normalizedDraft = {
                ...draft,
                code: draft.code?.trim().toUpperCase(),
                name: draft.name?.trim(),
                organizationId: draft.organizationId,
              };

              if (organizationSetupForm.kind === "branch") {
                await dispatch(createBranch(normalizedDraft)).unwrap();
                await dispatch(
                  loadBranches({ organizationId: draft.organizationId }),
                ).unwrap();
              } else if (organizationSetupForm.kind === "department") {
                await dispatch(createDepartment(normalizedDraft)).unwrap();
              } else if (organizationSetupForm.kind === "team") {
                await dispatch(createTeam(normalizedDraft)).unwrap();
              } else if (organizationSetupForm.kind === "branding") {
                await dispatch(
                  updateOrganizationBranding(normalizedDraft),
                ).unwrap();
              } else {
                await dispatch(updateChannelSetting(normalizedDraft)).unwrap();
              }

              await dispatch(
                loadIdentityHierarchy({ organizationId: draft.organizationId }),
              ).unwrap();
              dispatch(
                crmSessionActions.setToast(
                  `${organizationSetupForm.title} saved`,
                ),
              );
              setOrganizationSetupForm(null);
            }}
            organizations={workspace.organizations}
            title={organizationSetupForm.title}
          />
        ) : null}

        {organizationUserForm ? (
          <OrganizationUserFormModal
            activeOrganizationId={activeOrganizationId}
            branches={workspace.branches}
            departments={workspace.departments}
            mode={organizationUserForm.mode}
            onClose={() => setOrganizationUserForm(null)}
            onOrganizationChange={(organizationId) => {
              if (!organizationId) return;
              void dispatch(loadBranches({ organizationId }));
              void dispatch(loadIdentityHierarchy({ organizationId }));
            }}
            onSubmit={async (draft) => {
              if (organizationUserForm.mode === "edit" && draft.id) {
                await dispatch(
                  updateAdminUser({
                    branchIds: draft.branchIds,
                    departmentIds: draft.departmentIds,
                    firstName: draft.firstName,
                    id: draft.id,
                    ipRestrictions: draft.ipRestrictions,
                    lastName: draft.lastName,
                    mfaRequired: draft.mfaRequired,
                    organizationId: draft.organizationId,
                    permissionOverrides: draft.permissionOverrides,
                    phone: draft.phone,
                    role: draft.role,
                    status: draft.status,
                    teamIds: draft.teamIds,
                  }),
                ).unwrap();
              } else {
                await dispatch(createOrganizationUser(draft)).unwrap();
              }
              await dispatch(
                loadOrganizationUsers({ organizationId: draft.organizationId }),
              ).unwrap();
              dispatch(
                crmSessionActions.setToast(
                  organizationUserForm.mode === "edit"
                    ? "CRM user updated"
                    : "CRM user created",
                ),
              );
              setOrganizationUserForm(null);
            }}
            row={organizationUserForm.row}
            sourceRecord={findModuleRecordForRow(
              workspace.moduleRecords.users ?? [],
              organizationUserForm.row ?? [],
            )}
            teams={workspace.teams}
            organizations={workspace.organizations}
          />
        ) : null}

        {detail && activeModule ? (
          <RecordDetailModal
            availablePermissions={workspace.moduleRecords.permissions ?? []}
            module={activeModule}
            onArchive={(row) => setArchiveConfirmRow(row)}
            onClose={() => setDetail(null)}
            onEdit={(row) => {
              setDetail(null);
              if (activeModule.id === "organizations") {
                setOrganizationEditRow(row);
                return;
              }
              setRecordForm({ mode: "edit", row });
            }}
            onFollowUp={() => {
              void runAction("Follow-up");
            }}
            row={detail}
            sourceRecord={findModuleRecordForRow(
              getActiveModuleApiRecords(),
              detail,
            )}
            stats={
              activeModule.id === "organizations"
                ? organizationDetailStats
                : undefined
            }
          />
        ) : null}

        {archiveConfirmRow && activeModule ? (
          <ArchiveConfirmModal
            module={activeModule}
            onClose={() => setArchiveConfirmRow(null)}
            onConfirm={async () => {
              const row = archiveConfirmRow;
              setArchiveConfirmRow(null);
              await archiveRow(row);
              if (detail?.join("|") === row.join("|")) {
                setDetail(null);
              }
            }}
            row={archiveConfirmRow}
          />
        ) : null}

        {restoreConfirmRow && activeModule ? (
          <RestoreConfirmModal
            module={activeModule}
            onClose={() => setRestoreConfirmRow(null)}
            onConfirm={async () => {
              const row = restoreConfirmRow;
              setRestoreConfirmRow(null);
              await restoreRow(row);
            }}
            row={restoreConfirmRow}
          />
        ) : null}

        <div className="crm-toast" role="status">
          {toast}
        </div>
      </main>
    </div>
  );
}

function ThemeSwitch({
  onToggle,
  themeMode,
}: {
  onToggle: () => void;
  themeMode: "light" | "dark";
}) {
  const isDark = themeMode === "dark";
  return (
    <button
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`theme-fancy-switch ${isDark ? "is-dark" : "is-light"}`}
      onClick={onToggle}
      title={isDark ? "Dark theme" : "Light theme"}
      type="button"
    >
      <span className="theme-switch-track">
        <span className="theme-switch-thumb">
          <FontAwesomeIcon icon={isDark ? faMoon : faSun} />
        </span>
      </span>
    </button>
  );
}

function ProfileDropdown({
  isOpen,
  onChangePassword,
  onLogout,
  onMyProfile,
  onToggle,
  user,
}: {
  isOpen: boolean;
  onChangePassword: () => void;
  onLogout: () => void;
  onMyProfile: () => void;
  onToggle: () => void;
  user: DemoUser;
}) {
  return (
    <div className="profile-menu">
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="profile-menu-trigger"
        onClick={onToggle}
        type="button"
      >
        <FontAwesomeIcon icon={faUserCircle} />
        <span>{user.name}</span>
      </button>
      {isOpen ? (
        <div className="profile-menu-dropdown" role="menu">
          <button onClick={onMyProfile} role="menuitem" type="button">
            <FontAwesomeIcon icon={faUser} />
            My Profile
          </button>
          <button onClick={onChangePassword} role="menuitem" type="button">
            <FontAwesomeIcon icon={faKey} />
            Change Password
          </button>
          <button onClick={onLogout} role="menuitem" type="button">
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ModulePanel(props: {
  activeContext: DemoContext;
  coverage: ModuleCoverage | null;
  detail: string[] | null;
  filterValues: Record<string, string>;
  module: AdminModule;
  pageSize: number;
  currentPage: number;
  pageStart: number;
  query: string;
  rows: string[][];
  selected: string[];
  selectedCount: number;
  setDetail: (row: string[] | null) => void;
  setFilterValues: (values: Record<string, string>) => void;
  setCurrentPage: (value: number) => void;
  setPageSize: (value: number) => void;
  setQuery: (value: string) => void;
  setSelected: (values: string[]) => void;
  setSort: (value: { column: number; direction: "asc" | "desc" }) => void;
  sort: { column: number; direction: "asc" | "desc" };
  total: number;
  totalPages: number;
  usingServerRows: boolean;
  view: "list" | "grid";
  setView: (view: "list" | "grid") => void;
  openRecordForm: (form: { mode: "create" | "edit"; row?: string[] }) => void;
  archiveRow: (row: string[]) => Promise<void>;
  bulkStatusEnabled: boolean;
  bulkUpdateSelectedStatus: (status: string) => Promise<void>;
  runAction: (label: string) => Promise<void>;
  restoreRow: (row: string[]) => Promise<void>;
  requestRestoreRow: (row: string[]) => void;
}) {
  const module = props.module;
  const isRbacModule = module.id === "roles" || module.id === "permissions";
  const isUserAccessModule = module.id === "users";
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const readinessLabel = props.coverage
    ? formatReadiness(props.coverage)
    : module.status;
  const getVisibleRowId = (row: string[], index: number) =>
    `${props.pageStart + index + 1}:${row.join("|")}`;
  const allVisibleIds = props.rows.map(getVisibleRowId);
  const allSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => props.selected.includes(id));
  const pageNumbers = Array.from(
    { length: Math.min(5, props.totalPages) },
    (_, index) =>
      Math.max(
        1,
        Math.min(
          props.totalPages - Math.min(4, props.totalPages - 1),
          props.currentPage - 2,
        ),
      ) + index,
  ).filter((page, index, pages) => pages.indexOf(page) === index);

  function toggleAll() {
    props.setSelected(allSelected ? [] : allVisibleIds);
  }

  function toggleRow(id: string) {
    props.setSelected(
      props.selected.includes(id)
        ? props.selected.filter((item) => item !== id)
        : [...props.selected, id],
    );
  }

  return (
    <section className="workspace">
      <div className="module-header">
        <div className="module-header-main">
          <div className="module-title-block">
            <Icon name={module.icon ?? "dashboard"} />
            <div>
              <nav className="module-breadcrumbs" aria-label="Breadcrumb">
                <span>
                  <FontAwesomeIcon icon={faHouse} />
                  CRM
                </span>
                <strong>{module.group}</strong>
              </nav>
              <h2>{module.title}</h2>
            </div>
          </div>
          <p>{module.description}</p>
          <div className="module-context-chips">
            <span>{props.activeContext.role.replaceAll("_", " ")}</span>
            <span>{props.activeContext.organization}</span>
            <span>{props.activeContext.branch}</span>
            <strong className={statusClass(readinessLabel)}>
              {readinessLabel}
            </strong>
          </div>
        </div>
        <div className="module-record-summary">
          <div>
            <span>Total Records</span>
            <strong>{props.total}</strong>
          </div>
          <div>
            <span>Selected</span>
            <strong>{props.selectedCount}</strong>
          </div>
          <div>
            <span>Page</span>
            <strong>
              {props.currentPage}/{props.totalPages}
            </strong>
          </div>
        </div>
      </div>

      {module.id === "security" ? (
        <SecurityControlCenter runAction={props.runAction} />
      ) : null}

      {[
        "attendance-students",
        "attendance-staff",
        "timetable",
        "exams",
        "report-cards",
        "transcripts",
      ].includes(module.id) ? (
        <EducationWorkflowPanel
          module={module}
          openRecordForm={props.openRecordForm}
          rows={props.rows}
          runAction={props.runAction}
          selectedCount={props.selectedCount}
        />
      ) : null}

      <div className="navigationlist">
        <div className="action-row">
          {module.actions?.map((action, index) => (
            <button
              className={
                index > 1 ? "btn btn-light secondary" : "btn btn-primary"
              }
              key={action}
              onClick={() =>
                action.toLowerCase() === "create" &&
                !organizationStructureModuleIds.has(module.id)
                  ? props.openRecordForm({ mode: "create" })
                  : void props.runAction(action)
              }
              type="button"
            >
              <Icon
                name={
                  action.toLowerCase().includes("export") ||
                  action.toLowerCase().includes("report")
                    ? "report"
                    : action.toLowerCase().includes("assign")
                      ? "user"
                      : action.toLowerCase().includes("audit")
                        ? "shield"
                        : "check"
                }
              />
              {action}
            </button>
          ))}
          <button
            className="btn btn-light secondary"
            onClick={() => setIsSearchVisible((current) => !current)}
            type="button"
          >
            <Icon name="report" />
            Search
          </button>
          <button
            className="btn btn-light secondary"
            onClick={() => {
              props.setQuery("");
              props.setFilterValues({});
              if (isRbacModule) {
                void props.runAction(`Refresh ${module.title}`);
              }
            }}
            type="button"
          >
            Reset
          </button>
          {props.bulkStatusEnabled && !isRbacModule ? (
            <select
              aria-label="Bulk update selected status"
              className="action-select bulk-status-select"
              disabled={props.selectedCount === 0}
              onChange={(event) => {
                const value = event.target.value;
                event.target.value = "";
                if (value) void props.bulkUpdateSelectedStatus(value);
              }}
            >
              <option value="">Bulk status</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          ) : null}
          <div className="view-toolbar">
            <div className="btn-group btn-group-sm" role="group">
              <button
                className={`btn ${
                  props.view === "list" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => props.setView("list")}
                type="button"
              >
                <FontAwesomeIcon icon={faTableList} />
                List
              </button>
              <button
                className={`btn ${
                  props.view === "grid" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => props.setView("grid")}
                type="button"
              >
                <FontAwesomeIcon icon={faGrip} />
                Grid
              </button>
            </div>
          </div>
        </div>
        {isSearchVisible ? (
          <div className="filter-block">
            <div className="head">Search</div>
            <div className="formblock">
              <label className="formrow wide">
                <span className="label">Global Search</span>
                <input
                  className="input form-control"
                  onChange={(event) => props.setQuery(event.target.value)}
                  placeholder="Search any visible field"
                  value={props.query}
                />
              </label>
              {module.filters.map((filter) => (
                <label className="formrow" key={filter}>
                  <span className="label">{filter}</span>
                  <input
                    className="input form-control"
                    onChange={(event) =>
                      props.setFilterValues({
                        ...props.filterValues,
                        [filter]: event.target.value,
                      })
                    }
                    placeholder={filter}
                    value={props.filterValues[filter] ?? ""}
                  />
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="listmanager">
        <div className="head table-head">
          <span>{module.title} Listing</span>
          <em>
            {props.usingServerRows ? "Live API data" : "Static preview"} /{" "}
            {props.total} matching records
          </em>
        </div>
        {props.view === "list" ? (
          <div className="main-listing-box">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="title-pannel">
                  <th>
                    <input
                      checked={allSelected}
                      onChange={toggleAll}
                      type="checkbox"
                    />
                  </th>
                  <th>
                    <span className="adminDataSort table-static-head">
                      S. No.
                    </span>
                  </th>
                  {module.columns.map((column, index) => (
                    <th key={column}>
                      <button
                        className="adminDataSort"
                        onClick={() =>
                          props.setSort({
                            column: index,
                            direction:
                              props.sort.column === index &&
                              props.sort.direction === "asc"
                                ? "desc"
                                : "asc",
                          })
                        }
                        type="button"
                      >
                        <span>{column}</span>
                        <FontAwesomeIcon
                          icon={
                            props.sort.column === index
                              ? props.sort.direction === "asc"
                                ? faSortUp
                                : faSortDown
                              : faSort
                          }
                        />
                      </button>
                    </th>
                  ))}
                  <th>
                    <span className="adminDataSort table-static-head">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {props.rows.length === 0 ? (
                  <tr>
                    <td
                      className="empty-table-cell"
                      colSpan={props.module.columns.length + 3}
                    >
                      <div className="empty-state-inline">
                        <Icon name="document" />
                        <strong>No data found</strong>
                        <span>
                          No {props.module.title.toLowerCase()} records match
                          the current organization, filters, and search.
                        </span>
                        <button
                          className="btn btn-light btn-sm"
                          onClick={() =>
                            props.openRecordForm({ mode: "create" })
                          }
                          type="button"
                        >
                          {isRbacModule
                            ? `Create ${module.title.slice(0, -1)}`
                            : "Create record"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  props.rows.map((row, rowIndex) => {
                    const id = getVisibleRowId(row, rowIndex);
                    const lifecycleState = getRowLifecycleState(
                      row,
                      isRbacModule,
                      isUserAccessModule,
                    );
                    const isArchived = lifecycleState.isInactive;
                    const activateLabel = isUserAccessModule
                      ? "Activate"
                      : isRbacModule
                        ? "Activate"
                        : "Restore";
                    const inactiveLabel = isUserAccessModule
                      ? "Suspend"
                      : isRbacModule
                        ? "Inactivate"
                        : "Archive";
                    return (
                      <tr
                        className={
                          props.selected.includes(id) ? "selected-row" : ""
                        }
                        key={id}
                      >
                        <td>
                          <input
                            checked={props.selected.includes(id)}
                            onChange={() => toggleRow(id)}
                            type="checkbox"
                          />
                        </td>
                        <td>{props.pageStart + rowIndex + 1}</td>
                        {row.map((value, index) => (
                          <td key={`${id}:cell:${index}`}>
                            {renderCell(value)}
                          </td>
                        ))}
                        <td className="row-actions">
                          <button
                            onClick={() => props.setDetail(row)}
                            type="button"
                          >
                            <Icon name="document" />
                            View
                          </button>
                          <button
                            onClick={() =>
                              props.openRecordForm({ mode: "edit", row })
                            }
                            type="button"
                          >
                            <Icon name="settings" />
                            Edit
                          </button>
                          {isArchived ? (
                            <button
                              className={
                                isRbacModule || isUserAccessModule
                                  ? "row-action-active"
                                  : undefined
                              }
                              onClick={() => {
                                props.requestRestoreRow(row);
                              }}
                              type="button"
                            >
                              <Icon name="check" />
                              {activateLabel}
                            </button>
                          ) : (
                            <button
                              className={
                                isRbacModule || isUserAccessModule
                                  ? "row-action-inactive"
                                  : undefined
                              }
                              onClick={() => {
                                void props.archiveRow(row);
                              }}
                              type="button"
                            >
                              <Icon name="shield" />
                              {inactiveLabel}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="record-grid">
            {props.rows.length === 0 ? (
              <div className="empty-state-inline empty-grid-state">
                <Icon name="document" />
                <strong>No data found</strong>
                <span>
                  No {props.module.title.toLowerCase()} records match the
                  current organization, filters, and search.
                </span>
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => props.openRecordForm({ mode: "create" })}
                  type="button"
                >
                  Create record
                </button>
              </div>
            ) : (
              props.rows.map((row, rowIndex) => {
                const id = getVisibleRowId(row, rowIndex);
                const lifecycleState = getRowLifecycleState(
                  row,
                  isRbacModule,
                  isUserAccessModule,
                );
                const isArchived = lifecycleState.isInactive;
                const activateLabel = isUserAccessModule
                  ? "Activate"
                  : isRbacModule
                    ? "Activate"
                    : "Restore";
                const inactiveLabel = isUserAccessModule
                  ? "Suspend"
                  : isRbacModule
                    ? "Inactivate"
                    : "Archive";
                return (
                  <article
                    className={`record-card ${
                      props.selected.includes(id) ? "selected-row" : ""
                    }`}
                    key={id}
                  >
                    <div className="record-card-head">
                      <input
                        checked={props.selected.includes(id)}
                        onChange={() => toggleRow(id)}
                        type="checkbox"
                      />
                      <strong>{row[0]}</strong>
                    </div>
                    <dl>
                      {module.columns.slice(1, 6).map((column, index) => (
                        <div key={column}>
                          <dt>{column}</dt>
                          <dd>{renderCell(row[index + 1] ?? "-")}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="record-card-actions">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => props.setDetail(row)}
                        type="button"
                      >
                        View
                      </button>
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() =>
                          props.openRecordForm({ mode: "edit", row })
                        }
                        type="button"
                      >
                        Edit
                      </button>
                      {isArchived ? (
                        <button
                          className={`btn btn-sm ${
                            isRbacModule || isUserAccessModule
                              ? "row-action-active"
                              : "btn-light"
                          }`}
                          onClick={() => {
                            props.requestRestoreRow(row);
                          }}
                          type="button"
                        >
                          <Icon name="check" />
                          {activateLabel}
                        </button>
                      ) : (
                        <button
                          className={`btn btn-sm ${
                            isRbacModule || isUserAccessModule
                              ? "row-action-inactive"
                              : "btn-light"
                          }`}
                          onClick={() => {
                            void props.archiveRow(row);
                          }}
                          type="button"
                        >
                          <Icon name="shield" />
                          {inactiveLabel}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
        <div className="pagination-bar">
          <div className="pagination-actions" aria-label="Listing pagination">
            <button
              aria-label="First page"
              className="pagination-icon"
              disabled={props.currentPage <= 1}
              onClick={() => props.setCurrentPage(1)}
              type="button"
            >
              <FontAwesomeIcon icon={faAnglesLeft} />
            </button>
            <button
              aria-label="Previous page"
              className="pagination-icon"
              disabled={props.currentPage <= 1}
              onClick={() =>
                props.setCurrentPage(Math.max(1, props.currentPage - 1))
              }
              type="button"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            {pageNumbers.map((page) => (
              <button
                aria-current={page === props.currentPage ? "page" : undefined}
                className={`pagination-page ${
                  page === props.currentPage ? "selected" : ""
                }`}
                key={page}
                onClick={() => props.setCurrentPage(page)}
                type="button"
              >
                {page}
              </button>
            ))}
            <button
              aria-label="Next page"
              className="pagination-icon"
              disabled={props.currentPage >= props.totalPages}
              onClick={() =>
                props.setCurrentPage(
                  Math.min(props.totalPages, props.currentPage + 1),
                )
              }
              type="button"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button
              aria-label="Last page"
              className="pagination-icon"
              disabled={props.currentPage >= props.totalPages}
              onClick={() => props.setCurrentPage(props.totalPages)}
              type="button"
            >
              <FontAwesomeIcon icon={faAnglesRight} />
            </button>
            <label className="page-size-control">
              <select
                aria-label="Rows per page"
                className="form-select form-select-sm"
                onChange={(event) =>
                  props.setPageSize(Number(event.target.value))
                }
                value={props.pageSize}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
          <span className="pagination-total">
            Page {props.currentPage} of {props.totalPages} / {props.total}{" "}
            records
          </span>
        </div>
      </div>
    </section>
  );
}

function getRecordStatus(row: string[]) {
  return (
    row.find((value) =>
      [
        "active",
        "open",
        "in progress",
        "in_progress",
        "review",
        "under review",
        "completed",
        "archived",
        "inactive",
        "trial",
        "suspended",
        "cancelled",
        "blocked",
      ].includes(value.toLowerCase()),
    ) ?? "Active"
  );
}

function getRowLifecycleState(
  row: string[],
  isRbacModule: boolean,
  isUserAccessModule: boolean,
) {
  const inactiveValues = isRbacModule
    ? ["inactive"]
    : isUserAccessModule
      ? ["inactive", "suspended", "blocked"]
      : ["archived"];
  return {
    isInactive: row.some((value) =>
      inactiveValues.includes(value.toLowerCase()),
    ),
  };
}

function RecordDetailModal({
  availablePermissions,
  module,
  onArchive,
  onClose,
  onEdit,
  onFollowUp,
  row,
  sourceRecord,
  stats,
}: {
  availablePermissions?: unknown[];
  module: AdminModule;
  onArchive: (row: string[]) => void;
  onClose: () => void;
  onEdit: (row: string[]) => void;
  onFollowUp: () => void;
  row: string[];
  sourceRecord?: unknown;
  stats?: Array<{ label: string; value: number | string }>;
}) {
  const status = getRecordStatus(row);
  const isRbacModule = module.id === "roles" || module.id === "permissions";
  const isArchived = row.some((value) =>
    isRbacModule
      ? value.toLowerCase() === "inactive"
      : value.toLowerCase() === "archived",
  );
  const visibleColumns = module.columns.filter(
    (column) =>
      column.toLowerCase() !== "status" &&
      !(module.id === "roles" && column.toLowerCase() === "permissions"),
  );
  const primaryFields = visibleColumns.slice(0, 3);
  const remainingFields = visibleColumns.slice(3);
  const canCreateFollowUp = new Set([
    "leads",
    "follow-ups",
    "tasks",
    "applications",
    "admissions",
    "call-center",
  ]).has(module.id);
  const rolePermissionNames = getRolePermissionNames(sourceRecord);

  return (
    <div className="modal-backdrop-layer" role="presentation">
      <section
        aria-labelledby="record-detail-title"
        aria-modal="true"
        className="record-modal record-detail-modal"
        role="dialog"
      >
        <div className="record-modal-head enterprise-modal-head">
          <div className="modal-title-cluster">
            <div className="modal-icon-shell">
              <Icon name={module.icon ?? "document"} />
            </div>
            <div>
              <span className="eyebrow">{module.group}</span>
              <h3 id="record-detail-title">
                {row[0] || `${module.title} Record`}
              </h3>
              <p>
                {module.id === "organizations"
                  ? "Organization registry, lifecycle, and hierarchy overview."
                  : isRbacModule
                    ? "RBAC catalogue record, access lifecycle, and guard usage context."
                    : `${module.title} record overview and operational context.`}
              </p>
            </div>
          </div>
          <button
            className="btn btn-light btn-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="record-detail-summary">
          <div>
            <span>Status</span>
            <strong className={statusClass(status as ModuleStatus)}>
              {formatStatus(status)}
            </strong>
          </div>
          {stats?.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="record-detail-grid">
          {primaryFields.map((column, index) => (
            <div className="record-detail-card" key={column}>
              <span>{column}</span>
              <strong>
                {renderCell(row[module.columns.indexOf(column)] ?? "-")}
              </strong>
            </div>
          ))}
        </div>

        <div className="record-detail-section">
          <div className="section-title-row">
            <h4>Record Information</h4>
            <span>{remainingFields.length} additional fields</span>
          </div>
          <dl className="detail-definition-list">
            {remainingFields.map((column, offset) => {
              const index = module.columns.indexOf(column);
              return (
                <div key={column}>
                  <dt>{column}</dt>
                  <dd>{renderCell(row[index] ?? "-")}</dd>
                </div>
              );
            })}
          </dl>
        </div>

        {module.id === "roles" ? (
          <PermissionMappingSection
            assignedPermissionNames={rolePermissionNames}
            availablePermissions={availablePermissions ?? []}
            readonly
          />
        ) : null}

        <div className="record-modal-actions">
          {canCreateFollowUp ? (
            <button
              className="btn btn-light"
              onClick={onFollowUp}
              type="button"
            >
              <Icon name="task" />
              Create Follow-up
            </button>
          ) : null}
          {!isRbacModule ? (
            <button
              className="btn btn-light"
              onClick={() => onEdit(row)}
              type="button"
            >
              <Icon name="settings" />
              Edit
            </button>
          ) : null}
          {!isArchived && !isRbacModule ? (
            <button
              className="btn btn-danger-soft"
              onClick={() => onArchive(row)}
              type="button"
            >
              <Icon name="shield" />
              {isRbacModule ? "Delete" : "Archive"}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ArchiveConfirmModal({
  module,
  onClose,
  onConfirm,
  row,
}: {
  module: AdminModule;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  row: string[];
}) {
  const [isArchiving, setIsArchiving] = useState(false);
  const isRbacModule = module.id === "roles" || module.id === "permissions";

  async function confirmArchive() {
    setIsArchiving(true);
    await onConfirm();
    setIsArchiving(false);
  }

  return (
    <div className="modal-backdrop-layer" role="presentation">
      <section
        aria-labelledby="archive-confirm-title"
        aria-modal="true"
        className="record-modal archive-confirm-modal"
        role="dialog"
      >
        <div className="record-modal-head enterprise-modal-head">
          <div className="modal-title-cluster">
            <div className="modal-icon-shell danger">
              <Icon name="shield" />
            </div>
            <div>
              <span className="eyebrow">
                {isRbacModule
                  ? "Inactivate Confirmation"
                  : "Archive Confirmation"}
              </span>
              <h3 id="archive-confirm-title">
                {isRbacModule ? "Inactivate" : "Archive"} this {module.title}{" "}
                record?
              </h3>
              <p>
                This keeps the record in history and marks it inactive. It does
                not permanently delete database history.
              </p>
            </div>
          </div>
          <button
            className="btn btn-light btn-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="archive-record-preview">
          <span>Selected record</span>
          <strong>{row[0] || `${module.title} Record`}</strong>
          <p>{row.slice(1, 4).filter(Boolean).join(" / ")}</p>
        </div>

        <div className="record-modal-actions">
          <button
            className="btn btn-light"
            disabled={isArchiving}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn-danger-soft"
            disabled={isArchiving}
            onClick={() => {
              void confirmArchive();
            }}
            type="button"
          >
            {isArchiving
              ? isRbacModule
                ? "Inactivating..."
                : "Archiving..."
              : isRbacModule
                ? "Inactivate Record"
                : "Archive Record"}
          </button>
        </div>
      </section>
    </div>
  );
}

function RestoreConfirmModal({
  module,
  onClose,
  onConfirm,
  row,
}: {
  module: AdminModule;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  row: string[];
}) {
  const [isRestoring, setIsRestoring] = useState(false);
  const isRbacModule = module.id === "roles" || module.id === "permissions";
  const isUserAccessModule = module.id === "users";
  const actionLabel = isRbacModule ? "Activate" : "Restore";
  const effectiveActionLabel = isUserAccessModule ? "Activate" : actionLabel;

  async function confirmRestore() {
    setIsRestoring(true);
    await onConfirm();
    setIsRestoring(false);
  }

  return (
    <div className="modal-backdrop-layer" role="presentation">
      <section
        aria-labelledby="restore-confirm-title"
        aria-modal="true"
        className="record-modal archive-confirm-modal"
        role="dialog"
      >
        <div className="record-modal-head enterprise-modal-head">
          <div className="modal-title-cluster">
            <div className="modal-icon-shell success">
              <Icon name="check" />
            </div>
            <div>
              <span className="eyebrow">
                {effectiveActionLabel} Confirmation
              </span>
              <h3 id="restore-confirm-title">
                {effectiveActionLabel} this {module.title} record?
              </h3>
              <p>
                {isRbacModule
                  ? "This will move the record back into the active RBAC catalogue and make it available for access configuration."
                  : isUserAccessModule
                    ? "This will restore the user to active access and allow them to sign in according to their memberships and permissions."
                    : "This will move the record back into active workflows."}
              </p>
            </div>
          </div>
          <button
            className="btn btn-light btn-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="archive-record-preview">
          <span>Selected record</span>
          <strong>{row[0] || `${module.title} Record`}</strong>
          <p>{row.slice(1, 4).filter(Boolean).join(" / ")}</p>
        </div>

        <div className="record-modal-actions">
          <button
            className="btn btn-light"
            disabled={isRestoring}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={isRestoring}
            onClick={() => {
              void confirmRestore();
            }}
            type="button"
          >
            {isRestoring
              ? `${effectiveActionLabel}...`
              : `${effectiveActionLabel} Record`}
          </button>
        </div>
      </section>
    </div>
  );
}

function PermissionMappingSection({
  assignedPermissionIds,
  assignedPermissionNames,
  availablePermissions,
  onToggle,
  readonly = false,
}: {
  assignedPermissionIds?: string[];
  assignedPermissionNames?: string[];
  availablePermissions: unknown[];
  onToggle?: (permissionId: string) => void;
  readonly?: boolean;
}) {
  const assignedIds = new Set(assignedPermissionIds ?? []);
  const assignedNames = new Set(assignedPermissionNames ?? []);
  const groupedPermissions = availablePermissions.reduce<
    Record<string, Array<{ id: string; module: string; name: string }>>
  >((groups, item) => {
    const object =
      item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const id = getUnknownRecordId(object);
    const name = typeof object.name === "string" ? object.name : "";
    const module =
      typeof object.module === "string"
        ? object.module
        : name.split(":")[0] || "general";
    if (!id || !name) return groups;
    groups[module] = [...(groups[module] ?? []), { id, module, name }];
    return groups;
  }, {});
  const modules = Object.keys(groupedPermissions).sort();

  return (
    <section className="permission-map-section">
      <div className="section-title-row">
        <h4>Permission Mapping</h4>
        <span>
          {readonly ? "Assigned permissions" : "Select role permissions"}
        </span>
      </div>
      {modules.length === 0 ? (
        <div className="permission-map-empty">No permissions available</div>
      ) : (
        <div className="permission-map-grid">
          {modules.map((moduleName) => (
            <article className="permission-map-group" key={moduleName}>
              <strong>{moduleName}</strong>
              <div>
                {groupedPermissions[moduleName].map((permission) => {
                  const checked =
                    assignedIds.has(permission.id) ||
                    assignedNames.has(permission.name);
                  if (readonly && !checked) return null;
                  return (
                    <label
                      className={`permission-map-item ${
                        checked ? "selected" : ""
                      }`}
                      key={permission.id}
                    >
                      {readonly ? null : (
                        <input
                          checked={checked}
                          onChange={() => onToggle?.(permission.id)}
                          type="checkbox"
                        />
                      )}
                      <span>{permission.name}</span>
                    </label>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function EducationWorkflowPanel({
  module,
  openRecordForm,
  rows,
  runAction,
  selectedCount,
}: {
  module: AdminModule;
  openRecordForm: (form: { mode: "create"; row?: string[] }) => void;
  rows: string[][];
  runAction: (label: string) => Promise<void>;
  selectedCount: number;
}) {
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const isAttendance =
    module.id === "attendance-students" || module.id === "attendance-staff";
  const primaryAction =
    module.id === "timetable"
      ? "Create Timetable Slot"
      : module.id === "exams"
        ? "Create Exam"
        : module.id === "report-cards"
          ? "Generate Report Card"
          : module.id === "transcripts"
            ? "Issue Transcript"
            : "Create Attendance";

  return (
    <section className="navigationlist education-workflow-panel">
      <div className="head table-head">
        <span>
          {module.id === "timetable"
            ? "Weekly Schedule Board"
            : module.id === "exams"
              ? "Exam Control Desk"
              : module.id === "report-cards"
                ? "Report Card Generator"
                : module.id === "transcripts"
                  ? "Transcript Issuing"
                  : "Attendance Console"}
        </span>
        <em>
          {selectedCount > 0
            ? `${selectedCount} selected`
            : rows.length > 0
              ? `${rows.length} visible records`
              : "Ready for live records"}
        </em>
      </div>

      {module.id === "timetable" ? (
        <div className="calendar-grid">
          {weekDays.map((day) => {
            const dayRows = rows.filter((row) =>
              row.join(" ").toLowerCase().includes(day.toLowerCase()),
            );
            return (
              <article className="grid-card" key={day}>
                <strong>{day}</strong>
                {dayRows.length > 0 ? (
                  dayRows.slice(0, 3).map((row, index) => (
                    <span className="timeline-chip" key={`${day}-${index}`}>
                      {row[5] || row[0]} - {row[6] || row[1] || "Slot"}
                    </span>
                  ))
                ) : (
                  <span className="muted">No slot visible</span>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="workflow-card-grid">
          <article className="grid-card">
            <strong>{isAttendance ? "Roster" : "Source Records"}</strong>
            <span>{rows.length} visible</span>
            <small>
              {isAttendance
                ? "Select rows for bulk marking or create a single entry."
                : "Use selected or first visible API record for workflow actions."}
            </small>
          </article>
          <article className="grid-card">
            <strong>Status</strong>
            <span>
              {rows.length > 0 ? "Live table synced" : "No records yet"}
            </span>
            <small>
              {module.id === "exams"
                ? "Publish requires an existing exam record."
                : module.id === "report-cards"
                  ? "Generate requires a valid student id."
                  : module.id === "transcripts"
                    ? "Issue requires an existing transcript."
                    : "Bulk mark requires selected student ids."}
            </small>
          </article>
          <article className="grid-card">
            <strong>Audit</strong>
            <span>Guarded API</span>
            <small>
              Actions run through organization-scoped admin endpoints.
            </small>
          </article>
        </div>
      )}

      <div className="action-row compact">
        <button
          className="btn btn-primary"
          onClick={() =>
            primaryAction.toLowerCase().startsWith("create")
              ? openRecordForm({ mode: "create" })
              : void runAction(primaryAction)
          }
          type="button"
        >
          <Icon name={module.icon ?? "graduation"} />
          {primaryAction}
        </button>
        {module.id === "attendance-students" ? (
          <button
            className="btn btn-light secondary"
            disabled={selectedCount === 0}
            onClick={() => void runAction("Bulk Mark Present")}
            type="button"
          >
            <Icon name="check" />
            Bulk Mark Present
          </button>
        ) : null}
        {module.id === "timetable" ? (
          <button
            className="btn btn-light secondary"
            onClick={() => void runAction("Check Conflicts")}
            type="button"
          >
            <Icon name="shield" />
            Check Conflicts
          </button>
        ) : null}
        {module.id === "exams" ? (
          <button
            className="btn btn-light secondary"
            onClick={() => void runAction("Publish Results")}
            type="button"
          >
            <Icon name="report" />
            Publish Results
          </button>
        ) : null}
        <button
          className="btn btn-light secondary"
          onClick={() => void runAction(`Export ${module.title}`)}
          type="button"
        >
          <Icon name="report" />
          Export
        </button>
      </div>
    </section>
  );
}

function RecordFormModal({
  availablePermissions,
  module,
  onClose,
  onSubmit,
  row,
  sourceRecord,
}: {
  availablePermissions?: unknown[];
  module: AdminModule;
  onClose: () => void;
  onSubmit: (draft: ModuleRecordDraft) => Promise<void>;
  row?: string[];
  sourceRecord?: unknown;
}) {
  const editableColumns = getEditableModuleColumns(module);
  const isRbacModule = module.id === "roles" || module.id === "permissions";
  const [title, setTitle] = useState(row?.[0] ?? "");
  const [description, setDescription] = useState(
    isRbacModule ? (row?.[module.columns.indexOf("Description")] ?? "") : "",
  );
  const [status, setStatus] = useState(
    isRbacModule
      ? row?.some((value) => value.toLowerCase() === "inactive")
        ? "inactive"
        : "active"
      : "open",
  );
  const [priority, setPriority] = useState("medium");
  const [dueAt, setDueAt] = useState("");
  const [payload, setPayload] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      editableColumns.map((column) => {
        const rowIndex = module.columns.indexOf(column);
        return [
          toPayloadKey(column),
          rowIndex >= 0 ? (row?.[rowIndex] ?? "") : "",
        ];
      }),
    ),
  );
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(() =>
    getRolePermissionIds(sourceRecord),
  );
  const [isSaving, setIsSaving] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setIsSaving(true);
    await onSubmit({
      description,
      dueAt: dueAt || undefined,
      moduleKey: module.id,
      payload:
        module.id === "roles"
          ? { ...payload, permissions: selectedPermissions.join(",") }
          : payload,
      priority,
      status,
      title: title.trim(),
    });
    setIsSaving(false);
  }

  return (
    <div className="modal-backdrop-layer" role="presentation">
      <section
        aria-modal="true"
        className="record-modal"
        role="dialog"
        aria-labelledby="record-form-title"
      >
        <div className="record-modal-head">
          <div>
            <span className="eyebrow">{module.group}</span>
            <h3 id="record-form-title">
              {row ? "Edit" : "Create"}{" "}
              {isRbacModule
                ? module.title.slice(0, -1)
                : `${module.title} Record`}
            </h3>
          </div>
          <button
            className="btn btn-light btn-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="record-form-grid">
          <label className="formrow wide">
            <span className="label">
              {module.id === "permissions"
                ? "Permission"
                : module.id === "roles"
                  ? "Role"
                  : "Title"}
            </span>
            <input
              className="input form-control"
              onChange={(event) => setTitle(event.target.value)}
              placeholder={
                module.id === "permissions" ? "module:action" : undefined
              }
              value={title}
            />
          </label>
          {module.id === "permissions" ? (
            <label className="formrow">
              <span className="label">Module</span>
              <input
                className="input form-control"
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    module: event.target.value,
                  }))
                }
                value={payload.module ?? ""}
              />
            </label>
          ) : null}
          <label className="formrow wide">
            <span className="label">Description</span>
            <textarea
              className="input form-control record-textarea"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </label>
          {isRbacModule ? (
            <div className="formrow">
              <span className="label">Status</span>
              <div className="radio-pill-group">
                {["active", "inactive"].map((option) => (
                  <label className="radio-pill" key={option}>
                    <input
                      checked={status === option}
                      onChange={() => setStatus(option)}
                      name="rbac-status"
                      type="radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <>
              <label className="formrow">
                <span className="label">Status</span>
                <select
                  className="form-select form-select-sm"
                  onChange={(event) => setStatus(event.target.value)}
                  value={status}
                >
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label className="formrow">
                <span className="label">Priority</span>
                <select
                  className="form-select form-select-sm"
                  onChange={(event) => setPriority(event.target.value)}
                  value={priority}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
              <label className="formrow">
                <span className="label">Due Date</span>
                <input
                  className="input form-control"
                  onChange={(event) => setDueAt(event.target.value)}
                  type="date"
                  value={dueAt}
                />
              </label>
            </>
          )}
          {module.id === "roles" ? (
            <PermissionMappingSection
              assignedPermissionIds={selectedPermissions}
              availablePermissions={availablePermissions ?? []}
              onToggle={(permissionId) =>
                setSelectedPermissions((current) =>
                  current.includes(permissionId)
                    ? current.filter((id) => id !== permissionId)
                    : [...current, permissionId],
                )
              }
            />
          ) : null}
          {editableColumns
            .filter(
              (column) =>
                !(
                  isRbacModule &&
                  ["Description", "Module", "Permissions"].includes(column)
                ),
            )
            .map((column) => {
              const key = toPayloadKey(column);
              return (
                <label className="formrow" key={column}>
                  <span className="label">{column}</span>
                  <input
                    className="input form-control"
                    onChange={(event) =>
                      setPayload((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    value={payload[key] ?? ""}
                  />
                </label>
              );
            })}
        </div>

        <div className="record-modal-actions">
          <button className="btn btn-light" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!title.trim() || isSaving}
            onClick={submit}
            type="button"
          >
            {isSaving ? "Saving..." : "Save Record"}
          </button>
        </div>
      </section>
    </div>
  );
}

function OrganizationFormModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (draft: OrganizationDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<OrganizationDraft>({
    academicYear: "",
    address: {
      city: "",
      country: "India",
      line1: "",
      line2: "",
      postalCode: "",
      state: "",
    },
    branchCity: "",
    branchCode: "",
    branchName: "",
    branchState: "",
    code: "",
    currency: "INR",
    customDomain: "",
    dateFormat: "DD/MM/YYYY",
    financialYear: "",
    legalName: "",
    locale: "en-IN",
    logoUrl: "",
    name: "",
    primaryEmail: "",
    primaryDomain: "",
    primaryPhone: "",
    registrationNumber: "",
    status: "trial",
    subdomain: "",
    subscription: {
      billingCycle: "monthly",
      enabledModules: [],
      leadLimit: 1000,
      plan: "starter",
      storageLimitGb: 10,
      userLimit: 25,
    },
    taxNumber: "",
    timezone: "Asia/Kolkata",
    type: "coaching",
    website: "",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit() {
    const code = draft.code?.trim() ?? "";
    const branchName = draft.branchName?.trim() ?? "";
    const branchCode = draft.branchCode?.trim() ?? "";
    if (!draft.name.trim() || !code || !branchName || !branchCode) return;
    setIsSaving(true);
    setError("");
    try {
      await onSubmit({
        ...draft,
        branchCity: draft.branchCity?.trim() || undefined,
        branchCode: branchCode.toUpperCase(),
        branchName,
        branchState: draft.branchState?.trim() || undefined,
        code: code.toUpperCase(),
        customDomain: draft.customDomain?.trim() || undefined,
        legalName: draft.legalName?.trim() || undefined,
        logoUrl: draft.logoUrl?.trim() || undefined,
        name: draft.name.trim(),
        primaryEmail: draft.primaryEmail?.trim() || undefined,
        primaryDomain: draft.primaryDomain?.trim() || undefined,
        primaryPhone: draft.primaryPhone?.trim() || undefined,
        registrationNumber: draft.registrationNumber?.trim() || undefined,
        subdomain: draft.subdomain?.trim() || undefined,
        taxNumber: draft.taxNumber?.trim() || undefined,
        website: draft.website?.trim() || undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Organization creation failed",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop-layer" role="presentation">
      <section className="record-modal" role="dialog" aria-modal="true">
        <div className="record-modal-head">
          <div>
            <span className="eyebrow">Organization Management</span>
            <h3>Create Organization</h3>
          </div>
          <button
            className="btn btn-light btn-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="record-form-grid">
          <div className="form-section-title wide">Basic information</div>
          <label className="formrow wide">
            <span className="label">Organization Name</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })
              }
              value={draft.name}
            />
          </label>
          <label className="formrow wide">
            <span className="label">Legal Name</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, legalName: event.target.value })
              }
              value={draft.legalName}
            />
          </label>
          <label className="formrow">
            <span className="label">Code</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, code: event.target.value })
              }
              value={draft.code}
            />
          </label>
          <label className="formrow">
            <span className="label">Type</span>
            <select
              className="form-select form-select-sm"
              onChange={(event) =>
                setDraft({ ...draft, type: event.target.value })
              }
              value={draft.type}
            >
              <option value="coaching">Coaching</option>
              <option value="school">School</option>
              <option value="college">College</option>
              <option value="university">University</option>
              <option value="edtech">EdTech</option>
              <option value="study_abroad">Study abroad</option>
              <option value="training">Training</option>
            </select>
          </label>
          <label className="formrow">
            <span className="label">Logo URL</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, logoUrl: event.target.value })
              }
              value={draft.logoUrl}
            />
          </label>
          <label className="formrow">
            <span className="label">Website</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, website: event.target.value })
              }
              value={draft.website}
            />
          </label>
          <label className="formrow">
            <span className="label">Registration Number</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, registrationNumber: event.target.value })
              }
              value={draft.registrationNumber}
            />
          </label>
          <label className="formrow">
            <span className="label">Tax Number</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, taxNumber: event.target.value })
              }
              value={draft.taxNumber}
            />
          </label>
          <label className="formrow">
            <span className="label">Primary Email</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, primaryEmail: event.target.value })
              }
              type="email"
              value={draft.primaryEmail}
            />
          </label>
          <label className="formrow">
            <span className="label">Primary Phone</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, primaryPhone: event.target.value })
              }
              value={draft.primaryPhone}
            />
          </label>
          <div className="form-section-title wide">Address</div>
          {[
            ["line1", "Address Line 1"],
            ["line2", "Address Line 2"],
            ["country", "Country"],
            ["state", "State"],
            ["city", "City"],
            ["postalCode", "Postal Code"],
          ].map(([key, label]) => (
            <label className="formrow" key={key}>
              <span className="label">{label}</span>
              <input
                className="input form-control"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    address: {
                      ...(draft.address ?? {}),
                      [key]: event.target.value,
                    },
                  })
                }
                value={draft.address?.[key] ?? ""}
              />
            </label>
          ))}
          <div className="form-section-title wide">Platform configuration</div>
          <label className="formrow">
            <span className="label">Primary Domain</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, primaryDomain: event.target.value })
              }
              placeholder="academy.mentora.test"
              value={draft.primaryDomain}
            />
          </label>
          <label className="formrow">
            <span className="label">Subdomain</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, subdomain: event.target.value })
              }
              value={draft.subdomain}
            />
          </label>
          <label className="formrow">
            <span className="label">Custom Domain</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, customDomain: event.target.value })
              }
              value={draft.customDomain}
            />
          </label>
          {[
            ["timezone", "Timezone"],
            ["currency", "Currency"],
            ["locale", "Locale"],
            ["dateFormat", "Date Format"],
            ["financialYear", "Financial Year"],
            ["academicYear", "Academic Year"],
          ].map(([key, label]) => (
            <label className="formrow" key={key}>
              <span className="label">{label}</span>
              <input
                className="input form-control"
                onChange={(event) =>
                  setDraft({ ...draft, [key]: event.target.value })
                }
                value={String(draft[key as keyof OrganizationDraft] ?? "")}
              />
            </label>
          ))}
          <div className="form-section-title wide">Subscription</div>
          {[
            ["plan", "Plan"],
            ["billingCycle", "Billing Cycle"],
            ["userLimit", "User Limit"],
            ["leadLimit", "Lead Limit"],
            ["storageLimitGb", "Storage Limit GB"],
          ].map(([key, label]) => (
            <label className="formrow" key={key}>
              <span className="label">{label}</span>
              <input
                className="input form-control"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    subscription: {
                      ...(draft.subscription ?? {}),
                      [key]: [
                        "userLimit",
                        "leadLimit",
                        "storageLimitGb",
                      ].includes(key)
                        ? Number(event.target.value)
                        : event.target.value,
                    },
                  })
                }
                type={
                  ["userLimit", "leadLimit", "storageLimitGb"].includes(key)
                    ? "number"
                    : "text"
                }
                value={String(draft.subscription?.[key] ?? "")}
              />
            </label>
          ))}
          <label className="formrow">
            <span className="label">Status</span>
            <select
              className="form-select form-select-sm"
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value })
              }
              value={draft.status}
            >
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="payment_overdue">Payment overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <div className="form-section-title wide">Default branch</div>
          <label className="formrow wide">
            <span className="label">Default Branch Name</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, branchName: event.target.value })
              }
              placeholder="Main Branch"
              value={draft.branchName}
            />
          </label>
          <label className="formrow">
            <span className="label">Branch Code</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, branchCode: event.target.value })
              }
              placeholder="MAIN"
              value={draft.branchCode}
            />
          </label>
          <label className="formrow">
            <span className="label">City</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, branchCity: event.target.value })
              }
              value={draft.branchCity}
            />
          </label>
          <label className="formrow">
            <span className="label">State</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, branchState: event.target.value })
              }
              value={draft.branchState}
            />
          </label>
        </div>
        {error ? <div className="auth-error modal-error">{error}</div> : null}
        <div className="record-modal-actions">
          <button className="btn btn-light" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={
              !draft.name.trim() ||
              !draft.code?.trim() ||
              !draft.branchName?.trim() ||
              !draft.branchCode?.trim() ||
              isSaving
            }
            onClick={() => {
              void submit();
            }}
            type="button"
          >
            {isSaving ? "Creating" : "Create Organization"}
          </button>
        </div>
      </section>
    </div>
  );
}

function OrganizationEditModal({
  organizations,
  onClose,
  onSubmit,
  row,
}: {
  organizations: unknown[];
  onClose: () => void;
  onSubmit: (draft: OrganizationDraft & { id: string }) => Promise<void>;
  row: string[];
}) {
  const organizationId = findOrganizationIdByName(organizations, row[0]);
  const source = normalizeResponseObject(
    organizations.find(
      (record) => getUnknownRecordId(record) === organizationId,
    ),
  );
  const [draft, setDraft] = useState<OrganizationDraft & { id: string }>({
    address: normalizeResponseObject(source.address) as Record<string, string>,
    academicYear:
      typeof source.academicYear === "string" ? source.academicYear : "",
    code: typeof source.code === "string" ? source.code : "",
    currency: typeof source.currency === "string" ? source.currency : "INR",
    customDomain:
      typeof source.customDomain === "string" ? source.customDomain : "",
    dateFormat:
      typeof source.dateFormat === "string" ? source.dateFormat : "DD/MM/YYYY",
    financialYear:
      typeof source.financialYear === "string" ? source.financialYear : "",
    id: organizationId,
    legalName: typeof source.legalName === "string" ? source.legalName : "",
    locale: typeof source.locale === "string" ? source.locale : "en-IN",
    logoUrl: typeof source.logoUrl === "string" ? source.logoUrl : "",
    name: typeof source.name === "string" ? source.name : (row[0] ?? ""),
    primaryEmail:
      typeof source.primaryEmail === "string" ? source.primaryEmail : "",
    primaryDomain:
      typeof source.primaryDomain === "string" ? source.primaryDomain : "",
    primaryPhone:
      typeof source.primaryPhone === "string" ? source.primaryPhone : "",
    registrationNumber:
      typeof source.registrationNumber === "string"
        ? source.registrationNumber
        : "",
    subdomain: typeof source.subdomain === "string" ? source.subdomain : "",
    subscription: normalizeResponseObject(source.subscription),
    taxNumber: typeof source.taxNumber === "string" ? source.taxNumber : "",
    timezone:
      typeof source.timezone === "string" ? source.timezone : "Asia/Kolkata",
    type:
      typeof source.type === "string"
        ? source.type
        : row[2]?.toLowerCase().replaceAll(" ", "_") || "coaching",
    website: typeof source.website === "string" ? source.website : "",
  });
  const [status, setStatus] = useState(
    typeof source.status === "string" ? source.status : row[3] || "active",
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit() {
    if (!draft.id || !draft.name.trim()) {
      setError("Organization name is required");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSubmit({
        ...draft,
        customDomain: draft.customDomain?.trim() || undefined,
        legalName: draft.legalName?.trim() || undefined,
        logoUrl: draft.logoUrl?.trim() || undefined,
        name: draft.name.trim(),
        primaryEmail: draft.primaryEmail?.trim() || undefined,
        primaryDomain: draft.primaryDomain?.trim() || undefined,
        primaryPhone: draft.primaryPhone?.trim() || undefined,
        registrationNumber: draft.registrationNumber?.trim() || undefined,
        status,
        subdomain: draft.subdomain?.trim() || undefined,
        taxNumber: draft.taxNumber?.trim() || undefined,
        type: draft.type,
        website: draft.website?.trim() || undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Organization update failed",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop-layer" role="presentation">
      <section className="record-modal" role="dialog" aria-modal="true">
        <div className="record-modal-head enterprise-modal-head">
          <div className="modal-title-cluster">
            <div className="modal-icon-shell">
              <Icon name="building" />
            </div>
            <div>
              <span className="eyebrow">Organization Registry</span>
              <h3>Edit Organization</h3>
              <p>
                Update organization identity, type, domain, and lifecycle
                status.
              </p>
            </div>
          </div>
          <button
            className="btn btn-light btn-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="record-form-grid">
          <div className="form-section-title wide">Basic information</div>
          <label className="formrow wide">
            <span className="label">Organization Name</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })
              }
              value={draft.name}
            />
          </label>
          <label className="formrow wide">
            <span className="label">Legal Name</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, legalName: event.target.value })
              }
              value={draft.legalName ?? ""}
            />
          </label>
          <label className="formrow">
            <span className="label">Code</span>
            <input
              className="input form-control"
              disabled
              value={draft.code ?? ""}
            />
          </label>
          <label className="formrow">
            <span className="label">Type</span>
            <select
              className="form-select form-select-sm"
              onChange={(event) =>
                setDraft({ ...draft, type: event.target.value })
              }
              value={draft.type}
            >
              <option value="coaching">Coaching</option>
              <option value="school">School</option>
              <option value="college">College</option>
              <option value="university">University</option>
              <option value="edtech">EdTech</option>
              <option value="study_abroad">Study abroad</option>
              <option value="training">Training</option>
            </select>
          </label>
          <label className="formrow">
            <span className="label">Logo URL</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, logoUrl: event.target.value })
              }
              value={draft.logoUrl ?? ""}
            />
          </label>
          <label className="formrow">
            <span className="label">Website</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, website: event.target.value })
              }
              value={draft.website ?? ""}
            />
          </label>
          <label className="formrow">
            <span className="label">Registration Number</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, registrationNumber: event.target.value })
              }
              value={draft.registrationNumber ?? ""}
            />
          </label>
          <label className="formrow">
            <span className="label">Tax Number</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, taxNumber: event.target.value })
              }
              value={draft.taxNumber ?? ""}
            />
          </label>
          <label className="formrow">
            <span className="label">Primary Email</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, primaryEmail: event.target.value })
              }
              type="email"
              value={draft.primaryEmail ?? ""}
            />
          </label>
          <label className="formrow">
            <span className="label">Primary Phone</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, primaryPhone: event.target.value })
              }
              value={draft.primaryPhone ?? ""}
            />
          </label>
          <label className="formrow">
            <span className="label">Status</span>
            <select
              className="form-select form-select-sm"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="payment_overdue">Payment overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <div className="form-section-title wide">Address</div>
          {[
            ["line1", "Address Line 1"],
            ["line2", "Address Line 2"],
            ["country", "Country"],
            ["state", "State"],
            ["city", "City"],
            ["postalCode", "Postal Code"],
          ].map(([key, label]) => (
            <label className="formrow" key={key}>
              <span className="label">{label}</span>
              <input
                className="input form-control"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    address: {
                      ...(draft.address ?? {}),
                      [key]: event.target.value,
                    },
                  })
                }
                value={draft.address?.[key] ?? ""}
              />
            </label>
          ))}
          <div className="form-section-title wide">Platform configuration</div>
          <label className="formrow wide">
            <span className="label">Primary Domain</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, primaryDomain: event.target.value })
              }
              placeholder="academy.mentora.test"
              value={draft.primaryDomain ?? ""}
            />
          </label>
          {[
            ["subdomain", "Subdomain"],
            ["customDomain", "Custom Domain"],
            ["timezone", "Timezone"],
            ["currency", "Currency"],
            ["locale", "Locale"],
            ["dateFormat", "Date Format"],
            ["financialYear", "Financial Year"],
            ["academicYear", "Academic Year"],
          ].map(([key, label]) => (
            <label className="formrow" key={key}>
              <span className="label">{label}</span>
              <input
                className="input form-control"
                onChange={(event) =>
                  setDraft({ ...draft, [key]: event.target.value })
                }
                value={String(draft[key as keyof OrganizationDraft] ?? "")}
              />
            </label>
          ))}
          <div className="form-section-title wide">Subscription</div>
          {[
            ["plan", "Plan"],
            ["billingCycle", "Billing Cycle"],
            ["userLimit", "User Limit"],
            ["leadLimit", "Lead Limit"],
            ["storageLimitGb", "Storage Limit GB"],
          ].map(([key, label]) => (
            <label className="formrow" key={key}>
              <span className="label">{label}</span>
              <input
                className="input form-control"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    subscription: {
                      ...(draft.subscription ?? {}),
                      [key]: [
                        "userLimit",
                        "leadLimit",
                        "storageLimitGb",
                      ].includes(key)
                        ? Number(event.target.value)
                        : event.target.value,
                    },
                  })
                }
                type={
                  ["userLimit", "leadLimit", "storageLimitGb"].includes(key)
                    ? "number"
                    : "text"
                }
                value={String(draft.subscription?.[key] ?? "")}
              />
            </label>
          ))}
        </div>
        {error ? <div className="auth-error modal-error">{error}</div> : null}
        <div className="record-modal-actions">
          <button className="btn btn-light" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!draft.name.trim() || isSaving}
            onClick={() => {
              void submit();
            }}
            type="button"
          >
            {isSaving ? "Saving" : "Save Organization"}
          </button>
        </div>
      </section>
    </div>
  );
}

function OrganizationSetupModal({
  activeOrganizationId,
  branches,
  departments,
  kind,
  onClose,
  onSubmit,
  organizations,
  title,
}: {
  activeOrganizationId: string;
  branches: unknown[];
  departments: unknown[];
  kind: OrganizationSetupKind;
  onClose: () => void;
  onSubmit: (draft: OrganizationSetupDraft) => Promise<void>;
  organizations: unknown[];
  title: string;
}) {
  const organizationOptions = getOrganizationOptions(organizations, []);
  const branchOptions = getBranchOptions(branches, []);
  const departmentOptions = getRecordOptions(departments);
  const [draft, setDraft] = useState<OrganizationSetupDraft>({
    channel: "whatsapp",
    organizationId: activeOrganizationId || organizationOptions[0]?.value || "",
    primaryColor: "#2563eb",
    secondaryColor: "#06b6d4",
    status: "sandbox",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const needsNameAndCode = ["branch", "department", "team"].includes(kind);
  const canSubmit =
    Boolean(draft.organizationId) &&
    (!needsNameAndCode || Boolean(draft.name?.trim() && draft.code?.trim())) &&
    (kind !== "channel" || Boolean(draft.channel));

  async function submit() {
    if (!canSubmit) {
      setError("Complete the required fields before saving");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSubmit(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${title} failed`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop-layer" role="presentation">
      <section className="record-modal" role="dialog" aria-modal="true">
        <div className="record-modal-head">
          <div>
            <span className="eyebrow">Organization Setup</span>
            <h3>{title}</h3>
          </div>
          <button
            className="btn btn-light btn-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="record-form-grid">
          {organizationOptions.length > 1 ? (
            <label className="formrow wide">
              <span className="label">Organization</span>
              <select
                className="form-select form-select-sm"
                onChange={(event) =>
                  setDraft({ ...draft, organizationId: event.target.value })
                }
                value={draft.organizationId}
              >
                {organizationOptions.map((organization) => (
                  <option key={organization.value} value={organization.value}>
                    {organization.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {needsNameAndCode ? (
            <>
              <label className="formrow wide">
                <span className="label">
                  {kind === "team" ? "Team" : title.replace("Create ", "")} Name
                </span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                  value={draft.name ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">Code</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, code: event.target.value })
                  }
                  placeholder="MAIN"
                  value={draft.code ?? ""}
                />
              </label>
            </>
          ) : null}

          {kind === "department" && branchOptions.length > 0 ? (
            <label className="formrow">
              <span className="label">Branch</span>
              <select
                className="form-select form-select-sm"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    branchId: event.target.value || undefined,
                  })
                }
                value={draft.branchId ?? ""}
              >
                <option value="">None</option>
                {branchOptions.map((branch) => (
                  <option key={branch.value} value={branch.value}>
                    {branch.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {kind === "team" && departmentOptions.length > 0 ? (
            <>
              {branchOptions.length > 0 ? (
                <label className="formrow">
                  <span className="label">Branch</span>
                  <select
                    className="form-select form-select-sm"
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        branchId: event.target.value || undefined,
                      })
                    }
                    value={draft.branchId ?? ""}
                  >
                    <option value="">None</option>
                    {branchOptions.map((branch) => (
                      <option key={branch.value} value={branch.value}>
                        {branch.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="formrow">
                <span className="label">Department</span>
                <select
                  className="form-select form-select-sm"
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      departmentId: event.target.value || undefined,
                    })
                  }
                  value={draft.departmentId ?? ""}
                >
                  <option value="">None</option>
                  {departmentOptions.map((department) => (
                    <option key={department.value} value={department.value}>
                      {department.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          {kind === "branch" ? (
            <>
              <label className="formrow">
                <span className="label">City</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, city: event.target.value })
                  }
                  value={draft.city ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">State</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, state: event.target.value })
                  }
                  value={draft.state ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">Country</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, country: event.target.value })
                  }
                  value={draft.country ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">Postal Code</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, postalCode: event.target.value })
                  }
                  value={draft.postalCode ?? ""}
                />
              </label>
              <label className="formrow wide">
                <span className="label">Address Line 1</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, addressLine1: event.target.value })
                  }
                  value={draft.addressLine1 ?? ""}
                />
              </label>
              <label className="formrow wide">
                <span className="label">Address Line 2</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, addressLine2: event.target.value })
                  }
                  value={draft.addressLine2 ?? ""}
                />
              </label>
            </>
          ) : null}

          {kind === "department" ? (
            <>
              <label className="formrow">
                <span className="label">Function</span>
                <select
                  className="form-select form-select-sm"
                  onChange={(event) =>
                    setDraft({ ...draft, function: event.target.value })
                  }
                  value={draft.function ?? ""}
                >
                  <option value="">Select function</option>
                  <option value="admissions">Admissions</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                  <option value="finance">Finance</option>
                  <option value="academics">Academics</option>
                  <option value="operations">Operations</option>
                </select>
              </label>
              <label className="formrow wide">
                <span className="label">Description</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, description: event.target.value })
                  }
                  value={draft.description ?? ""}
                />
              </label>
            </>
          ) : null}

          {["branch", "department", "team"].includes(kind) ? (
            <>
              <label className="formrow">
                <span className="label">Email</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, email: event.target.value })
                  }
                  type="email"
                  value={draft.email ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">Phone</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, phone: event.target.value })
                  }
                  value={draft.phone ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">
                  {kind === "department" ? "Head User Id" : "Manager User Id"}
                </span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft(
                      kind === "department"
                        ? { ...draft, headId: event.target.value }
                        : { ...draft, managerId: event.target.value },
                    )
                  }
                  value={
                    kind === "department"
                      ? (draft.headId ?? "")
                      : (draft.managerId ?? "")
                  }
                />
              </label>
              <label className="formrow">
                <span className="label">Status</span>
                <select
                  className="form-select form-select-sm"
                  onChange={(event) =>
                    setDraft({ ...draft, status: event.target.value })
                  }
                  value={draft.status ?? "active"}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </>
          ) : null}

          {kind === "branding" ? (
            <>
              <label className="formrow wide">
                <span className="label">Allowed Domains</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, domains: event.target.value })
                  }
                  placeholder="academy.mentora.test, app.mentora.test"
                  value={draft.domains ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">App Name</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, appName: event.target.value })
                  }
                  value={draft.appName ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">Sender Name</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, senderName: event.target.value })
                  }
                  value={draft.senderName ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">Logo URL</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, logoUrl: event.target.value })
                  }
                  value={draft.logoUrl ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">Favicon URL</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, faviconUrl: event.target.value })
                  }
                  value={draft.faviconUrl ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">Support Email</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, supportEmail: event.target.value })
                  }
                  type="email"
                  value={draft.supportEmail ?? ""}
                />
              </label>
              <label className="formrow">
                <span className="label">Primary Color</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, primaryColor: event.target.value })
                  }
                  type="color"
                  value={draft.primaryColor ?? "#2563eb"}
                />
              </label>
              <label className="formrow">
                <span className="label">Secondary Color</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, secondaryColor: event.target.value })
                  }
                  type="color"
                  value={draft.secondaryColor ?? "#06b6d4"}
                />
              </label>
            </>
          ) : null}

          {kind === "channel" ? (
            <>
              <label className="formrow">
                <span className="label">Channel</span>
                <select
                  className="form-select form-select-sm"
                  onChange={(event) =>
                    setDraft({ ...draft, channel: event.target.value })
                  }
                  value={draft.channel ?? "whatsapp"}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="call_center">Call Center</option>
                  <option value="payment">Payment</option>
                  <option value="calendar">Calendar</option>
                  <option value="video">Video</option>
                  <option value="analytics">Analytics</option>
                </select>
              </label>
              <label className="formrow">
                <span className="label">Status</span>
                <select
                  className="form-select form-select-sm"
                  onChange={(event) =>
                    setDraft({ ...draft, status: event.target.value })
                  }
                  value={draft.status ?? "sandbox"}
                >
                  <option value="disabled">Disabled</option>
                  <option value="sandbox">Sandbox</option>
                  <option value="active">Active</option>
                </select>
              </label>
              <label className="formrow wide">
                <span className="label">Provider Key</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, providerKey: event.target.value })
                  }
                  placeholder="sendgrid, twilio, whatsapp_business"
                  value={draft.providerKey ?? ""}
                />
              </label>
              {branchOptions.length > 0 ? (
                <label className="formrow">
                  <span className="label">Branch Scope</span>
                  <select
                    className="form-select form-select-sm"
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        branchId: event.target.value || undefined,
                      })
                    }
                    value={draft.branchId ?? ""}
                  >
                    <option value="">Organization-wide</option>
                    {branchOptions.map((branch) => (
                      <option key={branch.value} value={branch.value}>
                        {branch.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="formrow wide">
                <span className="label">Webhook URL</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, webhookUrl: event.target.value })
                  }
                  value={draft.webhookUrl ?? ""}
                />
              </label>
              <label className="formrow wide">
                <span className="label">Credentials Reference</span>
                <input
                  className="input form-control"
                  onChange={(event) =>
                    setDraft({ ...draft, credentialsRef: event.target.value })
                  }
                  placeholder="vault://organization/provider"
                  value={draft.credentialsRef ?? ""}
                />
              </label>
            </>
          ) : null}
        </div>
        {error ? <div className="auth-error modal-error">{error}</div> : null}
        <div className="record-modal-actions">
          <button className="btn btn-light" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!canSubmit || isSaving}
            onClick={() => {
              void submit();
            }}
            type="button"
          >
            {isSaving ? "Saving" : "Save"}
          </button>
        </div>
      </section>
    </div>
  );
}

function OrganizationUserFormModal({
  activeOrganizationId,
  branches,
  departments,
  mode,
  onClose,
  onOrganizationChange,
  onSubmit,
  row,
  sourceRecord,
  teams,
  organizations,
}: {
  activeOrganizationId: string;
  branches: unknown[];
  departments: unknown[];
  mode: "create" | "edit";
  onClose: () => void;
  onOrganizationChange: (organizationId: string) => void;
  onSubmit: (draft: OrganizationUserDraft) => Promise<void>;
  row?: string[];
  sourceRecord?: unknown;
  teams: unknown[];
  organizations: unknown[];
}) {
  const organizationOptions = getOrganizationOptions(organizations, []);
  const branchOptions = getBranchOptions(branches, []);
  const departmentOptions = getRecordOptions(departments);
  const teamOptions = getRecordOptions(teams);
  const source = normalizeResponseObject(sourceRecord);
  const memberships = Array.isArray(source.memberships)
    ? source.memberships
    : [];
  const primaryMembership = normalizeResponseObject(memberships[0]);
  const sourceOrganizationId = getUnknownRecordId(
    primaryMembership.organizationId,
  );
  const sourceBranchIds = Array.isArray(primaryMembership.branchIds)
    ? primaryMembership.branchIds.map(getUnknownRecordId).filter(Boolean)
    : [];
  const sourceDepartmentIds = Array.isArray(primaryMembership.departmentIds)
    ? primaryMembership.departmentIds.map(getUnknownRecordId).filter(Boolean)
    : [];
  const sourceTeamIds = Array.isArray(primaryMembership.teamIds)
    ? primaryMembership.teamIds.map(getUnknownRecordId).filter(Boolean)
    : [];
  const sourceRole =
    typeof primaryMembership.role === "string"
      ? primaryMembership.role
      : row?.[3]?.toLowerCase().replaceAll(" ", "_") || "admission_counselor";
  const [draft, setDraft] = useState<OrganizationUserDraft>({
    branchIds: sourceBranchIds.length ? sourceBranchIds : undefined,
    departmentIds: sourceDepartmentIds.length ? sourceDepartmentIds : undefined,
    email: typeof source.email === "string" ? source.email : (row?.[0] ?? ""),
    firstName: typeof source.firstName === "string" ? source.firstName : "",
    id: getUnknownRecordId(source),
    ipRestrictions: Array.isArray(source.ipRestrictions)
      ? source.ipRestrictions.map(String)
      : [],
    lastName: typeof source.lastName === "string" ? source.lastName : "",
    mfaRequired: Boolean(source.mfaRequired),
    password: "",
    permissionOverrides: Array.isArray(source.permissions)
      ? source.permissions.map(String)
      : [],
    phone:
      source.phone && typeof source.phone === "object"
        ? String((source.phone as Record<string, unknown>).phone ?? "")
        : "",
    role: sourceRole,
    organizationId:
      sourceOrganizationId ||
      activeOrganizationId ||
      organizationOptions[0]?.value ||
      "",
    status:
      typeof source.status === "string"
        ? source.status
        : row?.[6]?.toLowerCase() || "active",
    teamIds: sourceTeamIds.length ? sourceTeamIds : undefined,
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = mode === "edit";

  async function submit() {
    if (
      !draft.organizationId ||
      !draft.email.trim() ||
      (!isEditMode && draft.password.length < 8)
    ) {
      setError(
        isEditMode
          ? "Organization and email are required"
          : "Organization, email, and an 8 character password are required",
      );
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSubmit({
        ...draft,
        email: draft.email.trim().toLowerCase(),
        password: isEditMode ? "" : draft.password,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? "User update failed"
            : "User creation failed",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop-layer" role="presentation">
      <section className="record-modal" role="dialog" aria-modal="true">
        <div className="record-modal-head">
          <div>
            <span className="eyebrow">User Management</span>
            <h3>{isEditMode ? "Edit CRM User" : "Create CRM User"}</h3>
            <p>
              Manage credentials, lifecycle status, organization membership,
              branch visibility, and role assignment.
            </p>
          </div>
          <button
            className="btn btn-light btn-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="record-form-grid">
          <div className="form-section-title wide">Profile</div>
          <label className="formrow">
            <span className="label">First Name</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, firstName: event.target.value })
              }
              value={draft.firstName ?? ""}
            />
          </label>
          <label className="formrow">
            <span className="label">Last Name</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, lastName: event.target.value })
              }
              value={draft.lastName ?? ""}
            />
          </label>
          <label className="formrow wide">
            <span className="label">Organization</span>
            <select
              className="form-select form-select-sm"
              onChange={(event) => {
                const organizationId = event.target.value;
                setDraft({
                  ...draft,
                  branchIds: undefined,
                  departmentIds: undefined,
                  organizationId,
                  teamIds: undefined,
                });
                onOrganizationChange(organizationId);
              }}
              value={draft.organizationId}
            >
              <option value="">Select organization</option>
              {organizationOptions.map((organization) => (
                <option key={organization.value} value={organization.value}>
                  {organization.label}
                </option>
              ))}
            </select>
          </label>
          {branchOptions.length > 0 ? (
            <label className="formrow">
              <span className="label">Branch</span>
              <select
                className="form-select form-select-sm"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    branchIds: event.target.value
                      ? [event.target.value]
                      : undefined,
                  })
                }
                value={draft.branchIds?.[0] ?? ""}
              >
                <option value="">All branches</option>
                {branchOptions.map((branch) => (
                  <option key={branch.value} value={branch.value}>
                    {branch.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {departmentOptions.length > 0 ? (
            <label className="formrow">
              <span className="label">Department</span>
              <select
                className="form-select form-select-sm"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    departmentIds: event.target.value
                      ? [event.target.value]
                      : undefined,
                  })
                }
                value={draft.departmentIds?.[0] ?? ""}
              >
                <option value="">All departments</option>
                {departmentOptions.map((department) => (
                  <option key={department.value} value={department.value}>
                    {department.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {teamOptions.length > 0 ? (
            <label className="formrow">
              <span className="label">Team</span>
              <select
                className="form-select form-select-sm"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    teamIds: event.target.value
                      ? [event.target.value]
                      : undefined,
                  })
                }
                value={draft.teamIds?.[0] ?? ""}
              >
                <option value="">All teams</option>
                {teamOptions.map((team) => (
                  <option key={team.value} value={team.value}>
                    {team.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="formrow">
            <span className="label">Email</span>
            <input
              className="input form-control"
              disabled={isEditMode}
              onChange={(event) =>
                setDraft({ ...draft, email: event.target.value })
              }
              placeholder="counselor@mentora.test"
              type="email"
              value={draft.email}
            />
          </label>
          <label className="formrow">
            <span className="label">Phone</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, phone: event.target.value })
              }
              value={draft.phone ?? ""}
            />
          </label>
          {!isEditMode ? (
            <label className="formrow">
              <span className="label">Temporary Password</span>
              <input
                className="input form-control"
                onChange={(event) =>
                  setDraft({ ...draft, password: event.target.value })
                }
                type="password"
                value={draft.password}
              />
            </label>
          ) : null}
          <label className="formrow">
            <span className="label">Role</span>
            <select
              className="form-select form-select-sm"
              onChange={(event) =>
                setDraft({ ...draft, role: event.target.value })
              }
              value={draft.role}
            >
              <option value="organization_admin">Organization admin</option>
              <option value="branch_admin">Branch admin</option>
              <option value="admission_manager">Admission manager</option>
              <option value="admission_counselor">Admission counselor</option>
              <option value="marketing_executive">Marketing executive</option>
              <option value="sales_executive">Sales executive</option>
              <option value="call-center">Call center</option>
              <option value="finance">Finance</option>
              <option value="field_agent">Field agent</option>
            </select>
          </label>
          {isEditMode ? (
            <label className="formrow">
              <span className="label">Status</span>
              <select
                className="form-select form-select-sm"
                onChange={(event) =>
                  setDraft({ ...draft, status: event.target.value })
                }
                value={draft.status ?? "active"}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="blocked">Blocked</option>
              </select>
            </label>
          ) : null}
          <div className="form-section-title wide">Security</div>
          <label className="formrow">
            <span className="label">MFA Required</span>
            <select
              className="form-select form-select-sm"
              onChange={(event) =>
                setDraft({
                  ...draft,
                  mfaRequired: event.target.value === "true",
                })
              }
              value={draft.mfaRequired ? "true" : "false"}
            >
              <option value="false">Not required</option>
              <option value="true">Required</option>
            </select>
          </label>
          <label className="formrow wide">
            <span className="label">Permission Overrides</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({
                  ...draft,
                  permissionOverrides: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
              placeholder="users:view, leads:update"
              value={draft.permissionOverrides?.join(", ") ?? ""}
            />
          </label>
          <label className="formrow wide">
            <span className="label">IP Restrictions</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({
                  ...draft,
                  ipRestrictions: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
              placeholder="203.0.113.10, 198.51.100.0/24"
              value={draft.ipRestrictions?.join(", ") ?? ""}
            />
          </label>
        </div>
        {error ? <div className="auth-error modal-error">{error}</div> : null}
        <div className="record-modal-actions">
          <button className="btn btn-light" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!draft.organizationId || !draft.email.trim() || isSaving}
            onClick={() => {
              void submit();
            }}
            type="button"
          >
            {isSaving ? "Saving" : isEditMode ? "Save User" : "Create User"}
          </button>
        </div>
      </section>
    </div>
  );
}

function renderCell(value: string) {
  const normalized = value.toLowerCase();
  if (
    [
      "active",
      "paid",
      "ready",
      "delivered",
      "opened",
      "completed",
      "accepted",
    ].includes(normalized)
  )
    return <span className="badge good">{formatBadgeLabel(value)}</span>;
  if (
    [
      "inactive",
      "pending",
      "inactive",
      "suspended",
      "review",
      "draft",
      "open",
      "in progress",
      "under review",
      "documents",
      "trial",
    ].includes(normalized)
  )
    return <span className="badge warn">{formatBadgeLabel(value)}</span>;
  if (
    ["urgent", "high", "hot", "blocked", "archived", "cancelled"].includes(
      normalized,
    )
  )
    return <span className="badge danger">{formatBadgeLabel(value)}</span>;
  return value;
}

function formatBadgeLabel(value: string) {
  return formatStatus(value);
}

function getRolePermissionNames(record: unknown) {
  return getRolePermissions(record).map((permission) => permission.name);
}

function getRolePermissionIds(record: unknown) {
  return getRolePermissions(record).map((permission) => permission.id);
}

function getRolePermissions(record: unknown) {
  const object =
    record && typeof record === "object"
      ? (record as Record<string, unknown>)
      : {};
  const permissions = Array.isArray(object.permissions)
    ? object.permissions
    : [];
  return permissions
    .map((permission) => {
      const permissionObject =
        permission && typeof permission === "object"
          ? (permission as Record<string, unknown>)
          : {};
      const id = getUnknownRecordId(permissionObject);
      const name =
        typeof permissionObject.name === "string"
          ? permissionObject.name
          : typeof permission === "string"
            ? permission
            : "";
      return { id: id || name, name };
    })
    .filter((permission) => permission.name);
}

function recordMatchesRowTitle(item: unknown, title: string): boolean {
  if (!item || typeof item !== "object") return false;
  const object = item as {
    name?: unknown;
    title?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
  };
  if (object.title === title || object.name === title) return true;
  // User documents (e.g. the "users" module) have neither `name` nor
  // `title` — they render as "First Last" (falling back to email) via
  // userRecordsToRows, so match the same derived value here.
  const fullName = [object.firstName, object.lastName]
    .filter(Boolean)
    .join(" ");
  if (fullName && fullName === title) return true;
  return typeof object.email === "string" && object.email === title;
}

function findModuleRecordIdForRow(
  records: unknown[] | undefined,
  row: string[],
) {
  if (!records?.length) return "";
  const record = records.find((item) => recordMatchesRowTitle(item, row[0]));
  return getUnknownRecordId(record);
}

function findModuleRecordForRow(records: unknown[] | undefined, row: string[]) {
  if (!records?.length) return undefined;
  return records.find((item) => recordMatchesRowTitle(item, row[0]));
}

function isMongoObjectId(value: string | undefined) {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}
