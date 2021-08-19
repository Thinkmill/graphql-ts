import { DocsContextType } from "./DocsContext";

export function groupExports(
  fullName: string,
  canonicalExportLocations: DocsContextType["canonicalExportLocations"],
  allSymbols: DocsContextType["symbols"]
) {
  const rootThing = allSymbols[fullName];
  if (rootThing.kind !== "module") {
    throw new Error("expected module symbol");
  }
  const transformedExports: (
    | {
        kind: "exports";
        from: string;
        exports: {
          sourceName: string;
          localName: string;
          fullName: string;
        }[];
      }
    | { kind: "canonical"; exportName: string; fullName: string }
  )[] = [];
  for (const [exportName, exportedSymbol] of Object.entries(
    rootThing.exports
  )) {
    if (
      canonicalExportLocations[exportedSymbol] &&
      canonicalExportLocations[exportedSymbol].exportName === exportName &&
      canonicalExportLocations[exportedSymbol].fileSymbolName === fullName &&
      allSymbols[exportedSymbol]
    ) {
      transformedExports.push({
        kind: "canonical",
        exportName,
        fullName: exportedSymbol,
      });
    } else {
      const canonicalLocation = canonicalExportLocations[exportedSymbol];
      const prev = transformedExports[transformedExports.length - 1];
      if (
        prev?.kind === "exports" &&
        prev.from === canonicalLocation.fileSymbolName
      ) {
        prev.exports.push({
          localName: exportName,
          sourceName: canonicalLocation.exportName,
          fullName: exportedSymbol,
        });
      } else {
        transformedExports.push({
          kind: "exports",
          from: canonicalLocation.fileSymbolName,
          exports: [
            {
              localName: exportName,
              sourceName: canonicalLocation.exportName,
              fullName: exportedSymbol,
            },
          ],
        });
      }
    }
  }
  return transformedExports;
}

export const colors = {
  parameter: "#111111",
  symbol: "#4876d6",
  keyword: "#994cc3",
  bracket: "#403f53",
  colon: "#0c969b",
  comma: "#5f7e97",
  string: "#c96765",
};

export function splitDocs(docs: string): {
  first: string;
  rest: string | undefined;
} {
  const [_, first, rest] = /(^[^]+?)\n\n([^]+)/.exec(docs) || ["", docs, ""];
  return {
    first,
    rest: rest || undefined,
  };
}