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
    options: {
      // @ts-expect-error Storybook statically evaluates this inline JavaScript comparator before Preview typing applies.
      storySort: (a, b) => {
        const aSegments = a.title.split("/");
        const bSegments = b.title.split("/");
        const sharedLength = Math.min(aSegments.length, bSegments.length);

        for (let index = 0; index < sharedLength; index += 1) {
          const aSegment = aSegments[index];
          const bSegment = bSegments[index];
          if (aSegment === bSegment) continue;

          const aIsLeaf = index === aSegments.length - 1;
          const bIsLeaf = index === bSegments.length - 1;
          if (aIsLeaf !== bIsLeaf) return aIsLeaf ? -1 : 1;

          return aSegment.localeCompare(bSegment);
        }

        return aSegments.length - bSegments.length;
      },
    },
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
