import { RgoLoader, type RgoLoaderProps } from "@/components/feedback/RgoLoader/RgoLoader";
import { Box, Stack, Typography } from "@mui/material";

export function RgoLoaderWithLoaderSizeDemo(props: RgoLoaderProps = {}) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="body1" gutterBottom>
          Small loader (1.5rem)
        </Typography>
        <RgoLoader {...props} loaderSize="1.5rem" />
      </Box>
      <Box>
        <Typography variant="body1" gutterBottom>
          Medium loader (3rem, default)
        </Typography>
        <RgoLoader {...props} />
      </Box>
      <Box>
        <Typography variant="body1" gutterBottom>
          Large loader (4.5rem)
        </Typography>
        <RgoLoader {...props} loaderSize="4.5rem" />
      </Box>
    </Stack>
  );
}

export const RgoLoaderWithLoaderSizeDemoCode = `
import { RgoLoader, type RgoLoaderProps } from "@vireocodedev/starter-ui";
import { Box, Stack, Typography } from "@mui/material";

export function RgoLoaderWithLoaderSizeDemo(props: RgoLoaderProps = {}) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="body1" gutterBottom>
          Small loader (1.5rem)
        </Typography>
        <RgoLoader {...props} loaderSize="1.5rem" />
      </Box>
      <Box>
        <Typography variant="body1" gutterBottom>
          Medium loader (3rem, default)
        </Typography>
        <RgoLoader {...props} />
      </Box>
      <Box>
        <Typography variant="body1" gutterBottom>
          Large loader (4.5rem)
        </Typography>
        <RgoLoader {...props} loaderSize="4.5rem" />
      </Box>
    </Stack>
  );
}`;
