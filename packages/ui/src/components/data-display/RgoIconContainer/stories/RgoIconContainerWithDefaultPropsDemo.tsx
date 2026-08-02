import { RgoIconContainer } from "@/components/data-display/RgoIconContainer/RgoIconContainer";
import { Stack, Typography } from "@mui/material";

export function RgoIconContainerWithDefaultPropsDemo() {
  return (
    <Stack direction="row" spacing={4} alignItems="center">
      <Stack alignItems="center" spacing={1}>
        <svg viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
          <RgoIconContainer viewBoxWidth={16} viewBoxHeight={16}>
            <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="4" x2="8" y2="8" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="2" />
          </RgoIconContainer>
        </svg>
        <Typography variant="caption">16×16 → 24×24</Typography>
      </Stack>
      <Stack alignItems="center" spacing={1}>
        <svg viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
          <RgoIconContainer viewBoxWidth={32} viewBoxHeight={32}>
            <rect x="4" y="4" width="24" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="10" y1="16" x2="14" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="14" y1="20" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
          </RgoIconContainer>
        </svg>
        <Typography variant="caption">32×32 → 24×24</Typography>
      </Stack>
    </Stack>
  );
}

export const RgoIconContainerWithDefaultPropsDemoCode = `
import { RgoIconContainer } from "@vireocodedev/starter-ui";

// Scale a 16×16 icon to fit a standard 24×24 viewBox
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <RgoIconContainer viewBoxWidth={16} viewBoxHeight={16}>
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="8" y1="4" x2="8" y2="8" stroke="currentColor" strokeWidth="2" />
        <line x1="8" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="2" />
      </RgoIconContainer>
    </svg>
  );
}`;
