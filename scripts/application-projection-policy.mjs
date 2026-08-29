import { resolve } from "node:path";
import {
  readApplicationProjectionContract,
  validateApplicationProjectionContract,
} from "./lib/application-projection-contract.mjs";

const path = resolve(process.argv[2] ?? "contracts/application-projection-contract.json");
const contract = readApplicationProjectionContract(path);
const problems = validateApplicationProjectionContract(contract);

if (problems.length > 0) {
  console.error("Application projection contract failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exitCode = 1;
} else {
  console.log(
    `Application projection contract passed: ${contract.rules.length} ownership rules, ${contract.identity.fields.length} identity fields.`,
  );
}
