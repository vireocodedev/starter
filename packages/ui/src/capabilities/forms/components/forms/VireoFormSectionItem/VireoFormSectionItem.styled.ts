import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_SECTION_ITEM_NAME } from "./VireoFormSectionItem.identity";
import { type VireoFormSectionItemOwnerState } from "./VireoFormSectionItem.types";

type VireoFormSectionItemStyledSlotProps = StyledSlotProps<VireoFormSectionItemOwnerState>;
type VireoFormSectionItemStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormSectionItemOwnerState
>;

export const VireoFormSectionItemRoot: VireoFormSectionItemStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_SECTION_ITEM_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoFormSectionItemStyledSlotProps>(({ theme, ownerState }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  gridColumn: ownerState.span === "full" ? "1 / -1" : "auto",
  minWidth: 0,
}));
