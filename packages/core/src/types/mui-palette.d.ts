// The starter theme extends MUI palette colors with numeric tonal shades. The
// shell nav components read e.g. `palette.primary[600]`. Bundled for the
// package's own typecheck; consuming apps supply their own global augmentation.
import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Color {
    25: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
    975: string;
  }

  interface PaletteColor {
    25: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
    975: string;
  }
}
