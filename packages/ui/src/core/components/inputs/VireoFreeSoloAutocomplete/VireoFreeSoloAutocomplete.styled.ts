import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FREE_SOLO_AUTOCOMPLETE_NAME } from "./VireoFreeSoloAutocomplete.identity";
import { type VireoFreeSoloAutocompleteOwnerState } from "./VireoFreeSoloAutocomplete.types";

type VireoFreeSoloAutocompleteStyledSlotProps = StyledSlotProps<VireoFreeSoloAutocompleteOwnerState>;
type VireoFreeSoloAutocompleteStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFreeSoloAutocompleteOwnerState
>;

export const VireoFreeSoloAutocompleteRoot: VireoFreeSoloAutocompleteStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FREE_SOLO_AUTOCOMPLETE_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoFreeSoloAutocompleteStyledSlotProps>({ width: "100%" });
