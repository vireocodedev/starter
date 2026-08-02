import { RgoStopwatch } from "@/components/data-display/RgoStopwatch/RgoStopwatch";
import { Box, Stack, Typography } from "@mui/material";

export const RgoStopwatchWithVariationsDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Default (starting now)
        </Typography>
        <RgoStopwatch />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 30 seconds ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 30000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 5 minutes ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 300000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 1.5 hours ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 5400000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 3 days ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 3 * 24 * 60 * 60 * 1000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 2 weeks ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 14 * 24 * 60 * 60 * 1000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 3 months ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 90 * 24 * 60 * 60 * 1000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 2 years ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 2 * 365 * 24 * 60 * 60 * 1000} />
      </Box>
    </Stack>
  );
};

export const RgoStopwatchWithVariationsDemoCode = `import { RgoStopwatch } from "@/components/data-display/RgoStopwatch/RgoStopwatch";
import { Box, Stack, Typography } from "@mui/material";

export const RgoStopwatchWithVariationsDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Default (starting now)
        </Typography>
        <RgoStopwatch />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 30 seconds ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 30000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 5 minutes ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 300000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 1.5 hours ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 5400000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 3 days ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 3 * 24 * 60 * 60 * 1000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 2 weeks ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 14 * 24 * 60 * 60 * 1000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 3 months ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 90 * 24 * 60 * 60 * 1000} />
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Started 2 years ago
        </Typography>
        <RgoStopwatch startDate={Date.now() - 2 * 365 * 24 * 60 * 60 * 1000} />
      </Box>
    </Stack>
  );
};`;
