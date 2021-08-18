import { useDocContext } from "./DocContext";
import { SymbolReference } from "./symbol-references";
import { codeFont, colors, groupExports } from "./utils";
import hashString from "@emotion/hash";

export function Navigation({ rootSymbolName }: { rootSymbolName: string }) {
  const docContext = useDocContext();
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
                  css={[codeFont, { color: colors.symbol }]}
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
              <details key={symbol.name} open>
                <summary css={{ marginLeft: -16 }}>
                  <SymbolReference
                    fullName={group.fullName}
                    name={group.exportName}
                  />
                </summary>
                <div css={{ marginLeft: 16 }}>
                  <Navigation rootSymbolName={group.fullName} />
                </div>
              </details>
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
