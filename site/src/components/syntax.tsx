import { codeFont } from "../lib/theme.css";
import { syntaxKinds } from "./syntax.css";

export function Syntax({
  children,
  kind,
}: {
  children: string | number | (string | number)[];
  kind: keyof typeof syntaxKinds;
}) {
  return <span className={`${syntaxKinds[kind]} ${codeFont}`}>{children}</span>;
}
