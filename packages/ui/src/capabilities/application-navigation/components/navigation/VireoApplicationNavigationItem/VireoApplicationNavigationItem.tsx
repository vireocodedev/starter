import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { VireoApplicationNavigationContext } from "@/capabilities/application-navigation/contexts/VireoApplicationNavigationContext/VireoApplicationNavigationContext";
import { Tooltip, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoApplicationNavigationItemClassKey,
  getVireoApplicationNavigationItemUtilityClass,
} from "./VireoApplicationNavigationItem.classes";
import {
  VIREO_APPLICATION_NAVIGATION_ITEM_NAME,
  type VireoApplicationNavigationItemSlotName,
} from "./VireoApplicationNavigationItem.identity";
import {
  VireoApplicationNavigationItemIcon,
  VireoApplicationNavigationItemLabel,
  VireoApplicationNavigationItemRoot,
} from "./VireoApplicationNavigationItem.styled";
import {
  type VireoApplicationNavigationItemOwnerState,
  type VireoApplicationNavigationItemProps,
} from "./VireoApplicationNavigationItem.types";

function useUtilityClasses(
  ownerState: VireoApplicationNavigationItemOwnerState,
  classes?: VireoApplicationNavigationItemProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
      icon: ["icon"],
      label: ["label"],
    } as const satisfies UtilityClassSlotMap<
      VireoApplicationNavigationItemSlotName,
      VireoApplicationNavigationItemClassKey
    >,
    getVireoApplicationNavigationItemUtilityClass,
    classes,
  );
}

/**
 * Renders a destination consistently in expanded and compact application navigation.
 */
export const VireoApplicationNavigationItem = React.forwardRef<HTMLAnchorElement, VireoApplicationNavigationItemProps>(
  function VireoApplicationNavigationItem(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_APPLICATION_NAVIGATION_ITEM_NAME });
    const {
      className,
      classes: classesProp,
      compactLabel,
      disabled = false,
      href,
      icon,
      label,
      mode: modeProp,
      onClick,
      selected = false,
      slotProps = {},
      slots = {},
      style,
      sx,
      tooltip = label,
      ...other
    } = props;

    const navigation = React.useContext(VireoApplicationNavigationContext);
    const ownerState: VireoApplicationNavigationItemOwnerState = {
      mode: modeProp ?? navigation.mode,
      selected,
      disabled,
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      onClick: rootSlotOnClick,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const resolvedIconSlotProps = resolveSlotProps(slotProps.icon, ownerState);
    const resolvedLabelSlotProps = resolveSlotProps(slotProps.label, ownerState);
    const { className: iconSlotClassName, ...iconSlotOther } = resolvedIconSlotProps;
    const { className: labelSlotClassName, ...labelSlotOther } = resolvedLabelSlotProps;

    const handleClick = React.useCallback<NonNullable<VireoApplicationNavigationItemProps["onClick"]>>(
      event => {
        rootSlotOnClick?.(event);
        if (!event.defaultPrevented) onClick?.(event);
      },
      [onClick, rootSlotOnClick],
    );

    const item = (
      <VireoApplicationNavigationItemRoot
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        aria-label={label}
        aria-current={selected ? "page" : undefined}
        disabled={disabled}
        href={href}
        onClick={handleClick}
        selected={selected}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <VireoApplicationNavigationItemIcon
          {...iconSlotOther}
          as={slots.icon ?? "span"}
          ownerState={ownerState}
          className={joinClassNames(classes.icon, iconSlotClassName)}
          aria-hidden
        >
          {icon}
        </VireoApplicationNavigationItemIcon>
        <VireoApplicationNavigationItemLabel
          {...labelSlotOther}
          as={slots.label}
          ownerState={ownerState}
          className={joinClassNames(classes.label, labelSlotClassName)}
        >
          {ownerState.mode === "compact" ? (compactLabel ?? label) : label}
        </VireoApplicationNavigationItemLabel>
      </VireoApplicationNavigationItemRoot>
    );

    return ownerState.mode === "compact" && tooltip ? (
      <Tooltip placement="right" title={tooltip}>
        {item}
      </Tooltip>
    ) : (
      item
    );
  },
);

VireoApplicationNavigationItem.displayName = VIREO_APPLICATION_NAVIGATION_ITEM_NAME;
