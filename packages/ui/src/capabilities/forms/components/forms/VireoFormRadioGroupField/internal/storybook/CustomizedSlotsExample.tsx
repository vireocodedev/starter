import { Radio, type RadioProps } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const environments = [
  { id: "development", label: "Development" },
  { id: "staging", label: "Staging" },
  { id: "production", label: "Production", disabled: true },
] as const;

const CompactRadio = React.forwardRef<HTMLButtonElement, RadioProps>(function CompactRadio(props, ref) {
  return <Radio {...props} ref={ref} size="small" />;
});

export default function CustomizedSlotsExample() {
  const form = useVireoForm({ defaultValues: { environment: "staging" as string | null } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Environment" variant="plain" layout="stack">
          <form.Field name="environment">
            {field => (
              <VireoLabelBox label="Environment">
                <field.RadioGroupField
                  aria-label="Environment"
                  row
                  options={environments}
                  getOptionValue={environment => environment.id}
                  renderOption={environment => environment.label}
                  getOptionDisabled={environment => "disabled" in environment && environment.disabled === true}
                  slots={{ radio: CompactRadio }}
                  slotProps={{
                    root: ownerState => ({
                      "data-dirty": ownerState.dirty,
                      sx: {
                        borderInlineStart: "3px solid",
                        borderColor: ownerState.dirty ? "warning.main" : "primary.main",
                        pl: 1.5,
                      },
                    }),
                    formControlLabel: { sx: { mr: 3 } },
                    optionLabel: { fontWeight: 600 },
                    radio: { color: "warning" },
                  }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.ResetButton variant="outlined">Reset environment</form.ResetButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
