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
} from "ts-morph";
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

let project = new Project({ tsConfigFilePath: "../tsconfig.json" });

const publicSymbols = new Map<Symbol, SerializedSymbol>();

const symbolsQueue = new Set<Symbol>();
const symbolsToSymbolsWhichReferenceTheSymbol = new Map<Symbol, Set<Symbol>>();

let currentlyVistedSymbol: Symbol | undefined = undefined;

const exportedSymbols = new Set<Symbol>();

export function collectSymbol(symbol: Symbol) {
  const decl = symbol.getDeclarations()[0];
  if (!decl.getSourceFile().getFilePath().includes("schema/src/")) {
    return;
  }
  if (currentlyVistedSymbol) {
    if (!symbolsToSymbolsWhichReferenceTheSymbol.has(symbol)) {
      symbolsToSymbolsWhichReferenceTheSymbol.set(symbol, new Set());
    }
    const symbolsThatReferenceTheThing =
      symbolsToSymbolsWhichReferenceTheSymbol.get(symbol)!;
    symbolsThatReferenceTheThing.add(currentlyVistedSymbol);
  }
  if (publicSymbols.has(symbol)) return;
  symbolsQueue.add(symbol);
}

const sourceFile = project
  .getSourceFiles()
  .filter((x) => x.getFilePath().includes("schema/src/index"))[0];

let isFirstSymbol = true;

collectSymbol(sourceFile.getSymbolOrThrow());

while (symbolsQueue.size) {
  const symbol: Symbol = symbolsQueue.values().next().value;
  symbolsQueue.delete(symbol);
  currentlyVistedSymbol = symbol;
  const decl = symbol.getDeclarations()[0];
  if (decl instanceof TypeAliasDeclaration) {
    const typeNode = decl.getTypeNode();
    publicSymbols.set(symbol, {
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
    publicSymbols.set(symbol, {
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
    publicSymbols.set(symbol, {
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
      exportedSymbols.add(innerSymbol);
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
    publicSymbols.set(symbol, {
      kind: "module",
      name: isFirstSymbol ? "@graphql-ts/schema" : symbol.getName(),
      docs: getDocsFromJSDocNodes(jsDocs),
      exports,
    });
    isFirstSymbol = false;
  } else if (decl instanceof VariableDeclaration) {
    const typeNode = decl.getTypeNode();
    const variableStatement = decl.getVariableStatementOrThrow();
    publicSymbols.set(symbol, {
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
    publicSymbols.set(symbol, {
      kind: "variable",
      name: symbol.getName(),
      docs: getDocs(decl),
      variableKind: "const",
      type: typeNode
        ? convertTypeNode(typeNode)
        : _convertType(decl.getType(), 0),
    });
  } else {
    console.log(symbol.getName(), decl.getKindName());
  }
}

export const accessibleSymbols = Object.fromEntries(
  [...publicSymbols].map(([symbol, rootThing]) => [
    getSymbolIdentifier(symbol),
    rootThing,
  ])
);

export const stuff = Object.fromEntries(
  [...symbolsToSymbolsWhichReferenceTheSymbol].map(
    ([symbol, symbolsThatReferenceIt]) => {
      return [
        getSymbolIdentifier(symbol.getAliasedSymbol() || symbol),
        [...symbolsThatReferenceIt].map((x) =>
          getSymbolIdentifier(x.getAliasedSymbol() || x)
        ),
      ];
    }
  )
);

export const _exportedSymbols = [...exportedSymbols].map((x) =>
  getSymbolIdentifier(x.getAliasedSymbol() || x)
);

export const canonicalExportLocations = Object.fromEntries(
  [...findCanonicalExportLocations([sourceFile])].map(
    ([symbol, { exportName, file }]) => {
      return [
        getSymbolIdentifier(symbol),
        {
          exportName,
          fileSymbolName: getSymbolIdentifier(file.getSymbolOrThrow()),
        },
      ];
    }
  )
);
