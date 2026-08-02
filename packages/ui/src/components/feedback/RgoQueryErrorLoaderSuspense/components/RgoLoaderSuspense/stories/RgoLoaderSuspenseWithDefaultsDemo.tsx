import { RgoLoaderSuspense } from "@/components/feedback/RgoQueryErrorLoaderSuspense/components/RgoLoaderSuspense/RgoLoaderSuspense";
import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";

// Simulate a component that might suspend
const createLazyContent = () =>
  React.lazy(
    () =>
      new Promise<{ default: React.ComponentType }>(resolve => {
        setTimeout(() => {
          resolve({
            default: () => (
              <Box p={3}>
                <Typography variant="h5" gutterBottom>
                  Content Loaded!
                </Typography>
                <Typography variant="body1">
                  This content was loaded after a simulated delay to demonstrate the suspense loading state.
                </Typography>
              </Box>
            ),
          });
        }, 2000);
      }),
  );

export function RgoLoaderSuspenseWithDefaultsDemo() {
  const [resetKey, setResetKey] = useState(0);
  const [LazyContent, setLazyContent] = useState(() => createLazyContent());

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    setLazyContent(createLazyContent());
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button variant="contained" onClick={handleReset}>
          Reset & Show Loading Again
        </Button>
      </Box>
      <Box sx={{ height: "400px", border: "1px dashed #ccc", borderRadius: 1 }}>
        <RgoLoaderSuspense key={resetKey}>
          <LazyContent />
        </RgoLoaderSuspense>
      </Box>
    </Box>
  );
}

export const RgoLoaderSuspenseWithDefaultsDemoCode = `
import { RgoLoaderSuspense } from "@vireocodedev/starter-ui";
import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";

// Simulate a component that might suspend
const createLazyContent = () =>
  React.lazy(
    () =>
      new Promise<{ default: React.ComponentType }>(resolve => {
        setTimeout(() => {
          resolve({
            default: () => (
              <Box p={3}>
                <Typography variant="h5" gutterBottom>
                  Content Loaded!
                </Typography>
                <Typography variant="body1">
                  This content was loaded after a simulated delay to demonstrate the suspense loading state.
                </Typography>
              </Box>
            ),
          });
        }, 2000);
      }),
  );

export function RgoLoaderSuspenseWithDefaultsDemo() {
  const [resetKey, setResetKey] = useState(0);
  const [LazyContent, setLazyContent] = useState(() => createLazyContent());

  const handleReset = () => {
    setResetKey(prev => prev + 1);
    setLazyContent(createLazyContent());
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button variant="contained" onClick={handleReset}>
          Reset & Show Loading Again
        </Button>
      </Box>
      <Box sx={{ height: "400px", border: "1px dashed #ccc", borderRadius: 1 }}>
        <RgoLoaderSuspense key={resetKey}>
          <LazyContent />
        </RgoLoaderSuspense>
      </Box>
    </Box>
  );
}`;
