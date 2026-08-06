"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import type { ChangePasswordDraft } from "../../store";

export default function ChangePasswordPage({
  onSubmit,
}: {
  onSubmit: (draft: ChangePasswordDraft) => Promise<void>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit() {
    setError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation must match.");
      return;
    }
    if (newPassword.length < 12) {
      setError("New password must be at least 12 characters.");
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit({ confirmPassword, currentPassword, newPassword });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to change password.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="workspace account-page">
      <div className="module-hero">
        <div>
          <span className="eyebrow">Security</span>
          <h1>Change Password</h1>
          <p>Update your CRM login password for this account.</p>
        </div>
      </div>
      <form
        className="account-panel"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="account-panel-head">
          <div className="modal-title-cluster">
            <div className="modal-icon-shell">
              <FontAwesomeIcon icon={faKey} />
            </div>
            <div>
              <span className="eyebrow">Security</span>
              <h3 id="change-password-title">Change Password</h3>
              <p>Update your CRM login password for this account.</p>
            </div>
          </div>
        </div>
        <div className="modal-form-grid">
          <label className="formrow wide">
            <span className="label">Current password</span>
            <input
              autoComplete="current-password"
              className="input form-control"
              onChange={(event) => setCurrentPassword(event.target.value)}
              type="password"
              value={currentPassword}
            />
          </label>
          <label className="formrow wide">
            <span className="label">New password</span>
            <input
              autoComplete="new-password"
              className="input form-control"
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
              value={newPassword}
            />
          </label>
          <label className="formrow wide">
            <span className="label">Confirm new password</span>
            <input
              autoComplete="new-password"
              className="input form-control"
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              value={confirmPassword}
            />
          </label>
        </div>
        {error ? <div className="auth-error modal-error">{error}</div> : null}
        <div className="record-modal-actions">
          <button className="btn btn-primary" disabled={isSaving} type="submit">
            {isSaving ? "Updating" : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  );
}
