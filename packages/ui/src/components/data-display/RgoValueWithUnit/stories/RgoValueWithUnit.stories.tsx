import { RgoValueWithUnit } from "@/components/data-display/RgoValueWithUnit/RgoValueWithUnit";
import {
  RgoValueWithUnitWithCommonUnitsDemo,
  RgoValueWithUnitWithCommonUnitsDemoCode,
} from "@/components/data-display/RgoValueWithUnit/stories/RgoValueWithUnitWithCommonUnitsDemo";
import {
  RgoValueWithUnitWithDecimalPrecisionDemo,
  RgoValueWithUnitWithDecimalPrecisionDemoCode,
} from "@/components/data-display/RgoValueWithUnit/stories/RgoValueWithUnitWithDecimalPrecisionDemo";
import {
  RgoValueWithUnitWithDefaultPropsDemo,
  RgoValueWithUnitWithDefaultPropsDemoCode,
} from "@/components/data-display/RgoValueWithUnit/stories/RgoValueWithUnitWithDefaultPropsDemo";
import {
  RgoValueWithUnitWithDifferentValueTypesDemo,
  RgoValueWithUnitWithDifferentValueTypesDemoCode,
} from "@/components/data-display/RgoValueWithUnit/stories/RgoValueWithUnitWithDifferentValueTypesDemo";
import {
  RgoValueWithUnitWithEmptyAndInvalidValuesDemo,
  RgoValueWithUnitWithEmptyAndInvalidValuesDemoCode,
} from "@/components/data-display/RgoValueWithUnit/stories/RgoValueWithUnitWithEmptyAndInvalidValuesDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A component that displays a numeric value with its associated unit. Handles null/undefined values gracefully by showing a dash, and formats numbers with configurable decimal places.

## Stories

- [With default props](#with-default-props)
- [With different value types](#with-different-value-types)
- [With empty and invalid values](#with-empty-and-invalid-values)
- [With decimal precision](#with-decimal-precision)
- [With common units](#with-common-units)

## Usage

\`\`\`tsx
${RgoValueWithUnitWithDefaultPropsDemoCode}
\`\`\``;

const meta: Meta<typeof RgoValueWithUnit> = {
  title: "Components/Data display/RgoValueWithUnit",
  component: RgoValueWithUnit,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    value: {
      control: "number",
      description: "The numeric value to display.",
      table: {
        type: { summary: "number | string" },
      },
    },
    unit: {
      control: "text",
      description: "The unit of measurement to display alongside the value.",
    },
    toFixed: {
      control: { type: "number", min: 0, max: 10, step: 1 },
      description: "Number of decimal places to display for the value.",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  args: {
    value: 42,
    unit: "kg",
    toFixed: 0,
  },
  render: args => <RgoValueWithUnitWithDefaultPropsDemo {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Basic usage with a numeric value and unit. Only includes required props.",
      },
    },
  },
};

export const WithDifferentValueTypes: Story = {
  name: "With different value types",
  render: () => <RgoValueWithUnitWithDifferentValueTypesDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Examples showing how the component handles different types of values including integers, decimals, strings, and zero.",
      },
      source: {
        code: RgoValueWithUnitWithDifferentValueTypesDemoCode,
      },
    },
  },
};

export const WithEmptyAndInvalidValues: Story = {
  name: "With empty and invalid values",
  render: () => <RgoValueWithUnitWithEmptyAndInvalidValuesDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Examples showing how the component handles null, undefined, and empty string values by displaying a dash without the unit.",
      },
      source: {
        code: RgoValueWithUnitWithEmptyAndInvalidValuesDemoCode,
      },
    },
  },
};

export const WithDecimalPrecision: Story = {
  name: "With decimal precision",
  render: () => <RgoValueWithUnitWithDecimalPrecisionDemo />,
  parameters: {
    docs: {
      description: {
        story: "Examples demonstrating different decimal precision settings using the toFixed prop.",
      },
      source: {
        code: RgoValueWithUnitWithDecimalPrecisionDemoCode,
      },
    },
  },
};

export const WithCommonUnits: Story = {
  name: "With common units",
  render: () => <RgoValueWithUnitWithCommonUnitsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Examples showing the component with various common units of measurement.",
      },
      source: {
        code: RgoValueWithUnitWithCommonUnitsDemoCode,
      },
    },
  },
};
