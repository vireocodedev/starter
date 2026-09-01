import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, readdir, realpath, rename, rm, writeFile } from "node:fs/promises";
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
  databaseName?: string;
  templateCommit: string;
};

type ExampleManifest = {
  schemaVersion: 1;
  templateCommit: string;
  files: Record<string, string>;
};

type ManagedFileManifest = {
  schemaVersion: 1;
  templateCommit: string;
  files: Array<{ path: string; sha256: string }>;
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

// These paths either validate framework contracts or retain Vireo maintainer
// evidence. They must never become example-owned merely because their source
// happens to mention the sample Item capability.
const NON_EXAMPLE_INFRASTRUCTURE = new Set([
  "frontend/scripts/architecture-policy.test.mjs",
  "frontend/scripts/pwa-contract.mjs",
  "frontend/tests/pwa/production-pwa.spec.ts",
  "docs/provider-controls-2026-08-31.md",
  "docs/hosted-demo-recovery-rehearsal-2026-09-01.md",
  "docs/verification-trend-review-2026-09-01.md",
  "scripts/repository-security-policy.mjs",
]);

// This legacy filename is kept to preserve the deployed-production coverage,
// but its rewritten content is generic and no longer belongs to the sample.
const REWRITTEN_GENERIC_COVERAGE = new Set(["frontend/tests/deployment/item-persistence.spec.ts"]);

function digest(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function projectFile(root: string, path: string) {
  const absolute = resolve(root, path);
  if (isAbsolute(path) || path === ".." || path.startsWith("../") || !absolute.startsWith(`${root}${sep}`))
    throw new Error(`Unsafe example ownership path: ${path}`);
  return absolute;
}

function assertManagedProvenancePath(path: string) {
  if (
    !/^(?:\.vireo\/)?[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/u.test(path) ||
    path.includes("\\") ||
    path.split("/").some(segment => segment === "" || segment === "." || segment === "..")
  ) {
    throw new Error(`Managed-file provenance has an unsafe path: ${path}`);
  }
}

async function safeProjectFile(root: string, path: string) {
  const target = projectFile(root, path);
  const resolvedRoot = resolve(root);
  if ((await lstat(resolvedRoot)).isSymbolicLink()) throw new Error(`Project root contains a symbolic link: ${root}`);
  const realRoot = await realpath(resolvedRoot);
  let cursor = resolvedRoot;
  for (const segment of path.split("/")) {
    cursor = join(cursor, segment);
    try {
      if ((await lstat(cursor)).isSymbolicLink()) throw new Error(`Example path contains a symbolic link: ${path}`);
      const resolved = await realpath(cursor);
      if (resolved !== realRoot && !resolved.startsWith(`${realRoot}${sep}`)) {
        throw new Error(`Example path resolves outside the project: ${path}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return target;
      throw error;
    }
  }
  return target;
}

async function filesBelow(directory: string): Promise<string[]> {
  const found: string[] = [];
  async function visit(current: string) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if ([".git", "node_modules", "build", "dist", "storybook-static", "test-results"].includes(entry.name)) continue;
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else found.push(relative(directory, absolute).replaceAll("\\", "/"));
    }
  }
  await visit(directory);
  return found.sort();
}

function templatePath(profile: ProjectMetadata["profile"], path: string) {
  return profile === "frontend" ? path.replace(/^frontend\//, "") : path;
}

function sourceTemplatePath(profile: ProjectMetadata["profile"], path: string) {
  return profile === "frontend" ? `frontend/${templatePath(profile, path)}` : path;
}

function isNonExampleInfrastructurePath(path: string, profile: ProjectMetadata["profile"]) {
  return NON_EXAMPLE_INFRASTRUCTURE.has(sourceTemplatePath(profile, path));
}

function isRewrittenGenericCoveragePath(path: string, profile: ProjectMetadata["profile"]) {
  return REWRITTEN_GENERIC_COVERAGE.has(sourceTemplatePath(profile, path));
}

function isStructurallyOwnedSamplePath(path: string, profile: ProjectMetadata["profile"]) {
  const normalized = profile === "frontend" ? `frontend/${path}` : path;
  const migrationName = normalized.startsWith("src/main/resources/db/migration/")
    ? normalized.slice(normalized.lastIndexOf("/") + 1)
    : "";
  return (
    normalized === "frontend/src/features/item" ||
    normalized.startsWith("frontend/src/features/item/") ||
    normalized === "frontend/src/pages/items" ||
    normalized.startsWith("frontend/src/pages/items/") ||
    normalized === "frontend/src/pages/home" ||
    normalized.startsWith("frontend/src/pages/home/") ||
    /^src\/(?:main|test)\/java\/.+\/app\/item(?:\/|$)/u.test(normalized) ||
    /(?:^|_)item(?:_|\.|$)/iu.test(migrationName)
  );
}

function isOwnedSamplePath(path: string, content: string, profile: ProjectMetadata["profile"]) {
  if (isNonExampleInfrastructurePath(path, profile)) return false;
  const normalized = profile === "frontend" ? `frontend/${path}` : path;
  return ALWAYS_OWNED.has(normalized) || isStructurallyOwnedSamplePath(path, profile) || SAMPLE_REFERENCE.test(content);
}

export async function writeExampleManifest(
  projectDirectory: string,
  templateCommit: string,
  profile: ProjectMetadata["profile"],
) {
  const files: Record<string, string> = {};
  for (const path of await filesBelow(projectDirectory)) {
    if (path === MANIFEST_PATH) continue;
    const absolute = join(projectDirectory, path);
    const state = await lstat(absolute);
    if (!state.isFile()) {
      throw new Error(`Cannot create example ownership for a non-file path: ${path}`);
    }
    const value = await readFile(absolute);
    const content = value.includes(0) ? "" : value.toString("utf8");
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

function replaceGenericItemReferences(content: string) {
  return content
    .replaceAll("/items", "/workspace")
    .replace(/\bITEM\b/gu, "RECORD")
    .replace(/\bItems\b/gu, "Records")
    .replace(/\bitems\b/gu, "records")
    .replace(/\bItem\b/gu, "Record")
    .replace(/\bitem\b/gu, "record");
}

function removeObjectBlock(content: string, key: string) {
  const start = content.indexOf(`  ${key}: lazyPage({`);
  if (start < 0) throw new Error(`Expected ${key} route registration was not found.`);
  const end = content.indexOf("  }),", start);
  if (end < 0) throw new Error(`Expected ${key} route registration is incomplete.`);
  return `${content.slice(0, start)}${content.slice(end + 6)}`;
}

function genericDeploymentVerificationScript(metadata: ProjectMetadata) {
  const databaseName = metadata.databaseName;
  if (!databaseName) throw new Error("Full-stack metadata is missing databaseName.");
  return `#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

deployment_project="vireo-application-smoke-\${GITHUB_RUN_ID:-local}"
frontend_port="\${FRONTEND_PORT:-3000}"
export POSTGRES_OWNER_PASSWORD="\${POSTGRES_OWNER_PASSWORD:-deployment-owner-only}"
export POSTGRES_RUNTIME_PASSWORD="\${POSTGRES_RUNTIME_PASSWORD:-deployment-runtime-only}"
export SESSION_COOKIE_SECURE=false
export VIREO_DEPLOYMENT_SMOKE_USERNAME="\${VIREO_DEPLOYMENT_SMOKE_USERNAME:-deployment_smoke}"
export VIREO_DEPLOYMENT_SMOKE_PASSWORD="\${VIREO_DEPLOYMENT_SMOKE_PASSWORD:-deployment-smoke-\${RANDOM}-\${RANDOM}}"

if docker compose version >/dev/null 2>&1; then
  compose_command=(docker compose)
elif command -v docker-compose >/dev/null 2>&1 && docker-compose version >/dev/null 2>&1; then
  compose_command=(docker-compose)
else
  printf 'Docker Compose is required for the deployment smoke.\\n' >&2
  exit 1
fi

cleanup() {
  "\${compose_command[@]}" -f compose.yaml -f compose.smoke.yaml --project-name "$deployment_project" \\
    down --volumes --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

./gradlew bootJar --console=plain
(
  cd frontend
  corepack npm run build
)

"\${compose_command[@]}" -f compose.yaml -f compose.smoke.yaml --project-name "$deployment_project" \\
  up --build --detach --wait

index_document="$(curl --fail --silent --show-error "http://127.0.0.1:\${frontend_port}/")"
if [[ "$index_document" != *'<div id="root"></div>'* ]]; then
  printf 'Frontend deployment did not return the application shell.\\n' >&2
  exit 1
fi

response_headers="$(curl --fail --silent --show-error --head "http://127.0.0.1:\${frontend_port}/")"
for expected_header in \\
  "content-security-policy: default-src 'self'" \\
  "cross-origin-opener-policy: same-origin" \\
  "permissions-policy: camera=(), geolocation=(), microphone=()" \\
  "referrer-policy: strict-origin-when-cross-origin" \\
  "x-content-type-options: nosniff" \\
  "x-frame-options: DENY"; do
  if ! grep --ignore-case --fixed-strings --quiet "$expected_header" <<<"$response_headers"; then
    printf 'Frontend deployment is missing security header: %s\\n' "$expected_header" >&2
    exit 1
  fi
done

for pwa_asset in /sw.js /manifest.webmanifest; do
  pwa_headers="$(curl --fail --silent --show-error --head "http://127.0.0.1:\${frontend_port}\${pwa_asset}")"
  if ! grep --ignore-case --fixed-strings --quiet "cache-control: no-cache" <<<"$pwa_headers"; then
    printf 'Frontend deployment is missing no-cache PWA metadata policy for %s.\\n' "$pwa_asset" >&2
    exit 1
  fi
  if [[ "$pwa_asset" == "/manifest.webmanifest" ]] &&
    ! grep --ignore-case --fixed-strings --quiet "content-type: application/manifest+json" <<<"$pwa_headers"; then
    printf 'Frontend deployment is missing the manifest MIME type.\\n' >&2
    exit 1
  fi
done

api_status="$(curl --silent --output /dev/null --write-out '%{http_code}' "http://127.0.0.1:\${frontend_port}/api/auth/me")"
if [[ "$api_status" != "401" ]]; then
  printf 'Frontend API proxy returned HTTP %s; expected the backend authentication boundary (401).\\n' "$api_status" >&2
  exit 1
fi

if ! curl --fail --silent --show-error \\
  "http://127.0.0.1:\${frontend_port}/actuator/health/readiness" | grep --quiet '"status":"UP"'; then
  printf 'Public backend readiness did not report UP.\\n' >&2
  exit 1
fi

"\${compose_command[@]}" --project-name "$deployment_project" exec --no-TTY frontend \\
  wget --quiet --output-document=- http://app:8080/actuator/health/readiness | grep --quiet '"status":"UP"'

runtime_user="\${POSTGRES_RUNTIME_USER:-${databaseName}_runtime}"
database_name="\${POSTGRES_DB:-${databaseName}}"
runtime_privileges="$("\${compose_command[@]}" --project-name "$deployment_project" exec --no-TTY postgres \\
  psql --username "\${POSTGRES_OWNER_USER:-${databaseName}_owner}" --dbname "$database_name" --tuples-only --no-align \\
  --command "SELECT has_schema_privilege('$runtime_user', 'public', 'CREATE'), has_table_privilege('$runtime_user', 'flyway_schema_history', 'INSERT') OR has_table_privilege('$runtime_user', 'flyway_schema_history', 'UPDATE') OR has_table_privilege('$runtime_user', 'flyway_schema_history', 'DELETE') OR has_table_privilege('$runtime_user', 'flyway_schema_history', 'TRUNCATE') OR has_table_privilege('$runtime_user', 'flyway_schema_history', 'REFERENCES') OR has_table_privilege('$runtime_user', 'flyway_schema_history', 'TRIGGER');")"
if [[ "$runtime_privileges" != "f|f" ]]; then
  printf 'Runtime database privileges are unsafe: %s (expected f|f).\\n' "$runtime_privileges" >&2
  exit 1
fi

(
  cd frontend
  VIREO_DEPLOYMENT_BASE_URL="http://127.0.0.1:\${frontend_port}" \\
    corepack npm exec -- playwright test --config=playwright.deployment.config.ts
)

printf 'Production-like deployment smoke passed: built browser application, authenticated shell session, security headers, API proxy, backend readiness, PostgreSQL health, and separated database privileges.\\n'
`;
}

function genericDeploymentPlaywrightSpec() {
  return `import { expect, test } from "@playwright/test";

const username = process.env.VIREO_DEPLOYMENT_SMOKE_USERNAME!;
const password = process.env.VIREO_DEPLOYMENT_SMOKE_PASSWORD!;

test("the built production stack authenticates and preserves a session", async ({ page }) => {
  const loginResponse = await page.goto("/login");
  expect(loginResponse?.ok()).toBe(true);
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\\/$/u);
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.getByRole("button", { name: "Open account menu" })).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\\/$/u);
  await expect(page.getByRole("button", { name: "Open account menu" })).toBeVisible();
});
`;
}

function rewrite(path: string, content: string, metadata: ProjectMetadata): string | undefined {
  const canonical = metadata.profile === "frontend" ? `frontend/${path}` : path;
  if (canonical === "README.md") {
    return content.replace(/\bItems\b/g, "example records").replace(/\bItem\b/g, "example domain");
  }
  if (canonical.endsWith("/app/app.pages.ts")) {
    return removeObjectBlock(content.replace('"OVERVIEW" | "ITEMS" | "SETTINGS"', '"OVERVIEW" | "SETTINGS"'), "items");
  }
  if (canonical === "scripts/verify-deployment.sh") return genericDeploymentVerificationScript(metadata);
  if (canonical.endsWith("/tests/deployment/item-persistence.spec.ts")) return genericDeploymentPlaywrightSpec();
  if (canonical.endsWith("/tests/unit/app-pages.test.ts")) {
    return `import { describe, expect, it, vi } from "vitest";
import {
  APP_NAVIGATION_PAGES,
  APP_PAGE_REGISTRY,
  APP_PAGES,
  APP_ROUTE_SKELETON_COMPOSITIONS,
  loadAppPage,
  preloadAppPage,
} from "@/app/app.pages";
import { APP_LOCALIZATION_RESOURCES } from "@/app/app.localization";

function hasNestedKey(value: unknown, path: string): boolean {
  return path.split(".").every(segment => {
    if (!value || typeof value !== "object" || !(segment in value)) return false;
    value = (value as Record<string, unknown>)[segment];
    return true;
  });
}

describe("application page registry", () => {
  it("owns every route path and path builder in one registry", () => {
    for (const [id, definition] of Object.entries(APP_PAGE_REGISTRY)) {
      expect(APP_PAGES[id as keyof typeof APP_PAGES]).toBe(definition.path);
      expect(definition.buildPath()).toBe(definition.path);
      expect(["eager", "lazy"]).toContain(definition.render);
      if (definition.render === "lazy") expect(definition.load).toEqual(expect.any(Function));
      else expect(definition.component).toEqual(expect.any(Function));
      expect(["none", "progress", "retain", "skeleton"]).toContain(definition.loading.policy);
    }
  });

  it("declares exact skeletons only for routes with shared synchronous composition", () => {
    expect(Object.values(APP_PAGE_REGISTRY).map(definition => definition.loading.policy)).not.toContain("skeleton");
    expect(Object.keys(APP_ROUTE_SKELETON_COMPOSITIONS)).toEqual(["overview"]);
    expect(APP_PAGE_REGISTRY.home.loading).toEqual({ policy: "none" });
    expect(APP_PAGE_REGISTRY.login.loading).toEqual({ policy: "progress", frame: "application" });
  });

  it("renders the synchronous Overview eagerly and preserves lazy boundaries", () => {
    expect(APP_PAGE_REGISTRY.home.render).toBe("eager");
    expect(APP_PAGE_REGISTRY.settings.render).toBe("lazy");
    expect(APP_PAGE_REGISTRY.login.render).toBe("lazy");
  });

  it("resolves every progress-header key in every supported locale", () => {
    for (const resources of Object.values(APP_LOCALIZATION_RESOURCES)) {
      for (const definition of Object.values(APP_PAGE_REGISTRY)) {
        if (definition.loading.policy !== "progress" || definition.loading.frame !== "page") continue;
        const header = definition.loading.header;
        if (!header) continue;
        const namespace = resources[header.namespace as keyof typeof resources];

        expect(namespace, \`Missing namespace \${header.namespace}\`).toBeDefined();
        expect(hasNestedKey(namespace, header.titleKey), \`\${header.namespace}:\${header.titleKey}\`).toBe(true);
        expect(hasNestedKey(namespace, header.descriptionKey), \`\${header.namespace}:\${header.descriptionKey}\`).toBe(true);
        if (header.backLabelKey) {
          expect(hasNestedKey(namespace, header.backLabelKey), \`\${header.namespace}:\${header.backLabelKey}\`).toBe(true);
        }
      }
    }
  });

  it("keeps navigation entries ordered and unique", () => {
    const paths = APP_NAVIGATION_PAGES.map(page => page.path);
    const orders = APP_NAVIGATION_PAGES.map(page => page.order);

    expect(new Set(paths).size).toBe(paths.length);
    expect(orders).toEqual([...orders].sort((left, right) => left - right));
  });

  it("shares one route-module promise between intent prefetch and rendering", async () => {
    const load = vi.spyOn(APP_PAGE_REGISTRY.settings, "load");

    preloadAppPage(APP_PAGES.settings);
    await loadAppPage("settings");

    expect(load).toHaveBeenCalledOnce();
  });
});
`;
  }
  if (canonical.endsWith("/tests/integration/app-shell-layout.integration.test.tsx")) {
    return replaceGenericItemReferences(content)
      .replace("    records,\n    onChange", "    items,\n    onChange")
      .replace("    records: readonly {", "    items: readonly {")
      .replace(/\brecords\.map\b/gu, "items.map")
      .replace(
        'expect(screen.getByRole("button", { name: "Records" })).toBeVisible();',
        'expect(screen.queryByRole("button", { name: "Records" })).not.toBeInTheDocument();',
      );
  }
  if (
    [
      "/app/shell/layout/AppPageHeader.stories.tsx",
      "/tests/integration/app-page-header.integration.test.tsx",
      "/tests/integration/session-expiry.integration.test.tsx",
      "/tests/unit/app-query-error-reporting.test.ts",
      "/tests/unit/is-app-route-active.test.ts",
    ].some(suffix => canonical.endsWith(suffix))
  ) {
    return replaceGenericItemReferences(content);
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
        `printf 'Database recovery rehearsal passed: PostgreSQL 17 backup restored on PostgreSQL 18, %s users, %s migrations, and production readiness verified.\\n' "$target_user_count" "$target_migration_count"`,
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
  if (canonical.endsWith("/MainApplicationTest.java")) {
    const packageName = metadata.javaPackage;
    if (!packageName) throw new Error("Full-stack metadata is missing javaPackage.");
    return `package ${packageName};

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MainApplicationTest {
    private final MockMvc mockMvc;

    @Autowired
    MainApplicationTest(MockMvc mockMvc) {
        this.mockMvc = mockMvc;
    }

    @Test
    void contextLoads() {
    }

    @Test
    @DisplayName("Actuator readiness is available without an authenticated session")
    void readinessIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
`;
  }
  if (canonical.endsWith("/SecurityContractIntegrationTest.java")) {
    return content.replace("/api/items/search", "/api/application-mutation");
  }
  if (canonical.endsWith("/OpenApiCompatibilityIntegrationTest.java")) {
    return replaceGenericItemReferences(content).replace(/\bItem(?=[A-Z])/gu, "Record");
  }
  if (canonical === "src/test/resources/contracts/openapi-compatibility.json") {
    const contract = JSON.parse(content) as {
      operations?: Record<string, unknown>;
      schemaNames?: string[];
      schemas?: Record<string, unknown>;
    };
    if (!contract.operations || !Array.isArray(contract.schemaNames) || !contract.schemas) {
      throw new Error("OpenAPI compatibility contract is invalid.");
    }
    contract.operations = Object.fromEntries(
      Object.entries(contract.operations).filter(
        ([operation]) => !operation.includes("/api/items") && operation !== "GET /api/history",
      ),
    );
    contract.schemaNames = contract.schemaNames.filter(
      name => !["HistoryActor", "HistoryRecord", "ItemDTO", "JsonNode", "PageItemDTO"].includes(name),
    );
    delete contract.schemas.ItemDTO;
    return `${JSON.stringify(contract, null, 2)}\n`;
  }
  return undefined;
}

async function readManagedFileProvenance(
  projectDirectory: string,
  templateCommit: string,
): Promise<ManagedFileManifest> {
  const path = await safeProjectFile(projectDirectory, ".vireo/managed-files.json");
  const manifest = JSON.parse(await readFile(path, "utf8")) as Partial<ManagedFileManifest>;
  if (
    manifest.schemaVersion !== 1 ||
    typeof manifest.templateCommit !== "string" ||
    !/^[a-f0-9]{40}$/u.test(manifest.templateCommit) ||
    manifest.templateCommit !== templateCommit ||
    !Array.isArray(manifest.files) ||
    manifest.files.length === 0 ||
    manifest.files.some(file => typeof file?.path !== "string" || typeof file?.sha256 !== "string")
  ) {
    throw new Error("Managed-file provenance is invalid.");
  }
  const paths = new Set<string>();
  for (const file of manifest.files) {
    assertManagedProvenancePath(file.path);
    projectFile(projectDirectory, file.path);
    if (paths.has(file.path) || !/^[a-f0-9]{64}$/u.test(file.sha256)) {
      throw new Error("Managed-file provenance contains duplicate paths or invalid hashes.");
    }
    paths.add(file.path);
  }
  return manifest as ManagedFileManifest;
}

async function refreshManagedFileProvenance(
  projectDirectory: string,
  manifest: ManagedFileManifest,
  plans: ReadonlyArray<RemoveExampleFile & { content?: string }>,
) {
  const path = await safeProjectFile(projectDirectory, ".vireo/managed-files.json");
  const planned = new Map(plans.map(plan => [plan.path, plan]));
  const files: ManagedFileManifest["files"] = [];
  for (const file of manifest.files) {
    const plan = planned.get(file.path);
    if (plan?.status === "delete") continue;
    if (plan?.status === "update" || plan?.status === "create") {
      files.push({
        path: file.path,
        sha256: digest(await readFile(await safeProjectFile(projectDirectory, file.path))),
      });
    } else files.push(file);
  }
  const updated: ManagedFileManifest = { schemaVersion: 1, templateCommit: manifest.templateCommit, files };
  const temporary = await safeProjectFile(projectDirectory, ".vireo/managed-files.json.next");
  await writeFile(temporary, `${JSON.stringify(updated, null, 2)}\n`);
  await rename(temporary, path);
}

export async function findExampleReferences(projectDirectory: string, profile?: ProjectMetadata["profile"]) {
  const references: string[] = [];
  const effectiveProfile =
    profile ??
    (JSON.parse(await readFile(join(projectDirectory, ".vireo/project.json"), "utf8")) as ProjectMetadata).profile;
  for (const path of await filesBelow(projectDirectory)) {
    if (path.startsWith(".vireo/") || path === "package-lock.json") continue;
    if (isNonExampleInfrastructurePath(path, effectiveProfile)) continue;
    const absolute = join(projectDirectory, path);
    if (!(await lstat(absolute)).isFile()) {
      if (isStructurallyOwnedSamplePath(path, effectiveProfile)) references.push(path);
      continue;
    }
    const value = await readFile(absolute);
    if (value.includes(0)) {
      if (isStructurallyOwnedSamplePath(path, effectiveProfile)) references.push(path);
      continue;
    }
    const content = value.toString("utf8");
    if (isRewrittenGenericCoveragePath(path, effectiveProfile) && !SAMPLE_REFERENCE.test(content)) continue;
    if (!value.includes(0) && (SAMPLE_REFERENCE.test(content) || /(^|\/)item(?:s)?(?:\.|\/|$)/i.test(path)))
      references.push(path);
  }
  return references;
}

export async function removeExample(projectDirectory: string, apply = false): Promise<RemoveExampleResult> {
  const root = resolve(projectDirectory);
  const metadata = JSON.parse(await readFile(join(root, ".vireo/project.json"), "utf8")) as ProjectMetadata;
  try {
    await readFile(join(root, RECEIPT_PATH));
    const residual = await findExampleReferences(root, metadata.profile);
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
  const unknownReferences = (await findExampleReferences(root, metadata.profile)).filter(
    path => !(path in manifest.files),
  );
  if (unknownReferences.length)
    throw new Error(`Refusing to remove customized/unowned example references:\n${unknownReferences.join("\n")}`);
  const managedProvenance = await readManagedFileProvenance(root, metadata.templateCommit);
  const plans: Array<RemoveExampleFile & { content?: string }> = [];
  for (const [path, expected] of Object.entries(manifest.files)) {
    if (isNonExampleInfrastructurePath(path, metadata.profile)) continue;
    const absolute = await safeProjectFile(root, path);
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
      (SAMPLE_REFERENCE.test(plan.content ?? "") ||
        (!isRewrittenGenericCoveragePath(plan.path, metadata.profile) &&
          /(^|\/)item(?:s)?(?:\.|\/|$)/i.test(plan.path))),
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
      if (plan.path === RECEIPT_PATH) continue;
      const absolute = await safeProjectFile(root, plan.path);
      if (plan.status === "delete") await rm(absolute);
      else {
        await mkdir(dirname(absolute), { recursive: true });
        await writeFile(absolute, plan.content ?? "");
      }
    }
    await rm(await safeProjectFile(root, MANIFEST_PATH));
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
      await rm(await safeProjectFile(root, path), { recursive: true, force: true });
    await refreshManagedFileProvenance(root, managedProvenance, plans);
    const residual = await findExampleReferences(root, metadata.profile);
    if (residual.length) throw new Error(`Transformation left residual example references:\n${residual.join("\n")}`);
    const receipt = plans.find(plan => plan.path === RECEIPT_PATH);
    if (!receipt?.content) throw new Error("Removal receipt plan is missing.");
    await writeFile(await safeProjectFile(root, RECEIPT_PATH), receipt.content);
  }
  return {
    projectDirectory: root,
    state: apply ? "removed" : "present",
    dryRun: !apply,
    files: plans.map(({ path, status }) => ({ path, status })),
  };
}
