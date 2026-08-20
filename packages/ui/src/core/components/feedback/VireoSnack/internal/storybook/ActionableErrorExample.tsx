import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Button, Box } from "@mui/material";
import React from "react";
import { VireoSnack } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

export default function ActionableErrorExample() {
  const [retryRequested, setRetryRequested] = React.useState(false);

  return (
    <VireoStorybookProvider>
      <Box width={440} maxWidth="100%">
        <VireoSnack
          variant="error"
          message={retryRequested ? "Retry requested" : "The report could not be uploaded. Check the connection."}
          startAdornment={<WarningAmberRoundedIcon fontSize="small" />}
          endAdornment={
            <Button color="inherit" size="small" onClick={() => setRetryRequested(true)}>
              Retry upload
            </Button>
          }
        />
      </Box>
    </VireoStorybookProvider>
  );
}
