export function validatePublicMavenRecord({ record, group, version }) {
  const problems = [];
  if (record.group !== group || record.version !== version || typeof record.module !== "string") problems.push("Maven coordinate drift");
  if (!record.pomMitLicense || !record.binaryJarMitLicense || !record.checksumVerified || !record.signatureVerified) problems.push("Maven metadata/license/signature evidence is incomplete");
  return problems;
}
