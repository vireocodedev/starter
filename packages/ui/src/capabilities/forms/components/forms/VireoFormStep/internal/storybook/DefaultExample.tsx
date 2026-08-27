import { Typography } from "@mui/material";
import { useVireoMultiStepForm } from "@vireocodedev/ui/forms";

export default function DefaultExample() {
  const form = useVireoMultiStepForm({
    defaultValues: {},
    steps: [
      { id: "account", label: "Account" },
      { id: "review", label: "Review" },
    ],
  });

  return (
    <form.Form>
      <form.MultiStep>
        <form.Step id="account">
          <Typography>Account step content</Typography>
        </form.Step>
        <form.Step id="review">
          <Typography>Review step content</Typography>
        </form.Step>
      </form.MultiStep>
    </form.Form>
  );
}
