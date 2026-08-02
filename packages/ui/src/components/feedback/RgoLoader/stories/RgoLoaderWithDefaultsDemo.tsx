import { RgoLoader, type RgoLoaderProps } from "@/components/feedback/RgoLoader/RgoLoader";

export function RgoLoaderWithDefaultsDemo(props: RgoLoaderProps = {}) {
  return <RgoLoader {...props} />;
}

export const RgoLoaderWithDefaultsDemoCode = `
import { RgoLoader, type RgoLoaderProps } from "@vireocodedev/starter-ui";

export function RgoLoaderWithDefaultsDemo(props: RgoLoaderProps = {}) {
  return <RgoLoader {...props} />;
}`;
