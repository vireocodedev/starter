import {
  UseIconsWithDefaultPropsDemo,
  UseIconsWithDefaultPropsDemoCode,
} from "@/hooks/useRgoIcons/stories/UseRgoIconsWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "A custom React hook that accesses the icon map provided by `RgoIconsProvider`. Icons are registered by the consumer application through TypeScript interface augmentation of `RgoIconRegistry`, enabling type-safe icon access throughout the app.",
  stories: createStories(STORY_NAMES),
  setup: {
    steps: [
      {
        title: "Augment the RgoIconRegistry interface",
        code: `// In your consumer app's type declarations
declare module "@vireocodedev/starter-ui" {
  interface RgoIconRegistry {
    home: typeof HomeIcon;
    settings: typeof SettingsIcon;
  }
}`,
      },
      {
        title: "Provide icons via RgoIconsProvider",
        code: `<RgoIconsProvider icons={{ home: HomeIcon, settings: SettingsIcon }}>
  <App />
</RgoIconsProvider>`,
      },
    ],
  },
  usage: UseIconsWithDefaultPropsDemoCode,
});

const meta: Meta = {
  title: "Hooks/useRgoIcons",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <UseIconsWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: {
        story: "Accesses the icon map from RgoIconsProvider and renders all registered icons.",
      },
      source: {
        code: UseIconsWithDefaultPropsDemoCode,
      },
    },
  },
};
