import { ReactNode } from "react";

import * as styles from "./layout.css";

export function Header({ packageName }: { packageName: string }) {
  return <h1 className={styles.header}>{packageName} API Documentation</h1>;
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className={styles.pageContainer}>{children}</div>;
}

export function NavigationContainer({ children }: { children: ReactNode }) {
  return <div className={styles.navigationContainer}>{children}</div>;
}

export function Contents({ children }: { children: ReactNode }) {
  return <div className={styles.contents}>{children}</div>;
}
