import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = mkdtempSync(join(tmpdir(), "starter-peer-floor-"));
const tarballRoot = join(fixtureRoot, "tarballs");
const consumerRoot = join(fixtureRoot, "consumer");
const npmEnvironment = {
  ...process.env,
  npm_config_cache: join(fixtureRoot, "npm-cache"),
};

const peerFloor = {
  "@hello-pangea/dnd": "18.0.0",
  "@emotion/react": "11.14.0",
  "@emotion/styled": "11.14.0",
  "@mui/icons-material": "9.0.0",
  "@mui/material": "9.0.0",
  "@mui/x-date-pickers": "9.0.0",
  "@preact/signals-core": "1.8.0",
  "@sqlite.org/sqlite-wasm": "3.53.0-build1",
  "@tanstack/react-form": "1.33.0",
  "@tanstack/react-query": "5.80.0",
  axios: "1.7.0",
  dayjs: "1.11.0",
  i18next: "26.0.0",
  react: "19.2.0",
  "react-dom": "19.2.0",
  "react-i18next": "17.0.0",
  sonner: "2.0.0",
  zod: "4.4.0",
};

try {
  mkdirSync(tarballRoot, { recursive: true });
  mkdirSync(consumerRoot, { recursive: true });

  execFileSync(
    "corepack",
    ["npm", "pack", "--workspaces", "--pack-destination", tarballRoot, "--ignore-scripts", "--silent"],
    {
      cwd: repoRoot,
      env: npmEnvironment,
      stdio: "ignore",
    },
  );
  const packed = readdirSync(join(repoRoot, "packages"), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(repoRoot, "packages", entry.name, "package.json")))
    .map(entry => JSON.parse(readFileSync(join(repoRoot, "packages", entry.name, "package.json"), "utf8")))
    .filter(manifest => !manifest.private)
    .map(manifest => ({
      name: manifest.name,
      filename: `${manifest.name.replace(/^@/u, "").replaceAll("/", "-")}-${manifest.version}.tgz`,
    }));
  const localPackages = Object.fromEntries(
    packed.map(({ name, filename }) => [name, `file:${join(tarballRoot, filename)}`]),
  );

  writeFileSync(
    join(consumerRoot, "package.json"),
    `${JSON.stringify(
      {
        name: "vireo-peer-floor-consumer",
        private: true,
        type: "module",
        packageManager: "npm@12.0.2",
        dependencies: { ...localPackages, ...peerFloor },
        overrides: {
          react: peerFloor.react,
          "react-dom": peerFloor["react-dom"],
        },
        devDependencies: {
          "@types/react": "19.2.0",
          "@types/react-dom": "19.2.0",
          typescript: "6.0.2",
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(consumerRoot, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          jsx: "react-jsx",
          lib: ["DOM", "ES2022"],
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          skipLibCheck: false,
          strict: true,
          target: "ES2022",
        },
        include: ["consumer.tsx"],
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(consumerRoot, "consumer.tsx"),
    `import { VireoSkeleton } from "@vireocodedev/starter-ui";
import type * as Forms from "@vireocodedev/starter-ui/forms";
import type * as Dnd from "@vireocodedev/starter-ui/hello-pangea-dnd";
import type * as I18next from "@vireocodedev/starter-ui/react-i18next";
import type * as Sonner from "@vireocodedev/starter-ui/sonner";
import type * as Query from "@vireocodedev/starter-ui/tanstack-query";

export const fixture = <VireoSkeleton width={120} />;
export type OptionalIntegrations = [typeof Forms, typeof Dnd, typeof I18next, typeof Sonner, typeof Query];
`,
  );

  execFileSync("corepack", ["npm", "install", "--ignore-scripts", "--no-audit", "--no-fund", "--strict-peer-deps"], {
    cwd: consumerRoot,
    env: npmEnvironment,
    stdio: "inherit",
  });
  execFileSync("corepack", ["npm", "ls", "--all", "--silent"], {
    cwd: consumerRoot,
    env: npmEnvironment,
    stdio: "ignore",
  });
  execFileSync(join(consumerRoot, "node_modules", ".bin", "tsc"), ["--project", "tsconfig.json"], {
    cwd: consumerRoot,
    stdio: "inherit",
  });
  console.log(
    `Required and optional peer-floor consumer passed with npm 12.0.2, React ${peerFloor.react}, and MUI ${peerFloor["@mui/material"]}.`,
  );
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
