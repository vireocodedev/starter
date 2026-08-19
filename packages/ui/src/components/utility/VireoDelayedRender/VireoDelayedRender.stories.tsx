import { Button, Card, CardContent, Stack, ThemeProvider, Typography, createTheme } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { VireoDelayedRender } from "./VireoDelayedRender";
import { VIREO_DELAYED_RENDER_NAME } from "./VireoDelayedRender.identity";

type RestartableDelayProps = React.ComponentPropsWithoutRef<typeof VireoDelayedRender>;

const delayedContent = (
  <Card variant="outlined">
    <CardContent>
      <Typography fontWeight={700}>Fallback content mounted</Typography>
      <Typography color="text.secondary" variant="body2">
        Fast operations can finish before this content enters the DOM.
      </Typography>
    </CardContent>
  </Card>
);

function RestartableDelay(props: RestartableDelayProps) {
  const { delay = 200 } = props;
  const [attempt, setAttempt] = React.useState(0);

  return (
    <Stack alignItems="flex-start" gap={2}>
      <Button variant="contained" onClick={() => setAttempt(current => current + 1)}>
        Restart delay
      </Button>
      <Typography color="text.secondary" variant="body2">
        The content below mounts {delay} ms after each restart.
      </Typography>
      <VireoDelayedRender {...props} key={attempt} />
    </Stack>
  );
}

const meta = {
  title: "Components/Utility/VireoDelayedRender",
  component: VireoDelayedRender,
  tags: ["autodocs"],
  args: {
    children: delayedContent,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Defers mounting transient fallback content until an operation outlasts a short buffer.\n\n### Why it exists\n\nImmediately rendering a skeleton or loader can produce a distracting flash when an operation completes quickly. This component applies one consistent delay and cleanup lifecycle so fallback content appears only when it remains useful. Use it for transient loading feedback, not for intentionally staged content or entrance animation.",
      },
    },
  },
  argTypes: {
    children: { control: false },
    slots: { control: false },
    slotProps: { control: false },
    classes: { control: false },
  },
} satisfies Meta<typeof VireoDelayedRender>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Immediate: Story = {
  args: {
    delay: 0,
  },
};

export const Restartable: Story = {
  args: {
    delay: 1200,
  },
  render: ({ ref, ...args }) => {
    void ref;
    return <RestartableDelay {...args} />;
  },
};

export const MultipleChildren: Story = {
  args: {
    children: (
      <>
        <Typography fontWeight={700}>First layout participant</Typography>
        <Typography color="text.secondary">Second layout participant</Typography>
      </>
    ),
  },
  decorators: [
    Story => (
      <Stack gap={1}>
        <Story />
      </Stack>
    ),
  ],
};

export const CustomizedSlot: Story = {
  args: {
    slots: { root: "section" },
    slotProps: {
      root: ownerState => ({
        "aria-label": "Customized delayed content",
        "data-delay": ownerState.delay,
        sx: { display: "block", border: 1, borderColor: "primary.main", borderRadius: 2, p: 2 },
      }),
    },
  },
};

const customizedTheme = createTheme({
  components: {
    [VIREO_DELAYED_RENDER_NAME]: {
      defaultProps: {
        delay: 400,
      },
      styleOverrides: {
        root: {
          display: "block",
          padding: 16,
          border: "2px dashed #7c3aed",
          borderRadius: 12,
          color: "#6d28d9",
        },
      },
    },
  },
});

export const ThemeCustomization: Story = {
  decorators: [
    Story => (
      <ThemeProvider theme={customizedTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
