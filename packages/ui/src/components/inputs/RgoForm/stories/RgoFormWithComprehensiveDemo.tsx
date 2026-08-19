import { RgoLabelBox } from "@/core/public";
import { RgoForm, type RgoFormProps } from "@/components/inputs/RgoForm/RgoForm";
import { RgoInputDate } from "@/components/inputs/RgoInputDate/RgoInputDate";
import { RgoInputNumber } from "@/components/inputs/RgoInputNumber/RgoInputNumber";
import { RgoInputSelect } from "@/components/inputs/RgoInputSelect/RgoInputSelect";
import { RgoInputSwitch } from "@/components/inputs/RgoInputSwitch/RgoInputSwitch";
import { RgoInputText } from "@/components/inputs/RgoInputText/RgoInputText";
import { RgoInputToggleButtonGroup } from "@/components/inputs/RgoInputToggleButtonGroup/RgoInputToggleButtonGroup";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { RgoFormSectionGrid } from "@/components/layout/RgoFormSectionGrid/RgoFormSectionGrid";
import { useRgoForm } from "@/hooks/useRgoForm/useRgoForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { Alert, Button, Grid2 as Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { Controller } from "react-hook-form";
import z from "zod";

// Form data types
enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

const roleOptions: UserRole[] = [UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR];

const DepartmentOption = z.enum(["Engineering", "Marketing", "Sales", "Human Resources", "Finance"]);

type DepartmentOption = z.infer<typeof DepartmentOption>;

// Form schema with Zod validation
const userFormSchema = () =>
  z.object({
    firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
    lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    age: z.number().min(18, "Must be at least 18 years old").max(120, "Age must be realistic"),
    role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Please select a valid role" }) }),
    department: z
      .object({
        id: z.number(),
        name: z.string(),
      })
      .optional(),
    startDate: z.number(),
    isActive: z.boolean(),
    notifications: z.boolean(),
  });

type FormData = z.infer<ReturnType<typeof userFormSchema>>;

type RgoFormWithComprehensiveDemoProps = Partial<Omit<RgoFormProps<FormData>, "form" | "onSubmit" | "children">>;

export function RgoFormWithComprehensiveDemo(props: RgoFormWithComprehensiveDemoProps = {}) {
  const [submittedData, setSubmittedData] = React.useState<FormData | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const t = useTranslationLocal();
  const form = useRgoForm<FormData>({
    t,
    schema: userFormSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: 25,
      role: UserRole.USER,
      department: undefined,
      startDate: Date.now(),
      isActive: true,
      notifications: false,
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      setSubmitError(null);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmittedData(data);
      console.log("Form submitted:", data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      setSubmitError("Failed to submit form. Please try again.");
    }
  };

  const handleReset = () => {
    form.reset();
    setSubmittedData(null);
    setSubmitError(null);
  };

  return (
    <Stack spacing={4}>
      <Typography variant="h6" component="h2">
        User Registration Form
      </Typography>

      <RgoForm {...props} form={form} onSubmit={handleSubmit}>
        <RgoFormSection label="Personal Information">
          <RgoFormSectionGrid>
            <Grid size={6}>
              <RgoLabelBox label="First Name" required>
                <Controller
                  name="firstName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <RgoInputText {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              </RgoLabelBox>
            </Grid>

            <Grid size={6}>
              <RgoLabelBox label="Last Name" required>
                <Controller
                  name="lastName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <RgoInputText {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              </RgoLabelBox>
            </Grid>

            <Grid size={6}>
              <RgoLabelBox label="Email Address" required>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <RgoInputText {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              </RgoLabelBox>
            </Grid>

            <Grid size={6}>
              <RgoLabelBox label="Age" required>
                <Controller
                  name="age"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <RgoInputNumber
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      min={18}
                      max={120}
                    />
                  )}
                />
              </RgoLabelBox>
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>

        <RgoFormSection label="Work Information">
          <RgoFormSectionGrid>
            <Grid size={6}>
              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Role" required>
                    <RgoInputToggleButtonGroup
                      {...field}
                      options={roleOptions}
                      renderOption={option => option.toUpperCase()}
                      renderKey={option => option}
                      disableClearable
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="department"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Department">
                    <RgoInputSelect
                      {...field}
                      options={DepartmentOption.options}
                      renderOption={option => option}
                      renderValue={option => option}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="startDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Start Date" required>
                    <RgoInputDate {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  </RgoLabelBox>
                )}
              />
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>

        <RgoFormSection label="Account Settings">
          <RgoFormSectionGrid>
            <Grid size={12}>
              <Controller
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <RgoLabelBox label="Account Status">
                    <RgoInputSwitch
                      {...field}
                      label={field.value ? "Active" : "Inactive"}
                      helperText="Enable or disable the user account"
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="notifications"
                control={form.control}
                render={({ field }) => (
                  <RgoLabelBox label="Email Notifications">
                    <RgoInputSwitch
                      {...field}
                      label={field.value ? "Enabled" : "Disabled"}
                      helperText="Receive email notifications for important updates"
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>

        <RgoFormSection>
          <RgoFormSectionGrid>
            <Grid size={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button type="button" variant="outlined" onClick={handleReset} disabled={form.formState.isSubmitting}>
                Reset Form
              </Button>
              <Button type="submit" variant="contained" disabled={form.submitDisabled}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>
      </RgoForm>

      {/* Display Results */}
      {submitError && (
        <Alert severity="error" onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {submittedData && (
        <Alert severity="success" onClose={() => setSubmittedData(null)}>
          <Typography variant="subtitle2" gutterBottom>
            Form submitted successfully!
          </Typography>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-wrap", mt: 1 }}>
            {JSON.stringify(submittedData, null, 2)}
          </Typography>
        </Alert>
      )}

      {/* Form State Debug Info */}
      <Stack spacing={2}>
        <Typography variant="subtitle2">Form State Debug:</Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            fontSize: "0.75rem",
            backgroundColor: "grey.100",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
          }}
        >
          {JSON.stringify(
            {
              isDirty: form.formState.isDirty,
              isValid: form.formState.isValid,
              isSubmitting: form.formState.isSubmitting,
              isSubmitted: form.formState.isSubmitted,
              submitDisabled: form.submitDisabled,
              errors: form.formState.errors,
            },
            null,
            2,
          )}
        </Typography>
      </Stack>
    </Stack>
  );
}

export const RgoFormWithComprehensiveDemoCode = `
import {
  RgoLabelBox,
  RgoForm,
  type RgoFormProps,
  RgoInputDate,
  RgoInputToggleButtonGroup,
  RgoInputNumber,
  RgoInputSelect,
  RgoInputText,
  RgoInputSwitch,
  RgoFormSection,
  RgoFormSectionGrid,
  useRgoForm,
} from "@vireocodedev/starter-ui";
import { Alert, Button, Grid2 as Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { Controller } from "react-hook-form";
import z from "zod";

// Form data types
enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

const roleOptions: UserRole[] = [UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR];

const DepartmentOption = z.enum(["Engineering", "Marketing", "Sales", "Human Resources", "Finance"]);

type DepartmentOption = z.infer<typeof DepartmentOption>;

// Form schema with Zod validation
const userFormSchema = () =>
  z.object({
    firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
    lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    age: z.number().min(18, "Must be at least 18 years old").max(120, "Age must be realistic"),
    role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Please select a valid role" }) }),
    department: z
      .object({
        id: z.number(),
        name: z.string(),
      })
      .optional(),
    startDate: z.number(),
    isActive: z.boolean(),
    notifications: z.boolean(),
  });

type FormData = z.infer<ReturnType<typeof userFormSchema>>;

type RgoFormWithComprehensiveDemoProps = Partial<Omit<RgoFormProps<FormData>, "form" | "onSubmit" | "children">>;

export function RgoFormWithComprehensiveDemo(props: RgoFormWithComprehensiveDemoProps = {}) {
  const [submittedData, setSubmittedData] = React.useState<FormData | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const form = useRgoForm<FormData>({
    schema: userFormSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: 25,
      role: UserRole.USER,
      department: undefined,
      startDate: Date.now(),
      isActive: true,
      notifications: false,
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      setSubmitError(null);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmittedData(data);
      console.log("Form submitted:", data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      setSubmitError("Failed to submit form. Please try again.");
    }
  };

  const handleReset = () => {
    form.reset();
    setSubmittedData(null);
    setSubmitError(null);
  };

  return (
    <Stack spacing={4}>
      <Typography variant="h6" component="h2">
        User Registration Form
      </Typography>

      <RgoForm {...props} form={form} onSubmit={handleSubmit}>
        <RgoFormSection label="Personal Information">
          <RgoFormSectionGrid>
            <Grid size={6}>
              <RgoLabelBox label="First Name" required>
                <Controller
                  name="firstName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <RgoInputText {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              </RgoLabelBox>
            </Grid>

            <Grid size={6}>
              <RgoLabelBox label="Last Name" required>
                <Controller
                  name="lastName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <RgoInputText {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              </RgoLabelBox>
            </Grid>

            <Grid size={6}>
              <RgoLabelBox label="Email Address" required>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <RgoInputText {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              </RgoLabelBox>
            </Grid>

            <Grid size={6}>
              <RgoLabelBox label="Age" required>
                <Controller
                  name="age"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <RgoInputNumber
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      min={18}
                      max={120}
                    />
                  )}
                />
              </RgoLabelBox>
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>

        <RgoFormSection label="Work Information">
          <RgoFormSectionGrid>
            <Grid size={6}>
              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Role" required>
                    <RgoInputToggleButtonGroup
                      {...field}
                      options={roleOptions}
                      renderOption={option => option.toUpperCase()}
                      renderKey={option => option}
                      disableClearable
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={6}>
              <Controller
                name="department"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Department">
                    <RgoInputSelect
                      {...field}
                      options={DepartmentOption.options}
                      renderOption={option => option}
                      renderValue={option => option}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="startDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RgoLabelBox label="Start Date" required>
                    <RgoInputDate {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  </RgoLabelBox>
                )}
              />
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>

        <RgoFormSection label="Account Settings">
          <RgoFormSectionGrid>
            <Grid size={12}>
              <Controller
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <RgoLabelBox label="Account Status">
                    <RgoInputSwitch
                      {...field}
                      label={field.value ? "Active" : "Inactive"}
                      helperText="Enable or disable the user account"
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="notifications"
                control={form.control}
                render={({ field }) => (
                  <RgoLabelBox label="Email Notifications">
                    <RgoInputSwitch
                      {...field}
                      label={field.value ? "Enabled" : "Disabled"}
                      helperText="Receive email notifications for important updates"
                    />
                  </RgoLabelBox>
                )}
              />
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>

        <RgoFormSection>
          <RgoFormSectionGrid>
            <Grid size={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button type="button" variant="outlined" onClick={handleReset} disabled={form.formState.isSubmitting}>
                Reset Form
              </Button>
              <Button type="submit" variant="contained" disabled={form.submitDisabled}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Grid>
          </RgoFormSectionGrid>
        </RgoFormSection>
      </RgoForm>

      {/* Display Results */}
      {submitError && (
        <Alert severity="error" onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {submittedData && (
        <Alert severity="success" onClose={() => setSubmittedData(null)}>
          <Typography variant="subtitle2" gutterBottom>
            Form submitted successfully!
          </Typography>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-wrap", mt: 1 }}>
            {JSON.stringify(submittedData, null, 2)}
          </Typography>
        </Alert>
      )}

      {/* Form State Debug Info */}
      <Stack spacing={2}>
        <Typography variant="subtitle2">Form State Debug:</Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            fontSize: "0.75rem",
            backgroundColor: "grey.100",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
          }}
        >
          {JSON.stringify(
            {
              isDirty: form.formState.isDirty,
              isValid: form.formState.isValid,
              isSubmitting: form.formState.isSubmitting,
              isSubmitted: form.formState.isSubmitted,
              submitDisabled: form.submitDisabled,
              errors: form.formState.errors,
            },
            null,
            2,
          )}
        </Typography>
      </Stack>
    </Stack>
  );
}`;
