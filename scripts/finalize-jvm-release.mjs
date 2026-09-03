import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function changelogSection(source, version) {
  const heading = `## ${version}`;
  const start = source.indexOf(`${heading}\n`);
  if (start < 0 || (start > 0 && source[start - 1] !== "\n"))
    throw new Error(`JVM changelog has no exact release notes for ${version}.`);
  const bodyStart = start + heading.length + 1;
  const next = source.indexOf("\n## ", bodyStart);
  const notes = source.slice(bodyStart, next < 0 ? undefined : next).trim();
  if (!notes) throw new Error(`JVM changelog has no exact release notes for ${version}.`);
  return notes;
}
async function api(path, { method = "GET", body, fetchResponse = fetch } = {}) {
  const response = await fetchResponse(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ""}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub JVM finalization API ${method} ${path} returned HTTP ${response.status}.`);
  return response.json();
}
export async function finalizeJvmRelease({
  version,
  sha,
  changelog,
  recoveryOnly = false,
  request = api,
  sleep = ms => new Promise(resolveSleep => setTimeout(resolveSleep, ms)),
}) {
  if (!/^\d+\.\d+\.\d+$/u.test(version) || !/^[a-f0-9]{40}$/u.test(sha))
    throw new Error("JVM finalization requires exact version and release SHA.");
  const tag = `jvm-v${version}`;
  const name = `Vireo JVM ${version}`;
  const notes = changelogSection(changelog, version);
  const existingRef = await request(`/git/ref/tags/${encodeURIComponent(tag)}`);
  if (existingRef) {
    if (existingRef.object?.type !== "tag") throw new Error(`Existing ${tag} must be annotated.`);
    const object = await request(`/git/tags/${existingRef.object.sha}`);
    if (
      object?.tag !== tag ||
      object?.message?.trim() !== name ||
      object?.object?.type !== "commit" ||
      object.object.sha !== sha
    )
      throw new Error(`Existing ${tag} does not exactly bind the authorized JVM release.`);
  } else {
    if (recoveryOnly) throw new Error(`Public Maven recovery requires existing exact annotated tag ${tag}.`);
    const object = await request("/git/tags", {
      method: "POST",
      body: { tag, message: name, object: sha, type: "commit" },
    });
    if (!object?.sha) throw new Error("GitHub did not return the new annotated JVM tag object.");
    await request("/git/refs", { method: "POST", body: { ref: `refs/tags/${tag}`, sha: object.sha } });
  }
  let release = await request(`/releases/tags/${encodeURIComponent(tag)}`);
  if (!release) {
    if (recoveryOnly) throw new Error(`Public Maven recovery requires existing immutable GitHub Release ${tag}.`);
    release = await request("/releases", {
      method: "POST",
      body: { tag_name: tag, target_commitish: sha, name, body: notes, draft: false, prerelease: false },
    });
  }
  // GitHub can render target_commitish as a branch name for an existing tag.
  // The annotated Git object checked above is the immutable source binding.
  if (
    release?.tag_name !== tag ||
    release?.name !== name ||
    release?.body?.trim() !== notes ||
    release?.draft !== false ||
    release?.prerelease !== false
  )
    throw new Error("JVM GitHub Release does not exactly match the authorized immutable release.");
  if (recoveryOnly && release.immutable !== true)
    throw new Error(`Public Maven recovery requires immutable GitHub Release ${tag}.`);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    release = await request(`/releases/tags/${encodeURIComponent(tag)}`);
    if (release?.immutable === true) return { tag, release: release.html_url };
    await sleep(5_000);
  }
  throw new Error("GitHub Release did not become immutable after JVM finalization.");
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [version, sha, mode] = process.argv.slice(2);
  if (![4, 5].includes(process.argv.length) || !process.env.GITHUB_ACTIONS || (mode && mode !== "--recover-only"))
    throw new Error("Usage: node scripts/finalize-jvm-release.mjs <version> <sha> [--recover-only]");
  const changelog = readFileSync(join(root, "jvm", "CHANGELOG.md"), "utf8");
  console.log(
    JSON.stringify(await finalizeJvmRelease({ version, sha, changelog, recoveryOnly: mode === "--recover-only" })),
  );
}
