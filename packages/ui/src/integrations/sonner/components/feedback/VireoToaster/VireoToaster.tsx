"use client";

import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses, useMediaQuery } from "@mui/material";
import { useTheme, useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type ToasterProps } from "sonner";
import { type VireoToasterClassKey, getVireoToasterUtilityClass } from "./VireoToaster.classes";
import { VIREO_TOASTER_NAME, type VireoToasterSlotName } from "./VireoToaster.identity";
import { VireoToasterRoot } from "./VireoToaster.styled";
import { type VireoToasterOwnerState, type VireoToasterProps } from "./VireoToaster.types";

function useUtilityClasses(_ownerState: VireoToasterOwnerState, classes?: VireoToasterProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
    } as const satisfies UtilityClassSlotMap<VireoToasterSlotName, VireoToasterClassKey>,
    getVireoToasterUtilityClass,
    classes,
  );
}

function mergeToastClassNames(
  defaults: NonNullable<ToasterProps["toastOptions"]>["classNames"],
  overrides: NonNullable<ToasterProps["toastOptions"]>["classNames"],
) {
  if (!defaults) return overrides;
  if (!overrides) return defaults;

  const keys = new Set([...Object.keys(defaults), ...Object.keys(overrides)]) as Set<keyof typeof defaults>;
  return Object.fromEntries(
    Array.from(keys, key => [key, joinClassNames(defaults[key], overrides[key])]),
  ) as typeof defaults;
}

function mergeToastOptions(
  defaults: ToasterProps["toastOptions"],
  overrides: ToasterProps["toastOptions"],
): ToasterProps["toastOptions"] {
  if (!defaults) return overrides;
  if (!overrides) return defaults;

  return {
    ...defaults,
    ...overrides,
    classNames: mergeToastClassNames(defaults.classNames, overrides.classNames),
    style: { ...defaults.style, ...overrides.style },
  };
}

/** Renders the single global, MUI-themed Sonner notification region for an application. */
export const VireoToaster = React.forwardRef<HTMLElement, VireoToasterProps>(
  function VireoToaster(inProps, forwardedRef) {
    const theme = useTheme();
    const props = useThemeProps({ props: inProps, name: VIREO_TOASTER_NAME });
    const mobile = useMediaQuery(theme.breakpoints.down("sm"));
    const themeDefaultToastOptions = theme.components?.[VIREO_TOASTER_NAME]?.defaultProps?.toastOptions;
    const {
      className,
      classes: classesProp,
      closeButton: closeButtonProp,
      containerAriaLabel = "Notifications",
      dir: directionProp,
      duration = 3000,
      expand = false,
      gap = 14,
      hotkey = ["altKey", "KeyT"],
      mobileOffset: mobileOffsetProp,
      offset: offsetProp,
      position: positionProp,
      richColors = true,
      slotProps = {},
      slots = {},
      style,
      swipeDirections: swipeDirectionsProp,
      sx,
      toastOptions: toastOptionsProp,
      visibleToasts = 3,
      ...other
    } = props;

    const direction = directionProp ?? theme.direction;
    const position = positionProp ?? (mobile ? "top-center" : "bottom-right");
    const closeButton = closeButtonProp ?? !mobile;
    const swipeDirections = swipeDirectionsProp ?? (mobile ? ["top"] : ["right"]);
    const offset = offsetProp ?? 24;
    const mobileOffset = mobileOffsetProp ?? offsetProp ?? "calc(8px + env(safe-area-inset-top, 0px))";
    const toastOptions = mergeToastOptions(themeDefaultToastOptions, toastOptionsProp);

    const ownerState: VireoToasterOwnerState = {
      mobile,
      themeMode: theme.palette.mode,
      direction,
      position,
      closeButton,
      expand,
      richColors,
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      theme: _ignoredRootTheme,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    void _ignoredRootTheme;
    const rootRef = useForkRef(forwardedRef, rootSlotRef as React.Ref<HTMLElement> | undefined);

    return (
      <VireoToasterRoot
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        sonnerTheme={theme.palette.mode}
        dir={direction}
        position={position}
        closeButton={closeButton}
        containerAriaLabel={containerAriaLabel}
        duration={duration}
        expand={expand}
        gap={gap}
        hotkey={hotkey}
        mobileOffset={mobileOffset}
        offset={offset}
        richColors={richColors}
        swipeDirections={swipeDirections}
        toastOptions={toastOptions}
        visibleToasts={visibleToasts}
      />
    );
  },
);

VireoToaster.displayName = VIREO_TOASTER_NAME;
