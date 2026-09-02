import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const sensitiveKey = /(?:token|password|secret|credential|authorization|api[-_]?key)/iu;

export function sanitizeEvidence(value) {
  if (Array.isArray(value)) return value.map(sanitizeEvidence);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, sensitiveKey.test(key) ? "[redacted]" : sanitizeEvidence(entry)]),
    );
  }
  return typeof value === "string" ? value.replace(/(bearer\s+)[^\s]+/giu, "$1[redacted]") : value;
}

export function writeEvidenceAtomically(path, evidence) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = join(dirname(path), `.${path.split("/").pop()}.${process.pid}.tmp`);
  writeFileSync(temporary, `${JSON.stringify(sanitizeEvidence(evidence), null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, path);
}
