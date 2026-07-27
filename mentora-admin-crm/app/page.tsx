"use client";

import { useMemo, useState } from "react";

type CrmModule = {
  id: string;
  title: string;
  group: string;
  metric: string;
  description: string;
  filters: string[];
  columns: string[];
  rows: string[][];
};

type DemoContext = {
  tenant: string;
  branch: string;
  role: string;
  label: string;
  modules: string[];
};

type ThemeMode = "system" | "light" | "dark";

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
] satisfies Array<{ email: string; name: string; contexts: DemoContext[] }>;

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

const allModules = [...modules, ...extraModules];

const moduleMap = Object.fromEntries(
  allModules.map((module) => [module.id, module]),
);

export default function CrmDashboardPage() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [loginEmail, setLoginEmail] = useState(demoUsers[0].email);
  const [loggedInUser, setLoggedInUser] = useState<
    (typeof demoUsers)[number] | null
  >(null);
  const [activeContext, setActiveContext] = useState<DemoContext | null>(null);
  const [activeId, setActiveId] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState({
    column: 0,
    direction: "asc" as "asc" | "desc",
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [detail, setDetail] = useState<string[] | null>(null);
  const [toast, setToast] = useState("Ready");

  const activeModule = moduleMap[activeId];
  const activeRows = activeModule?.rows ?? [];
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
    setActiveId(id);
    setSelected([]);
    setQuery("");
    setFilterValues({});
    setDetail(null);
    setToast(
      `Opened ${id === "dashboard" ? "Dashboard" : moduleMap[id].title}`,
    );
  }

  function login() {
    const user =
      demoUsers.find((demoUser) => demoUser.email === loginEmail) ??
      demoUsers[0];
    setLoggedInUser(user);
    setActiveContext(null);
    setToast(`Logged in as ${user.name}`);
  }

  function chooseContext(context: DemoContext) {
    setActiveContext(context);
    setActiveId(
      context.modules.includes("dashboard") ? "dashboard" : context.modules[0],
    );
    setToast(`Context selected: ${context.label}`);
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
        setLoginEmail={setLoginEmail}
        login={login}
        setThemeMode={setThemeMode}
        themeMode={themeMode}
      />
    );
  }

  if (!activeContext) {
    return (
      <ContextScreen
        user={loggedInUser}
        chooseContext={chooseContext}
        logout={() => setLoggedInUser(null)}
        setThemeMode={setThemeMode}
        themeMode={themeMode}
      />
    );
  }

  function runAction(label: string) {
    setToast(
      `${label} queued for ${selectedCount || "current"} record${selectedCount === 1 ? "" : "s"}`,
    );
  }

  return (
    <div className={`admin-shell theme-${themeMode}`}>
      <aside className="left-sec">
        <div className="header-left">
          <button
            className="brand"
            onClick={() => openModule("dashboard")}
            type="button"
          >
            <span className="brand-mark">M</span>
            <span>Mentora CRM</span>
          </button>
        </div>
        <nav className="main-menu" aria-label="Admin CRM modules">
          {navGroups.map((group) => (
            <section className="menu-group" key={group.title}>
              <div className="menu-heading">
                <span>{group.title}</span>
                <span className="menu-icon">[]</span>
              </div>
              <ul>
                {group.items.filter(canAccessModule).map((id) => (
                  <li key={id}>
                    <button
                      className={activeId === id ? "selected" : ""}
                      onClick={() => openModule(id)}
                      type="button"
                    >
                      {id === "learning"
                        ? "Learning Ops"
                        : (moduleMap[id]?.title ?? "Dashboard")}
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
            <ThemeSelector setThemeMode={setThemeMode} themeMode={themeMode} />
            <select aria-label="Tenant" defaultValue="webnza">
              <option value="active">
                {activeContext.tenant} / {activeContext.branch}
              </option>
            </select>
            <button onClick={() => setActiveContext(null)} type="button">
              Context
            </button>
            <button
              onClick={() => runAction("Notifications opened")}
              type="button"
            >
              Messages
            </button>
            <button onClick={() => runAction("Logout")} type="button">
              Logout
            </button>
          </div>
        </header>

        {activeId === "dashboard" ? (
          <Dashboard
            canAccessModule={canAccessModule}
            openModule={openModule}
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
            runAction={runAction}
          />
        )}

        <div className="toast" role="status">
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
      <section className="auth-card">
        <ThemeSelector setThemeMode={setThemeMode} themeMode={themeMode} />
        <span className="brand-mark">M</span>
        <h1>Mentora CRM Login</h1>
        <p>Select a demo CRM user to show role-based tenant access.</p>
        <label>
          <span>User</span>
          <select
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
        <button onClick={login} type="button">
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
      <section className="context-card">
        <div className="context-head">
          <div>
            <span className="eyebrow">CRM Context</span>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
          <div className="context-actions">
            <ThemeSelector setThemeMode={setThemeMode} themeMode={themeMode} />
            <button onClick={logout} type="button">
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

function Dashboard({
  canAccessModule,
  openModule,
}: {
  canAccessModule: (id: string) => boolean;
  openModule: (id: string) => void;
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
        <button onClick={() => openModule("leads")} type="button">
          Open Lead Queue
        </button>
      </div>

      <section className="kpi-grid" aria-label="CRM key metrics">
        {kpis.map(([label, value, delta, helper]) => (
          <button
            className="metric-card"
            key={label}
            onClick={() =>
              openModule(label === "Applications" ? "applications" : "leads")
            }
            type="button"
          >
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
              <span>{module.group}</span>
              <strong>{module.title}</strong>
              <em>{module.metric}</em>
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
        <div>
          <span className="eyebrow">{module.group}</span>
          <h2>{module.title}</h2>
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

      <div className="navigationlist">
        <div className="action-row">
          <button
            onClick={() => props.runAction("Create record")}
            type="button"
          >
            Add New
          </button>
          <button onClick={() => props.runAction("Bulk assign")} type="button">
            Assign
          </button>
          <button onClick={() => props.runAction("Export")} type="button">
            Export
          </button>
          <button
            className="secondary"
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
        <div className="filter-block">
          <div className="head">Search</div>
          <div className="formblock">
            <label className="formrow wide">
              <span className="label">Global Search</span>
              <input
                className="input"
                onChange={(event) => props.setQuery(event.target.value)}
                placeholder="Search any visible field"
                value={props.query}
              />
            </label>
            {module.filters.map((filter) => (
              <label className="formrow" key={filter}>
                <span className="label">{filter}</span>
                <input
                  className="input"
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
        <div className="head">{module.title} Listing</div>
        <div className="main-listing-box">
          <table>
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
                        View
                      </button>
                      <button
                        onClick={() => props.runAction("Edit")}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => props.runAction("Audit")}
                        type="button"
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="title-pannel">
                <td colSpan={module.columns.length + 3}>
                  <div className="pag-inner">
                    <button type="button">First</button>
                    <button type="button">Prev</button>
                    <strong>1</strong>
                    <button type="button">Next</button>
                    <select
                      onChange={(event) =>
                        props.setPageSize(Number(event.target.value))
                      }
                      value={props.pageSize}
                    >
                      <option value={3}>3</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                    <span>{props.total} matching records</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
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
          <h3>{props.detail[0]}</h3>
          {module.columns.map((column, index) => (
            <div className="detail-row" key={column}>
              <span>{column}</span>
              <strong>{props.detail?.[index]}</strong>
            </div>
          ))}
          <button onClick={() => props.runAction("Follow-up")} type="button">
            Create Follow-up
          </button>
        </aside>
      ) : null}
    </section>
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
