import { Stack } from "@mui/material";
import { useVireoForm, type VireoFormOwnerState } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import React from "react";

type BorderedFormRootProps = React.ComponentPropsWithoutRef<"form"> & {
  ownerState?: VireoFormOwnerState;
};

const BorderedFormRoot = React.forwardRef<HTMLFormElement, BorderedFormRootProps>(function BorderedFormRoot(
  { ownerState, ...props },
  ref,
) {
  return <form {...props} ref={ref} data-owner-dirty={ownerState?.dirty} />;
});

export default function CustomizedSlotsExample() {
  const form = useVireoForm({
    defaultValues: { projectName: "Northstar" },
    onSubmit: () => undefined,
  });

  return (
    <VireoStorybookProvider>
      <form.Form
        slots={{ root: BorderedFormRoot }}
        slotProps={{
          root: ownerState => ({
            "data-dirty": ownerState.dirty,
            sx: {
              border: 1,
              borderColor: ownerState.dirty ? "warning.main" : "divider",
              borderRadius: 1,
              p: 3,
            },
          }),
        }}
      >
        <Stack spacing={2}>
          <form.Field name="projectName">{field => <field.TextField label="Project name" />}</form.Field>
          <form.SubmitButton variant="contained">Save project</form.SubmitButton>
        </Stack>
      </form.Form>
    </VireoStorybookProvider>
  );
}
