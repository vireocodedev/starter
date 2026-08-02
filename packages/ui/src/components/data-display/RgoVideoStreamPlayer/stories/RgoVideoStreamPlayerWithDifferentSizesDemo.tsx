import { RgoVideoStreamPlayer } from "@/components/data-display/RgoVideoStreamPlayer/RgoVideoStreamPlayer";
import { Stack, Typography } from "@mui/material";

const DEMO_STREAM_URL = "wss://88.198.9.184:3334/app/testing-stream";

export const RgoVideoStreamPlayerWithDifferentSizesDemo = () => {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Small (320x180):
        </Typography>
        <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width={320} height={180} />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Medium (640x360):
        </Typography>
        <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width="640px" height="360px" />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Large - Full width with fixed height (100% x 300px):
        </Typography>
        <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width="100%" height="300px" />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          HD Resolution (1280x720):
        </Typography>
        <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width={1280} height={720} />
      </div>
    </Stack>
  );
};

export const RgoVideoStreamPlayerWithDifferentSizesDemoCode = `import { RgoVideoStreamPlayer } from "@/components/data-display/RgoVideoStreamPlayer/RgoVideoStreamPlayer";
import { Stack, Typography } from "@mui/material";

const DEMO_STREAM_URL = "wss://88.198.9.184:3334/app/testing-stream";

export const RgoVideoStreamPlayerWithDifferentSizesDemo = () => {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Small (320x180):
        </Typography>
        <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width={320} height={180} />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Medium (640x360):
        </Typography>
        <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width="640px" height="360px" />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Large - Full width with fixed height (100% x 300px):
        </Typography>
        <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width="100%" height="300px" />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          HD Resolution (1280x720):
        </Typography>
        <RgoVideoStreamPlayer url={DEMO_STREAM_URL} width={1280} height={720} />
      </div>
    </Stack>
  );
};`;
