import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  readApplicationProjectionContract,
  validateApplicationProjectionContract,
} from "./lib/application-projection-contract.mjs";

const path = resolve(process.argv[2] ?? "contracts/application-projection-contract.json");
const contract = readApplicationProjectionContract(path);
const problems = validateApplicationProjectionContract(contract);
const shippedPath = resolve("packages/create-vireo/schema/application-projection-contract.json");
if (readFileSync(path, "utf8") !== readFileSync(shippedPath, "utf8")) {
  problems.push(
    "packages/create-vireo/schema/application-projection-contract.json must exactly match contracts/application-projection-contract.json",
  );
}

if (problems.length > 0) {
  console.error("Application projection contract failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exitCode = 1;
} else {
  console.log(
    `Application projection contract passed: ${contract.rules.length} ownership rules, ${contract.identity.fields.length} identity fields.`,
  );
}
