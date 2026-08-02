import { RgoQueryErrorLoaderSuspense } from "@/components/feedback/RgoQueryErrorLoaderSuspense/RgoQueryErrorLoaderSuspense";
import { Box, Button, Stack } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

// A workaround to avoid the query being cached across renders
let renderKey = Date.now() + 100 * 1000;
let currentKey = renderKey - 1;

// 1. RgoQueryErrorLoaderSuspense configuration
function MyRgoQueryErrorLoaderSuspense({ children }: React.PropsWithChildren) {
  return <RgoQueryErrorLoaderSuspense>{children}</RgoQueryErrorLoaderSuspense>;
}

// 2. Demo component which uses suspense query
function ApiDemo({
  apiState,
  onSuccess,
}: {
  apiState: "success" | "error" | null;
  onSuccess: (response: string) => void;
}) {
  useSuspenseQuery({
    queryKey: ["demo", apiState, renderKey],
    queryFn: async () => {
      const delay = apiState === null || currentKey === renderKey ? 0 : 2000;

      // Simulate API call
      const response = await new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          if (apiState === "error" && currentKey !== renderKey) {
            currentKey = renderKey;
            reject(new Error("Response error"));
          } else resolve("Response success");
        }, delay);
      });

      if (apiState !== null && currentKey !== renderKey) onSuccess(response);
      currentKey = renderKey;
      return response;
    },
  });

  return null;
}

// 3. Main component which demonstrates RgoQueryErrorLoaderSuspense usage
export function RgoQueryErrorLoaderSuspenseWithDefaultsDemo() {
  const [apiState, setApiState] = React.useState<"success" | "error" | null>(null);

  const onChangeApiState = (demo: "success" | "error" | null) => {
    setApiState(null);
    setTimeout(() => {
      renderKey += 1;
      setApiState(demo);
    }, 1);
  };

  const onSuccess = (response: string) => {
    onChangeApiState(null);
    setTimeout(() => alert(response), 100);
  };

  return (
    <MyRgoQueryErrorLoaderSuspense>
      <Box display="flex" alignItems="center" justifyContent="center" p={4.75}>
        <Stack spacing={2} alignItems="center" direction="row">
          <Button variant="contained" color="success" onClick={() => onChangeApiState("success")}>
            Simulate Successful API Call (2s)
          </Button>
          <Button variant="contained" color="error" onClick={() => onChangeApiState("error")}>
            Simulate Failed API Call (2s)
          </Button>
        </Stack>
        <ApiDemo apiState={apiState} onSuccess={onSuccess} />
      </Box>
    </MyRgoQueryErrorLoaderSuspense>
  );
}

export const RgoQueryErrorLoaderSuspenseWithDefaultsDemoCode = `
import { RgoQueryErrorLoaderSuspense } from "@vireocodedev/starter-ui";
import { Box, Button, Stack } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

// A workaround to avoid the query being cached across renders
let renderKey = Date.now() + 100 * 1000;
let currentKey = renderKey - 1;

// 1. RgoQueryErrorLoaderSuspense configuration
function MyRgoQueryErrorLoaderSuspense({ children }: React.PropsWithChildren) {
  return <RgoQueryErrorLoaderSuspense>{children}</RgoQueryErrorLoaderSuspense>;
}

// 2. Demo component which uses suspense query
function ApiDemo({
  apiState,
  onSuccess,
}: {
  apiState: "success" | "error" | null;
  onSuccess: (response: string) => void;
}) {
  useSuspenseQuery({
    queryKey: ["demo", apiState, renderKey],
    queryFn: async () => {
      const delay = apiState === null || currentKey === renderKey ? 0 : 2000;

      // Simulate API call
      const response = await new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          if (apiState === "error" && currentKey !== renderKey) {
            currentKey = renderKey;
            reject(new Error("Response error"));
          } else resolve("Response success");
        }, delay);
      });

      if (apiState !== null && currentKey !== renderKey) onSuccess(response);
      currentKey = renderKey;
      return response;
    },
  });

  return null;
}

// 3. Main component which demonstrates RgoQueryErrorLoaderSuspense usage
export function RgoQueryErrorLoaderSuspenseWithDefaultsDemo() {
  const [apiState, setApiState] = React.useState<"success" | "error" | null>(null);

  const onChangeApiState = (demo: "success" | "error" | null) => {
    setApiState(null);
    setTimeout(() => {
      renderKey += 1;
      setApiState(demo);
    }, 1);
  };

  const onSuccess = (response: string) => {
    onChangeApiState(null);
    setTimeout(() => alert(response), 100);
  };

  return (
    <MyRgoQueryErrorLoaderSuspense>
      <Box display="flex" alignItems="center" justifyContent="center" p={4.75}>
        <Stack spacing={2} alignItems="center" direction="row">
          <Button variant="contained" color="success" onClick={() => onChangeApiState("success")}>
            Simulate Successful API Call (2s)
          </Button>
          <Button variant="contained" color="error" onClick={() => onChangeApiState("error")}>
            Simulate Failed API Call (2s)
          </Button>
        </Stack>
        <ApiDemo apiState={apiState} onSuccess={onSuccess} />
      </Box>
    </MyRgoQueryErrorLoaderSuspense>
  );
}`;
