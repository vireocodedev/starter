import "./RgoPage.css";

export type RgoPageProps = {
  children: React.ReactNode;
};

export function RgoPage({ children }: RgoPageProps) {
  return <div className="rgo-page">{children}</div>;
}
