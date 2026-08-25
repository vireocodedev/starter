import DefaultExample from "@/capabilities/application-navigation/components/navigation/VireoMobileBottomNavigation/internal/storybook/DefaultExample";
import defaultExampleSource from "@/capabilities/application-navigation/components/navigation/VireoMobileBottomNavigation/internal/storybook/DefaultExample.tsx?raw";
import UnmatchedRouteExample from "@/capabilities/application-navigation/components/navigation/VireoMobileBottomNavigation/internal/storybook/UnmatchedRouteExample";
import unmatchedRouteExampleSource from "@/capabilities/application-navigation/components/navigation/VireoMobileBottomNavigation/internal/storybook/UnmatchedRouteExample.tsx?raw";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { VireoMobileBottomNavigation } from "./VireoMobileBottomNavigation";

function createSourceParameters(code: string) {
  return {
    docs: {
      source: {
        code,
        language: "tsx",
        type: "code" as const,
      },
    },
  };
}

const meta = {
  title: "TypeScript/UI/Capabilities/Application Navigation/VireoMobileBottomNavigation",
  component: VireoMobileBottomNavigation,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Renders a controlled set of labelled primary destinations along the bottom edge of a mobile application shell.

### Why it exists

Mobile Vireo applications repeatedly need the same accessible quick-navigation anatomy, selected state, surface boundary, sizing, and device safe-area handling. Vireo owns that presentation while route matching and navigation execution remain application concerns. Use it for three to five primary destinations; use a menu or another application-owned flow for secondary and overflowing destinations.`,
      },
    },
  },
} satisfies Meta<typeof VireoMobileBottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { items: [] },
  render: () => <DefaultExample />,
  parameters: createSourceParameters(defaultExampleSource),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("button", { name: "Overview" });
    await userEvent.click(overview);
    await expect(overview).toHaveAttribute("aria-current", "page");
  },
};

export const UnmatchedRoute: Story = {
  args: { items: [] },
  render: () => <UnmatchedRouteExample />,
  parameters: {
    ...createSourceParameters(unmatchedRouteExampleSource),
    docs: {
      ...createSourceParameters(unmatchedRouteExampleSource).docs,
      description: {
        story:
          "Leaves every destination unselected for routes outside the quick-navigation set and keeps disabled destinations unavailable.",
      },
    },
  },
};
