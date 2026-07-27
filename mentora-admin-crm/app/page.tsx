"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBarsProgress,
  faBell,
  faBrain,
  faBuilding,
  faBullhorn,
  faCalendarDays,
  faChartLine,
  faCheckCircle,
  faComments,
  faCreditCard,
  faFileLines,
  faGear,
  faGraduationCap,
  faHeadset,
  faLock,
  faMobileScreen,
  faMoneyBillTrendUp,
  faPlug,
  faShieldHalved,
  faTableColumns,
  faTasks,
  faUserGraduate,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  crmSessionActions,
  crmWorkspaceActions,
  loadModuleRecords,
  loadCrmWorkspace,
  saveModuleRecord,
  type DemoContext,
  type DemoUser,
  type ModuleRecordDraft,
  useAppDispatch,
  useAppSelector,
} from "./store";

type CrmModule = {
  id: string;
  title: string;
  group: string;
  metric: string;
  icon?: IconName;
  status?: ModuleStatus;
  description: string;
  filters: string[];
  columns: string[];
  rows: string[][];
  actions?: string[];
  insights?: string[];
};

type ThemeMode = "system" | "light" | "dark";

type ModuleStatus = "Production MVP" | "Workflow MVP" | "Foundation";

type IconName =
  | "ai"
  | "analytics"
  | "automation"
  | "building"
  | "calendar"
  | "campaign"
  | "chat"
  | "check"
  | "dashboard"
  | "document"
  | "finance"
  | "graduation"
  | "headset"
  | "integration"
  | "lead"
  | "lock"
  | "mail"
  | "mobile"
  | "payment"
  | "report"
  | "settings"
  | "shield"
  | "task"
  | "tenant"
  | "user";

const moduleIcons: Record<string, IconName> = {
  admissions: "check",
  ai_features: "ai",
  analytics: "analytics",
  applications: "document",
  authentication: "lock",
  automation: "automation",
  calendar: "calendar",
  call_center: "headset",
  campaigns: "campaign",
  communications: "chat",
  dashboard: "dashboard",
  dashboard_module: "dashboard",
  document_management: "document",
  email_crm: "mail",
  event_management: "calendar",
  field_force_automation: "mobile",
  finance: "finance",
  integrations: "integration",
  interview: "user",
  leads: "lead",
  learning: "graduation",
  mobile_crm: "mobile",
  organization_management: "building",
  payments: "payment",
  reports: "report",
  scholarship: "graduation",
  security: "shield",
  settings: "settings",
  sms: "chat",
  student_profile: "user",
  task_management: "task",
  tasks: "task",
  tenants: "tenant",
  user_management: "user",
  whatsapp_crm: "chat",
};

const moduleActions: Record<string, string[]> = {
  applications: ["Review", "Request Docs", "Move Stage", "Issue Offer"],
  campaigns: ["Launch", "Pause", "Duplicate", "ROI Report"],
  communications: ["Send Message", "Schedule", "Open Inbox", "Template"],
  leads: ["Create Lead", "Assign", "Change Stage", "Log Activity"],
  tasks: ["Create Task", "Escalate", "Reassign", "Complete"],
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

const demoUsers = [
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
    items: ["dashboard", "authentication", "user_management", "security"],
  },
  {
    title: "Enrollment",
    items: [
      "organization_management",
      "leads",
      "student_profile",
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
      "call_center",
      "whatsapp_crm",
      "email_crm",
      "sms",
      "automation",
    ],
  },
  {
    title: "Operations",
    items: [
      "mobile_crm",
      "calendar",
      "tasks",
      "task_management",
      "document_management",
      "event_management",
      "field_force_automation",
    ],
  },
  {
    title: "Business",
    items: [
      "payments",
      "finance",
      "reports",
      "analytics",
      "dashboard_module",
      "ai_features",
      "integrations",
      "learning",
      "tenants",
      "settings",
    ],
  },
];

const kpis = [
  ["New leads", "428", "+12.4%", "82 hot leads"],
  ["Applications", "173", "+8.1%", "41 under review"],
  ["Follow-ups due", "86", "-6.2%", "28 high priority"],
  ["Revenue", "INR 18.4L", "+18.7%", "94 receipts"],
  ["Counselor SLA", "91%", "+4.3%", "first response"],
  ["AI sessions", "1,284", "+22.9%", "this month"],
];

const pipeline = [
  ["New", "128"],
  ["Contacted", "94"],
  ["Counseled", "76"],
  ["Application", "51"],
  ["Offer", "29"],
  ["Enrolled", "18"],
];

const modules: CrmModule[] = [
  {
    id: "leads",
    title: "Lead Management",
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
    id: "tasks",
    title: "Tasks",
    group: "CRM",
    metric: "86",
    description:
      "Counselor and operations task board for calls, follow-ups, document review, fee reminders, parent callbacks, and onboarding.",
    filters: ["Assignee", "Priority", "Due", "Status"],
    columns: ["Task", "Entity", "Priority", "Assignee", "Due", "Status"],
    rows: [
      [
        "Call parent after demo",
        "Aarav Sharma",
        "High",
        "Ritika",
        "Today",
        "Open",
      ],
      [
        "Verify birth document",
        "APP-000144",
        "Urgent",
        "Ananya",
        "Today",
        "In progress",
      ],
      ["Send fee reminder", "Rhea Jain", "Medium", "Sahil", "Tomorrow", "Open"],
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
    title: "Tenants And Users",
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
    id: "user_management",
    title: "User Management",
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
    id: "organization_management",
    title: "Organization Management",
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
    id: "student_profile",
    title: "Student Profile",
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
    id: "call_center",
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
    id: "whatsapp_crm",
    title: "WhatsApp CRM",
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
    id: "email_crm",
    title: "Email CRM",
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
    title: "SMS Module",
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
    id: "mobile_crm",
    title: "Mobile App CRM",
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
    id: "task_management",
    title: "Task Management",
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
    id: "document_management",
    title: "Document Management",
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
    title: "Finance Module",
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
    title: "Interview Module",
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
    id: "event_management",
    title: "Event Management",
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
    id: "field_force_automation",
    title: "Field Force Automation",
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
    id: "dashboard_module",
    title: "Dashboard Module",
    group: "Business",
    metric: "6 roles",
    description:
      "CEO, management, marketing, finance, admission manager, and counselor dashboards with scoped KPIs and report cards.",
    filters: ["Role", "Widget", "Scope", "Status"],
    columns: ["Dashboard", "Role", "Widgets", "Refresh", "Owner", "Status"],
    rows: [
      ["CEO overview", "CEO", "18", "Hourly", "Management", "Ready"],
      ["Counselor desk", "Counselor", "12", "Live", "Ops", "Active"],
      ["Finance board", "Finance", "10", "Daily", "Finance", "Ready"],
    ],
  },
  {
    id: "ai_features",
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
  "dashboard_module",
  "security",
]);

function getModuleStatus(id: string): ModuleStatus {
  if (productionModuleIds.has(id)) return "Production MVP";
  if (workflowModuleIds.has(id)) return "Workflow MVP";
  return "Foundation";
}

function enrichModule(module: CrmModule): CrmModule {
  return {
    ...module,
    actions: module.actions ??
      moduleActions[module.id] ?? ["Create", "Assign", "Export", "Audit"],
    icon: module.icon ?? moduleIcons[module.id] ?? "dashboard",
    insights: module.insights ??
      moduleInsights[module.id] ?? [
        `${module.rows.length} live records`,
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
  const {
    activeContext,
    activeId,
    loggedInUser,
    loginEmail,
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
  const [apiSyncEnabled, setApiSyncEnabled] = useState(false);

  useEffect(() => {
    if (!apiSyncEnabled || !loggedInUser || !activeContext) return;
    void dispatch(loadCrmWorkspace());
  }, [activeContext, apiSyncEnabled, dispatch, loggedInUser]);

  const activeTenantId = useMemo(
    () => extractFirstId(workspace.tenants),
    [workspace.tenants],
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
    void dispatch(
      loadModuleRecords({ moduleKey: activeId, tenantId: activeTenantId }),
    );
  }, [
    activeContext,
    activeId,
    activeTenantId,
    apiSyncEnabled,
    dispatch,
    loggedInUser,
  ]);

  const activeModule = moduleMap[activeId];
  const serverRows = useMemo(
    () =>
      activeModule
        ? recordsToRows(workspace.moduleRecords[activeModule.id], activeModule)
        : [],
    [activeModule, workspace.moduleRecords],
  );
  const activeRows =
    serverRows.length > 0 ? serverRows : (activeModule?.rows ?? []);
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

  const visibleRows = filteredRows.slice(0, pageSize);
  const selectedCount = selected.length;

  function openModule(id: string) {
    dispatch(
      crmSessionActions.openModule({
        id,
        title: id === "dashboard" ? "Dashboard" : moduleMap[id].title,
      }),
    );
    setSelected([]);
    setQuery("");
    setFilterValues({});
    setDetail(null);
  }

  function login() {
    const user =
      demoUsers.find((demoUser) => demoUser.email === loginEmail) ??
      demoUsers[0];
    dispatch(crmSessionActions.login(user));
  }

  function chooseContext(context: DemoContext) {
    dispatch(crmSessionActions.chooseContext(context));
    setApiSyncEnabled(false);
  }

  function canAccessModule(id: string) {
    return (
      activeContext?.role === "super_admin" ||
      activeContext?.modules.includes(id) ||
      id === "dashboard"
    );
  }

  if (!loggedInUser) {
    return (
      <LoginScreen
        loginEmail={loginEmail}
        setLoginEmail={(value) =>
          dispatch(crmSessionActions.setLoginEmail(value))
        }
        login={login}
        setThemeMode={(value) =>
          dispatch(crmSessionActions.setThemeMode(value))
        }
        themeMode={themeMode}
      />
    );
  }

  if (!activeContext) {
    return (
      <ContextScreen
        user={loggedInUser}
        chooseContext={chooseContext}
        logout={() => dispatch(crmSessionActions.logout())}
        setThemeMode={(value) =>
          dispatch(crmSessionActions.setThemeMode(value))
        }
        themeMode={themeMode}
      />
    );
  }

  function runAction(label: string) {
    dispatch(
      crmSessionActions.setToast(
        `${label} queued for ${selectedCount || "current"} record${selectedCount === 1 ? "" : "s"}`,
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
        <nav className="main-menu" aria-label="Admin CRM modules">
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
                <span className="menu-count">
                  {group.items.filter(canAccessModule).length}
                </span>
              </button>
              <ul>
                {group.items.filter(canAccessModule).map((id) => (
                  <li key={id}>
                    <button
                      className={activeId === id ? "selected" : ""}
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
          <div className="page-title">
            <h1>Mentora Education CRM</h1>
            <p>
              Enterprise operations console for admissions, marketing, payments,
              learning, and tenant control.
            </p>
          </div>
          <div className="login-info">
            <div className="utility-cluster">
              <ThemeSelector
                setThemeMode={(value) =>
                  dispatch(crmSessionActions.setThemeMode(value))
                }
                themeMode={themeMode}
              />
              <label className="tenant-switcher">
                <span>Context</span>
                <select
                  aria-label="Tenant"
                  className="form-select form-select-sm"
                  defaultValue="webnza"
                >
                  <option value="active">
                    {activeContext.tenant} / {activeContext.branch}
                  </option>
                </select>
              </label>
              <button
                className="btn btn-outline-primary btn-sm utility-button"
                onClick={() => dispatch(crmSessionActions.clearContext())}
                type="button"
              >
                <Icon name="tenant" />
                Switch
              </button>
            </div>
            <div className="utility-actions">
              <button
                className="btn btn-outline-primary btn-sm utility-button"
                onClick={() => runAction("Notifications opened")}
                type="button"
              >
                <FontAwesomeIcon icon={faBell} />
                Messages
              </button>
              <button
                className="btn btn-primary btn-sm utility-button"
                onClick={() => dispatch(crmSessionActions.logout())}
                type="button"
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <ServerStatus
          apiSyncEnabled={apiSyncEnabled}
          onSync={() => {
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
            activeContext={activeContext}
            detail={detail}
            filterValues={filterValues}
            module={activeModule}
            pageSize={pageSize}
            query={query}
            rows={visibleRows}
            selected={selected}
            selectedCount={selectedCount}
            setDetail={setDetail}
            setFilterValues={setFilterValues}
            setPageSize={setPageSize}
            setQuery={setQuery}
            setSelected={setSelected}
            setSort={setSort}
            sort={sort}
            total={filteredRows.length}
            usingServerRows={serverRows.length > 0}
            view={moduleView}
            setView={setModuleView}
            openRecordForm={setRecordForm}
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
                  crmWorkspaceActions.upsertLocalModuleRecord(finalDraft),
                );
                dispatch(
                  crmSessionActions.setToast(
                    "Record saved in CRM demo workspace",
                  ),
                );
                setRecordForm(null);
                return;
              }
              try {
                await dispatch(saveModuleRecord(finalDraft)).unwrap();
                dispatch(crmSessionActions.setToast("Record saved to API"));
              } catch {
                dispatch(
                  crmWorkspaceActions.upsertLocalModuleRecord(finalDraft),
                );
                dispatch(
                  crmSessionActions.setToast(
                    "Record saved locally until API auth is ready",
                  ),
                );
              }
              setRecordForm(null);
            }}
            row={recordForm.row}
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
  setLoginEmail,
  login,
  setThemeMode,
  themeMode,
}: {
  loginEmail: string;
  setLoginEmail: (value: string) => void;
  login: () => void;
  setThemeMode: (value: ThemeMode) => void;
  themeMode: ThemeMode;
}) {
  return (
    <main className={`auth-screen theme-${themeMode}`}>
      <section className="auth-card card shadow-lg">
        <ThemeSelector setThemeMode={setThemeMode} themeMode={themeMode} />
        <span className="brand-mark">M</span>
        <h1>Mentora CRM Login</h1>
        <p>Select a demo CRM user to show role-based tenant access.</p>
        <label>
          <span>User</span>
          <select
            className="form-select"
            onChange={(event) => setLoginEmail(event.target.value)}
            value={loginEmail}
          >
            {demoUsers.map((user) => (
              <option key={user.email} value={user.email}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" onClick={login} type="button">
          Continue
        </button>
      </section>
    </main>
  );
}

function ContextScreen({
  user,
  chooseContext,
  logout,
  setThemeMode,
  themeMode,
}: {
  user: (typeof demoUsers)[number];
  chooseContext: (context: DemoContext) => void;
  logout: () => void;
  setThemeMode: (value: ThemeMode) => void;
  themeMode: ThemeMode;
}) {
  return (
    <main className={`auth-screen theme-${themeMode}`}>
      <section className="context-card card shadow-lg">
        <div className="context-head">
          <div>
            <span className="eyebrow">CRM Context</span>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
          <div className="context-actions">
            <ThemeSelector setThemeMode={setThemeMode} themeMode={themeMode} />
            <button className="btn btn-primary" onClick={logout} type="button">
              Change User
            </button>
          </div>
        </div>
        <div className="context-grid">
          {user.contexts.map((context) => (
            <button
              className="context-option"
              key={`${context.tenant}-${context.role}`}
              onClick={() => chooseContext(context)}
              type="button"
            >
              <span>{context.label}</span>
              <strong>{context.tenant}</strong>
              <em>{context.branch}</em>
              <small>{context.role.replaceAll("_", " ")}</small>
            </button>
          ))}
        </div>
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
  return (
    <label className="theme-switcher">
      <span>Theme</span>
      <select
        className="form-select form-select-sm"
        aria-label="Theme mode"
        onChange={(event) => setThemeMode(event.target.value as ThemeMode)}
        value={themeMode}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}

function ServerStatus({
  apiSyncEnabled,
  onSync,
  workspace,
}: {
  apiSyncEnabled: boolean;
  onSync: () => void;
  workspace: {
    coverage: unknown[];
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
        : "Demo workspace active";

  return (
    <div className="server-ribbon">
      <div className="server-ribbon-copy">
        <span
          className={
            workspace.error || !apiSyncEnabled
              ? "server-dot warn"
              : "server-dot"
          }
        />
        <strong>{statusLabel}</strong>
        <span>
          {apiSyncEnabled
            ? `${workspace.tenants.length} tenants`
            : "No protected API calls before auth"}
        </span>
        <span>
          {apiSyncEnabled
            ? `${workspace.coverage.length} module records`
            : "Create and edit uses local MVP state"}
        </span>
        {workspace.error ? <em>{workspace.error}</em> : null}
      </div>
      <button
        className="server-sync-button"
        disabled={workspace.loading}
        onClick={onSync}
        type="button"
      >
        <FontAwesomeIcon icon={faPlug} />
        {workspace.loading ? "Syncing" : "Sync API"}
      </button>
    </div>
  );
}

function Dashboard({
  canAccessModule,
  openModule,
  workspace,
}: {
  canAccessModule: (id: string) => boolean;
  openModule: (id: string) => void;
  workspace: { coverage: unknown[]; tenants: unknown[] };
}) {
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
        {kpis.map(([label, value, delta, helper]) => (
          <button
            className="metric-card"
            key={label}
            onClick={() =>
              openModule(label === "Applications" ? "applications" : "leads")
            }
            type="button"
          >
            <Icon
              name={
                label === "Revenue"
                  ? "payment"
                  : label === "AI sessions"
                    ? "ai"
                    : "analytics"
              }
            />
            <span>{label}</span>
            <strong>{value}</strong>
            <p>
              <em>{delta}</em>
              {helper}
            </p>
          </button>
        ))}
      </section>

      <section className="board-grid">
        <div className="listmanager">
          <div className="head">Admissions Pipeline</div>
          <div className="pipeline">
            {pipeline.map(([stage, value]) => (
              <button
                className="pipeline-step"
                key={stage}
                onClick={() =>
                  openModule(
                    stage === "Application" ? "applications" : "admissions",
                  )
                }
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
              <Icon name={module.icon ?? "dashboard"} />
              <span>{module.group}</span>
              <strong>{module.title}</strong>
              <em>{module.metric}</em>
              <small>{module.status}</small>
            </button>
          ))}
      </section>
    </section>
  );
}

function ModulePanel(props: {
  activeContext: DemoContext;
  detail: string[] | null;
  filterValues: Record<string, string>;
  module: CrmModule;
  pageSize: number;
  query: string;
  rows: string[][];
  selected: string[];
  selectedCount: number;
  setDetail: (row: string[] | null) => void;
  setFilterValues: (values: Record<string, string>) => void;
  setPageSize: (value: number) => void;
  setQuery: (value: string) => void;
  setSelected: (values: string[]) => void;
  setSort: (value: { column: number; direction: "asc" | "desc" }) => void;
  sort: { column: number; direction: "asc" | "desc" };
  total: number;
  usingServerRows: boolean;
  view: "list" | "grid";
  setView: (view: "list" | "grid") => void;
  openRecordForm: (form: { mode: "create" | "edit"; row?: string[] }) => void;
  runAction: (label: string) => void;
}) {
  const module = props.module;
  const allVisibleIds = props.rows.map((row) => row.join("|"));
  const allSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => props.selected.includes(id));

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
        <div className="module-title-block">
          <Icon name={module.icon ?? "dashboard"} />
          <div>
            <span className="eyebrow">{module.group}</span>
            <h2>{module.title}</h2>
          </div>
          <span className={`status-pill ${statusClass(module.status)}`}>
            {module.status}
          </span>
        </div>
        <div className="module-copy">
          <p>{module.description}</p>
          <p className="context-line">
            {props.activeContext.role.replaceAll("_", " ")} /{" "}
            {props.activeContext.tenant} / {props.activeContext.branch}
          </p>
        </div>
        <div className="module-metric">
          <span>Total</span>
          <strong>{module.metric}</strong>
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
                action.toLowerCase().includes("create")
                  ? props.openRecordForm({ mode: "create" })
                  : props.runAction(action)
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
              List
            </button>
            <button
              className={`btn ${
                props.view === "grid" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => props.setView("grid")}
              type="button"
            >
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
            {props.usingServerRows ? "Live API data" : "Demo fallback"} /{" "}
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
                        {column}{" "}
                        {props.sort.column === index
                          ? props.sort.direction.toUpperCase()
                          : ""}
                      </button>
                    </th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {props.rows.map((row, rowIndex) => {
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
                      <td>{rowIndex + 1}</td>
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
                          onClick={() => props.runAction("Audit")}
                          type="button"
                        >
                          <Icon name="shield" />
                          Audit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="record-grid">
            {props.rows.map((row) => {
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
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <div className="pagination-bar">
          <div className="pagination-actions" aria-label="Listing pagination">
            <button className="btn btn-outline-primary btn-sm" type="button">
              First
            </button>
            <button className="btn btn-outline-primary btn-sm" type="button">
              Prev
            </button>
            <strong>Page 1</strong>
            <button className="btn btn-outline-primary btn-sm" type="button">
              Next
            </button>
          </div>
          <label className="page-size-control">
            <span>Rows</span>
            <select
              className="form-select form-select-sm"
              onChange={(event) =>
                props.setPageSize(Number(event.target.value))
              }
              value={props.pageSize}
            >
              <option value={3}>3</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </label>
          <span className="pagination-total">
            {props.total} matching records
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

function statusClass(status?: ModuleStatus) {
  if (status === "Production MVP") return "good";
  if (status === "Workflow MVP") return "warn";
  return "neutral";
}

function extractFirstId(records: unknown[]) {
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

function recordsToRows(records: unknown[] | undefined, module: CrmModule) {
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
        (index === 0 ? object.title : undefined) ??
        (index === module.columns.length - 1 ? object.status : undefined);

      return stringifyCell(value);
    });
  });
}

function stringifyCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return value.toLocaleDateString();
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replaceAll("_", " ");
}

function toPayloadKey(label: string) {
  return label
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character: string) =>
      character.toUpperCase(),
    )
    .replace(/^[A-Z]/, (character) => character.toLowerCase());
}
