import { Avatar, MenuItem, Stack, type MenuItemProps } from "@mui/material";
import { VireoLabelBox } from "@vireocodedev/starter-ui";
import { useVireoForm } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

const environments = [
  { id: 1, color: "#22c55e", label: "Development" },
  { id: 2, color: "#f59e0b", label: "Staging" },
  { id: 3, color: "#ef4444", label: "Production" },
];

const DenseOption = React.forwardRef<HTMLLIElement, MenuItemProps>(function DenseOption(props, ref) {
  return <MenuItem {...props} ref={ref} dense />;
});

export default function CustomizedSlotsExample() {
  const form = useVireoForm({ defaultValues: { environmentId: 2 as number | null } });

  return (
    <VireoStorybookProvider>
      <form.Form>
        <form.Section label="Environment" variant="plain" layout="stack">
          <form.Field name="environmentId">
            {field => (
              <VireoLabelBox label="Environment">
                <field.SelectField
                  label={null}
                  options={environments}
                  getOptionValue={environment => environment.id}
                  renderOption={environment => (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ bgcolor: environment.color, height: 18, width: 18 }} />
                      <span>{environment.label}</span>
                    </Stack>
                  )}
                  slots={{ option: DenseOption }}
                  slotProps={{
                    root: ownerState => ({
                      "data-dirty": ownerState.dirty,
                      sx: {
                        position: "relative",
                        "&::before": {
                          borderInlineStart: "3px solid",
                          borderColor: ownerState.dirty ? "warning.main" : "primary.main",
                          borderRadius: 1,
                          content: '""',
                          insetBlock: 4,
                          insetInlineStart: -10,
                          position: "absolute",
                        },
                      },
                    }),
                    clearButton: { color: "warning", size: "small" },
                    option: { divider: true },
                    select: { SelectDisplayProps: { "aria-label": "Environment" } },
                  }}
                />
              </VireoLabelBox>
            )}
          </form.Field>
          <form.Actions>
            <form.ResetButton variant="outlined">Reset selection</form.ResetButton>
          </form.Actions>
        </form.Section>
      </form.Form>
    </VireoStorybookProvider>
  );
}
