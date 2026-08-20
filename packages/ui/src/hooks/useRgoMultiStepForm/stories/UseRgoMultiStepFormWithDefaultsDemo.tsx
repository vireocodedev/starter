import { RgoLabelBox } from "@/core/public";
import { RgoForm } from "@/components/inputs/RgoForm/RgoForm";
import { RgoFormSection } from "@/components/layout/RgoFormSection/RgoFormSection";
import { type UseFormReturn } from "@/hooks/useRgoForm/useRgoForm";
import { type StepConfigFn, useRgoMultiStepForm } from "@/hooks/useRgoMultiStepForm/useRgoMultiStepForm";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { type RgoTranslationFn } from "@/setup/config/RgoLocale";
import { Box, Paper, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

// Form data type
type UserRegistrationData = {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  email: string;

  // Step 2: Address
  street: string;
  city: string;
  zipCode: string;
  country: string;

  // Step 3: Preferences
  newsletter: boolean;
  notifications: boolean;
  theme: string;
};

// Schema for validation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const registrationSchema = (_t: RgoTranslationFn) =>
  z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
    country: z.string().min(1, "Country is required"),
    newsletter: z.boolean(),
    notifications: z.boolean(),
    theme: z.string().min(1, "Please select a theme"),
  });

// Step Components
const PersonalInfoStep: React.FC<{ form: UseFormReturn<UserRegistrationData> }> = ({ form }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography variant="h6" gutterBottom>
      Personal Information
    </Typography>

    <RgoLabelBox label="First Name" required>
      <Controller
        name="firstName"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            placeholder="Enter your first name"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </RgoLabelBox>

    <RgoLabelBox label="Last Name" required>
      <Controller
        name="lastName"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            placeholder="Enter your last name"
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
  </Box>
);

const AddressStep: React.FC<{ form: UseFormReturn<UserRegistrationData> }> = ({ form }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography variant="h6" gutterBottom>
      Address Information
    </Typography>

    <RgoLabelBox label="Street Address" required>
      <Controller
        name="street"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            placeholder="Enter your street address"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </RgoLabelBox>

    <Box sx={{ display: "flex", gap: 2 }}>
      <Box sx={{ flex: 1 }}>
        <RgoLabelBox label="City" required>
          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="City"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </RgoLabelBox>
      </Box>

      <Box sx={{ flex: 1 }}>
        <RgoLabelBox label="ZIP Code" required>
          <Controller
            name="zipCode"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="ZIP Code"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </RgoLabelBox>
      </Box>
    </Box>

    <RgoLabelBox label="Country" required>
      <Controller
        name="country"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            fullWidth
            SelectProps={{ native: true }}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          >
            <option value="">Select a country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
          </TextField>
        )}
      />
    </RgoLabelBox>
  </Box>
);

const PreferencesStep: React.FC<{ form: UseFormReturn<UserRegistrationData> }> = ({ form }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography variant="h6" gutterBottom>
      Preferences
    </Typography>

    <RgoLabelBox label="Theme" required>
      <Controller
        name="theme"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            fullWidth
            SelectProps={{ native: true }}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          >
            <option value="">Select a theme</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </TextField>
        )}
      />
    </RgoLabelBox>

    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Controller
        name="newsletter"
        control={form.control}
        render={({ field }) => (
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={field.value} onChange={field.onChange} />
            <Typography>Subscribe to newsletter</Typography>
          </label>
        )}
      />

      <Controller
        name="notifications"
        control={form.control}
        render={({ field }) => (
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={field.value} onChange={field.onChange} />
            <Typography>Enable push notifications</Typography>
          </label>
        )}
      />
    </Box>
  </Box>
);

// Steps configuration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const steps: StepConfigFn<UserRegistrationData> = (_t: RgoTranslationFn) => [
  {
    component: PersonalInfoStep,
    fields: ["firstName", "lastName", "email"],
    label: "Personal Info",
  },
  {
    component: AddressStep,
    fields: ["street", "city", "zipCode", "country"],
    label: "Address",
  },
  {
    component: PreferencesStep,
    fields: ["theme", "newsletter", "notifications"],
    label: "Preferences",
  },
];

export function UseMultiStepFormWithDefaultsDemo() {
  const t = useTranslationLocal();
  const multiStepForm = useRgoMultiStepForm<UserRegistrationData>({
    t,
    steps,
    schema: registrationSchema,
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      street: "",
      city: "",
      zipCode: "",
      country: "",
      newsletter: false,
      notifications: false,
      theme: "",
    },
  });

  const { form, CurrentStepComponent, StepperComponent, NavigationButtonsComponent } = multiStepForm;

  const onSubmit = (data: UserRegistrationData) => {
    console.log("Multi-step form submitted:", data);
    alert(`Registration completed successfully!\n\nData: ${JSON.stringify(data, null, 2)}`);
  };

  return (
    <Paper elevation={1} sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, textAlign: "center" }}>
        User Registration
      </Typography>

      <Box sx={{ position: "relative", mb: 4 }}>
        <StepperComponent />
      </Box>

      <RgoForm form={form} onSubmit={onSubmit}>
        <RgoFormSection label="Current step">
          <Box sx={{ minHeight: 400, display: "flex", flexDirection: "column" }}>
            <Box sx={{ flex: 1, mb: 3 }}>
              <CurrentStepComponent />
            </Box>

            <NavigationButtonsComponent />
          </Box>
        </RgoFormSection>
      </RgoForm>
    </Paper>
  );
}

export const UseMultiStepFormWithDefaultsDemoCode = `
import { useRgoMultiStepForm } from "@vireocodedev/starter-ui";
import { RgoLabelBox, RgoForm } from "@vireocodedev/starter-ui";
import { Box, Paper, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import z from "zod";

type UserRegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  newsletter: boolean;
  notifications: boolean;
  theme: string;
};

const registrationSchema = (t) =>
  z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
    country: z.string().min(1, "Country is required"),
    newsletter: z.boolean(),
    notifications: z.boolean(),
    theme: z.string().min(1, "Please select a theme"),
  });

const PersonalInfoStep = ({ form }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography variant="h6" gutterBottom>Personal Information</Typography>
    
    <RgoLabelBox label="First Name" required>
      <Controller
        name="firstName"
        control={form.control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            placeholder="Enter your first name"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </RgoLabelBox>
    {/* ... other fields */}
  </Box>
);

const steps = (t) => [
  {
    component: PersonalInfoStep,
    fields: ["firstName", "lastName", "email"],
    label: "Personal Info",
  },
  // ... other steps
];

export function MyMultiStepForm() {
  const multiStepForm = useRgoMultiStepForm({
    steps,
    schema: registrationSchema,
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      // ... other initial values
    },
  });

  const { form, CurrentStepComponent, StepperComponent, NavigationButtonsComponent } = multiStepForm;

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
  };

  return (
    <Paper elevation={1} sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <StepperComponent />
      
      <RgoForm form={form} onSubmit={onSubmit} hideCancelButton hideSubmitButton>
        <CurrentStepComponent />
        <NavigationButtonsComponent />
      </RgoForm>
    </Paper>
  );
}`;
