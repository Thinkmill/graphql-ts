import { ReactNode } from "react";

import { useDocsContext } from "../lib/DocsContext";
import { SymbolReference } from "./symbol-references";
import { groupExports } from "../lib/utils";

import { ChevronDown } from "./icons/chevron-down";
import { ChevronRight } from "./icons/chevron-right";
import { Minus } from "./icons/minus";

import * as styles from "./navigation.css";
import { nonRootSymbolReference } from "./symbol-references.css";
import { SymbolKind } from "../lib/types";

function Expandable({
  summary,
  children,
}: {
  summary: ReactNode;
  children: ReactNode;
}) {
  return (
    <details open>
      <summary className={styles.expandableSummary}>
        <ChevronDown className={styles.expandableChevronClose} />
        <ChevronRight className={styles.expandableChevronOpen} />
        {summary}
      </summary>
      <div className={styles.expandableContents}>{children}</div>
    </details>
  );
}

function Item({ children }: { children: ReactNode }) {
  return (
    <li className={styles.item}>
      <Minus className={styles.itemIcon} />
      {children}
    </li>
  );
}

export function Navigation({ rootSymbolName }: { rootSymbolName: string }) {
  const docContext = useDocsContext();
  let rootSymbol = docContext.symbols[rootSymbolName];
  if (rootSymbol.kind !== SymbolKind.Module) {
    throw new Error("Root symbols must be modules");
  }
  const groupedExports = groupExports(
    rootSymbolName,
    docContext.canonicalExportLocations,
    docContext.symbols
  );
  if (docContext.canonicalExportLocations[rootSymbolName]) {
    rootSymbol = {
      ...rootSymbol,
      name: docContext.canonicalExportLocations[rootSymbolName].exportName,
    };
  }
  return (
    <Expandable
      summary={
        <SymbolReference fullName={rootSymbolName} name={rootSymbol.name} />
      }
    >
      <div>
        <ul>
          {groupedExports.map((group, i) => {
            if (group.kind === "exports") {
              return (
                <Item key={i}>
                  <a
                    className={nonRootSymbolReference}
                    href={`#${docContext.goodIdentifiers[rootSymbolName]}-re-exports-${i}`}
                  >
                    {group.exports.length} Re-exports
                  </a>
                </Item>
              );
            }
            const symbol = docContext.symbols[group.fullName];
            if (symbol.kind === SymbolKind.Module) {
              return (
                <Navigation key={symbol.name} rootSymbolName={group.fullName} />
              );
            }
            return (
              <Item key={group.exportName}>
                <SymbolReference
                  fullName={group.fullName}
                  name={group.exportName}
                />
              </Item>
            );
          })}
        </ul>
      </div>
    </Expandable>
  );
}
