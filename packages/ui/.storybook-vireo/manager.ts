import { vireoStorybookTheme } from "./storybook-theme";
import { addons } from "storybook/manager-api";

addons.setConfig({
  theme: vireoStorybookTheme,
});
