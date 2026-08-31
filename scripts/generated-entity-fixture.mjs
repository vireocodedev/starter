import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkGeneratedEntities,
  createVireo,
  generateEntity,
  TEMPLATE_COMMIT,
} from "../packages/create-vireo/dist/index.js";
import { withLocalVireoCandidates } from "./lib/local-vireo-candidate-fixture.mjs";
import { assertGeneratedFixtureTemplatePinFromRepository } from "./lib/generated-fixture-template-pin.mjs";
import { assertExactGeneratedProject } from "./lib/generated-project-projection-assertions.mjs";
import {
  mavenCandidateConsumerCommand,
  withLocalVireoMavenCandidates,
} from "./lib/local-vireo-maven-candidate-fixture.mjs";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
await assertGeneratedFixtureTemplatePinFromRepository({ repositoryRoot, templateCommit: TEMPLATE_COMMIT });
const ecosystemContract = JSON.parse(
  await readFile(join(repositoryRoot, "contracts/ecosystem-release-contract.json"), "utf8"),
);
const targetMavenVersion = ecosystemContract.current?.maven?.version;
if (typeof targetMavenVersion !== "string" || !targetMavenVersion.trim())
  throw new Error("Ecosystem release contract must declare current.maven.version for the generated JVM fixture.");
const temporaryRoot = await mkdtemp(join(tmpdir(), "vireo-generated-fixture-"));
const projectRoot = join(temporaryRoot, "generated-app");
const identity = {
  displayName: "Generated Full Stack",
  ownerName: "Generated Fixture Team",
  repositoryUrl: "https://example.test/generated-full-stack",
  supportUrl: "https://support.example.test/generated-full-stack",
  securityContact: "https://security.example.test/generated-full-stack",
};

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
    ...identity,
  });
  await assertExactGeneratedProject({
    root: projectRoot,
    profile: "full-stack",
    identity: { projectName: "generated-app", ...identity },
    template: ecosystemContract.current.template,
  });
  run("corepack", ["npm", "run", "identity:check:release"], projectRoot);
  const schemaPath = join(projectRoot, ".vireo/examples/purchase-order.entity.json");
  const first = await generateEntity({ projectDirectory: projectRoot, schemaPath });
  const second = await generateEntity({ projectDirectory: projectRoot, schemaPath });
  if (!second.files.every(file => file.status === "unchanged"))
    throw new Error("Generated fixture was not byte-for-byte idempotent on its second pass.");
  const checks = await checkGeneratedEntities(projectRoot);
  if (checks.length !== 1 || !checks[0].ok)
    throw new Error(`Generated fixture contract check failed: ${JSON.stringify(checks)}`);

  await withLocalVireoCandidates(join(projectRoot, "frontend"), () => {
    run("corepack", ["npm", "run", "typecheck"], join(projectRoot, "frontend"));
    run(
      "corepack",
      ["npm", "run", "test", "--", "tests/contract/generated/purchaseOrder.wire-contract.test.ts"],
      join(projectRoot, "frontend"),
    );
  });
  await withLocalVireoMavenCandidates(
    projectRoot,
    ({ initScript }) => {
      const consumer = mavenCandidateConsumerCommand({ initScript });
      run(consumer.command, consumer.args, projectRoot);
    },
    { expectedVersion: targetMavenVersion },
  );
  console.log(`Generated ${first.files.length} planned artifacts; frontend and backend fixture verification passed.`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
