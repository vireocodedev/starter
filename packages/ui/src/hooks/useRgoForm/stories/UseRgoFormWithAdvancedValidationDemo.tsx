import { RgoLabelBox } from "@/core/public";
import { RgoForm } from "@/components/inputs/RgoForm/RgoForm";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { type RgoTranslationFn } from "@/setup/config/RgoLocale";
import { Box, Button, CardActions, Checkbox, FormControlLabel, Paper, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

// Advanced form with complex validation
type AdvancedFormData = {
  username: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const advancedSchema = (_t: RgoTranslationFn) =>
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
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
      confirmPassword: z.string(),
      terms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

const AdvancedFormDemo = () => {
  const t = useTranslationLocal();
  const form = useRgoForm<AdvancedFormData>({
    t,
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    schema: advancedSchema,
  });

  const onSubmit = (data: AdvancedFormData) => {
    console.log("Advanced form submitted:", data);
    alert("Account created successfully!");
  };

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Create Account
      </Typography>

      <RgoForm form={form} onSubmit={onSubmit}>
        <RgoFormSection>
          <RgoLabelBox label="Username" required>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder="Choose a username"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </RgoLabelBox>

          <RgoLabelBox label="Password" required>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="password"
                  fullWidth
                  placeholder="Enter a strong password"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </RgoLabelBox>

          <RgoLabelBox label="Confirm Password" required>
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="password"
                  fullWidth
                  placeholder="Confirm your password"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </RgoLabelBox>

          <Controller
            name="terms"
            control={form.control}
            render={({ field, fieldState }) => (
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      inputRef={field.ref}
                    />
                  }
                  label="I accept the terms and conditions *"
                  sx={{ alignItems: "center" }}
                />
                {fieldState.error && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: "block", ml: 4 }}>
                    {fieldState.error.message}
                  </Typography>
                )}
              </Box>
            )}
          />
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button color="primary" variant="contained" type="submit">
              Submit
            </Button>
          </CardActions>
        </RgoFormSection>
      </RgoForm>
    </Paper>
  );
};

export function UseFormWithAdvancedValidationDemo() {
  return (
    <Box sx={{ p: 3 }}>
      <RgoLabelBox label="Advanced RgoForm with Complex Validation">
        <AdvancedFormDemo />
      </RgoLabelBox>
    </Box>
  );
}

export const UseFormWithAdvancedValidationDemoCode = `
import { RgoLabelBox, RgoForm, useRgoForm, type RgoTranslationFn } from "@vireocodedev/starter-ui";
import { Box, Checkbox, FormControlLabel, Paper, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

// Advanced form with complex validation
type AdvancedFormData = {
  username: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const advancedSchema = (_t: RgoTranslationFn) =>
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
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/, "Password must contain uppercase, lowercase, and number"),
      confirmPassword: z.string(),
      terms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

const AdvancedFormDemo = () => {
  const form = useRgoForm<AdvancedFormData>({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    schema: advancedSchema,
  });

  const onSubmit = (data: AdvancedFormData) => {
    console.log("Advanced form submitted:", data);
    alert("Account created successfully!");
  };

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Create Account
      </Typography>

      <RgoForm form={form} onSubmit={onSubmit} submitButtonText="common.createAccount" hideCancelButton>
        <RgoLabelBox label="Username" required>
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Choose a username"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </RgoLabelBox>

        <RgoLabelBox label="Password" required>
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="password"
                fullWidth
                placeholder="Enter a strong password"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </RgoLabelBox>

        <RgoLabelBox label="Confirm Password" required>
          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="password"
                fullWidth
                placeholder="Confirm your password"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </RgoLabelBox>

        <Controller
          name="terms"
          control={form.control}
          render={({ field, fieldState }) => (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    inputRef={field.ref}
                  />
                }
                label="I accept the terms and conditions *"
                sx={{ alignItems: "center" }}
              />
              {fieldState.error && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: "block", ml: 4 }}>
                  {fieldState.error.message}
                </Typography>
              )}
            </Box>
          )}
        />
      </RgoForm>
    </Paper>
  );
};

export function UseFormWithAdvancedValidationDemo() {
  return (
    <Box sx={{ p: 3 }}>
      <RgoLabelBox label="Advanced RgoForm with Complex Validation">
        <AdvancedFormDemo />
      </RgoLabelBox>
    </Box>
  );
}`;
