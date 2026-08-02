import {
  UseDependentFieldValidationWithDefaultsDemo,
  UseDependentFieldValidationWithDefaultsDemoCode,
} from "@/hooks/useRgoDependentFieldValidation/stories/UseRgoDependentFieldValidationWithDefaultsDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A custom React hook that monitors a set of form fields and triggers revalidation for dependent fields when one of them changes. This is particularly useful for forms with interdependent values like date ranges, price ranges, or any validation that depends on multiple fields. The hook only triggers revalidation after the form has been submitted at least once, providing a smooth user experience.

## Stories

- [With default props](#anchor--hooks-usedependentfieldvalidation--with-defaults)

## Usage

\`\`\`tsx
${UseDependentFieldValidationWithDefaultsDemoCode}
\`\`\``;

const meta: Meta = {
  tags: ["autodocs"],
  title: "Hooks/useRgoDependentFieldValidation",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaults: Story = {
  name: "With default props",
  render: () => <UseDependentFieldValidationWithDefaultsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Basic usage of the useRgoDependentFieldValidation hook with a date range form. When you change either the start date or end date, the other field will be revalidated automatically after the form has been submitted at least once. This ensures that the end date is always after or equal to the start date.",
      },
      source: {
        code: UseDependentFieldValidationWithDefaultsDemoCode,
      },
    },
  },
};
