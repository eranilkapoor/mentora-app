import { writeFile } from "node:fs/promises";

const sourceUrl =
  process.env.OPENAPI_URL ?? "http://localhost:3000/api/docs-json";
const outputPath = new URL(
  "../packages/api-contract/openapi.json",
  import.meta.url,
);

const response = await fetch(sourceUrl, {
  headers: { accept: "application/json" },
});

if (!response.ok) {
  throw new Error(
    `Unable to download OpenAPI schema from ${sourceUrl}: ${response.status} ${response.statusText}`,
  );
}

const document = await response.json();
await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");

console.log(`OpenAPI snapshot updated from ${sourceUrl}`);
