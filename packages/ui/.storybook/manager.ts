import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  theme: create({
    base: "dark",
    brandTitle: "RGO Komunikacije",
    brandUrl: "https://rgo.hr/",
    brandImage: "https://rgo.hr/rgo-en/d/logo.png",
    brandTarget: "_self",
  }),
});
