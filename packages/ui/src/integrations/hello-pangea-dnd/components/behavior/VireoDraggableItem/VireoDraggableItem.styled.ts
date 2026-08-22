import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_DRAGGABLE_ITEM_NAME } from "./VireoDraggableItem.identity";
import { type VireoDraggableItemOwnerState } from "./VireoDraggableItem.types";

type VireoDraggableItemStyledSlotProps = StyledSlotProps<VireoDraggableItemOwnerState>;
type VireoDraggableItemStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoDraggableItemOwnerState
>;

export const VireoDraggableItemRoot: VireoDraggableItemStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_DRAGGABLE_ITEM_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.disabled && styles.disabled,
    ownerState.isDragging && styles.dragging,
  ],
})<VireoDraggableItemStyledSlotProps>(({ theme, ownerState }) => {
  if (ownerState.disableDefaultFeedback) return {};
  return {
    ...(ownerState.dragHandle === "root" &&
      !ownerState.disabled && { cursor: ownerState.isDragging ? "grabbing" : "grab" }),
    ...(ownerState.isDragging && { boxShadow: theme.shadows[6] }),
    "@media (prefers-reduced-motion: reduce)": { transitionDuration: "0.01ms !important" },
  };
});
