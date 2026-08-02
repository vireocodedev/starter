import { type SxProps, type Theme } from "@mui/material";

/**
 * @see {@link https://mui.com/system/getting-started/the-sx-prop/#passing-the-sx-prop Passing the sx prop docs}
 */
export function composeSx(sx?: SxProps<Theme>, defaultSx: SxProps<Theme> = {}): SxProps<Theme> {
  if (sx === undefined) {
    return defaultSx;
  }

  return [defaultSx, ...(Array.isArray(sx) ? sx : [sx])];
}
