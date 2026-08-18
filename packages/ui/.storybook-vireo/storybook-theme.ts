import { create } from "storybook/theming";

export const VIREO_STORY_SURFACE_BACKGROUND = "#080d18";

export const vireoStorybookTheme = create({
  base: "dark",
  brandTitle: "Vireo UI",
  brandUrl: "/",
  brandTarget: "_self",
  colorPrimary: "#36c7fa",
  colorSecondary: "#55aeca",
  appBg: "#101828",
  appContentBg: "#1d2939",
  appPreviewBg: VIREO_STORY_SURFACE_BACKGROUND,
  barBg: "#1d2939",
  barTextColor: "#d0d5dd",
  barSelectedColor: "#7cd9fd",
  textColor: "#f9fafb",
  textMutedColor: "#98a2b3",
  inputBg: "#101828",
  inputBorder: "#475467",
  inputTextColor: "#f9fafb",
  booleanBg: "#344054",
  booleanSelectedBg: "#0170a3",
});
