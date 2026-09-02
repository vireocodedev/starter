import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { publicReleaseIdentity, readJson } from "./lib/anonymous-consumer-environment.mjs";
import { writeEvidenceAtomically } from "./lib/anonymous-consumer-evidence.mjs";
import { validateFinalAnonymousEvidence } from "./lib/anonymous-consumer-final-evidence.mjs";
import { validateReleaseSbomManifest } from "./lib/release-sbom-evidence.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const predicateType = "https://cyclonedx.org/bom";
const commitPattern = /^[0-9a-f]{40}$/u;

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
  if (path !== root && !path.startsWith(`${root}/`))
    throw new Error(`Evidence subject path escapes its artifact: ${candidate}`);
  if (normalize(relative(root, path)).startsWith(".."))
    throw new Error(`Evidence subject path escapes its artifact: ${candidate}`);
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

function trustedAttestationPolicy(policy) {
  return {
    repository: policy.repository,
    repositoryId: policy.trust.repositoryId,
    workflowIdentity: policy.trust.workflowIdentity,
    workflowRef: policy.trust.workflowRef,
    workflowName: policy.trust.workflowName,
    oidcIssuer: policy.trust.oidcIssuer,
    allowedTriggers: policy.trust.allowedTriggers,
    runnerEnvironment: policy.trust.runnerEnvironment,
    sourceRepositoryVisibility: policy.trust.sourceRepositoryVisibility,
    minimumTrustedWorkflowCommit: policy.trust.minimumTrustedWorkflowCommit,
  };
}

/**
 * Validates the downloaded anonymous evidence and creates one exact-byte
 * subject verification plan. The caller intentionally invokes `gh` once per
 * subject: Maven modules can bind several subject files to one SBOM.
 */
export function signedSbomVerificationPlan({
  evidenceRoot,
  release,
  policy,
  gauntletPolicy,
  readJsonFile = readJson,
  hash = sha256,
}) {
  const evidence = readJsonFile(join(evidenceRoot, "evidence.json"));
  const manifest = readJsonFile(join(evidenceRoot, "public-release-evidence", "public-release-manifest.json"));
  const problems = validateReleaseSbomManifest(manifest, policy, {
    root: join(evidenceRoot, "public-release-evidence"),
  });
  if (!gauntletPolicy) problems.push("anonymous consumer gauntlet policy is required for final evidence validation");
  const finalEvidenceProblems = validateFinalAnonymousEvidence(evidence, release, gauntletPolicy);
  problems.push(...finalEvidenceProblems.map(problem => `anonymous consumer final evidence: ${problem}`));
  if (!sameRelease(evidence?.release, release))
    problems.push("anonymous consumer evidence does not match the exact release contract");
  if (!/^[0-9a-f]{40}$/u.test(evidence?.releaseTagCommit ?? ""))
    problems.push("anonymous consumer evidence has no exact release tag commit");
  if (!/^[0-9a-f]{40}$/u.test(evidence?.verifierSourceCommit ?? ""))
    problems.push("anonymous consumer evidence has no exact verifier source commit");
  if (manifest?.source?.repository !== `https://github.com/${policy.repository}`)
    problems.push("public evidence has an unexpected source repository");
  if (manifest?.source?.commit !== evidence?.verifierSourceCommit)
    problems.push("public evidence source commit does not match the verifier source commit");
  if (manifest?.source?.clean !== true) problems.push("public evidence source checkout is not clean");

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
  if (subjects.length !== policy.npm.expectedSubjectCount + policy.maven.expectedSubjectCount) {
    problems.push("signed SBOM verification plan has a missing or extra exact subject");
  }
  if (new Set(subjects.map(subject => subject.path)).size !== subjects.length) {
    problems.push("signed SBOM verification plan contains duplicate subjects");
  }
  if (problems.length > 0)
    throw new Error(
      `Anonymous signed SBOM evidence is invalid:\n${problems.map(problem => `- ${problem}`).join("\n")}`,
    );

  return {
    releaseId: release.id,
    releaseTagCommit: evidence.releaseTagCommit,
    verifierSourceCommit: evidence.verifierSourceCommit,
    trust: trustedAttestationPolicy(policy),
    subjects: subjects.toSorted((left, right) => left.path.localeCompare(right.path)),
  };
}

function actualRun(uri, repository) {
  const match = new RegExp(`^https://github\\.com/${repository}/actions/runs/(\\d+)/attempts/(\\d+)$`, "u").exec(
    uri ?? "",
  );
  if (!match) throw new Error("verified certificate has no canonical GitHub Actions run invocation URI");
  return { id: match[1], attempt: match[2], url: uri };
}

function attesterSourceCommit(certificate) {
  const fields = ["githubWorkflowSHA", "buildSignerDigest", "sourceRepositoryDigest", "buildConfigDigest"];
  const values = fields.map(field => certificate?.[field]);
  if (values.some(value => !commitPattern.test(value ?? "")))
    throw new Error("verified certificate has a malformed attester source commit.");
  if (new Set(values).size !== 1)
    throw new Error("verified certificate attester source commit fields are not self-consistent.");
  return values[0];
}

function defaultIsAncestor(ancestor, descendant) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
      cwd: repositoryRoot,
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && error.status === 1) return false;
    throw error;
  }
}

function cachedIsAncestor({ ancestor, descendant, isAncestor, cache }) {
  const key = `${ancestor}:${descendant}`;
  if (!cache.has(key)) cache.set(key, Boolean(isAncestor(ancestor, descendant)));
  return cache.get(key);
}

function assertTrustedCertificate({ certificate, trust, attesterCommit }) {
  const expectedCertificate = {
    subjectAlternativeName: trust.workflowIdentity,
    githubWorkflowRepository: trust.repository,
    githubWorkflowRef: trust.workflowRef,
    githubWorkflowName: trust.workflowName,
    buildSignerURI: trust.workflowIdentity,
    sourceRepositoryURI: `https://github.com/${trust.repository}`,
    sourceRepositoryRef: trust.workflowRef,
    buildConfigURI: trust.workflowIdentity,
    sourceRepositoryIdentifier: trust.repositoryId,
    runnerEnvironment: trust.runnerEnvironment,
    sourceRepositoryVisibilityAtSigning: trust.sourceRepositoryVisibility,
  };
  for (const [field, expected] of Object.entries(expectedCertificate)) {
    if (certificate?.[field] !== expected)
      throw new Error(`verified certificate ${field} does not match the canonical attester identity.`);
  }
  if (certificate?.issuer !== trust.oidcIssuer) throw new Error("verified certificate has an unexpected OIDC issuer.");
  for (const field of ["githubWorkflowTrigger", "buildTrigger"]) {
    if (!trust.allowedTriggers.includes(certificate?.[field]))
      throw new Error(`verified certificate ${field} is not an allowed attester trigger.`);
  }
  if (certificate.githubWorkflowTrigger !== certificate.buildTrigger)
    throw new Error("verified certificate trigger fields are not self-consistent.");
  return attesterCommit;
}

function expectedSbomComponent(subject) {
  if (subject.ecosystem === "npm") {
    const separator = subject.coordinate.lastIndexOf("@");
    if (separator <= 0) throw new Error(`invalid npm subject coordinate ${subject.coordinate}`);
    return { name: subject.coordinate.slice(0, separator), version: subject.coordinate.slice(separator + 1) };
  }
  const [group, name, version, extra] = subject.coordinate.split(":");
  if (!group || !name || !version || extra) throw new Error(`invalid Maven subject coordinate ${subject.coordinate}`);
  return { group, name, version };
}

function validateSignedCycloneDx({ predicate, subject }) {
  const expected = expectedSbomComponent(subject);
  const component = predicate?.metadata?.component;
  if (predicate?.bomFormat !== "CycloneDX" || !/^\d+\.\d+(?:\.\d+)?$/u.test(predicate?.specVersion ?? "")) {
    throw new Error(`verified attestation for ${subject.path} does not contain a valid CycloneDX SBOM.`);
  }
  if (
    component?.name !== expected.name ||
    component?.version !== expected.version ||
    (expected.group && component?.group !== expected.group)
  ) {
    throw new Error(`verified CycloneDX SBOM does not describe ${subject.coordinate}.`);
  }
  return { bomFormat: predicate.bomFormat, specVersion: predicate.specVersion, component: expected };
}

/** Parses and enforces the machine-readable result returned by `gh`, not merely its exit status. */
export function verifiedAttestationRecord({
  output,
  subject,
  plan,
  isAncestor = defaultIsAncestor,
  ancestryCache = new Map(),
}) {
  let entries;
  try {
    entries = JSON.parse(output);
  } catch (error) {
    throw new Error("gh attestation verify returned malformed JSON.", { cause: error });
  }
  if (!Array.isArray(entries) || entries.length === 0)
    throw new Error("gh attestation verify returned no verified attestations.");

  const actual = [];
  let ignoredFutureAttestationCount = 0;
  for (const entry of entries) {
    if (!entry?.attestation?.bundle) throw new Error("gh attestation verify returned no attestation bundle.");
    const result = entry?.verificationResult;
    const certificate = result?.signature?.certificate;
    const attesterCommit = attesterSourceCommit(certificate);
    if (
      attesterCommit !== plan.verifierSourceCommit &&
      cachedIsAncestor({
        ancestor: plan.verifierSourceCommit,
        descendant: attesterCommit,
        isAncestor,
        cache: ancestryCache,
      })
    ) {
      ignoredFutureAttestationCount += 1;
      continue;
    }
    if (
      !cachedIsAncestor({
        ancestor: plan.trust.minimumTrustedWorkflowCommit,
        descendant: attesterCommit,
        isAncestor,
        cache: ancestryCache,
      }) ||
      !cachedIsAncestor({
        ancestor: attesterCommit,
        descendant: plan.verifierSourceCommit,
        isAncestor,
        cache: ancestryCache,
      })
    ) {
      throw new Error("verified certificate attester source commit is outside the trusted workflow ancestry window.");
    }
    const matchingSubject = result?.statement?.subject?.find(candidate => candidate?.digest?.sha256 === subject.sha256);
    if (!matchingSubject)
      throw new Error(`verified attestation does not bind ${subject.path} to its exact SHA-256 digest.`);
    if (result?.statement?.predicateType !== predicateType)
      throw new Error(`verified attestation for ${subject.path} has an unexpected predicate.`);
    const sbom = validateSignedCycloneDx({ predicate: result.statement.predicate, subject });
    assertTrustedCertificate({ certificate, trust: plan.trust, attesterCommit });
    const timestamps = result?.verifiedTimestamps;
    if (!Array.isArray(timestamps) || timestamps.length === 0)
      throw new Error("verified attestation has no verified timestamp.");
    actual.push({
      statement: { subjectSha256: matchingSubject.digest.sha256, predicateType: result.statement.predicateType },
      sbom,
      certificate: {
        attesterSourceCommit: attesterCommit,
        subjectAlternativeName: certificate.subjectAlternativeName,
        githubWorkflowRepository: certificate.githubWorkflowRepository,
        githubWorkflowRef: certificate.githubWorkflowRef,
        githubWorkflowSHA: certificate.githubWorkflowSHA,
        githubWorkflowName: certificate.githubWorkflowName,
        githubWorkflowTrigger: certificate.githubWorkflowTrigger,
        buildSignerURI: certificate.buildSignerURI,
        buildSignerDigest: certificate.buildSignerDigest,
        sourceRepositoryURI: certificate.sourceRepositoryURI,
        sourceRepositoryDigest: certificate.sourceRepositoryDigest,
        sourceRepositoryRef: certificate.sourceRepositoryRef,
        buildConfigURI: certificate.buildConfigURI,
        buildConfigDigest: certificate.buildConfigDigest,
        buildTrigger: certificate.buildTrigger,
        sourceRepositoryIdentifier: certificate.sourceRepositoryIdentifier,
        run: actualRun(certificate.runInvocationURI, plan.trust.repository),
      },
      verifiedTimestampCount: timestamps.length,
    });
  }
  if (actual.length === 0)
    throw new Error(
      `gh attestation verify returned no eligible attestations within the trusted workflow window for ${subject.path}.`,
    );
  return { attestations: actual, ignoredFutureAttestationCount };
}

export function verifySignedSbomPlan({
  plan,
  repository,
  execute = execFileSync,
  isAncestor = defaultIsAncestor,
  run,
  onVerified = () => {},
}) {
  if (repository !== plan.trust.repository)
    throw new Error("signed SBOM verifier repository does not match its trust policy.");
  const ancestryCache = new Map();
  const verification = {
    repository,
    predicateType,
    certIdentity: plan.trust.workflowIdentity,
    sourceRef: plan.trust.workflowRef,
    releaseTagCommit: plan.releaseTagCommit,
    verifierSourceCommit: plan.verifierSourceCommit,
    minimumTrustedWorkflowCommit: plan.trust.minimumTrustedWorkflowCommit,
    run,
  };
  const verifiedSubjects = [];
  for (const subject of plan.subjects) {
    const executeResult = execute(
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
        plan.trust.workflowIdentity,
        "--cert-oidc-issuer",
        plan.trust.oidcIssuer,
        "--source-ref",
        plan.trust.workflowRef,
        "--format",
        "json",
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, GH_PROMPT_DISABLED: "1", NO_COLOR: "1" },
      },
    );
    const record = verifiedAttestationRecord({
      output: executeResult,
      subject,
      plan,
      isAncestor,
      ancestryCache,
    });
    verifiedSubjects.push({
      path: subject.path,
      sha256: subject.sha256,
      coordinate: subject.coordinate,
      ecosystem: subject.ecosystem,
      sbomId: subject.sbomId,
      verification: { ...verification, ...record },
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
  const gauntletPolicy = readJson(join(repositoryRoot, "contracts", "anonymous-consumer-gauntlet-policy.json"));
  const run = {
    repository: process.env.GITHUB_REPOSITORY ?? "local",
    id: process.env.GITHUB_RUN_ID ?? "local",
    attempt: process.env.GITHUB_RUN_ATTEMPT ?? "1",
    url:
      process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : "local",
  };
  const summary = {
    schemaVersion: 2,
    evidenceClass: "anonymous-consumer-signed-sbom-verification",
    status: "running",
    releaseId: release.id,
    subjects: [],
  };
  try {
    const plan = signedSbomVerificationPlan({ evidenceRoot, release, policy, gauntletPolicy });
    summary.releaseTagCommit = plan.releaseTagCommit;
    summary.verifierSourceCommit = plan.verifierSourceCommit;
    summary.minimumTrustedWorkflowCommit = plan.trust.minimumTrustedWorkflowCommit;
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
