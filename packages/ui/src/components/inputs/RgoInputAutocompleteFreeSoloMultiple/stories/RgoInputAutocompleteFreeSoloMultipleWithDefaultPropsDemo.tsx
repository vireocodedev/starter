import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoInputAutocompleteFreeSoloMultiple } from "@/components/inputs/RgoInputAutocompleteFreeSoloMultiple/RgoInputAutocompleteFreeSoloMultiple";
import { Stack, Typography } from "@mui/material";
import React from "react";

type Tag = { id: number | null; name: string };

const PRESET_TAGS: Tag[] = [
  { id: 1, name: "urgent" },
  { id: 2, name: "review" },
  { id: 3, name: "blocked" },
  { id: 4, name: "wontfix" },
];

export function RgoInputAutocompleteFreeSoloMultipleWithDefaultPropsDemo() {
  const [value, setValue] = React.useState<string[] | null>(null);

  return (
    <Stack spacing={2} sx={{ width: 480 }}>
      <RgoLabelBox label="Tags (pick or type new ones)">
        <RgoInputAutocompleteFreeSoloMultiple<Tag>
          value={value ?? []}
          onChange={setValue}
          options={PRESET_TAGS}
          getOptionLabel={opt => opt.name}
          isOptionEqualToValue={(a, b) => a.name === b.name}
          getStringValue={opt => opt.name}
          createSyntheticOption={text => ({ id: null, name: text })}
          addLabel={input => (
            <Typography component="span">
              Add new tag <strong>“{input}”</strong>
            </Typography>
          )}
        />
      </RgoLabelBox>

      <Typography variant="caption" color="text.secondary">
        Current value: {value && value.length > 0 ? value.join(", ") : "(none)"}
      </Typography>
    </Stack>
  );
}

export const RgoInputAutocompleteFreeSoloMultipleWithDefaultPropsDemoCode = `
import { RgoInputAutocompleteFreeSoloMultiple, RgoLabelBox } from "@vireocodedev/starter-ui";
import React from "react";

type Tag = { id: number | null; name: string };

const PRESET_TAGS: Tag[] = [
  { id: 1, name: "urgent" },
  { id: 2, name: "review" },
];

function TagPicker() {
  const [value, setValue] = React.useState<string[] | null>(null);

  return (
    <RgoLabelBox label="Tags (pick or type new ones)">
      <RgoInputAutocompleteFreeSoloMultiple<Tag>
        value={value}
        onChange={setValue}
        options={PRESET_TAGS}
        getOptionLabel={opt => opt.name}
        isOptionEqualToValue={(a, b) => a.name === b.name}
        getStringValue={opt => opt.name}
        createSyntheticOption={text => ({ id: null, name: text })}
        addLabel={input => <>Add new tag <strong>"{input}"</strong></>}
      />
    </RgoLabelBox>
  );
}`;
