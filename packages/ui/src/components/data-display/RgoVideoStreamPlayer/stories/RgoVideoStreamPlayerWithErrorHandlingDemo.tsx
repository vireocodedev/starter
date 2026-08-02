import { RgoVideoStreamPlayer } from "@/components/data-display/RgoVideoStreamPlayer/RgoVideoStreamPlayer";
import { Stack, Typography } from "@mui/material";

export const RgoVideoStreamPlayerWithErrorHandlingDemo = () => {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Invalid stream URL (non-existent server):
        </Typography>
        <RgoVideoStreamPlayer url="wss://invalid.stream.url/nonexistent" width="400px" height="225px" />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Malformed stream URL:
        </Typography>
        <RgoVideoStreamPlayer url="not-a-valid-url" width="400px" height="225px" />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Empty stream URL:
        </Typography>
        <RgoVideoStreamPlayer url="" width="400px" height="225px" />
      </div>

      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
        When a stream cannot be loaded, the player displays an error message with a retry button. This allows users to
        attempt reconnection or try a different stream.
      </Typography>
    </Stack>
  );
};

export const RgoVideoStreamPlayerWithErrorHandlingDemoCode = `import { RgoVideoStreamPlayer } from "@/components/data-display/RgoVideoStreamPlayer/RgoVideoStreamPlayer";
import { Stack, Typography } from "@mui/material";

export const RgoVideoStreamPlayerWithErrorHandlingDemo = () => {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Invalid stream URL (non-existent server):
        </Typography>
        <RgoVideoStreamPlayer url="wss://invalid.stream.url/nonexistent" width="400px" height="225px" />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Malformed stream URL:
        </Typography>
        <RgoVideoStreamPlayer url="not-a-valid-url" width="400px" height="225px" />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Empty stream URL:
        </Typography>
        <RgoVideoStreamPlayer url="" width="400px" height="225px" />
      </div>

      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        When a stream cannot be loaded, the player displays an error message with a retry button.
        This allows users to attempt reconnection or try a different stream.
      </Typography>
    </Stack>
  );
};`;
