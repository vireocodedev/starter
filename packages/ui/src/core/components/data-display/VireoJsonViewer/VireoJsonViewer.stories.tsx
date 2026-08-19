import { CodeRounded } from "@mui/icons-material";
import { Box, ThemeProvider, createTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { VireoJsonViewer } from "./VireoJsonViewer";
import { VIREO_JSON_VIEWER_NAME } from "./VireoJsonViewer.identity";

const diagnosticData = {
  requestId: "req_01J5V8JH28X7K3P1",
  status: "failed",
  durationMs: 842,
  error: {
    code: "UPSTREAM_TIMEOUT",
    message: "The upstream service did not respond in time.",
  },
  attempts: [
    { number: 1, outcome: "timeout" },
    { number: 2, outcome: "timeout" },
  ],
};

const meta = {
  title: "Core/Data Display/VireoJsonViewer",
  component: VireoJsonViewer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `VireoJsonViewer presents arbitrary structured values as readable, copyable JSON.

### Why it exists

Diagnostic payloads, configuration snapshots, and API responses recur across Vireo consumers. This component gives them one resilient representation that safely handles non-JSON values, constrains long output, and provides accessible copy feedback without coupling inspection to a particular dialog or page layout.`,
      },
    },
  },
  args: {
    data: diagnosticData,
    copyLabel: "Copy JSON to clipboard",
    copiedLabel: "JSON copied",
  },
  argTypes: {
    data: { control: "object" },
    maxHeight: { control: "text" },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoJsonViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ConstrainedHeight: Story = {
  args: {
    data: {
      event: "batch.completed",
      records: Array.from({ length: 18 }, (_, index) => ({
        id: `record-${String(index + 1).padStart(2, "0")}`,
        state: index % 4 === 0 ? "warning" : "processed",
        durationMs: 120 + index * 17,
      })),
    },
    maxHeight: 220,
  },
  parameters: {
    docs: {
      description: {
        story: "A bounded content region keeps large payloads scrollable without taking over the surrounding layout.",
      },
    },
  },
};

export const NonJsonValues: Story = {
  render: args => {
    const circular: Record<string, unknown> = { id: "circular-reference" };
    circular.self = circular;

    return (
      <VireoJsonViewer
        {...args}
        data={{
          error: new Error("Connection refused"),
          bigint: 9_007_199_254_740_993n,
          missing: undefined,
          transform: function normalizePayload() {},
          token: Symbol("private"),
          circular,
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Values that native JSON serialization cannot represent remain visible instead of breaking the viewer.",
      },
    },
  },
};

export const CopyInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const copyButton = canvas.getByRole("button", { name: "Copy JSON to clipboard" });

    await userEvent.click(copyButton);
    await expect(canvas.getByRole("button", { name: "JSON copied" })).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: "Activate the copy action to see the temporary accessible success feedback.",
      },
    },
  },
};

export const CustomizedSlots: Story = {
  args: {
    slots: { root: "section", copyIcon: CodeRounded },
    slotProps: {
      root: {
        "aria-label": "Customized diagnostic payload",
        sx: { borderColor: "primary.main", borderWidth: 2, boxShadow: 3 },
      },
      toolbar: { sx: { top: 8, right: 8 } },
      copyButton: { color: "primary" },
      content: { sx: { pt: 5, backgroundColor: "action.hover" } },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Every semantic region can be replaced or styled while the viewer retains its behavior and accessibility.",
      },
    },
  },
};

const customizedTheme = createTheme({
  components: {
    [VIREO_JSON_VIEWER_NAME]: {
      defaultProps: {
        maxHeight: 280,
      },
      styleOverrides: {
        root: {
          borderColor: "#7c3aed",
          borderRadius: 12,
          boxShadow: "0 12px 32px rgb(76 29 149 / 18%)",
        },
        toolbar: {
          padding: 4,
          borderRadius: 8,
          backgroundColor: "rgb(245 243 255 / 90%)",
        },
        copyButton: {
          color: "#6d28d9",
        },
        content: {
          color: "#4c1d95",
          backgroundColor: "#faf5ff",
        },
      },
    },
  },
});

export const ThemeCustomization: Story = {
  decorators: [
    Story => (
      <ThemeProvider theme={customizedTheme}>
        <Box sx={{ maxWidth: 720 }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "Theme defaults and slot-level overrides can establish a product-wide JSON inspection treatment.",
      },
    },
  },
};
