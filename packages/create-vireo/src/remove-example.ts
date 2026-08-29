import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { format, resolveConfig } from "prettier";

const MANIFEST_PATH = ".vireo/example-manifest.json";
const RECEIPT_PATH = ".vireo/remove-example.json";
const SAMPLE_REFERENCE =
  /features\/item|pages\/items|\/items\b|\bItems?(?:[A-Z]\w*)?\b|\bITEMS?\b|app[/.]item|create_item/;

type ProjectMetadata = {
  schemaVersion: number;
  profile: "frontend" | "full-stack";
  projectName: string;
  javaPackage?: string;
  templateCommit: string;
};

type ExampleManifest = {
  schemaVersion: 1;
  templateCommit: string;
  files: Record<string, string>;
};

export type RemoveExampleFile = { path: string; status: "delete" | "update" | "create" };
export type RemoveExampleResult = {
  projectDirectory: string;
  state: "present" | "removed";
  dryRun: boolean;
  files: RemoveExampleFile[];
};

const ALWAYS_OWNED = new Set([
  "README.md",
  "frontend/src/app/ui/localization/resources/app.hr.ts",
  "frontend/src/@types/i18next.d.ts",
  "frontend/src/app/shell/layout/AppShellLayout.tsx",
  "frontend/src/pages/home/localization/resources/home.hr.ts",
  "scripts/verify-database-recovery.sh",
  "scripts/verify.sh",
  "frontend/tests/unit/app-pages.test.ts",
]);

function digest(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function projectFile(root: string, path: string) {
  const absolute = resolve(root, path);
  if (isAbsolute(path) || path === ".." || path.startsWith("../") || !absolute.startsWith(`${root}${sep}`))
    throw new Error(`Unsafe example ownership path: ${path}`);
  return absolute;
}

async function filesBelow(directory: string): Promise<string[]> {
  const found: string[] = [];
  async function visit(current: string) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if ([".git", "node_modules", "build", "dist", "storybook-static", "test-results"].includes(entry.name)) continue;
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) found.push(relative(directory, absolute).replaceAll("\\", "/"));
    }
  }
  await visit(directory);
  return found.sort();
}

function templatePath(profile: ProjectMetadata["profile"], path: string) {
  return profile === "frontend" ? path.replace(/^frontend\//, "") : path;
}

function isOwnedSamplePath(path: string, content: string, profile: ProjectMetadata["profile"]) {
  const normalized = profile === "frontend" ? `frontend/${path}` : path;
  return (
    ALWAYS_OWNED.has(normalized) ||
    normalized.startsWith("frontend/src/features/item/") ||
    normalized.startsWith("frontend/src/pages/items/") ||
    normalized.startsWith("frontend/src/pages/home/") ||
    normalized === "src/main/resources/db/migration/V1__create_item.sql" ||
    SAMPLE_REFERENCE.test(content)
  );
}

export async function writeExampleManifest(
  projectDirectory: string,
  templateCommit: string,
  profile: ProjectMetadata["profile"],
) {
  const files: Record<string, string> = {};
  for (const path of await filesBelow(projectDirectory)) {
    if (path === MANIFEST_PATH) continue;
    const value = await readFile(join(projectDirectory, path));
    if (value.includes(0)) continue;
    const content = value.toString("utf8");
    if (isOwnedSamplePath(path, content, profile)) files[path] = digest(value);
  }
  const manifest: ExampleManifest = { schemaVersion: 1, templateCommit, files };
  await mkdir(join(projectDirectory, ".vireo"), { recursive: true });
  await writeFile(join(projectDirectory, MANIFEST_PATH), `${JSON.stringify(manifest, null, 2)}\n`);
}

function withoutLines(content: string, patterns: RegExp[]) {
  return `${content
    .split("\n")
    .filter(line => !patterns.some(pattern => pattern.test(line)))
    .join("\n")
    .replace(/\n{4,}/g, "\n\n\n")}`;
}

function removeObjectBlock(content: string, key: string) {
  const start = content.indexOf(`  ${key}: lazyPage({`);
  if (start < 0) throw new Error(`Expected ${key} route registration was not found.`);
  const end = content.indexOf("  }),", start);
  if (end < 0) throw new Error(`Expected ${key} route registration is incomplete.`);
  return `${content.slice(0, start)}${content.slice(end + 6)}`;
}

function rewrite(path: string, content: string, metadata: ProjectMetadata): string | undefined {
  const canonical = metadata.profile === "frontend" ? `frontend/${path}` : path;
  if (canonical === "README.md") {
    return content.replace(/\bItems\b/g, "example records").replace(/\bItem\b/g, "example domain");
  }
  if (canonical.endsWith("/app/app.pages.ts")) {
    return removeObjectBlock(content.replace('"OVERVIEW" | "ITEMS" | "SETTINGS"', '"OVERVIEW" | "SETTINGS"'), "items");
  }
  if (canonical.endsWith("/app/app.localization.ts")) {
    return withoutLines(content, [
      /itemEn/,
      /itemHr/,
      /itemsEn/,
      /itemsHr/,
      /ITEM_TRANSLATION_NAMESPACE/,
      /ITEMS_TRANSLATION_NAMESPACE/,
      /ItemTranslationResources/,
      /ItemsTranslationResources/,
      /^\s+item:/,
      /^\s+items:/,
    ]);
  }
  if (canonical.endsWith("/src/@types/i18next.d.ts")) {
    return withoutLines(content, [/ItemTranslationResources/, /ItemsTranslationResources/, /^\s+item:/, /^\s+items:/]);
  }
  if (canonical.endsWith("/app/adapters/app.adapters.ts")) {
    return withoutLines(content, [/features\/item/, /^\s+items:/, /adapters\.items/]);
  }
  if (canonical.endsWith("/app/adapters/public.ts")) return withoutLines(content, [/features\/item/]);
  if (canonical.endsWith("/app/data/query/models/AppQueryEntityKey.ts")) {
    return content
      .replace('z.enum(["ITEM", "SAVED_FILTER"])', 'z.enum(["SAVED_FILTER"])')
      .replace('  item: "ITEM",\n', "");
  }
  if (canonical.endsWith("/app/shell/layout/AppShellLayout.tsx")) {
    return withoutLines(content, [/\bInventory2Outlined\b/, /^\s+ITEMS:/]);
  }
  if (
    canonical.endsWith("/app/ui/localization/resources/app.en.ts") ||
    canonical.endsWith("/app/ui/localization/resources/app.hr.ts")
  ) {
    return withoutLines(content, [/^\s+ITEMS:/]);
  }
  if (canonical.endsWith("/app/adapters/mock/app.mock-adapters.ts")) {
    return `import type { QueryEngineApi } from "@vireocodedev/query";\nimport type { HistoryEntityKind, HistoryRecord, HistorySnapshot, HistoryTimestamp } from "@vireocodedev/history";\nimport type { z } from "zod";\nimport { configureAppAdapters, type AppAdapters } from "../app.adapters";\nimport type { AppAuthApi } from "@/app/data/network/api/app-auth.api";\nimport type { AuthUser } from "@/app/data/network/models/AuthUser";\nimport type { HistoryApi } from "@/features/history/public";\n\nclass MockAuthApi implements AppAuthApi {\n  private user: AuthUser | null = null;\n  async login(username: string, password: string) {\n    if (username !== "demo" || password !== "demo123") throw new Error("Use demo / demo123 in mock mode.");\n    this.user = { username, role: "SUPERADMIN" };\n    return { username, message: "Authenticated by the frontend mock adapter." };\n  }\n  async logout() { this.user = null; }\n  async me() { if (!this.user) throw new Error("No mock session."); return this.user; }\n}\nclass MockHistoryApi implements HistoryApi {\n  async find<TSnapshot extends HistorySnapshot, TEntityKind extends HistoryEntityKind, TTimestamp extends HistoryTimestamp>(\n    _schema: z.ZodType<HistoryRecord<TSnapshot, TEntityKind, TTimestamp>>, _entity: TEntityKind, _entityId: string | number, _signal?: AbortSignal,\n  ): Promise<HistoryRecord<TSnapshot, TEntityKind, TTimestamp>[]> { return []; }\n}\nclass MockQueryEngineApi implements QueryEngineApi {\n  async listEntities() { return []; }\n  async describeEntity(entityKey: string) { return { key: entityKey, title: entityKey, fields: [] }; }\n  async listRelationOptions() { return []; }\n}\nexport function createMockAppAdapters(): AppAdapters {\n  return { auth: new MockAuthApi(), history: new MockHistoryApi(), query: new MockQueryEngineApi() };\n}\nexport function installMockAppAdapters(): void { configureAppAdapters(createMockAppAdapters()); }\n`;
  }
  if (canonical.endsWith("/pages/home/AppPageHome.tsx")) {
    return `import { AppPageHomeView } from "./AppPageHomeView";\nexport function AppPageHome() { return <AppPageHomeView />; }\n`;
  }
  if (canonical.endsWith("/pages/home/AppPageHomeView.tsx")) {
    return `import { Box, Typography } from "@mui/material";\nimport { useTranslation } from "react-i18next";\nimport { HOME_TRANSLATION_NAMESPACE } from "@/app/app.localization";\nimport { AppPageHeader } from "@/app/shell/layout/AppPageHeader";\nimport { AppPageLayout } from "@/app/shell/layout/AppPageLayout";\nexport function AppPageHomeView(_props: { loading?: boolean } = {}) {\n  const { t } = useTranslation(HOME_TRANSLATION_NAMESPACE);\n  return <AppPageLayout header={<AppPageHeader description={t("header.description")} title={t("header.title")} />}><Box sx={{ maxWidth: 760, mx: "auto", py: 4 }}><Typography component="h2" variant="h4">{t("title")}</Typography><Typography color="text.secondary" sx={{ mt: 2 }}>{t("introduction")}</Typography></Box></AppPageLayout>;\n}\n`;
  }
  if (canonical.endsWith("/pages/home/localization/resources/home.en.ts")) {
    return `const en = { header: { title: "Overview", description: "Your application starting point." }, title: "Build your first capability.", introduction: "Generate a capability or connect your own application adapters, then replace this page with your product experience." } as const;\nexport default en;\n`;
  }
  if (canonical.endsWith("/pages/home/localization/resources/home.hr.ts")) {
    return `import type { WidenLeaves } from "@vireocodedev/localization";\nimport type en from "./home.en";\nconst hr = { header: { title: "Pregled", description: "Početna točka vaše aplikacije." }, title: "Izradite prvu mogućnost.", introduction: "Generirajte mogućnost ili povežite vlastite aplikacijske adaptere, a zatim zamijenite ovu stranicu iskustvom svojeg proizvoda." } satisfies WidenLeaves<typeof en>;\nexport default hr;\n`;
  }
  if (canonical.endsWith("/pages/home/storybook/AppPageHome.stories.tsx")) {
    return `import type { Meta, StoryObj } from "@storybook/react-vite";\nimport { AppPageHomeView } from "../AppPageHomeView";\nconst meta = { title: "PAGES/Overview", component: AppPageHomeView } satisfies Meta<typeof AppPageHomeView>;\nexport default meta;\ntype Story = StoryObj<typeof meta>;\nexport const Default: Story = {};\n`;
  }
  if (canonical === "scripts/verify-database-recovery.sh") {
    return content
      .replace(/\ndocker exec "\$source_container" psql[\s\S]*?FALSE\);" >\/dev\/null\n\n/u, "\n")
      .replace(/^source_item_count=.*\n/mu, "")
      .replace(/^target_item_count=.*\n/mu, "")
      .replace(/^target_marker_count=.*\n/mu, "")
      .replace(
        /if \[\[ "\$source_item_count" != "\$target_item_count" \|\| "\$source_user_count" != "\$target_user_count" \|\| "\$source_migration_count" != "\$target_migration_count" \|\| "\$target_marker_count" != 1 \]\]; then/u,
        'if [[ "$source_user_count" != "$target_user_count" || "$source_migration_count" != "$target_migration_count" ]]; then',
      )
      .replace(
        /printf 'Database recovery rehearsal passed:[\s\S]*?"\$target_item_count" "\$target_user_count" "\$target_migration_count"/u,
        `printf 'Database recovery rehearsal passed: PostgreSQL 17 backup restored on PostgreSQL 18, %s users, %s migrations, and production readiness verified.\\n' \\\n+  "$target_user_count" "$target_migration_count"`,
      );
  }
  if (canonical === "scripts/verify.sh") return withoutLines(content, [/flagship-demo/, /flagship-proof/]);
  if (canonical.endsWith(".md")) return withoutLines(content, [SAMPLE_REFERENCE]);
  if (canonical.endsWith("/app/query/AppQueryEntityKey.java")) return content.replace("    ITEM,\n", "");
  if (canonical.endsWith("/app/query/AppQueryEntityTypeResolver.java")) {
    return withoutLines(content, [/app\.item\.Item/, /AppQueryEntityKey\.ITEM/]);
  }
  if (canonical.endsWith("/config/DevBootstrapConfig.java")) {
    const packageName = metadata.javaPackage;
    if (!packageName) throw new Error("Full-stack metadata is missing javaPackage.");
    return `package ${packageName}.config;\n\nimport org.springframework.boot.ApplicationRunner;\nimport org.springframework.context.annotation.Bean;\nimport org.springframework.context.annotation.Configuration;\nimport org.springframework.context.annotation.Profile;\nimport org.springframework.security.crypto.password.PasswordEncoder;\nimport com.vireocode.vireo.auth.StarterUser;\nimport com.vireocode.vireo.auth.StarterUserRepository;\nimport ${packageName}.app.auth.AppUserRole;\n\n@Configuration\n@Profile("dev")\npublic class DevBootstrapConfig {\n    @Bean\n    ApplicationRunner seedDevelopmentData(StarterUserRepository users, PasswordEncoder passwordEncoder) {\n        return args -> {\n            createUser(users, passwordEncoder, "demo", "demo123", AppUserRole.USER);\n            createUser(users, passwordEncoder, "admin", "admin123", AppUserRole.SUPERADMIN);\n        };\n    }\n    static void createUser(StarterUserRepository users, PasswordEncoder encoder, String username, String password, AppUserRole role) {\n        if (users.existsByUsername(username)) return;\n        StarterUser user = new StarterUser();\n        user.setUsername(username);\n        user.setPasswordHash(encoder.encode(password));\n        user.setRole(role.name());\n        user.setEnabled(true);\n        users.save(user);\n    }\n}\n`;
  }
  if (canonical.endsWith("/config/DemoBootstrapConfig.java")) {
    const packageName = metadata.javaPackage;
    if (!packageName) throw new Error("Full-stack metadata is missing javaPackage.");
    return `package ${packageName}.config;\n\nimport org.springframework.boot.ApplicationRunner;\nimport org.springframework.context.annotation.Bean;\nimport org.springframework.context.annotation.Configuration;\nimport org.springframework.context.annotation.Profile;\nimport org.springframework.security.crypto.password.PasswordEncoder;\nimport com.vireocode.vireo.auth.StarterUserRepository;\nimport ${packageName}.app.auth.AppUserRole;\n\n@Configuration\n@Profile("demo")\npublic class DemoBootstrapConfig {\n    @Bean\n    ApplicationRunner seedPublicDemoData(StarterUserRepository users, PasswordEncoder passwordEncoder) {\n        return args -> DevBootstrapConfig.createUser(users, passwordEncoder, "demo", "demo123", AppUserRole.USER);\n    }\n}\n`;
  }
  return undefined;
}

export async function findExampleReferences(projectDirectory: string) {
  const references: string[] = [];
  for (const path of await filesBelow(projectDirectory)) {
    if (path.startsWith(".vireo/") || path === "package-lock.json") continue;
    const value = await readFile(join(projectDirectory, path));
    if (
      !value.includes(0) &&
      (SAMPLE_REFERENCE.test(value.toString("utf8")) || /(^|\/)item(?:s)?(?:\.|\/|$)/i.test(path))
    )
      references.push(path);
  }
  return references;
}

export async function removeExample(projectDirectory: string, apply = false): Promise<RemoveExampleResult> {
  const root = resolve(projectDirectory);
  const metadata = JSON.parse(await readFile(join(root, ".vireo/project.json"), "utf8")) as ProjectMetadata;
  try {
    await readFile(join(root, RECEIPT_PATH));
    const residual = await findExampleReferences(root);
    if (residual.length)
      throw new Error(`Removal receipt conflicts with residual example references:\n${residual.join("\n")}`);
    return { projectDirectory: root, state: "removed", dryRun: !apply, files: [] };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const manifest = JSON.parse(await readFile(join(root, MANIFEST_PATH), "utf8")) as ExampleManifest;
  if (
    metadata.schemaVersion !== 1 ||
    manifest.schemaVersion !== 1 ||
    manifest.templateCommit !== metadata.templateCommit
  ) {
    throw new Error("The example ownership manifest does not match this generated project.");
  }
  const unknownReferences = (await findExampleReferences(root)).filter(path => !(path in manifest.files));
  if (unknownReferences.length)
    throw new Error(`Refusing to remove customized/unowned example references:\n${unknownReferences.join("\n")}`);
  const plans: Array<RemoveExampleFile & { content?: string }> = [];
  for (const [path, expected] of Object.entries(manifest.files)) {
    const absolute = projectFile(root, path);
    const content = await readFile(absolute);
    if (digest(content) !== expected) throw new Error(`Refusing to overwrite customized example file: ${path}`);
    const updated = rewrite(path, content.toString("utf8"), metadata);
    const lintSafe =
      updated !== undefined && (path.endsWith("app.mock-adapters.ts") || path.endsWith("AppPageHomeView.tsx"))
        ? `/* eslint-disable @typescript-eslint/no-unused-vars */\n${updated}`
        : updated;
    const formatted =
      lintSafe !== undefined && /\.(?:md|ts|tsx)$/u.test(path)
        ? await format(lintSafe, { ...(await resolveConfig(absolute)), filepath: absolute })
        : lintSafe;
    plans.push(formatted === undefined ? { path, status: "delete" } : { path, status: "update", content: formatted });
  }
  const unsafePlans = plans.filter(
    plan =>
      plan.status === "update" &&
      (SAMPLE_REFERENCE.test(plan.content ?? "") || /(^|\/)item(?:s)?(?:\.|\/|$)/i.test(plan.path)),
  );
  if (unsafePlans.length)
    throw new Error(`Removal recipe requires an update for:\n${unsafePlans.map(plan => plan.path).join("\n")}`);
  plans.push({
    path: RECEIPT_PATH,
    status: "create",
    content: `${JSON.stringify({ schemaVersion: 1, templateCommit: metadata.templateCommit, removed: true }, null, 2)}\n`,
  });
  if (apply) {
    for (const plan of plans) {
      const absolute = projectFile(root, plan.path);
      if (plan.status === "delete") await rm(absolute);
      else {
        await mkdir(dirname(absolute), { recursive: true });
        await writeFile(absolute, plan.content ?? "");
      }
    }
    await rm(join(root, MANIFEST_PATH));
    for (const path of [
      templatePath(metadata.profile, "frontend/src/features/item"),
      templatePath(metadata.profile, "frontend/src/pages/items"),
      ...(metadata.profile === "full-stack" && metadata.javaPackage
        ? [
            `src/main/java/${metadata.javaPackage.replaceAll(".", "/")}/app/item`,
            `src/test/java/${metadata.javaPackage.replaceAll(".", "/")}/app/item`,
          ]
        : []),
    ])
      await rm(join(root, path), { recursive: true, force: true });
    const residual = await findExampleReferences(root);
    if (residual.length) throw new Error(`Transformation left residual example references:\n${residual.join("\n")}`);
  }
  return {
    projectDirectory: root,
    state: "present",
    dryRun: !apply,
    files: plans.map(({ path, status }) => ({ path, status })),
  };
}
