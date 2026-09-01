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
const sourceCommit = "a670d7f95f720a91705c7c156d19e605582fb4c8";
const targetCommit = "2aa661d1458b9c2bb5e72f3ec35a6617a2bec04d";
const edge = "0.7.0->0.8.0";
const managedAdditions = [
  ".agents/skills/vireo-app-feature-author/SKILL.md",
  ".agents/skills/vireo-app-feature-author/agents/openai.yaml",
  ".agents/skills/vireo-app-production-readiness/SKILL.md",
  ".agents/skills/vireo-app-production-readiness/agents/openai.yaml",
  ".agents/skills/vireo-app-upgrader/SKILL.md",
  ".agents/skills/vireo-app-upgrader/agents/openai.yaml",
];
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
  throw new Error("Template checkout is " + checkedOutTemplateCommit + "; expected frozen " + targetCommit + ".");

function gitObject(commit, path) {
  return execFileSync("git", ["show", commit + ":" + path], {
    cwd: templateRoot,
    encoding: "utf8",
  });
}
function templatePath(consumerPath) {
  return ".vireo/application/" + consumerPath;
}
function sourceObjectExists(path) {
  try {
    execFileSync("git", ["cat-file", "-e", sourceCommit + ":" + path], {
      cwd: templateRoot,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

const baselines = policy.releaseGraph?.baselines?.[edge];
if (!baselines) throw new Error("The final " + edge + " baseline set is missing.");
let checked = 0;
let expectedProfile;
for (const profile of ["full-stack", "frontend"]) {
  const files = baselines[profile];
  if (!Array.isArray(files) || files.length !== managedAdditions.length)
    throw new Error(edge + ":" + profile + " must contain the six declared managed additions.");
  if (files.some(file => file.operation !== "add") || files.some(file => !managedAdditions.includes(file.path)))
    throw new Error(edge + ":" + profile + " must add only the declared managed application skills.");
  if (new Set(files.map(file => file.path)).size !== managedAdditions.length)
    throw new Error(edge + ":" + profile + " must declare each managed application skill once.");
  const profileFingerprint = JSON.stringify(files);
  if (expectedProfile === undefined) expectedProfile = profileFingerprint;
  else if (profileFingerprint !== expectedProfile)
    throw new Error(edge + " managed additions must be byte-identical for both profiles.");

  for (const file of files) {
    const sourcePath = templatePath(file.path);
    if (sourceObjectExists(sourcePath))
      throw new Error(profile + ":" + sourcePath + " unexpectedly exists in the 0.7 Template source.");
    const target = gitObject(targetCommit, sourcePath);
    if (sha256(target) !== file.targetSha256)
      throw new Error(profile + ":" + file.path + " target hash does not match the immutable 0.8 Template.");
    if (file.targetContent !== target)
      throw new Error(profile + ":" + file.path + " stored target bytes differ from the immutable 0.8 Template.");
    checked += 1;
  }
}
console.log(
  "Project-upgrade baselines match immutable Template objects for " + edge + " (" + checked + " managed additions).",
);
