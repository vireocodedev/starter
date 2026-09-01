import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateCodexCustomization } from "./codex-customization-policy.mjs";

async function writeSkill(root, name, body = "", description = "Use for a focused test; not unrelated work.") {
  const skill = join(root, ".agents", "skills", name);
  await mkdir(join(skill, "agents"), { recursive: true });
  await writeFile(join(skill, "SKILL.md"), `---\nname: ${name}\ndescription: ${description}\n---\n${body}`);
  await writeFile(
    join(skill, "agents", "openai.yaml"),
    `interface:\n  display_name: "Test Skill"\n  short_description: "A concise test skill description"\n  default_prompt: "Use $${name} for a focused test."\n`,
  );
}

test("accepts complete unique skills with resolvable local links", async () => {
  const root = await mkdtemp(join(tmpdir(), "vireo-codex-policy-"));
  try {
    await writeSkill(root, "first-skill", "Read [guide](../../../guide.md).\n");
    await writeFile(join(root, "guide.md"), "# Guide\n");
    await writeSkill(root, "second-skill");
    assert.deepEqual(validateCodexCustomization(root), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("requires descriptions to discriminate triggers from non-triggers", async () => {
  const root = await mkdtemp(join(tmpdir(), "vireo-codex-policy-"));
  try {
    await writeSkill(root, "vague-skill", "", "A generic helper.");
    assert.match(
      validateCodexCustomization(root).join("\n"),
      /description must state both a positive use case and a non-trigger boundary/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects duplicate names, stale coordinates, missing metadata, and bad links", async () => {
  const root = await mkdtemp(join(tmpdir(), "vireo-codex-policy-"));
  try {
    await writeSkill(root, "first-skill", "Uses @vireocodedev/starter-ui and [missing](missing.md).\n");
    const duplicate = join(root, ".agents", "skills", "duplicate-skill");
    await mkdir(duplicate, { recursive: true });
    await writeFile(
      join(duplicate, "SKILL.md"),
      "---\nname: first-skill\ndescription: Duplicate.\n---\nSee /home/example.\n",
    );
    const problems = validateCodexCustomization(root).join("\n");
    assert.match(problems, /duplicate skill name first-skill/u);
    assert.match(problems, /obsolete package coordinate/u);
    assert.match(problems, /relative link missing\.md does not resolve/u);
    assert.match(problems, /must not contain an absolute local path/u);
    assert.match(problems, /missing agents\/openai\.yaml/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
