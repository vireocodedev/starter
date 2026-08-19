import { readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const allowlistPath = resolve(repoRoot, "packages/ui/architecture.allowlist.json");

function fail(message) {
  throw new Error(`Invalid UI architecture allowlist: ${message}`);
}

export function readArchitectureAllowlist(path = allowlistPath) {
  let parsed;

  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`cannot read ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail("the root value must be an object");
  }

  if (parsed.version !== 1) {
    fail('"version" must be 1');
  }

  if (!Array.isArray(parsed.exceptions)) {
    fail('"exceptions" must be an array');
  }

  const seen = new Set();

  for (const [index, exception] of parsed.exceptions.entries()) {
    if (!exception || typeof exception !== "object" || Array.isArray(exception)) {
      fail(`exceptions[${index}] must be an object`);
    }

    const keys = Object.keys(exception).sort();
    const expectedKeys = ["path", "reason", "rule"];

    if (keys.length !== expectedKeys.length || keys.some((key, keyIndex) => key !== expectedKeys[keyIndex])) {
      fail(`exceptions[${index}] must contain exactly: ${expectedKeys.join(", ")}`);
    }

    for (const key of expectedKeys) {
      if (typeof exception[key] !== "string" || exception[key].trim() === "") {
        fail(`exceptions[${index}].${key} must be a non-empty string`);
      }
    }

    if (isAbsolute(exception.path) || exception.path.split(/[\\/]/u).includes("..")) {
      fail(`exceptions[${index}].path must be relative to packages/ui/src`);
    }

    if (exception.path.includes("\\")) {
      fail(`exceptions[${index}].path must use forward slashes`);
    }

    const key = `${exception.rule}\0${exception.path}`;

    if (seen.has(key)) {
      fail(`duplicate exception for rule "${exception.rule}" and path "${exception.path}"`);
    }

    seen.add(key);
  }

  return parsed;
}

function main() {
  const allowlist = readArchitectureAllowlist();
  const count = allowlist.exceptions.length;
  console.log(`UI architecture allowlist is valid (${count} exception${count === 1 ? "" : "s"}).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
