import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templateRepositoryOption = process.argv.indexOf("--template-repository");
const templateRoot =
  templateRepositoryOption >= 0
    ? resolve(process.argv[templateRepositoryOption + 1] ?? "")
    : resolve(repositoryRoot, "..", "starter-template");
const sourceCommit = "5b123e60bd1ce733ae70711796552a17aaa60fe3";
const targetCommit = "a670d7f95f720a91705c7c156d19e605582fb4c8";
const sha256 = value => createHash("sha256").update(value).digest("hex");
const policy = JSON.parse(
  readFileSync(join(repositoryRoot, "packages/create-vireo/schema/vireo-upgrade-policy.json"), "utf8"),
);
if (templateRepositoryOption >= 0 && !process.argv[templateRepositoryOption + 1])
  throw new Error("--template-repository requires a checkout path.");
const checkedOutTemplateCommit = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: templateRoot,
  encoding: "utf8",
}).trim();
if (checkedOutTemplateCommit !== targetCommit)
  throw new Error(`Template checkout is ${checkedOutTemplateCommit}; expected frozen ${targetCommit}.`);

function gitObject(commit, path) {
  return execFileSync("git", ["show", `${commit}:${path}`], {
    cwd: templateRoot,
    encoding: "utf8",
  });
}

const baselines = policy.releaseGraph?.baselines?.["0.6.0->0.7.0"];
if (!baselines) throw new Error("The final 0.6.0-to-0.7.0 baseline set is missing.");
const frontendDoctorSource = readFileSync(
  join(repositoryRoot, "packages/create-vireo/fixtures/project-upgrades/vireo-frontend-doctor.0.6.0.mjs"),
  "utf8",
);
const frontendDoctorTarget = readFileSync(
  join(repositoryRoot, "packages/create-vireo/fixtures/project-upgrades/vireo-frontend-doctor.0.7.0.mjs"),
  "utf8",
);
const githubActionsPolicySource = readFileSync(
  join(repositoryRoot, "packages/create-vireo/fixtures/project-upgrades/github-actions-policy.0.6.0.json"),
  "utf8",
);
const githubActionsPolicyTarget = readFileSync(
  join(repositoryRoot, "packages/create-vireo/fixtures/project-upgrades/github-actions-policy.0.7.0.json"),
  "utf8",
);
const { createVireo, renderFrontendDoctorScript } = await import(
  join(repositoryRoot, "packages/create-vireo/dist/index.js")
);
const renderedFrontendDoctor = await renderFrontendDoctorScript(
  join(templateRoot, "frontend/scripts/vireo-frontend-doctor.mjs"),
);
if (renderedFrontendDoctor !== frontendDoctorTarget)
  throw new Error("Current frontend Doctor renderer differs from its independently frozen 0.7 fixture.");
const projectionRoot = await mkdtemp(join(tmpdir(), "vireo-upgrade-baseline-"));
let renderedGithubActionsPolicy;
try {
  const projectedRoot = join(projectionRoot, "projected-full-stack");
  await createVireo({
    directory: projectedRoot,
    profile: "full-stack",
    javaPackage: "dev.vireo.upgradebaseline",
    database: "h2",
    git: false,
    yes: true,
    templateDirectory: templateRoot,
  });
  renderedGithubActionsPolicy = await readFile(join(projectedRoot, "contracts/github-actions-policy.json"), "utf8");
} finally {
  await rm(projectionRoot, { recursive: true, force: true });
}
if (renderedGithubActionsPolicy !== githubActionsPolicyTarget)
  throw new Error("Current full-stack GitHub Actions policy projection differs from its frozen 0.7 fixture.");
let checked = 0;
for (const [profile, files] of Object.entries(baselines)) {
  if (!Array.isArray(files)) throw new Error(`${profile} baselines must be an array.`);
  for (const file of files) {
    if (file.operation !== "update") continue;
    const generatedFrontendDoctor = file.path === "scripts/vireo-frontend-doctor.mjs";
    const projectedGithubActionsPolicy = file.path === "contracts/github-actions-policy.json";
    const source = generatedFrontendDoctor
      ? frontendDoctorSource
      : projectedGithubActionsPolicy
        ? githubActionsPolicySource
        : gitObject(sourceCommit, file.path);
    const target = generatedFrontendDoctor
      ? renderedFrontendDoctor
      : projectedGithubActionsPolicy
        ? githubActionsPolicyTarget
        : gitObject(targetCommit, file.path);
    if (sha256(source) !== file.sourceSha256) {
      throw new Error(`${profile}:${file.path} source hash does not match its immutable 0.6 baseline.`);
    }
    if (sha256(target) !== file.targetSha256) {
      throw new Error(`${profile}:${file.path} target bytes do not match its immutable 0.7 baseline.`);
    }
    if (file.sourceContent !== undefined && file.sourceContent !== source) {
      throw new Error(`${profile}:${file.path} stored source bytes differ from its verified 0.6 baseline.`);
    }
    if (file.targetContent !== undefined && file.targetContent !== target) {
      throw new Error(`${profile}:${file.path} stored target bytes differ from its verified 0.7 baseline.`);
    }
    if (generatedFrontendDoctor && file.targetContent !== frontendDoctorTarget) {
      throw new Error(`${profile}:${file.path} policy target differs from its independent rendered fixture.`);
    }
    checked += 1;
  }
}
if (checked === 0) throw new Error("No immutable managed upgrade transforms were checked.");
console.log(
  `Project-upgrade baselines match frozen public projections and immutable Template objects (${checked} transform(s)).`,
);
