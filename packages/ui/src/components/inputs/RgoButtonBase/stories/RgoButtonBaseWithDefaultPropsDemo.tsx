import { RgoButtonBase, type RgoButtonBaseColorMuiName } from "@/components/inputs/RgoButtonBase/RgoButtonBase";
import { Box, Stack, Typography } from "@mui/material";

const COLORS: RgoButtonBaseColorMuiName[] = [
  "primary",
  "error",
  "grey",
  "secondary",
  "info",
  "success",
  "warning",
  "black",
  "white",
];

export function RgoButtonBaseWithDefaultPropsDemo() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          Clickable, default severity (100)
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {COLORS.map(color => (
            <RgoButtonBase
              key={color}
              color={color}
              onClick={() => undefined}
              sx={{ p: 1.5, borderRadius: 1, minWidth: 88 }}
            >
              <Typography variant="body2">{color}</Typography>
            </RgoButtonBase>
          ))}
        </Box>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          Different severities (`primary`)
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {([100, 300, 500, 700, 900] as const).map(severity => (
            <RgoButtonBase
              key={severity}
              color="primary"
              colorSeverity={severity}
              onClick={() => undefined}
              sx={{ p: 1.5, borderRadius: 1, minWidth: 64 }}
            >
              <Typography variant="body2">{severity}</Typography>
            </RgoButtonBase>
          ))}
        </Box>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          Non-clickable (no `onClick` → no ripple, no pointer cursor, text-selectable)
        </Typography>
        <RgoButtonBase color="grey" sx={{ p: 1.5, borderRadius: 1, alignSelf: "flex-start" }}>
          <Typography variant="body2">Static container</Typography>
        </RgoButtonBase>
      </Stack>
    </Stack>
  );
}

export const RgoButtonBaseWithDefaultPropsDemoCode = `
import { RgoButtonBase } from "@vireocodedev/starter-ui";

function Example() {
  return (
    <>
      {/* Clickable: ripple + hover/focus background swap */}
      <RgoButtonBase color="primary" colorSeverity={100} onClick={() => doSomething()}>
        Click me
      </RgoButtonBase>

      {/* Non-clickable: behaves like a passive container */}
      <RgoButtonBase color="grey">
        Static
      </RgoButtonBase>
    </>
  );
}`;
