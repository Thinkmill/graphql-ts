import { useState } from "react";

import { splitDocs } from "../lib/utils";
import { Markdown } from "./markdown";
import ChevronDoubleDown from "./icons/chevron-double-down";
import ChevronDoubleUp from "./icons/chevron-double-up";

import * as styles from "./docs.css";

export function Docs({ content }: { content: string | undefined }) {
  const [isOpen, setIsOpen] = useState(false);

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
    <div className={styles.docs}>
      <Markdown content={first} />
      {isOpen ? (
        <>
          <Markdown content={rest} />
          <div
            onClick={() => setIsOpen(false)}
            className={styles.expandLinkClose}
          >
            <ChevronDoubleUp className={styles.expandIcon} />
            <div>less</div>
          </div>
        </>
      ) : (
        <div onClick={() => setIsOpen(true)} className={styles.expandLinkOpen}>
          <ChevronDoubleDown className={styles.expandIcon} />
          <div>more</div>
        </div>
      )}
    </div>
  );
}