import { RgoVideoStreamPlayer } from "@/components/data-display/RgoVideoStreamPlayer/RgoVideoStreamPlayer";
import { Stack, Typography } from "@mui/material";

const DEMO_STREAM_URL = "wss://88.198.9.184:3334/app/testing-stream";

export const RgoVideoStreamPlayerWithCustomStylesDemo = () => {
  return (
    <Stack spacing={4}>
      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Gradient Border with Shadow:
        </Typography>
        <RgoVideoStreamPlayer
          url={DEMO_STREAM_URL}
          width="600px"
          height="350px"
          sx={{
            padding: "2rem",
            borderRadius: "12px",
            border: "3px solid transparent",
            background:
              "linear-gradient(45deg, #667eea 0%, #764ba2 100%) padding-box, linear-gradient(45deg, #f093fb 0%, #f5576c 50%, #4facfe 100%) border-box",
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
          }}
        />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Dark Theme with Rounded Corners:
        </Typography>
        <RgoVideoStreamPlayer
          url={DEMO_STREAM_URL}
          width="500px"
          height="280px"
          sx={{
            padding: "1.5rem",
            borderRadius: "16px",
            backgroundColor: "#1a1a1a",
            border: "2px solid #333",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          }}
        />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Minimalist with Simple Border:
        </Typography>
        <RgoVideoStreamPlayer
          url={DEMO_STREAM_URL}
          width="400px"
          height="225px"
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        />
      </div>
    </Stack>
  );
};

export const RgoVideoStreamPlayerWithCustomStylesDemoCode = `import { RgoVideoStreamPlayer } from "@/components/data-display/RgoVideoStreamPlayer/RgoVideoStreamPlayer";
import { Stack, Typography } from "@mui/material";

const DEMO_STREAM_URL = "wss://88.198.9.184:3334/app/testing-stream";

export const RgoVideoStreamPlayerWithCustomStylesDemo = () => {
  return (
    <Stack spacing={4}>
      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Gradient Border with Shadow:
        </Typography>
        <RgoVideoStreamPlayer
          url={DEMO_STREAM_URL}
          width="600px"
          height="350px"
          sx={{
            padding: "2rem",
            borderRadius: "12px",
            border: "3px solid transparent",
            background:
              "linear-gradient(45deg, #667eea 0%, #764ba2 100%) padding-box, linear-gradient(45deg, #f093fb 0%, #f5576c 50%, #4facfe 100%) border-box",
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
          }}
        />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Dark Theme with Rounded Corners:
        </Typography>
        <RgoVideoStreamPlayer
          url={DEMO_STREAM_URL}
          width="500px"
          height="280px"
          sx={{
            padding: "1.5rem",
            borderRadius: "16px",
            backgroundColor: "#1a1a1a",
            border: "2px solid #333",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          }}
        />
      </div>

      <div>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Minimalist with Simple Border:
        </Typography>
        <RgoVideoStreamPlayer
          url={DEMO_STREAM_URL}
          width="400px"
          height="225px"
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        />
      </div>
    </Stack>
  );
};`;
