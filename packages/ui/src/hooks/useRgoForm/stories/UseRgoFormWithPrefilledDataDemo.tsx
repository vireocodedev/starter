import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoForm } from "@/components/inputs/RgoForm/RgoForm";
import { RgoInputNumber } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { useRgoForm, type UseFormProps } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { type RgoTranslationFn } from "@/setup/config/RgoLocale";
import { Box, Button, CardActions, Paper, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

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

export function UseFormWithPrefilledDataDemo(props: Pick<UseFormProps<BasicFormData>, "defaultValues" | "schema">) {
  return (
    <Box sx={{ p: 3 }}>
      <RgoLabelBox label="RgoForm with Pre-filled Default Values">
        <FormDemo {...props} />
      </RgoLabelBox>
    </Box>
  );
}

export const UseFormWithPrefilledDataDemoCode = `
import { RgoLabelBox, RgoForm, RgoInputNumber, useRgoForm, type UseFormProps, type RgoTranslationFn } from "@vireocodedev/starter-ui";
import { Box, Paper, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

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
  const form = useRgoForm<BasicFormData>({
    defaultValues,
    schema,
  });

  const onSubmit = (data: BasicFormData) => {
    console.log("Form submitted:", data);
    alert(\`Form submitted successfully!\n\nData: \${JSON.stringify(data, null, 2)}\`);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        User Registration Form
      </Typography>

      <RgoForm form={form} onSubmit={onSubmit} hideCancelButton>
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
                value={field.value}
                onChange={field.onChange}
                min={0}
                max={120}
                placeholder="Enter your age"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </RgoLabelBox>
      </RgoForm>
    </Paper>
  );
};

export function UseFormWithPrefilledDataDemo(props: Pick<UseFormProps<BasicFormData>, "defaultValues" | "schema">) {
  return (
    <Box sx={{ p: 3 }}>
      <RgoLabelBox label="RgoForm with Pre-filled Default Values">
        <FormDemo {...props} />
      </RgoLabelBox>
    </Box>
  );
}`;
