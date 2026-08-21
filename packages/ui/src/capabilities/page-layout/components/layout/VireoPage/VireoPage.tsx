import { VireoPageLayoutContext } from "@/capabilities/page-layout/contexts/VireoPageLayoutContext/VireoPageLayoutContext";
import { useMeasuredVireoPageLayout } from "@/capabilities/page-layout/hooks/useMeasuredVireoPageLayout/useMeasuredVireoPageLayout";
import { createVireoPageLayout } from "@/capabilities/page-layout/utils/pageLayout.utils";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoPageClassKey, getVireoPageUtilityClass } from "./VireoPage.classes";
import { VIREO_PAGE_NAME, type VireoPageSlotName } from "./VireoPage.identity";
import { VireoPageRoot } from "./VireoPage.styled";
import type { VireoPageOwnerState, VireoPageProps } from "./VireoPage.types";

function useUtilityClasses(classes?: VireoPageProps["classes"]) {
  return composeClasses(
    { root: ["root"] } as const satisfies UtilityClassSlotMap<VireoPageSlotName, VireoPageClassKey>,
    getVireoPageUtilityClass,
    classes,
  );
}

/** Establishes a container-measured page-layout context and the standard bounded page frame. */
export const VireoPage = React.forwardRef<HTMLDivElement, VireoPageProps>(function VireoPage(inProps, forwardedRef) {
  const props = useThemeProps({ props: inProps, name: VIREO_PAGE_NAME });
  const {
    children,
    className,
    classes: classesProp,
    forceCompact,
    measureParent,
    measurementPaused,
    mode,
    reservedInlineSize,
    slotProps = {},
    slots = {},
    style,
    sx,
    ...other
  } = props;
  const measured = useMeasuredVireoPageLayout({
    mode,
    forceCompact,
    measureParent,
    paused: measurementPaused,
    reservedInlineSize,
  });
  const ownerState: VireoPageOwnerState = { mode: measured.mode };
  const classes = useUtilityClasses(classesProp);
  const resolved = resolveSlotProps(slotProps.root, ownerState);
  const { className: slotClassName, ref: slotRef, style: slotStyle, sx: slotSx, ...slotOther } = resolved;
  const ref = useForkRef(forwardedRef, measured.ref, slotRef);
  const layout = React.useMemo(() => createVireoPageLayout(measured.mode), [measured.mode]);
  return (
    <VireoPageLayoutContext.Provider value={layout}>
      <VireoPageRoot
        {...other}
        {...slotOther}
        as={slots.root ?? "div"}
        ref={ref}
        ownerState={ownerState}
        data-vireo-page-mode={measured.mode}
        className={joinClassNames(classes.root, className, slotClassName)}
        style={{ ...style, ...slotStyle }}
        sx={mergeSx(sx, slotSx)}
      >
        {children}
      </VireoPageRoot>
    </VireoPageLayoutContext.Provider>
  );
});

VireoPage.displayName = VIREO_PAGE_NAME;
