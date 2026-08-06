"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarsProgress, faUser } from "@fortawesome/free-solid-svg-icons";
import { AdminModule } from "../adminTypes";
import {
  getBranchOptions,
  getOrganizationOptions,
} from "../shellWorkspace";
import { formatStatus } from "../adminUtils";
import { moduleMap } from "../adminConfig";
import type { CrmProfilePreferences, DemoContext, DemoUser } from "../../store";

export default function MyProfilePage({
  activeContext,
  branches,
  modules,
  onDefaultOrganizationChange,
  onSavePreferences,
  organizations,
  preferences,
  user,
}: {
  activeContext: DemoContext;
  branches: unknown[];
  modules: AdminModule[];
  onDefaultOrganizationChange: (organizationId: string) => void;
  onSavePreferences: (preferences: CrmProfilePreferences) => void;
  organizations: unknown[];
  preferences: CrmProfilePreferences;
  user: DemoUser;
}) {
  const [draft, setDraft] = useState(preferences);
  const organizationOptions = getOrganizationOptions(organizations, user.contexts);
  const branchOptions = getBranchOptions(branches, user.contexts);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  const profileRows = [
    ["Name", user.name],
    ["Email", user.email],
    ["Active Role", activeContext.role.replaceAll("_", " ")],
    ["Organization", activeContext.organization],
    ["Branch", activeContext.branch],
    [
      "Default Landing Page",
      moduleMap[draft.defaultLandingPage]?.title ?? "Dashboard",
    ],
    [
      "Default Context",
      draft.restoreLastContext
        ? "Restore last selected context"
        : `${draft.defaultOrganizationId ? "Specific organization" : "All organizations"} / ${
            draft.defaultBranchId ? "Specific branch" : "All branches"
          }`,
    ],
    ["Available Contexts", String(user.contexts.length)],
  ];

  return (
    <section className="workspace account-page">
      <div className="module-hero">
        <div>
          <span className="eyebrow">Account</span>
          <h1>My Profile</h1>
          <p>Your CRM identity, active context, and access scope.</p>
        </div>
      </div>
      <div className="account-panel">
        <div className="account-panel-head">
          <div className="modal-title-cluster">
            <div className="modal-icon-shell">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div>
              <span className="eyebrow">Account</span>
              <h3 id="my-profile-title">My Profile</h3>
              <p>Your CRM identity, active context, and access scope.</p>
            </div>
          </div>
        </div>
        <dl className="detail-definition-list">
          {profileRows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{formatStatus(value)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="account-panel">
        <div className="account-panel-head">
          <div className="modal-title-cluster">
            <div className="modal-icon-shell">
              <FontAwesomeIcon icon={faBarsProgress} />
            </div>
            <div>
              <span className="eyebrow">Preferences</span>
              <h3>Default Workspace</h3>
              <p>Choose where the CRM opens and how context is restored.</p>
            </div>
          </div>
        </div>
        <form
          className="enterprise-form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            onSavePreferences(draft);
          }}
        >
          <label>
            <span>Default landing page</span>
            <select
              value={draft.defaultLandingPage}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  defaultLandingPage: event.target.value || "dashboard",
                }))
              }
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Default organization</span>
            <select
              disabled={draft.restoreLastContext}
              value={draft.defaultOrganizationId}
              onChange={(event) => {
                const organizationId = event.target.value;
                setDraft((current) => ({
                  ...current,
                  defaultOrganizationId: organizationId,
                  defaultBranchId: organizationId ? current.defaultBranchId : "",
                }));
                onDefaultOrganizationChange(organizationId);
              }}
            >
              <option value="">All organizations</option>
              {organizationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Default branch</span>
            <select
              disabled={draft.restoreLastContext || !draft.defaultOrganizationId}
              value={draft.defaultBranchId}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  defaultBranchId: event.target.value,
                }))
              }
            >
              <option value="">All branches</option>
              {branchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox-field">
            <input
              checked={draft.restoreLastContext}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  restoreLastContext: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span>Restore last selected context after login</span>
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
