import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Card, type CardProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_RESPONSIVE_CARD_NAME } from "./VireoResponsiveCard.identity";
import type { VireoResponsiveCardOwnerState } from "./VireoResponsiveCard.types";

export const VireoResponsiveCardRoot: StyledSlotComponent<CardProps, VireoResponsiveCardOwnerState> = styled(Card, {
  name: VIREO_RESPONSIVE_CARD_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<StyledSlotProps<VireoResponsiveCardOwnerState>>(({ ownerState }) =>
  ownerState.mode === "compact" && !ownerState.surfaceOnCompact
    ? { backgroundColor: "transparent", backgroundImage: "none", border: 0, borderRadius: 0, boxShadow: "none" }
    : {},
);
