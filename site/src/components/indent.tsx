import { ReactNode } from "react";
import * as styles from "./indent.css";

export function Indent({ children }: { children: ReactNode }) {
  return <div className={styles.indent}>{children}</div>;
}
