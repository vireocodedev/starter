import { useVireoPageLayout } from "@/capabilities/page-layout/hooks/useVireoPageLayout/useVireoPageLayout";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoResponsiveCardClassKey, getVireoResponsiveCardUtilityClass } from "./VireoResponsiveCard.classes";
import { VIREO_RESPONSIVE_CARD_NAME, type VireoResponsiveCardSlotName } from "./VireoResponsiveCard.identity";
import { VireoResponsiveCardRoot } from "./VireoResponsiveCard.styled";
import type { VireoResponsiveCardOwnerState, VireoResponsiveCardProps } from "./VireoResponsiveCard.types";

function useUtilityClasses(classes?: VireoResponsiveCardProps["classes"]) {
  return composeClasses(
    { root: ["root"] } as const satisfies UtilityClassSlotMap<VireoResponsiveCardSlotName, VireoResponsiveCardClassKey>,
    getVireoResponsiveCardUtilityClass,
    classes,
  );
}
/** Keeps stable card markup while adapting its visual surface to the nearest page container mode. */
export const VireoResponsiveCard = React.forwardRef<HTMLDivElement, VireoResponsiveCardProps>(
  function VireoResponsiveCard(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_RESPONSIVE_CARD_NAME });
    const {
      children,
      className,
      classes: classesProp,
      slotProps = {},
      slots = {},
      style,
      surfaceOnCompact = false,
      sx,
      ...other
    } = props;
    const layout = useVireoPageLayout();
    const ownerState: VireoResponsiveCardOwnerState = { mode: layout.mode, surfaceOnCompact };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const ref = useForkRef(forwardedRef, root.ref);
    return (
      <VireoResponsiveCardRoot
        {...other}
        {...root}
        as={slots.root}
        ref={ref}
        ownerState={ownerState}
        data-vireo-page-mode={layout.mode}
        className={joinClassNames(classes.root, className, root.className)}
        style={{ ...style, ...root.style }}
        sx={mergeSx(sx, root.sx)}
      >
        {children}
      </VireoResponsiveCardRoot>
    );
  },
);
VireoResponsiveCard.displayName = VIREO_RESPONSIVE_CARD_NAME;
