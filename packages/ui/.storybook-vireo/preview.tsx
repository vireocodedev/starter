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
      // Storybook's static indexer requires this comparator to remain inline.
      // packages/ui/tests/storySort.test.ts protects the mirrored navigation contract.
      // @ts-expect-error Storybook statically evaluates this inline JavaScript comparator before Preview typing applies.
      storySort: (a, b) => {
        const orderedChildren = {
          "": [
            "Documentation",
            "UI",
            "JVM",
            "History",
            "Infrastructure",
            "Localization",
            "Query Engine",
            "SQLite",
            "Shell",
          ],
          Documentation: ["Overview"],
          UI: ["Overview", "Documentation", "Core", "Capabilities", "Integrations"],
          JVM: ["Core", "Auth", "Query Engine", "History", "Offline"],
          "JVM/Core": ["Overview", "Primary Workflow", "Web, Migrations, and Extensions"],
          "JVM/Auth": ["Overview", "Primary Workflow", "Configuration and Security"],
          "JVM/Query Engine": ["Overview", "Primary Workflow", "Configuration, Security, and Persistence"],
          "JVM/History": ["Overview", "Security and Actors"],
          "JVM/Offline": ["Overview", "Primary Workflow", "Configuration, Security, and Persistence"],
          "UI/Documentation": ["Installation", "Guides"],
          "UI/Documentation/Guides": [
            "Common Patterns",
            "Theming",
            "Providers",
            "Augmentable Interfaces",
            "Notifications",
            "Table Patterns",
            "TanStack Query",
            "Drag and Drop",
          ],
          History: [
            "Overview",
            "Primary Workflow",
            "Nested Definitions",
            "Collections",
            "Formatting and Comparison",
            "Node Model",
            "Record Validation",
            "Failure Semantics",
          ],
          Infrastructure: [
            "Overview",
            "Primary Workflow",
            "HTTP and Pagination",
            "Connectivity",
            "Persistent State",
            "Session Expiry",
            "Failure Semantics",
          ],
          Localization: [
            "Overview",
            "Primary Workflow",
            "Late Registration",
            "Custom Namespaces",
            "Number Formatting",
            "Failure Semantics",
          ],
          "Query Engine": [
            "Overview",
            "Primary Workflow",
            "Filter Compilation",
            "SQLite Execution",
            "Config Persistence",
            "Failure Semantics",
          ],
          SQLite: [
            "Overview",
            "Primary Workflow",
            "Managed Runtime",
            "Offline Replay",
            "Hydration State",
            "Offline Utilities",
            "Failure Semantics",
          ],
          Shell: [
            "Overview",
            "Primary Workflow",
            "Sitemap and Paths",
            "Navigation and Config",
            "Auth Redirects",
            "Overlay History",
            "Failure Semantics",
          ],
        };
        const aTitle = a.title ?? "";
        const bTitle = b.title ?? "";
        if (aTitle === bTitle) return 0;

        const aSegments = aTitle.split("/");
        const bSegments = bTitle.split("/");
        const sharedLength = Math.min(aSegments.length, bSegments.length);

        for (let index = 0; index < sharedLength; index += 1) {
          const aSegment = aSegments[index];
          const bSegment = bSegments[index];
          if (aSegment === bSegment) continue;

          const parent = aSegments.slice(0, index).join("/");
          // @ts-expect-error The statically evaluated comparator intentionally uses a dynamic route key.
          const parentOrder = orderedChildren[parent] ?? [];
          const aOrderedIndex = parentOrder.indexOf(aSegment);
          const bOrderedIndex = parentOrder.indexOf(bSegment);
          const aOrder = aOrderedIndex < 0 ? Number.POSITIVE_INFINITY : aOrderedIndex;
          const bOrder = bOrderedIndex < 0 ? Number.POSITIVE_INFINITY : bOrderedIndex;
          if (aOrder !== bOrder) return aOrder - bOrder;

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
