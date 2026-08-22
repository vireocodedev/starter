import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoFileImagePreviewClassKey,
  getVireoFileImagePreviewUtilityClass,
} from "./VireoFileImagePreview.classes";
import { VIREO_FILE_IMAGE_PREVIEW_NAME, type VireoFileImagePreviewSlotName } from "./VireoFileImagePreview.identity";
import {
  VireoFileImagePreviewFallback,
  VireoFileImagePreviewImage,
  VireoFileImagePreviewRoot,
} from "./VireoFileImagePreview.styled";
import { type VireoFileImagePreviewOwnerState, type VireoFileImagePreviewProps } from "./VireoFileImagePreview.types";

function useUtilityClasses(
  ownerState: VireoFileImagePreviewOwnerState,
  classes?: VireoFileImagePreviewProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
      image: ["image"],
      fallback: ["fallback", !ownerState.available && "unavailable"],
    } as const satisfies UtilityClassSlotMap<VireoFileImagePreviewSlotName, VireoFileImagePreviewClassKey>,
    getVireoFileImagePreviewUtilityClass,
    classes,
  );
}

/**
 * Renders an opt-in, object-URL-backed preview for a browser image File.
 */
export const VireoFileImagePreview = React.forwardRef<HTMLDivElement, VireoFileImagePreviewProps>(
  function VireoFileImagePreview(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FILE_IMAGE_PREVIEW_NAME });
    const {
      alt = "",
      className,
      classes: classesProp,
      file,
      objectFit = "contain",
      previewUnavailableText = "Preview unavailable",
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;

    const [decodeFailed, setDecodeFailed] = React.useState(false);
    const previewable = file.type.toLowerCase().startsWith("image/");
    const [preview, setPreview] = React.useState<{ file: File; url: string }>();
    const objectUrl = preview?.file === file ? preview.url : undefined;

    React.useEffect(() => {
      setDecodeFailed(false);
      setPreview(undefined);
      if (!previewable) return;
      const url = URL.createObjectURL(file);
      setPreview({ file, url });
      return () => URL.revokeObjectURL(url);
    }, [file, previewable]);

    const ownerState: VireoFileImagePreviewOwnerState = {
      available: previewable && objectUrl !== undefined && !decodeFailed,
      objectFit,
    };
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
    const resolvedImageSlotProps = resolveSlotProps(slotProps.image, ownerState);
    const { className: imageSlotClassName, onError: imageSlotOnError, ...imageSlotOther } = resolvedImageSlotProps;
    const resolvedFallbackSlotProps = resolveSlotProps(slotProps.fallback, ownerState);
    const { className: fallbackSlotClassName, ...fallbackSlotOther } = resolvedFallbackSlotProps;

    return (
      <VireoFileImagePreviewRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "div"}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {ownerState.available && objectUrl ? (
          <VireoFileImagePreviewImage
            {...imageSlotOther}
            as={slots.image ?? "img"}
            alt={alt}
            src={objectUrl}
            ownerState={ownerState}
            className={joinClassNames(classes.image, imageSlotClassName)}
            onError={event => {
              imageSlotOnError?.(event);
              if (!event.defaultPrevented) setDecodeFailed(true);
            }}
          />
        ) : (
          <VireoFileImagePreviewFallback
            {...fallbackSlotOther}
            as={slots.fallback}
            ownerState={ownerState}
            className={joinClassNames(classes.fallback, fallbackSlotClassName)}
          >
            {previewUnavailableText}
          </VireoFileImagePreviewFallback>
        )}
      </VireoFileImagePreviewRoot>
    );
  },
);

VireoFileImagePreview.displayName = VIREO_FILE_IMAGE_PREVIEW_NAME;
