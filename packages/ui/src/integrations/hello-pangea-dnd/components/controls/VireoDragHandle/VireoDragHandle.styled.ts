import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import DragIndicatorRounded from "@mui/icons-material/DragIndicatorRounded";
import { IconButton, type IconButtonProps, type SvgIconProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_DRAG_HANDLE_NAME } from "./VireoDragHandle.identity";
import { type VireoDragHandleOwnerState } from "./VireoDragHandle.types";

type VireoDragHandleStyledSlotProps = StyledSlotProps<VireoDragHandleOwnerState>;
type VireoDragHandleStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoDragHandleOwnerState>;

export const VireoDragHandleRoot: VireoDragHandleStyledSlotComponent<IconButtonProps> = styled(IconButton, {
  name: VIREO_DRAG_HANDLE_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.disabled && styles.disabled,
    ownerState.isDragging && styles.dragging,
  ],
})<VireoDragHandleStyledSlotProps>(({ ownerState }) => ({
  cursor: ownerState.disabled ? "default" : ownerState.isDragging ? "grabbing" : "grab",
}));

export const VireoDragHandleIcon: VireoDragHandleStyledSlotComponent<SvgIconProps> = styled(DragIndicatorRounded, {
  name: VIREO_DRAG_HANDLE_NAME,
  slot: "Icon",
  overridesResolver: (_props, styles) => styles.icon,
})<VireoDragHandleStyledSlotProps>({});
