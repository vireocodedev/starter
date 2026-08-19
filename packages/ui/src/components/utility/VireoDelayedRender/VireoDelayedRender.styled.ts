import { type StyledSlotComponent, type StyledSlotProps } from "@/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_DELAYED_RENDER_NAME } from "./VireoDelayedRender.identity";
import { type VireoDelayedRenderOwnerState } from "./VireoDelayedRender.types";

type VireoDelayedRenderStyledSlotProps = StyledSlotProps<VireoDelayedRenderOwnerState>;
type VireoDelayedRenderStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoDelayedRenderOwnerState
>;

export const VireoDelayedRenderRoot: VireoDelayedRenderStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_DELAYED_RENDER_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoDelayedRenderStyledSlotProps>({
  display: "contents",
});
