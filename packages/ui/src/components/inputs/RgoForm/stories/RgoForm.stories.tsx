import { RgoForm } from "@/components/inputs/RgoForm/RgoForm";
import {
  RgoFormWithAsyncSubmissionDemo,
  RgoFormWithAsyncSubmissionDemoCode,
} from "@/components/inputs/RgoForm/stories/RgoFormWithAsyncSubmissionDemo";
import {
  RgoFormWithComprehensiveDemo,
  RgoFormWithComprehensiveDemoCode,
} from "@/components/inputs/RgoForm/stories/RgoFormWithComprehensiveDemo";
import {
  RgoFormWithDefaultPropsDemo,
  RgoFormWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoForm/stories/RgoFormWithDefaultPropsDemo";
import {
  RgoFormWithValidationDemo,
  RgoFormWithValidationDemoCode,
} from "@/components/inputs/RgoForm/stories/RgoFormWithValidationDemo";
import { type MdBadge } from "@/utils/markdownutils";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORYBOOK_COMPONENT = RgoForm;
const STORYBOOK_TITLE = "Components/Inputs/RgoForm";
const STORYBOOK_BADGE: keyof typeof MdBadge = "STABLE";
const STORYBOOK_USAGE_CODE = RgoFormWithDefaultPropsDemoCode;
const FORM_DESCRIPTION =
  "Form wrapper component that integrates with React Hook Form and Zod validation using the custom useRgoForm hook.";
const STORY_NAMES = ["With default props", "With validation", "With async submission", "With comprehensive demo"];

const meta: Meta<typeof STORYBOOK_COMPONENT> = {
  title: STORYBOOK_TITLE,
  component: STORYBOOK_COMPONENT,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: createStorybookDescription({
          badge: STORYBOOK_BADGE,
          description: FORM_DESCRIPTION,
          stories: createStories(STORY_NAMES),
          usage: STORYBOOK_USAGE_CODE,
        }),
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    form: {
      // @ts-ignore
      type: { required: true },
      control: false,
      description: "The form object returned by useRgoForm hook containing form state and methods",
      table: {
        type: { summary: "UseFormReturn<T>" },
      },
    },
    onSubmit: {
      // @ts-ignore
      type: { required: true },
      control: false,
      description: "Function called when form is submitted with valid data",
      table: {
        type: { summary: "(request: T) => void | Promise<void>" },
      },
    },
    children: {
      // @ts-ignore
      type: { required: true },
      control: false,
      description: "Form content including input fields and controls",
      table: {
        type: { summary: "React.ReactNode" },
      },
    },
    rgoSlotProps: {
      control: false,
      description: "Props to customize internal components",
      table: {
        type: { summary: "{ form }" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoFormWithDefaultPropsDemo />,
  parameters: {
    docs: {
      source: {
        code: RgoFormWithDefaultPropsDemoCode,
      },
      description: {
        story: "Basic contact form with simple validation using Zod schema and React Hook Form integration.",
      },
    },
  },
};

export const WithValidation: Story = {
  name: "With validation",
  render: () => <RgoFormWithValidationDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Form with comprehensive validation rules including pattern matching, cross-field validation, and detailed error messages.",
      },
      source: {
        code: RgoFormWithValidationDemoCode,
      },
    },
  },
};

export const WithAsyncSubmission: Story = {
  name: "With async submission",
  render: () => <RgoFormWithAsyncSubmissionDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Form with async submission handling, loading states, error recovery, and automatic retry functionality. Simulates network requests with potential failures.",
      },
      source: {
        code: RgoFormWithAsyncSubmissionDemoCode,
      },
    },
  },
};

export const WithComprehensiveDemo: Story = {
  name: "With comprehensive demo",
  render: () => <RgoFormWithComprehensiveDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Complete form showcase demonstrating all input components working together with complex validation, multiple sections, and advanced form state management.",
      },
      source: {
        code: RgoFormWithComprehensiveDemoCode,
      },
    },
  },
};
