import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoForm } from "@/components/inputs/RgoForm/RgoForm";
import { RgoInputNumber } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import {
    UseFormWithAdvancedValidationDemo,
    UseFormWithAdvancedValidationDemoCode,
} from "@/hooks/useRgoForm/stories/UseRgoFormWithAdvancedValidationDemo";
import { useRgoForm, type UseFormProps } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { type RgoTranslationFn } from "@/setup/config/RgoLocale";
import { Button, CardActions, Paper, TextField, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Controller } from "react-hook-form";
import z from "zod";
import { UseFormWithDefaultsDemo, UseFormWithDefaultsDemoCode } from "./UseRgoFormWithDefaultsDemo";
import { UseFormWithPrefilledDataDemo, UseFormWithPrefilledDataDemoCode } from "./UseRgoFormWithPrefilledDataDemo";
import { UseFormWithValidationDemo, UseFormWithValidationDemoCode } from "./UseRgoFormWithValidationDemo";

const DESCRIPTION = `
![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)

A custom React hook that simplifies form handling in your application. It provides a powerful way to manage form state, validation, and submission using React Hook Form and Zod for schema validation.

## Stories

- [With default props](#with-default-props)
- [With validation](#with-validation)
- [With advanced validation](#with-advanced-validation)
- [With prefilled data](#with-prefilled-data)

## Usage

\`\`\`tsx
${UseFormWithDefaultsDemoCode}
\`\`\``;

// Basic form data type for examples
type BasicFormData = {
  name: string;
  email: string;
  age: number | null;
};

// Schema factory for basic form
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const basicSchema = (_t: RgoTranslationFn) =>
  z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    age: z.number().min(18, "Must be at least 18 years old").nullable(),
  });

// Demo component to showcase the useRgoForm hook
const FormDemo = ({
  defaultValues,
  schema,
}: {
  defaultValues: UseFormProps<BasicFormData>["defaultValues"];
  schema?: UseFormProps<BasicFormData>["schema"];
}) => {
  const t = useTranslationLocal();
  const form = useRgoForm<BasicFormData>({
    t,
    defaultValues,
    schema,
  });

  const onSubmit = (data: BasicFormData) => {
    console.log("Form submitted:", data);
    alert(`Form submitted successfully!\n\nData: ${JSON.stringify(data, null, 2)}`);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        User Registration Form
      </Typography>

      <RgoForm form={form} onSubmit={onSubmit}>
        <RgoFormSection>
          <RgoLabelBox label="Name" required>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="Enter your full name"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </RgoLabelBox>

          <RgoLabelBox label="Email" required>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="email"
                  fullWidth
                  placeholder="Enter your email address"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </RgoLabelBox>

          <RgoLabelBox label="Age">
            <Controller
              name="age"
              control={form.control}
              render={({ field, fieldState }) => (
                <RgoInputNumber
                  {...field}
                  min={0}
                  max={120}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  rgoSlotProps={{
                    root: {
                      placeholder: "Enter your age",
                    },
                  }}
                />
              )}
            />
          </RgoLabelBox>
        </RgoFormSection>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button color="primary" variant="contained" type="submit">
            Submit
          </Button>
        </CardActions>
      </RgoForm>
    </Paper>
  );
};

const meta: Meta<typeof FormDemo> = {
  title: "Hooks/useRgoForm",
  component: FormDemo,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    defaultValues: {
      control: "object",
      description: "Default values for the form fields",
      table: { type: { summary: "Partial<TFieldValues>" } },
    },
    schema: {
      control: false,
      description: "Zod schema factory function that receives translation function and returns validation schema",
      table: { type: { summary: "(t: RgoTranslationFn) => z.ZodType<TFieldValues>" } },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaults: Story = {
  name: "With default props",
  render: ({ defaultValues, schema }) => <UseFormWithDefaultsDemo defaultValues={defaultValues} schema={schema} />,
  args: {
    defaultValues: {
      name: "",
      email: "",
      age: null,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Basic form with useRgoForm hook and default values, no validation.",
      },
      source: {
        code: UseFormWithDefaultsDemoCode,
      },
    },
  },
};

export const WithValidation: Story = {
  name: "With validation",
  render: ({ defaultValues, schema }) => <UseFormWithValidationDemo defaultValues={defaultValues} schema={schema} />,
  args: {
    defaultValues: {
      name: "",
      email: "",
      age: null,
    },
    schema: basicSchema,
  },
  parameters: {
    docs: {
      description: {
        story: "Form with Zod schema validation for required fields, email format, and minimum age.",
      },
      source: {
        code: UseFormWithValidationDemoCode,
      },
    },
  },
};

export const WithAdvancedValidation: Story = {
  name: "With advanced validation",
  render: () => <UseFormWithAdvancedValidationDemo />,
  parameters: {
    docs: {
      description: {
        story: "Form with advanced Zod validation including cross-field validation.",
      },
      source: {
        code: UseFormWithAdvancedValidationDemoCode,
      },
    },
  },
};

export const WithPrefilledData: Story = {
  name: "With prefilled data",
  render: ({ defaultValues, schema }) => <UseFormWithPrefilledDataDemo defaultValues={defaultValues} schema={schema} />,
  args: {
    defaultValues: {
      name: "John Doe",
      email: "john.doe@example.com",
      age: 25,
    },
    schema: basicSchema,
  },
  parameters: {
    docs: {
      description: {
        story: "Form pre-populated with existing data and validation schema.",
      },
      source: {
        code: UseFormWithPrefilledDataDemoCode,
      },
    },
  },
};
