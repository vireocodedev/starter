function nonemptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

const canonicalMavenModuleNames = [
  "vireo-bom",
  "vireo-core",
  "vireo-auth",
  "vireo-query",
  "vireo-history",
  "vireo-offline",
];
const canonicalMavenModules = new Map([
  [
    "vireo-bom",
    [
      { classifier: "", extension: "pom" },
      { classifier: "", extension: "module" },
    ],
  ],
  ...canonicalMavenModuleNames.slice(1).map(name => [
    name,
    [
      { classifier: "", extension: "pom" },
      { classifier: "", extension: "jar" },
      { classifier: "-sources", extension: "jar" },
      { classifier: "-javadoc", extension: "jar" },
      { classifier: "", extension: "module" },
    ],
  ]),
]);

/** Compares public Maven coordinates as validated, unordered sets without mutating either source. */
export function publicMavenCoordinatesMatch({ policyMaven, contractMaven }) {
  if (
    !policyMaven ||
    typeof policyMaven !== "object" ||
    !contractMaven ||
    typeof contractMaven !== "object" ||
    policyMaven.group !== "com.vireocode" ||
    contractMaven.group !== "com.vireocode" ||
    !Array.isArray(policyMaven.modules) ||
    policyMaven.modules.length !== canonicalMavenModuleNames.length ||
    !Array.isArray(contractMaven.modules) ||
    contractMaven.modules.length !== canonicalMavenModuleNames.length
  )
    return false;
  const policyModules = policyMaven.modules.map(module =>
    module && typeof module === "object" && !Array.isArray(module) ? module.name : undefined,
  );
  const contractModules = [...contractMaven.modules];
  if (!policyModules.every(nonemptyString) || !contractModules.every(nonemptyString)) return false;
  if (new Set(policyModules).size !== policyModules.length || new Set(contractModules).size !== contractModules.length)
    return false;
  const expectedModules = [...canonicalMavenModuleNames].sort();
  const sortedPolicyModules = [...policyModules].sort();
  const sortedContractModules = [...contractModules].sort();
  return (
    sortedPolicyModules.every((module, index) => module === expectedModules[index]) &&
    sortedContractModules.every((module, index) => module === expectedModules[index])
  );
}

const sha256 = value => /^[0-9a-f]{64}$/u.test(value ?? "");

/** Returns the exact public Vireo Maven family with each POM processed first. */
export function publicMavenModulesInVerificationOrder(maven) {
  if (!maven || typeof maven !== "object" || maven.group !== "com.vireocode" || !Array.isArray(maven.modules))
    return null;
  if (maven.modules.length !== canonicalMavenModules.size) return null;
  const modulesByName = new Map();
  for (const module of maven.modules) {
    if (!module || typeof module !== "object" || !nonemptyString(module.name) || modulesByName.has(module.name))
      return null;
    modulesByName.set(module.name, module);
  }
  if (modulesByName.size !== canonicalMavenModules.size) return null;
  const ordered = [];
  for (const [name, expectedArtifacts] of canonicalMavenModules) {
    const module = modulesByName.get(name);
    if (!module || !Array.isArray(module.artifacts) || module.artifacts.length !== expectedArtifacts.length)
      return null;
    const artifactsBySubject = new Map();
    for (const artifact of module.artifacts) {
      if (
        !artifact ||
        typeof artifact !== "object" ||
        Array.isArray(artifact) ||
        !Object.hasOwn(artifact, "classifier") ||
        !Object.hasOwn(artifact, "extension") ||
        Object.keys(artifact).length !== 2 ||
        typeof artifact.classifier !== "string" ||
        typeof artifact.extension !== "string"
      )
        return null;
      const subject = `${artifact.classifier}\u0000${artifact.extension}`;
      if (artifactsBySubject.has(subject)) return null;
      artifactsBySubject.set(subject, artifact);
    }
    const artifacts = expectedArtifacts.map(expected =>
      artifactsBySubject.get(`${expected.classifier}\u0000${expected.extension}`),
    );
    if (artifacts.some(artifact => artifact === undefined)) return null;
    ordered.push({ ...module, artifacts });
  }
  return ordered;
}

/** Returns a POM-first exact order for one canonical public Vireo Maven module. */
export function mavenPublicationArtifactsInVerificationOrder(module) {
  if (!module || typeof module !== "object") return null;
  const ordered = publicMavenModulesInVerificationOrder({
    group: "com.vireocode",
    modules: [...canonicalMavenModules.keys()].map(name =>
      name === module.name ? module : { name, artifacts: canonicalMavenModules.get(name) },
    ),
  });
  const matched = ordered?.find(candidate => candidate.name === module.name);
  if (!matched) return null;
  return matched.artifacts;
}

function isVerifiedPublicationPom({ pom, record, group, version }) {
  return (
    pom &&
    typeof pom === "object" &&
    pom.group === group &&
    pom.module === record.module &&
    pom.version === version &&
    pom.extension === "pom" &&
    pom.classifier === "" &&
    pom.subject === `${record.module}-${version}.pom` &&
    sha256(pom.sha256) &&
    pom.checksumVerified === true &&
    pom.signatureVerified === true &&
    pom.pomCoordinateVerified === true &&
    pom.pomMitLicense === true
  );
}

function hasPublicationPomLink({ record, group, version, verifiedPom }) {
  return (
    isVerifiedPublicationPom({ pom: verifiedPom, record, group, version }) &&
    record.publicationPomSubject === verifiedPom.subject &&
    record.publicationPomSha256 === verifiedPom.sha256
  );
}

export function validatePublicMavenRecord({ record, group, version, verifiedPom = null }) {
  const problems = [];
  if (
    !record ||
    typeof record !== "object" ||
    record.group !== group ||
    record.version !== version ||
    !nonemptyString(record.module)
  )
    problems.push("Maven coordinate drift");
  if (!record || typeof record !== "object") return problems;
  if (!record.checksumVerified || !record.signatureVerified || !sha256(record.sha256))
    problems.push("Maven metadata/license/signature evidence is incomplete");
  if (record.extension === "pom") {
    if (
      record.classifier !== "" ||
      record.subject !== `${record.module}-${version}.pom` ||
      record.pomMitLicense !== true ||
      record.pomCoordinateVerified !== true ||
      record.licenseContentVerified !== null ||
      record.licenseSha256 !== null
    )
      problems.push("Maven POM publication evidence is incomplete");
    return problems;
  }
  if (record.pomMitLicense !== null) problems.push("Only POM artifacts may carry POM license evidence");
  if (record.extension === "jar" && record.classifier === "") {
    if (record.licenseContentVerified !== true || !sha256(record.licenseSha256))
      problems.push("Maven main JAR license evidence is incomplete");
    if (!hasPublicationPomLink({ record, group, version, verifiedPom }))
      problems.push("Maven publication family linkage is incomplete");
    return problems;
  }
  const auxiliaryJar = record.extension === "jar" && ["-sources", "-javadoc"].includes(record.classifier);
  const moduleMetadata = record.extension === "module" && record.classifier === "";
  if (!auxiliaryJar && !moduleMetadata) {
    problems.push("Maven publication artifact is unsupported");
    return problems;
  }
  if (record.licenseContentVerified !== null || record.licenseSha256 !== null)
    problems.push("Only the main JAR may carry embedded license evidence");
  if (!hasPublicationPomLink({ record, group, version, verifiedPom }))
    problems.push("Maven publication family linkage is incomplete");
  return problems;
}
