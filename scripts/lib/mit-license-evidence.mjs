import { createHash } from "node:crypto";

const mitTitle = /^\uFEFF?\s*MIT License\s*$/mu;
const mitGrant =
  /Permission\s+is\s+hereby\s+granted,\s+free\s+of\s+charge,\s+to\s+any\s+person\s+obtaining\s+a\s+copy/iu;
const mitWarranty = /THE\s+SOFTWARE\s+IS\s+PROVIDED\s+"AS\s+IS"/iu;
const mitLiability =
  /IN\s+NO\s+EVENT\s+SHALL\s+THE\s+AUTHORS\s+OR\s+COPYRIGHT\s+HOLDERS\s+BE\s+LIABLE\s+FOR\s+ANY\s+CLAIM,\s+DAMAGES\s+OR\s+OTHER\s+LIABILITY/iu;

/**
 * Proves that a packed first-party license contains the material terms of the
 * canonical MIT text, then returns a byte-level evidence record.  A package's
 * SPDX field is metadata; it cannot substitute for the distributed license.
 */
export function verifyCanonicalMitLicense(content, source = "license") {
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content ?? "", "utf8");
  const text = bytes.toString("utf8");
  const missing = [];
  if (!mitTitle.test(text)) missing.push("MIT License title");
  if (!mitGrant.test(text)) missing.push("MIT grant clause");
  if (!mitWarranty.test(text)) missing.push("MIT warranty disclaimer");
  if (!mitLiability.test(text)) missing.push("MIT liability clause");
  if (missing.length > 0) throw new Error(`${source} is not canonical MIT content; missing ${missing.join(", ")}.`);

  return {
    licenseContentVerified: true,
    licenseSha256: createHash("sha256").update(bytes).digest("hex"),
  };
}
