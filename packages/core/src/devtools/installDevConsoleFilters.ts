import { isTextEmotionNthChildWarning } from "@/devtools/isTextEmotionNthChildWarning";
import { isRequestCanceled } from "@vireocodedev/starter-infrastructure";

type DevConsoleFilter = (text: unknown) => boolean;

const DEV_CONSOLE_FILTERS = [
  isTextEmotionNthChildWarning,
  isRequestCanceled,
] as const satisfies readonly DevConsoleFilter[];

export function installDevConsoleFilters(): void {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const first = args[0];

    if (DEV_CONSOLE_FILTERS.some(filter => filter(first))) {
      return;
    }

    originalError(...args);
  };
}
