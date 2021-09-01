import { SerializedSymbol } from "./types";
import { useDocsContext } from "./DocsContext";

export function useGroupedExports(fullName: string) {
  const { symbols, canonicalExportLocations, externalSymbols } =
    useDocsContext();
  const rootThing = symbols[fullName];
  if (rootThing.kind !== "module" && rootThing.kind !== "namespace") {
    throw new Error("expected module or namespace");
  }
  const transformedExports: (
    | {
        kind: "external-exports";
        from: string;
        version: string;
        exports: {
          name: string;
          id: string;
        }[];
      }
    | {
        kind: "unknown-exports";
        exports: string[];
      }
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
    const prev = transformedExports[transformedExports.length - 1];

    if (!symbols[exportedSymbol]) {
      const external = externalSymbols[exportedSymbol];
      if (!external) {
        if (prev.kind === "unknown-exports") {
          prev.exports.push(exportName);
        }
        transformedExports.push({
          kind: "unknown-exports",
          exports: [exportName],
        });
        continue;
      }
      const exported = {
        name: exportName,
        id: externalSymbols[exportedSymbol].id,
      };
      if (
        prev?.kind === "external-exports" &&
        prev.from === external.pkg &&
        prev.version === external.version
      ) {
        prev.exports.push(exported);
        continue;
      }
      transformedExports.push({
        kind: "external-exports",
        from: external.pkg,
        version: external.version,
        exports: [exported],
      });
      continue;
    }
    if (
      canonicalExportLocations[exportedSymbol] &&
      canonicalExportLocations[exportedSymbol].exportName === exportName &&
      canonicalExportLocations[exportedSymbol].parent === fullName
    ) {
      transformedExports.push({
        kind: "canonical",
        exportName,
        fullName: exportedSymbol,
      });
      continue;
    }
    const canonicalLocation = canonicalExportLocations[exportedSymbol];
    if (prev?.kind === "exports") {
      if (prev.from === canonicalLocation.parent) {
        prev.exports.push({
          localName: exportName,
          sourceName: canonicalLocation.exportName,
          fullName: exportedSymbol,
        });
        continue;
      }
      const prevSymbol = symbols[prev.from] as Extract<
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
      from: canonicalLocation.parent,
      exports: [
        {
          localName: exportName,
          sourceName: canonicalLocation.exportName,
          fullName: exportedSymbol,
        },
      ],
    });
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
