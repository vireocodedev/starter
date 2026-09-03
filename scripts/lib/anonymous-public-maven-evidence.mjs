function nonemptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/** Compares public Maven coordinates as validated, unordered sets without mutating either source. */
export function publicMavenCoordinatesMatch({ policyMaven, contractMaven }) {
  if (
    !policyMaven ||
    typeof policyMaven !== "object" ||
    !contractMaven ||
    typeof contractMaven !== "object" ||
    !nonemptyString(policyMaven.group) ||
    !nonemptyString(contractMaven.group) ||
    policyMaven.group !== contractMaven.group ||
    !Array.isArray(policyMaven.modules) ||
    policyMaven.modules.length === 0 ||
    !Array.isArray(contractMaven.modules) ||
    contractMaven.modules.length === 0
  )
    return false;
  const policyModules = policyMaven.modules.map(module =>
    module && typeof module === "object" && !Array.isArray(module) ? module.name : undefined,
  );
  const contractModules = [...contractMaven.modules];
  if (!policyModules.every(nonemptyString) || !contractModules.every(nonemptyString)) return false;
  if (new Set(policyModules).size !== policyModules.length || new Set(contractModules).size !== contractModules.length)
    return false;
  if (policyModules.length !== contractModules.length) return false;
  const sortedPolicyModules = [...policyModules].sort();
  const sortedContractModules = [...contractModules].sort();
  return sortedPolicyModules.every((module, index) => module === sortedContractModules[index]);
}

export function validatePublicMavenRecord({ record, group, version }) {
  const problems = [];
  if (record.group !== group || record.version !== version || typeof record.module !== "string")
    problems.push("Maven coordinate drift");
  const licenseValid =
    record.extension === "pom"
      ? record.pomMitLicense
      : record.extension === "jar"
        ? record.licenseContentVerified === true && /^[0-9a-f]{64}$/u.test(record.licenseSha256 ?? "")
        : true;
  const coordinatesValid = record.extension === "pom" ? record.pomCoordinateVerified : true;
  if (!licenseValid || !coordinatesValid || !record.checksumVerified || !record.signatureVerified)
    problems.push("Maven metadata/license/signature evidence is incomplete");
  return problems;
}
