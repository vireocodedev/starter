import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { Tooltip, type IconButtonProps, unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoJsonViewerClassKey, getVireoJsonViewerUtilityClass } from "./VireoJsonViewer.classes";
import { VIREO_JSON_VIEWER_NAME, type VireoJsonViewerSlotName } from "./VireoJsonViewer.identity";
import {
  VireoJsonViewerContent,
  VireoJsonViewerCopyButton,
  VireoJsonViewerCopyIcon,
  VireoJsonViewerRoot,
  VireoJsonViewerToolbar,
} from "./VireoJsonViewer.styled";
import { type VireoJsonViewerOwnerState, type VireoJsonViewerProps } from "./VireoJsonViewer.types";

const COPY_FEEDBACK_DURATION_MS = 1500;

function createJsonReplacer() {
  const seen = new WeakSet<object>();

  return (_key: string, value: unknown): unknown => {
    if (value instanceof Error) {
      return { name: value.name, message: value.message, stack: value.stack };
    }
    if (typeof value === "bigint") return value.toString();
    if (typeof value === "function") return `<function ${value.name || "anonymous"}>`;
    if (typeof value === "symbol") return `<symbol ${value.description ?? ""}>`;
    if (typeof value === "undefined") return "<undefined>";
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "<circular>";
      seen.add(value);
    }
    return value;
  };
}

function stringifyJson(data: unknown): string {
  try {
    return JSON.stringify(data, createJsonReplacer(), 2) ?? String(data);
  } catch (error) {
    return `<unable to stringify: ${error instanceof Error ? error.message : String(error)}>`;
  }
}

function useUtilityClasses(_ownerState: VireoJsonViewerOwnerState, classes?: VireoJsonViewerProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      toolbar: ["toolbar"],
      copyButton: ["copyButton"],
      copyIcon: ["copyIcon"],
      content: ["content"],
    } as const satisfies UtilityClassSlotMap<VireoJsonViewerSlotName, VireoJsonViewerClassKey>,
    getVireoJsonViewerUtilityClass,
    classes,
  );
}

/** Pretty-prints arbitrary values as inspectable JSON with resilient serialization and copy-to-clipboard feedback. */
export const VireoJsonViewer = React.forwardRef<HTMLDivElement, VireoJsonViewerProps>(
  function VireoJsonViewer(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_JSON_VIEWER_NAME });
    const {
      className,
      classes: classesProp,
      copiedLabel,
      copyLabel,
      data,
      maxHeight = "24rem",
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;

    const [copied, setCopied] = React.useState(false);
    const copyFeedbackTimeoutRef = React.useRef<number | null>(null);
    const text = React.useMemo(() => stringifyJson(data), [data]);

    const ownerState: VireoJsonViewerOwnerState = { copied, maxHeight };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedToolbarSlotProps = resolveSlotProps(slotProps.toolbar, ownerState);
    const resolvedCopyButtonSlotProps = resolveSlotProps(slotProps.copyButton, ownerState);
    const resolvedCopyIconSlotProps = resolveSlotProps(slotProps.copyIcon, ownerState);
    const resolvedContentSlotProps = resolveSlotProps(slotProps.content, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    const { className: toolbarSlotClassName, ...toolbarSlotOther } = resolvedToolbarSlotProps;
    const {
      className: copyButtonSlotClassName,
      onClick: copyButtonSlotOnClick,
      ...copyButtonSlotOther
    } = resolvedCopyButtonSlotProps;
    const { className: copyIconSlotClassName, ...copyIconSlotOther } = resolvedCopyIconSlotProps;
    const { className: contentSlotClassName, ...contentSlotOther } = resolvedContentSlotProps;

    const currentCopyLabel = copied ? copiedLabel : copyLabel;
    const clearCopyFeedbackTimeout = React.useCallback(() => {
      if (copyFeedbackTimeoutRef.current === null || typeof window === "undefined") return;
      window.clearTimeout(copyFeedbackTimeoutRef.current);
      copyFeedbackTimeoutRef.current = null;
    }, []);

    React.useEffect(() => clearCopyFeedbackTimeout, [clearCopyFeedbackTimeout]);
    React.useEffect(() => {
      clearCopyFeedbackTimeout();
      setCopied(false);
    }, [clearCopyFeedbackTimeout, text]);

    const handleCopyClick = React.useCallback<NonNullable<IconButtonProps["onClick"]>>(
      async event => {
        copyButtonSlotOnClick?.(event);
        if (event.defaultPrevented) return;

        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          clearCopyFeedbackTimeout();
          copyFeedbackTimeoutRef.current = window.setTimeout(() => {
            copyFeedbackTimeoutRef.current = null;
            setCopied(false);
          }, COPY_FEEDBACK_DURATION_MS);
        } catch {
          // Clipboard access may be unavailable or denied; keep the viewer usable.
        }
      },
      [clearCopyFeedbackTimeout, copyButtonSlotOnClick, text],
    );

    return (
      <VireoJsonViewerRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <VireoJsonViewerToolbar
          {...toolbarSlotOther}
          as={slots.toolbar}
          ownerState={ownerState}
          className={joinClassNames(classes.toolbar, toolbarSlotClassName)}
        >
          <Tooltip title={currentCopyLabel}>
            <VireoJsonViewerCopyButton
              size="small"
              {...copyButtonSlotOther}
              as={slots.copyButton}
              ownerState={ownerState}
              className={joinClassNames(classes.copyButton, copyButtonSlotClassName)}
              aria-label={currentCopyLabel}
              onClick={handleCopyClick}
            >
              <VireoJsonViewerCopyIcon
                {...copyIconSlotOther}
                as={slots.copyIcon}
                ownerState={ownerState}
                className={joinClassNames(classes.copyIcon, copyIconSlotClassName)}
                aria-hidden="true"
                focusable="false"
              />
            </VireoJsonViewerCopyButton>
          </Tooltip>
        </VireoJsonViewerToolbar>

        <VireoJsonViewerContent
          {...contentSlotOther}
          as={slots.content}
          ownerState={ownerState}
          className={joinClassNames(classes.content, contentSlotClassName)}
          tabIndex={0}
        >
          {text}
        </VireoJsonViewerContent>
      </VireoJsonViewerRoot>
    );
  },
);

VireoJsonViewer.displayName = VIREO_JSON_VIEWER_NAME;
