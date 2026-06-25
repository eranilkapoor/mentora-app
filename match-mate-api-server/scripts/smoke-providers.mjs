const strictMode = process.env.SMOKE_STRICT === "true";

const providerChecks = [
  {
    provider: "fcm",
    vars: ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"],
  },
  {
    provider: "email",
    vars: ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "SES_FROM_EMAIL"],
  },
  {
    provider: "sms",
    vars: ["MSG91_AUTH_KEY", "MSG91_TEMPLATE_ID"],
  },
  {
    provider: "payments",
    vars: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
  },
  {
    provider: "storage",
    vars: ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_S3_BUCKET"],
  },
  {
    provider: "social-google",
    vars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  {
    provider: "social-facebook",
    vars: ["FACEBOOK_APP_ID", "FACEBOOK_APP_SECRET"],
  },
];

function runChecks() {
  const report = providerChecks.map((check) => {
    const missing = check.vars.filter((variable) => {
      const value = process.env[variable];
      return !value || value.trim().length === 0;
    });

    return {
      provider: check.provider,
      missing,
      ok: missing.length === 0,
    };
  });

  const failed = report.filter((entry) => !entry.ok);

  console.log("Provider smoke configuration report");
  for (const entry of report) {
    if (entry.ok) {
      console.log(`- ${entry.provider}: ok`);
      continue;
    }

    const level = strictMode ? "error" : "warn";
    console[level](`- ${entry.provider}: missing -> ${entry.missing.join(", ")}`);
  }

  if (strictMode && failed.length > 0) {
    process.exitCode = 1;
  }
}

runChecks();
