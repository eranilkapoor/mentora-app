const envDefaultBaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://api.example.com"
    : process.env.NODE_ENV === "staging"
      ? "https://staging-api.example.com"
      : "http://localhost:3000";

const baseUrl = process.env.SMOKE_BASE_URL ?? envDefaultBaseUrl;
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 8000);

async function fetchJson(path) {
  const url = new URL(path, baseUrl).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });

    const text = await response.text();
    let body = null;

    if (text.length > 0) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body,
      url,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function run() {
  const results = [];
  const healthPaths = ["/live", "/ready"];

  for (const path of healthPaths) {
    results.push(await fetchJson(path));
  }

  const failed = results.filter((result) => !result.ok);

  if (failed.length > 0) {
    console.error("API smoke test failed.");
    for (const result of failed) {
      console.error(
        `${result.url} -> ${result.status} ${result.statusText} :: ${JSON.stringify(result.body)}`,
      );
    }
    process.exitCode = 1;
    return;
  }

  console.log(`API smoke test passed for ${baseUrl}`);
  for (const result of results) {
    console.log(`${result.url} -> ${result.status}`);
  }
}

run().catch((error) => {
  console.error(`API smoke test crashed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
