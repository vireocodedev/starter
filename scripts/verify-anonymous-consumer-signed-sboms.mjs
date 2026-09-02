import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { publicReleaseIdentity, readJson } from "./lib/anonymous-consumer-environment.mjs";
import { writeEvidenceAtomically } from "./lib/anonymous-consumer-evidence.mjs";
import { validateReleaseSbomManifest } from "./lib/release-sbom-evidence.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const predicateType = "https://cyclonedx.org/bom";
const sourceRef = "refs/heads/main";

function argumentValue(arguments_, name) {
  const index = arguments_.indexOf(name);
  if (index < 0 || !arguments_[index + 1] || arguments_[index + 1].startsWith("--")) {
    throw new Error(`Missing ${name} argument.`);
  }
  return arguments_[index + 1];
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function safeEvidencePath(root, candidate) {
  if (typeof candidate !== "string" || candidate.length === 0) throw new Error("Evidence subject path is missing.");
  const path = resolve(root, candidate);
  if (path !== root && !path.startsWith(`${root}/`)) throw new Error(`Evidence subject path escapes its artifact: ${candidate}`);
  if (normalize(relative(root, path)).startsWith("..")) throw new Error(`Evidence subject path escapes its artifact: ${candidate}`);
  return path;
}

function sameRelease(left, right) {
  return (
    left?.id === right.id &&
    left?.createVireoVersion === right.createVireoVersion &&
    JSON.stringify(left?.template) === JSON.stringify(right.template) &&
    JSON.stringify(left?.npm) === JSON.stringify(right.npm) &&
    JSON.stringify(left?.maven) === JSON.stringify(right.maven)
  );
}

/**
 * Validates the downloaded anonymous evidence and creates one exact-byte
 * subject verification plan. The caller intentionally invokes `gh` once per
 * subject: Maven modules can bind several subject files to one SBOM.
 */
export function signedSbomVerificationPlan({ evidenceRoot, release, policy, readJsonFile = readJson, hash = sha256 }) {
  const evidence = readJsonFile(join(evidenceRoot, "evidence.json"));
  const manifest = readJsonFile(join(evidenceRoot, "public-release-evidence", "public-release-manifest.json"));
  const problems = validateReleaseSbomManifest(manifest, policy, {
    root: join(evidenceRoot, "public-release-evidence"),
  });
  if (evidence?.status !== "passed") problems.push("anonymous consumer evidence is not passed");
  if (!sameRelease(evidence?.release, release)) problems.push("anonymous consumer evidence does not match the exact release contract");
  if (!/^[0-9a-f]{40}$/u.test(evidence?.releaseTagCommit ?? "")) problems.push("anonymous consumer evidence has no exact release tag commit");
  if (manifest?.source?.repository !== `https://github.com/${policy.repository}`) problems.push("public evidence has an unexpected source repository");

  const mappingForSubject = new Map();
  for (const mapping of manifest?.sboms ?? []) {
    for (const subjectPath of mapping.subjects ?? []) {
      if (mappingForSubject.has(subjectPath)) problems.push(`subject ${subjectPath} belongs to multiple SBOM mappings`);
      mappingForSubject.set(subjectPath, mapping);
    }
  }

  const subjects = [];
  for (const subject of manifest?.subjects ?? []) {
    const mapping = mappingForSubject.get(subject.path);
    if (!mapping) {
      problems.push(`subject ${subject.path ?? "<missing>"} has no SBOM mapping`);
      continue;
    }
    if (mapping.coordinate !== subject.coordinate || mapping.ecosystem !== subject.ecosystem) {
      problems.push(`subject ${subject.path} crosses its SBOM coordinate boundary`);
      continue;
    }
    let path;
    try {
      path = safeEvidencePath(join(evidenceRoot, "public-release-evidence"), subject.path);
      if (!existsSync(path)) problems.push(`exact public subject is missing: ${subject.path}`);
      else if (hash(path) !== subject.sha256) problems.push(`exact public subject digest drifted: ${subject.path}`);
    } catch (error) {
      problems.push(error instanceof Error ? error.message : String(error));
      continue;
    }
    subjects.push({
      path: subject.path,
      absolutePath: path,
      sha256: subject.sha256,
      coordinate: subject.coordinate,
      ecosystem: subject.ecosystem,
      sbomId: mapping.id,
    });
  }
  if (subjects.length !== (policy.npm.expectedSubjectCount + policy.maven.expectedSubjectCount)) {
    problems.push("signed SBOM verification plan has a missing or extra exact subject");
  }
  if (new Set(subjects.map(subject => subject.path)).size !== subjects.length) {
    problems.push("signed SBOM verification plan contains duplicate subjects");
  }
  if (problems.length > 0) throw new Error(`Anonymous signed SBOM evidence is invalid:\n${problems.map(problem => `- ${problem}`).join("\n")}`);

  return {
    releaseId: release.id,
    releaseTagCommit: evidence.releaseTagCommit,
    subjects: subjects.toSorted((left, right) => left.path.localeCompare(right.path)),
  };
}

export function verifySignedSbomPlan({ plan, repository, execute = execFileSync, run, onVerified = () => {} }) {
  const certIdentity = `https://github.com/${repository}/.github/workflows/attest-public-release.yml@refs/heads/main`;
  const verification = {
    repository,
    predicateType,
    certIdentity,
    sourceRef,
    sourceDigest: plan.releaseTagCommit,
    run,
  };
  const verifiedSubjects = [];
  for (const subject of plan.subjects) {
    execute(
      "gh",
      [
        "attestation",
        "verify",
        subject.absolutePath,
        "--repo",
        repository,
        "--predicate-type",
        predicateType,
        "--cert-identity",
        certIdentity,
        "--source-ref",
        sourceRef,
        "--source-digest",
        plan.releaseTagCommit,
      ],
      { stdio: "inherit", env: { ...process.env, GH_PROMPT_DISABLED: "1", NO_COLOR: "1" } },
    );
    verifiedSubjects.push({
      path: subject.path,
      sha256: subject.sha256,
      coordinate: subject.coordinate,
      ecosystem: subject.ecosystem,
      sbomId: subject.sbomId,
      verification,
    });
    onVerified(verifiedSubjects.at(-1));
  }
  return verifiedSubjects;
}

function main() {
  const arguments_ = process.argv.slice(2);
  const evidenceRoot = resolve(repositoryRoot, argumentValue(arguments_, "--evidence-dir"));
  const output = resolve(repositoryRoot, argumentValue(arguments_, "--output"));
  const release = publicReleaseIdentity(readJson(join(repositoryRoot, "contracts", "ecosystem-release-contract.json")));
  const policy = readJson(join(repositoryRoot, "contracts", "public-release-attestation-policy.json"));
  const run = {
    repository: process.env.GITHUB_REPOSITORY ?? "local",
    id: process.env.GITHUB_RUN_ID ?? "local",
    attempt: process.env.GITHUB_RUN_ATTEMPT ?? "1",
    url: process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : "local",
  };
  const summary = {
    schemaVersion: 1,
    evidenceClass: "anonymous-consumer-signed-sbom-verification",
    status: "running",
    releaseId: release.id,
    subjects: [],
  };
  try {
    const plan = signedSbomVerificationPlan({ evidenceRoot, release, policy });
    summary.releaseTagCommit = plan.releaseTagCommit;
    verifySignedSbomPlan({
      plan,
      repository: policy.repository,
      run,
      onVerified: record => summary.subjects.push(record),
    });
    summary.status = "passed";
    writeEvidenceAtomically(output, summary);
    console.log(`Verified ${summary.subjects.length} signed CycloneDX SBOM attestations for ${release.id}.`);
  } catch (error) {
    summary.status = "failed";
    summary.error = error instanceof Error ? error.message : String(error);
    writeEvidenceAtomically(output, summary);
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
