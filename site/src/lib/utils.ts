import { SerializedSymbol } from "../extract/utils";
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
      if (prev?.kind === "exports") {
        if (prev.from === canonicalLocation.fileSymbolName) {
          prev.exports.push({
            localName: exportName,
            sourceName: canonicalLocation.exportName,
            fullName: exportedSymbol,
          });
          continue;
        }
        const prevSymbol = allSymbols[prev.from] as Extract<
          SerializedSymbol,
          { kind: "module" }
        >;
        if (prevSymbol) {
          const potentialExport = Object.entries(prevSymbol.exports).find(
            ([, symbolId]) => symbolId === exportedSymbol
          );
          if (potentialExport) {
            prev.exports.push({
              localName: exportName,
              sourceName: potentialExport[0],
              fullName: exportedSymbol,
            });
            continue;
          }
        }
      }
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
  return transformedExports;
}

export function splitDocs(docs: string): {
  first: string;
  rest: string | undefined;
} {
  const [, first, rest] = /(^[^]+?)\r?\n\r?\n([^]+)/.exec(docs) || [
    "",
    docs,
    "",
  ];
  return {
    first,
    rest: rest || undefined,
  };
}
