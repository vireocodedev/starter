import React from "react";

export type VireoStorybookThemeMode = "dark" | "light";

export const VireoStorybookThemeModeContext = React.createContext<VireoStorybookThemeMode>("dark");
