import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sha = /^[a-f0-9]{40}$/u;
const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function git(args, repositoryRoot = root) {
  return execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8" }).trim();
}

export function canonicalReadyAdoption({ policy, plan }) {
  if (plan?.action !== "stage" || plan?.upgrade?.ready !== true || !stableVersion.test(plan.version ?? ""))
    throw new Error("Only a deterministic ready Template adoption can be reconciled.");
  const branch = `${policy.adoptionBranchPrefix}${plan.version}`;
  const marker = `<!-- ${policy.prMarkerPrefix}:starter-template@${plan.version} -->`;
  return {
    branch,
    marker,
    title: `chore(template): adopt starter-template@${plan.version}`,
    body: `${marker}\n\nThis ready PR pins the immutable public Template release and contains the deterministic create-vireo version, changelog, lockfile, and synchronized release contracts.`,
    commitMessage: `chore(template): stage ${plan.version} adoption`,
  };
}

export function requiredChecks(ruleset) {
  const checks = ruleset?.rules?.find(rule => rule.type === "required_status_checks")?.parameters
    ?.required_status_checks;
  if (!Array.isArray(checks) || checks.length === 0)
    throw new Error("The active main ruleset must declare exact required checks.");
  const normalized = checks.map(check => ({ context: check?.context, integration_id: check?.integration_id }));
  if (
    normalized.some(
      check =>
        typeof check.context !== "string" || check.context.length === 0 || !Number.isSafeInteger(check.integration_id),
    ) ||
    new Set(normalized.map(check => `${check.context}:${check.integration_id}`)).size !== normalized.length
  )
    throw new Error("The active main ruleset has invalid or duplicated required checks.");
  return normalized;
}

function blocked(reason, { tampered = false } = {}) {
  return { eligible: false, action: tampered ? "blocked" : "wait", reason };
}

/**
 * Deterministically decide whether a ready adoption PR is still the exact
 * candidate prepared from the current main commit. Network collection lives in
 * inspectRemoteCandidate so this function is exhaustively unit-testable.
 */
export function assessTemplateAdoption({ expected, required, snapshot }) {
  const pr = snapshot?.pr;
  if (!pr) return blocked("No open adoption pull request exists.");
  if (pr.title !== expected.title || pr.body !== expected.body)
    return blocked("The adoption pull request title or body is not canonical.", { tampered: true });
  if (pr.draft !== false) return blocked("The adoption pull request is still a draft or its draft state is unknown.");
  if (pr.base !== "main" || pr.head !== expected.branch)
    return blocked("The adoption pull request base or head is not canonical.", { tampered: true });
  if (pr.author !== expected.appLogin)
    return blocked("The adoption pull request author is not the repository GitHub App.", { tampered: true });
  if (!sha.test(pr.headSha ?? "")) return blocked("The adoption pull request head SHA is invalid.", { tampered: true });
  if (pr.mergeState !== "CLEAN")
    return blocked(`The adoption pull request merge state is ${pr.mergeState ?? "unknown"}.`);
  if (!sha.test(snapshot.mainSha ?? "")) return blocked("The current main SHA is unavailable.");
  if (!Array.isArray(snapshot.commits) || snapshot.commits.length !== 1)
    return blocked("The adoption pull request must contain exactly one commit.", { tampered: true });
  const commit = snapshot.commits[0];
  if (commit.parent !== snapshot.mainSha)
    return blocked("Current main moved after the adoption candidate was created.");
  if (
    commit.sha !== pr.headSha ||
    commit.message !== expected.commitMessage ||
    commit.author !== expected.appLogin ||
    commit.email !== expected.appEmail ||
    commit.committer !== expected.appLogin ||
    commit.committerEmail !== expected.appEmail ||
    commit.tree !== expected.tree
  )
    return blocked("The adoption commit is not the exact App-authored child of current main.", { tampered: true });
  const actualPaths = [...new Set(snapshot.paths ?? [])].sort();
  const expectedPaths = [...new Set(expected.paths ?? [])].sort();
  if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths))
    return blocked("The adoption pull request changes paths outside the deterministic generated set.", {
      tampered: true,
    });
  if (snapshot.threadsComplete !== true || snapshot.threadsResolved !== true)
    return blocked("The adoption pull request has unresolved or unbounded review conversations.");
  for (const check of required) {
    const matching = (snapshot.checks ?? []).filter(
      candidate => candidate.context === check.context && candidate.integration_id === check.integration_id,
    );
    if (matching.length !== 1) return blocked(`Required check ${check.context} is absent or not uniquely latest.`);
    if (matching[0].status !== "COMPLETED" || matching[0].conclusion !== "SUCCESS")
      return blocked(`Required check ${check.context} is not successful.`);
  }
  return { eligible: true, action: "merge", headSha: pr.headSha, pullNumber: pr.number };
}

function parseArguments(args = process.argv.slice(2)) {
  const options = { plan: null, repository: process.env.GITHUB_REPOSITORY, output: null, json: false, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--plan") options.plan = args[++index] ?? "";
    else if (argument === "--repository") options.repository = args[++index] ?? "";
    else if (argument === "--output") options.output = args[++index] ?? "";
    else if (argument === "--json") options.json = true;
    else if (argument === "--help") options.help = true;
    else throw new Error(`Unknown option ${argument}.`);
  }
  if (!options.help && (!options.plan || !/^[A-Za-z0-9_./-]+$/u.test(options.plan)))
    throw new Error("--plan requires a repository-relative safe path.");
  if (!options.help && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(options.repository ?? ""))
    throw new Error("--repository must be an exact owner/repository coordinate.");
  return options;
}

function ghJson(args) {
  return JSON.parse(execFileSync("gh", args, { cwd: root, encoding: "utf8" }));
}

function graphql(query, fields) {
  const args = ["api", "graphql", "-f", `query=${query}`];
  for (const [key, value] of Object.entries(fields)) args.push("-F", `${key}=${value}`);
  return ghJson(args);
}

function remotePaths(repository, number) {
  const files = ghJson(["api", `repos/${repository}/pulls/${number}/files?per_page=100`]);
  if (!Array.isArray(files) || files.length >= 100) throw new Error("Adoption PR file enumeration is unbounded.");
  return files.map(file => file?.filename);
}

function remoteSnapshot({ repository, expected }) {
  const [owner, name] = repository.split("/");
  const prs = ghJson(["api", `repos/${repository}/pulls?state=open&head=${owner}:${expected.branch}&per_page=2`]);
  if (!Array.isArray(prs) || prs.length > 1)
    throw new Error("More than one adoption PR claims the deterministic branch.");
  if (prs.length === 0) return { pr: null };
  const candidate = prs[0];
  const number = candidate?.number;
  if (!Number.isSafeInteger(number)) throw new Error("Adoption PR number is invalid.");
  const detailed = ghJson(["api", `repos/${repository}/pulls/${number}`]);
  const commits = ghJson(["api", `repos/${repository}/pulls/${number}/commits?per_page=2`]);
  const main = ghJson(["api", `repos/${repository}/git/ref/heads/main`]);
  const threadData = graphql(
    "query($owner:String!,$name:String!,$number:Int!){repository(owner:$owner,name:$name){pullRequest(number:$number){reviewThreads(first:100){nodes{isResolved}pageInfo{hasNextPage}}}}}",
    { owner, name, number },
  );
  const threads = threadData?.data?.repository?.pullRequest?.reviewThreads;
  return {
    pr: {
      number,
      title: detailed?.title,
      body: detailed?.body,
      draft: detailed?.draft,
      base: detailed?.base?.ref,
      head: detailed?.head?.ref,
      headSha: detailed?.head?.sha,
      author: detailed?.user?.login,
      mergeState: detailed?.mergeable_state?.toUpperCase(),
    },
    mainSha: main?.object?.sha,
    commits: (Array.isArray(commits) ? commits : []).map(item => ({
      sha: item?.sha,
      message: item?.commit?.message,
      author: item?.commit?.author?.name,
      email: item?.commit?.author?.email,
      committer: item?.commit?.committer?.name,
      committerEmail: item?.commit?.committer?.email,
      parent: item?.parents?.length === 1 ? item.parents[0]?.sha : null,
      tree: item?.commit?.tree?.sha,
    })),
    paths: remotePaths(repository, number),
    threadsComplete: threads?.pageInfo?.hasNextPage === false,
    threadsResolved: Array.isArray(threads?.nodes) && threads.nodes.every(thread => thread?.isResolved === true),
    checks: (() => {
      const checks = ghJson([
        "api",
        `repos/${repository}/commits/${detailed?.head?.sha}/check-runs?filter=latest&per_page=100`,
      ]);
      if (
        !Array.isArray(checks?.check_runs) ||
        !Number.isSafeInteger(checks?.total_count) ||
        checks.total_count < 0 ||
        checks.total_count >= 100 ||
        checks.check_runs.length > checks.total_count
      )
        throw new Error("Adoption PR check-run enumeration is unbounded.");
      return checks.check_runs.map(run => ({
        context: run?.name,
        integration_id: run?.app?.id,
        status: typeof run?.status === "string" ? run.status.toUpperCase() : run?.status,
        conclusion: typeof run?.conclusion === "string" ? run.conclusion.toUpperCase() : run?.conclusion,
      }));
    })(),
  };
}

export function localExpectedCandidate({ repositoryRoot = root, planPath }) {
  const plan = readJson(resolve(repositoryRoot, planPath));
  const policy = readJson(resolve(repositoryRoot, "contracts/template-adoption-policy.json"));
  const publication = readJson(resolve(repositoryRoot, "contracts/ecosystem-publication-policy.json"));
  const expected = canonicalReadyAdoption({ policy, plan });
  expected.appLogin = publication.generatedReleasePullRequest.authorLogin;
  expected.appEmail = `${publication.generatedReleasePullRequest.authorId}+${expected.appLogin}@users.noreply.github.com`;
  expected.tree = git(["write-tree"], repositoryRoot);
  expected.paths = git(["diff", "--cached", "--name-only", "HEAD"], repositoryRoot).split("\n").filter(Boolean).sort();
  if (expected.paths.length === 0)
    throw new Error("A ready adoption must produce a non-empty deterministic change set.");
  return { plan, expected };
}

export function inspectTemplateAdoption({ repositoryRoot = root, planPath, repository }) {
  const { expected } = localExpectedCandidate({ repositoryRoot, planPath });
  const required = requiredChecks(readJson(resolve(repositoryRoot, ".github/rulesets/main.json")));
  return assessTemplateAdoption({ expected, required, snapshot: remoteSnapshot({ repository, expected }) });
}

function writeOutput(options, result) {
  if (options.output) writeFileSync(options.output, `${JSON.stringify(result, null, 2)}\n`);
  if (process.env.GITHUB_OUTPUT) {
    writeFileSync(
      process.env.GITHUB_OUTPUT,
      `eligible=${result.eligible}\naction=${result.action}\nhead_sha=${result.headSha ?? ""}\npull_number=${result.pullNumber ?? ""}\n`,
      { flag: "a" },
    );
  }
  console.log(
    options.json ? JSON.stringify(result) : `${result.action}: ${result.reason ?? result.headSha ?? "eligible"}`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = parseArguments();
  if (options.help)
    console.log(
      "Usage: node scripts/reconcile-template-adoption.mjs --plan plan.json [--repository owner/repo] [--json]",
    );
  else {
    const result = inspectTemplateAdoption({ planPath: options.plan, repository: options.repository });
    writeOutput(options, result);
    if (result.action === "blocked")
      throw new Error(`Template adoption reconciliation failed closed: ${result.reason}`);
  }
}
