import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyProjectionPath } from "./lib/application-projection-contract.mjs";
import {
  planTemplateAdoption,
  readBoundedBytes,
  readPublicTemplateState,
  selectSuccessorRelease,
  validatePublicDependencies,
} from "./template-release-adoption-state.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const githubApi = "https://api.github.com";
const allowedAssetHosts = new Set([
  "api.github.com",
  "github.com",
  "github-releases.githubusercontent.com",
  "objects.githubusercontent.com",
  "release-assets.githubusercontent.com",
]);
async function boundedJson(response, label, maximum = 512 * 1024) {
  const bytes = await readBoundedBytes(response, label, maximum);
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error(`${label} is not valid JSON.`);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
function writeOutput(value) {
  if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `action=${value.action}\n`, { flag: "a" });
}
function parseArguments(args = process.argv.slice(2)) {
  const options = { output: ".template-adoption-plan.json", json: false, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--output") options.output = args[++index] ?? "";
    else if (argument === "--json") options.json = true;
    else if (argument === "--help") options.help = true;
    else throw new Error(`Unknown option ${argument}.`);
  }
  if (!options.output) throw new Error("--output requires a path.");
  return options;
}
async function githubJson(path) {
  const response = await fetch(`${githubApi}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`GitHub API ${path} returned HTTP ${response.status}.`);
  return boundedJson(response, `GitHub API ${path}`);
}
export async function fetchBoundTemplateFile({
  fetchResponse = fetch,
  templateRepository,
  commit,
  path,
  maximum = 2 * 1024 * 1024,
}) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const response = await fetchResponse(
    `${githubApi}/repos/${templateRepository}/contents/${encodedPath}?ref=${commit}`,
    {
      headers: { Accept: "application/vnd.github.raw" },
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) throw new Error(`Template bound file ${path} returned HTTP ${response.status}.`);
  return readBoundedBytes(response, `Template bound file ${path}`, maximum);
}
async function downloadManifest(asset) {
  let url = asset?.browser_download_url;
  if (typeof url !== "string" || new URL(url).protocol !== "https:" || !allowedAssetHosts.has(new URL(url).hostname))
    throw new Error("Template release manifest asset URL is not an approved HTTPS GitHub URL.");
  for (let redirects = 0; redirects <= 2; redirects += 1) {
    const response = await fetch(url, {
      redirect: "manual",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const next = response.headers.get("location");
      if (!next) throw new Error("Template release manifest redirect has no location.");
      url = new URL(next, url).toString();
      if (new URL(url).protocol !== "https:" || !allowedAssetHosts.has(new URL(url).hostname))
        throw new Error("Template release manifest redirected outside approved GitHub asset hosts.");
      continue;
    }
    if (!response.ok) throw new Error(`Template release manifest download returned HTTP ${response.status}.`);
    const bytes = await readBoundedBytes(response, "Template release manifest", 256 * 1024);
    if (bytes.length === 0 || bytes.length > 256 * 1024)
      throw new Error("Template release manifest exceeds the bounded asset size.");
    const digest = `sha256:${(await import("node:crypto")).createHash("sha256").update(bytes).digest("hex")}`;
    if (!/^sha256:[a-f0-9]{64}$/u.test(asset.digest ?? ""))
      throw new Error("Template release manifest must have a GitHub SHA-256 asset digest.");
    if (asset.digest !== digest) throw new Error("Template release manifest bytes do not match GitHub asset digest.");
    try {
      return { manifest: JSON.parse(bytes.toString("utf8")), rawDigest: digest.slice("sha256:".length) };
    } catch {
      throw new Error("Template release manifest is not valid UTF-8 JSON.");
    }
  }
  throw new Error("Template release manifest exceeded the redirect limit.");
}
async function externalCandidate({ ecosystem, policy }) {
  const { releases } = await readPublicTemplateState({ policy });
  const release = selectSuccessorRelease({ releases, currentVersion: ecosystem.current.template.version, policy });
  if (!release)
    return { releases, tag: null, manifest: null, upgrade: { ready: false, reason: "No successor release." } };
  const tagName = encodeURIComponent(release.tag_name);
  const reference = await githubJson(`/repos/${policy.templateRepository}/git/ref/tags/${tagName}`);
  if (reference?.object?.type !== "tag") throw new Error("Template release tag is not annotated.");
  const annotated = await githubJson(`/repos/${policy.templateRepository}/git/tags/${reference.object.sha}`);
  const ancestry = await githubJson(`/repos/${policy.templateRepository}/compare/${annotated?.object?.sha}...main`);
  if (!["ahead", "identical"].includes(ancestry?.status))
    throw new Error("Template release tag commit is not reachable from Template main.");
  const asset = release.assets?.filter(candidate => candidate?.name === policy.releaseManifestAsset);
  if (!Array.isArray(asset) || asset.length !== 1)
    throw new Error("Template release must contain exactly one release manifest asset.");
  const oldTree = await githubJson(
    `/repos/${policy.templateRepository}/git/trees/${ecosystem.current.template.commit}?recursive=1`,
  );
  const newTree = await githubJson(`/repos/${policy.templateRepository}/git/trees/${annotated.object.sha}?recursive=1`);
  if (oldTree?.truncated === true || newTree?.truncated === true)
    throw new Error("Template tree comparison exceeded GitHub's bounded recursive tree response.");
  const before = new Map(
    (oldTree.tree ?? []).filter(entry => entry.type === "blob").map(entry => [entry.path, entry.sha]),
  );
  const after = new Map(
    (newTree.tree ?? []).filter(entry => entry.type === "blob").map(entry => [entry.path, entry.sha]),
  );
  const changed = [...new Set([...before.keys(), ...after.keys()])]
    .filter(path => before.get(path) !== after.get(path))
    .sort();
  const contract = readJson(resolve(root, "contracts/application-projection-contract.json"));
  const unresolved = changed.filter(path => {
    try {
      return !["full-stack", "frontend"].every(profile =>
        ["maintainer-only", "historical"].includes(classifyProjectionPath(contract, path, profile)?.category),
      );
    } catch {
      return true;
    }
  });
  const upgrade = {
    ready: false,
    reason:
      unresolved.length === 0
        ? "A Template successor has no independently reviewed Vireo upgrade-transform proof."
        : "Changed Template paths require Vireo ownership or upgrade-transform review.",
    unresolvedPaths: unresolved,
  };
  const downloaded = await downloadManifest(asset[0]);
  const files = downloaded.manifest?.artifacts?.files;
  const fileDigest = downloaded.manifest?.artifacts?.fileDigest;
  const sortedFiles =
    files && typeof files === "object"
      ? Object.fromEntries(Object.entries(files).sort(([left], [right]) => left.localeCompare(right)))
      : null;
  if (
    !sortedFiles ||
    JSON.stringify(Object.keys(sortedFiles)) !== JSON.stringify([...policy.requiredTemplateBoundFiles].sort()) ||
    !Object.values(sortedFiles).every(value => /^[a-f0-9]{64}$/u.test(value)) ||
    !/^[a-f0-9]{64}$/u.test(fileDigest ?? "") ||
    (await import("node:crypto")).createHash("sha256").update(JSON.stringify(sortedFiles)).digest("hex") !== fileDigest
  )
    throw new Error("Template manifest bound-file digest is not exact.");
  for (const [path, expected] of Object.entries(sortedFiles)) {
    if (!/^[a-f0-9]{64}$/u.test(expected)) throw new Error(`Template manifest bound file is invalid: ${path}`);
    const bytes = await fetchBoundTemplateFile({
      templateRepository: policy.templateRepository,
      commit: annotated.object.sha,
      path,
    });
    const actual = (await import("node:crypto")).createHash("sha256").update(bytes).digest("hex");
    if (actual !== expected) throw new Error(`Template manifest bound file digest drifted at ${path}.`);
  }
  return {
    releases,
    tag: { name: annotated?.tag, annotated: annotated?.object?.type === "commit", commit: annotated?.object?.sha },
    manifest: downloaded.manifest,
    rawManifestDigest: downloaded.rawDigest,
    upgrade,
  };
}
function usage() {
  return "Usage: node scripts/plan-template-adoption.mjs [--output plan.json] [--json]";
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = parseArguments();
  if (options.help) console.log(usage());
  else {
    const policy = readJson(resolve(root, "contracts/template-adoption-policy.json"));
    const ecosystem = readJson(resolve(root, "contracts/ecosystem-release-contract.json"));
    const intent = readJson(resolve(root, "contracts/template-adoption-intent.json"));
    const candidate = await externalCandidate({ ecosystem, policy });
    const plan = {
      ...planTemplateAdoption({ ecosystem, intent, policy, ...candidate }),
      ...(candidate.rawManifestDigest ? { rawManifestDigest: candidate.rawManifestDigest } : {}),
      ...(candidate.upgrade ? { upgrade: candidate.upgrade } : {}),
    };
    if (plan.action === "stage") await validatePublicDependencies({ plan });
    writeFileSync(resolve(root, options.output), `${JSON.stringify(plan, null, 2)}\n`);
    writeOutput(plan);
    console.log(
      options.json ? JSON.stringify(plan) : `${plan.action}: ${plan.reason ?? plan.tag ?? "candidate is public"}`,
    );
    if (plan.action === "fail") throw new Error(`Template adoption planning failed: ${plan.reason}`);
  }
}
