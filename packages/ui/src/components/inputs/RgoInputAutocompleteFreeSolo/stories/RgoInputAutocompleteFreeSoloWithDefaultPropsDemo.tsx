import { RgoLabelBox } from "@/core/public";
import { RgoInputAutocompleteFreeSolo } from "@/components/inputs/RgoInputAutocompleteFreeSolo/RgoInputAutocompleteFreeSolo";
import { Stack, Typography } from "@mui/material";
import React from "react";

type Tag = { id: number | null; name: string };

const PRESET_TAGS: Tag[] = [
  { id: 1, name: "urgent" },
  { id: 2, name: "review" },
  { id: 3, name: "blocked" },
  { id: 4, name: "wontfix" },
];

export function RgoInputAutocompleteFreeSoloWithDefaultPropsDemo() {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <Stack spacing={2} sx={{ width: 360 }}>
      <RgoLabelBox label="Tag (pick or type a new one)">
        <RgoInputAutocompleteFreeSolo<Tag>
          value={value}
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
        Current value: {value ?? "(none)"}
      </Typography>
    </Stack>
  );
}

export const RgoInputAutocompleteFreeSoloWithDefaultPropsDemoCode = `
import { RgoInputAutocompleteFreeSolo, RgoLabelBox } from "@vireocodedev/starter-ui";
import React from "react";

type Tag = { id: number | null; name: string };

const PRESET_TAGS: Tag[] = [
  { id: 1, name: "urgent" },
  { id: 2, name: "review" },
];

function TagPicker() {
  const [value, setValue] = React.useState<string | null>(null);

  return (
    <RgoLabelBox label="Tag (pick or type a new one)">
      <RgoInputAutocompleteFreeSolo<Tag>
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
