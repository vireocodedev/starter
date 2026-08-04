import {
    UseMultiStepFormWithDefaultsDemo,
    UseMultiStepFormWithDefaultsDemoCode,
} from "@/hooks/useRgoMultiStepForm/stories/UseRgoMultiStepFormWithDefaultsDemo";
import type { Meta, StoryObj } from "@storybook/react-vite";

const USE_MULTI_STEP_FORM_DESCRIPTION = `
![WIP](https://img.shields.io/badge/WIP-yellow?style=flat-square)

A custom React hook that provides a powerful way to create multi-step forms with validation, navigation, and progress tracking. It combines form state management with step-by-step user interface patterns, making it easy to build complex registration flows, wizards, and guided processes.

## Features

- **Step-by-step Navigation**: Easy navigation between form steps with validation
- **Progress Tracking**: Visual stepper component showing current progress
- **Field Validation**: Per-step validation with error highlighting
- **Flexible Architecture**: Configurable steps with custom components
- **Type Safety**: Full TypeScript support with generic form data types
- **Internationalization**: Built-in translation support for step labels and validation messages

## Stories

- [With default props](#with-default-props)

## Usage

\`\`\`tsx
${UseMultiStepFormWithDefaultsDemoCode}
\`\`\`

## API

### useRgoMultiStepForm

\`\`\`tsx
const multiStepForm = useRgoMultiStepForm({
  steps: stepConfigFunction,
  schema: zodSchemaFunction,
  initialValues: defaultFormValues,
});
\`\`\`

#### Parameters

- **steps**: \`StepConfigFn<FormData>\` - Function that returns array of step configurations
- **schema**: \`UseFormSchema<FormData>\` - Zod schema function for form validation
- **initialValues**: \`DefaultValues<FormData>\` - Initial values for all form fields

#### Returns

- **form**: \`UseFormReturn<FormData>\` - React Hook Form instance
- **CurrentStepComponent**: \`React.ComponentType\` - Component for rendering current step
- **StepperComponent**: \`React.ComponentType\` - Component for rendering progress stepper
- **NavigationButtonsComponent**: \`React.ComponentType\` - Component for navigation buttons
- **currentStepIndex**: \`number\` - Current active step index
- **setCurrentStepIndex**: \`(index: number) => void\` - Function to change current step
- **goToNextStep**: \`() => Promise<void>\` - Function to go to next step (with validation)
- **goToPreviousStep**: \`() => void\` - Function to go to previous step
- **isFirstStep**: \`boolean\` - Whether currently on first step
- **isLastStep**: \`boolean\` - Whether currently on last step

### Step Configuration

\`\`\`tsx
type Step<FormData> = {
  component: React.FC<{ form: UseFormReturn<FormData> }>;
  fields: Path<FormData>[];
  label: string;
};

type StepConfigFn<FormData> = (t: RgoTranslationFn) => Step<FormData>[];
\`\`\`

#### Step Properties

- **component**: React component that receives the form instance as prop
- **fields**: Array of form field paths that belong to this step (used for validation)
- **label**: Display label for the step in the stepper component

## Examples

### Basic Multi-Step Form

\`\`\`tsx
import { useRgoMultiStepForm } from "@vireocodedev/starter-ui";

type FormData = {
  name: string;
  email: string;
  address: string;
};

const steps = (t) => [
  {
    component: PersonalInfoStep,
    fields: ["name", "email"],
    label: t("steps.personal"),
  },
  {
    component: AddressStep,
    fields: ["address"],
    label: t("steps.address"),
  },
];

const schema = (t) => z.object({
  name: z.string().min(1, t("validation.required")),
  email: z.string().email(t("validation.email")),
  address: z.string().min(1, t("validation.required")),
});

function MyForm() {
  const { form, CurrentStepComponent, StepperComponent, NavigationButtonsComponent } = 
    useRgoMultiStepForm({
      steps,
      schema,
      initialValues: { name: "", email: "", address: "" },
    });

  return (
    <div>
      <StepperComponent />
      <RgoForm form={form} onSubmit={handleSubmit}>
        <CurrentStepComponent />
        <NavigationButtonsComponent />
      </RgoForm>
    </div>
  );
}
\`\`\`

### Custom Step Component

\`\`\`tsx
const PersonalInfoStep = ({ form }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography variant="h6">Personal Information</Typography>
    
    <Controller
      name="name"
      control={form.control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label="Name"
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
    
    <Controller
      name="email"
      control={form.control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label="Email"
          type="email"
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  </Box>
);
\`\`\`
`;

const meta: Meta = {
  title: "Hooks/useRgoMultiStepForm",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: USE_MULTI_STEP_FORM_DESCRIPTION,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <UseMultiStepFormWithDefaultsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Multi-step form with step navigation, per-step validation, and final submission.",
      },
      source: {
        code: UseMultiStepFormWithDefaultsDemoCode,
      },
    },
  },
};
