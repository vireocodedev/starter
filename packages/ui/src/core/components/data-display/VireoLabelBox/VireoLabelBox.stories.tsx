import { Box, OutlinedInput, ThemeProvider, createTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { VireoLabelBox } from "./VireoLabelBox";
import { VIREO_LABEL_BOX_NAME } from "./VireoLabelBox.identity";

const MOBILE_PREVIEW_WIDTH = 360;
const mobileHelperText = "Shown on customer-facing invoices";
const accountInput = <OutlinedInput aria-label="Account name" placeholder="Acme Ltd." size="small" fullWidth />;

const meta = {
  title: "Core/Data Display/VireoLabelBox",
  component: VireoLabelBox,
  tags: ["autodocs"],
  args: {
    label: "Account name",
    children: accountInput,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Provides consistent external label, helper-text, required-indicator, and content anatomy around controls or grouped content.\n\n### Why it exists\n\nComposite controls and grouped content cannot always use a control's built-in MUI label, which otherwise leads consumers to recreate spacing, required indicators, and helper-text placement. This component supplies that shared external-label contract. Prefer the underlying control's native label when it already provides the correct semantics and layout.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    helperText: { control: "text" },
    children: { control: false },
    color: { control: false },
    fontWeight: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoLabelBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: {
    helperText: mobileHelperText,
  },
};

export const MobileWidthWithHelperText: Story = {
  args: {
    helperText: mobileHelperText,
  },
  decorators: [
    Story => (
      <Box width={MOBILE_PREVIEW_WIDTH} maxWidth="100%">
        <Story />
      </Box>
    ),
  ],
};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const RowDirection: Story = {
  args: {
    direction: "row",
    helperText: "Optional",
  },
};

export const MobileWidthRowWithHelperText: Story = {
  args: {
    direction: "row",
    helperText: mobileHelperText,
  },
  decorators: [
    Story => (
      <Box width={MOBILE_PREVIEW_WIDTH} maxWidth="100%">
        <Story />
      </Box>
    ),
  ],
};

export const ThemeAwareColor: Story = {
  args: {
    color: theme => theme.palette.warning.main,
    required: true,
  },
};

export const CustomizedSlots: Story = {
  args: {
    helperText: "Customized anatomy",
    slots: { root: "section", label: "strong", helperText: "small" },
    slotProps: {
      root: {
        "aria-label": "Customized account field",
        sx: { border: 1, borderColor: "primary.main", borderRadius: 2, p: 2 },
      },
      label: { sx: { letterSpacing: "0.08em", textTransform: "uppercase" } },
      helperText: { sx: { color: "primary.light" } },
    },
  },
};

const customizedTheme = createTheme({
  components: {
    [VIREO_LABEL_BOX_NAME]: {
      defaultProps: {
        fontWeight: 700,
        required: true,
      },
      styleOverrides: {
        root: {
          padding: 16,
          border: "1px solid #7c3aed",
          borderRadius: 12,
          backgroundColor: "#171225",
        },
        label: {
          color: "#c4b5fd",
        },
        helperText: {
          color: "#a78bfa",
        },
        content: {
          paddingTop: 4,
        },
      },
    },
  },
});

export const ThemeCustomization: Story = {
  args: {
    helperText: "Theme defaults and per-slot overrides",
  },
  decorators: [
    Story => (
      <ThemeProvider theme={customizedTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
