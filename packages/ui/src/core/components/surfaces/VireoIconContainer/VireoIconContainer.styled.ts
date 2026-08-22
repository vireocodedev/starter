import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { type SxProps, type Theme } from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_ICON_CONTAINER_NAME } from "./VireoIconContainer.identity";
import { type VireoIconContainerOwnerState } from "./VireoIconContainer.types";

type VireoIconContainerStyledSlotProps = StyledSlotProps<VireoIconContainerOwnerState>;
type VireoIconContainerStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoIconContainerOwnerState
>;
type VireoIconContainerRootProps = React.SVGProps<SVGGElement> & { sx?: SxProps<Theme> };

export const VireoIconContainerRoot: VireoIconContainerStyledSlotComponent<VireoIconContainerRootProps> = styled("g", {
  name: VIREO_ICON_CONTAINER_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoIconContainerStyledSlotProps>({});
