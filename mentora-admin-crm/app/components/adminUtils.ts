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
  if (
    coverage.productionReady ||
    (coverage.backendStatus === "product_ready" &&
      coverage.frontendStatus === "product_ready")
  ) {
    return "Active";
  }
  if (
    coverage.backendStatus === "workflow_ready" ||
    coverage.frontendStatus === "workflow_ready"
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
  if (!Array.isArray(records) || !records.length) return [];
  const columns = Array.isArray(module.columns)
    ? module.columns.filter(
        (column): column is string => typeof column === "string",
      )
    : [];
  if (!columns.length) return [];

  const rows: string[][] = [];
  for (const record of records.slice(0, 5000)) {
    const object =
      record && typeof record === "object"
        ? (record as Record<string, unknown>)
        : {};
    const payload =
      safeGet(object, "payload") &&
      typeof safeGet(object, "payload") === "object"
        ? (safeGet(object, "payload") as Record<string, unknown>)
        : {};
    const metrics = normalizeResponseObject(safeGet(object, "metrics"));
    const roi = normalizeResponseObject(safeGet(object, "roi"));
    const customFields = normalizeResponseObject(
      safeGet(object, "customFields"),
    );
    const applicantName = joinDisplayParts(
      safeGet(object, "firstName"),
      safeGet(object, "middleName"),
      safeGet(object, "lastName"),
    );

    const row: string[] = [];
    for (let index = 0; index < Math.min(columns.length, 50); index += 1) {
      const column = columns[index];
      const key = toPayloadKey(column);
      let value: unknown;
      try {
        value =
          safeGet(payload, key) ??
          safeGet(payload, column) ??
          safeGet(object, key) ??
          safeGet(object, column) ??
          safeGet(customFields, key) ??
          safeGet(metrics, key) ??
          safeGet(roi, key) ??
          (key === "campaign"
            ? (safeGet(object, "name") ?? safeGet(object, "title"))
            : undefined) ??
          (key === "program"
            ? (safeGet(object, "name") ?? safeGet(object, "title"))
            : undefined) ??
          (key === "leads" ? safeGet(metrics, "leads") : undefined) ??
          (key === "applications"
            ? safeGet(metrics, "applications")
            : undefined) ??
          (key === "spend" ? safeGet(metrics, "spend") : undefined) ??
          (key === "roi"
            ? (safeGet(roi, "value") ?? safeGet(object, "roi"))
            : undefined) ??
          (key === "message"
            ? (safeGet(object, "subject") ?? safeGet(object, "title"))
            : undefined) ??
          (key === "time"
            ? (safeGet(object, "createdAt") ?? safeGet(object, "updatedAt"))
            : undefined) ??
          (key === "task" ? safeGet(object, "title") : undefined) ??
          (key === "activity" ? safeGet(object, "title") : undefined) ??
          (key === "activityType"
            ? (safeGet(payload, "activityType") ??
              safeGet(object, "type") ??
              safeGet(object, "kind"))
            : undefined) ??
          (key === "entity"
            ? (safeGet(payload, "entity") ??
              safeGet(object, "entityName") ??
              resolveRecordName(safeGet(object, "entityId")) ??
              safeGet(object, "entityType"))
            : undefined) ??
          (key === "entityType" ? safeGet(object, "entityType") : undefined) ??
          (key === "channel"
            ? (safeGet(object, "channel") ?? safeGet(payload, "channel"))
            : undefined) ??
          (key === "template" ? safeGet(payload, "template") : undefined) ??
          (key === "deliveryStatus"
            ? (payload.deliveryStatus ?? object.status)
            : undefined) ??
          (key === "optInStatus" ? payload.optInStatus : undefined) ??
          (key === "callbackStatus" ? payload.callbackStatus : undefined) ??
          (key === "media" ? payload.media : undefined) ??
          (key === "buttons" ? payload.buttons : undefined) ??
          (key === "flow" ? payload.flow : undefined) ??
          (key === "bulkBatch" ? payload.bulkBatch : undefined) ??
          (key === "automationRule" ? payload.automationRule : undefined) ??
          (key === "queue" ? payload.queue : undefined) ??
          (key === "direction"
            ? (payload.direction ?? object.direction)
            : undefined) ??
          (key === "disposition" ? payload.disposition : undefined) ??
          (key === "recordingPolicy" ? payload.recordingPolicy : undefined) ??
          (key === "routingRule" ? payload.routingRule : undefined) ??
          (key === "callbackNumber" ? payload.callbackNumber : undefined) ??
          (key === "sla" ? payload.sla : undefined) ??
          (key === "analyticsStatus" ? payload.analyticsStatus : undefined) ??
          (key === "botName" ? (payload.botName ?? object.title) : undefined) ??
          (key === "intentSet" ? payload.intentSet : undefined) ??
          (key === "knowledgeSource" ? payload.knowledgeSource : undefined) ??
          (key === "fallbackOwner" ? payload.fallbackOwner : undefined) ??
          (key === "guardrailPolicy" ? payload.guardrailPolicy : undefined) ??
          (key === "trainingStatus" ? payload.trainingStatus : undefined) ??
          (key === "feature" ? (payload.feature ?? object.title) : undefined) ??
          (key === "useCase" ? payload.useCase : undefined) ??
          (key === "model" ? payload.model : undefined) ??
          (key === "dataSource" ? payload.dataSource : undefined) ??
          (key === "humanReview" ? payload.humanReview : undefined) ??
          (key === "usageLimit" ? payload.usageLimit : undefined) ??
          (key === "outcome"
            ? (payload.outcome ?? object.outcome)
            : undefined) ??
          (key === "nextStep" ? payload.nextStep : undefined) ??
          (key === "followUp"
            ? (object.title ?? payload.followUp ?? payload.followUpType)
            : undefined) ??
          (key === "followUpType"
            ? (payload.followUpType ?? object.type ?? object.kind)
            : undefined) ??
          (key === "due" ? (object.dueAt ?? payload.due) : undefined) ??
          (key === "reminderChannel"
            ? (payload.reminderChannel ?? object.reminderChannel)
            : undefined) ??
          (key === "escalationRule"
            ? (payload.escalationRule ?? object.escalationRule)
            : undefined) ??
          (key === "meeting" ? object.title : undefined) ??
          (key === "start" ? (object.dueAt ?? payload.start) : undefined) ??
          (key === "attendees" ? payload.attendees : undefined) ??
          (key === "location" ? payload.location : undefined) ??
          (key === "provider" ? payload.provider : undefined) ??
          (key === "tag" ? object.title : undefined) ??
          (key === "color" ? payload.color : undefined) ??
          (key === "module" ? payload.module : undefined) ??
          (key === "scope" ? payload.scope : undefined) ??
          (key === "usageRule" ? payload.usageRule : undefined) ??
          (key === "job" ? object.title : undefined) ??
          (key === "operation" ? payload.operation : undefined) ??
          (key === "rows" ? payload.rows : undefined) ??
          (key === "file" ? payload.file : undefined) ??
          (key === "errorPolicy" ? payload.errorPolicy : undefined) ??
          (key === "callbackStatus" ? payload.callbackStatus : undefined) ??
          (key === "student" ? (payload.student ?? object.title) : undefined) ??
          (key === "grade" ? payload.grade : undefined) ??
          (key === "parent" ? payload.parent : undefined) ??
          (key === "access" ? payload.access : undefined) ??
          (key === "profileCompletion"
            ? payload.profileCompletion
            : undefined) ??
          (key === "session" ? (payload.session ?? object.title) : undefined) ??
          (key === "batch" ? payload.batch : undefined) ??
          (key === "end" ? payload.end : undefined) ??
          (key === "course" ? (payload.course ?? object.title) : undefined) ??
          (key === "subjects" ? payload.subjects : undefined) ??
          (key === "fee" ? (payload.fee ?? object.title) : undefined) ??
          (key === "duration" ? payload.duration : undefined) ??
          (key === "specialization"
            ? (payload.specialization ?? object.title)
            : undefined) ??
          (key === "stream" ? payload.stream : undefined) ??
          (key === "seats" ? payload.seats : undefined) ??
          (key === "eligibility" ? payload.eligibility : undefined) ??
          (key === "enrollment"
            ? (payload.enrollment ?? object.title)
            : undefined) ??
          (key === "plan" ? payload.plan : undefined) ??
          (key === "amount" ? payload.amount : undefined) ??
          (key === "ledger" ? payload.ledger : undefined) ??
          (key === "gateway" ? payload.gateway : undefined) ??
          (key === "document" ? (object.name ?? object.title) : undefined) ??
          (key === "agent" ? payload.agent : undefined) ??
          (key === "workspace" ? payload.workspace : undefined) ??
          (key === "devicePolicy" ? payload.devicePolicy : undefined) ??
          (key === "offlineSync" ? payload.offlineSync : undefined) ??
          (key === "geoCheckIn" ? payload.geoCheckIn : undefined) ??
          (key === "voiceNotes" ? payload.voiceNotes : undefined) ??
          (key === "leadUpdates" ? payload.leadUpdates : undefined) ??
          (key === "taskQueue" ? payload.taskQueue : undefined) ??
          (key === "reportAccess" ? payload.reportAccess : undefined) ??
          (key === "releaseChannel" ? payload.releaseChannel : undefined) ??
          (key === "eventType" ? payload.eventType : undefined) ??
          (key === "startTime"
            ? (payload.startTime ?? object.dueAt)
            : undefined) ??
          (key === "endTime" ? payload.endTime : undefined) ??
          (key === "reminderRule" ? payload.reminderRule : undefined) ??
          (key === "recurringRule" ? payload.recurringRule : undefined) ??
          (key === "syncStatus" ? payload.syncStatus : undefined) ??
          (key === "venue" ? payload.venue : undefined) ??
          (key === "registrationLimit"
            ? payload.registrationLimit
            : undefined) ??
          (key === "registrationForm" ? payload.registrationForm : undefined) ??
          (key === "webinarProvider" ? payload.webinarProvider : undefined) ??
          (key === "qrCheckIn" ? payload.qrCheckIn : undefined) ??
          (key === "attendance" ? payload.attendance : undefined) ??
          (key === "leadCapture" ? payload.leadCapture : undefined) ??
          (key === "visitType" ? payload.visitType : undefined) ??
          (key === "route" ? payload.route : undefined) ??
          (key === "checkIn" ? payload.checkIn : undefined) ??
          (key === "checkOut" ? payload.checkOut : undefined) ??
          (key === "mileage" ? payload.mileage : undefined) ??
          (key === "geoStatus" ? payload.geoStatus : undefined) ??
          (key === "nextAction" ? payload.nextAction : undefined) ??
          (key === "subject"
            ? (object.subject ?? payload.subject)
            : undefined) ??
          (key === "requester" ? payload.requester : undefined) ??
          (key === "assignedAgent" ? payload.assignedAgent : undefined) ??
          (key === "resolution" ? payload.resolution : undefined) ??
          (key === "escalation" ? payload.escalation : undefined) ??
          (key === "satisfaction" ? payload.satisfaction : undefined) ??
          (key === "entryType" ? payload.entryType : undefined) ??
          (key === "invoice" ? payload.invoice : undefined) ??
          (key === "tax" ? payload.tax : undefined) ??
          (key === "paymentStatus" ? payload.paymentStatus : undefined) ??
          (key === "dueDate" ? (payload.dueDate ?? object.dueAt) : undefined) ??
          (key === "reconciliationStatus"
            ? payload.reconciliationStatus
            : undefined) ??
          (key === "accountingExport" ? payload.accountingExport : undefined) ??
          (key === "format" ? payload.format : undefined) ??
          (key === "recipients" ? payload.recipients : undefined) ??
          (key === "exportStatus" ? payload.exportStatus : undefined) ??
          (key === "providerKey"
            ? (object.providerKey ?? payload.providerKey)
            : undefined) ??
          (key === "mode"
            ? (payload.mode ?? (object.demoMode ? "Sandbox" : "Live"))
            : undefined) ??
          (key === "webhookUrl" ? payload.webhookUrl : undefined) ??
          (key === "credentialStatus"
            ? (payload.credentialStatus ??
              (object.configuredByEnv ? "Configured" : "Missing"))
            : undefined) ??
          (key === "lastChecked"
            ? (object.lastCheckedAt ?? payload.lastChecked)
            : undefined) ??
          (key === "settingArea" ? payload.settingArea : undefined) ??
          (key === "scope" ? payload.scope : undefined) ??
          (key === "policy" ? payload.policy : undefined) ??
          (key === "value" ? payload.value : undefined) ??
          (key === "effectiveFrom" ? payload.effectiveFrom : undefined) ??
          (key === "auditRequired" ? payload.auditRequired : undefined) ??
          (key === "documentName" ? object.name : undefined) ??
          (key === "verificationStatus"
            ? (payload.verificationStatus ?? object.status)
            : undefined) ??
          (key === "ocrProvider"
            ? (payload.ocrProvider ??
              normalizeResponseObject(object.verification).ocrProvider)
            : undefined) ??
          (key === "applicant"
            ? (payload.applicant ?? payload.applicantName ?? object.title)
            : undefined) ??
          (key === "applicantName"
            ? (payload.applicantName ??
              normalizeResponseObject(object.applicantProfile).applicantName ??
              object.title)
            : undefined) ??
          (key === "application"
            ? (payload.application ??
              resolveRecordName(object.relatedApplicationId))
            : undefined) ??
          (key === "reviewStage"
            ? (payload.reviewStage ??
              normalizeResponseObject(object.formResponses).reviewStage)
            : undefined) ??
          (key === "documentsStatus"
            ? (payload.documentsStatus ??
              normalizeResponseObject(object.formResponses).documentsStatus)
            : undefined) ??
          (key === "interviewStatus"
            ? (payload.interviewStatus ??
              normalizeResponseObject(object.formResponses).interviewStatus)
            : undefined) ??
          (key === "offerStatus"
            ? (payload.offerStatus ??
              normalizeResponseObject(object.formResponses).offerStatus)
            : undefined) ??
          (key === "admissionStatus"
            ? (payload.admissionStatus ?? object.status)
            : undefined) ??
          (key === "feePlan" ? payload.feePlan : undefined) ??
          (key === "paymentStatus" ? payload.paymentStatus : undefined) ??
          (key === "learningPlan" ? payload.learningPlan : undefined) ??
          (key === "onboardingChecklist"
            ? payload.onboardingChecklist
            : undefined) ??
          (key === "erpHandoff" ? payload.erpHandoff : undefined) ??
          (key === "lmsHandoff" ? payload.lmsHandoff : undefined) ??
          (key === "enrollmentStatus" ? payload.enrollmentStatus : undefined) ??
          (key === "scholarshipRule" ? payload.scholarshipRule : undefined) ??
          (key === "eligibilityStatus"
            ? payload.eligibilityStatus
            : undefined) ??
          (key === "approvalStage" ? payload.approvalStage : undefined) ??
          (key === "awardAmount" ? payload.awardAmount : undefined) ??
          (key === "paymentPlanImpact"
            ? payload.paymentPlanImpact
            : undefined) ??
          (key === "approver" ? payload.approver : undefined) ??
          (key === "interviewType" ? payload.interviewType : undefined) ??
          (key === "interviewer" ? payload.interviewer : undefined) ??
          (key === "scheduledStart"
            ? (payload.scheduledStart ?? object.dueAt)
            : undefined) ??
          (key === "scheduledEnd" ? payload.scheduledEnd : undefined) ??
          (key === "meetingLink" ? payload.meetingLink : undefined) ??
          (key === "score" ? payload.score : undefined) ??
          (key === "result" ? payload.result : undefined) ??
          (key === "offerRecommendation"
            ? payload.offerRecommendation
            : undefined) ??
          (key === "admissionHandoff" ? payload.admissionHandoff : undefined) ??
          (key === "subject" ? payload.subject : undefined) ??
          (key === "studyPlan" ? payload.studyPlan : undefined) ??
          (key === "tutorType" ? payload.tutorType : undefined) ??
          (key === "tutor" ? payload.tutor : undefined) ??
          (key === "classroom" ? payload.classroom : undefined) ??
          (key === "schedule" ? payload.schedule : undefined) ??
          (key === "entitlement" ? payload.entitlement : undefined) ??
          (key === "aiCredits" ? payload.aiCredits : undefined) ??
          (key === "progressRule" ? payload.progressRule : undefined) ??
          (key === "parentSummary" ? payload.parentSummary : undefined) ??
          (key === "safetyStatus" ? payload.safetyStatus : undefined) ??
          (key === "report" ? (object.name ?? object.title) : undefined) ??
          (key === "workflow" ? (object.name ?? object.title) : undefined) ??
          (key === "lastRun"
            ? (object.lastRunAt ?? object.updatedAt)
            : undefined) ??
          (key === "leadNumber" ? object.leadNumber : undefined) ??
          (key === "applicantName"
            ? applicantName || object.title
            : undefined) ??
          (key === "interestedCourse"
            ? (object.interestedCourse ?? object.interestedPrograms)
            : undefined) ??
          (key === "preferredBranch" ? object.preferredBranch : undefined) ??
          (key === "leadStage"
            ? resolveRecordName(object.stageId)
            : undefined) ??
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
          (key === "sla"
            ? (object.sla ?? object.slaDurationHours)
            : undefined) ??
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
          (index === 0 ? safeGet(object, "title") : undefined) ??
          (index === 0 ? safeGet(object, "name") : undefined) ??
          (index === columns.length - 1
            ? safeGet(object, "status")
            : undefined);
      } catch {
        value = undefined;
      }

      row.push(stringifyCell(value));
    }
    rows.push(row);
  }
  return rows;
}

function safeGet(object: Record<string, unknown>, key: string): unknown {
  try {
    return object[key];
  } catch {
    return undefined;
  }
}

function resolvePersonName(value: unknown) {
  if (!value || typeof value !== "object") return stringifyCell(value);
  const object = value as Record<string, unknown>;
  return (
    joinDisplayParts(object.firstName, object.lastName) ||
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

function joinDisplayParts(...parts: unknown[]) {
  return parts
    .map((part) => stringifyCell(part))
    .filter((part) => part !== "-")
    .join(" ")
    .trim();
}

export function stringifyCell(value: unknown) {
  return stringifyCellValue(value, new WeakSet(), 0);
}

function stringifyCellValue(
  value: unknown,
  seen: WeakSet<object>,
  depth: number,
): string {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return formatDateTime(value);
  if (Array.isArray(value)) {
    if (seen.has(value)) return "-";
    if (depth > 2)
      return `${value.length} item${value.length === 1 ? "" : "s"}`;
    seen.add(value);
    const rendered = value
      .slice(0, 3)
      .map((item) => stringifyCellValue(item, seen, depth + 1))
      .filter((item) => item !== "-")
      .join(", ");
    return rendered || `${value.length} item${value.length === 1 ? "" : "s"}`;
  }
  if (typeof value === "string" && looksLikeIsoDate(value)) {
    return formatDateTime(new Date(value));
  }
  if (typeof value === "object") {
    if (seen.has(value)) return "-";
    if (depth > 2) return "-";
    seen.add(value);
    const object = value as Record<string, unknown>;
    return stringifyCellValue(
      object.name ??
        object.title ??
        object.code ??
        object.label ??
        object.email ??
        object._id ??
        object.id ??
        "-",
      seen,
      depth + 1,
    );
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
      Name: joinDisplayParts(object.firstName, object.lastName) || object.email,
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
