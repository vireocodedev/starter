export function validatePublicMavenRecord({ record, group, version }) {
  const problems = [];
  if (record.group !== group || record.version !== version || typeof record.module !== "string")
    problems.push("Maven coordinate drift");
  const licenseValid =
    record.extension === "pom"
      ? record.pomMitLicense
      : record.extension === "jar"
        ? record.licenseContentVerified && /^[0-9a-f]{64}$/u.test(record.licenseSha256 ?? "")
        : true;
  const coordinatesValid = record.extension === "pom" ? record.pomCoordinateVerified : true;
  if (!licenseValid || !coordinatesValid || !record.checksumVerified || !record.signatureVerified)
    problems.push("Maven metadata/license/signature evidence is incomplete");
  return problems;
}
