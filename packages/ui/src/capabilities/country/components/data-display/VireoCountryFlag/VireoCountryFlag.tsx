import { isCountryCode } from "@/capabilities/country/models/countryCode.models";
import { getCountryName } from "@/capabilities/country/utils/countryNames.utils";
import { UnknownCountryFlag } from "@/capabilities/country/components/data-display/VireoCountryFlag/internal/components/UnknownCountryFlag";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { Tooltip, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import * as CountryFlags from "country-flag-icons/react/3x2";
import React from "react";
import { type VireoCountryFlagClassKey, getVireoCountryFlagUtilityClass } from "./VireoCountryFlag.classes";
import { VIREO_COUNTRY_FLAG_NAME, type VireoCountryFlagSlotName } from "./VireoCountryFlag.identity";
import { VireoCountryFlagFlag, VireoCountryFlagRoot } from "./VireoCountryFlag.styled";
import type { VireoCountryFlagOwnerState, VireoCountryFlagProps } from "./VireoCountryFlag.types";

type FlagComponent = React.ElementType<React.SVGProps<SVGSVGElement>>;

function getFlagComponent(countryCode: string): FlagComponent | undefined {
  if (!isCountryCode(countryCode)) return undefined;
  return CountryFlags[countryCode.replaceAll("-", "_") as keyof typeof CountryFlags] as FlagComponent;
}

function useUtilityClasses(ownerState: VireoCountryFlagOwnerState, classes?: VireoCountryFlagProps["classes"]) {
  return composeClasses(
    {
      root: ["root", ownerState.known ? "known" : "unknown", ownerState.enableTooltip && "tooltipEnabled"],
      flag: ["flag"],
      tooltip: ["tooltip"],
    } as const satisfies UtilityClassSlotMap<VireoCountryFlagSlotName, VireoCountryFlagClassKey>,
    getVireoCountryFlagUtilityClass,
    classes,
  );
}

function getTooltipLabel(countryCode: string, known: boolean, label?: string): string {
  if (label) return label;
  if (known) return getCountryName(countryCode as Parameters<typeof getCountryName>[0], "en");
  return countryCode ? `Unknown country (${countryCode})` : "Unknown country";
}

/**
 * Renders a country-flag-icons registry identifier through a consistent, accessible 3:2 flag surface.
 */
export const VireoCountryFlag = React.forwardRef<HTMLSpanElement, VireoCountryFlagProps>(
  function VireoCountryFlag(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_COUNTRY_FLAG_NAME });
    const {
      className,
      classes: classesProp,
      countryCode,
      enableTooltip = false,
      label,
      slotProps = {},
      slots = {},
      style,
      sx,
      width = 24,
      ...other
    } = props;

    const FlagComponent = getFlagComponent(countryCode);
    const known = Boolean(FlagComponent);
    const ownerState: VireoCountryFlagOwnerState = { countryCode, enableTooltip, known, width };
    const classes = useUtilityClasses(ownerState, classesProp);
    const tooltipLabel = getTooltipLabel(countryCode, known, label);
    const accessibleLabel = label || (enableTooltip ? tooltipLabel : undefined);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const rootSlotClassName = resolvedRootSlotProps.className;
    const rootSlotRef = resolvedRootSlotProps.ref;
    const rootSlotStyle = resolvedRootSlotProps.style;
    const rootSlotSx = resolvedRootSlotProps.sx;
    const rootSlotOther = { ...resolvedRootSlotProps };
    delete rootSlotOther["aria-hidden"];
    delete rootSlotOther["aria-label"];
    delete rootSlotOther.children;
    delete rootSlotOther.className;
    delete rootSlotOther.dangerouslySetInnerHTML;
    delete rootSlotOther.ref;
    delete rootSlotOther.role;
    delete rootSlotOther.style;
    delete rootSlotOther.sx;
    delete rootSlotOther.title;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    const resolvedFlagSlotProps = resolveSlotProps(slotProps.flag, ownerState);
    const flagSlotClassName = resolvedFlagSlotProps.className;
    const flagSlotRef = resolvedFlagSlotProps.ref;
    const flagSlotStyle = resolvedFlagSlotProps.style;
    const flagSlotOther = { ...resolvedFlagSlotProps };
    delete flagSlotOther["aria-hidden"];
    delete flagSlotOther.children;
    delete flagSlotOther.className;
    delete flagSlotOther.focusable;
    delete flagSlotOther.height;
    delete flagSlotOther.ref;
    delete flagSlotOther.style;
    delete flagSlotOther.viewBox;
    delete flagSlotOther.width;

    const flag = (
      <VireoCountryFlagRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "span"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
        role={accessibleLabel ? "img" : undefined}
        aria-label={accessibleLabel}
        aria-hidden={accessibleLabel ? undefined : true}
      >
        <VireoCountryFlagFlag
          {...flagSlotOther}
          as={slots.flag ?? FlagComponent ?? UnknownCountryFlag}
          ref={flagSlotRef}
          ownerState={ownerState}
          className={joinClassNames(classes.flag, flagSlotClassName)}
          style={flagSlotStyle}
          width="24"
          height="16"
          viewBox="0 0 24 16"
          aria-hidden="true"
          focusable="false"
        />
      </VireoCountryFlagRoot>
    );

    if (!enableTooltip) return flag;

    const TooltipSlot = slots.tooltip ?? Tooltip;
    const resolvedTooltipSlotProps = resolveSlotProps(slotProps.tooltip, ownerState);
    const tooltipSlotClasses = resolvedTooltipSlotProps.classes;
    const disableInteractive = resolvedTooltipSlotProps.disableInteractive ?? true;
    const placement = resolvedTooltipSlotProps.placement ?? "top";
    const tooltipSlotOther = { ...resolvedTooltipSlotProps };
    delete tooltipSlotOther.children;
    delete tooltipSlotOther.classes;
    delete tooltipSlotOther.disableInteractive;
    delete tooltipSlotOther.placement;
    delete tooltipSlotOther.title;

    return (
      <TooltipSlot
        {...tooltipSlotOther}
        title={tooltipLabel}
        placement={placement}
        disableInteractive={disableInteractive}
        classes={{ ...tooltipSlotClasses, tooltip: joinClassNames(classes.tooltip, tooltipSlotClasses?.tooltip) }}
      >
        {flag}
      </TooltipSlot>
    );
  },
);

VireoCountryFlag.displayName = VIREO_COUNTRY_FLAG_NAME;
