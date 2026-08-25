import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { type BottomNavigationProps, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoMobileBottomNavigationClassKey,
  getVireoMobileBottomNavigationUtilityClass,
} from "./VireoMobileBottomNavigation.classes";
import {
  VIREO_MOBILE_BOTTOM_NAVIGATION_NAME,
  type VireoMobileBottomNavigationSlotName,
} from "./VireoMobileBottomNavigation.identity";
import {
  VireoMobileBottomNavigationAction,
  VireoMobileBottomNavigationNavigation,
  VireoMobileBottomNavigationRoot,
} from "./VireoMobileBottomNavigation.styled";
import {
  type VireoMobileBottomNavigationOwnerState,
  type VireoMobileBottomNavigationProps,
} from "./VireoMobileBottomNavigation.types";

function useUtilityClasses(
  _ownerState: VireoMobileBottomNavigationOwnerState,
  classes?: VireoMobileBottomNavigationProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
      navigation: ["navigation"],
      action: ["action"],
    } as const satisfies UtilityClassSlotMap<VireoMobileBottomNavigationSlotName, VireoMobileBottomNavigationClassKey>,
    getVireoMobileBottomNavigationUtilityClass,
    classes,
  );
}

/**
 * Renders a controlled, router-agnostic set of primary mobile destinations with safe-area-aware shell styling.
 */
export const VireoMobileBottomNavigation = React.forwardRef<HTMLElement, VireoMobileBottomNavigationProps>(
  function VireoMobileBottomNavigation(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_MOBILE_BOTTOM_NAVIGATION_NAME });
    const {
      "aria-label": ariaLabel = "Primary navigation",
      className,
      classes: classesProp,
      items,
      onChange,
      safeAreaInset = true,
      slotProps = {},
      slots = {},
      style,
      sx,
      value = false,
      ...other
    } = props;

    const ownerState: VireoMobileBottomNavigationOwnerState = {
      itemCount: items.length,
      safeAreaInset,
      selected: value !== false && items.some(item => item.value === value),
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      "aria-label": rootSlotAriaLabel,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const resolvedNavigationSlotProps = resolveSlotProps(slotProps.navigation, ownerState);
    const {
      className: navigationSlotClassName,
      onChange: navigationSlotOnChange,
      ...navigationSlotOther
    } = resolvedNavigationSlotProps;
    const resolvedActionSlotProps = resolveSlotProps(slotProps.action, ownerState);
    const { className: actionSlotClassName, ...actionSlotOther } = resolvedActionSlotProps;

    const handleChange = React.useCallback<NonNullable<BottomNavigationProps["onChange"]>>(
      (event, nextValue: unknown) => {
        navigationSlotOnChange?.(event, nextValue);
        if (!event.defaultPrevented && typeof nextValue === "string") onChange?.(nextValue, event);
      },
      [navigationSlotOnChange, onChange],
    );

    return (
      <VireoMobileBottomNavigationRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "nav"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        aria-label={rootSlotAriaLabel ?? ariaLabel}
        role="navigation"
      >
        <VireoMobileBottomNavigationNavigation
          {...navigationSlotOther}
          as={slots.navigation}
          ownerState={ownerState}
          className={joinClassNames(classes.navigation, navigationSlotClassName)}
          showLabels
          value={ownerState.selected ? value : false}
          onChange={handleChange}
        >
          {items.map(item => {
            const selected = item.value === value;
            return (
              <VireoMobileBottomNavigationAction
                {...actionSlotOther}
                as={slots.action}
                ownerState={ownerState}
                key={item.value}
                aria-current={selected ? "page" : undefined}
                aria-label={item.ariaLabel}
                className={joinClassNames(classes.action, actionSlotClassName)}
                disabled={item.disabled}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            );
          })}
        </VireoMobileBottomNavigationNavigation>
      </VireoMobileBottomNavigationRoot>
    );
  },
);

VireoMobileBottomNavigation.displayName = VIREO_MOBILE_BOTTOM_NAVIGATION_NAME;
