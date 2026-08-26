import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoSkeletonClassKey, getVireoSkeletonUtilityClass } from "./VireoSkeleton.classes";
import { VIREO_SKELETON_NAME, type VireoSkeletonSlotName } from "./VireoSkeleton.identity";
import { VireoSkeletonRoot } from "./VireoSkeleton.styled";
import { type VireoSkeletonOwnerState, type VireoSkeletonProps } from "./VireoSkeleton.types";

function useUtilityClasses(_ownerState: VireoSkeletonOwnerState, classes?: VireoSkeletonProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoSkeletonSlotName, VireoSkeletonClassKey>,
    getVireoSkeletonUtilityClass,
    classes,
  );
}

/** Silent placeholder leaf for preserving text, icon, or media geometry while content loads. */
export const VireoSkeleton = React.forwardRef<HTMLSpanElement, VireoSkeletonProps>(
  function VireoSkeleton(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_SKELETON_NAME });
    const {
      children,
      className,
      classes: classesProp,
      slotProps = {},
      slots = {},
      style,
      sx,
      variant = "text",
      ...other
    } = props;

    const ownerState: VireoSkeletonOwnerState = { hasChildren: children !== undefined, variant };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    return (
      <VireoSkeletonRoot
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        animation={false}
        aria-hidden="true"
        variant={variant}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {children}
      </VireoSkeletonRoot>
    );
  },
);

VireoSkeleton.displayName = VIREO_SKELETON_NAME;
