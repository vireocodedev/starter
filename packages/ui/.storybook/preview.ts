import { StorybookDecorator } from "./storybook-decorator";

export { globalTypes } from "./storybook-global-types";

export default {
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    options: {
      // The `a` and `b` arguments in this function have a type of `import('storybook/internal/types').IndexEntry`. Remember that the function is executed in a JavaScript environment, so use JSDoc for IntelliSense to introspect it.
      // @ts-ignore
      storySort: (a, b) => {
        // Define priority order for specific categories, subcategories, and components
        const STORY_NAMES_ORDER = [
          "Documentation/Overview",
          "Documentation/Installation",
          "Documentation/Theming Guide",
          "Documentation/Providers Guide",
          "Documentation/Common Patterns",
          "Documentation/Table Patterns Guide",
          "Documentation/Form And Input Style Guide",
          "Documentation/Services And Utilities",
          "Components",
          "Hooks",
          "Providers",
          "Services",
          "Internal",
        ];

        const priorityOrder = STORY_NAMES_ORDER;

        // Helper function to get priority index
        // @ts-ignore
        const getPriorityIndex = title => {
          const index = priorityOrder.findIndex(priority => title.startsWith(priority));
          return index === -1 ? priorityOrder.length : index;
        };

        const aPriority = getPriorityIndex(a.title);
        const bPriority = getPriorityIndex(b.title);

        // If priorities are different, sort by priority
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // Internal group comes last
        const aIsInternal = a.title.startsWith("Internal");
        const bIsInternal = b.title.startsWith("Internal");

        if (aIsInternal && !bIsInternal) {
          return 1;
        }
        if (!aIsInternal && bIsInternal) {
          return -1;
        }

        // Same priority or no priority, sort alphabetically
        return a.title.localeCompare(b.title);
      },
    },
    controls: {
      sort: "requiredFirst",
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Hide the default background selector since we're handling it with our custom theme toggle
    backgrounds: {
      disable: true,
    },
    docs: {
      controls: {
        sort: "requiredFirst",
      },
    },
  },
  decorators: [StorybookDecorator],
};
