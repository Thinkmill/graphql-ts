import {
  Symbol,
  SourceFile,
  FunctionDeclaration,
  TypeAliasDeclaration,
  PropertySignature,
  VariableDeclaration,
  ClassDeclaration,
  InterfaceDeclaration,
} from "ts-morph";

type ExportName = string;

function collectImportableSymbolsFromSourceFile(
  sourceFile: SourceFile,
  state: Map<Symbol, Map<SourceFile, ExportName>>
) {
  for (const [exportName, decls] of sourceFile.getExportedDeclarations()) {
    // this should be properly handled
    // if (decls.length !== 1) {
    //   throw new Error(
    //     "unexpected more than one exported decl for the same export name"
    //   );
    // }
    const decl = decls[0];
    const symbol = decl.getSymbolOrThrow();

    if (!state.has(symbol)) {
      state.set(symbol, new Map());
    }
    const exportLocations = state.get(symbol)!;
    exportLocations.set(sourceFile, exportName);

    if (decl instanceof SourceFile) {
      // need to see if this can be circular
      collectImportableSymbolsFromSourceFile(decl, state);
    } else if (
      decl instanceof FunctionDeclaration ||
      decl instanceof TypeAliasDeclaration ||
      decl instanceof PropertySignature ||
      decl instanceof VariableDeclaration ||
      decl instanceof ClassDeclaration ||
      decl instanceof InterfaceDeclaration
    ) {
      // nothing other than itself can be referenced by importing these
    } else {
      // throw new Error(`unhandled export kind ${decl.constructor.name}`);
    }
  }
}

export function findCanonicalExportLocations(
  sourceFiles: SourceFile[]
): Map<Symbol, { file: SourceFile; exportName: ExportName }> {
  const state = new Map<Symbol, Map<SourceFile, ExportName>>();
  for (const sourceFile of sourceFiles) {
    collectImportableSymbolsFromSourceFile(sourceFile, state);
  }
  const map = new Map<Symbol, { file: SourceFile; exportName: ExportName }>();
  for (const [symbol, exportLocations] of state) {
    let current: [SourceFile, string] | undefined;
    for (const val of exportLocations) {
      if (!current) {
        current = val;
      }
      if (val[0].getFilePath().length < current[0].getFilePath().length) {
        current = val;
      }
    }
    const [file, exportName] = current!;
    map.set(symbol, { file, exportName });
  }

  return map;
}
