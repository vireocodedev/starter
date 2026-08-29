import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCheckedInDocumentationOwnership } from "./lib/documentation-ownership-contract.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contract = JSON.parse(readFileSync(join(root, "contracts/documentation-ownership-contract.json"), "utf8"));
const result = checkCheckedInDocumentationOwnership(root, contract);

if (result.problems.length > 0) {
  console.error("Documentation ownership policy failed:");
  for (const problem of result.problems) console.error(`- ${problem}`);
  process.exitCode = 1;
} else {
  console.log(
    `Documentation ownership policy passed: ${result.documents.length} checked-in documents and ${contract.declaredExternalDocuments.length} declared generated/application surfaces.`,
  );
}
