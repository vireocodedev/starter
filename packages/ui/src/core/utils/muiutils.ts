import { type SxProps, type Theme } from "@mui/material";
import type { Interpolation } from "@mui/material/styles";
import { type ComponentType, type ElementType } from "react";

/** Values supported by `data-*` attributes on Vireo component slots. */
export type VireoDataAttributeValue = string | number | boolean | undefined;

/** Ordered public slot-name tuple requiring `root` as its first entry. */
export type VireoSlotNameTuple = readonly ["root", ...string[]];

/** Complete render-time utility-class mapping for a component's public slots. */
export type UtilityClassSlotMap<TSlotName extends string, TClassKey extends string> = Record<
  TSlotName,
  readonly (TClassKey | false | null | undefined)[]
>;

/** Internal props shared by MUI styled slots that react to component owner state. */
export type StyledSlotProps<TOwnerState extends object> = {
  ownerState: TOwnerState;
};

/** Portable component type for exported MUI styled slots. */
export type StyledSlotComponent<TProps extends object, TOwnerState extends object> = ComponentType<
  TProps & StyledSlotProps<TOwnerState> & { as?: ElementType }
>;

/** Direct, compiler-scalable theme contract for one Vireo component. */
export type VireoThemeComponent<
  TProps extends object,
  TClassKey extends string,
  TOwnerState extends object,
  TTheme = unknown,
> = {
  defaultProps?: Partial<TProps>;
  styleOverrides?: Partial<
    Record<
      TClassKey,
      Interpolation<
        TProps & {
          ownerState: TOwnerState;
          theme: TTheme;
        }
      >
    >
  >;
  variants?: Array<{
    props: Partial<TProps> | ((props: Partial<TProps> & { ownerState: TOwnerState }) => boolean);
    style: Interpolation<{ theme: TTheme }>;
  }>;
};

/**
 * @see {@link https://mui.com/system/getting-started/the-sx-prop/#passing-the-sx-prop Passing the sx prop docs}
 */
export function composeSx(sx?: SxProps<Theme>, defaultSx: SxProps<Theme> = {}): SxProps<Theme> {
  if (sx === undefined) {
    return defaultSx;
  }

  return [defaultSx, ...(Array.isArray(sx) ? sx : [sx])];
}

/** Resolves optional static or owner-state callback props into a partial prop object. */
export function resolveSlotProps<TOwnerState, TSlotProps extends object>(
  slotProps: TSlotProps | ((ownerState: TOwnerState) => TSlotProps) | undefined,
  ownerState: TOwnerState,
): Partial<TSlotProps> {
  if (typeof slotProps === "function") {
    return slotProps(ownerState);
  }

  return slotProps ?? {};
}

/** Joins optional class names, omitting empty values. */
export function joinClassNames(...values: Array<string | undefined>): string | undefined {
  const className = values.filter(Boolean).join(" ");

  return className || undefined;
}

/** Combines optional MUI `sx` values in precedence order. */
export function mergeSx(first?: SxProps<Theme>, second?: SxProps<Theme>): SxProps<Theme> | undefined {
  if (first === undefined) return second;
  if (second === undefined) return first;

  return [
    ...(Array.isArray(first) ? first : [first]),
    ...(Array.isArray(second) ? second : [second]),
  ] as SxProps<Theme>;
}
