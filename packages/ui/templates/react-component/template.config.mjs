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
    storybookCategory: {
      required: false,
      validate(value) {
        if (value.trim() === "") return "provide a non-empty category.";
      },
    },
  },
  allowedOutputRoots: ["packages/ui/src"],
  outputDirectory: "{{componentName}}",
  files: [
    { source: "files/Component.classes.ts.template", destination: "{{componentName}}.classes.ts" },
    { source: "files/Component.identity.ts.template", destination: "{{componentName}}.identity.ts" },
    { source: "files/Component.stories.tsx.template", destination: "{{componentName}}.stories.tsx" },
    { source: "files/Component.styled.ts.template", destination: "{{componentName}}.styled.ts" },
    { source: "files/Component.test.tsx.template", destination: "{{componentName}}.test.tsx" },
    { source: "files/Component.tsx.template", destination: "{{componentName}}.tsx" },
    { source: "files/Component.types.ts.template", destination: "{{componentName}}.types.ts" },
    { source: "files/index.ts.template", destination: "index.ts" },
  ],
  prepareData(inputs, context) {
    const componentName = `Vireo${inputs.name}`;
    const inferredCategory = toDisplayName(context.outputBaseName);

    return {
      componentName,
      componentVariableName: `${componentName.charAt(0).toLowerCase()}${componentName.slice(1)}`,
      componentConstantName: `VIREO_${toScreamingSnakeCase(inputs.name)}`,
      storybookCategory: inputs.storybookCategory ?? inferredCategory,
    };
  },
};
