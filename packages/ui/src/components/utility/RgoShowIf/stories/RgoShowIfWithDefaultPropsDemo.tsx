import { RgoShowIf } from "@/components/utility/RgoShowIf/RgoShowIf";
import { Stack, Switch, Typography } from "@mui/material";
import React from "react";

export function RgoShowIfWithDefaultPropsDemo() {
  const [enabled, setEnabled] = React.useState(true);

  return (
    <Stack spacing={2} alignItems="flex-start">
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2">Enabled:</Typography>
        <Switch checked={enabled} onChange={(_, v) => setEnabled(v)} />
      </Stack>

      <RgoShowIf when={enabled}>
        <Typography color="success.main">Boolean true → children rendered.</Typography>
      </RgoShowIf>

      <RgoShowIf when={enabled} fallback={<Typography color="text.secondary">Disabled (fallback shown).</Typography>}>
        <Typography color="success.main">Boolean true → children rendered (fallback variant).</Typography>
      </RgoShowIf>

      {/* Function form: useful when the predicate is expensive and you want to defer it. */}
      <RgoShowIf when={() => enabled && Date.now() % 2 === 0}>
        <Typography color="info.main">Function predicate (deferred until render).</Typography>
      </RgoShowIf>
    </Stack>
  );
}

export const RgoShowIfWithDefaultPropsDemoCode = `
import { RgoShowIf } from "@vireocodedev/starter-ui";

function Example({ canEdit }: { canEdit: boolean }) {
  return (
    <>
      {/* Boolean form (most common): pass any boolean expression */}
      <RgoShowIf when={canEdit}>
        <EditButton />
      </RgoShowIf>

      {/* With fallback */}
      <RgoShowIf when={canEdit} fallback={<ReadOnlyBadge />}>
        <EditButton />
      </RgoShowIf>

      {/* Function form: defer an expensive predicate to render time */}
      <RgoShowIf when={() => isExpensiveFlagEnabled()}>
        <BetaFeature />
      </RgoShowIf>
    </>
  );
}`;
