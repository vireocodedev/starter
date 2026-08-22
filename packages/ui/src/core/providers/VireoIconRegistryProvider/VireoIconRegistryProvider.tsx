import { createSvgIcon, type SvgIcon } from "@mui/material";
import React from "react";

const BUILT_IN_ICON_REGISTRY = {
  "check-circle": () => (
    <path
      d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  "x-circle": () => (
    <path
      d="M15 9L9 15M9 9L15 15M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
} as const satisfies Record<string, React.ComponentType>;

export type VireoBuiltInIconName = keyof typeof BUILT_IN_ICON_REGISTRY;

/** Augment this interface to register application-owned icons by name. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VireoIconRegistry extends Record<VireoBuiltInIconName, React.ComponentType> {}

export type VireoIconName = keyof VireoIconRegistry;

type IconsFromRegistry = {
  [TIconName in VireoIconName]: React.ComponentType;
};

export type VireoIconRegistryContextValue = {
  muiIconsMap: { [TIconName in VireoIconName]: typeof SvgIcon };
};

export const VireoIconRegistryContext = React.createContext<VireoIconRegistryContextValue | undefined>(undefined);

export type VireoIconRegistryProviderProps = React.PropsWithChildren<{
  /** Application icon geometry keyed by the augmented registry names. Built-in icons may be overridden. */
  icons?: Partial<IconsFromRegistry> & Record<string, React.ComponentType>;
}>;

/** Provides the typed icon registry consumed by VireoIcon. */
export function VireoIconRegistryProvider({ children, icons = {} }: VireoIconRegistryProviderProps) {
  const muiIconsMap = React.useMemo(() => {
    const mergedIcons = { ...BUILT_IN_ICON_REGISTRY, ...icons } as IconsFromRegistry;
    return Object.fromEntries(
      (Object.entries(mergedIcons) as [VireoIconName, React.ComponentType][]).map(([iconName, IconComponent]) => [
        iconName,
        createSvgIcon(<IconComponent />, String(iconName)),
      ]),
    ) as VireoIconRegistryContextValue["muiIconsMap"];
  }, [icons]);

  return <VireoIconRegistryContext.Provider value={{ muiIconsMap }}>{children}</VireoIconRegistryContext.Provider>;
}
