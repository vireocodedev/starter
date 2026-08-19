import { VireoStorybookProvider } from "../storybook";
import { vireoStorybookTheme } from "./storybook-theme";
import "./preview.css";
import type { Preview } from "@storybook/react-vite";
import React from "react";

const preview: Preview = {
  decorators: [
    Story => (
      <VireoStorybookProvider>
        <div className="vireo-story-surface">
          <Story />
        </div>
      </VireoStorybookProvider>
    ),
  ],
  parameters: {
    layout: "padded",
    controls: {
      sort: "requiredFirst",
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: vireoStorybookTheme,
      controls: {
        sort: "requiredFirst",
      },
    },
    backgrounds: {
      disable: true,
    },
  },
  tags: ["autodocs"],
};

export default preview;
