import { type RgoProvider } from "@/providers/RgoProviders";
import { RGO_ICON_REGISTRY, type RgoIconRegistryKey } from "@/setup/config/RgoIconRegistry";
import { createSvgIcon, type SvgIcon } from "@mui/material";
import React from "react";
import "./RgoIconsProvider.css";

/**
 * Augmentable registry that maps icon names to their React component types.
 *
 * Consumer apps extend this interface via **declaration merging** to register
 * application-specific icons alongside the built-in ones from `@vireocodedev/starter-ui`.
 *
 * ### How to augment in a consumer app
 *
 * Create (or extend) a `.d.ts` file (e.g. `src/@types/rgo.d.ts`) and merge
 * new members into the interface:
 *
 * ```ts
 * // src/@types/rgo.d.ts
 * import { LMS_ICON_REGISTRY } from "@/setup/icons/icons.registry";
 * import type React from "react";
 *
 * declare module "@vireocodedev/starter-ui" {
 *   interface RgoIconRegistry
 *     extends Record<keyof typeof LMS_ICON_REGISTRY, React.ComponentType> {}
 * }
 * ```
 *
 * Every key added to this interface becomes a valid `RgoIconName` that can be
 * used with `<RgoIcon icon="your-icon" />` and the `useIcons` hook.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RgoIconRegistry extends Record<RgoIconRegistryKey, React.ComponentType> {}

// Derived types from the registry
export type RgoIconName = keyof RgoIconRegistry;

type IconsFromRegistry = {
  [K in keyof RgoIconRegistry]: React.ComponentType;
};

export type RgoIconsContext = {
  muiIconsMap: { [K in keyof RgoIconRegistry]: typeof SvgIcon };
};

// eslint-disable-next-line react-refresh/only-export-components
export const RgoIconsContext = React.createContext<RgoIconsContext | undefined>(undefined);

export type RgoIconsProviderProps = {
  icons: Omit<IconsFromRegistry, RgoIconRegistryKey> & Partial<Pick<IconsFromRegistry, RgoIconRegistryKey>>;
};

export const RgoIconsProvider: RgoProvider<RgoIconsProviderProps> = ({ children, icons }) => {
  const muiIconsMap = React.useMemo(() => {
    const mergedIcons = { ...RGO_ICON_REGISTRY, ...icons } as IconsFromRegistry;
    return (Object.entries(mergedIcons) as [RgoIconName, React.ComponentType][]).reduce(
      (acc, [iconName, IconComponent]) => {
        // @ts-ignore
        acc[iconName] = createSvgIcon(<IconComponent />, String(iconName));
        return acc;
      },
      {} as RgoIconsContext["muiIconsMap"],
    );
  }, [icons]);

  return <RgoIconsContext.Provider value={{ muiIconsMap }}>{children}</RgoIconsContext.Provider>;
};
