import { RgoLabelBox } from "@/core/public";
import { RgoForm, type RgoFormProps } from "@/components/inputs/RgoForm/RgoForm";
import { RgoInputNumber } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import { RgoInputText } from "@/components/inputs/RgoInputText/RgoInputText";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Alert, Button, Grid2 as Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { Controller } from "react-hook-form";
import z from "zod";

// Form schema with extensive validation
const userValidationSchema = () =>
  z
    .object({
      username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        ),
      confirmPassword: z.string(),
      age: z.number().min(13, "Must be at least 13 years old").max(120, "Age must be realistic"),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

type FormData = z.infer<ReturnType<typeof userValidationSchema>>;

type RgoFormWithValidationDemoProps = Partial<Omit<RgoFormProps<FormData>, "form" | "onSubmit" | "children">>;

export function RgoFormWithValidationDemo(props: RgoFormWithValidationDemoProps = {}) {
  const [submitResult, setSubmitResult] = React.useState<string | null>(null);

  const t = useTranslationLocal();
  const form = useRgoForm<FormData>({
    t,
    schema: userValidationSchema,
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      age: 25,
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      // Simulate API call with validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitResult("Form submitted successfully! All validations passed.");
      console.log("Valid form data:", data);
    } catch {
      setSubmitResult("Submission failed. Please try again.");
    }
  };

  return (
    <Stack spacing={4}>
      <Typography variant="h6" component="h2">
        Form with Comprehensive Validation
      </Typography>

      <RgoForm {...props} form={form} onSubmit={handleSubmit}>
        <RgoFormSection label="Account Information">
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Username" required>
                    <RgoInputText
                      {...field}
                      error={!!fieldState.error}
                      helperText={
                        fieldState.error?.message || "3-20 characters, letters, numbers, and underscores only"
                      }
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Password" required>
                    <RgoInputText
                      {...field}
                      rgoSlotProps={{
                        root: { type: "password" },
                      }}
                      error={!!fieldState.error}
                      helperText={
                        fieldState.error?.message || "At least 8 characters with uppercase, lowercase, and number"
                      }
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Confirm Password" required>
                    <RgoInputText
                      {...field}
                      rgoSlotProps={{
                        root: { type: "password" },
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || "Must match the password above"}
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="age"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Age" required>
                    <RgoInputNumber
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || "Must be between 13 and 120"}
                      min={13}
                      max={120}
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>
          </Grid>
        </RgoFormSection>

        <RgoFormSection label="Form actions">
          <Grid container spacing={2}>
            <Grid size={12}>
              <Button type="submit" variant="contained" disabled={form.submitDisabled} fullWidth>
                {form.formState.isSubmitting ? "Validating..." : "Create Account"}
              </Button>
            </Grid>
          </Grid>
        </RgoFormSection>
      </RgoForm>

      {submitResult && (
        <Alert
          severity={submitResult.includes("successfully") ? "success" : "error"}
          onClose={() => setSubmitResult(null)}
        >
          {submitResult}
        </Alert>
      )}

      {/* Form State Debugging */}
      <Stack spacing={2}>
        <Typography variant="subtitle2">Validation Status:</Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            fontSize: "0.75rem",
            backgroundColor: "grey.100",
            p: 2,
            borderRadius: 1,
          }}
        >
          {JSON.stringify(
            {
              isValid: form.formState.isValid,
              isDirty: form.formState.isDirty,
              submitDisabled: form.submitDisabled,
              errors: Object.keys(form.formState.errors),
            },
            null,
            2,
          )}
        </Typography>
      </Stack>
    </Stack>
  );
}

export const RgoFormWithValidationDemoCode = `import { RgoLabelBox, RgoForm, RgoInputText, RgoInputNumber, useRgoForm } from "@vireocodedev/starter-ui";
import { Alert, Button, Grid2 as Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { Controller } from "react-hook-form";
import z from "zod";

const userValidationSchema = () =>
  z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/, "Password must contain uppercase, lowercase, and number"),
    confirmPassword: z.string(),
    age: z.number().min(13, "Must be at least 13 years old").max(120, "Age must be realistic"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<ReturnType<typeof userValidationSchema>>;

export function RgoFormWithValidationDemo() {
  const form = useRgoForm<FormData>({
    schema: userValidationSchema,
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      age: 25,
    },
  });

  const handleSubmit = async (data: FormData) => {
    console.log("Valid form data:", data);
  };

  return (
    <RgoForm form={form} onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <RgoLabelBox label="Username" required>
              <RgoInputText
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message || "3-20 characters, letters, numbers, and underscores only"}
              />
            </RgoLabelBox>
          )}
        />
        
        {/* More form fields... */}

        <Button type="submit" variant="contained" disabled={form.submitDisabled}>
          Create Account
        </Button>
      </Stack>
    </RgoForm>
  );
}`;
