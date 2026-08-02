"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAnglesRight,
  faArrowRightFromBracket,
  faArrowsRotate,
  faBarsProgress,
  faBell,
  faBuilding,
  faChevronLeft,
  faChevronRight,
  faGrip,
  faHouse,
  faSort,
  faSortDown,
  faSortUp,
  faTableList,
} from "@fortawesome/free-solid-svg-icons";
import {
  crmSessionActions,
  crmWorkspaceActions,
  addLeadAttachment,
  bulkUpdateDedicatedCrmRecordStatus,
  bulkUpdateModuleRecordStatus,
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
  loadOrganizationUsers,
  loadDedicatedCrmRecords,
  loadModuleRecords,
  loadCrmWorkspace,
  loginWithCredentials,
  readPersistedCrmSession,
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
  revokeAdminUserSessions,
  upsertIntegrationProvider,
  testIntegrationProvider,
  type DemoContext,
  type DemoUser,
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
  defaultCrmUsers,
  dedicatedAdminModuleIds,
  getEditableModuleColumns,
  getModuleHref,
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
  extractFirstId,
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
import { LoginScreen, ThemeSelector } from "./shellAuth";
import {
  getBranchOptions,
  getOrganizationOptions,
  getRecordOptions,
  WorkspaceSwitcher,
  WorkspaceSyncAction,
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
  const [organizationUserFormOpen, setOrganizationUserFormOpen] =
    useState(false);
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

  const activeOrganizationId = useMemo(
    () =>
      workspace.activeOrganizationId || extractFirstId(workspace.organizations),
    [workspace.activeOrganizationId, workspace.organizations],
  );
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
          organizationId: activeOrganizationId || undefined,
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
          organizationId: activeOrganizationId || undefined,
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
  const canSwitchOrganization = ["super_admin", "organization_admin"].includes(
    activeContext?.role ?? "",
  );
  const canSwitchBranch = [
    "super_admin",
    "organization_admin",
    "branch_admin",
    "admission_manager",
    "sales_executive",
    "call-center",
    "finance",
    "field_agent",
  ].includes(activeContext?.role ?? "");

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
    return (
      context?.role === "super_admin" ||
      context?.modules.includes(id) ||
      id === "dashboard"
    );
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

  async function runAction(label: string) {
    const normalized = label.toLowerCase();

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
            exportModuleRecords({
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

        if (normalized.includes("branch")) {
          setOrganizationSetupForm({ kind: "branch", title: "Create Branch" });
          return;
        }

        if (normalized.includes("department")) {
          setOrganizationSetupForm({
            kind: "department",
            title: "Create Department",
          });
          return;
        }

        if (normalized.includes("team")) {
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
          setOrganizationUserFormOpen(true);
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
              organizationId: activeOrganizationId || undefined,
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
              organizationId: activeOrganizationId || undefined,
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
            organizationId: activeOrganizationId || undefined,
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

        if (
          normalized.includes("audit") ||
          normalized.includes("session") ||
          normalized.includes("device")
        ) {
          const result = await dispatch(
            loadAuthOverview({
              organizationId: activeOrganizationId || undefined,
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
            organizationId: activeOrganizationId || undefined,
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
          activeId === "payments" &&
          (normalized.includes("link") ||
            normalized.includes("reconciliation") ||
            normalized.includes("refund"))
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
          const result = await dispatch(
            exportModuleRecords({
              moduleKey: activeId,
              organizationId: activeOrganizationId,
            }),
          ).unwrap();
          const data = normalizeResponseObject(result);
          const rowCount = Array.isArray(data.rows) ? data.rows.length : 0;
          dispatch(
            crmSessionActions.setToast(
              `${rowCount} security rows prepared for audit export`,
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
          exportModuleRecords({
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
    if (!activeOrganizationId) {
      dispatch(crmSessionActions.setToast("Organization context is required"));
      return;
    }
    const recordId = findModuleRecordIdForRow(getActiveModuleApiRecords(), row);
    if (!recordId) {
      dispatch(crmSessionActions.setToast("API record was not found"));
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
    if (!activeOrganizationId) {
      dispatch(crmSessionActions.setToast("Organization context is required"));
      return;
    }
    const recordId = findModuleRecordIdForRow(getActiveModuleApiRecords(), row);
    if (!recordId) {
      dispatch(crmSessionActions.setToast("API record was not found"));
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
          {navGroups.map((group) => (
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
                {group.items.filter(canAccessModule).map((id) => (
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
                activeOrganizationId={activeOrganizationId}
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
                    await dispatch(loadCrmWorkspace({ organizationId }));
                    await dispatch(loadBranches({ organizationId }));
                    await dispatch(loadIdentityHierarchy({ organizationId }));
                  })();
                }}
                organizations={workspace.organizations}
              />
              <ThemeSelector
                setThemeMode={(value) =>
                  dispatch(crmSessionActions.setThemeMode(value))
                }
                themeMode={themeMode}
              />
              <WorkspaceSyncAction
                apiSyncEnabled={apiSyncEnabled}
                onSync={() => {
                  if (!accessToken) {
                    dispatch(
                      crmSessionActions.setToast(
                        "Sign in with valid credentials before syncing API data",
                      ),
                    );
                    return;
                  }
                  setApiSyncEnabled(true);
                  void dispatch(loadCrmWorkspace());
                  void dispatch(loadOrganizations());
                }}
                workspace={workspace}
              />
              <button
                aria-label="Open notifications"
                className="icon-action"
                onClick={() => {
                  openModule("notifications");
                }}
                type="button"
              >
                <FontAwesomeIcon icon={faBell} />
                <span>Notifications</span>
                <em>3</em>
              </button>
              <button
                className="logout-action"
                onClick={() => dispatch(crmSessionActions.logout())}
                type="button"
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {activeId === "dashboard" ? (
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

        {organizationUserFormOpen ? (
          <OrganizationUserFormModal
            activeOrganizationId={activeOrganizationId}
            branches={workspace.branches}
            departments={workspace.departments}
            onClose={() => setOrganizationUserFormOpen(false)}
            onSubmit={async (draft) => {
              await dispatch(createOrganizationUser(draft)).unwrap();
              await dispatch(
                loadOrganizationUsers({ organizationId: draft.organizationId }),
              ).unwrap();
              dispatch(crmSessionActions.setToast("CRM user created"));
              setOrganizationUserFormOpen(false);
            }}
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

      {module.id === "authentication" ? (
        <AuthenticationCommandCenter runAction={props.runAction} />
      ) : null}

      {module.id === "users" ? (
        <UsersCommandCenter runAction={props.runAction} total={props.total} />
      ) : null}

      <div className="navigationlist">
        <div className="action-row">
          {module.id !== "organizations" &&
          !isRbacModule &&
          !module.actions?.some((action) =>
            action.toLowerCase().startsWith("create "),
          ) ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                const createAction = module.actions?.find((action) =>
                  action.toLowerCase().startsWith("create "),
                );
                if (
                  createAction &&
                  organizationStructureModuleIds.has(module.id)
                ) {
                  void props.runAction(createAction);
                  return;
                }
                props.openRecordForm({ mode: "create" });
              }}
              type="button"
            >
              <Icon name="check" />
              New Record
            </button>
          ) : null}
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
              className="form-select form-select-sm bulk-status-select"
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
            <span>View mode</span>
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
                    const isArchived = row.some((value) =>
                      isRbacModule
                        ? value.toLowerCase() === "inactive"
                        : value.toLowerCase() === "archived",
                    );
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
                                isRbacModule ? "row-action-active" : undefined
                              }
                              onClick={() => {
                                props.requestRestoreRow(row);
                              }}
                              type="button"
                            >
                              <Icon name="check" />
                              {isRbacModule ? "Activate" : "Restore"}
                            </button>
                          ) : (
                            <button
                              className={
                                isRbacModule ? "row-action-inactive" : undefined
                              }
                              onClick={() => {
                                void props.archiveRow(row);
                              }}
                              type="button"
                            >
                              <Icon name="shield" />
                              {isRbacModule ? "Inactivate" : "Archive"}
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
                const isArchived = row.some((value) =>
                  isRbacModule
                    ? value.toLowerCase() === "inactive"
                    : value.toLowerCase() === "archived",
                );
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
                            isRbacModule ? "row-action-active" : "btn-light"
                          }`}
                          onClick={() => {
                            props.requestRestoreRow(row);
                          }}
                          type="button"
                        >
                          <Icon name="check" />
                          {isRbacModule ? "Activate" : "Restore"}
                        </button>
                      ) : (
                        <button
                          className={`btn btn-sm ${
                            isRbacModule ? "row-action-inactive" : "btn-light"
                          }`}
                          onClick={() => {
                            void props.archiveRow(row);
                          }}
                          type="button"
                        >
                          <Icon name="shield" />
                          {isRbacModule ? "Inactivate" : "Archive"}
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
        "blocked",
      ].includes(value.toLowerCase()),
    ) ?? "Active"
  );
}

function AuthenticationCommandCenter(props: {
  runAction: (label: string) => Promise<void>;
}) {
  const workspace = useAppSelector((state) => state.crmWorkspace);
  const overview = normalizeResponseObject(workspace.authOverview);
  const metrics: Array<[string, unknown]> = [
    ["Total users", overview.totalUsers],
    ["Active users", overview.activeUsers],
    ["Suspended", overview.suspendedUsers],
    ["Active sessions", overview.activeSessions],
  ];

  return (
    <section
      aria-label="Authentication command center"
      className="iam-command-center"
    >
      <div>
        <span className="eyebrow">Authentication owns</span>
        <h3>
          Login, sessions, MFA readiness, SSO configuration, and device control
        </h3>
        <p>
          This module validates credentials, issues sessions, tracks devices,
          applies security policy, and lets admins revoke access when risk is
          detected.
        </p>
      </div>
      <div className="iam-metric-grid">
        {metrics.map(([label, value]) => (
          <article className="iam-metric-card" key={String(label)}>
            <span>{label}</span>
            <strong>
              {typeof value === "number" ? value.toLocaleString() : "0"}
            </strong>
          </article>
        ))}
      </div>
      <div className="iam-action-strip">
        {["Review sessions", "Configure MFA policy", "Configure SSO"].map(
          (label) => (
            <button
              className="btn btn-light secondary"
              key={label}
              onClick={() => void props.runAction(label)}
              type="button"
            >
              <Icon name={label.includes("SSO") ? "lock" : "shield"} />
              {label}
            </button>
          ),
        )}
      </div>
    </section>
  );
}

function UsersCommandCenter(props: {
  runAction: (label: string) => Promise<void>;
  total: number;
}) {
  const userScopes = [
    "Super admins operate the full platform.",
    "Organization admins manage one organization.",
    "Branch admins and agents operate assigned branches.",
    "Students and parents use customer-facing access.",
  ];

  return (
    <section aria-label="Users command center" className="iam-command-center">
      <div>
        <span className="eyebrow">Users owns</span>
        <h3>People, roles, memberships, hierarchy, and access lifecycle</h3>
        <p>
          Create users from CRM credentials, attach them to organizations and
          branches, manage role membership, suspend risky accounts, and revoke
          active sessions.
        </p>
      </div>
      <div className="iam-role-list">
        {userScopes.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="iam-action-strip">
        <strong>{props.total.toLocaleString()} live users</strong>
        {["Create User", "Access review", "Revoke sessions"].map((label) => (
          <button
            className={
              label === "Create User"
                ? "btn btn-primary"
                : "btn btn-light secondary"
            }
            key={label}
            onClick={() => void props.runAction(label)}
            type="button"
          >
            <Icon name={label.includes("User") ? "user" : "shield"} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
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
  const actionLabel = isRbacModule ? "Activate" : "Restore";

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
              <span className="eyebrow">{actionLabel} Confirmation</span>
              <h3 id="restore-confirm-title">
                {actionLabel} this {module.title} record?
              </h3>
              <p>
                This will move the record back into the active RBAC catalogue
                and make it available for access configuration.
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
            {isRestoring ? `${actionLabel}...` : `${actionLabel} Record`}
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
    branchCity: "",
    branchCode: "",
    branchName: "",
    branchState: "",
    code: "",
    name: "",
    primaryDomain: "",
    type: "coaching",
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
        name: draft.name.trim(),
        primaryDomain: draft.primaryDomain?.trim() || undefined,
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
    code: typeof source.code === "string" ? source.code : "",
    id: organizationId,
    name: row[0] ?? "",
    primaryDomain:
      typeof source.primaryDomain === "string" ? source.primaryDomain : "",
    type:
      typeof source.type === "string"
        ? source.type
        : row[1]?.toLowerCase().replaceAll(" ", "_") || "coaching",
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
        name: draft.name.trim(),
        primaryDomain: draft.primaryDomain?.trim() || undefined,
        status,
        type: draft.type,
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
            <span className="label">Status</span>
            <select
              className="form-select form-select-sm"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </label>
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
            </>
          ) : null}

          {kind === "department" ? (
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
  onClose,
  onSubmit,
  teams,
  organizations,
}: {
  activeOrganizationId: string;
  branches: unknown[];
  departments: unknown[];
  onClose: () => void;
  onSubmit: (draft: OrganizationUserDraft) => Promise<void>;
  teams: unknown[];
  organizations: unknown[];
}) {
  const organizationOptions = getOrganizationOptions(organizations, []);
  const branchOptions = getBranchOptions(branches, []);
  const departmentOptions = getRecordOptions(departments);
  const teamOptions = getRecordOptions(teams);
  const [draft, setDraft] = useState<OrganizationUserDraft>({
    email: "",
    password: "",
    role: "admission_counselor",
    organizationId: activeOrganizationId || organizationOptions[0]?.value || "",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit() {
    if (
      !draft.organizationId ||
      !draft.email.trim() ||
      draft.password.length < 8
    ) {
      setError("Organization, email, and an 8 character password are required");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSubmit({ ...draft, email: draft.email.trim().toLowerCase() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "User creation failed");
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
            <h3>Create CRM User</h3>
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
            <span className="label">Organization</span>
            <select
              className="form-select form-select-sm"
              onChange={(event) =>
                setDraft({ ...draft, organizationId: event.target.value })
              }
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
              onChange={(event) =>
                setDraft({ ...draft, email: event.target.value })
              }
              placeholder="counselor@mentora.test"
              type="email"
              value={draft.email}
            />
          </label>
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
            {isSaving ? "Creating" : "Create User"}
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
      "review",
      "draft",
      "open",
      "in progress",
      "under review",
      "documents",
    ].includes(normalized)
  )
    return <span className="badge warn">{formatBadgeLabel(value)}</span>;
  if (["urgent", "high", "hot"].includes(normalized))
    return <span className="badge danger">{formatBadgeLabel(value)}</span>;
  return value;
}

function formatBadgeLabel(value: string) {
  return formatStatus(value)
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
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

function findModuleRecordIdForRow(
  records: unknown[] | undefined,
  row: string[],
) {
  if (!records?.length) return "";
  const title = row[0];
  const record = records.find((item) => {
    if (!item || typeof item !== "object") return false;
    const object = item as { name?: unknown; title?: unknown };
    return object.title === title || object.name === title;
  });
  return getUnknownRecordId(record);
}

function findModuleRecordForRow(records: unknown[] | undefined, row: string[]) {
  if (!records?.length) return undefined;
  const title = row[0];
  return records.find((item) => {
    if (!item || typeof item !== "object") return false;
    const object = item as { name?: unknown; title?: unknown };
    return object.title === title || object.name === title;
  });
}
