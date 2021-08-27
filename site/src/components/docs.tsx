import { splitDocs } from "../lib/utils";
import { Markdown } from "./markdown";
import ChevronDoubleDown from "./icons/chevron-double-down";
import ChevronDoubleUp from "./icons/chevron-double-up";

import * as styles from "./docs.css";

export function Docs({ content }: { content: string | undefined }) {
  if (!content) return null;

  const { first, rest } = splitDocs(content);

  if (!rest) {
    return (
      <div className={styles.docs}>
        <Markdown content={first} />
      </div>
    );
  }
  return (
    <details className={styles.details}>
      <summary css={{ display: "block" }}>
        <Markdown content={first} />
        <div className={styles.expandLinkOpen}>
          <ChevronDoubleDown className={styles.expandIcon} />
          more
        </div>
        <div className={styles.expandLinkClose}>
          <ChevronDoubleUp className={styles.expandIcon} />
          less
        </div>
      </summary>
      <Markdown content={rest} />
    </details>
  );
}
