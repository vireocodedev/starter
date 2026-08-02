import { RgoPageHeader, type RgoPageHeaderProps } from "@/components/layout/RgoPageHeader/RgoPageHeader";

export function RgoPageHeaderWithDefaultPropsDemo({ title = "Page Title", ...props }: RgoPageHeaderProps) {
  return <RgoPageHeader {...props} title={title} />;
}

export const RgoPageHeaderWithDefaultPropsDemoCode = `
import { RgoPageHeader } from "@vireocodedev/starter-ui";

export function RgoPageHeaderWithDefaultPropsDemo() {
  return <RgoPageHeader title="Page Title" />;
}`;
