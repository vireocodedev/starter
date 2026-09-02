import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const sensitiveKey = /(?:token|password|secret|credential|authorization|api[-_]?key)/iu;
export const maximumSanitizedCommandTailBytes = 4_096;

/**
 * Keep failure diagnostics useful without letting anonymous-run paths or
 * credentials escape into durable machine evidence.
 */
export function sanitizeCommandTail(value, { maximumBytes = maximumSanitizedCommandTailBytes } = {}) {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1)
    throw new Error("Command-tail evidence limit must be a positive safe integer.");
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8");
  let output = bytes.subarray(Math.max(0, bytes.length - maximumBytes)).toString("utf8");
  output = output
    .replace(/(bearer\s+)[^\s]+/giu, "$1[redacted]")
    .replace(/([?&][A-Za-z0-9_.-]+)=([^&#\s]*)/gu, "$1[redacted]")
    .replace(/\b([A-Za-z][A-Za-z0-9+.-]*:\/\/)([^\s/@:]+):([^\s/@]+)@/gu, "$1[redacted]@")
    .replace(
      /\b(?:token|password|secret|credential|authorization|api[-_]?key)\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/giu,
      "[redacted]",
    )
    .replace(/(?:file:\/\/)?\/(?:[^\s'"?#]+\/)*[^\s'"?#]*/gu, "[path]")
    .replace(/[A-Za-z]:\\(?:[^\s'"?#]+\\)*[^\s'"?#]*/gu, "[path]");
  return output;
}

export function sanitizeEvidence(value) {
  if (Array.isArray(value)) return value.map(sanitizeEvidence);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sensitiveKey.test(key) ? "[redacted]" : sanitizeEvidence(entry),
      ]),
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
