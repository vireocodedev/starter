import type { StyledSlotComponent, StyledSlotProps } from "@/core/utils/muiutils";
import { TextField, type TextFieldProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_TEXT_INPUT_NAME } from "./VireoTextInput.identity";
import type { VireoTextInputOwnerState } from "./VireoTextInput.types";

export const VireoTextInputRoot = styled(TextField, {
  name: VIREO_TEXT_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<StyledSlotProps<VireoTextInputOwnerState>>({}) as unknown as StyledSlotComponent<
  TextFieldProps,
  VireoTextInputOwnerState
>;
