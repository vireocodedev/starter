import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_AUTOCOMPLETE_MULTIPLE_NAME } from "./VireoAutocompleteMultiple.identity";
import { type VireoAutocompleteMultipleOwnerState } from "./VireoAutocompleteMultiple.types";

type VireoAutocompleteMultipleStyledSlotProps = StyledSlotProps<VireoAutocompleteMultipleOwnerState>;
type VireoAutocompleteMultipleStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoAutocompleteMultipleOwnerState
>;

export const VireoAutocompleteMultipleRoot: VireoAutocompleteMultipleStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_AUTOCOMPLETE_MULTIPLE_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoAutocompleteMultipleStyledSlotProps>({ width: "100%" });
