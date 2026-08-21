import type { VireoDataAttributeValue, VireoThemeComponent } from "@/core/public";
import type { BoxProps, Typography } from "@mui/material";
import type { CreateSlotsAndSlotProps, SlotProps } from "@mui/material/utils";
import type React from "react";
import { type VireoFileImagePreviewClasses, type VireoFileImagePreviewClassKey } from "./VireoFileImagePreview.classes";
import type { VIREO_FILE_IMAGE_PREVIEW_NAME, VireoFileImagePreviewSlotName } from "./VireoFileImagePreview.identity";

export type VireoFileImagePreviewObjectFit = "contain" | "cover";

export type VireoFileImagePreviewOwnerState = {
  available: boolean;
  objectFit: VireoFileImagePreviewObjectFit;
};

export interface VireoFileImagePreviewRootSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFileImagePreviewImageSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

export interface VireoFileImagePreviewFallbackSlotPropsOverrides {
  [key: `data-${string}`]: VireoDataAttributeValue;
}

/** Replaceable semantic regions exposed by {@link VireoFileImagePreview}. */
export type VireoFileImagePreviewSlots = { [TSlotName in VireoFileImagePreviewSlotName]: React.ElementType };

/** Slot props exposed by {@link VireoFileImagePreview}. */
export type VireoFileImagePreviewSlotsAndSlotProps = CreateSlotsAndSlotProps<
  VireoFileImagePreviewSlots,
  {
    /** @default 'div' */
    root: SlotProps<"div", VireoFileImagePreviewRootSlotPropsOverrides, VireoFileImagePreviewOwnerState>;
    /** @default 'img' */
    image: SlotProps<"img", VireoFileImagePreviewImageSlotPropsOverrides, VireoFileImagePreviewOwnerState>;
    /** @default Typography */
    fallback: SlotProps<
      typeof Typography,
      VireoFileImagePreviewFallbackSlotPropsOverrides,
      VireoFileImagePreviewOwnerState
    >;
  }
>;

/** Props owned by {@link VireoFileImagePreview}. */
export type VireoFileImagePreviewOwnProps = VireoFileImagePreviewSlotsAndSlotProps & {
  /** Alternative text for a semantically meaningful preview. @default '' */
  alt?: string;
  /** Override or extend the utility classes applied to each slot. */
  classes?: Partial<VireoFileImagePreviewClasses>;
  /** Image file to preview. */
  file: File;
  /** How the image fits inside the preview surface. @default 'contain' */
  objectFit?: VireoFileImagePreviewObjectFit;
  /** Content shown when the selected file cannot be previewed. @default 'Preview unavailable' */
  previewUnavailableText?: React.ReactNode;
};

/** Props VireoFileImagePreview inherits from its default root after excluding component-owned props. */
export type VireoFileImagePreviewInheritedProps = Omit<BoxProps<"div">, "children" | "component">;

/** Props accepted by {@link VireoFileImagePreview}. */
export type VireoFileImagePreviewProps = VireoFileImagePreviewOwnProps & VireoFileImagePreviewInheritedProps;

declare module "@mui/material/styles" {
  interface Components<Theme = unknown> {
    [VIREO_FILE_IMAGE_PREVIEW_NAME]?: VireoThemeComponent<
      VireoFileImagePreviewProps,
      VireoFileImagePreviewClassKey,
      VireoFileImagePreviewOwnerState,
      Theme
    >;
  }
}
