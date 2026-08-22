import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_DROP_ZONE_NAME } from "./VireoDropZone.identity";
import { type VireoDropZoneOwnerState } from "./VireoDropZone.types";

type VireoDropZoneStyledSlotProps = StyledSlotProps<VireoDropZoneOwnerState>;
type VireoDropZoneStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoDropZoneOwnerState>;

export const VireoDropZoneRoot: VireoDropZoneStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_DROP_ZONE_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.disabled && styles.disabled,
    ownerState.dropState === "candidate" && styles.candidate,
    ownerState.dropState === "over" && styles.over,
    ownerState.dropState === "rejected" && styles.rejected,
  ],
})<VireoDropZoneStyledSlotProps>(({ theme, ownerState }) => {
  if (ownerState.disableDefaultFeedback) return {};
  return {
    position: "relative",
    transition: theme.transitions.create(["background-color", "outline-color"], {
      duration: theme.transitions.duration.shortest,
    }),
    ...(ownerState.dropState === "candidate" && {
      outline: `2px dashed ${theme.palette.primary.main}`,
      outlineOffset: -2,
    }),
    ...(ownerState.dropState === "over" && {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: -2,
      backgroundColor: `color-mix(in srgb, ${theme.palette.primary.main} 10%, transparent)`,
    }),
  };
});
