import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readBoundedBytes,
  stableJson,
  validateAdoptionPolicy,
  validateImmutableTemplateRelease,
} from "./template-release-adoption-state.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedLibraries = new Set([
  "@vireocodedev/history",
  "@vireocodedev/infrastructure",
  "@vireocodedev/localization",
  "@vireocodedev/query",
  "@vireocodedev/shell",
  "@vireocodedev/sqlite",
  "@vireocodedev/ui",
]);
const exactCommit = /^[a-f0-9]{40}$/u;
const exactSha256 = /^[a-f0-9]{64}$/u;
const approvedAssetHosts = new Set([
  "api.github.com",
  "github.com",
  "github-releases.githubusercontent.com",
  "objects.githubusercontent.com",
  "release-assets.githubusercontent.com",
]);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
async function boundedJson(response, label, maximum = 512 * 1024) {
  if (!response.body?.getReader && typeof response.arrayBuffer !== "function") return response.json();
  try {
    return JSON.parse((await readBoundedBytes(response, label, maximum)).toString("utf8"));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`${label} is not valid JSON.`, { cause: error });
    throw error;
  }
}
function publicManifests(repositoryRoot = root) {
  return ["create-vireo", "history", "infrastructure", "localization", "queryengine", "shell", "sqlite", "ui"].map(
    directory => readJson(join(repositoryRoot, "packages", directory, "package.json")),
  );
}

function exactEntries(entries, names, label) {
  if (!Array.isArray(entries) || entries.length !== names.length)
    return `${label} must contain the exact required coordinates.`;
  const actual = new Map(entries.map(entry => [entry?.name, entry]));
  if (actual.size !== names.length || [...names].some(name => !actual.has(name)))
    return `${label} must contain the exact required coordinates.`;
  return null;
}

function receiptProblems({ ecosystem, intent, policy }) {
  const problems = [...validateAdoptionPolicy(policy)];
  const current = ecosystem?.current;
  if (intent?.schemaVersion !== 1 || intent?.status !== "adopted")
    problems.push("Template adoption receipt must be a finalized schema-1 receipt.");
  if (!exactSha256.test(intent?.releaseManifestSha256 ?? ""))
    problems.push("Template adoption receipt must retain the raw immutable manifest SHA-256.");
  if (intent?.source !== "immutable-template-release") problems.push("Template adoption receipt source is invalid.");
  const expectedTemplate = current?.template;
  if (
    intent?.template?.repository !== policy?.templateRepository ||
    intent?.template?.version !== expectedTemplate?.version ||
    intent?.template?.tag !== expectedTemplate?.tag ||
    intent?.template?.commit !== expectedTemplate?.commit ||
    intent?.template?.releaseUrl !== expectedTemplate?.releaseUrl
  )
    problems.push("Template adoption receipt does not exactly match the current immutable Template contract.");
  if (intent?.createVireoVersion !== expectedTemplate?.version || intent?.ecosystemRelease !== current?.id)
    problems.push("Template adoption receipt does not exactly match the current CLI ecosystem identity.");
  const npmProblem = exactEntries(
    intent?.npm,
    policy?.requiredNpmPackages ?? [],
    "Template adoption receipt npm evidence",
  );
  if (npmProblem) problems.push(npmProblem);
  const currentNpm = new Map((current?.npm ?? []).map(entry => [entry?.name, entry?.version]));
  for (const entry of intent?.npm ?? []) {
    if (
      entry?.version !== currentNpm.get(entry?.name) ||
      !/^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(entry?.integrity ?? "") ||
      !exactSha256.test(entry?.attestationBundleSha256 ?? "")
    )
      problems.push(`Template adoption receipt npm evidence is invalid for ${entry?.name ?? "<missing>"}.`);
  }
  const modules = policy?.requiredMavenModules ?? [];
  const maven = intent?.maven;
  if (
    maven?.group !== current?.maven?.group ||
    maven?.version !== current?.maven?.version ||
    JSON.stringify([...(maven?.modules ?? [])].sort()) !== JSON.stringify([...modules].sort())
  )
    problems.push("Template adoption receipt Maven coordinate does not exactly match the current ecosystem.");
  for (const module of modules) {
    if (
      !exactSha256.test(maven?.moduleDigests?.[module]?.sha256 ?? "") ||
      !exactSha256.test(maven?.moduleDigests?.[module]?.signatureSha256 ?? "")
    )
      problems.push(`Template adoption receipt Maven evidence is invalid for ${module}.`);
  }
  return problems;
}

async function githubJson(fetchResponse, url, headers, label) {
  const response = await fetchResponse(url, { headers, redirect: "error", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}.`);
  return boundedJson(response, label);
}

async function downloadExactManifest(fetchResponse, asset) {
  let url = asset?.browser_download_url;
  if (typeof url !== "string" || new URL(url).protocol !== "https:" || !approvedAssetHosts.has(new URL(url).hostname))
    throw new Error("Template release manifest asset URL is not an approved HTTPS GitHub URL.");
  for (let redirects = 0; redirects <= 2; redirects += 1) {
    const response = await fetchResponse(url, {
      headers: { Accept: "application/json" },
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const next = response.headers?.get?.("location");
      if (!next) throw new Error("Template release manifest redirect has no location.");
      url = new URL(next, url).toString();
      if (new URL(url).protocol !== "https:" || !approvedAssetHosts.has(new URL(url).hostname))
        throw new Error("Template release manifest redirected outside approved GitHub asset hosts.");
      continue;
    }
    if (!response.ok) throw new Error(`Template release manifest download returned HTTP ${response.status}.`);
    const bytes = await readBoundedBytes(response, "Template release manifest", 256 * 1024);
    const digest = (await import("node:crypto")).createHash("sha256").update(bytes).digest("hex");
    if (asset?.digest !== `sha256:${digest}`)
      throw new Error("Template release manifest bytes do not match its required GitHub asset digest.");
    try {
      return { manifest: JSON.parse(bytes.toString("utf8")), digest };
    } catch {
      throw new Error("Template release manifest is not valid JSON.");
    }
  }
  throw new Error("Template release manifest exceeded the redirect limit.");
}

export async function rebindImmutableTemplateIntent({ ecosystem, intent, policy, fetchResponse = fetch }) {
  const problems = receiptProblems({ ecosystem, intent, policy });
  if (problems.length) throw new Error(problems.join(" "));
  const headers = {
    Accept: "application/vnd.github+json",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };
  const tag = encodeURIComponent(intent.template.tag);
  const release = await githubJson(
    fetchResponse,
    `https://api.github.com/repos/${policy.templateRepository}/releases/tags/${tag}`,
    headers,
    "Template release",
  );
  if (release?.tag_name !== intent.template.tag || release?.html_url !== intent.template.releaseUrl)
    throw new Error("Public Template release identity does not exactly match the finalized receipt.");
  const reference = await githubJson(
    fetchResponse,
    `https://api.github.com/repos/${policy.templateRepository}/git/ref/tags/${tag}`,
    headers,
    "Template tag ref",
  );
  if (reference?.object?.type !== "tag" || !exactCommit.test(reference.object.sha ?? ""))
    throw new Error("Template release tag must remain annotated.");
  const tagObject = await githubJson(
    fetchResponse,
    `https://api.github.com/repos/${policy.templateRepository}/git/tags/${reference.object.sha}`,
    headers,
    "Template tag object",
  );
  const commit = tagObject?.object?.type === "commit" ? tagObject.object.sha : null;
  if (!exactCommit.test(commit ?? "")) throw new Error("Template release tag must peel to a commit.");
  if (commit !== intent.template.commit)
    throw new Error("Public Template tag commit does not exactly match the finalized receipt.");
  const ancestry = await githubJson(
    fetchResponse,
    `https://api.github.com/repos/${policy.templateRepository}/compare/${commit}...main`,
    headers,
    "Template tag ancestry",
  );
  if (!["ahead", "identical"].includes(ancestry?.status))
    throw new Error("Public Template tag commit is not reachable from Template main.");
  const assets = release?.assets?.filter(asset => asset?.name === policy.releaseManifestAsset) ?? [];
  if (assets.length !== 1) throw new Error("Template release must retain exactly one release manifest asset.");
  const { manifest, digest } = await downloadExactManifest(fetchResponse, assets[0]);
  const validation = validateImmutableTemplateRelease({
    release,
    tag: { name: intent.template.tag, annotated: true, commit },
    manifest,
    policy,
    current: { template: { version: "0.0.0" } },
  });
  if (validation.problems.length) throw new Error(validation.problems.join(" "));
  if (digest !== intent.releaseManifestSha256)
    throw new Error("Immutable Template manifest asset digest does not match the finalized receipt.");
  const exactNpm = new Map(validation.npm.map(entry => [entry.name, entry]));
  for (const entry of intent.npm) {
    const publicEntry = exactNpm.get(entry.name);
    if (
      !publicEntry ||
      entry.version !== publicEntry.version ||
      entry.integrity !== publicEntry.integrity ||
      entry.attestationBundleSha256 !== publicEntry.attestationBundleSha256
    )
      throw new Error(`Immutable Template npm evidence does not match finalized receipt for ${entry.name}.`);
  }
  if (stableJson(intent.maven) !== stableJson(validation.maven))
    throw new Error("Immutable Template Maven evidence does not match finalized receipt.");
  return true;
}

export function validateAutomaticTemplatePublication({
  ecosystem,
  intent,
  manifests,
  policy = readJson(join(root, "contracts/template-adoption-policy.json")),
}) {
  const problems = receiptProblems({ ecosystem, intent, policy });
  const create = manifests.find(manifest => manifest.name === "create-vireo");
  if (create?.version !== intent?.createVireoVersion)
    problems.push("create-vireo version must equal the adopted Template version.");
  const receiptLibraries = new Map((intent?.npm ?? []).map(entry => [entry?.name, entry?.version]));
  if (
    receiptLibraries.size !== expectedLibraries.size ||
    [...expectedLibraries].some(name => !receiptLibraries.has(name))
  )
    problems.push("Template adoption receipt must bind exactly seven library package versions.");
  for (const manifest of manifests.filter(manifest => manifest.name !== "create-vireo")) {
    if (receiptLibraries.get(manifest.name) !== manifest.version)
      problems.push(`${manifest.name} does not match the adopted immutable Template package coordinate.`);
  }
  if (intent?.maven?.version !== ecosystem?.current?.maven?.version)
    problems.push("Template adoption receipt does not match the current Maven release.");
  return problems;
}

export async function planAutomaticTemplatePublication({
  ecosystem,
  intent,
  manifests,
  policy = readJson(join(root, "contracts/template-adoption-policy.json")),
  fetchResponse = fetch,
  rebind = rebindImmutableTemplateIntent,
}) {
  const problems = validateAutomaticTemplatePublication({ ecosystem, intent, manifests, policy });
  if (problems.length) return { action: "fail", reason: problems.join(" ") };
  try {
    await rebind({ ecosystem, intent, policy, fetchResponse });
  } catch (error) {
    return { action: "fail", reason: `Immutable Template adoption evidence could not be rebound: ${error.message}` };
  }
  const states = [];
  for (const manifest of manifests) {
    const response = await fetchResponse(
      `https://registry.npmjs.org/${encodeURIComponent(manifest.name)}/${encodeURIComponent(manifest.version)}`,
      { headers: { Accept: "application/json" }, redirect: "error", signal: AbortSignal.timeout(10_000) },
    );
    if (response.status === 404) states.push({ coordinate: `${manifest.name}@${manifest.version}`, state: "absent" });
    else if (response.ok) states.push({ coordinate: `${manifest.name}@${manifest.version}`, state: "public" });
    else
      return {
        action: "fail",
        reason: `npm registry returned HTTP ${response.status} for ${manifest.name}@${manifest.version}`,
      };
  }
  const absent = states.filter(item => item.state === "absent").map(item => item.coordinate);
  const expectedCreate = `create-vireo@${intent.createVireoVersion}`;
  if (absent.length === 0) {
    if (!/^[a-f0-9]{64}$/u.test(intent?.releaseManifestSha256 ?? ""))
      return { action: "no-op", reason: "All exact package versions are already public." };
    const githubHeaders = {
      Accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    };
    const tagResponse = await fetchResponse(
      `https://api.github.com/repos/vireocodedev/vireo/git/ref/tags/${encodeURIComponent(expectedCreate)}`,
      { headers: githubHeaders, redirect: "error", signal: AbortSignal.timeout(10_000) },
    );
    if (tagResponse.status === 404) {
      return { action: "recover-create-vireo", coordinate: expectedCreate };
    }
    if (!tagResponse.ok || tagResponse.status !== 200)
      return { action: "fail", reason: `GitHub tag lookup returned HTTP ${tagResponse.status} for ${expectedCreate}` };
    const ref = await boundedJson(tagResponse, `GitHub tag ${expectedCreate}`);
    if (ref?.object?.type !== "tag" || !/^[a-f0-9]{40}$/u.test(ref.object.sha ?? ""))
      return { action: "fail", reason: "Recovered CLI tag must be annotated." };
    const objectResponse = await fetchResponse(
      `https://api.github.com/repos/vireocodedev/vireo/git/tags/${ref.object.sha}`,
      { headers: githubHeaders, redirect: "error", signal: AbortSignal.timeout(10_000) },
    );
    if (!objectResponse.ok) return { action: "fail", reason: "Recovered CLI tag object is unavailable." };
    const tagged = await boundedJson(objectResponse, `GitHub tag object ${expectedCreate}`);
    const headSha = tagged?.object?.type === "commit" ? tagged.object.sha : null;
    if (!/^[a-f0-9]{40}$/u.test(headSha ?? ""))
      return { action: "fail", reason: "Recovered CLI tag does not peel to a commit." };
    const runs = [];
    for (let page = 1; page <= 3; page += 1) {
      const runsResponse = await fetchResponse(
        `https://api.github.com/repos/vireocodedev/vireo/deployments?environment=package-release&per_page=100&page=${page}`,
        { headers: githubHeaders, redirect: "error", signal: AbortSignal.timeout(10_000) },
      );
      if (!runsResponse.ok) return { action: "fail", reason: "Package-release deployment evidence lookup failed." };
      const deployments = await boundedJson(runsResponse, `Package-release deployments page ${page}`);
      if (!Array.isArray(deployments))
        return { action: "fail", reason: "Package-release deployment evidence is malformed." };
      runs.push(...deployments.filter(run => /^[a-f0-9]{40}$/u.test(run?.sha ?? "")));
      if (deployments.length < 100) break;
    }
    let successful = false;
    for (const run of runs) {
      const statusesResponse = await fetchResponse(
        `https://api.github.com/repos/vireocodedev/vireo/deployments/${run.id}/statuses?per_page=20`,
        { headers: githubHeaders, redirect: "error", signal: AbortSignal.timeout(10_000) },
      );
      if (
        !statusesResponse.ok ||
        !(await boundedJson(statusesResponse, `Package-release deployment ${run.id} statuses`))?.some(
          status => status?.state === "success",
        )
      )
        continue;
      const readAtHead = async path => {
        const response = await fetchResponse(
          `https://api.github.com/repos/vireocodedev/vireo/contents/${path}?ref=${run.sha}`,
          { headers: githubHeaders, redirect: "error", signal: AbortSignal.timeout(10_000) },
        );
        if (!response.ok) return null;
        const payload = await boundedJson(response, `Deployment ${run.id} ${path}`);
        if (
          payload?.encoding !== "base64" ||
          typeof payload.content !== "string" ||
          payload.content.length > 512 * 1024
        )
          return null;
        try {
          return JSON.parse(Buffer.from(payload.content, "base64").toString("utf8"));
        } catch {
          return null;
        }
      };
      const [runIntent, runCreate, runEcosystem] = await Promise.all([
        readAtHead("contracts/template-adoption-intent.json"),
        readAtHead("packages/create-vireo/package.json"),
        readAtHead("contracts/ecosystem-release-contract.json"),
      ]);
      if (
        runIntent?.template?.commit === intent.template.commit &&
        runIntent?.releaseManifestSha256 === intent.releaseManifestSha256 &&
        runIntent?.createVireoVersion === intent.createVireoVersion &&
        runCreate?.version === intent.createVireoVersion &&
        runEcosystem?.current?.template?.commit === intent.template.commit
      ) {
        successful = true;
        break;
      }
    }
    return successful
      ? { action: "no-op", reason: "Exact public CLI tag has successful release qualification evidence." }
      : { action: "recover-create-vireo", coordinate: expectedCreate };
  }
  if (absent.length === 1 && absent[0] === expectedCreate)
    return { action: "publish-create-vireo", coordinate: expectedCreate };
  return {
    action: "fail",
    reason: `Automatic Template adoption may publish only ${expectedCreate}; absent coordinates: ${absent.join(", ")}`,
  };
}

export async function planNpmPublication({ confirmation, ...options }) {
  if (confirmation === "publish")
    return { action: "manual-confirmed", reason: "Manual dispatch retains the ordinary reviewed npm release path." };
  return planAutomaticTemplatePublication(options);
}

export function requireNonFailingPublicationPlan(result) {
  if (result?.action === "fail") throw new Error(`Automatic Template publication planning failed: ${result.reason}`);
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ecosystem = readJson(join(root, "contracts/ecosystem-release-contract.json"));
  const intent = readJson(join(root, "contracts/template-adoption-intent.json"));
  const result = await planNpmPublication({
    confirmation: process.env.MANUAL_CONFIRMATION,
    ecosystem,
    intent,
    manifests: publicManifests(),
  });
  if (process.env.GITHUB_OUTPUT)
    await import("node:fs/promises").then(({ appendFile }) =>
      appendFile(process.env.GITHUB_OUTPUT, `action=${result.action}\n`),
    );
  console.log(JSON.stringify(result));
  requireNonFailingPublicationPlan(result);
}
