import { ReactNode } from "react";

import * as styles from "./layout.css";
import { PackageSearch } from "./package-search";

export function Header({ packageName }: { packageName: string }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.headerHeading}>{packageName} API Documentation</h1>
      <div className={styles.headerSearch}>
        <PackageSearch />
      </div>
    </header>
  );
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
