import { RgoQueryErrorBoundary } from "@/components/feedback/RgoQueryErrorLoaderSuspense/components/RgoQueryErrorBoundary/RgoQueryErrorBoundary";
import { Box, Button, Typography } from "@mui/material";
import React from "react";

function Demo() {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error("This is a demo error for testing the error boundary");
  }

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Normal Content
      </Typography>
      <Typography component="p" variant="body1">
        This content renders normally until you click the button below to trigger an error.
      </Typography>
      <Button variant="contained" color="error" onClick={() => setShouldThrow(true)}>
        Throw Error
      </Button>
    </Box>
  );
}

export function RgoQueryErrorBoundaryWithDefaultsDemo() {
  return (
    <Box p={2} bgcolor="background.default" minHeight="400px">
      <Typography variant="h5" gutterBottom>
        Error Boundary Demo
      </Typography>
      <Typography component="p" variant="body2" color="text.secondary">
        Click the "Throw Error" button to see the error boundary in action. The "Retry" button will reset the component
        state.
      </Typography>
      <RgoQueryErrorBoundary>
        <Demo />
      </RgoQueryErrorBoundary>
    </Box>
  );
}

export const RgoQueryErrorBoundaryWithDefaultsDemoCode = `
import { RgoQueryErrorBoundary } from "@vireocodedev/starter-ui";
import { Box, Button, Typography } from "@mui/material";
import React from "react";

function Demo() {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error("This is a demo error for testing the error boundary");
  }

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Normal Content
      </Typography>
      <Typography component="p" variant="body1">
        This content renders normally until you click the button below to trigger an error.
      </Typography>
      <Button variant="contained" color="error" onClick={() => setShouldThrow(true)}>
        Throw Error
      </Button>
    </Box>
  );
}

export function RgoQueryErrorBoundaryWithDefaultsDemo() {
  return (
    <Box p={2} bgcolor="background.default" minHeight="400px">
      <Typography variant="h5" gutterBottom>
        Error Boundary Demo
      </Typography>
      <Typography component="p" variant="body2" color="text.secondary">
        Click the "Throw Error" button to see the error boundary in action. The "Retry" button will reset the component
        state.
      </Typography>
      <RgoQueryErrorBoundary>
        <Demo />
      </RgoQueryErrorBoundary>
    </Box>
  );
}`;
