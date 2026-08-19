import {
  VireoLabeledIconButton,
  type VireoLabeledIconButtonProps,
} from "@/core/components/controls/VireoLabeledIconButton";
import { VireoIcon, type VireoIconProps } from "@/core/components/data-display/VireoIcon";
import type { VireoIconName } from "@/core/providers/VireoIconRegistryProvider/VireoIconRegistryProvider";
import type { BoxProps, ButtonProps, TypographyProps } from "@mui/material";
import type React from "react";

export type RgoIconButtonSlotProps = Partial<{
  root: Omit<ButtonProps, "children" | "disabled" | "color">;
  rootContent: Omit<BoxProps, "children">;
  rootContentIcon: Omit<VireoIconProps, "icon">;
  rootContentStatusDot: Omit<BoxProps, "children">;
  label: Omit<TypographyProps, "children">;
}>;
export type RgoIconButtonProps = {
  onClick: () => void;
  label: string;
  color?: ButtonProps["color"];
  disabled?: boolean;
  icon?: VireoIconName | React.ReactNode;
  selected?: boolean;
  showStatusDot?: boolean;
  rgoSlotProps?: RgoIconButtonSlotProps;
};

/** @deprecated Use VireoLabeledIconButton. */
export function RgoIconButton({ rgoSlotProps, icon, ...props }: RgoIconButtonProps) {
  const resolvedIcon =
    typeof icon === "string" ? (
      <VireoIcon {...rgoSlotProps?.rootContentIcon} icon={icon as VireoIconName} />
    ) : icon == null ? undefined : (
      <>{icon}</>
    );
  return (
    <VireoLabeledIconButton
      {...props}
      icon={resolvedIcon}
      slotProps={
        {
          root: rgoSlotProps?.root,
          visual: rgoSlotProps?.rootContent,
          statusDot: rgoSlotProps?.rootContentStatusDot,
          label: rgoSlotProps?.label,
        } as VireoLabeledIconButtonProps["slotProps"]
      }
    />
  );
}
