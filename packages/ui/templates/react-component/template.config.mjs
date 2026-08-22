function toScreamingSnakeCase(value) {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toUpperCase();
}

function toDisplayName(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export default {
  id: "react-component",
  description: "Create a first-class Vireo React component scaffold.",
  primaryInput: "name",
  inputs: {
    name: {
      required: true,
      validate(value) {
        if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
          return 'use a PascalCase JavaScript identifier without separators, for example "Badge" or "StatusBadge".';
        }
        if (value.startsWith("Vireo")) {
          return 'omit the Vireo prefix; use "Badge" instead of "VireoBadge".';
        }
      },
    },
    owner: {
      required: true,
      validate(value) {
        if (value === "core") return;

        const capabilityMatch = value.match(
          /^capabilities\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/([a-z0-9]+(?:-[a-z0-9]+)*))?$/,
        );
        const integrationMatch = value.match(/^integrations\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
        if (!capabilityMatch && !integrationMatch) {
          return 'use "core", "capabilities/<name>", "capabilities/<parent>/<child>", or "integrations/<name>" with kebab-case names.';
        }
        if (capabilityMatch?.[2] && STRUCTURAL_FOLDERS.has(capabilityMatch[2])) {
          return `"${capabilityMatch[2]}" is a reserved structural folder, not a child-capability name.`;
        }
      },
    },
    category: {
      required: true,
      validate(value) {
        if (!COMPONENT_CATEGORIES.has(value)) {
          return `use an approved component category: ${[...COMPONENT_CATEGORIES].join(", ")}.`;
        }
      },
    },
    storybookCategory: {
      required: false,
      validate(value) {
        if (value.trim() === "") return "provide a non-empty category.";
      },
    },
  },
  allowedOutputRoots: ["packages/ui/src/core", "packages/ui/src/capabilities", "packages/ui/src/integrations"],
  outputDirectory: "components/{{componentCategory}}/{{componentName}}",
  files: [
    { source: "files/Component.classes.ts.template", destination: "{{componentName}}.classes.ts" },
    { source: "files/Component.identity.ts.template", destination: "{{componentName}}.identity.ts" },
    { source: "files/Component.stories.tsx.template", destination: "{{componentName}}.stories.tsx" },
    { source: "files/Component.styled.ts.template", destination: "{{componentName}}.styled.ts" },
    { source: "files/Component.test.tsx.template", destination: "{{componentName}}.test.tsx" },
    { source: "files/Component.tsx.template", destination: "{{componentName}}.tsx" },
    { source: "files/Component.types.ts.template", destination: "{{componentName}}.types.ts" },
    { source: "files/index.ts.template", destination: "index.ts" },
    {
      source: "files/DefaultExample.tsx.template",
      destination: "internal/storybook/DefaultExample.tsx",
    },
    {
      source: "files/CustomizedSlotsExample.tsx.template",
      destination: "internal/storybook/CustomizedSlotsExample.tsx",
    },
    {
      source: "files/ThemeCustomizationExample.tsx.template",
      destination: "internal/storybook/ThemeCustomizationExample.tsx",
    },
  ],
  resolveOutput(inputs) {
    return `packages/ui/src/${inputs.owner}`;
  },
  prepareData(inputs, context) {
    const componentName = `Vireo${inputs.name}`;
    const ownerSegments = inputs.owner.split("/");
    const ownerDisplayName =
      inputs.owner === "core"
        ? `UI/Core/${toDisplayName(inputs.category)}`
        : ownerSegments[0] === "capabilities"
          ? `UI/Capabilities/${ownerSegments.slice(1).map(toDisplayName).join("/")}`
          : `UI/Integrations/${toDisplayName(ownerSegments[1])}`;
    const publicBoundary =
      inputs.owner === "core"
        ? context.outputBase
        : ownerSegments[0] === "capabilities"
          ? resolve(context.repoRoot, "packages/ui/src/capabilities", ownerSegments[1])
          : context.outputBase;

    if (!existsSync(resolve(publicBoundary, "public.ts"))) {
      throw new Error(`Architectural owner "${inputs.owner}" requires ${publicBoundary}/public.ts before generation.`);
    }

    return {
      componentCategory: inputs.category,
      componentName,
      componentSourceModule: `@/${inputs.owner}/components/${inputs.category}/${componentName}`,
      componentVariableName: `${componentName.charAt(0).toLowerCase()}${componentName.slice(1)}`,
      componentConstantName: `VIREO_${toScreamingSnakeCase(inputs.name)}`,
      coreUtilitiesModule: inputs.owner === "core" ? "@/core/utils/muiutils" : "@/core/public",
      storybookCategory: inputs.storybookCategory ?? ownerDisplayName,
    };
  },
};
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const COMPONENT_CATEGORIES = new Set([
  "behavior",
  "controls",
  "data-display",
  "feedback",
  "forms",
  "inputs",
  "layout",
  "navigation",
  "overlays",
  "surfaces",
]);

const STRUCTURAL_FOLDERS = new Set([
  "assets",
  "components",
  "constants",
  "contexts",
  "events",
  "hooks",
  "models",
  "providers",
  "services",
  "state",
  "styles",
  "types",
  "utils",
]);
