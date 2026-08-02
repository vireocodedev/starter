import { RgoInputAutocompleteFreeSolo } from "@/components/inputs/RgoInputAutocompleteFreeSolo/RgoInputAutocompleteFreeSolo";
import {
  RgoInputAutocompleteFreeSoloWithDefaultPropsDemo,
  RgoInputAutocompleteFreeSoloWithDefaultPropsDemoCode,
} from "@/components/inputs/RgoInputAutocompleteFreeSolo/stories/RgoInputAutocompleteFreeSoloWithDefaultPropsDemo";
import { createStories, createStorybookDescription } from "@/utils/storybookutils";
import type { Meta, StoryObj } from "@storybook/react-vite";

const STORY_NAMES = ["With default props"];

const DESCRIPTION = createStorybookDescription({
  badge: "STABLE",
  description:
    "Free-solo single-select autocomplete built on top of [RgoInputAutocomplete](?path=/docs/components-inputs-rgoinputautocomplete--docs). When the search text doesn't match an existing option, an extra menu entry is rendered (`addLabel(searchText)`) that lets the user persist arbitrary text. Synthetic options are produced through `createSyntheticOption` so callers can keep working with their own option shape.",
  generics: [{ name: "TOption", description: "Shape of the option objects." }],
  stories: createStories(STORY_NAMES),
  usage: RgoInputAutocompleteFreeSoloWithDefaultPropsDemoCode,
});

const meta: Meta<typeof RgoInputAutocompleteFreeSolo> = {
  title: "Components/Inputs/RgoInputAutocompleteFreeSolo",
  component: RgoInputAutocompleteFreeSolo,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: { component: DESCRIPTION },
    },
  },
  argTypes: {
    value: { control: false, description: "Current string value (or `null` when empty)." },
    onChange: { control: false, description: "`(value: string | null) => void`." },
    options: { control: false, description: "Predefined `TOption[]`." },
    getOptionLabel: { control: false, description: "`(option: TOption) => string`." },
    isOptionEqualToValue: { control: false, description: "`(option: TOption, value: TOption) => boolean`." },
    getStringValue: { control: false, description: "`(option: TOption) => string | null` — value persisted via `onChange`." },
    createSyntheticOption: { control: false, description: "`(text: string) => TOption` — used when the current value doesn't match any option." },
    addLabel: { control: false, description: "`(input: string) => ReactNode` — label of the extra \"add\" menu entry." },
    addIcon: {
      control: false,
      description:
        "Optional leading icon for the \"add\" entry. Pass any `ReactNode` (e.g. `<RgoIcon icon=\"plus\" />`); not provided by default since the icon registry is consumer-augmented.",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDefaultProps: Story = {
  name: "With default props",
  render: () => <RgoInputAutocompleteFreeSoloWithDefaultPropsDemo />,
  parameters: {
    docs: {
      description: { story: "Pick from a small preset list of tags, or type a new tag and add it via the \"Add new tag\" menu entry." },
      source: { code: RgoInputAutocompleteFreeSoloWithDefaultPropsDemoCode },
    },
  },
};
