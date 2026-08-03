import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import type { DemoContext } from "../store";
import { AdminIcon as Icon } from "./AdminIcon";
import { getUnknownRecordId } from "./adminUtils";

export function WorkspaceSwitcher({
  activeContext,
  activeBranchId,
  activeOrganizationId,
  branches,
  canSwitchBranch,
  canSwitchOrganization,
  contexts,
  onChange,
  onBranchChange,
  onOrganizationChange,
  organizations,
}: {
  activeContext: DemoContext;
  activeBranchId: string;
  activeOrganizationId: string;
  branches: unknown[];
  canSwitchBranch: boolean;
  canSwitchOrganization: boolean;
  contexts: DemoContext[];
  onChange: (context: DemoContext) => void;
  onBranchChange: (branchId: string) => void;
  onOrganizationChange: (organizationId: string) => void;
  organizations: unknown[];
}) {
  const staticOrganizationLabel =
    activeOrganizationId && organizations.length > 0
      ? getOrganizationOptions(organizations, contexts).find(
          (organization) => organization.value === activeOrganizationId,
        )?.label
      : activeContext.organization;
  const staticBranchLabel =
    activeBranchId && branches.length > 0
      ? getRecordOptions(branches).find(
          (branch) => branch.value === activeBranchId,
        )?.label
      : activeContext.branch;
  const organizationOptions = canSwitchOrganization
    ? [
        { label: "All organizations", value: "" },
        ...getOrganizationOptions(organizations, contexts),
      ]
    : getOrganizationOptions(organizations, contexts);
  const branchOptions = canSwitchBranch
    ? [
        { label: "All branches", value: "" },
        ...(activeOrganizationId
          ? getBranchOptions(
              branches,
              contexts.filter(
                (context) =>
                  context.organization === activeContext.organization,
              ),
            )
          : []),
      ]
    : getBranchOptions(
        branches,
        contexts.filter(
          (context) => context.organization === activeContext.organization,
        ),
      );
  const selectedOrganizationValue = activeOrganizationId;
  const selectedBranchValue = activeBranchId;

  function selectContext(field: "organization" | "branch", value: string) {
    if (field === "organization" && value === "") {
      onOrganizationChange(value);
      return;
    }
    if (field === "branch" && value === "") {
      onBranchChange(value);
      return;
    }
    if (field === "organization" && organizations.length > 0) {
      onOrganizationChange(value);
      return;
    }
    if (field === "branch" && branches.length > 0) {
      onBranchChange(value);
      return;
    }
    const exactMatch = contexts.find((context) => {
      if (field === "organization") {
        return (
          context.organization === value &&
          (!canSwitchBranch || context.branch === activeContext.branch)
        );
      }
      return (
        context.organization === activeContext.organization &&
        context.branch === value
      );
    });
    const fallbackMatch =
      field === "organization"
        ? contexts.find((context) => context.organization === value)
        : undefined;
    const match = exactMatch ?? fallbackMatch;
    if (match) onChange(match);
  }

  return (
    <div className="header-workspace" aria-label="Workspace context">
      {canSwitchOrganization ? (
        <label>
          <Icon name="organization" />
          <select
            aria-label="Organization"
            onChange={(event) =>
              selectContext("organization", event.target.value)
            }
            value={selectedOrganizationValue}
          >
            {organizationOptions.map((organization) => (
              <option key={organization.value} value={organization.value}>
                {organization.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <div className="workspace-static">
          <Icon name="organization" />
          <span>{staticOrganizationLabel}</span>
        </div>
      )}
      {canSwitchBranch ? (
        <label>
          <FontAwesomeIcon aria-hidden icon={faBuilding} />
          <select
            aria-label="Branch"
            onChange={(event) => selectContext("branch", event.target.value)}
            value={selectedBranchValue}
          >
            {branchOptions.map((branch) => (
              <option key={branch.value} value={branch.value}>
                {branch.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <div className="workspace-static">
          <FontAwesomeIcon aria-hidden icon={faBuilding} />
          <span>{staticBranchLabel}</span>
        </div>
      )}
    </div>
  );
}

export function getOrganizationOptions(
  organizations: unknown[],
  contexts: DemoContext[],
) {
  const apiOptions = organizations
    .map((organization) => {
      const object =
        organization && typeof organization === "object"
          ? (organization as Record<string, unknown>)
          : {};
      const value = getUnknownRecordId(object);
      const label =
        typeof object.name === "string"
          ? object.name
          : typeof object.code === "string"
            ? object.code
            : value;
      return value ? { label, value } : null;
    })
    .filter((item): item is { label: string; value: string } => Boolean(item));
  if (apiOptions.length > 0) return apiOptions;
  return Array.from(new Set(contexts.map((context) => context.organization)))
    .filter(Boolean)
    .map((organization) => ({ label: organization, value: organization }));
}

export function getBranchOptions(branches: unknown[], contexts: DemoContext[]) {
  const apiOptions = getRecordOptions(branches);
  if (apiOptions.length > 0) return apiOptions;
  return Array.from(new Set(contexts.map((context) => context.branch)))
    .filter(Boolean)
    .map((branch) => ({ label: branch, value: branch }));
}

export function getRecordOptions(records: unknown[]) {
  return records
    .map((branch) => {
      const object =
        branch && typeof branch === "object"
          ? (branch as Record<string, unknown>)
          : {};
      const value = getUnknownRecordId(object);
      const name =
        typeof object.name === "string"
          ? object.name
          : typeof object.code === "string"
            ? object.code
            : value;
      const city = typeof object.city === "string" ? object.city : "";
      const label = city ? `${name} / ${city}` : name;
      return value ? { label, value } : null;
    })
    .filter((item): item is { label: string; value: string } => Boolean(item));
}
