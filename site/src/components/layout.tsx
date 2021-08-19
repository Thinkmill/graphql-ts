import { ReactNode } from "react";

import * as styles from "./layout.css";

export function Header() {
  return (
    <h1 className={styles.header}>@graphql-ts/schema API Documentation</h1>
  );
}

export function NavigationContainer({ children }: { children: ReactNode }) {
  return <div className={styles.navigationContainer}>{children}</div>;
}

export function Contents({ children }: { children: ReactNode }) {
  return <div className={styles.contents}>{children}</div>;
}
