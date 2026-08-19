import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_AUTOCOMPLETE_NAME } from "./VireoAutocomplete.identity";
import { type VireoAutocompleteOwnerState } from "./VireoAutocomplete.types";

type VireoAutocompleteStyledSlotProps = StyledSlotProps<VireoAutocompleteOwnerState>;
type VireoAutocompleteStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoAutocompleteOwnerState
>;

export const VireoAutocompleteRoot: VireoAutocompleteStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_AUTOCOMPLETE_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoAutocompleteStyledSlotProps>({ width: "100%" });
