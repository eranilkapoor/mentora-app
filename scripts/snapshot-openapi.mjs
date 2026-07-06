import { writeFile } from "node:fs/promises";

const sourceUrl =
  process.env.OPENAPI_URL ?? "http://localhost:3000/api/docs-json";
const outputPath = new URL(
  "../packages/api-contract/openapi.json",
  import.meta.url,
);

let response;
try {
  response = await fetch(sourceUrl, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(5000),
  });
} catch (error) {
  console.error(
    `\n✖ Could not reach ${sourceUrl}.\n` +
    `  Make sure your API server is running locally (or set OPENAPI_URL) before running this script.\n`,
  );
  throw error;
}

if (!response.ok) {
  throw new Error(
    `Unable to download OpenAPI schema from ${sourceUrl}: ${response.status} ${response.statusText}`,
  );
}

let document;
try {
  document = await response.json();
} catch (error) {
  throw new Error(
    `Response from ${sourceUrl} was not valid JSON. Is this really an OpenAPI docs endpoint?`,
  );
}

// Basic sanity check that this looks like an OpenAPI/Swagger doc
if (!document.openapi && !document.swagger) {
  throw new Error(
    `Response from ${sourceUrl} doesn't look like an OpenAPI document (missing "openapi"/"swagger" field).`,
  );
}

await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");

console.log(`✔ OpenAPI snapshot updated from ${sourceUrl}`);
console.log(`  Written to ${outputPath.pathname}`);