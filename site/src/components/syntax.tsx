import { syntaxKinds } from "./syntax.css";

export function Syntax({
  children,
  kind,
}: {
  children: string | number | (string | number)[];
  kind: keyof typeof syntaxKinds;
}) {
  return <span className={syntaxKinds[kind]}>{children}</span>;
}
