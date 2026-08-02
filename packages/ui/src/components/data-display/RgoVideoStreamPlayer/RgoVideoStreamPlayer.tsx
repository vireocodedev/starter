import { Error as ErrorIcon, Refresh } from "@mui/icons-material";
import { Box, Button, Typography, type SxProps } from "@mui/material";
import OvenPlayer from "ovenplayer";
import React from "react";
import "./RgoVideoStreamPlayer.css";

export type RgoVideoStreamPlayerProps = {
  url: string;
  autoStart?: boolean;
  width?: string | number;
  height?: string | number;
  initialVolume?: number;
  sx?: Omit<SxProps, "width" | "height" | "minWidth" | "minHeight" | "maxWidth" | "maxHeight" | "display">;
};

export function RgoVideoStreamPlayer({
  url,
  width,
  height,
  sx,
  autoStart = true,
  initialVolume = 0,
}: RgoVideoStreamPlayerProps) {
  const container = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = React.useRef<any>(null);
  const id = React.useId();

  const computedWidth =
    width === undefined || width === null
      ? "100%"
      : typeof width === "number"
      ? `${width}px`
      : width === ""
      ? "100%"
      : isNaN(Number(width))
      ? width
      : `${width}px`;

  const computedHeight =
    height === undefined || height === null
      ? "100%"
      : typeof height === "number"
      ? `${height}px`
      : height === ""
      ? "100%"
      : isNaN(Number(height))
      ? height
      : `${height}px`;

  const initializePlayer = React.useCallback(() => {
    if (!container.current) return;

    // Clean up existing player
    if (playerRef.current) {
      playerRef.current?.remove?.();
      playerRef.current = null;
    }

    try {
      const player = OvenPlayer.create(id, {
        autoStart,
        volume: initialVolume,
        sources: [{ file: url, type: "webrtc", label: "WebRTC" }],
      });

      player.on("error", () => {
        setError(true);
      });

      playerRef.current = player;
    } catch (err) {
      console.error("Failed to initialize player:", err);
      setError(true);
    }
  }, [url, id, autoStart, initialVolume]);

  const handleRetry = () => {
    setError(false);
    initializePlayer();
  };

  React.useEffect(() => {
    setError(false);
    initializePlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current?.remove?.();
        playerRef.current = null;
      }
    };
  }, [initializePlayer]);

  return (
    <>
      <Box sx={sx} width={computedWidth} height={computedHeight} display={error ? "none" : "block"}>
        <Box ref={container} id={id} />
      </Box>
      {error && (
        <Box
          width={computedWidth}
          height="auto"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "background.paper",
            border: 2,
            borderStyle: "dashed",
            borderColor: "error.main",
            borderRadius: 2,
            color: "error.main",
            gap: 2,
            padding: "1.25rem 1rem 1.5rem 1rem",
          }}
        >
          <ErrorIcon sx={{ fontSize: 48, opacity: 0.7 }} />
          <Typography variant="h6" align="center" color="error.main">
            Error Loading Stream
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{
              opacity: 0.8,
              maxWidth: "80%",
              color: "text.secondary",
            }}
          >
            Unable to connect to the video stream. Please check the URL and try again.
          </Typography>
          <Button variant="contained" color="error" startIcon={<Refresh />} onClick={handleRetry} sx={{ mt: 1 }}>
            Retry
          </Button>
        </Box>
      )}
    </>
  );
}
