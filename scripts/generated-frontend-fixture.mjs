import { execFileSync } from "node:child_process";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkGeneratedEntities,
  createVireo,
  generateEntity,
  TEMPLATE_COMMIT,
} from "../packages/create-vireo/dist/index.js";
import { withLocalVireoCandidates } from "./lib/local-vireo-candidate-fixture.mjs";
import { assertGeneratedFixtureTemplatePinFromRepository } from "./lib/generated-fixture-template-pin.mjs";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
await assertGeneratedFixtureTemplatePinFromRepository({ repositoryRoot, templateCommit: TEMPLATE_COMMIT });
const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-frontend-fixture-"));
const projectRoot = join(temporaryRoot, "frontend-app");

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

async function walk(root, directory = root) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(root, path)));
    else files.push(relative(root, path).replaceAll("\\", "/"));
  }
  return files;
}

try {
  const created = await createVireo({
    directory: projectRoot,
    projectName: "frontend-app",
    profile: "frontend",
    git: false,
  });
  if (created.profile !== "frontend" || created.javaPackage || created.database)
    throw new Error(`Unexpected frontend project result: ${JSON.stringify(created)}`);

  const schemaPath = join(projectRoot, ".vireo/examples/purchase-order.entity.json");
  const first = await generateEntity({ projectDirectory: projectRoot, schemaPath });
  const second = await generateEntity({ projectDirectory: projectRoot, schemaPath });
  if (first.target !== "frontend" || second.target !== "frontend")
    throw new Error("Frontend project did not infer the frontend generation target.");
  if (!second.files.every(file => file.status === "unchanged"))
    throw new Error("Frontend generated fixture was not byte-for-byte idempotent on its second pass.");

  const checks = await checkGeneratedEntities(projectRoot);
  if (checks.length !== 1 || !checks[0].ok)
    throw new Error(`Frontend generated fixture contract check failed: ${JSON.stringify(checks)}`);

  const files = await walk(projectRoot);
  const backendFiles = files.filter(
    file =>
      file.endsWith(".java") ||
      file.endsWith(".gradle") ||
      file.endsWith(".gradle.kts") ||
      file.includes("/db/migration/"),
  );
  if (backendFiles.length > 0)
    throw new Error(`Frontend project unexpectedly contains backend files: ${backendFiles.join(", ")}`);

  await withLocalVireoCandidates(projectRoot, () => {
    run("corepack", ["npm", "run", "doctor"], projectRoot);
    run("corepack", ["npm", "run", "verify"], projectRoot);
  });
  console.log(
    `Generated ${first.files.length} frontend artifacts; standalone mock-backed fixture verification passed.`,
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
