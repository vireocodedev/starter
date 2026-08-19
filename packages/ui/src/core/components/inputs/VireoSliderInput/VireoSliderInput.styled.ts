import type { StyledSlotComponent, StyledSlotProps } from "@/core/utils/muiutils";
import {
  Box,
  type BoxProps,
  FormControl,
  type FormControlProps,
  FormHelperText,
  type FormHelperTextProps,
  Slider,
  type SliderProps,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_SLIDER_INPUT_NAME } from "./VireoSliderInput.identity";
import type { VireoSliderInputOwnerState } from "./VireoSliderInput.types";
type Owner = StyledSlotProps<VireoSliderInputOwnerState>;
export const VireoSliderInputRoot = styled(FormControl, {
  name: VIREO_SLIDER_INPUT_NAME,
  slot: "Root",
  overridesResolver: (_p, s) => s.root,
})<Owner>({
  display: "grid",
  gridTemplateColumns: "auto minmax(120px, 1fr) auto",
  alignItems: "center",
  gap: 16,
}) as unknown as StyledSlotComponent<FormControlProps, VireoSliderInputOwnerState>;
export const VireoSliderInputSliderIcon: StyledSlotComponent<BoxProps, VireoSliderInputOwnerState> = styled(Box, {
  name: VIREO_SLIDER_INPUT_NAME,
  slot: "SliderIcon",
  overridesResolver: (_p, s) => s.sliderIcon,
})<Owner>({ display: "flex" });
export const VireoSliderInputSlider: StyledSlotComponent<SliderProps, VireoSliderInputOwnerState> = styled(Slider, {
  name: VIREO_SLIDER_INPUT_NAME,
  slot: "Slider",
  overridesResolver: (_p, s) => s.slider,
})<Owner>({});
export const VireoSliderInputNumberInput = styled(TextField, {
  name: VIREO_SLIDER_INPUT_NAME,
  slot: "NumberInput",
  overridesResolver: (_p, s) => s.numberInput,
})<Owner>({}) as unknown as StyledSlotComponent<TextFieldProps, VireoSliderInputOwnerState>;
export const VireoSliderInputHelperText: StyledSlotComponent<FormHelperTextProps, VireoSliderInputOwnerState> = styled(
  FormHelperText,
  { name: VIREO_SLIDER_INPUT_NAME, slot: "HelperText", overridesResolver: (_p, s) => s.helperText },
)<Owner>({ gridColumn: "1 / -1", marginLeft: 0 });
