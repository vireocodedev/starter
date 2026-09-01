import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const obsoleteCoordinates = ["@vireocodedev/starter-ui"];
const absoluteLocalPath = /(?:^|[\s"'`])(?:\/(?:home|Users|tmp)\/|[A-Za-z]:[\\/])/u;

function walkSkills(directory) {
  if (!existsSync(directory)) return [];
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walkSkills(path));
    else if (entry.isFile() && entry.name === "SKILL.md") result.push(path);
  }
  return result;
}

function frontmatter(contents) {
  return contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/u)?.[1];
}

function yamlString(contents, key) {
  const value = contents.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, "mu"))?.[1]?.trim();
  return value?.match(/^"(.*)"$/u)?.[1];
}

function localMarkdownLinks(contents) {
  return [...contents.matchAll(/\[[^\]]*\]\(([^)]+)\)/gu)].map(match => match[1].trim().replace(/^<|>$/gu, ""));
}

function hasRoutingBoundary(description) {
  return /\buse for\b/iu.test(description) && /\bnot\b/iu.test(description);
}

function validateSkill(path, names, problems) {
  const contents = readFileSync(path, "utf8");
  const header = frontmatter(contents);
  if (!header) {
    problems.push(`${path}: missing YAML frontmatter`);
    return;
  }
  const name = header.match(/^name:\s*([a-z0-9-]+)\s*$/mu)?.[1];
  const description = header.match(/^description:\s*(\S[\s\S]*)$/mu)?.[1]?.trim();
  if (!name) problems.push(`${path}: frontmatter name must use lowercase letters, digits, and hyphens`);
  else if (names.has(name)) problems.push(`${path}: duplicate skill name ${name} (also ${names.get(name)})`);
  else names.set(name, path);
  if (!description) problems.push(`${path}: missing frontmatter description`);
  else if (!hasRoutingBoundary(description))
    problems.push(`${path}: description must state both a positive use case and a non-trigger boundary`);

  const metadata = join(dirname(path), "agents", "openai.yaml");
  if (!existsSync(metadata)) problems.push(`${path}: missing agents/openai.yaml`);
  else {
    const yaml = readFileSync(metadata, "utf8");
    for (const key of ["display_name", "short_description", "default_prompt"]) {
      if (!yamlString(yaml, key)) problems.push(`${metadata}: ${key} must be a quoted interface string`);
    }
    if (name && !yamlString(yaml, "default_prompt")?.includes(`$${name}`))
      problems.push(`${metadata}: default_prompt must mention $${name}`);
  }

  for (const coordinate of obsoleteCoordinates) {
    if (contents.includes(coordinate)) problems.push(`${path}: obsolete package coordinate ${coordinate}`);
  }
  if (absoluteLocalPath.test(contents)) problems.push(`${path}: must not contain an absolute local path`);

  for (const target of localMarkdownLinks(contents)) {
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/iu.test(target)) continue;
    const localTarget = target.split(/[?#]/u, 1)[0];
    if (!localTarget) continue;
    const resolved = resolve(dirname(path), localTarget);
    if (!existsSync(resolved)) problems.push(`${path}: relative link ${target} does not resolve`);
  }
}

export function validateCodexCustomization(root = process.cwd(), skillRoots = [join(root, ".agents", "skills")]) {
  const problems = [];
  const names = new Map();
  for (const skillRoot of skillRoots) {
    for (const path of walkSkills(skillRoot)) validateSkill(path, names, problems);
  }
  return problems;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const root = resolve(process.cwd());
  const problems = validateCodexCustomization(root);
  if (problems.length > 0) {
    console.error("Codex customization policy failed:");
    for (const problem of problems) console.error(`- ${problem}`);
    process.exitCode = 1;
  } else console.log("Codex customization policy passed.");
}
