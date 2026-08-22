import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { SvgIcon, type SvgIconProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_ICON_NAME } from "./VireoIcon.identity";
import { type VireoIconOwnerState } from "./VireoIcon.types";

type VireoIconStyledSlotProps = StyledSlotProps<VireoIconOwnerState>;
type VireoIconStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoIconOwnerState>;

export const VireoIconRoot: VireoIconStyledSlotComponent<SvgIconProps> = styled(SvgIcon, {
  name: VIREO_ICON_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoIconStyledSlotProps>({});
