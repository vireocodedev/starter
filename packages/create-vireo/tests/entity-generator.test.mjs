import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  checkGeneratedEntities,
  ejectEntity,
  EntitySchemaError,
  generateEntity,
  parseEntitySchema,
} from "../dist/index.js";

function schema(overrides = {}) {
  return {
    schemaVersion: 1,
    kind: "entity",
    entity: { name: "APIClient", plural: "api-clients", description: "Acronym fixture" },
    database: { table: "api_client", migrationVersion: 3 },
    api: { path: "/api/api-clients" },
    permissions: { read: "hasRole('USER')", manage: "hasRole('SUPERADMIN')" },
    capabilities: { history: true, offline: false, query: true },
    fields: [
      {
        name: "displayName",
        type: "string",
        required: true,
        constraints: { min: 2, max: 120 },
        query: { filterable: true, searchable: true, sortable: true },
      },
      {
        name: "creditLimit",
        type: "decimal",
        required: true,
        constraints: { min: 0 },
        query: { filterable: true },
      },
      {
        name: "status",
        type: "enum",
        required: true,
        enumValues: ["NEW", "ACTIVE"],
        query: { filterable: true },
      },
      { name: "reviewedAt", type: "timestamp", query: { filterable: true } },
    ],
    localization: {
      en: { singular: "API client", plural: "API clients" },
      hr: { singular: "API klijent", plural: "API klijenti" },
    },
    ...overrides,
  };
}

async function projectFixture() {
  const root = await mkdtemp(join(tmpdir(), "vireo-entity-generator-"));
  await mkdir(join(root, ".vireo"), { recursive: true });
  await writeFile(
    join(root, ".vireo/project.json"),
    JSON.stringify({
      schemaVersion: 1,
      projectName: "fixture",
      javaPackage: "dev.example.fixture",
      database: "h2",
      packageManager: "npm",
    }),
  );
  const schemaPath = join(root, "api-client.entity.json");
  await writeFile(schemaPath, JSON.stringify(schema()));
  return { root, schemaPath };
}

async function frontendProjectFixture() {
  const root = await mkdtemp(join(tmpdir(), "vireo-frontend-entity-generator-"));
  await mkdir(join(root, ".vireo"), { recursive: true });
  await writeFile(
    join(root, ".vireo/project.json"),
    JSON.stringify({ schemaVersion: 1, profile: "frontend", projectName: "frontend-fixture", packageManager: "npm" }),
  );
  const schemaPath = join(root, "api-client.entity.json");
  await writeFile(schemaPath, JSON.stringify(schema()));
  return { root, schemaPath };
}

test("validates acronyms and explicit irregular plural names without inferring them", () => {
  const parsed = parseEntitySchema(schema());
  assert.equal(parsed.entity.name, "APIClient");
  assert.equal(parsed.entity.plural, "api-clients");
});

test("rejects reserved, Unicode, relationship, compound-id, and offline shapes explicitly in schema v1", () => {
  for (const value of [
    schema({ entity: { name: "Član", plural: "clanovi" } }),
    schema({ fields: [{ name: "class", type: "string", required: true, query: { searchable: true } }] }),
    schema({ relationships: [{ name: "owner", kind: "many-to-one", target: "User", displayField: "name" }] }),
    schema({ capabilities: { history: true, offline: true, query: true } }),
    { ...schema(), id: { fields: ["tenantId", "number"] } },
  ]) {
    assert.throws(() => parseEntitySchema(value), EntitySchemaError);
  }
});

test("rejects reserved, colliding, and oversized derived SQL identifiers", () => {
  assert.throws(
    () => parseEntitySchema(schema({ database: { table: "user", migrationVersion: 3 } })),
    /reserved H2\/PostgreSQL word user/u,
  );

  const reservedField = schema();
  reservedField.fields[0] = { ...reservedField.fields[0], name: "order" };
  assert.throws(() => parseEntitySchema(reservedField), /reserved H2\/PostgreSQL word order/u);

  const auditCollision = schema();
  auditCollision.fields[0] = { ...auditCollision.fields[0], name: "createdAt" };
  assert.throws(() => parseEntitySchema(auditCollision), /conflicts with the generated created_at audit column/u);

  const conversionCollision = schema();
  conversionCollision.fields = [
    { ...conversionCollision.fields[0], name: "apiClient" },
    { ...conversionCollision.fields[0], name: "apiCLIENT" },
  ];
  assert.throws(() => parseEntitySchema(conversionCollision), /remain unique after lower_snake_case/u);

  assert.throws(
    () =>
      parseEntitySchema(
        schema({
          database: { table: `orders_${"x".repeat(48)}`, migrationVersion: 3 },
        }),
      ),
    /name-derived index exceeds the portable 63-character/u,
  );
});

test("rejects nested field values that disagree with their declared type", () => {
  const invalid = schema();
  invalid.fields[0] = {
    ...invalid.fields[0],
    default: false,
    constraints: { ...invalid.fields[0].constraints, unexpected: 1 },
    query: { ...invalid.fields[0].query, searchable: "yes", unexpected: true },
    ui: { control: "bogus", list: "yes", label: false, unexpected: true },
  };
  invalid.fields[1] = {
    ...invalid.fields[1],
    constraints: { ...invalid.fields[1].constraints, pattern: "^[0-9]+$" },
  };

  assert.throws(
    () => parseEntitySchema(invalid),
    error => {
      assert.ok(error instanceof EntitySchemaError);
      assert.match(error.message, /fields\[0\]\.default must be a string/u);
      assert.match(error.message, /fields\[0\]\.constraints\.unexpected is not supported/u);
      assert.match(error.message, /fields\[0\]\.query\.searchable must be a boolean/u);
      assert.match(error.message, /fields\[0\]\.query\.unexpected is not supported/u);
      assert.match(error.message, /fields\[0\]\.ui\.control is incompatible/u);
      assert.match(error.message, /fields\[0\]\.ui\.list must be a boolean/u);
      assert.match(error.message, /fields\[0\]\.ui\.label must be a string/u);
      assert.match(error.message, /fields\[0\]\.ui\.unexpected is not supported/u);
      assert.match(error.message, /fields\[1\]\.constraints\.pattern is valid only/u);
      return true;
    },
  );
});

test("requires constraint-valid examples for patterned fields", () => {
  const missingExample = schema();
  missingExample.fields[0] = {
    ...missingExample.fields[0],
    constraints: { min: 3, max: 6, pattern: "^PO-[0-9]{3}$" },
  };
  assert.throws(() => parseEntitySchema(missingExample), /example is required/u);

  const invalidExample = structuredClone(missingExample);
  invalidExample.fields[0].example = "EXAMPLE";
  assert.throws(() => parseEntitySchema(invalidExample), /example does not match constraints\.pattern/u);

  const validExample = structuredClone(missingExample);
  validExample.fields[0].example = "PO-123";
  assert.equal(parseEntitySchema(validExample).fields[0].example, "PO-123");
});

test("collects malformed patterns without evaluating them against examples", () => {
  const invalidPattern = schema();
  invalidPattern.fields[0] = {
    ...invalidPattern.fields[0],
    example: "PO-123",
    constraints: { pattern: "[" },
  };
  assert.throws(() => parseEntitySchema(invalidPattern), /pattern must be a valid regular expression/u);
});

test("rejects impossible required string fixture constraints", () => {
  const impossible = schema();
  impossible.fields[0] = {
    ...impossible.fields[0],
    required: true,
    constraints: { max: 0 },
  };
  assert.throws(() => parseEntitySchema(impossible), /max must be at least 1/u);
});

test("dry run is non-writing and output mode renders a deterministic review tree", async () => {
  const { root, schemaPath } = await projectFixture();
  const dry = await generateEntity({ projectDirectory: root, schemaPath, dryRun: true });
  assert.equal(dry.dryRun, true);
  await assert.rejects(stat(join(root, "src/main/java/dev/example/fixture/app/aPIClient/APIClient.java")), /ENOENT/u);

  const output = join(root, "review");
  const first = await generateEntity({ projectDirectory: root, schemaPath, outputDirectory: output });
  const source = await readFile(join(output, "src/main/java/dev/example/fixture/app/apiclient/APIClient.java"), "utf8");
  assert.match(source, /class APIClient extends BaseEntity/u);
  const second = await generateEntity({ projectDirectory: root, schemaPath, outputDirectory: output });
  assert.ok(second.files.every(file => file.status === "unchanged"));
  assert.equal(first.schemaDigest, second.schemaDigest);
});

test("generated pages import only controls used by the schema", async () => {
  const { root, schemaPath } = await projectFixture();
  await writeFile(
    schemaPath,
    JSON.stringify(
      schema({
        fields: [
          {
            name: "displayName",
            type: "string",
            required: true,
            query: { filterable: true, searchable: true, sortable: true },
          },
        ],
      }),
    ),
  );

  await generateEntity({ projectDirectory: root, schemaPath });
  const page = await readFile(join(root, "frontend/src/generated/api-clients/pages/AppPageApiClients.tsx"), "utf8");
  assert.doesNotMatch(page, /\bCheckbox\b/u);
  assert.doesNotMatch(page, /\bFormControlLabel\b/u);
  assert.doesNotMatch(page, /\bMenuItem\b/u);
});

test("generated fixtures respect declared string length constraints", async () => {
  const { root, schemaPath } = await projectFixture();
  await writeFile(
    schemaPath,
    JSON.stringify(
      schema({
        fields: [
          {
            name: "countryCode",
            type: "string",
            required: true,
            constraints: { min: 2, max: 6 },
            query: { searchable: true },
          },
        ],
      }),
    ),
  );

  await generateEntity({ projectDirectory: root, schemaPath });
  const frontendTest = await readFile(
    join(root, "frontend/tests/contract/generated/aPIClient.wire-contract.test.ts"),
    "utf8",
  );
  assert.match(frontendTest, /countryCode: "XX"/u);
  assert.doesNotMatch(frontendTest, /EXAMPLE/u);
});

test("generation is idempotent, detects wire drift, refuses customization, and ejects without deleting code", async () => {
  const { root, schemaPath } = await projectFixture();
  const first = await generateEntity({ projectDirectory: root, schemaPath });
  assert.ok(first.files.some(file => file.status === "create"));
  const second = await generateEntity({ projectDirectory: root, schemaPath });
  assert.ok(second.files.every(file => file.status === "unchanged"));

  const model = join(root, "frontend/src/generated/api-clients/models/APIClient.ts");
  await writeFile(model, `${await readFile(model, "utf8")}\n// deliberate contract drift\n`);
  const checks = await checkGeneratedEntities(root);
  assert.equal(checks[0].ok, false);
  assert.match(checks[0].problems.join("\n"), /contract drift/u);
  await assert.rejects(generateEntity({ projectDirectory: root, schemaPath }), /VIR-GEN-005/u);

  const ejected = await ejectEntity(root, "api-clients");
  assert.ok(ejected.retainedFiles.length > 10);
  assert.match(await readFile(model, "utf8"), /@vireo-ejected/u);
  await stat(model);
  assert.deepEqual(await checkGeneratedEntities(root), []);
});

test("unmanaged collisions require both force and explicit overwrite acceptance", async () => {
  const { root, schemaPath } = await projectFixture();
  const collision = join(root, "frontend/src/generated/api-clients/models/APIClient.ts");
  await mkdir(join(root, "frontend/src/generated/api-clients/models"), { recursive: true });
  await writeFile(collision, "user-owned\n");
  await assert.rejects(generateEntity({ projectDirectory: root, schemaPath }), /VIR-GEN-003/u);
  await assert.rejects(
    generateEntity({ projectDirectory: root, schemaPath, acceptOverwrite: true }),
    /--accept-overwrite is valid only together with --force/u,
  );
  await generateEntity({ projectDirectory: root, schemaPath, force: true, acceptOverwrite: true });
  assert.match(await readFile(collision, "utf8"), /APIClientTransportSchema/u);
});

test("frontend projects generate, check, and eject only root-level TypeScript capabilities", async () => {
  const { root, schemaPath } = await frontendProjectFixture();
  const generated = await generateEntity({ projectDirectory: root, schemaPath });

  assert.equal(generated.target, "frontend");
  assert.ok(generated.files.some(file => file.path === "src/generated/api-clients/models/APIClient.ts"));
  assert.ok(generated.files.every(file => !file.path.endsWith(".java") && !file.path.includes("db/migration")));
  const api = await readFile(join(root, "src/generated/api-clients/api/aPIClient.api.ts"), "utf8");
  assert.match(api, /export interface APIClientApi/u);
  assert.match(api, /configureAPIClientApi/u);
  assert.deepEqual(await checkGeneratedEntities(root), [{ entity: "APIClient", ok: true, problems: [] }]);

  await ejectEntity(root, "api-clients");
  assert.match(await readFile(join(root, "src/generated/api-clients/models/APIClient.ts"), "utf8"), /@vireo-ejected/u);
  assert.deepEqual(await checkGeneratedEntities(root), []);
});

test("a full-stack project may explicitly generate a frontend-only capability", async () => {
  const { root, schemaPath } = await projectFixture();
  const generated = await generateEntity({ projectDirectory: root, schemaPath, target: "frontend" });
  assert.equal(generated.target, "frontend");
  assert.ok(generated.files.some(file => file.path.startsWith("frontend/src/generated/")));
  assert.ok(generated.files.every(file => !file.path.endsWith(".java") && !file.path.includes("db/migration")));
});
