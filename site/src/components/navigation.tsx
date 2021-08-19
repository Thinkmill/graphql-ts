import hashString from "@emotion/hash";
import { useState, ReactNode } from "react";

import { useDocsContext } from "../lib/DocsContext";
import { SymbolReference } from "./symbol-references";
import { colors, groupExports } from "../lib/utils";

import {
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

export function Navigation({ rootSymbolName }: { rootSymbolName: string }) {
  const docContext = useDocsContext();
  const rootSymbol = docContext.symbols[rootSymbolName];
  if (rootSymbol.kind !== "module") {
    throw new Error("Root symbols must be modules");
  }
  const groupedExports = groupExports(
    rootSymbolName,
    docContext.canonicalExportLocations,
    docContext.symbols
  );
  return (
    <div>
      <ul>
        {groupedExports.map((group, i) => {
          if (group.kind === "exports") {
            return (
              <li key={i}>
                <a
                  className={codeFont}
                  css={{ color: colors.symbol }}
                  href={"#a" + hashString(rootSymbolName) + `re-exports-${i}`}
                >
                  {group.exports.length} Re-exports
                </a>
              </li>
            );
          }
          const symbol = docContext.symbols[group.fullName];
          if (symbol.kind === "module") {
            return (
              <Expandable
                key={symbol.name}
                summary={
                  <SymbolReference
                    fullName={group.fullName}
                    name={group.exportName}
                  />
                }
              >
                <Navigation rootSymbolName={group.fullName} />
              </Expandable>
            );
          }
          return (
            <li key={group.exportName}>
              {" "}
              <SymbolReference
                fullName={group.fullName}
                name={group.exportName}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
