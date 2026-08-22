import type { Meta } from "@storybook/react-vite";
import type { SBType } from "storybook/internal/csf";

import { MdBadge } from "./markdownutils";

type StorybookDescriptionOptions = {
  /** Badge status (e.g., "STABLE", "WIP") */
  badge: keyof typeof MdBadge;
  /** Main description of the component/hook */
  description: string;
  /** Generic type parameters explanation */
  generics?: Array<{
    name: string;
    description: string;
  }>;
  /** List of story examples with their anchor links */
  stories: Array<{
    name: string;
    anchor: string;
  }>;
  /** Setup instructions (typically for hooks requiring providers) */
  setup?: {
    title?: string;
    steps: Array<{
      title: string;
      code: string;
    }>;
  };
  /** Usage code example */
  usage: string;
};

export function storybookInputComponentArgTypes<
  TValueDescription extends string,
  TValueType extends string,
  TSlotNames extends undefined | string[] = undefined,
>({
  valueDescription,
  valueType,
  slotNames = [],
}: {
  valueDescription: TValueDescription;
  valueType: TValueType;
  slotNames?: TSlotNames;
}) {
  return {
    value: {
      type: { required: true } as SBType,
      control: false,
      description: valueDescription,
      table: {
        type: { summary: valueType },
      },
    },
    onChange: {
      type: { required: true } as SBType,
      control: false,
      description: "Callback function called when the input value changes",
      table: {
        type: { summary: `(value: ${valueType}) => void` },
      },
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
      table: {
        defaultValue: {
          summary: "false",
        },
      },
    },
    error: {
      control: "boolean",
      description: "Whether the input is in an error state",
      table: {
        defaultValue: {
          summary: "false",
        },
      },
    },
    helperText: {
      control: "text",
      description: "Helper text to display below the input",
      table: {
        defaultValue: {
          summary: "",
        },
      },
    },
    onBlur: {
      control: false,
      description: "Callback function called when the input loses focus",
      table: {
        type: { summary: `() => void` },
      },
    },
    name: {
      control: false,
      description: "Name attribute for the input element",
      table: {
        type: { summary: "string" },
      },
    },
    rgoSlotProps: {
      control: false,
      description: "Props to customize internal components",
      table: {
        type: { summary: `{ ${slotNames.join(", ")} }` },
      },
    },
  } as const satisfies Meta["argTypes"];
}

/**
 * Converts a story name to its corresponding anchor link format.
 *
 * @param name The story name (e.g., "With default props")
 * @returns The anchor link (e.g., "with-default-props")
 */
export function createStoryAnchor(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function createStories(storyNames: string[]) {
  return storyNames.map(name => ({
    name,
    anchor: createStoryAnchor(name),
  }));
}

/**
 * Generates a standardized Storybook description following the project's markdown pattern.
 *
 * The function creates a consistent description format with:
 * 1. Status badge (STABLE or WIP)
 * 2. Component/hook description
 * 3. Generics section (optional, for components with type parameters)
 * 4. Stories table of contents with anchor links
 * 5. Setup section (optional, typically for hooks requiring providers)
 * 6. Usage code example
 *
 * @param options Configuration object with required and optional sections
 * @returns Formatted markdown string for use in Storybook's docs.description.component
 *
 * @example
 * ```typescript
 * const description = createStorybookDescription({
 *   badge: "STABLE",
 *   description: "Input component for entering numeric values.",
 *   stories: [
 *     { name: "With default props", anchor: "with-default-props" },
 *     { name: "With error", anchor: "with-error" },
 *   ],
 *   usage: demoCode,
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With generics and setup
 * const description = createStorybookDescription({
 *   badge: "STABLE",
 *   description: "Generic select component.",
 *   generics: [
 *     { name: "T", description: "Type of option objects" },
 *   ],
 *   stories: [{ name: "Basic usage", anchor: "basic-usage" }],
 *   setup: {
 *     steps: [
 *       {
 *         title: "Install provider",
 *         code: "import { ThemeProvider } from '@mui/material';",
 *       },
 *     ],
 *   },
 *   usage: demoCode,
 * });
 * ```
 */

/**
 * Generates a standardized Storybook description following the project's markdown pattern.
 *
 * @param options Configuration object with badge, description, stories, and optional sections
 * @returns Formatted markdown string for use in Storybook's docs.description.component
 */
export function createStorybookDescription(options: StorybookDescriptionOptions): string {
  const { badge, description, generics, stories, setup, usage } = options;

  const sections: string[] = [];

  // Badge
  sections.push(MdBadge[badge]);

  // Description
  sections.push(description);

  // Generics (optional)
  if (generics && generics.length > 0) {
    sections.push("## Generics");
    sections.push("");
    generics.forEach(generic => {
      sections.push(`- \`${generic.name}\` ${generic.description}`);
    });
  }

  // Stories (TOC)
  sections.push("## Stories");
  sections.push("");
  stories.forEach(story => {
    sections.push(`- [${story.name}](#${story.anchor})`);
  });

  // Setup (optional)
  if (setup) {
    const setupTitle = setup.title || "Setup";
    sections.push(`## ${setupTitle}`);
    sections.push("");
    setup.steps.forEach((step, index) => {
      sections.push(`### ${index + 1}. ${step.title}`);
      sections.push("");
      sections.push("```tsx");
      sections.push(step.code);
      sections.push("```");
      if (index < setup.steps.length - 1) {
        sections.push("");
      }
    });
  }

  // Usage
  sections.push("## Usage");
  sections.push("");
  sections.push("```tsx");
  sections.push(usage);
  sections.push("```");

  return sections.join("\n\n");
}
