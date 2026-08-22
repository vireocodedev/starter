import { useVireoEventSource, type VireoEventSourceListeners } from "@vireocodedev/starter-ui/event-source";
import {
  VireoEventSourceStoryServer,
  VireoStorybookProvider,
  type VireoEventSourceStoryServerController,
} from "@vireocodedev/starter-ui/storybook";
import { Alert, Button, Chip, Paper, Stack, Switch, Typography } from "@mui/material";
import React from "react";
import { z } from "zod";

type ApplicationEvent = "activity" | "audit";

const activitySchema = z.object({ sequence: z.number().int().positive(), summary: z.string().min(1) });

export default function DefaultExample() {
  return (
    <VireoStorybookProvider>
      <VireoEventSourceStoryServer>{server => <EventFeed server={server} />}</VireoEventSourceStoryServer>
    </VireoStorybookProvider>
  );
}

function EventFeed({ server }: { server: VireoEventSourceStoryServerController }) {
  const [enabled, setEnabled] = React.useState(true);
  const [listenForAudits, setListenForAudits] = React.useState(true);
  const [messages, setMessages] = React.useState<string[]>([]);
  const [listenerError, setListenerError] = React.useState<string | null>(null);
  const sequenceRef = React.useRef(0);

  const listeners: VireoEventSourceListeners<ApplicationEvent> = {
    activity: event => {
      const activity = activitySchema.parse(JSON.parse(event.data));
      setMessages(current => [`Activity ${activity.sequence}: ${activity.summary}`, ...current]);
    },
    ...(listenForAudits
      ? {
          audit: (event: MessageEvent<string>) => {
            setMessages(current => [`Audit: ${event.data}`, ...current]);
          },
        }
      : {}),
  };

  const stream = useVireoEventSource<ApplicationEvent>({
    url: "/api/events",
    enabled,
    listeners,
    onMessage: event => {
      setMessages(current => [`Default message: ${event.data}`, ...current]);
    },
    onListenerError: ({ error, eventName }) => {
      setListenerError(`${eventName ?? "default"}: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });

  const emitActivity = () => {
    sequenceRef.current += 1;
    server.emitNamedMessage(
      "activity",
      JSON.stringify({ sequence: sequenceRef.current, summary: "Customer record synchronized" }),
    );
  };

  return (
    <Paper variant="outlined" sx={{ maxWidth: 760, p: 3 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Application event stream
          </Typography>
          <Chip
            label={stream.status}
            color={stream.status === "open" ? "success" : stream.status === "closed" ? "default" : "warning"}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            Connections: {server.connectionCount}
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
          <Button variant="contained" disabled={stream.status !== "open"} onClick={emitActivity}>
            Emit Zod-validated activity
          </Button>
          <Button disabled={stream.status !== "open"} onClick={() => server.emitMessage("Refresh requested")}>
            Emit default message
          </Button>
          <Button disabled={stream.status !== "open"} onClick={() => server.emitNamedMessage("audit", "Owner changed")}>
            Emit audit
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
          <Button color="warning" disabled={stream.status !== "open"} onClick={server.interrupt}>
            Interrupt
          </Button>
          <Button disabled={stream.status !== "reconnecting"} onClick={server.resume}>
            Resume native connection
          </Button>
          <Button color="error" disabled={stream.status === "closed"} onClick={server.terminate}>
            Terminate
          </Button>
          <Button variant="outlined" disabled={!enabled} onClick={stream.reconnect}>
            Reconnect explicitly
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Switch
              checked={enabled}
              onChange={event => setEnabled(event.target.checked)}
              inputProps={{ "aria-label": "Enable stream" }}
            />
            <Typography>Enabled</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1}>
            <Switch
              checked={listenForAudits}
              onChange={event => setListenForAudits(event.target.checked)}
              inputProps={{ "aria-label": "Listen for audit events" }}
            />
            <Typography>Audit listener</Typography>
          </Stack>
          <Button
            color="error"
            disabled={stream.status !== "open"}
            onClick={() => server.emitNamedMessage("activity", "not valid JSON")}
          >
            Emit invalid payload
          </Button>
        </Stack>

        {listenerError !== null && (
          <Alert severity="error" onClose={() => setListenerError(null)}>
            Listener error: {listenerError}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ minHeight: 128, p: 2 }}>
          {messages.length === 0 ? (
            <Typography color="text.secondary">No events received yet.</Typography>
          ) : (
            <Stack spacing={0.5}>
              {messages.map((message, index) => (
                <Typography key={`${message}-${index}`} variant="body2">
                  {message}
                </Typography>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Paper>
  );
}
