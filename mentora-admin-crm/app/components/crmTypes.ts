export type ModuleStatus = "Active" | "Configured" | "Setup";

export type CrmModule = {
  actions?: string[];
  columns: string[];
  description: string;
  filters: string[];
  group: string;
  icon?: IconName;
  id: string;
  insights?: string[];
  metric: string;
  rows: string[][];
  status?: ModuleStatus;
  title: string;
};

export type ModuleCoverage = {
  apiSurface?: string[];
  backendStatus?: string;
  frontendStatus?: string;
  moduleKey?: string;
  productionBlockers?: string[];
  productionReady?: boolean;
  status?: string;
  storage?: string;
  title?: string;
};

export type IconName =
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
  | "organization"
  | "user";
