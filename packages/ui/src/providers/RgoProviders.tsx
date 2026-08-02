import { type TODO } from "@/utils/typeutils";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type RgoProvider<T extends Record<string, TODO> = {}> = React.FC<{ children: React.ReactNode } & T>;

const nest = (children: React.ReactNode, Provider: RgoProvider) => <Provider>{children}</Provider>;

export const RgoProviders: React.FC<{
  list: Array<RgoProvider>;
  children: React.ReactNode;
}> = ({ children, list }) => {
  return <>{list.reduceRight(nest, children)}</>;
};
