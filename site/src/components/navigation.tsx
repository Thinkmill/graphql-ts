import hashString from "@emotion/hash";
import { useState, ReactNode } from "react";

import { useDocsContext } from "../lib/DocsContext";
import { SymbolReference } from "./symbol-references";
import { colors, groupExports } from "../lib/utils";

import {
  item,
  expandableContents,
  expandableSummary,
  expandableChevron,
} from "./navigation.css";
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
      <div onClick={onClick} className={expandableSummary}>
        <img
          className={expandableChevron}
          src={`/icons/chevron-${isOpen ? "down" : "right"}.svg`}
          width="20"
          height="20"
        />
        {summary}
      </div>
      {isOpen ? <div className={expandableContents}>{children}</div> : null}
    </div>
  );
}

function Item({ children }: { children: ReactNode }) {
  return <li className={item}>{children}</li>;
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
