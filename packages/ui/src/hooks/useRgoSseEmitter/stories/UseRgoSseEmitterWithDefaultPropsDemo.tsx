import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import React from "react";

export const UseSseEmitterWithDefaultPropsDemo = () => {
  const [status, setStatus] = React.useState<"disconnected" | "connected" | "error">("disconnected");
  const [messages, setMessages] = React.useState<string[]>([]);

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        SSE Emitter
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Connects to a Server-Sent Events endpoint with typed event handlers. This demo shows the hook API — a real SSE
        server is required for a live connection.
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2">Status:</Typography>
        <Chip
          label={status}
          size="small"
          color={status === "connected" ? "success" : status === "error" ? "error" : "default"}
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="outlined" size="small" onClick={() => setStatus("connected")}>
          Simulate Open
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setMessages(prev => [...prev, `Event @ ${new Date().toLocaleTimeString()}`])}
        >
          Simulate Message
        </Button>
        <Button variant="outlined" size="small" color="error" onClick={() => setStatus("disconnected")}>
          Simulate Close
        </Button>
      </Stack>

      <Box sx={{ maxHeight: 200, overflow: "auto", bgcolor: "action.hover", borderRadius: 1, p: 1 }}>
        {messages.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No messages yet
          </Typography>
        ) : (
          messages.map((msg, i) => (
            <Typography key={i} variant="body2" sx={{ fontFamily: "monospace", fontSize: 12 }}>
              {msg}
            </Typography>
          ))
        )}
      </Box>
    </Paper>
  );
};

export const UseSseEmitterWithDefaultPropsDemoCode = `import { useRgoSseEmitter } from "@vireocodedev/starter-ui";

function LiveFeed() {
  const { reconnect } = useRgoSseEmitter({
    url: "/api/events",
    eventHandlers: {
      notification: (data) => {
        console.log("Notification:", data);
      },
      update: (data) => {
        console.log("Update:", data);
      },
    },
    onOpen: () => console.log("SSE connected"),
    onError: () => console.log("SSE error"),
  });

  return <button onClick={reconnect}>Reconnect</button>;
}`;
