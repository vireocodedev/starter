import { RgoLoader, type RgoLoaderProps } from "@/components/feedback/RgoLoader/RgoLoader";
import { Box, Stack, Typography } from "@mui/material";

export function RgoLoaderWithContainerSizeDemo(props: RgoLoaderProps = {}) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="body1" gutterBottom>
          Default container (width 100%, height auto)
        </Typography>
        <Box border="1px dashed #ccc" borderRadius={1} p={2}>
          <RgoLoader {...props} />
        </Box>
      </Box>
      <Box>
        <Typography variant="body1" gutterBottom>
          Compact Container (width 200px, height 100px)
        </Typography>
        <Box border="1px dashed #ccc" borderRadius={1} p={2} width="fit-content">
          <RgoLoader {...props} containerWidth="200px" containerHeight="100px" />
        </Box>
      </Box>
      <Box>
        <Typography variant="body1" gutterBottom>
          Large Container (width 600px, height 200px)
        </Typography>
        <Box border="1px dashed #ccc" borderRadius={1} p={2} width="fit-content">
          <RgoLoader {...props} containerWidth="600px" containerHeight="200px" />
        </Box>
      </Box>
    </Stack>
  );
}

export const RgoLoaderWithContainerSizeDemoCode = `
import { RgoLoader, type RgoLoaderProps } from "@vireocodedev/starter-ui";
import { Box, Stack, Typography } from "@mui/material";

export function RgoLoaderWithContainerSizeDemo(props: RgoLoaderProps = {}) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="body1" gutterBottom>
          Default container (width 100%, height auto)
        </Typography>
        <Box border="1px dashed #ccc" borderRadius={1} p={2}>
          <RgoLoader {...props} />
        </Box>
      </Box>
      <Box>
        <Typography variant="body1" gutterBottom>
          Compact Container (width 200px, height 100px)
        </Typography>
        <Box border="1px dashed #ccc" borderRadius={1} p={2} width="fit-content">
          <RgoLoader {...props} containerWidth="200px" containerHeight="100px" />
        </Box>
      </Box>
      <Box>
        <Typography variant="body1" gutterBottom>
          Large Container (width 600px, height 200px)
        </Typography>
        <Box border="1px dashed #ccc" borderRadius={1} p={2} width="fit-content">
          <RgoLoader {...props} containerWidth="600px" containerHeight="200px" />
        </Box>
      </Box>
    </Stack>
  );
}`;
