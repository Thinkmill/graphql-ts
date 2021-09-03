import {
  FunctionDeclaration,
  Project,
  ts,
  TypeAliasDeclaration,
  Symbol,
  SourceFile,
  PropertySignature,
  VariableDeclaration,
  JSDoc,
  Node,
  InterfaceDeclaration,
  ArrowFunction,
  ClassDeclaration,
  MethodDeclaration,
  ConstructorDeclaration,
  PropertyDeclaration,
  EnumDeclaration,
  ModuleDeclaration,
  ModuleDeclarationKind,
} from "ts-morph";
import path from "path";
import { findCanonicalExportLocations } from "./exports";
import { convertTypeNode } from "./convert-node";
import { _convertType } from "./convert-type";
import {
  getParameters,
  getDocs,
  getTypeParameters,
  getDocsFromJSDocNodes,
  getSymbolIdentifier,
  getObjectMembers,
  getSymbolsForInnerBitsAndGoodIdentifiers,
  collectEntrypointsOfPackage,
} from "./utils";
import { SerializedSymbol, ClassMember } from "../lib/types";

// cache bust 1

// function symbolFlagsToString(flags: ts.SymbolFlags) {
//   return Object.keys(ts.SymbolFlags).filter(
//     // @ts-ignore
//     (flagName) => flags & ts.SymbolFlags[flagName]
//   );
// }

// function typeFlagsToString(type: ts.Type) {
//   return Object.keys(ts.TypeFlags).filter(
//     // @ts-ignore
//     (flagName) => type.flags & ts.TypeFlags[flagName]
//   );
// }

function getInitialState() {
  return {
    rootSymbols: new Map<Symbol, string>(),
    publicSymbols: new Map<Symbol, SerializedSymbol>(),
    symbolsQueue: new Set<Symbol>(),
    symbolsToSymbolsWhichReferenceTheSymbol: new Map<Symbol, Set<Symbol>>(),
    currentlyVistedSymbol: undefined as Symbol | undefined,
    exportedSymbols: new Set<Symbol>(),
    referencedExternalSymbols: new Set<Symbol>(),
    pkgDir: "",
  };
}

let state = getInitialState();

export function collectSymbol(symbol: Symbol) {
  if (symbol.getDeclarations().length === 0) {
    return;
  }
  const decl = symbol.getDeclarations()[0];
  if (
    !decl.getSourceFile().getFilePath().includes(state.pkgDir) ||
    decl
      .getSourceFile()
      .getFilePath()
      .includes(path.join(state.pkgDir, "node_modules"))
  ) {
    state.referencedExternalSymbols.add(symbol);
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
  packageName: string;
  rootSymbols: string[];
  accessibleSymbols: { [k: string]: SerializedSymbol };
  symbolReferences: { [k: string]: string[] };
  canonicalExportLocations: {
    [k: string]: readonly [exportName: string, fileSymbolId: string];
  };
  goodIdentifiers: Record<string, string>;
  symbolsForInnerBit: Record<string, string[]>;
  externalSymbols: Record<string, { pkg: string; version: string; id: string }>;
  versions?: string[];
  currentVersion: string;
};

export function getDocsInfo(
  rootSymbols: Map<Symbol, string>,
  pkgDir: string,
  packageName: string,
  currentVersion: string,
  getExternalReference: (
    symbolId: string
  ) => { pkg: string; version: string; id: string } | undefined = () =>
    undefined
): DocInfo {
  state = getInitialState();
  state.rootSymbols = rootSymbols;
  state.symbolsQueue = new Set(rootSymbols.keys());
  state.pkgDir = pkgDir;

  resolveSymbolQueue();

  const baseInfo = {
    packageName,
    currentVersion,
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
      ].map(([symbol, { exportName, parent }]) => {
        return [
          getSymbolIdentifier(symbol),
          [exportName, getSymbolIdentifier(parent.getSymbolOrThrow())] as const,
        ];
      })
    ),
  };

  const externalSymbols: DocInfo["externalSymbols"] = {};
  for (const x of state.referencedExternalSymbols) {
    const symbolId = getSymbolIdentifier(x);
    const ref = getExternalReference(symbolId);
    if (ref) {
      externalSymbols[symbolId] = ref;
    }
  }

  return {
    ...baseInfo,
    ...getSymbolsForInnerBitsAndGoodIdentifiers(
      baseInfo.accessibleSymbols,
      baseInfo.packageName,
      baseInfo.canonicalExportLocations,
      baseInfo.symbolReferences,
      baseInfo.rootSymbols
    ),
    externalSymbols,
  };
}

export async function getInfo({
  tsConfigFilePath,
  packagePath,
}: {
  tsConfigFilePath: string;
  packagePath: string;
}) {
  let project = new Project({
    tsConfigFilePath,
  });
  const pkgPath = path.resolve(packagePath);
  const pkgJson = JSON.parse(
    await project.getFileSystem().readFile(`${pkgPath}/package.json`)
  );

  const entrypoints = await collectEntrypointsOfPackage(
    project,
    pkgJson.name,
    pkgPath
  );
  const rootSymbols = new Map<Symbol, string>();
  for (const [filepath, entrypointName] of Object.entries(entrypoints)) {
    const sourceFile = project.getSourceFileOrThrow(filepath);
    const symbol = sourceFile.getSymbolOrThrow();
    rootSymbols.set(symbol, entrypointName);
  }
  return getDocsInfo(rootSymbols, pkgPath, pkgJson.name, pkgJson.version);
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
        if (!decl) {
          continue;
        }
        let innerSymbol = decl.getSymbolOrThrow();
        innerSymbol = innerSymbol.getAliasedSymbol() || innerSymbol;
        state.exportedSymbols.add(innerSymbol);
        collectSymbol(innerSymbol);
        exports[exportName] = getSymbolIdentifier(innerSymbol);
      }

      let jsDocs = getJsDocsFromSourceFile(decl);

      // if you have a file that re-exports _everything_ from somewhere else
      // then look at that place for jsdocs since e.g. Preconstruct
      // generates a declaration file that re-exports from the actual place that might include a JSDoc comment
      if (jsDocs.length === 0) {
        let foundStar = false;
        let sourceFile: undefined | SourceFile = undefined;
        for (const exportDecl of decl.getExportDeclarations()) {
          const file = exportDecl.getModuleSpecifierSourceFile();
          if (!file || (sourceFile && file !== sourceFile)) {
            sourceFile = undefined;
            break;
          }
          sourceFile = file;
          if (exportDecl.getNodeProperty("exportClause") === undefined) {
            foundStar = true;
          }
        }
        if (foundStar && sourceFile) {
          jsDocs = getJsDocsFromSourceFile(sourceFile);
        }
      }

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
    } else if (decl instanceof InterfaceDeclaration) {
      state.publicSymbols.set(symbol, {
        kind: "interface",
        name: symbol.getName(),
        docs: getDocs(decl),
        typeParams: getTypeParameters(decl),
        extends: decl.getExtends().map((x) => convertTypeNode(x)),
        members: getObjectMembers(decl),
      });
    } else if (decl instanceof ClassDeclaration) {
      const extendsNode = decl.getExtends();
      state.publicSymbols.set(symbol, {
        kind: "class",
        name: symbol.getName(),
        docs: getDocs(decl),
        typeParams: getTypeParameters(decl),
        extends: extendsNode ? convertTypeNode(extendsNode) : null,
        implements: decl.getImplements().map((x) => convertTypeNode(x)),
        hasPrivateMembers: decl
          .getMembers()
          .some((member) => member.hasModifier("private")),
        constructors: decl.getConstructors().map((x) => {
          return {
            docs: getDocs(x),
            parameters: getParameters(x),
            typeParams: getTypeParameters(x),
          };
        }),
        members: decl.getMembers().flatMap((member): ClassMember[] => {
          if (
            member.hasModifier("private") ||
            member instanceof ConstructorDeclaration
          ) {
            return [];
          }
          // TODO: show protected
          // (and have a tooltip explaining what protected does)
          if (member instanceof MethodDeclaration) {
            const returnTypeNode = member.getReturnTypeNode();
            return [
              {
                kind: "method",
                docs: getDocs(member),
                name: member.getName(),
                optional: member.hasQuestionToken(),
                parameters: getParameters(member),
                returnType: returnTypeNode
                  ? convertTypeNode(returnTypeNode)
                  : _convertType(member.getReturnType(), 0),
                static: member.isStatic(),
                typeParams: getTypeParameters(member),
              },
            ];
          }
          if (member instanceof PropertyDeclaration) {
            const typeNode = member.getTypeNode();

            return [
              {
                kind: "prop",
                docs: getDocs(member),
                name: member.getName(),
                optional: member.hasQuestionToken(),
                type: typeNode
                  ? convertTypeNode(typeNode)
                  : _convertType(member.getType(), 0),
                static: member.isStatic(),
                readonly: member.isReadonly(),
              },
            ];
          }
          return [{ kind: "unknown", content: member.getText() }];
        }),
      });
    } else if (decl instanceof EnumDeclaration) {
      state.publicSymbols.set(symbol, {
        kind: "enum",
        const: decl.isConstEnum(),
        name: symbol.getName(),
        docs: getDocs(decl),
        members: decl.getMembers().map((member) => {
          const symbol = member.getSymbolOrThrow();
          state.publicSymbols.set(symbol, {
            kind: "enum-member",
            name: member.getName(),
            docs: getDocs(member),
            value: member.getValue() ?? null,
          });
          return getSymbolIdentifier(symbol);
        }),
      });
    } else if (
      decl instanceof ModuleDeclaration &&
      decl.getDeclarationKind() === ModuleDeclarationKind.Namespace
    ) {
      let exports: Record<string, string> = {};
      for (const [
        exportName,
        exportedDeclarations,
      ] of decl.getExportedDeclarations()) {
        const decl = exportedDeclarations[0];
        if (!decl) {
          continue;
        }

        let innerSymbol = decl.getSymbolOrThrow();
        innerSymbol = innerSymbol.getAliasedSymbol() || innerSymbol;
        state.exportedSymbols.add(innerSymbol);
        collectSymbol(innerSymbol);
        exports[exportName] = getSymbolIdentifier(innerSymbol);
      }
      state.publicSymbols.set(symbol, {
        kind: "namespace",
        name: symbol.getName(),
        docs: getDocs(decl),
        exports,
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

function getJsDocsFromSourceFile(decl: SourceFile) {
  const jsDocs: JSDoc[] = [];
  decl.forEachChild((node) => {
    if (!!(node.compilerNode as any).jsDoc) {
      const nodes: ts.JSDoc[] = (node.compilerNode as any).jsDoc ?? [];
      const jsdocs: JSDoc[] = nodes.map((n) =>
        (node as any)._getNodeFromCompilerNode(n)
      );
      for (const doc of jsdocs) {
        if (doc.getTags().some((tag) => tag.getTagName() === "module")) {
          jsDocs.push(doc);
        }
      }
    }
  });
  return jsDocs;
}
