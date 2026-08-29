import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function resolveGateExecution(contract, gateName) {
  const gate = contract.gates?.[gateName];
  if (!gate) throw new Error(`Unknown ecosystem gate: ${gateName}`);
  const { executable, arguments: arguments_ } = gate.execution ?? {};
  if (typeof executable !== "string" || executable.length === 0 || !Array.isArray(arguments_)) {
    throw new Error(`Ecosystem gate ${gateName} has no valid execution contract`);
  }
  if (!arguments_.every(argument => typeof argument === "string")) {
    throw new Error(`Ecosystem gate ${gateName} arguments must be strings`);
  }
  return { executable, arguments: arguments_, scope: gate.scope };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [gateName, option] = process.argv.slice(2);
  if (!gateName || (option && option !== "--dry-run") || process.argv.length > 4) {
    console.error("Usage: node scripts/run-ecosystem-gate.mjs <fast|full|release> [--dry-run]");
    process.exit(2);
  }
  const contract = JSON.parse(readFileSync(join(repositoryRoot, "contracts/ecosystem-release-contract.json"), "utf8"));
  let execution;
  try {
    execution = resolveGateExecution(contract, gateName);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
  if (option === "--dry-run") {
    console.log(JSON.stringify({ gate: gateName, ...execution }));
    process.exit(0);
  }

  const result = spawnSync(execution.executable, execution.arguments, {
    cwd: repositoryRoot,
    stdio: "inherit",
  });
  if (result.error) {
    console.error(`Unable to execute ecosystem gate ${gateName}: ${result.error.message}`);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}
