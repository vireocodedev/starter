import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const sensitiveKey = /(?:token|password|secret|credential|authorization|api[-_]?key)/iu;
export const maximumSanitizedCommandTailBytes = 4_096;
const truncatedCommandOutputMarker = "[truncated command output]\n";

function utf8Tail(value, maximumBytes) {
  const bytes = Buffer.from(value, "utf8");
  if (bytes.length <= maximumBytes) return value;
  let start = bytes.length - maximumBytes;
  while (start < bytes.length && (bytes[start] & 0b1100_0000) === 0b1000_0000) start += 1;
  return bytes.subarray(start).toString("utf8");
}

function sanitizeCommandOutput(value) {
  return value
    .replace(/(bearer\s+)[^\s]+/giu, "$1[redacted]")
    .replace(/([?&][A-Za-z0-9_.-]+)=([^&#\s]*)/gu, "$1[redacted]")
    .replace(/\b([A-Za-z][A-Za-z0-9+.-]*:\/\/)([^\s/@:]+):([^\s/@]+)@/gu, "$1[redacted]@")
    .replace(
      /\b(?:token|password|secret|credential|authorization|api[-_]?key)\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/giu,
      "[redacted]",
    )
    .replace(/(?:file:\/\/)?\/(?:[^\s'"?#]+\/)*[^\s'"?#]*/gu, "[path]")
    .replace(/[A-Za-z]:\\(?:[^\s'"?#]+\\)*[^\s'"?#]*/gu, "[path]");
}

/**
 * Keep failure diagnostics useful without letting anonymous-run paths or
 * credentials escape into durable machine evidence.
 */
export function sanitizeCommandTail(value, { maximumBytes = maximumSanitizedCommandTailBytes } = {}) {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1)
    throw new Error("Command-tail evidence limit must be a positive safe integer.");
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8");
  if (bytes.length < maximumBytes) return utf8Tail(sanitizeCommandOutput(bytes.toString("utf8")), maximumBytes);

  // The caller retains a bounded tail. Its first line can begin halfway
  // through a secret, URL, or path, so it is unsafe to redact it by pattern.
  const firstCompleteLine = bytes.indexOf(0x0a);
  if (firstCompleteLine < 0 || maximumBytes <= Buffer.byteLength(truncatedCommandOutputMarker))
    return utf8Tail(truncatedCommandOutputMarker, maximumBytes);
  const sanitized = sanitizeCommandOutput(bytes.subarray(firstCompleteLine + 1).toString("utf8"));
  const remainingBytes = maximumBytes - Buffer.byteLength(truncatedCommandOutputMarker);
  return `${truncatedCommandOutputMarker}${utf8Tail(sanitized, remainingBytes)}`;
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
