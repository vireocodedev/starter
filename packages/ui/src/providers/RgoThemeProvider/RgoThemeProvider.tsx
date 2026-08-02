import { type RgoProvider } from "@/providers/RgoProviders";
import { CssBaseline, ThemeProvider as MuiThemeProvider, type Theme } from "@mui/material";
import "./RgoThemeProvider.css";

export type RgoThemeProviderProps = {
  theme: Theme;
};

export const RgoThemeProvider: RgoProvider<RgoThemeProviderProps> = ({ children, theme }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
