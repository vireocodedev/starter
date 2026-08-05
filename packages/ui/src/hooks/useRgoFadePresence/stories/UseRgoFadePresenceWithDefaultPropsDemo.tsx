import { useRgoFadePresence } from "@/hooks/useRgoFadePresence/useRgoFadePresence";
import { Box, Button, Fade, Paper, Stack, Typography } from "@mui/material";
import React from "react";

type Item = { id: number; label: string };

const ITEMS: Item[] = [
  { id: 1, label: "Lock 5 — alarm cleared" },
  { id: 2, label: "Vessel A123 — gate open" },
  { id: 3, label: "Shift report submitted" },
];

export function UseRgoFadePresenceWithDefaultPropsDemo() {
  const [selected, setSelected] = React.useState<Item | null>(null);

  const { visible, lastValue, onDismiss, handleExited } = useRgoFadePresence<Item>({
    value: selected,
    onExited: () => setSelected(null),
  });

  return (
    <Stack spacing={3} alignItems="flex-start">
      <Typography variant="body2" color="text.secondary">
        Click an item to show its detail panel; click "Dismiss" to fade it out. The panel keeps rendering its last value
        during the fade-out so the content doesn't snap to empty.
      </Typography>

      <Stack direction="row" spacing={1}>
        {ITEMS.map(item => (
          <Button
            key={item.id}
            variant={selected?.id === item.id ? "contained" : "outlined"}
            onClick={() => setSelected(item)}
          >
            {item.label}
          </Button>
        ))}
      </Stack>

      <Box sx={{ minHeight: 120, width: 360 }}>
        <Fade in={visible} onExited={handleExited} timeout={250}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">{lastValue?.label ?? "—"}</Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {lastValue?.id ?? "—"}
              </Typography>
              <Button size="small" onClick={onDismiss} sx={{ alignSelf: "flex-start" }}>
                Dismiss
              </Button>
            </Stack>
          </Paper>
        </Fade>
      </Box>
    </Stack>
  );
}

export const UseRgoFadePresenceWithDefaultPropsDemoCode = `
import { useRgoFadePresence } from "@vireocodedev/starter-ui";
import { Fade, Paper } from "@mui/material";
import React from "react";

function NotificationDetailPanel() {
  const [selected, setSelected] = React.useState<Notification | null>(null);

  const { visible, lastValue, onDismiss, handleExited } = useRgoFadePresence({
    value: selected,
    onExited: () => setSelected(null),
  });

  return (
    <Fade in={visible} onExited={handleExited} timeout={250}>
      <Paper>
        {/* lastValue is kept populated during fade-out so this stays rendered */}
        <h3>{lastValue?.title}</h3>
        <button onClick={onDismiss}>Dismiss</button>
      </Paper>
    </Fade>
  );
}`;
