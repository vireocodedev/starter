import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
    join(repositoryRoot, "packages", "create-vireo", "fixtures", "project-upgrades", "vireo-frontend-doctor.0.7.0.mjs"),
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
function applyTransforms(source, file) {
  let output = source;
  for (const transform of file.transforms ?? []) {
    if (!transform?.from || typeof transform.to !== "string" || output.split(transform.from).length !== 2)
      throw new Error(`Baseline transform is not exact: ${file.path}`);
    output = output.replace(transform.from, transform.to);
  }
  return output;
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
let checked = 0;
for (const profile of ["full-stack", "frontend"]) {
  const files = activeBaselines[profile];
  if (!Array.isArray(files)) throw new Error(`${edge}:${profile} baseline list is missing.`);
  for (const file of files) {
    if (!/^[a-f0-9]{64}$/u.test(file.targetSha256 ?? ""))
      throw new Error(`${edge}:${profile}:${file.path} has no exact target hash.`);
    if (profile === "frontend") {
      const fixturePath = frontendEvidence.get(file.path);
      if (!fixturePath) throw new Error(`${edge}:frontend:${file.path} has no frozen Vireo-owned byte evidence.`);
      const sourceBytes = readFileSync(fixturePath, "utf8");
      if (sha256(sourceBytes) !== file.sourceSha256)
        throw new Error(`${edge}:frontend:${file.path} source hash differs from its frozen Vireo fixture.`);
      if (file.operation !== "update" || !file.transforms)
        throw new Error(`${edge}:frontend:${file.path} must be an exact transformed update.`);
      const targetBytes = applyTransforms(sourceBytes, file);
      if (sha256(targetBytes) !== file.targetSha256)
        throw new Error(`${edge}:frontend:${file.path} target hash differs from frozen Vireo byte evidence.`);
      checked += 1;
      continue;
    }
    if (!sourceObjectExists(target.templateCommit, file.path))
      throw new Error(`${edge}:${profile}:${file.path} is absent from the immutable target Template.`);
    const targetBytes = gitObject(target.templateCommit, file.path);
    if (sha256(targetBytes) !== file.targetSha256)
      throw new Error(`${edge}:${profile}:${file.path} target hash differs from immutable Template bytes.`);
    if (file.operation === "add") {
      if (sourceObjectExists(source.templateCommit, file.path))
        throw new Error(`${edge}:${profile}:${file.path} unexpectedly exists in the source Template.`);
      if (file.targetContent !== targetBytes)
        throw new Error(`${edge}:${profile}:${file.path} stored target bytes differ from the immutable Template.`);
    } else if (file.operation === "update") {
      const sourceBytes = gitObject(source.templateCommit, file.path);
      if (sha256(sourceBytes) !== file.sourceSha256)
        throw new Error(`${edge}:${profile}:${file.path} source hash differs from immutable Template bytes.`);
      if (file.targetContent !== undefined && file.targetContent !== targetBytes)
        throw new Error(`${edge}:${profile}:${file.path} stored target bytes differ from the immutable Template.`);
      if (file.transforms && applyTransforms(sourceBytes, file) !== targetBytes)
        throw new Error(`${edge}:${profile}:${file.path} transforms do not reproduce immutable Template bytes.`);
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
  const profileFingerprint = JSON.stringify(files);
  if (expectedProfile === undefined) expectedProfile = profileFingerprint;
  else if (profileFingerprint !== expectedProfile)
    throw new Error(`${historicalEdge} managed additions must be byte-identical for both profiles.`);
}
console.log(`Project-upgrade baselines match active immutable Template objects for ${edge} (${checked} files).`);
