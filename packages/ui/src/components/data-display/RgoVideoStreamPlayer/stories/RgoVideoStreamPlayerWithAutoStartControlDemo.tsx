import { RgoVideoStreamPlayer } from "@/components/data-display/RgoVideoStreamPlayer/RgoVideoStreamPlayer";
import { Box, Stack, Typography } from "@mui/material";

const DEMO_STREAM_URL = "wss://88.198.9.184:3334/app/testing-stream";

export const RgoVideoStreamPlayerWithAutoStartControlDemo = () => {
  return (
    <Stack spacing={3}>
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
        <div>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Auto-start enabled (default):
          </Typography>
          <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width="300px" height="200px" autoStart={true} />
        </div>

        <div>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Auto-start disabled:
          </Typography>
          <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width="300px" height="200px" autoStart={false} />
        </div>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
        When auto-start is disabled, users need to manually click play to start the video stream.
      </Typography>
    </Stack>
  );
};

export const RgoVideoStreamPlayerWithAutoStartControlDemoCode = `import { RgoVideoStreamPlayer } from "@/components/data-display/RgoVideoStreamPlayer/RgoVideoStreamPlayer";
import { Box, Stack, Typography } from "@mui/material";

const DEMO_STREAM_URL = "wss://88.198.9.184:3334/app/testing-stream";

export const RgoVideoStreamPlayerWithAutoStartControlDemo = () => {
  return (
    <Stack spacing={3}>
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
        <div>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Auto-start enabled (default):
          </Typography>
          <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width="300px" height="200px" autoStart={true} />
        </div>

        <div>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Auto-start disabled:
          </Typography>
          <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width="300px" height="200px" autoStart={false} />
        </div>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        When auto-start is disabled, users need to manually click play to start the video stream.
      </Typography>
    </Stack>
  );
};`;
