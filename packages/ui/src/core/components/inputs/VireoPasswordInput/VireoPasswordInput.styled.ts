import type { StyledSlotComponent, StyledSlotProps } from "@/core/utils/muiutils";
import { IconButton, type IconButtonProps, TextField, type TextFieldProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_PASSWORD_INPUT_NAME } from "./VireoPasswordInput.identity";
import type { VireoPasswordInputOwnerState } from "./VireoPasswordInput.types";
type Owner = StyledSlotProps<VireoPasswordInputOwnerState>;
export const VireoPasswordInputRoot = styled(TextField, {
  name: VIREO_PASSWORD_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<Owner>({}) as unknown as StyledSlotComponent<TextFieldProps, VireoPasswordInputOwnerState>;
export const VireoPasswordInputVisibilityButton: StyledSlotComponent<IconButtonProps, VireoPasswordInputOwnerState> =
  styled(IconButton, {
    name: VIREO_PASSWORD_INPUT_NAME,
    slot: "VisibilityButton",
    overridesResolver: (_p, s) => s.visibilityButton,
  })<Owner>({});
