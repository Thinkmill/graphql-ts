import {
  FunctionDeclaration,
  Project,
  SymbolFlags,
  ts,
  TypeAliasDeclaration,
  Symbol,
  SourceFile,
  PropertySignature,
  VariableDeclaration,
  JSDoc,
  Node,
  ArrowFunction,
} from "ts-morph";
import path from "path";
import fs from "fs/promises";
import fastGlob from "fast-glob";
import { findCanonicalExportLocations } from "./exports";
import { convertTypeNode } from "./convert-node";
import { _convertType } from "./convert-type";
import {
  SerializedSymbol,
  getParameters,
  getDocs,
  getTypeParameters,
  getDocsFromJSDocNodes,
  getSymbolIdentifier,
} from "./utils";

// cache bust 1

function symbolFlagsToString(flags: SymbolFlags) {
  return Object.keys(ts.SymbolFlags).filter(
    // @ts-ignore
    (flagName) => flags & ts.SymbolFlags[flagName]
  );
}

function typeFlagsToString(type: ts.Type) {
  return Object.keys(ts.TypeFlags).filter(
    // @ts-ignore
    (flagName) => type.flags & ts.TypeFlags[flagName]
  );
}

function getInitialState() {
  return {
    rootSymbols: new Map<Symbol, string>(),
    publicSymbols: new Map<Symbol, SerializedSymbol>(),
    symbolsQueue: new Set<Symbol>(),
    symbolsToSymbolsWhichReferenceTheSymbol: new Map<Symbol, Set<Symbol>>(),
    currentlyVistedSymbol: undefined as Symbol | undefined,
    exportedSymbols: new Set<Symbol>(),
    pkgDir: "",
  };
}

let state = getInitialState();

async function resolvePreconstructEntrypoints(
  pkgPath: string
): Promise<Record<string, string>> {
  const pkgJson = JSON.parse(
    await fs.readFile(pkgPath + "/package.json", "utf8")
  );
  const configEntrypoints = pkgJson?.preconstruct?.entrypoints || [
    "index.{js,jsx,ts,tsx}",
  ];

  const files = await fastGlob(configEntrypoints, {
    cwd: path.join(pkgPath, "src"),
    onlyFiles: true,
  });
  return Object.fromEntries(
    files.map((entrypoint) => {
      const filepath = path.join(pkgPath, "src", entrypoint);
      const entrypointPart = entrypoint.replace(/\/?(index)?\.[jt]sx?/, "");
      const entrypointName =
        pkgJson.name + (entrypointPart === "" ? "" : "/" + entrypointPart);
      return [filepath, entrypointName];
    })
  );
}

export function collectSymbol(symbol: Symbol) {
  const decl = symbol.getDeclarations()[0];
  if (
    !decl.getSourceFile().getFilePath().includes(path.join(state.pkgDir, "src"))
  ) {
    return;
  }
  if (state.currentlyVistedSymbol) {
    if (!state.symbolsToSymbolsWhichReferenceTheSymbol.has(symbol)) {
      state.symbolsToSymbolsWhichReferenceTheSymbol.set(symbol, new Set());
    }
    const symbolsThatReferenceTheThing =
      state.symbolsToSymbolsWhichReferenceTheSymbol.get(symbol)!;
    symbolsThatReferenceTheThing.add(state.currentlyVistedSymbol);
  }
  if (state.publicSymbols.has(symbol)) return;
  state.symbolsQueue.add(symbol);
}

export type DocInfo = {
  rootSymbols: string[];
  accessibleSymbols: {
    [k: string]: SerializedSymbol;
  };
  symbolReferences: {
    [k: string]: string[];
  };
  canonicalExportLocations: {
    [k: string]: {
      exportName: string;
      fileSymbolName: string;
    };
  };
};

export async function getInfo({
  tsConfigFilePath,
  packagePath,
}: {
  tsConfigFilePath: string;
  packagePath: string;
}) {
  state = getInitialState();
  let project = new Project({
    tsConfigFilePath,
  });
  const pkgPath = path.resolve(packagePath);
  const entrypoints = await resolvePreconstructEntrypoints(pkgPath);
  for (const [filepath, entrypointName] of Object.entries(entrypoints)) {
    const sourceFile = project.getSourceFileOrThrow(filepath);
    const symbol = sourceFile.getSymbolOrThrow();
    state.rootSymbols.set(symbol, entrypointName);
    state.symbolsQueue.add(symbol);
  }

  resolveSymbolQueue();

  return {
    rootSymbols: [...state.rootSymbols.keys()].map((symbol) =>
      getSymbolIdentifier(symbol)
    ),
    accessibleSymbols: Object.fromEntries(
      [...state.publicSymbols].map(([symbol, rootThing]) => [
        getSymbolIdentifier(symbol),
        rootThing,
      ])
    ),
    symbolReferences: Object.fromEntries(
      [...state.symbolsToSymbolsWhichReferenceTheSymbol].map(
        ([symbol, symbolsThatReferenceIt]) => {
          return [
            getSymbolIdentifier(symbol.getAliasedSymbol() || symbol),
            [...symbolsThatReferenceIt].map((x) =>
              getSymbolIdentifier(x.getAliasedSymbol() || x)
            ),
          ];
        }
      )
    ),
    canonicalExportLocations: Object.fromEntries(
      [
        ...findCanonicalExportLocations(
          [...state.rootSymbols.keys()].map(
            (symbol) => symbol.getDeclarations()[0] as SourceFile
          )
        ),
      ].map(([symbol, { exportName, file }]) => {
        return [
          getSymbolIdentifier(symbol),
          {
            exportName,
            fileSymbolName: getSymbolIdentifier(file.getSymbolOrThrow()),
          },
        ];
      })
    ),
  };
}

function resolveSymbolQueue() {
  while (state.symbolsQueue.size) {
    const symbol: Symbol = state.symbolsQueue.values().next().value;
    state.symbolsQueue.delete(symbol);
    state.currentlyVistedSymbol = symbol;
    const decl = symbol.getDeclarations()[0];
    if (decl instanceof TypeAliasDeclaration) {
      const typeNode = decl.getTypeNode();
      state.publicSymbols.set(symbol, {
        kind: "type-alias",
        name: symbol.getName(),
        docs: getDocs(decl),
        typeParams: getTypeParameters(decl),
        type: typeNode
          ? convertTypeNode(typeNode)
          : _convertType(decl.getType(), 0),
      });
    } else if (decl instanceof FunctionDeclaration) {
      const returnTypeNode = decl.getReturnTypeNode();
      state.publicSymbols.set(symbol, {
        kind: "function",
        name: symbol.getName(),
        parameters: getParameters(decl),
        docs: getDocs(decl),
        typeParams: getTypeParameters(decl),
        returnType: returnTypeNode
          ? convertTypeNode(returnTypeNode)
          : _convertType(decl.getReturnType(), 0),
      });
    } else if (decl instanceof TypeAliasDeclaration) {
      const typeNode = decl.getTypeNode();
      state.publicSymbols.set(symbol, {
        kind: "type-alias",
        name: symbol.getName(),
        docs: getDocs(decl),
        typeParams: getTypeParameters(decl),
        type: typeNode
          ? convertTypeNode(typeNode)
          : _convertType(decl.getType(), 0),
      });
    } else if (decl instanceof SourceFile) {
      let exports: Record<string, string> = {};
      for (const [
        exportName,
        exportedDeclarations,
      ] of decl.getExportedDeclarations()) {
        const decl = exportedDeclarations[0];
        const innerSymbol = decl.getSymbolOrThrow();
        state.exportedSymbols.add(innerSymbol);
        collectSymbol(innerSymbol);
        exports[exportName] = getSymbolIdentifier(innerSymbol);
      }
      const jsDocs: JSDoc[] = [];
      decl.forEachChild((node) => {
        if (!!(node.compilerNode as any).jsDoc) {
          const nodes: any[] | undefined = (node.compilerNode as any).jsDoc;
          const jsdocs: JSDoc[] =
            nodes?.map((n) => (node as any)._getNodeFromCompilerNode(n)) ?? [];
          for (const doc of jsdocs) {
            if (doc.getTags().some((tag) => tag.getTagName() === "module")) {
              jsDocs.push(doc);
            }
          }
        }
      });
      state.publicSymbols.set(symbol, {
        kind: "module",
        name: state.rootSymbols.get(symbol) || symbol.getName(),
        docs: getDocsFromJSDocNodes(jsDocs),
        exports,
      });
    } else if (decl instanceof VariableDeclaration) {
      const typeNode = decl.getTypeNode();
      const init = decl.getInitializer();
      const variableStatement = decl.getVariableStatementOrThrow();

      if (!typeNode && init instanceof ArrowFunction) {
        const returnTypeNode = init.getReturnTypeNode();
        state.publicSymbols.set(symbol, {
          kind: "function",
          name: symbol.getName(),
          parameters: getParameters(init),
          docs: getDocs(variableStatement),
          typeParams: getTypeParameters(init),
          returnType: returnTypeNode
            ? convertTypeNode(returnTypeNode)
            : _convertType(init.getReturnType(), 0),
        });
        continue;
      }
      state.publicSymbols.set(symbol, {
        kind: "variable",
        name: symbol.getName(),
        docs: getDocs(variableStatement),
        variableKind: variableStatement.getDeclarationKind(),
        type: typeNode
          ? convertTypeNode(typeNode)
          : _convertType(decl.getType(), 0),
      });
    } else if (decl instanceof PropertySignature) {
      const typeNode = decl.getTypeNode();
      state.publicSymbols.set(symbol, {
        kind: "variable",
        name: symbol.getName(),
        docs: getDocs(decl),
        variableKind: "const",
        type: typeNode
          ? convertTypeNode(typeNode)
          : _convertType(decl.getType(), 0),
      });
    } else {
      let docs = Node.isJSDocableNode(decl) ? getDocs(decl) : "";
      state.publicSymbols.set(symbol, {
        kind: "unknown",
        name: symbol.getName(),
        docs,
        content: decl.getText(),
      });
      console.log(symbol.getName(), decl.getKindName());
    }
  }
}
