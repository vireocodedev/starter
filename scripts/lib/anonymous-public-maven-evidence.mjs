export function validatePublicMavenRecord({ record, group, version }) {
  const problems = [];
  if (record.group !== group || record.version !== version || typeof record.module !== "string") problems.push("Maven coordinate drift");
  const licenseValid = record.extension === "pom" ? record.pomMitLicense : record.extension === "jar" ? record.binaryJarMitLicense : true;
  if (!licenseValid || !record.checksumVerified || !record.signatureVerified) problems.push("Maven metadata/license/signature evidence is incomplete");
  return problems;
}
