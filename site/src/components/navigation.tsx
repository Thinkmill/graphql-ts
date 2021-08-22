import hashString from "@emotion/hash";
import { useState, ReactNode } from "react";

import { useDocsContext } from "../lib/DocsContext";
import { SymbolReference } from "./symbol-references";
import { colors, groupExports } from "../lib/utils";

import ChevronDown from "./icons/chevron-down";
import ChevronRight from "./icons/chevron-right";
import Minus from "./icons/minus";

import * as styles from "./navigation.css";
import { codeFont } from "../lib/theme.css";

function Expandable({
  summary,
  children,
}: {
  summary: ReactNode;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const onClick = () => setIsOpen(!isOpen);
  return (
    <div>
      <div onClick={onClick} className={styles.expandableSummary}>
        {isOpen ? (
          <ChevronDown className={styles.expandableChevron} />
        ) : (
          <ChevronRight className={styles.expandableChevron} />
        )}
        {summary}
      </div>
      {isOpen ? (
        <div className={styles.expandableContents}>{children}</div>
      ) : null}
    </div>
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
  if (rootSymbol.kind !== "module") {
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
                    className={codeFont}
                    css={{ color: colors.symbol }}
                    href={"#a" + hashString(rootSymbolName) + `re-exports-${i}`}
                  >
                    {group.exports.length} Re-exports
                  </a>
                </Item>
              );
            }
            const symbol = docContext.symbols[group.fullName];
            if (symbol.kind === "module") {
              return (
                <Navigation key={symbol.name} rootSymbolName={group.fullName} />
              );
            }
            return (
              <Item key={group.exportName}>
                {" "}
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
