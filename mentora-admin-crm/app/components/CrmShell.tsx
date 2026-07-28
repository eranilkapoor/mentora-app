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
  faBrain,
  faBuilding,
  faBullhorn,
  faCalendarDays,
  faChartLine,
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
  faComments,
  faCreditCard,
  faDesktop,
  faFileLines,
  faGear,
  faGrip,
  faGraduationCap,
  faHeadset,
  faHouse,
  faLock,
  faMobileScreen,
  faMoneyBillTrendUp,
  faPlug,
  faShieldHalved,
  faSort,
  faSortDown,
  faSortUp,
  faSun,
  faMoon,
  faTableColumns,
  faTableList,
  faTasks,
  faUserGraduate,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  crmSessionActions,
  addLeadAttachment,
  createTenant,
  createTenantUser,
  deleteDedicatedCrmRecord,
  deleteModuleRecord,
  createReportDefinition,
  createSampleDocument,
  createSampleDepartment,
  createSampleTeam,
  createWorkflowRule,
  executeWorkflow,
  exportLeads,
  exportModuleRecords,
  findLeadDuplicates,
  importSampleLeads,
  loadDocuments,
  loadIntegrationProviders,
  loadSecurityPolicy,
  loadTenantUsers,
  loadDedicatedCrmRecords,
  loadModuleRecords,
  loadCrmWorkspace,
  loginWithCredentials,
  saveModuleRecord,
  saveDedicatedCrmRecord,
  runCrmRecordAction,
  scoreLead,
  updateSampleBranding,
  updateSampleChannelSetting,
  updateLeadTags,
  updateCampaignMetrics,
  updateSecurityPolicy,
  updateTenant,
  upsertIntegrationProvider,
  testIntegrationProvider,
  type DemoContext,
  type DemoUser,
  type ModuleRecordDraft,
  type TenantDraft,
  type TenantUserDraft,
  useAppDispatch,
  useAppSelector,
} from "../store";
import type { CrmModule, IconName, ModuleCoverage, ModuleStatus } from "./crmTypes";
import {
  extractFirstId,
  findModuleCoverage,
  findTenantIdByName,
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
} from "./crmUtils";

type ThemeMode = "system" | "light" | "dark";

const dedicatedCrmModuleIds = new Set([
  "admissions",
  "applications",
  "automation",
  "call-center",
  "campaigns",
  "communications",
  "documents",
  "emails",
  "events",
  "field-force",
  "finance",
  "interview",
  "leads",
  "reports",
  "scholarship",
  "support",
  "sms",
  "tasks",
  "whatsapp",
]);

const moduleIcons: Record<string, IconName> = {
  admissions: "check",
  "ai-features": "ai",
  analytics: "analytics",
  applications: "document",
  authentication: "lock",
  automation: "automation",
  calendar: "calendar",
  "call-center": "headset",
  campaigns: "campaign",
  communications: "chat",
  dashboard: "dashboard",
  documents: "document",
  emails: "mail",
  notifications: "chat",
  events: "calendar",
  "field-force": "mobile",
  finance: "finance",
  integrations: "integration",
  interview: "user",
  leads: "lead",
  learning: "graduation",
  "mobile-app": "mobile",
  organizations: "building",
  payments: "payment",
  reports: "report",
  scholarship: "graduation",
  security: "shield",
  settings: "settings",
  sms: "chat",
  support: "chat",
  students: "user",
  tasks: "task",
  tenants: "tenant",
  users: "user",
  whatsapp: "chat",
};

const moduleActions: Record<string, string[]> = {
  admissions: [
    "Collect Fee",
    "Allocate Batch",
    "Provision Plan",
    "Queue Handoff",
    "Complete",
  ],
  applications: [
    "Review",
    "Request Docs",
    "Move Stage",
    "Schedule Interview",
    "Issue Offer",
    "Confirm Admission",
  ],
  authentication: [
    "Review Sessions",
    "Device Console",
    "Update Policy",
    "Configure SSO",
    "Audit Export",
  ],
  campaigns: [
    "Inventory",
    "UTM Setup",
    "Landing Page",
    "Lead Ads",
    "Remarketing",
    "Drip Journey",
    "ROI Report",
    "Conversion Tags",
  ],
  communications: [
    "Send Message",
    "Schedule",
    "Open Inbox",
    "Template",
    "Delivery Status",
    "Opt-in Controls",
  ],
  documents: ["Load Documents", "Request Document", "Verify"],
  "mobile-app": [
    "Counselor Dashboard",
    "Lead Update",
    "Voice Note",
    "Geo Check-in",
    "Offline Sync",
    "Mobile Report",
  ],
  calendar: [
    "Counseling Calendar",
    "Interview Slot",
    "Event Calendar",
    "Reminder",
    "Recurring Schedule",
    "Calendar Sync",
  ],
  finance: [
    "Invoice",
    "Receipt",
    "Refund Approval",
    "Tax Ledger",
    "Collections",
    "Pending Payments",
    "Finance Report",
    "Reconcile",
    "Export Ledger",
  ],
  automation: [
    "Assignment Rule",
    "Reminder Rule",
    "Drip Rule",
    "Escalation Rule",
    "Score Update",
    "Recycle Stale Leads",
    "Webhook",
    "Run Workflow",
    "Execution Log",
  ],
  leads: [
    "Create Lead",
    "Check Duplicates",
    "Import Leads",
    "Export Leads",
    "Score Lead",
    "Update Tags",
    "Add Attachment",
    "Assign",
    "Change Stage",
    "Log Activity",
    "Nurture Lead",
  ],
  integrations: [
    "Check Providers",
    "Configure Provider",
    "Webhook",
    "Callback Verify",
    "Health Check",
    "Export Report",
  ],
  "call-center": [
    "Incoming Call",
    "Outgoing Call",
    "Dialer Queue",
    "Recording Ref",
    "Disposition",
    "Follow-up",
    "Call Analytics",
  ],
  organizations: [
    "Create Tenant",
    "Create Branch",
    "Create Department",
    "Create Team",
    "Configure Domain",
    "Update Branding",
    "Configure Channel",
    "Export Setup",
  ],
  reports: [
    "Create Report",
    "Saved Report",
    "Dashboard Report",
    "Schedule Report",
    "Export Report",
    "Role Report",
  ],
  security: [
    "Load Policy",
    "Update Policy",
    "Configure MFA",
    "Configure SSO",
    "Audit Export",
    "Schedule Report",
  ],
  scholarship: [
    "Evaluate",
    "Verify",
    "Decision",
    "Award Amount",
    "Payment Impact",
    "Audit Trail",
    "Complete",
  ],
  interview: [
    "Schedule",
    "Assign Panel",
    "Record Result",
    "Score",
    "Recommend Offer",
    "Handoff",
    "Complete",
  ],
  whatsapp: [
    "Template",
    "Media",
    "Buttons",
    "Flows",
    "Bulk Send",
    "Automation",
    "Delivery Report",
    "Conversation History",
  ],
  emails: [
    "Template",
    "Bulk Mail",
    "Drip Campaign",
    "Open Tracking",
    "Click Tracking",
    "Bounces",
    "Unsubscribe",
    "Approval",
  ],
  sms: [
    "OTP",
    "Transactional",
    "Promotional",
    "Bulk SMS",
    "Template",
    "Provider Callback",
    "Delivery Report",
    "Compliance Status",
  ],
  notifications: [
    "Open Inbox",
    "Templates",
    "Delivery Logs",
    "Analytics",
    "Failed Queue",
    "Replay",
    "Preferences",
    "Provider Check",
  ],
  tasks: [
    "Create Task",
    "Board View",
    "SLA",
    "Reminder",
    "Comment",
    "Escalate",
    "Reassign",
    "Complete",
  ],
  payments: [
    "Application Fee",
    "Admission Fee",
    "Installment",
    "Payment Link",
    "Receipt",
    "Refund",
    "Reconciliation",
  ],
  events: [
    "Registration Form",
    "Attendance",
    "QR Check-in",
    "Webinar",
    "Campus Visit",
    "Event Lead Capture",
    "Complete",
  ],
  "field-force": [
    "Geo Tracking",
    "Route Plan",
    "Attendance",
    "Mileage",
    "Check-in",
    "Check-out",
    "Visit History",
    "Complete",
  ],
  dashboard: [
    "CEO Dashboard",
    "Management Dashboard",
    "Marketing Dashboard",
    "Finance Dashboard",
    "Counselor Dashboard",
    "Refresh KPIs",
  ],
  analytics: [
    "Lead Funnel",
    "Admission Funnel",
    "Revenue Analytics",
    "ROI Analytics",
    "Counselor Productivity",
    "Forecasting",
  ],
  "ai-features": [
    "Lead Scoring",
    "Prediction",
    "Chatbot",
    "Conversation Summary",
    "Auto Reply",
    "Follow-up Suggestion",
  ],
  users: [
    "Create CRM User",
    "Refresh Users",
    "Manage RBAC",
    "Review Access",
    "Export Users",
    "Audit Access",
  ],
};

const moduleInsights: Record<string, string[]> = {
  applications: [
    "41 under review",
    "12 waiting for documents",
    "9 offers ready",
  ],
  campaigns: ["3.8x blended ROI", "18 active journeys", "Meta leads synced"],
  communications: [
    "96% delivery",
    "42 unresolved inbox items",
    "Opt-ins healthy",
  ],
  leads: ["82 hot leads", "11 duplicates flagged", "23 SLA risks"],
  tasks: ["28 due today", "14 escalations", "91% completion SLA"],
};

const securityControlGroups = [
  {
    icon: "user" as IconName,
    title: "RBAC & Access",
    metric: "42 roles",
    description: "Roles, permissions, teams, departments, and tenant memberships.",
    actions: ["Manage RBAC", "Review Access", "Export Users"],
  },
  {
    icon: "report" as IconName,
    title: "Audit & Activity",
    metric: "18.4k events",
    description: "Audit logs, admin activity, session history, and sensitive changes.",
    actions: ["Audit Export", "Activity Logs"],
  },
  {
    icon: "shield" as IconName,
    title: "Network Controls",
    metric: "6 rules",
    description: "IP restrictions, VPN allowlists, device/session rules, and geo policy.",
    actions: ["Load Policy", "Update Policy"],
  },
  {
    icon: "lock" as IconName,
    title: "Data Protection",
    metric: "9 policies",
    description: "Data masking, encryption policy, backups, retention, and admin exports.",
    actions: ["Update Policy", "Audit Export"],
  },
  {
    icon: "integration" as IconName,
    title: "Identity Providers",
    metric: "2 providers",
    description: "2FA, SSO, Microsoft/Google login, password policy, and recovery rules.",
    actions: ["Update Policy", "Configure Provider"],
  },
  {
    icon: "settings" as IconName,
    title: "Compliance Ops",
    metric: "12 checks",
    description: "Scheduled exports, backup verification, legal hold, and compliance review.",
    actions: ["Audit Export", "Schedule Report"],
  },
];

const defaultCrmUsers = [
  {
    email: "super.admin@mentora.test",
    name: "Super Admin",
    contexts: [
      {
        tenant: "All Tenants",
        branch: "All Branches",
        role: "super_admin",
        label: "Platform Super Admin",
        modules: [
          "dashboard",
          "tenants",
          "security",
          "analytics",
          "integrations",
        ],
      },
    ],
  },
  {
    email: "counselor@mentora.test",
    name: "Admission Counselor",
    contexts: [
      {
        tenant: "Webnza Coaching",
        branch: "Delhi",
        role: "admission_counselor",
        label: "Counselor Workspace",
        modules: [
          "leads",
          "applications",
          "tasks",
          "communications",
          "calendar",
        ],
      },
    ],
  },
  {
    email: "finance@mentora.test",
    name: "Finance Manager",
    contexts: [
      {
        tenant: "Webnza Coaching",
        branch: "All Branches",
        role: "finance",
        label: "Finance Workspace",
        modules: ["payments", "finance", "reports", "scholarship"],
      },
    ],
  },
] satisfies DemoUser[];

const navGroups = [
  {
    title: "Access",
    items: ["dashboard", "authentication", "users", "security"],
  },
  {
    title: "Enrollment",
    items: [
      "organizations",
      "leads",
      "students",
      "applications",
      "admissions",
      "scholarship",
      "interview",
    ],
  },
  {
    title: "Growth",
    items: [
      "campaigns",
      "communications",
      "call-center",
      "whatsapp",
      "emails",
      "sms",
      "notifications",
      "automation",
    ],
  },
  {
    title: "Operations",
    items: [
      "mobile-app",
      "calendar",
      "tasks",
      "documents",
      "events",
      "field-force",
      "support",
    ],
  },
  {
    title: "Business",
    items: [
      "payments",
      "finance",
      "reports",
      "analytics",
      "ai-features",
      "integrations",
      "learning",
      "tenants",
      "settings",
    ],
  },
];

const modules: CrmModule[] = [
  {
    id: "leads",
    title: "Leads",
    group: "CRM",
    metric: "428",
    description:
      "Capture, deduplicate, score, assign, nurture, and track every enquiry from website, ads, WhatsApp, walk-ins, imports, and APIs.",
    filters: ["Source", "Stage", "Owner", "Branch"],
    columns: ["Lead", "Program", "Source", "Stage", "Owner", "Follow-up"],
    rows: [
      [
        "Aarav Sharma",
        "JEE Foundation",
        "Website",
        "Contacted",
        "Ritika",
        "Today 4:30 PM",
      ],
      [
        "Meera Iyer",
        "NEET Target",
        "WhatsApp",
        "Application",
        "Sahil",
        "Tomorrow",
      ],
      [
        "Kabir Khan",
        "Class 9 Science",
        "Google Ads",
        "New",
        "Unassigned",
        "Today",
      ],
      ["Rhea Jain", "Class 10 Maths", "Referral", "Counseled", "Dev", "01 Aug"],
      ["Vihaan Rao", "NEET 2026", "Walk-in", "Offer", "Ananya", "03 Aug"],
    ],
  },
  {
    id: "applications",
    title: "Applications",
    group: "CRM",
    metric: "173",
    description:
      "Manage student application forms, documents, reviewer notes, stage movement, interviews, offers, and admission confirmation.",
    filters: ["Course", "Status", "Reviewer", "Completeness"],
    columns: [
      "Application",
      "Student",
      "Course",
      "Status",
      "Completeness",
      "Reviewer",
    ],
    rows: [
      [
        "APP-000143",
        "Meera Iyer",
        "NEET Target",
        "Under review",
        "86%",
        "Ananya",
      ],
      ["APP-000144", "Pranav S", "UPSC Foundation", "Documents", "72%", "Dev"],
      [
        "APP-000145",
        "Rhea Jain",
        "Class 10 Maths",
        "Submitted",
        "94%",
        "Sahil",
      ],
      [
        "APP-000146",
        "Vihaan Rao",
        "NEET 2026",
        "Offer issued",
        "100%",
        "Ritika",
      ],
    ],
  },
  {
    id: "admissions",
    title: "Admissions",
    group: "CRM",
    metric: "64",
    description:
      "Run offer-to-enrollment workflows with fee collection, batch allocation, onboarding, and learning-plan provisioning.",
    filters: ["Offer", "Fee", "Batch", "Owner"],
    columns: ["Student", "Offer", "Fee", "Batch", "Start Date", "Owner"],
    rows: [
      ["Rhea Jain", "Issued", "Pending", "X-CBSE-A1", "01 Aug", "Ritika"],
      ["Vihaan Rao", "Accepted", "Paid", "NEET-26", "03 Aug", "Dev"],
      ["Sara Ali", "Negotiation", "Scholarship", "JEE-27", "05 Aug", "Sahil"],
    ],
  },
  {
    id: "campaigns",
    title: "Campaigns",
    group: "Growth",
    metric: "24",
    description:
      "Track campaign inventory, UTMs, landing pages, lead ads, remarketing audiences, drip journeys, source ROI, and conversion tags.",
    filters: ["Channel", "Campaign", "Source", "ROI"],
    columns: ["Campaign", "Channel", "Leads", "Applications", "Spend", "ROI"],
    rows: [
      ["NEET 2027 Webinar", "Meta", "142", "38", "INR 42K", "3.8x"],
      ["JEE Doubt Solver", "Google", "96", "21", "INR 31K", "2.9x"],
      ["Parent WhatsApp Series", "WhatsApp", "74", "18", "INR 8K", "5.2x"],
    ],
  },
  {
    id: "communications",
    title: "Communications",
    group: "Growth",
    metric: "8,412",
    description:
      "Central email, SMS, WhatsApp, call, push, and in-app message history with templates, delivery status, and opt-in controls.",
    filters: ["Channel", "Template", "Status", "Direction"],
    columns: ["Message", "Channel", "Entity", "Status", "Owner", "Time"],
    rows: [
      [
        "Demo confirmation",
        "WhatsApp",
        "Aarav Sharma",
        "Delivered",
        "System",
        "10:32 AM",
      ],
      [
        "Application reminder",
        "Email",
        "Meera Iyer",
        "Opened",
        "System",
        "09:20 AM",
      ],
      [
        "Parent callback",
        "Call",
        "Rhea Jain",
        "Completed",
        "Sahil",
        "Yesterday",
      ],
    ],
  },
  {
    id: "automation",
    title: "Automation",
    group: "Growth",
    metric: "18",
    description:
      "No-code rules for assignment, reminders, drip communication, escalations, score updates, stale-lead recycling, and webhooks.",
    filters: ["Trigger", "Status", "Owner", "Entity"],
    columns: ["Workflow", "Trigger", "Actions", "Last Run", "Status", "Owner"],
    rows: [
      [
        "Hot lead round-robin",
        "Lead created",
        "Assign + notify",
        "11:15 AM",
        "Active",
        "Ops",
      ],
      [
        "Application nudge",
        "Stage idle",
        "WhatsApp + task",
        "09:00 AM",
        "Active",
        "Marketing",
      ],
      [
        "Fee escalation",
        "Payment overdue",
        "Manager alert",
        "Yesterday",
        "Draft",
        "Finance",
      ],
    ],
  },
  {
    id: "payments",
    title: "Payments",
    group: "Business",
    metric: "INR 18.4L",
    description:
      "Application fees, admission fees, course payments, installments, receipts, refunds, scholarships, waivers, and reconciliation.",
    filters: ["Student", "Purpose", "Status", "Gateway"],
    columns: ["Receipt", "Student", "Purpose", "Amount", "Status", "Gateway"],
    rows: [
      [
        "RCPT-2191",
        "Vihaan Rao",
        "Admission fee",
        "INR 45,000",
        "Paid",
        "Razorpay",
      ],
      [
        "RCPT-2192",
        "Meera Iyer",
        "Application fee",
        "INR 1,000",
        "Paid",
        "Razorpay",
      ],
      [
        "RCPT-2193",
        "Rhea Jain",
        "Course installment",
        "INR 12,500",
        "Pending",
        "Link",
      ],
    ],
  },
  {
    id: "reports",
    title: "Reports",
    group: "Growth",
    metric: "37",
    description:
      "Funnel, source ROI, counselor productivity, branch performance, payment collections, SLA, admissions forecast, and learning reports.",
    filters: ["Report", "Owner", "Refresh", "Status"],
    columns: ["Report", "Owner", "Refresh", "Rows", "Exports", "Status"],
    rows: [
      [
        "Admission funnel",
        "Management",
        "Hourly",
        "12,842",
        "CSV/PDF",
        "Ready",
      ],
      ["Counselor productivity", "Sales", "Daily", "4,320", "CSV", "Ready"],
      ["Campaign ROI", "Marketing", "Hourly", "2,148", "CSV/PDF", "Ready"],
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    group: "Growth",
    metric: "3 alerts",
    description:
      "Central notification inbox, templates, delivery logs, failed queue, analytics, preferences, and provider health.",
    filters: ["Type", "Channel", "Status", "Owner"],
    columns: ["Notification", "Channel", "Audience", "Status", "Owner", "Updated"],
    rows: [
      ["Unread parent digest", "In-app", "Parents", "Pending", "Ops", "Today"],
      ["Failed SMS batch", "SMS", "Students", "Review", "Support", "Today"],
      ["Template approval", "Email", "Leads", "Active", "Marketing", "Yesterday"],
    ],
  },
  {
    id: "support",
    title: "Support",
    group: "Operations",
    metric: "0 open",
    description:
      "Support tickets, learner and parent issues, SLA queues, agent replies, priority handling, resolution tracking, and closure audits.",
    filters: ["Status", "Priority", "Category", "Agent"],
    columns: ["Ticket", "Category", "Priority", "Status", "Replies", "Updated"],
    rows: [],
  },
  {
    id: "learning",
    title: "Learning Operations",
    group: "Business",
    metric: "1,284",
    description:
      "Bridge enrolled students into Mentora learning: profiles, plans, AI tutor sessions, online classes, tests, progress, and parent summaries.",
    filters: ["Student", "Plan", "Tutor", "Progress"],
    columns: [
      "Student",
      "Plan",
      "Next Class",
      "Tutor",
      "Progress",
      "Parent Alert",
    ],
    rows: [
      [
        "Aarav Sharma",
        "JEE Foundation",
        "Today 6:00 PM",
        "AI Tutor",
        "62%",
        "Weekly",
      ],
      [
        "Meera Iyer",
        "NEET Target",
        "Tomorrow 7:00 PM",
        "Online Tutor",
        "48%",
        "After tests",
      ],
      [
        "Rhea Jain",
        "Class 10 Maths",
        "Fri 5:00 PM",
        "AI Tutor",
        "74%",
        "Immediate",
      ],
    ],
  },
  {
    id: "tenants",
    title: "Tenants",
    group: "Business",
    metric: "12",
    description:
      "Organizations, branches, departments, teams, counselors, managers, roles, permissions, hierarchy, data masking, and access controls.",
    filters: ["Tenant", "Type", "Plan", "Status"],
    columns: ["Tenant", "Type", "Branches", "Users", "Plan", "Status"],
    rows: [
      ["Webnza Coaching", "Coaching", "4", "82", "Enterprise", "Active"],
      ["North Campus College", "College", "2", "31", "Growth", "Active"],
      ["Bright Future School", "School", "1", "18", "Starter", "Trial"],
    ],
  },
  {
    id: "settings",
    title: "Settings",
    group: "Business",
    metric: "42",
    description:
      "Configure lead stages, sources, forms, fields, templates, roles, permissions, consent, child-safety policies, integrations, and webhooks.",
    filters: ["Category", "Owner", "Status", "Scope"],
    columns: ["Setting", "Category", "Scope", "Updated", "Owner", "Status"],
    rows: [
      ["Lead stages", "CRM", "Tenant", "Today", "Ops", "Active"],
      [
        "WhatsApp templates",
        "Communication",
        "Tenant",
        "Yesterday",
        "Marketing",
        "Review",
      ],
      [
        "Student consent policy",
        "Safety",
        "Platform",
        "22 Jul",
        "Legal",
        "Active",
      ],
    ],
  },
];

const extraModules: CrmModule[] = [
  {
    id: "authentication",
    title: "Authentication",
    group: "Access",
    metric: "9 policies",
    description:
      "CRM login, SSO readiness, MFA policy, session review, device controls, and tenant-aware access rules.",
    filters: ["Policy", "Provider", "Status", "Scope"],
    columns: ["Control", "Provider", "Scope", "Owner", "Status", "Updated"],
    rows: [
      ["MFA policy", "Password + OTP", "Admins", "Security", "Active", "Today"],
      ["Google login", "OAuth", "Tenant", "Platform", "Draft", "Yesterday"],
      ["Session review", "JWT", "All users", "Security", "Active", "22 Jul"],
    ],
  },
  {
    id: "users",
    title: "Users",
    group: "Access",
    metric: "132 users",
    description:
      "Counselors, managers, branch admins, marketing, finance, call center, field agents, students, parents, roles, teams, and hierarchy.",
    filters: ["Role", "Team", "Branch", "Status"],
    columns: ["User", "Role", "Team", "Branch", "Status", "Last Login"],
    rows: [
      ["Ritika Jain", "Counselor", "Admissions", "Delhi", "Active", "Today"],
      ["Sahil Mehta", "Marketing", "Growth", "Online", "Active", "Today"],
      ["Dev Arora", "Finance", "Collections", "Mumbai", "Active", "Yesterday"],
    ],
  },
  {
    id: "organizations",
    title: "Organizations",
    group: "Enrollment",
    metric: "12 tenants",
    description:
      "Universities, colleges, institutes, schools, coaching brands, franchises, branches, departments, domains, branding, and channel settings.",
    filters: ["Type", "Branch", "Plan", "Status"],
    columns: [
      "Organization",
      "Type",
      "Branches",
      "Departments",
      "Plan",
      "Status",
    ],
    rows: [
      ["Webnza Coaching", "Coaching", "4", "8", "Enterprise", "Active"],
      ["North Campus College", "College", "2", "5", "Growth", "Active"],
      ["Bright Future School", "School", "1", "4", "Starter", "Trial"],
    ],
  },
  {
    id: "students",
    title: "Students",
    group: "Enrollment",
    metric: "1,284",
    description:
      "Complete student profile across personal, academic, parents, address, previous education, exams, preferences, documents, payments, and timeline.",
    filters: ["Grade", "Course", "Completeness", "Owner"],
    columns: [
      "Student",
      "Grade",
      "Course",
      "Completeness",
      "Guardian",
      "Status",
    ],
    rows: [
      [
        "Aarav Sharma",
        "Class 10",
        "JEE Foundation",
        "82%",
        "Nisha Sharma",
        "Active",
      ],
      ["Meera Iyer", "Class 12", "NEET Target", "76%", "Rahul Iyer", "Active"],
      ["Rhea Jain", "Class 10", "Maths", "94%", "Pooja Jain", "Active"],
    ],
  },
  {
    id: "call-center",
    title: "Call Center",
    group: "Growth",
    metric: "312 calls",
    description:
      "Incoming calls, outgoing calls, dialer queues, call recording references, disposition, call notes, follow-ups, and call analytics.",
    filters: ["Direction", "Disposition", "Agent", "Status"],
    columns: ["Call", "Lead", "Direction", "Disposition", "Agent", "Status"],
    rows: [
      [
        "CALL-1021",
        "Aarav Sharma",
        "Outbound",
        "Interested",
        "Ritika",
        "Completed",
      ],
      ["CALL-1022", "Meera Iyer", "Inbound", "Callback", "Sahil", "Open"],
      ["CALL-1023", "Kabir Khan", "Outbound", "No answer", "Dev", "Completed"],
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    group: "Growth",
    metric: "2,840",
    description:
      "WhatsApp templates, media, buttons, flows, bulk send, automation, delivery reports, and conversation history.",
    filters: ["Template", "Status", "Campaign", "Owner"],
    columns: ["Conversation", "Template", "Entity", "Status", "Owner", "Time"],
    rows: [
      [
        "WA-551",
        "Demo reminder",
        "Aarav Sharma",
        "Delivered",
        "System",
        "10:32 AM",
      ],
      ["WA-552", "Fee nudge", "Rhea Jain", "Read", "System", "09:00 AM"],
      [
        "WA-553",
        "Application help",
        "Meera Iyer",
        "Open",
        "Sahil",
        "Yesterday",
      ],
    ],
  },
  {
    id: "emails",
    title: "Emails",
    group: "Growth",
    metric: "18 campaigns",
    description:
      "Email templates, bulk mail, drip campaigns, open tracking, click tracking, bounces, unsubscribe, and campaign approval.",
    filters: ["Campaign", "Template", "Status", "Owner"],
    columns: [
      "Campaign",
      "Template",
      "Sent",
      "Open Rate",
      "Click Rate",
      "Status",
    ],
    rows: [
      ["NEET webinar", "Invite", "4,200", "38%", "9%", "Completed"],
      ["Application nudge", "Reminder", "1,140", "42%", "11%", "Active"],
      ["Fee reminder", "Payment", "860", "46%", "14%", "Active"],
    ],
  },
  {
    id: "sms",
    title: "SMS",
    group: "Growth",
    metric: "6,920",
    description:
      "OTP, transactional, promotional, bulk SMS, templates, provider callbacks, delivery reports, and compliance status.",
    filters: ["Type", "Template", "Status", "Provider"],
    columns: ["Message", "Type", "Provider", "Sent", "Delivered", "Status"],
    rows: [
      ["OTP login", "OTP", "MSG91", "1,240", "1,210", "Active"],
      ["Demo reminder", "Transactional", "Twilio", "840", "812", "Completed"],
      [
        "Scholarship promo",
        "Promotional",
        "MSG91",
        "2,400",
        "2,190",
        "Completed",
      ],
    ],
  },
  {
    id: "mobile-app",
    title: "Mobile App",
    group: "Operations",
    metric: "46 agents",
    description:
      "Counselor mobile dashboard, lead update, notes, voice notes, geo check-ins, tasks, calls, WhatsApp, payments, reports, and offline mode.",
    filters: ["Agent", "Mode", "Sync", "Status"],
    columns: ["Agent", "Workspace", "Leads", "Tasks", "Sync", "Status"],
    rows: [
      ["Ritika Jain", "Counselor", "42", "12", "Online", "Active"],
      ["Field Team A", "Field", "18", "7", "Offline ready", "Active"],
      ["Sahil Mehta", "Marketing", "31", "9", "Online", "Active"],
    ],
  },
  {
    id: "calendar",
    title: "Calendar",
    group: "Operations",
    metric: "94 events",
    description:
      "Counseling meetings, interviews, tasks, events, reminders, recurring schedules, and Google Calendar sync readiness.",
    filters: ["Type", "Owner", "Date", "Status"],
    columns: ["Event", "Type", "Entity", "Owner", "Time", "Status"],
    rows: [
      [
        "Parent counseling",
        "Meeting",
        "Aarav Sharma",
        "Ritika",
        "Today 5 PM",
        "Open",
      ],
      [
        "Interview round 1",
        "Interview",
        "APP-000144",
        "Ananya",
        "Tomorrow",
        "Open",
      ],
      ["NEET webinar", "Webinar", "Campaign", "Marketing", "Friday", "Active"],
    ],
  },
  {
    id: "tasks",
    title: "Tasks",
    group: "Operations",
    metric: "86",
    description:
      "Daily/weekly tasks, assignment, escalation, recurring reminders, comments, SLA, manager review, and task board operations.",
    filters: ["Assignee", "Priority", "SLA", "Status"],
    columns: ["Task", "Entity", "SLA", "Assignee", "Priority", "Status"],
    rows: [
      ["Call hot lead", "Aarav Sharma", "2h", "Ritika", "High", "Open"],
      [
        "Review documents",
        "APP-000144",
        "1d",
        "Ananya",
        "Urgent",
        "In progress",
      ],
      ["Send invoice", "RCPT-2193", "4h", "Dev", "Medium", "Open"],
    ],
  },
  {
    id: "documents",
    title: "Documents",
    group: "Operations",
    metric: "392 docs",
    description:
      "Upload, preview, verification, versioning, approval, OCR readiness, PDF/image/ZIP support, and document requirement tracking.",
    filters: ["Type", "Reviewer", "Status", "Entity"],
    columns: ["Document", "Entity", "Type", "Reviewer", "Version", "Status"],
    rows: [
      ["Birth proof", "Aarav Sharma", "ID", "Ananya", "v2", "Review"],
      ["Marksheet", "Meera Iyer", "Academic", "Dev", "v1", "Approved"],
      ["Address proof", "Rhea Jain", "KYC", "Sahil", "v1", "Pending"],
    ],
  },
  {
    id: "finance",
    title: "Finance",
    group: "Business",
    metric: "INR 31.8L",
    description:
      "Invoices, receipts, refunds, tax, ledger, collections, pending payments, finance reports, and refund approval operations.",
    filters: ["Type", "Status", "Owner", "Date"],
    columns: ["Item", "Type", "Amount", "Owner", "Due", "Status"],
    rows: [
      ["Ledger July", "Ledger", "INR 31.8L", "Finance", "Closed", "Ready"],
      ["Refund RF-102", "Refund", "INR 4,500", "Dev", "Today", "Review"],
      [
        "Pending fees",
        "Collection",
        "INR 7.2L",
        "Finance",
        "This week",
        "Open",
      ],
    ],
  },
  {
    id: "scholarship",
    title: "Scholarship",
    group: "Enrollment",
    metric: "21 cases",
    description:
      "Scholarship rules, eligibility, verification, approval, award amount, payment-plan impact, and audit trail.",
    filters: ["Rule", "Amount", "Reviewer", "Status"],
    columns: ["Case", "Student", "Rule", "Amount", "Reviewer", "Status"],
    rows: [
      ["SCH-101", "Sara Ali", "Merit", "25%", "Ananya", "Review"],
      ["SCH-102", "Vihaan Rao", "Need based", "15%", "Dev", "Approved"],
      ["SCH-103", "Kabir Khan", "Early bird", "10%", "Sahil", "Pending"],
    ],
  },
  {
    id: "interview",
    title: "Interviews",
    group: "Enrollment",
    metric: "33",
    description:
      "Interview schedule, interviewer, panel, result, remarks, score, offer recommendation, and admission handoff.",
    filters: ["Panel", "Result", "Owner", "Status"],
    columns: ["Interview", "Applicant", "Panel", "Time", "Result", "Status"],
    rows: [
      ["INT-401", "Meera Iyer", "Science", "Today 3 PM", "Pending", "Open"],
      ["INT-402", "Vihaan Rao", "NEET", "Tomorrow", "Recommended", "Completed"],
      ["INT-403", "Rhea Jain", "Maths", "Friday", "Pending", "Open"],
    ],
  },
  {
    id: "events",
    title: "Events",
    group: "Operations",
    metric: "14 events",
    description:
      "Education fairs, seminars, webinars, campus visits, registrations, attendance, QR check-in, and event lead capture.",
    filters: ["Type", "City", "Owner", "Status"],
    columns: [
      "Event",
      "Type",
      "Registrations",
      "Attendance",
      "Owner",
      "Status",
    ],
    rows: [
      ["NEET webinar", "Webinar", "640", "412", "Marketing", "Active"],
      ["Delhi education fair", "Fair", "220", "164", "Field Team", "Open"],
      ["Campus visit", "Visit", "82", "61", "Admissions", "Completed"],
    ],
  },
  {
    id: "field-force",
    title: "Field Force",
    group: "Operations",
    metric: "28 visits",
    description:
      "Geo tracking, GPS, route planning, daily visits, attendance, mileage, check-in/out, and location history.",
    filters: ["Agent", "Route", "City", "Status"],
    columns: ["Visit", "Agent", "Route", "Check-in", "Mileage", "Status"],
    rows: [
      ["VIS-701", "Field Team A", "Delhi North", "10:20 AM", "18 km", "Active"],
      ["VIS-702", "Field Team B", "Gurgaon", "11:00 AM", "22 km", "Completed"],
      ["VIS-703", "Ritika Jain", "Noida", "Pending", "0 km", "Open"],
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    group: "Business",
    metric: "12 models",
    description:
      "Lead funnel, admissions funnel, revenue, conversion, ROI, counselor productivity, campaign performance, forecasting, and predictive analytics.",
    filters: ["Metric", "Segment", "Owner", "Status"],
    columns: ["Model", "Segment", "Refresh", "Accuracy", "Owner", "Status"],
    rows: [
      [
        "Lead conversion",
        "All branches",
        "Hourly",
        "91%",
        "Analytics",
        "Ready",
      ],
      ["Revenue forecast", "Enterprise", "Daily", "87%", "Finance", "Ready"],
      ["Counselor SLA", "Admissions", "Hourly", "94%", "Ops", "Active"],
    ],
  },
  {
    id: "ai-features",
    title: "AI Features",
    group: "Business",
    metric: "8 assists",
    description:
      "CRM AI lead score, prediction, chatbot, conversation summaries, auto replies, next-best action, and follow-up suggestions.",
    filters: ["Feature", "Model", "Owner", "Status"],
    columns: ["Feature", "Use Case", "Model", "Owner", "Status", "Updated"],
    rows: [
      [
        "Lead score",
        "Prioritization",
        "Rules + AI",
        "Growth",
        "Draft",
        "Today",
      ],
      [
        "Conversation summary",
        "Counseling notes",
        "LLM",
        "Ops",
        "Active",
        "Yesterday",
      ],
      [
        "Follow-up suggestion",
        "Next action",
        "LLM",
        "Admissions",
        "Draft",
        "22 Jul",
      ],
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    group: "Business",
    metric: "19",
    description:
      "Facebook Lead Ads, Google Ads/Analytics, Meta Pixel, WhatsApp, Zoom/Meet, Razorpay, ERP, LMS, SIS, API keys, and webhooks.",
    filters: ["Provider", "Category", "Owner", "Status"],
    columns: [
      "Integration",
      "Category",
      "Provider",
      "Owner",
      "Last Sync",
      "Status",
    ],
    rows: [
      ["Razorpay", "Payment", "Razorpay", "Finance", "Today", "Active"],
      ["Meta leads", "Ads", "Meta", "Marketing", "Today", "Draft"],
      ["Google Meet", "Video", "Google", "Ops", "Yesterday", "Active"],
    ],
  },
  {
    id: "security",
    title: "Security",
    group: "Access",
    metric: "17 controls",
    description:
      "RBAC, audit logs, activity logs, IP restrictions, data masking, encryption policy, backups, 2FA, SSO, and admin exports.",
    filters: ["Control", "Scope", "Owner", "Status"],
    columns: ["Control", "Scope", "Policy", "Owner", "Status", "Updated"],
    rows: [
      ["Data masking", "PII", "Role based", "Security", "Draft", "Today"],
      [
        "IP restriction",
        "Admin",
        "Office/VPN",
        "Security",
        "Review",
        "Yesterday",
      ],
      ["Audit export", "Tenant", "Monthly", "Compliance", "Active", "22 Jul"],
    ],
  },
];

const productionModuleIds = new Set([
  "leads",
  "applications",
  "tasks",
  "campaigns",
  "communications",
  "notifications",
  "tenants",
]);

const workflowModuleIds = new Set([
  "admissions",
  "automation",
  "payments",
  "reports",
  "learning",
  "settings",
  "analytics",
  "security",
]);

function getModuleStatus(id: string): ModuleStatus {
  if (productionModuleIds.has(id)) return "Active";
  if (workflowModuleIds.has(id)) return "Configured";
  return "Setup";
}

function enrichModule(module: CrmModule): CrmModule {
  return {
    ...module,
    actions: module.actions ??
      moduleActions[module.id] ?? ["Create", "Assign", "Export", "Audit"],
    icon: module.icon ?? moduleIcons[module.id] ?? "dashboard",
    insights: module.insights ??
      moduleInsights[module.id] ?? [
        "API-backed records",
        `${module.filters.length} active filters`,
        "Tenant scoped data",
      ],
    status: module.status ?? getModuleStatus(module.id),
  };
}

const allModules = [...modules, ...extraModules].map(enrichModule);

const moduleMap = Object.fromEntries(
  allModules.map((module) => [module.id, module]),
);

function getModuleHref(id: string) {
  return id === "dashboard" ? "/" : `/${id}`;
}

function resolveRouteModuleId(pathname: string | null, fallback: string) {
  const segment = pathname?.split("/").filter(Boolean)[0] ?? "";
  if (!segment) return "dashboard";
  return moduleMap[segment] ? segment : fallback || "dashboard";
}

function Icon({ name }: { name: IconName }) {
  const icons: Record<IconName, IconDefinition> = {
    ai: faBrain,
    analytics: faChartLine,
    automation: faBarsProgress,
    building: faBuilding,
    calendar: faCalendarDays,
    campaign: faBullhorn,
    chat: faComments,
    check: faCheckCircle,
    dashboard: faTableColumns,
    document: faFileLines,
    finance: faMoneyBillTrendUp,
    graduation: faGraduationCap,
    headset: faHeadset,
    integration: faPlug,
    lead: faUserGraduate,
    lock: faLock,
    mail: faComments,
    mobile: faMobileScreen,
    payment: faCreditCard,
    report: faChartLine,
    settings: faGear,
    shield: faShieldHalved,
    task: faTasks,
    tenant: faBuilding,
    user: faUsers,
  };

  return (
    <span aria-hidden="true" className="app-icon">
      <FontAwesomeIcon icon={icons[name]} />
    </span>
  );
}

export default function CrmDashboardPage() {
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
  const [tenantFormOpen, setTenantFormOpen] = useState(false);
  const [tenantUserFormOpen, setTenantUserFormOpen] = useState(false);
  const [apiSyncEnabled, setApiSyncEnabled] = useState(false);
  const mainMenuRef = useRef<HTMLElement | null>(null);
  const activeId = useMemo(
    () => resolveRouteModuleId(pathname, sessionActiveId),
    [pathname, sessionActiveId],
  );

  useEffect(() => {
    if (!apiSyncEnabled || !loggedInUser || !activeContext) return;
    void dispatch(loadCrmWorkspace());
  }, [activeContext, apiSyncEnabled, dispatch, loggedInUser]);

  useEffect(() => {
    if (!accessToken) {
      setApiSyncEnabled(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !loggedInUser || !activeContext || apiSyncEnabled) {
      return;
    }
    setApiSyncEnabled(true);
    void dispatch(loadCrmWorkspace());
  }, [accessToken, activeContext, apiSyncEnabled, dispatch, loggedInUser]);

  const activeTenantId = useMemo(
    () => workspace.activeTenantId || extractFirstId(workspace.tenants),
    [workspace.activeTenantId, workspace.tenants],
  );

  useEffect(() => {
    if (
      !loggedInUser ||
      !activeContext ||
      !apiSyncEnabled ||
      !activeTenantId ||
      activeId === "dashboard"
    ) {
      return;
    }
    if (dedicatedCrmModuleIds.has(activeId)) {
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
          tenantId: activeTenantId,
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
        tenantId: activeTenantId,
      }),
    );
  }, [
    activeContext,
    activeId,
    activeTenantId,
    apiSyncEnabled,
    currentPage,
    dispatch,
    filterValues,
    loggedInUser,
    pageSize,
    query,
    sort,
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
  const activeRows = apiSyncEnabled
    ? serverRows
    : (activeModule?.rows ?? []);
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
  const canSwitchTenant = ["super_admin", "organization_admin"].includes(
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
    const activeGroup = navGroups.find((group) => group.items.includes(activeId));
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
    void dispatch(loadCrmWorkspace());
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
    void dispatch(loadCrmWorkspace());
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
          <p>This user does not have an active tenant or branch context.</p>
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
      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before running lead operations",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("export")) {
          const result = await dispatch(
            exportLeads({ tenantId: activeTenantId }),
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
              tenantId: activeTenantId,
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
            importSampleLeads({ tenantId: activeTenantId }),
          ).unwrap();
          await dispatch(
            loadModuleRecords({
              moduleKey: activeId,
              tenantId: activeTenantId,
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
                tenantId: activeTenantId,
              }),
            ).unwrap();
            dispatch(crmSessionActions.setToast("Lead score recalculated"));
            return;
          }

          if (normalized.includes("tag")) {
            await dispatch(
              updateLeadTags({
                leadId: firstServerRecordId,
                tenantId: activeTenantId,
              }),
            ).unwrap();
            dispatch(crmSessionActions.setToast("Lead tags updated"));
            return;
          }

          await dispatch(
            addLeadAttachment({
              leadId: firstServerRecordId,
              tenantId: activeTenantId,
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
      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before managing integrations",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("configure")) {
          await dispatch(
            upsertIntegrationProvider({
              providerKey: "whatsapp_business",
              tenantId: activeTenantId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey: "whatsapp_business",
              tenantId: activeTenantId,
            }),
          ).unwrap();
          await dispatch(
            loadIntegrationProviders({ tenantId: activeTenantId }),
          ).unwrap();
          dispatch(
            crmSessionActions.setToast(
              "WhatsApp provider configured in sandbox mode",
            ),
          );
          return;
        }

        const result = await dispatch(
          loadIntegrationProviders({ tenantId: activeTenantId }),
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

    if (activeId === "organizations") {
      if (normalized.includes("tenant")) {
        if (!accessToken) {
          dispatch(
            crmSessionActions.setToast(
              "Sign in with valid credentials before creating a tenant",
            ),
          );
          return;
        }
        setTenantFormOpen(true);
        dispatch(crmSessionActions.setToast("Create a new tenant"));
        return;
      }

      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before managing organization setup",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("export") || normalized.includes("setup")) {
          const result = await dispatch(
            exportModuleRecords({
              moduleKey: activeId,
              tenantId: activeTenantId,
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
          setTenantFormOpen(true);
          dispatch(
            crmSessionActions.setToast(
              "Use tenant setup to add a campus, franchise, or branch",
            ),
          );
          return;
        }

        if (normalized.includes("department")) {
          await dispatch(
            createSampleDepartment({ tenantId: activeTenantId }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Admissions department saved"));
          return;
        }

        if (normalized.includes("team")) {
          await dispatch(
            createSampleTeam({ tenantId: activeTenantId }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Counseling team saved"));
          return;
        }

        if (normalized.includes("domain")) {
          await dispatch(
            updateSampleBranding({ tenantId: activeTenantId }),
          ).unwrap();
          dispatch(
            crmSessionActions.setToast(
              "Domain and branding metadata updated for this tenant",
            ),
          );
          return;
        }

        if (normalized.includes("branding")) {
          await dispatch(
            updateSampleBranding({ tenantId: activeTenantId }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Tenant branding updated"));
          return;
        }

        if (normalized.includes("channel")) {
          await dispatch(
            updateSampleChannelSetting({ tenantId: activeTenantId }),
          ).unwrap();
          dispatch(
            crmSessionActions.setToast("WhatsApp channel setting saved"),
          );
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
      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before managing CRM users",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("create")) {
          setTenantUserFormOpen(true);
          dispatch(crmSessionActions.setToast("Create a CRM user"));
          return;
        }

        if (
          normalized.includes("export") ||
          normalized.includes("audit") ||
          normalized.includes("access")
        ) {
          const result = await dispatch(
            exportModuleRecords({
              moduleKey: activeId,
              tenantId: activeTenantId,
            }),
          ).unwrap();
          const data = normalizeResponseObject(result);
          const rowCount = Array.isArray(data.rows) ? data.rows.length : 0;
          dispatch(
            crmSessionActions.setToast(
              `${rowCount} user rows prepared for access review`,
            ),
          );
          return;
        }

        const result = await dispatch(
          loadTenantUsers({ tenantId: activeTenantId }),
        ).unwrap();
        const users = normalizeResponseArray(result);
        dispatch(
          crmSessionActions.setToast(`${users.length} tenant users loaded`),
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
      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before managing authentication",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("policy")) {
          await dispatch(
            updateSecurityPolicy({ tenantId: activeTenantId }),
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
              tenantId: activeTenantId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey,
              tenantId: activeTenantId,
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
            exportModuleRecords({
              moduleKey: activeId,
              tenantId: activeTenantId,
            }),
          ).unwrap();
          const data = normalizeResponseObject(result);
          const rowCount = Array.isArray(data.rows) ? data.rows.length : 0;
          dispatch(
            crmSessionActions.setToast(
              `${rowCount} authentication records prepared for review`,
            ),
          );
          return;
        }

        await dispatch(
          loadSecurityPolicy({ tenantId: activeTenantId }),
        ).unwrap();
        dispatch(crmSessionActions.setToast("Authentication policy loaded"));
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

    if (activeId === "campaigns") {
      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before managing campaigns",
          ),
        );
        return;
      }

      try {
        if (normalized.includes("roi") && firstServerRecordId) {
          await dispatch(
            updateCampaignMetrics({
              campaignId: firstServerRecordId,
              tenantId: activeTenantId,
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Campaign ROI metrics updated"));
          return;
        }

        await dispatch(
          runCrmRecordAction({
            path: "/campaigns",
            body: {
              tenantId: activeTenantId,
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
      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before managing communications",
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
              tenantId: activeTenantId,
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
              tenantId: activeTenantId,
            }),
          ).unwrap();
        }

        await dispatch(
          runCrmRecordAction({
            path: "/communications",
            body: {
              tenantId: activeTenantId,
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
      if (!apiSyncEnabled || !activeTenantId) {
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
              tenantId: activeTenantId,
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
            tenantId: activeTenantId,
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
      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before managing this channel",
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
              tenantId: activeTenantId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey:
                activeId === "call-center"
                  ? "dialer_recording"
                  : "whatsapp_business",
              tenantId: activeTenantId,
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
                    tenantId: activeTenantId,
                    outcome: "completed",
                    result: { action: label },
                  }
                : {
                    tenantId: activeTenantId,
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
                tenantId: activeTenantId,
                title:
                  activeId === "call-center"
                    ? `${label} record`
                    : `${label} conversation`,
                description: label,
                priority: normalized.includes("incoming") ? "high" : "medium",
                status: "open",
                payload: {
                  bulkSend: normalized.includes("bulk"),
                  channel:
                    activeId === "call-center" ? "call" : "whatsapp",
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
      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before running this module action",
          ),
        );
        return;
      }

      try {
        if (activeId === "documents") {
          if (normalized.includes("load")) {
            const result = await dispatch(
              loadDocuments({ tenantId: activeTenantId }),
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
              tenantId: activeTenantId,
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
                    tenantId: activeTenantId,
                    decision: "offer_issued",
                    offer: { expiresInDays: 7, seatType: "regular" },
                    reason: "MVP CRM offer action",
                  }
                : {
                    tenantId: activeTenantId,
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
              tenantId: activeTenantId,
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
                    tenantId: activeTenantId,
                    targetSystem: "mentora-lms",
                    payload: { syncMode: "queued" },
                  }
                : {
                    tenantId: activeTenantId,
                    allocation: {
                      feeCollection:
                        normalized.includes("fee") ||
                        normalized.includes("provision")
                          ? { status: "verified", amount: 25000 }
                          : undefined,
                      learningPlan:
                        normalized.includes("provision")
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
                    tenantId: activeTenantId,
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
                    tenantId: activeTenantId,
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
                tenantId: activeTenantId,
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
                    tenantId: activeTenantId,
                    outcome: "completed",
                    result: { action: label },
                  }
                : {
                    tenantId: activeTenantId,
                    payload: {
                      attendance: normalized.includes("attendance"),
                      campusVisit: normalized.includes("campus"),
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
                tenantId: activeTenantId,
              }),
            ).unwrap();
            await dispatch(
              testIntegrationProvider({
                providerKey: "geo_telemetry",
                tenantId: activeTenantId,
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
                    tenantId: activeTenantId,
                    outcome: "completed",
                    result: { action: label },
                  }
                : {
                    tenantId: activeTenantId,
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
                    tenantId: activeTenantId,
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
                    tenantId: activeTenantId,
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
                tenantId: activeTenantId,
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
      if (!apiSyncEnabled || !activeTenantId) {
        requestApiContext("Syncing CRM workspace before running this operation");
        return;
      }

      try {
        if (activeId === "calendar" && normalized.includes("sync")) {
          await dispatch(
            upsertIntegrationProvider({
              providerKey: "calendar_sync",
              tenantId: activeTenantId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey: "calendar_sync",
              tenantId: activeTenantId,
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
              tenantId: activeTenantId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey: "accounting_export",
              tenantId: activeTenantId,
            }),
          ).unwrap();
        }

        if (activeId === "ai-features") {
          await dispatch(
            upsertIntegrationProvider({
              providerKey: "ai_provider_metering",
              tenantId: activeTenantId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey: "ai_provider_metering",
              tenantId: activeTenantId,
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
            tenantId: activeTenantId,
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
      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before managing security policy",
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
              tenantId: activeTenantId,
            }),
          ).unwrap();
          await dispatch(
            testIntegrationProvider({
              providerKey,
              tenantId: activeTenantId,
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
              tenantId: activeTenantId,
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
              tenantId: activeTenantId,
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
            updateSecurityPolicy({ tenantId: activeTenantId }),
          ).unwrap();
          dispatch(
            crmSessionActions.setToast(
              "Tenant security policy updated with MFA and masking controls",
            ),
          );
          return;
        }

        await dispatch(
          loadSecurityPolicy({ tenantId: activeTenantId }),
        ).unwrap();
        dispatch(crmSessionActions.setToast("Tenant security policy loaded"));
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
      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before exporting records",
          ),
        );
        return;
      }

      try {
        if (activeId === "reports") {
          await dispatch(
            createReportDefinition({
              moduleKey: activeId,
              tenantId: activeTenantId,
            }),
          ).unwrap();
        }
        const result = await dispatch(
          exportModuleRecords({
            moduleKey: activeId,
            tenantId: activeTenantId,
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
      if (!apiSyncEnabled || !activeTenantId) {
        dispatch(
          crmSessionActions.setToast(
            "Enable API sync and tenant context before running workflow actions",
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
              tenantId: activeTenantId,
            }),
          ).unwrap();
          dispatch(crmSessionActions.setToast("Workflow rule created"));
          return;
        }

        await dispatch(
          executeWorkflow({ moduleKey: activeId, tenantId: activeTenantId }),
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
    if (!activeTenantId) {
      dispatch(crmSessionActions.setToast("Tenant context is required"));
      return;
    }
    const recordId = findModuleRecordIdForRow(
      workspace.moduleRecords[activeModule.id],
      row,
    );
    if (!recordId) {
      dispatch(crmSessionActions.setToast("API record was not found"));
      return;
    }
    if (dedicatedCrmModuleIds.has(activeModule.id)) {
      await dispatch(
        deleteDedicatedCrmRecord({
          moduleKey: activeModule.id,
          recordId,
          tenantId: activeTenantId,
        }),
      ).unwrap();
    } else {
      await dispatch(
        deleteModuleRecord({
          moduleKey: activeModule.id,
          recordId,
          tenantId: activeTenantId,
        }),
      ).unwrap();
    }
    dispatch(crmSessionActions.setToast(`${activeModule.title} record archived`));
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
              <ThemeSelector
                setThemeMode={(value) =>
                  dispatch(crmSessionActions.setThemeMode(value))
                }
                themeMode={themeMode}
              />
              <ContextSummary
                activeContext={currentContext}
                canSwitchBranch={canSwitchBranch}
                canSwitchTenant={canSwitchTenant}
                contextCount={loggedInUser.contexts.length}
                onSwitch={() =>
                  dispatch(crmSessionActions.switchToNextContext())
                }
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

        <ServerStatus
          activeContext={currentContext}
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
          }}
          workspace={workspace}
        />

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
            openRecordForm={setRecordForm}
            archiveRow={archiveRow}
            runAction={runAction}
          />
        )}

        {recordForm && activeModule ? (
          <RecordFormModal
            module={activeModule}
            onClose={() => setRecordForm(null)}
            onSubmit={async (draft) => {
              const finalDraft = {
                ...draft,
                moduleKey: activeModule.id,
                tenantId: activeTenantId,
              };
              if (!apiSyncEnabled || !activeTenantId || workspace.error) {
                dispatch(
                  crmSessionActions.setToast(
                    "API sync and tenant context are required before saving",
                  ),
                );
                return;
              }
              try {
                if (activeModule.id === "tenants") {
                  const tenantId = findTenantIdByName(
                    workspace.tenants,
                    finalDraft.title,
                  );
                  if (!tenantId) {
                    dispatch(
                      crmSessionActions.setToast(
                        "Tenant record was not found in the API response",
                      ),
                    );
                    return;
                  }
                  await dispatch(
                    updateTenant({
                      id: tenantId,
                      name: finalDraft.title,
                      primaryDomain:
                        finalDraft.payload.primaryDomain ||
                        finalDraft.payload.domain ||
                        undefined,
                      type: finalDraft.payload.type || "coaching",
                    }),
                  ).unwrap();
                  await dispatch(loadCrmWorkspace()).unwrap();
                  dispatch(crmSessionActions.setToast("Tenant updated"));
                  setRecordForm(null);
                  return;
                }
                if (dedicatedCrmModuleIds.has(activeModule.id)) {
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
          />
        ) : null}

        {tenantFormOpen ? (
          <TenantFormModal
            onClose={() => setTenantFormOpen(false)}
            onSubmit={async (draft) => {
              await dispatch(createTenant(draft)).unwrap();
              await dispatch(loadCrmWorkspace()).unwrap();
              dispatch(crmSessionActions.setToast("Tenant created"));
              setTenantFormOpen(false);
            }}
          />
        ) : null}

        {tenantUserFormOpen ? (
          <TenantUserFormModal
            activeTenantId={activeTenantId}
            onClose={() => setTenantUserFormOpen(false)}
            onSubmit={async (draft) => {
              await dispatch(createTenantUser(draft)).unwrap();
              await dispatch(loadTenantUsers({ tenantId: draft.tenantId })).unwrap();
              dispatch(crmSessionActions.setToast("CRM user created"));
              setTenantUserFormOpen(false);
            }}
          />
        ) : null}

        <div className="crm-toast" role="status">
          {toast}
        </div>
      </main>
    </div>
  );
}

function LoginScreen({
  loginEmail,
  loginError,
  loginPassword,
  setLoginEmail,
  setLoginPassword,
  login,
  themeMode,
}: {
  loginEmail: string;
  loginError: string | null;
  loginPassword: string;
  setLoginEmail: (value: string) => void;
  setLoginPassword: (value: string) => void;
  login: () => Promise<void>;
  themeMode: ThemeMode;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!loginEmail.trim() || !loginPassword) return;
    setIsSubmitting(true);
    try {
      await login();
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={`auth-screen theme-${themeMode}`}>
      <section className="auth-card card shadow-lg">
        <span className="brand-mark">M</span>
        <h1>Mentora CRM Login</h1>
        <p>Sign in with seeded or CRM-created credentials.</p>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            className="form-control"
            onChange={(event) => setLoginEmail(event.target.value)}
            placeholder="admin@mentora.test"
            type="email"
            value={loginEmail}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            className="form-control"
            onChange={(event) => setLoginPassword(event.target.value)}
            placeholder="Password"
            type="password"
            value={loginPassword}
          />
        </label>
        {loginError ? <div className="auth-error">{loginError}</div> : null}
        <button
          className="btn btn-primary"
          disabled={!loginEmail.trim() || !loginPassword || isSubmitting}
          onClick={() => {
            void submit();
          }}
          type="button"
        >
          {isSubmitting ? "Signing In" : "Sign In"}
        </button>
      </section>
    </main>
  );
}

function ThemeSelector({
  setThemeMode,
  themeMode,
}: {
  setThemeMode: (value: ThemeMode) => void;
  themeMode: ThemeMode;
}) {
  const options: Array<{
    icon: IconDefinition;
    label: string;
    value: ThemeMode;
  }> = [
    { icon: faDesktop, label: "System", value: "system" },
    { icon: faSun, label: "Light", value: "light" },
    { icon: faMoon, label: "Dark", value: "dark" },
  ];

  return (
    <fieldset className="theme-switcher" aria-label="Theme mode">
      <legend>Theme</legend>
      <div className="theme-radio-group">
        {options.map((option) => (
          <label
            className={themeMode === option.value ? "selected" : ""}
            key={option.value}
            title={`${option.label} theme`}
          >
            <input
              checked={themeMode === option.value}
              name="crm-theme"
              onChange={() => setThemeMode(option.value)}
              type="radio"
              value={option.value}
            />
            <FontAwesomeIcon icon={option.icon} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ContextSummary({
  activeContext,
  canSwitchBranch,
  canSwitchTenant,
  contextCount,
  onSwitch,
}: {
  activeContext: DemoContext;
  canSwitchBranch: boolean;
  canSwitchTenant: boolean;
  contextCount: number;
  onSwitch: () => void;
}) {
  return (
    <div className="context-summary" aria-label="Active CRM context">
      <Icon name="tenant" />
      <div>
        <span>{canSwitchTenant ? "Tenant / Branch" : "Workspace"}</span>
        <strong>
          {canSwitchTenant
            ? activeContext.tenant
            : canSwitchBranch
              ? activeContext.branch
              : activeContext.label}
        </strong>
        <em>
          {activeContext.role.replaceAll("_", " ")}
          {canSwitchTenant
            ? ` / ${activeContext.branch}`
            : canSwitchBranch
              ? ` / ${activeContext.tenant}`
              : ""}
        </em>
      </div>
      {(canSwitchTenant || canSwitchBranch) && contextCount > 1 ? (
        <button className="context-switch-button" onClick={onSwitch} type="button">
          Switch
        </button>
      ) : null}
    </div>
  );
}

function ServerStatus({
  activeContext,
  apiSyncEnabled,
  onSync,
  workspace,
}: {
  activeContext: DemoContext;
  apiSyncEnabled: boolean;
  onSync: () => void;
  workspace: {
    coverage: unknown[];
    activeTenantId: string;
    error: string | null;
    loading: boolean;
    tenants: unknown[];
  };
}) {
  const statusLabel = workspace.loading
    ? "Syncing workspace"
    : workspace.error
      ? "API sync unavailable"
      : apiSyncEnabled
        ? "Server workspace synced"
        : "Sign in and sync workspace";

  return (
    <section className="workspace-health" aria-label="API workspace status">
      <div className="workspace-health-main">
        <span
          className={
            workspace.error || !apiSyncEnabled
              ? "server-dot warn"
              : "server-dot"
          }
        />
        <div>
          <strong>{statusLabel}</strong>
          <span>
            {apiSyncEnabled
              ? `${workspace.tenants.length} tenant${workspace.tenants.length === 1 ? "" : "s"} loaded / ${workspace.activeTenantId ? "tenant scoped" : "waiting for tenant scope"}`
              : "Protected CRM APIs are idle until a valid auth token is synced."}
          </span>
        </div>
      </div>
      <div className="workspace-health-meta">
        <div>
          <span>Role</span>
          <strong>{activeContext.role.replaceAll("_", " ")}</strong>
        </div>
        <div>
          <span>Branch</span>
          <strong>{activeContext.branch}</strong>
        </div>
        <div>
          <span>Modules</span>
          <strong>{workspace.coverage.length || activeContext.modules.length}</strong>
        </div>
      </div>
      {workspace.error ? (
        <em className="workspace-health-error">{workspace.error}</em>
      ) : null}
      <button
        className="server-sync-button"
        disabled={workspace.loading}
        onClick={onSync}
        type="button"
      >
        <FontAwesomeIcon icon={faArrowsRotate} />
        {workspace.loading ? "Syncing" : "Refresh"}
      </button>
    </section>
  );
}

function Dashboard({
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
    tenants: unknown[];
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
          onClick={() => openModule("tenants")}
          type="button"
        >
          <Icon name="tenant" />
          <span>Server tenants</span>
          <strong>{workspace.tenants.length}</strong>
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

function ModulePanel(props: {
  activeContext: DemoContext;
  coverage: ModuleCoverage | null;
  detail: string[] | null;
  filterValues: Record<string, string>;
  module: CrmModule;
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
  runAction: (label: string) => Promise<void>;
}) {
  const module = props.module;
  const readinessLabel = props.coverage
    ? formatReadiness(props.coverage)
    : module.status;
  const allVisibleIds = props.rows.map((row) => row.join("|"));
  const allSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => props.selected.includes(id));
  const pageNumbers = Array.from(
    { length: Math.min(5, props.totalPages) },
    (_, index) =>
      Math.max(
        1,
        Math.min(props.totalPages - Math.min(4, props.totalPages - 1), props.currentPage - 2),
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
            <span>{props.activeContext.tenant}</span>
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
            <strong>{props.currentPage}/{props.totalPages}</strong>
          </div>
        </div>
      </div>

      <div className="insight-grid" aria-label={`${module.title} insights`}>
        {module.insights?.map((insight, index) => (
          <div className="insight-card" key={insight}>
            <span>Insight {index + 1}</span>
            <strong>{insight}</strong>
          </div>
        ))}
      </div>

      {module.id === "security" ? (
        <SecurityControlCenter runAction={props.runAction} />
      ) : null}

      <div className="navigationlist">
        <div className="action-row">
          <button
            className="btn btn-primary"
            onClick={() => props.openRecordForm({ mode: "create" })}
            type="button"
          >
            <Icon name="check" />
            New Record
          </button>
          {module.actions?.map((action, index) => (
            <button
              className={
                index > 1 ? "btn btn-light secondary" : "btn btn-primary"
              }
              key={action}
              onClick={() =>
                action.toLowerCase() === "create"
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
            onClick={() => {
              props.setQuery("");
              props.setFilterValues({});
            }}
            type="button"
          >
            Reset Search
          </button>
          <span>{props.selectedCount} selected</span>
        </div>
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
                  <th>S. No.</th>
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
                  <th>Action</th>
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
                          the current tenant, filters, and search.
                        </span>
                        <button
                          className="btn btn-light btn-sm"
                          onClick={() =>
                            props.openRecordForm({ mode: "create" })
                          }
                          type="button"
                        >
                          Create record
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  props.rows.map((row, rowIndex) => {
                  const id = row.join("|");
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
                        <td key={`${id}-${index}`}>{renderCell(value)}</td>
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
                        <button
                          onClick={() => {
                            void props.archiveRow(row);
                          }}
                          type="button"
                        >
                          <Icon name="shield" />
                          Archive
                        </button>
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
                  current tenant, filters, and search.
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
              props.rows.map((row) => {
              const id = row.join("|");
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
                    <button
                      className="btn btn-light btn-sm"
                      onClick={() => {
                        void props.archiveRow(row);
                      }}
                      type="button"
                    >
                      Archive
                    </button>
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
            Page {props.currentPage} of {props.totalPages} / {props.total} records
          </span>
        </div>
      </div>

      {props.detail ? (
        <aside className="detail-panel">
          <button
            className="panel-close"
            onClick={() => props.setDetail(null)}
            type="button"
          >
            Close
          </button>
          <span className="eyebrow">Record Detail</span>
          <div className="panel-title">
            <Icon name={module.icon ?? "document"} />
            <h3>{props.detail[0]}</h3>
          </div>
          {module.columns.map((column, index) => (
            <div className="detail-row" key={column}>
              <span>{column}</span>
              <strong>{props.detail?.[index]}</strong>
            </div>
          ))}
          <button
            className="btn btn-primary"
            onClick={() => props.runAction("Follow-up")}
            type="button"
          >
            <Icon name="task" />
            Create Follow-up
          </button>
        </aside>
      ) : null}
    </section>
  );
}

function SecurityControlCenter({
  runAction,
}: {
  runAction: (label: string) => Promise<void>;
}) {
  return (
    <section className="security-control-center" aria-label="Security controls">
      <div className="security-control-head">
        <div>
          <span className="eyebrow">Security Control Center</span>
          <h3>Access, identity, data protection, and compliance</h3>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            void runAction("Load Policy");
          }}
          type="button"
        >
          <Icon name="shield" />
          Load Tenant Policy
        </button>
      </div>
      <div className="security-control-grid">
        {securityControlGroups.map((group) => (
          <article className="security-control-card" key={group.title}>
            <div className="security-control-card-head">
              <Icon name={group.icon} />
              <div>
                <span>{group.title}</span>
                <strong>{group.metric}</strong>
              </div>
            </div>
            <p>{group.description}</p>
            <div className="security-control-actions">
              {group.actions.map((action) => (
                <button
                  className="btn btn-light btn-sm"
                  key={action}
                  onClick={() => {
                    void runAction(action);
                  }}
                  type="button"
                >
                  {action}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecordFormModal({
  module,
  onClose,
  onSubmit,
  row,
}: {
  module: CrmModule;
  onClose: () => void;
  onSubmit: (draft: ModuleRecordDraft) => Promise<void>;
  row?: string[];
}) {
  const [title, setTitle] = useState(row?.[0] ?? "");
  const [description, setDescription] = useState(
    row ? `${module.title} record update` : "",
  );
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");
  const [dueAt, setDueAt] = useState("");
  const [payload, setPayload] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      module.columns
        .slice(1, 6)
        .map((column, index) => [toPayloadKey(column), row?.[index + 1] ?? ""]),
    ),
  );
  const [isSaving, setIsSaving] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setIsSaving(true);
    await onSubmit({
      description,
      dueAt: dueAt || undefined,
      moduleKey: module.id,
      payload,
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
              {row ? "Edit" : "Create"} {module.title} Record
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
            <span className="label">Title</span>
            <input
              className="input form-control"
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          </label>
          <label className="formrow wide">
            <span className="label">Description</span>
            <textarea
              className="input form-control record-textarea"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </label>
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
          {module.columns.slice(1, 6).map((column) => {
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

function TenantFormModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (draft: TenantDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<TenantDraft>({
    code: "",
    name: "",
    primaryDomain: "",
    type: "coaching",
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit() {
    const code = draft.code?.trim() ?? "";
    if (!draft.name.trim() || !code) return;
    setIsSaving(true);
    setError("");
    try {
      await onSubmit({
        ...draft,
        code: code.toUpperCase(),
        name: draft.name.trim(),
        primaryDomain: draft.primaryDomain?.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tenant creation failed");
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
            <h3>Create Tenant</h3>
          </div>
          <button className="btn btn-light btn-sm" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <div className="record-form-grid">
          <label className="formrow wide">
            <span className="label">Tenant Name</span>
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
        </div>
        {error ? <div className="auth-error modal-error">{error}</div> : null}
        <div className="record-modal-actions">
          <button className="btn btn-light" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!draft.name.trim() || !draft.code?.trim() || isSaving}
            onClick={() => {
              void submit();
            }}
            type="button"
          >
            {isSaving ? "Creating" : "Create Tenant"}
          </button>
        </div>
      </section>
    </div>
  );
}

function TenantUserFormModal({
  activeTenantId,
  onClose,
  onSubmit,
}: {
  activeTenantId: string;
  onClose: () => void;
  onSubmit: (draft: TenantUserDraft) => Promise<void>;
}) {
  const [draft, setDraft] = useState<TenantUserDraft>({
    email: "",
    password: "",
    role: "admission_counselor",
    tenantId: activeTenantId,
  });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit() {
    if (!draft.tenantId || !draft.email.trim() || draft.password.length < 8) {
      setError("Tenant, email, and an 8 character password are required");
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
          <button className="btn btn-light btn-sm" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <div className="record-form-grid">
          <label className="formrow wide">
            <span className="label">Tenant ID</span>
            <input
              className="input form-control"
              onChange={(event) =>
                setDraft({ ...draft, tenantId: event.target.value })
              }
              value={draft.tenantId}
            />
          </label>
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
            disabled={!draft.tenantId || !draft.email.trim() || isSaving}
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
    return <span className="badge good">{value}</span>;
  if (
    [
      "pending",
      "review",
      "draft",
      "open",
      "in progress",
      "under review",
      "documents",
    ].includes(normalized)
  )
    return <span className="badge warn">{value}</span>;
  if (["urgent", "high", "hot"].includes(normalized))
    return <span className="badge danger">{value}</span>;
  return value;
}

function findModuleRecordIdForRow(records: unknown[] | undefined, row: string[]) {
  if (!records?.length) return "";
  const title = row[0];
  const record = records.find((item) => {
    if (!item || typeof item !== "object") return false;
    return (item as { title?: unknown }).title === title;
  });
  return getUnknownRecordId(record);
}
