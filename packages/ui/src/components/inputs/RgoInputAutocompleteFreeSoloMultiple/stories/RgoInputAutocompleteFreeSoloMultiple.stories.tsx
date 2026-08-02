import { RgoInputAutocompleteFreeSoloMultiple } from "@/components/inputs/RgoInputAutocompleteFreeSoloMultiple/RgoInputAutocompleteFreeSoloMultiple";
import {
  RgoInputAutocompleteFreeSoloMultipleWithDefaultPropsDemo,
  RgoInputAutocompleteFreeSoloMultipleWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputAutocompleteFreeSoloMultiple/stories/RgoInputAutocompleteFreeSoloMultipleWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "Free-solo multi-select autocomplete built on top of [RgoInputAutocompleteMultiple](?path=/docs/components-inputs-rgoinputautocompletemultiple--docs). Same pattern as [RgoInputAutocompleteFreeSolo](?path=/docs/components-inputs-rgoinputautocompletefreesolo--docs), but the value is a `string[]`. Adding a value that's already present is a no-op; clearing the picker emits `null` (not `[]`).",
  generics: [{ name: "TOption", description: "Shape of the option objects." }],
  stories: createStories(STORY_NAMES),
  usage: RgoInputAutocompleteFreeSoloMultipleWithDefaultPropsDemoCode,
});

const meta: Meta<typeof RgoInputAutocompleteFreeSoloMultiple> = {
  title: "Components/Inputs/RgoInputAutocompleteFreeSoloMultiple",
  component: RgoInputAutocompleteFreeSoloMultiple,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: { component: DESCRIPTION },
    },
  },
  argTypes: {
    value: { control: false, description: "Current `string[]` (or `null` when empty)." },
    onChange: { control: false, description: "`(value: string[] | null) => void` — `null` is emitted when the array becomes empty." },
    options: { control: false, description: "Predefined `TOption[]`." },
    getOptionLabel: { control: false, description: "`(option: TOption) => string`." },
    isOptionEqualToValue: { control: false, description: "`(option: TOption, value: TOption) => boolean`." },
    getStringValue: { control: false, description: "`(option: TOption) => string | null` — value persisted into the array." },
    createSyntheticOption: { control: false, description: "`(text: string) => TOption` — used when a value doesn't match any option." },
    addLabel: { control: false, description: "`(input: string) => ReactNode` — label of the extra \"add\" menu entry." },
    addIcon: {
      control: false,
      description:
        "Optional leading icon for the \"add\" entry. Pass any `ReactNode` (e.g. `<RgoIcon icon=\"plus\" />`).",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoInputAutocompleteFreeSoloMultipleWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: { story: "Pick from a small preset list of tags, or type new tags and add them via the \"Add new tag\" menu entry." },
      source: { code: RgoInputAutocompleteFreeSoloMultipleWithDefaultPropsDemoCode },
    },
  },
};
