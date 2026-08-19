import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME } from "./VireoFreeSoloAutocompleteMultiple.identity";
import { type VireoFreeSoloAutocompleteMultipleOwnerState } from "./VireoFreeSoloAutocompleteMultiple.types";

type VireoFreeSoloAutocompleteMultipleStyledSlotProps = StyledSlotProps<VireoFreeSoloAutocompleteMultipleOwnerState>;
type VireoFreeSoloAutocompleteMultipleStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFreeSoloAutocompleteMultipleOwnerState
>;

export const VireoFreeSoloAutocompleteMultipleRoot: VireoFreeSoloAutocompleteMultipleStyledSlotComponent<BoxProps> =
  styled(Box, {
    name: VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME,
    slot: "Root",
    overridesResolver: (_props, styles) => styles.root,
  })<VireoFreeSoloAutocompleteMultipleStyledSlotProps>({ width: "100%" });
