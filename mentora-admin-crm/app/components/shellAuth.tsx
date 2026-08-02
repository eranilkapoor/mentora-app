import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDesktop, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { DemoUser } from "../store";
import { defaultCrmUsers, type ThemeMode } from "./adminConfig";

export function LoginScreen({
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
        <p>Sign in with CRM created credentials.</p>
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

export function ThemeSelector({
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


