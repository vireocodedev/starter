import type { StyledSlotComponent, StyledSlotProps } from "@/core/utils/muiutils";
import { TextField, type TextFieldProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_NUMBER_INPUT_NAME } from "./VireoNumberInput.identity";
import type { VireoNumberInputOwnerState } from "./VireoNumberInput.types";
export const VireoNumberInputRoot = styled(TextField, {
  name: VIREO_NUMBER_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<StyledSlotProps<VireoNumberInputOwnerState>>({}) as unknown as StyledSlotComponent<
  TextFieldProps,
  VireoNumberInputOwnerState
>;
