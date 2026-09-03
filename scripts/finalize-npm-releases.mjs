import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publicationScope } from "./publish-verified-npm-candidates.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const exactCommit = /^[a-f0-9]{40}$/u;

export function authorizedNpmReleaseCoordinates(result, scope) {
  const candidateCoordinates = new Set((result?.candidates ?? []).map(candidate => candidate?.coordinate));
  const allowed =
    scope.scope === "classic-libraries"
      ? scope.expected
      : scope.scope === "template-adoption"
        ? new Set([...candidateCoordinates].filter(coordinate => coordinate.startsWith("create-vireo@")))
        : candidateCoordinates;
  if (allowed.size === 0 || [...allowed].some(coordinate => !candidateCoordinates.has(coordinate)))
    throw new Error("Authorized npm release coordinates do not exactly match retained candidate evidence.");
  const mutations = [...(result?.published ?? []), ...(result?.recoveredTags ?? []), ...(result?.publishedTags ?? [])];
  if (mutations.some(coordinate => !allowed.has(coordinate)))
    throw new Error("npm release result contains an out-of-scope tag or publication mutation.");
  return [...allowed].sort();
}

const directories = new Map([
  ["create-vireo", "create-vireo"],
  ["@vireocodedev/history", "history"],
  ["@vireocodedev/infrastructure", "infrastructure"],
  ["@vireocodedev/localization", "localization"],
  ["@vireocodedev/query", "queryengine"],
  ["@vireocodedev/shell", "shell"],
  ["@vireocodedev/sqlite", "sqlite"],
  ["@vireocodedev/ui", "ui"],
]);

export function npmReleaseIdentity(coordinate, changelog) {
  const at = coordinate.lastIndexOf("@");
  const name = coordinate.slice(0, at);
  const version = coordinate.slice(at + 1);
  if (!directories.has(name) || !/^\d+\.\d+\.\d+$/u.test(version))
    throw new Error(`npm GitHub Release has invalid coordinate ${coordinate}.`);
  // This deliberately follows changesets/action getChangelogEntry: a global
  // heading-or-fence scan, exact opening-fence length for the closing scan, and
  // same-depth heading boundaries. Keep the original string offsets intact.
  const matcher = /^(#{1,6})\s(.*)$|^(`{3,})/gmu;
  const next = () => {
    let match;
    while ((match = matcher.exec(changelog))) {
      if (!match[3]) return match;
      const closingFence = new RegExp(`^${match[3]}`, "gmu");
      closingFence.lastIndex = matcher.lastIndex;
      const closing = closingFence.exec(changelog);
      if (!closing) return null;
      matcher.lastIndex = closing.index + closing[0].length;
    }
    return null;
  };
  let heading;
  while ((heading = next())) if (heading[2].trim() === version) break;
  if (!heading) throw new Error(`Package changelog has no exact release entry for ${coordinate}.`);
  const depth = heading[1].length;
  const start = matcher.lastIndex;
  let end = changelog.length;
  let candidate;
  while ((candidate = next())) {
    if (candidate[1].length === depth) {
      end = candidate.index;
      break;
    }
  }
  const body = changelog.slice(start, end).trim();
  if (!body) throw new Error(`Package changelog release entry for ${coordinate} is empty.`);
  return {
    name: coordinate,
    body,
  };
}

async function github(path, { method = "GET", body, fetchResponse = fetch } = {}) {
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
  if (!response.ok) throw new Error(`GitHub npm release API ${method} ${path} returned HTTP ${response.status}.`);
  return response.json();
}

export async function reconcileNpmGitHubReleases({
  coordinates,
  sourceCommit,
  tagCommits = new Map(),
  changelogs,
  request = github,
  sleep = ms => new Promise(resolveSleep => setTimeout(resolveSleep, ms)),
}) {
  if (!exactCommit.test(sourceCommit ?? "")) throw new Error("npm GitHub Release reconciliation requires GITHUB_SHA.");
  const completed = [];
  for (const coordinate of coordinates) {
    const expectedCommit = tagCommits.get(coordinate) ?? sourceCommit;
    if (!exactCommit.test(expectedCommit))
      throw new Error(`npm coordinate ${coordinate} has no exact authorized tag commit.`);
    const tag = encodeURIComponent(coordinate);
    const ref = await request(`/git/ref/tags/${tag}`);
    if (ref?.object?.type !== "tag")
      throw new Error(`npm coordinate ${coordinate} must have an annotated remote tag before release finalization.`);
    const object = await request(`/git/tags/${ref.object.sha}`);
    if (
      object?.tag !== coordinate ||
      object?.message?.trim() !== coordinate ||
      object?.object?.type !== "commit" ||
      object.object.sha !== expectedCommit
    )
      throw new Error(`Remote npm tag ${coordinate} does not exactly bind its authorized source commit.`);
    const identity = npmReleaseIdentity(coordinate, changelogs.get(coordinate));
    let release = await request(`/releases/tags/${tag}`);
    if (!release)
      release = await request("/releases", {
        method: "POST",
        body: {
          tag_name: coordinate,
          target_commitish: expectedCommit,
          name: identity.name,
          body: identity.body,
          draft: false,
          prerelease: false,
        },
      });
    if (
      release?.tag_name !== coordinate ||
      release?.name !== identity.name ||
      release?.body?.trim() !== identity.body ||
      release?.draft !== false ||
      release?.prerelease !== false
    )
      throw new Error(`GitHub Release for ${coordinate} does not exactly match its immutable release identity.`);
    for (let attempt = 0; attempt < 12; attempt += 1) {
      release = await request(`/releases/tags/${tag}`);
      if (release?.immutable === true) break;
      await sleep(5_000);
    }
    if (release?.immutable !== true) throw new Error(`GitHub Release for ${coordinate} did not become immutable.`);
    completed.push({ coordinate, release: release.html_url });
  }
  return completed;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argument = process.argv[2];
  if (
    !argument ||
    process.argv.length !== 3 ||
    process.env.GITHUB_ACTIONS !== "true" ||
    !exactCommit.test(process.env.GITHUB_SHA ?? "")
  )
    throw new Error("Usage: node scripts/finalize-npm-releases.mjs <npm-publication-result.json>");
  const result = JSON.parse(readFileSync(resolve(root, argument), "utf8"));
  const scope = publicationScope();
  const coordinates = authorizedNpmReleaseCoordinates(result, scope);
  const tagCommits = new Map((result.auditedHistorical ?? []).map(entry => [entry.coordinate, entry.commit]));
  const changelogs = new Map(
    coordinates.map(coordinate => {
      const name = coordinate.slice(0, coordinate.lastIndexOf("@"));
      return [coordinate, readFileSync(join(root, "packages", directories.get(name), "CHANGELOG.md"), "utf8")];
    }),
  );
  console.log(
    JSON.stringify(
      await reconcileNpmGitHubReleases({ coordinates, sourceCommit: process.env.GITHUB_SHA, tagCommits, changelogs }),
    ),
  );
}
