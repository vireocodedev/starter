import { RgoQueryErrorBoundary } from "@/components/feedback/RgoQueryErrorLoaderSuspense/components/RgoQueryErrorBoundary/RgoQueryErrorBoundary";
import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { type FallbackProps } from "react-error-boundary";

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

function CustomFallbackComponent({ resetErrorBoundary }: FallbackProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="200px"
      p={4}
      bgcolor="background.paper"
      border="2px dashed"
      borderColor="warning.main"
      borderRadius={2}
    >
      <Typography variant="h6" color="warning.main" gutterBottom>
        🚧 Custom Error Handler
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" paragraph>
        This is a custom fallback component that shows when an error occurs.
      </Typography>
      <Button variant="outlined" color="warning" onClick={resetErrorBoundary}>
        Try Again
      </Button>
    </Box>
  );
}

export function RgoQueryErrorBoundaryWithFallbackDemo() {
  return (
    <Box p={2} bgcolor="background.default" minHeight="400px">
      <Typography variant="h5" gutterBottom>
        Error Boundary Demo
      </Typography>
      <Typography component="p" variant="body2" color="text.secondary">
        Click the "Throw Error" button to see the error boundary in action. The "Retry" button will reset the component
        state.
      </Typography>
      <RgoQueryErrorBoundary FallbackComponent={CustomFallbackComponent}>
        <Demo />
      </RgoQueryErrorBoundary>
    </Box>
  );
}

export const RgoQueryErrorBoundaryWithFallbackDemoCode = `
import { RgoQueryErrorBoundary } from "@vireocodedev/starter-ui";
import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { type FallbackProps } from "react-error-boundary";

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

function CustomFallbackComponent({ resetErrorBoundary }: FallbackProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="200px"
      p={4}
      bgcolor="background.paper"
      border="2px dashed"
      borderColor="warning.main"
      borderRadius={2}
    >
      <Typography variant="h6" color="warning.main" gutterBottom>
        🚧 Custom Error Handler
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" paragraph>
        This is a custom fallback component that shows when an error occurs.
      </Typography>
      <Button variant="outlined" color="warning" onClick={resetErrorBoundary}>
        Try Again
      </Button>
    </Box>
  );
}

export function RgoQueryErrorBoundaryWithFallbackDemo() {
  return (
    <Box p={2} bgcolor="background.default" minHeight="400px">
      <Typography variant="h5" gutterBottom>
        Error Boundary Demo
      </Typography>
      <Typography component="p" variant="body2" color="text.secondary">
        Click the "Throw Error" button to see the error boundary in action. The "Retry" button will reset the component
        state.
      </Typography>
      <RgoQueryErrorBoundary FallbackComponent={CustomFallbackComponent}>
        <Demo />
      </RgoQueryErrorBoundary>
    </Box>
  );
}`;
