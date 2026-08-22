import DateTimeModeExample from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/DateTimeModeExample";
import dateTimeModeExampleSource from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/DateTimeModeExample.tsx?raw";
import DefaultExample from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/DefaultExample.tsx?raw";
import MonthModeExample from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/MonthModeExample";
import monthModeExampleSource from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/MonthModeExample.tsx?raw";
import TimeModeExample from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/TimeModeExample";
import timeModeExampleSource from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/TimeModeExample.tsx?raw";
import YearModeExample from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/YearModeExample";
import yearModeExampleSource from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/YearModeExample.tsx?raw";
import YearMonthModeExample from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/YearMonthModeExample";
import yearMonthModeExampleSource from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/YearMonthModeExample.tsx?raw";
import ZodFieldValidationExample from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/ZodFieldValidationExample";
import zodFieldValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/ZodFieldValidationExample.tsx?raw";
import ZodFormValidationExample from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/ZodFormValidationExample";
import zodFormValidationExampleSource from "@/capabilities/forms/components/forms/VireoFormTemporalField/internal/storybook/ZodFormValidationExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoFormTemporalField } from "./VireoFormTemporalField";

function createSourceParameters(code: string, description?: string) {
  return {
    docs: {
      ...(description && { description: { story: description } }),
      source: { code, language: "tsx", type: "code" as const },
    },
  };
}

const meta = {
  title: "UI/Capabilities/Forms/Fields/VireoFormTemporalField",
  component: VireoFormTemporalField,
  tags: ["autodocs"],
  args: { mode: "date" },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `VireoFormTemporalField binds six localized temporal picker modes to canonical timezone-free \`string | null\` values through \`field.TemporalField\`.

### Why it exists

Date and time inputs otherwise repeat adapter conversion, canonical serialization, incomplete-draft handling, bounds, step validation, clear behavior, form errors, and MUI picker customization. Vireo centralizes that plumbing without assigning a timezone. Use it for year, month, year-month, date, time, and date-time form values inside \`VireoTemporalLocalizationProvider\`; keep timezone conversion, application translations, and domain validation in the consuming application.`,
      },
    },
  },
  argTypes: {
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
    pickerProps: { control: false },
  },
} satisfies Meta<typeof VireoFormTemporalField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Date mode: YYYY-MM-DD canonical state with locale-aware presentation. */
export const Default: Story = {
  name: "Date",
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
};

export const YearMode: Story = {
  name: "Year",
  render: () => <YearModeExample />,
  parameters: createSourceParameters(yearModeExampleSource),
};

export const MonthMode: Story = {
  name: "Month",
  render: () => <MonthModeExample />,
  parameters: createSourceParameters(monthModeExampleSource),
};

export const YearMonthMode: Story = {
  name: "Year Month",
  render: () => <YearMonthModeExample />,
  parameters: createSourceParameters(yearMonthModeExampleSource),
};

export const TimeMode: Story = {
  name: "Time",
  render: () => <TimeModeExample />,
  parameters: createSourceParameters(timeModeExampleSource),
};

export const DateTimeMode: Story = {
  name: "Date Time",
  render: () => <DateTimeModeExample />,
  parameters: createSourceParameters(dateTimeModeExampleSource),
};

export const ZodFieldValidation: Story = {
  render: () => <ZodFieldValidationExample />,
  parameters: createSourceParameters(
    zodFieldValidationExampleSource,
    "Validates all six temporal modes with schemas attached directly to their fields.",
  ),
};

export const ZodFormValidation: Story = {
  render: () => <ZodFormValidationExample />,
  parameters: createSourceParameters(
    zodFormValidationExampleSource,
    "Validates all six temporal modes with one path-aware Zod object schema attached to useVireoForm.",
  ),
};
