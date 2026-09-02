import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyProjectionPath, readApplicationProjectionContract } from "./lib/application-projection-contract.mjs";
import {
  applyExactBaselineTransforms,
  projectedBaselineBytes,
  templatePathForBaseline,
} from "./lib/project-upgrade-baseline-contract.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templateRepositoryOption = process.argv.indexOf("--template-repository");
const templateRoot =
  templateRepositoryOption >= 0
    ? resolve(process.argv[templateRepositoryOption + 1] ?? "")
    : resolve(repositoryRoot, "..", "starter-template");
const historicalEdge = "0.7.0->0.8.0";
const managedAdditions = [
  ".agents/skills/vireo-app-feature-author/SKILL.md",
  ".agents/skills/vireo-app-feature-author/agents/openai.yaml",
  ".agents/skills/vireo-app-production-readiness/SKILL.md",
  ".agents/skills/vireo-app-production-readiness/agents/openai.yaml",
  ".agents/skills/vireo-app-upgrader/SKILL.md",
  ".agents/skills/vireo-app-upgrader/agents/openai.yaml",
];
const frontendEvidence = new Map([
  [
    "scripts/vireo-frontend-doctor.mjs",
    {
      source: join(
        repositoryRoot,
        "packages",
        "create-vireo",
        "fixtures",
        "project-upgrades",
        "vireo-frontend-doctor.0.8.1.mjs",
      ),
      target: join(
        repositoryRoot,
        "packages",
        "create-vireo",
        "fixtures",
        "project-upgrades",
        "vireo-frontend-doctor.0.8.2.fixture.json",
      ),
    },
  ],
]);
const sha256 = value => createHash("sha256").update(value).digest("hex");
const policy = JSON.parse(
  readFileSync(join(repositoryRoot, "packages/create-vireo/schema/vireo-upgrade-policy.json"), "utf8"),
);
if (templateRepositoryOption >= 0 && !process.argv[templateRepositoryOption + 1])
  throw new Error("--template-repository requires a checkout path.");

function gitObject(commit, path) {
  return execFileSync("git", ["show", `${commit}:${path}`], { cwd: templateRoot, encoding: "utf8" });
}
function sourceObjectExists(commit, path) {
  try {
    execFileSync("git", ["cat-file", "-e", `${commit}:${path}`], { cwd: templateRoot, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const graph = policy.releaseGraph;
const sourceRelease = graph.previousRelease;
const targetRelease = graph.candidateRelease ?? graph.publicRelease;
const source = graph.releases?.find(release => release.release === sourceRelease);
const target = graph.releases?.find(release => release.release === targetRelease);
const edge = `${sourceRelease}->${targetRelease}`;
if (
  !source ||
  !target ||
  !/^[a-f0-9]{40}$/u.test(source.templateCommit) ||
  !/^[a-f0-9]{40}$/u.test(target.templateCommit)
)
  throw new Error("Active project-upgrade edge must have immutable Template source and target commits.");
if (!graph.edges?.some(candidate => candidate.from === sourceRelease && candidate.to === targetRelease))
  throw new Error("Active project-upgrade edge is not declared.");
const checkedOutTemplateCommit = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: templateRoot,
  encoding: "utf8",
}).trim();
if (checkedOutTemplateCommit !== target.templateCommit)
  throw new Error(`Template checkout is ${checkedOutTemplateCommit}; expected active target ${target.templateCommit}.`);

const activeBaselines = graph.baselines?.[edge];
if (!activeBaselines) throw new Error(`The active ${edge} baseline set is missing.`);
const projectionContract = readApplicationProjectionContract(
  join(repositoryRoot, "contracts", "application-projection-contract.json"),
);
const changedTemplatePaths = execFileSync(
  "git",
  ["diff", "--name-only", source.templateCommit, target.templateCommit, "--"],
  { cwd: templateRoot, encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean);
for (const profile of ["full-stack", "frontend"]) {
  const managedChangedPaths = changedTemplatePaths.filter(
    path => classifyProjectionPath(projectionContract, path, profile)?.category === "managed",
  );
  const declaredBaselines = new Set(
    (activeBaselines[profile] ?? []).map(file => templatePathForBaseline(profile, file.path)),
  );
  const missing = managedChangedPaths.filter(path => !declaredBaselines.has(path));
  if (missing.length)
    throw new Error(
      `${edge}:${profile} has changed managed Template paths without immutable baselines: ${missing.join(", ")}`,
    );
}
let checked = 0;
for (const profile of ["full-stack", "frontend"]) {
  const files = activeBaselines[profile];
  if (!Array.isArray(files)) throw new Error(`${edge}:${profile} baseline list is missing.`);
  for (const file of files) {
    const fixture = profile === "frontend" ? frontendEvidence.get(file.path) : undefined;
    if (fixture) {
      const sourceBytes = readFileSync(fixture.source, "utf8");
      const targetFixture = JSON.parse(readFileSync(fixture.target, "utf8"));
      if (
        targetFixture.schemaVersion !== 1 ||
        targetFixture.release !== targetRelease ||
        targetFixture.path !== file.path ||
        !/^[a-f0-9]{64}$/u.test(targetFixture.sha256 ?? "") ||
        !Number.isSafeInteger(targetFixture.bytes) ||
        targetFixture.bytes < 1
      )
        throw new Error(`${edge}:frontend:${file.path} has invalid frozen target byte evidence.`);
      if (sha256(sourceBytes) !== file.sourceSha256)
        throw new Error(`${edge}:frontend:${file.path} source hash differs from its frozen Vireo fixture.`);
      if (file.operation !== "update" || !file.transforms)
        throw new Error(`${edge}:frontend:${file.path} must be an exact transformed update.`);
      const targetBytes = applyExactBaselineTransforms(sourceBytes, file);
      if (Buffer.byteLength(targetBytes) !== targetFixture.bytes)
        throw new Error(`${edge}:frontend:${file.path} target length differs from frozen Vireo byte evidence.`);
      if (sha256(targetBytes) !== targetFixture.sha256 || targetFixture.sha256 !== file.targetSha256)
        throw new Error(`${edge}:frontend:${file.path} target hash differs from frozen Vireo byte evidence.`);
      checked += 1;
      continue;
    }
    const templatePath = templatePathForBaseline(profile, file.path);
    const templateManaged =
      sourceObjectExists(source.templateCommit, templatePath) ||
      sourceObjectExists(target.templateCommit, templatePath);
    if (profile === "frontend" && !templateManaged) {
      throw new Error(`${edge}:frontend:${file.path} has no frozen Vireo-owned byte evidence.`);
    }
    if (file.operation === "add") {
      if (!/^[a-f0-9]{64}$/u.test(file.targetSha256 ?? ""))
        throw new Error(`${edge}:${profile}:${file.path} add has no exact target hash.`);
      if (!sourceObjectExists(target.templateCommit, templatePath))
        throw new Error(`${edge}:${profile}:${file.path} add is absent from the immutable target Template.`);
      const targetBytes = projectedBaselineBytes(profile, gitObject(target.templateCommit, templatePath), file);
      if (sha256(targetBytes) !== file.targetSha256)
        throw new Error(`${edge}:${profile}:${file.path} add hash differs from immutable Template bytes.`);
      if (sourceObjectExists(source.templateCommit, templatePath))
        throw new Error(`${edge}:${profile}:${file.path} unexpectedly exists in the source Template.`);
      if (file.targetContent !== targetBytes)
        throw new Error(`${edge}:${profile}:${file.path} stored target bytes differ from the immutable Template.`);
    } else if (file.operation === "update") {
      if (!/^[a-f0-9]{64}$/u.test(file.sourceSha256 ?? "") || !/^[a-f0-9]{64}$/u.test(file.targetSha256 ?? ""))
        throw new Error(`${edge}:${profile}:${file.path} update has no exact source/target hash.`);
      if (
        !sourceObjectExists(source.templateCommit, templatePath) ||
        !sourceObjectExists(target.templateCommit, templatePath)
      )
        throw new Error(`${edge}:${profile}:${file.path} update is absent from an immutable Template endpoint.`);
      const sourceBytes = gitObject(source.templateCommit, templatePath);
      const targetBytes = projectedBaselineBytes(profile, gitObject(target.templateCommit, templatePath), file);
      if (sha256(sourceBytes) !== file.sourceSha256)
        throw new Error(`${edge}:${profile}:${file.path} source hash differs from immutable Template bytes.`);
      if (sha256(targetBytes) !== file.targetSha256)
        throw new Error(`${edge}:${profile}:${file.path} target hash differs from immutable Template bytes.`);
      if (file.targetContent !== undefined && file.targetContent !== targetBytes)
        throw new Error(`${edge}:${profile}:${file.path} stored target bytes differ from the immutable Template.`);
      if (file.transforms && applyExactBaselineTransforms(sourceBytes, file) !== targetBytes)
        throw new Error(`${edge}:${profile}:${file.path} transforms do not reproduce immutable Template bytes.`);
    } else if (file.operation === "delete") {
      if (!/^[a-f0-9]{64}$/u.test(file.sourceSha256 ?? "") || typeof file.sourceContent !== "string")
        throw new Error(`${edge}:${profile}:${file.path} delete has no exact source bytes.`);
      if (!sourceObjectExists(source.templateCommit, templatePath))
        throw new Error(`${edge}:${profile}:${file.path} delete is absent from the immutable source Template.`);
      if (sourceObjectExists(target.templateCommit, templatePath))
        throw new Error(`${edge}:${profile}:${file.path} delete remains in the immutable target Template.`);
      const sourceBytes = gitObject(source.templateCommit, templatePath);
      if (sha256(sourceBytes) !== file.sourceSha256 || file.sourceContent !== sourceBytes)
        throw new Error(`${edge}:${profile}:${file.path} delete source differs from immutable Template bytes.`);
    } else {
      throw new Error(`${edge}:${profile}:${file.path} has an unsupported operation.`);
    }
    checked += 1;
  }
}

const historical = graph.baselines?.[historicalEdge];
if (!historical) throw new Error(`Historical ${historicalEdge} baseline set is missing.`);
let expectedProfile;
for (const profile of ["full-stack", "frontend"]) {
  const files = historical[profile];
  if (!Array.isArray(files) || files.length !== managedAdditions.length)
    throw new Error(`${historicalEdge}:${profile} must contain the six declared managed additions.`);
  if (files.some(file => file.operation !== "add") || files.some(file => !managedAdditions.includes(file.path)))
    throw new Error(`${historicalEdge}:${profile} must add only the declared managed application skills.`);
  if (new Set(files.map(file => file.path)).size !== managedAdditions.length)
    throw new Error(`${historicalEdge}:${profile} must declare each managed application skill once.`);
  for (const file of files) {
    const templatePath = `.vireo/application/${file.path}`;
    if (sourceObjectExists("a670d7f95f720a91705c7c156d19e605582fb4c8", templatePath))
      throw new Error(
        `${historicalEdge}:${profile}:${file.path} unexpectedly exists in the immutable source Template.`,
      );
    if (!sourceObjectExists("2aa661d1458b9c2bb5e72f3ec35a6617a2bec04d", templatePath))
      throw new Error(`${historicalEdge}:${profile}:${file.path} is absent from the immutable target Template.`);
    const targetBytes = gitObject("2aa661d1458b9c2bb5e72f3ec35a6617a2bec04d", templatePath);
    if (sha256(targetBytes) !== file.targetSha256 || targetBytes !== file.targetContent)
      throw new Error(`${historicalEdge}:${profile}:${file.path} differs from immutable target Template bytes.`);
  }
  const profileFingerprint = JSON.stringify(files);
  if (expectedProfile === undefined) expectedProfile = profileFingerprint;
  else if (profileFingerprint !== expectedProfile)
    throw new Error(`${historicalEdge} managed additions must be byte-identical for both profiles.`);
}
console.log(`Project-upgrade baselines match active immutable Template objects for ${edge} (${checked} files).`);
