import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses, type ButtonProps } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoTruncatedContentClassKey,
  getVireoTruncatedContentUtilityClass,
} from "./VireoTruncatedContent.classes";
import { VIREO_TRUNCATED_CONTENT_NAME, type VireoTruncatedContentSlotName } from "./VireoTruncatedContent.identity";
import {
  VireoTruncatedContentContent,
  VireoTruncatedContentRoot,
  VireoTruncatedContentToggle,
  VireoTruncatedContentViewport,
} from "./VireoTruncatedContent.styled";
import { type VireoTruncatedContentOwnerState, type VireoTruncatedContentProps } from "./VireoTruncatedContent.types";

type OverflowCheck = () => void;
const overflowChecks = new Map<Element, OverflowCheck>();
const pendingOverflowChecks = new Set<Element>();
let sharedOverflowObserver: ResizeObserver | null = null;
let overflowAnimationFrame: number | null = null;
const useBrowserLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function observeContent(element: Element, checkOverflow: OverflowCheck) {
  overflowChecks.set(element, checkOverflow);
  if (!sharedOverflowObserver) {
    sharedOverflowObserver = new ResizeObserver(entries => {
      for (const entry of entries) pendingOverflowChecks.add(entry.target);
      if (overflowAnimationFrame !== null) return;
      overflowAnimationFrame = window.requestAnimationFrame(() => {
        overflowAnimationFrame = null;
        const elements = [...pendingOverflowChecks];
        pendingOverflowChecks.clear();
        for (const observedElement of elements) overflowChecks.get(observedElement)?.();
      });
    });
  }
  sharedOverflowObserver.observe(element);
  return () => {
    sharedOverflowObserver?.unobserve(element);
    overflowChecks.delete(element);
    pendingOverflowChecks.delete(element);
    if (overflowChecks.size !== 0) return;
    sharedOverflowObserver?.disconnect();
    sharedOverflowObserver = null;
    if (overflowAnimationFrame !== null) window.cancelAnimationFrame(overflowAnimationFrame);
    overflowAnimationFrame = null;
    pendingOverflowChecks.clear();
  };
}

function useUtilityClasses(
  ownerState: VireoTruncatedContentOwnerState,
  classes?: VireoTruncatedContentProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
      viewport: ["viewport"],
      content: ["content"],
      toggle: ["toggle"],
    } as const satisfies UtilityClassSlotMap<VireoTruncatedContentSlotName, VireoTruncatedContentClassKey>,
    getVireoTruncatedContentUtilityClass,
    classes,
  );
}

/** Collapses overflowing React content and exposes an accessible control that lets users reveal or hide it. */
export const VireoTruncatedContent = React.forwardRef<HTMLDivElement, VireoTruncatedContentProps>(
  function VireoTruncatedContent(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_TRUNCATED_CONTENT_NAME });
    const {
      children,
      className,
      classes: classesProp,
      collapseLabel,
      collapsedHeight = 40,
      defaultExpanded = false,
      expandLabel,
      expanded: expandedProp,
      onExpandedChange,
      slotProps = {},
      slots = {},
      stopPropagation = false,
      style,
      sx,
      ...other
    } = props;
    const contentId = React.useId();
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [canExpand, setCanExpand] = React.useState(false);
    const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState(defaultExpanded);
    const expanded = expandedProp ?? uncontrolledExpanded;
    const ownerState: VireoTruncatedContentOwnerState = { collapsedHeight, expanded, canExpand };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedViewportSlotProps = resolveSlotProps(slotProps.viewport, ownerState);
    const resolvedContentSlotProps = resolveSlotProps(slotProps.content, ownerState);
    const resolvedToggleSlotProps = resolveSlotProps(slotProps.toggle, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const { className: viewportSlotClassName, ...viewportSlotOther } = resolvedViewportSlotProps;
    const { className: contentSlotClassName, ref: contentSlotRef, ...contentSlotOther } = resolvedContentSlotProps;
    const resolvedContentRef = useForkRef(contentRef, contentSlotRef);
    const { className: toggleSlotClassName, onClick: toggleSlotOnClick, ...toggleSlotOther } = resolvedToggleSlotProps;

    const checkOverflow = React.useCallback(() => {
      const content = contentRef.current;
      if (!content) return;
      const verticallyOverflows = content.scrollHeight > collapsedHeight + 1;
      const nextCanExpand = verticallyOverflows || content.scrollWidth > content.clientWidth + 1;
      setCanExpand(current => (current === nextCanExpand ? current : nextCanExpand));
      if (!nextCanExpand && expandedProp === undefined) setUncontrolledExpanded(false);
    }, [collapsedHeight, expandedProp]);

    useBrowserLayoutEffect(() => checkOverflow(), [children, checkOverflow]);
    useBrowserLayoutEffect(() => {
      const content = contentRef.current;
      if (content) return observeContent(content, checkOverflow);
    }, [checkOverflow]);

    const handleToggleClick = React.useCallback<NonNullable<ButtonProps["onClick"]>>(
      event => {
        toggleSlotOnClick?.(event);
        if (stopPropagation) event.stopPropagation();
        if (event.defaultPrevented) return;
        const nextExpanded = !expanded;
        if (expandedProp === undefined) setUncontrolledExpanded(nextExpanded);
        onExpandedChange?.(nextExpanded);
      },
      [expanded, expandedProp, onExpandedChange, stopPropagation, toggleSlotOnClick],
    );

    return (
      <VireoTruncatedContentRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <VireoTruncatedContentViewport
          {...viewportSlotOther}
          as={slots.viewport ?? "div"}
          id={contentId}
          ownerState={ownerState}
          className={joinClassNames(classes.viewport, viewportSlotClassName)}
        >
          <VireoTruncatedContentContent
            {...contentSlotOther}
            as={slots.content ?? "div"}
            ref={resolvedContentRef}
            ownerState={ownerState}
            className={joinClassNames(classes.content, contentSlotClassName)}
          >
            {children}
          </VireoTruncatedContentContent>
        </VireoTruncatedContentViewport>
        {canExpand ? (
          <VireoTruncatedContentToggle
            size="small"
            variant="text"
            {...toggleSlotOther}
            as={slots.toggle}
            ownerState={ownerState}
            className={joinClassNames(classes.toggle, toggleSlotClassName)}
            aria-controls={contentId}
            aria-expanded={expanded}
            onClick={handleToggleClick}
          >
            {expanded ? collapseLabel : expandLabel}
          </VireoTruncatedContentToggle>
        ) : null}
      </VireoTruncatedContentRoot>
    );
  },
);

VireoTruncatedContent.displayName = VIREO_TRUNCATED_CONTENT_NAME;
