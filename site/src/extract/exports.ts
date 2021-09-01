import {
  Symbol,
  SourceFile,
  ModuleDeclaration,
  ModuleDeclarationKind,
  Node,
  ModuledNode as _ModuledNode,
} from "ts-morph";

type ExportName = string;

type ModuledNode = Node & _ModuledNode;

function collectImportableSymbolsFromModuledNode(
  moduledNode: ModuledNode,
  state: Map<Symbol, Map<ModuledNode, ExportName>>
) {
  for (const [exportName, decls] of moduledNode.getExportedDeclarations()) {
    // this should be properly handled
    // if (decls.length !== 1) {
    //   throw new Error(
    //     "unexpected more than one exported decl for the same export name"
    //   );
    // }
    const decl = decls[0];
    if (!decl) {
      continue;
    }
    const symbol = decl.getSymbolOrThrow();

    if (!state.has(symbol)) {
      state.set(symbol, new Map());
    }
    const exportLocations = state.get(symbol)!;
    exportLocations.set(moduledNode, exportName);

    if (
      decl instanceof SourceFile ||
      (decl instanceof ModuleDeclaration &&
        decl.getDeclarationKind() === ModuleDeclarationKind.Namespace)
    ) {
      // need to see if this can be circular
      collectImportableSymbolsFromModuledNode(decl, state);
    }
  }
}

export function findCanonicalExportLocations(
  sourceFiles: SourceFile[]
): Map<Symbol, { parent: ModuledNode; exportName: ExportName }> {
  const state = new Map<Symbol, Map<ModuledNode, ExportName>>();
  for (const sourceFile of sourceFiles) {
    collectImportableSymbolsFromModuledNode(sourceFile, state);
  }
  const map = new Map<
    Symbol,
    { parent: ModuledNode; exportName: ExportName }
  >();
  for (const [symbol, exportLocations] of state) {
    let current: [ModuledNode, string] | undefined;
    for (const val of exportLocations) {
      if (!current) {
        current = val;
      }
      if (
        val[0] instanceof SourceFile &&
        (!(current[0] instanceof SourceFile) ||
          val[0].getFilePath().length < current[0].getFilePath().length)
      ) {
        current = val;
      }
    }
    const [parent, exportName] = current!;
    map.set(symbol, { parent, exportName });
  }

  return map;
}
