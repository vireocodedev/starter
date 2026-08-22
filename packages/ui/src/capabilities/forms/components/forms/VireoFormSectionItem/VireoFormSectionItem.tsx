import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoFormSectionItemClassKey, getVireoFormSectionItemUtilityClass } from "./VireoFormSectionItem.classes";
import { VIREO_FORM_SECTION_ITEM_NAME, type VireoFormSectionItemSlotName } from "./VireoFormSectionItem.identity";
import { VireoFormSectionItemRoot } from "./VireoFormSectionItem.styled";
import { type VireoFormSectionItemOwnerState, type VireoFormSectionItemProps } from "./VireoFormSectionItem.types";

function useUtilityClasses(
  _ownerState: VireoFormSectionItemOwnerState,
  classes?: VireoFormSectionItemProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoFormSectionItemSlotName, VireoFormSectionItemClassKey>,
    getVireoFormSectionItemUtilityClass,
    classes,
  );
}

/**
 * Groups one or more elements into a single responsive form-section cell with optional full-row spanning.
 */
export const VireoFormSectionItem = React.forwardRef<HTMLDivElement, VireoFormSectionItemProps>(
  function VireoFormSectionItem(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_SECTION_ITEM_NAME });
    const {
      children,
      className,
      classes: classesProp,
      slotProps = {},
      slots = {},
      span = "auto",
      style,
      sx,
      ...other
    } = props;

    const ownerState: VireoFormSectionItemOwnerState = { span };
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
      <VireoFormSectionItemRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {children}
      </VireoFormSectionItemRoot>
    );
  },
);

VireoFormSectionItem.displayName = VIREO_FORM_SECTION_ITEM_NAME;
