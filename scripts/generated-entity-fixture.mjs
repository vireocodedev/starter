import { execFileSync } from "node:child_process";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkGeneratedEntities, createVireo, generateEntity } from "../packages/create-vireo/dist/index.js";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-generated-fixture-"));
const projectRoot = join(temporaryRoot, "generated-app");

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

try {
  await createVireo({
    directory: projectRoot,
    projectName: "generated-app",
    javaPackage: "dev.vireo.generated",
    database: "h2",
    git: false,
  });
  const fixture = join(repositoryRoot, "packages/create-vireo/fixtures/purchase-order.entity.json");
  const schemaPath = join(projectRoot, ".vireo/purchase-order.entity.json");
  await cp(fixture, schemaPath);
  const first = await generateEntity({ projectDirectory: projectRoot, schemaPath });
  const second = await generateEntity({ projectDirectory: projectRoot, schemaPath });
  if (!second.files.every(file => file.status === "unchanged"))
    throw new Error("Generated fixture was not byte-for-byte idempotent on its second pass.");
  const checks = await checkGeneratedEntities(projectRoot);
  if (checks.length !== 1 || !checks[0].ok)
    throw new Error(`Generated fixture contract check failed: ${JSON.stringify(checks)}`);

  run("corepack", ["npm", "ci"], join(projectRoot, "frontend"));
  run("corepack", ["npm", "run", "typecheck"], join(projectRoot, "frontend"));
  run(
    "corepack",
    ["npm", "run", "test", "--", "tests/contract/generated/purchaseOrder.wire-contract.test.ts"],
    join(projectRoot, "frontend"),
  );
  run("./gradlew", ["test", "--tests", "*PurchaseOrderApiIntegrationTest", "--console=plain"], projectRoot);
  console.log(`Generated ${first.files.length} planned artifacts; frontend and backend fixture verification passed.`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
