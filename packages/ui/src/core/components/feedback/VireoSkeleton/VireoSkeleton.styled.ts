import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
import { VIREO_LOADING_TOKENS } from "@/core/constants/loading.constants";
import { Skeleton, type SkeletonProps } from "@mui/material";
import { alpha, keyframes, styled } from "@mui/material/styles";
import { VIREO_SKELETON_NAME } from "./VireoSkeleton.identity";
import { type VireoSkeletonOwnerState } from "./VireoSkeleton.types";

type VireoSkeletonStyledSlotProps = StyledSlotProps<VireoSkeletonOwnerState>;
type VireoSkeletonStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoSkeletonOwnerState>;

const vireoSkeletonPulse = keyframes({
  "0%, 100%": { backgroundColor: "var(--VireoSkeleton-baseColor)" },
  "50%": { backgroundColor: "var(--VireoSkeleton-highlightColor)" },
});

export const VireoSkeletonRoot: VireoSkeletonStyledSlotComponent<SkeletonProps> = styled(Skeleton, {
  name: VIREO_SKELETON_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoSkeletonStyledSlotProps>(({ theme }) => {
  const baseColor = theme.vars?.palette.Skeleton.bg ?? alpha(theme.palette.text.primary, 0.11);
  const highlightColor = theme.vars?.palette.action.selected ?? alpha(theme.palette.text.primary, 0.18);

  return {
    "--VireoSkeleton-baseColor": baseColor,
    "--VireoSkeleton-highlightColor": highlightColor,
    backgroundColor: "var(--VireoSkeleton-baseColor)",
    animation: `${vireoSkeletonPulse} ${VIREO_LOADING_TOKENS.skeletonAnimationDuration}ms ease-in-out infinite`,
    pointerEvents: "none",
    userSelect: "none",
    "@media (prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  };
});
